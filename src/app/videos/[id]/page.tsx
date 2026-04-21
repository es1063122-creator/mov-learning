'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getVideoById, getPublishedVideos } from '@/lib/firestore';
import { VideoItem } from '@/types/video';
import { formatFileSize } from '@/lib/storage';
import VideoPlayer from '@/components/VideoPlayer';
import VideoCard from '@/components/VideoCard';
import Navbar from '@/components/Navbar';

function formatDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function VideoDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [video, setVideo] = useState<VideoItem | null>(null);
  const [related, setRelated] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([getVideoById(id), getPublishedVideos()])
      .then(([v, all]) => {
        setVideo(v);
        setRelated(all.filter((a) => a.id !== id).slice(0, 6));
      })
      .catch((e) => {
        console.error(e);
        setError('영상을 불러오지 못했습니다.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
            불러오는 중...
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius)',
            padding: '20px',
            color: 'var(--danger)',
          }}>
            {error}
          </div>
        )}

        {!loading && !error && !video && (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>영상을 찾을 수 없습니다.</p>
            <Link href="/" style={{
              color: 'var(--accent)',
              fontSize: 14,
              padding: '8px 16px',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-sm)',
            }}>
              목록으로
            </Link>
          </div>
        )}

        {!loading && video && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' }}>
            {/* 메인 영역 */}
            <div>
              {/* 뒤로가기 */}
              <Link href="/" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                color: 'var(--text-muted)',
                fontSize: 13,
                marginBottom: 16,
                transition: 'color 0.15s',
              }}>
                ← 목록으로
              </Link>

              {/* 플레이어 */}
              <VideoPlayer videoUrl={video.videoUrl} title={video.title} />

              {/* 메타 정보 */}
              <div style={{ marginTop: 24 }}>
                {video.category && (
                  <span style={{
                    display: 'inline-block',
                    background: 'var(--accent-dim)',
                    color: 'var(--accent)',
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: 4,
                    marginBottom: 12,
                  }}>
                    {video.category}
                  </span>
                )}

                <h1 style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  lineHeight: 1.4,
                  marginBottom: 12,
                  letterSpacing: '-0.02em',
                }}>
                  {video.title}
                </h1>

                <div style={{
                  display: 'flex',
                  gap: 20,
                  fontSize: 13,
                  color: 'var(--text-muted)',
                  marginBottom: 20,
                  paddingBottom: 20,
                  borderBottom: '1px solid var(--border)',
                }}>
                  <span>📅 {formatDate(video.createdAt)}</span>
                  {video.fileSize > 0 && (
                    <span>💾 {formatFileSize(video.fileSize)}</span>
                  )}
                  <span>📄 {video.fileName}</span>
                </div>

                {video.description && (
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: 15,
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {video.description}
                  </p>
                )}
              </div>
            </div>

            {/* 사이드바 - 관련 영상 */}
            <div style={{
              position: 'sticky',
              top: 76,
            }}>
              <h2 style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: 16,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                다른 영상
              </h2>
              {related.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>다른 영상이 없습니다.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {related.map((v) => (
                    <VideoCard key={v.id} video={v} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* 반응형 */}
      <style>{`
        @media (max-width: 768px) {
          main > div > div:last-child { display: none; }
          main > div { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
