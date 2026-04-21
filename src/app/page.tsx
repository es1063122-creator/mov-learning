'use client';
import { useEffect, useState } from 'react';
import { getPublishedVideos } from '@/lib/firestore';
import { VideoItem } from '@/types/video';
import VideoCard from '@/components/VideoCard';
import Navbar from '@/components/Navbar';

export default function HomePage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPublishedVideos()
      .then(setVideos)
      .catch((e) => {
        console.error(e);
        setError('영상 목록을 불러오지 못했습니다. Firebase 설정을 확인하세요.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        {/* 헤더 */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 8,
            letterSpacing: '-0.02em',
          }}>
            교육영상
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            현장 안전 및 교육 영상 모음
          </p>
        </div>

        {/* 상태 처리 */}
        {loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                aspectRatio: '16/9',
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
          </div>
        )}

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius)',
            padding: '20px 24px',
            color: 'var(--danger)',
          }}>
            {error}
          </div>
        )}

        {!loading && !error && videos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>아직 업로드된 영상이 없습니다.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>관리자 페이지에서 영상을 업로드해주세요.</p>
          </div>
        )}

        {!loading && !error && videos.length > 0 && (
          <>
            <div style={{
              color: 'var(--text-muted)',
              fontSize: 13,
              marginBottom: 20,
            }}>
              총 {videos.length}개 영상
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}>
              {videos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </>
        )}
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </>
  );
}
