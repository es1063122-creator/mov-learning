'use client';
import { useEffect, useState } from 'react';
import { getAllVideos, updateVideoPublish, deleteVideoDoc } from '@/lib/firestore';
import { deleteStorageFile, formatFileSize } from '@/lib/storage';
import { VideoItem } from '@/types/video';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

function formatDate(iso?: string) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function AdminPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllVideos();
      setVideos(data);
    } catch (e) {
      console.error(e);
      setError('영상 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id: string, current: boolean) => {
    setActionLoading(id);
    try {
      await updateVideoPublish(id, !current);
      setVideos((prev) =>
        prev.map((v) => (v.id === id ? { ...v, isPublished: !current } : v))
      );
    } catch (e) {
      console.error(e);
      alert('변경 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (video: VideoItem) => {
    setActionLoading(video.id);
    try {
      // Storage 파일 삭제
      if (video.storagePath) {
        try { await deleteStorageFile(video.storagePath); } catch (_) { /* 이미 없는 경우 무시 */ }
      }
      // 썸네일 삭제 (thumbnails/ 로 시작하는 경우)
      // thumbnailUrl은 다운로드 URL이라 storagePath가 없을 수 있으므로 스킵
      // Firestore 문서 삭제
      await deleteVideoDoc(video.id);
      setVideos((prev) => prev.filter((v) => v.id !== video.id));
    } catch (e) {
      console.error(e);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(null);
      setDeleteConfirm(null);
    }
  };

  const btnStyle = (variant: 'primary' | 'danger' | 'ghost'): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: 'var(--radius-sm)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: variant === 'ghost' ? '1px solid var(--border-strong)' : 'none',
    background:
      variant === 'primary' ? 'var(--accent)'
      : variant === 'danger' ? 'var(--danger)'
      : 'transparent',
    color:
      variant === 'ghost' ? 'var(--text-secondary)' : '#fff',
    transition: 'all 0.15s',
  });

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              관리자 페이지
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
              영상 공개/비공개 전환 및 삭제
            </p>
          </div>
          <Link href="/upload" style={{
            padding: '10px 20px',
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: 'var(--radius)',
            fontSize: 14,
            fontWeight: 600,
          }}>
            + 새 영상 업로드
          </Link>
        </div>

        {loading && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '60px' }}>불러오는 중...</p>
        )}

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius)',
            padding: '16px 20px',
            color: 'var(--danger)',
            marginBottom: 24,
          }}>
            {error}
          </div>
        )}

        {!loading && videos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            업로드된 영상이 없습니다.
          </div>
        )}

            {!loading && videos.length > 0 && (
              <>
                <div style={{
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  marginBottom: 16,
                }}>
                  전체 {videos.length}개 · 공개 {videos.filter(v => v.isPublished).length}개 · 비공개 {videos.filter(v => !v.isPublished).length}개
                </div>

                {/* 테이블 */}
                <div style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                }}>
                  {/* 헤더 */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 100px 80px 120px 150px',
                    gap: 0,
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--border)',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}>
                    <span>제목</span>
                    <span>카테고리</span>
                    <span>크기</span>
                    <span>업로드일</span>
                    <span style={{ textAlign: 'right' }}>작업</span>
                  </div>

                  {/* 행 */}
                  {videos.map((video, idx) => (
                    <div key={video.id}>
                      {idx > 0 && <div style={{ height: 1, background: 'var(--border)' }} />}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 100px 80px 120px 150px',
                        gap: 0,
                        padding: '14px 20px',
                        alignItems: 'center',
                        opacity: actionLoading === video.id ? 0.5 : 1,
                        transition: 'opacity 0.15s',
                      }}>
                        {/* 제목 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                          <span style={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: video.isPublished ? 'var(--success)' : 'var(--text-muted)',
                            flexShrink: 0,
                          }} />
                          <div style={{ minWidth: 0 }}>
                            <Link href={`/videos/${video.id}`} style={{
                              color: 'var(--text-primary)',
                              fontSize: 14,
                              fontWeight: 500,
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {video.title}
                            </Link>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              {video.isPublished ? '공개' : '비공개'}
                            </span>
                          </div>
                        </div>

                        {/* 카테고리 */}
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                          {video.category || '-'}
                        </span>

                        {/* 크기 */}
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          {video.fileSize > 0 ? formatFileSize(video.fileSize) : '-'}
                        </span>

                        {/* 날짜 */}
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          {formatDate(video.createdAt)}
                        </span>

                        {/* 작업 버튼 */}
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleTogglePublish(video.id, video.isPublished)}
                            disabled={actionLoading === video.id}
                            style={btnStyle('ghost')}
                          >
                            {video.isPublished ? '비공개' : '공개'}
                          </button>

                          {deleteConfirm === video.id ? (
                            <>
                              <button
                                onClick={() => handleDelete(video)}
                                disabled={actionLoading === video.id}
                                style={btnStyle('danger')}
                              >
                                확인삭제
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                style={btnStyle('ghost')}
                              >
                                취소
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(video.id)}
                              disabled={actionLoading === video.id}
                              style={{ ...btnStyle('ghost'), color: 'var(--danger)', borderColor: 'var(--danger)' }}
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
      </main>
    </>
  );
}
