'use client';
import { useState, useRef, useCallback } from 'react';
import { uploadVideoFile, uploadThumbnailFile, formatFileSize } from '@/lib/storage';
import { createVideo } from '@/lib/firestore';
import { useRouter } from 'next/navigation';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ACCEPTED_VIDEO = ['video/mp4', 'video/webm', 'video/mov', 'video/quicktime'];
const ACCEPTED_IMAGE = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function UploadForm() {
  const router = useRouter();
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [thumbProgress, setThumbProgress] = useState(0);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'idle' | 'video' | 'thumb' | 'saving' | 'done'>('idle');

  const handleVideoSelect = (file: File) => {
    if (!ACCEPTED_VIDEO.includes(file.type)) {
      setError('mp4, webm, mov 형식만 업로드 가능합니다.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(`파일 크기는 500MB 이하여야 합니다. (현재: ${formatFileSize(file.size)})`);
      return;
    }
    setError('');
    setVideoFile(file);
  };

  const handleThumbSelect = (file: File) => {
    if (!ACCEPTED_IMAGE.includes(file.type)) {
      setError('jpg, png, webp 형식만 가능합니다.');
      return;
    }
    setError('');
    setThumbFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setThumbPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent, type: 'video' | 'thumb') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (type === 'video') handleVideoSelect(file);
    else handleThumbSelect(file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    if (!title.trim()) { setError('제목을 입력하세요.'); return; }
    if (!videoFile) { setError('영상 파일을 선택하세요.'); return; }

    setError('');
    setIsUploading(true);

    try {
      // 1. 썸네일 업로드 (있는 경우)
      let thumbnailUrl = '';
      if (thumbFile) {
        setStep('thumb');
        const result = await uploadThumbnailFile(thumbFile, ({ percent }) => setThumbProgress(percent));
        thumbnailUrl = result.url;
      }

      // 2. 영상 업로드
      setStep('video');
      const { url: videoUrl, storagePath } = await uploadVideoFile(
        videoFile,
        ({ percent }) => setVideoProgress(percent)
      );

      // 3. Firestore 저장
      setStep('saving');
      const videoId = await createVideo({
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        videoUrl,
        storagePath,
        fileName: videoFile.name,
        fileSize: videoFile.size,
        contentType: videoFile.type,
        thumbnailUrl,
        isPublished: true,
      });

      setStep('done');
      setTimeout(() => router.push(`/videos/${videoId}`), 800);
    } catch (err) {
      console.error(err);
      setError('업로드 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsUploading(false);
      setStep('idle');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'var(--bg)',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    padding: '10px 14px',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: 6,
    letterSpacing: '0.02em',
  };

  if (step === 'done') {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>업로드 완료!</p>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>영상 페이지로 이동합니다...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 제목 */}
      <div>
        <label style={labelStyle}>제목 *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="영상 제목을 입력하세요"
          disabled={isUploading}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-strong)')}
        />
      </div>

      {/* 설명 */}
      <div>
        <label style={labelStyle}>설명</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="영상에 대한 설명을 입력하세요"
          rows={4}
          disabled={isUploading}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--border-strong)')}
        />
      </div>

      {/* 카테고리 */}
      <div>
        <label style={labelStyle}>카테고리</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isUploading}
          style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
        >
          <option value="">카테고리 선택 (선택사항)</option>
          <option value="안전교육">안전교육</option>
          <option value="장비운용">장비운용</option>
          <option value="환경관리">환경관리</option>
          <option value="현장관리">현장관리</option>
          <option value="법령교육">법령교육</option>
          <option value="기타">기타</option>
        </select>
      </div>

      {/* 썸네일 */}
      <div>
        <label style={labelStyle}>썸네일 이미지 (선택사항)</label>
        <div
          onClick={() => !isUploading && thumbInputRef.current?.click()}
          onDrop={(e) => handleDrop(e, 'thumb')}
          onDragOver={(e) => e.preventDefault()}
          style={{
            border: `2px dashed ${thumbFile ? 'var(--accent)' : 'var(--border-strong)'}`,
            borderRadius: 'var(--radius)',
            padding: thumbPreview ? 0 : '24px',
            textAlign: 'center',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            overflow: 'hidden',
            transition: 'border-color 0.15s',
            minHeight: thumbPreview ? 'auto' : 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {thumbPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbPreview} alt="썸네일 미리보기" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }} />
          ) : (
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>클릭 또는 드래그하여 이미지 선택</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4 }}>jpg, png, webp</p>
            </div>
          )}
        </div>
        <input ref={thumbInputRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleThumbSelect(f); }} />
      </div>

      {/* 영상 파일 */}
      <div>
        <label style={labelStyle}>영상 파일 * (mp4 권장, 500MB 이하)</label>
        <div
          onClick={() => !isUploading && videoInputRef.current?.click()}
          onDrop={(e) => handleDrop(e, 'video')}
          onDragOver={(e) => e.preventDefault()}
          style={{
            border: `2px dashed ${videoFile ? 'var(--accent)' : 'var(--border-strong)'}`,
            borderRadius: 'var(--radius)',
            padding: '32px 24px',
            textAlign: 'center',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {videoFile ? (
            <div>
              <p style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 14 }}>🎬 {videoFile.name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>{formatFileSize(videoFile.size)}</p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📁</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>클릭 또는 드래그하여 영상 파일 선택</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>mp4, webm, mov 지원</p>
            </div>
          )}
        </div>
        <input ref={videoInputRef} type="file" accept="video/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoSelect(f); }} />
      </div>

      {/* 업로드 진행률 */}
      {isUploading && (
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
          {thumbFile && (
            <div style={{ marginBottom: step === 'video' || step === 'saving' ? 12 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                <span>썸네일 업로드</span>
                <span>{thumbProgress}%</span>
              </div>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${thumbProgress}%`, background: 'var(--success)', transition: 'width 0.3s ease', borderRadius: 2 }} />
              </div>
            </div>
          )}
          {(step === 'video' || step === 'saving') && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                <span>영상 업로드</span>
                <span>{videoProgress}%</span>
              </div>
              <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${videoProgress}%`, background: 'var(--accent)', transition: 'width 0.3s ease', borderRadius: 2 }} />
              </div>
            </div>
          )}
          {step === 'saving' && (
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 12, textAlign: 'center' }}>데이터 저장 중...</p>
          )}
        </div>
      )}

      {/* 오류 */}
      {error && (
        <div style={{ background: 'var(--danger-dim)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: 'var(--danger)', fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* 제출 */}
      <button
        onClick={handleSubmit}
        disabled={isUploading || !title || !videoFile}
        style={{
          padding: '14px 24px',
          background: isUploading || !title || !videoFile ? 'var(--border)' : 'var(--accent)',
          color: isUploading || !title || !videoFile ? 'var(--text-muted)' : '#fff',
          border: 'none',
          borderRadius: 'var(--radius)',
          fontSize: 15,
          fontWeight: 700,
          cursor: isUploading || !title || !videoFile ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s',
          letterSpacing: '0.02em',
        }}
      >
        {isUploading ? '업로드 중...' : '업로드 시작'}
      </button>
    </div>
  );
}
