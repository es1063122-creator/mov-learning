'use client';
import Link from 'next/link';
import { VideoItem } from '@/types/video';
import { formatFileSize } from '@/lib/storage';

interface Props {
  video: VideoItem;
}

function formatDate(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function VideoCard({ video }: Props) {
  return (
    <Link href={`/videos/${video.id}`} style={{ display: 'block' }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.border = '1px solid var(--border-strong)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.border = '1px solid var(--border)';
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
          (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
        }}
      >
        {/* 썸네일 */}
        <div style={{
          width: '100%',
          aspectRatio: '16/9',
          background: 'var(--bg)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {video.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1a2236 0%, #0d1420 100%)',
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="var(--accent-dim)" stroke="var(--accent)" strokeWidth="1.5" />
                <polygon points="10,8 16,12 10,16" fill="var(--accent)" />
              </svg>
            </div>
          )}
          {/* 카테고리 뱃지 */}
          {video.category && (
            <span style={{
              position: 'absolute',
              top: 10,
              left: 10,
              background: 'var(--accent)',
              color: '#fff',
              fontSize: 11,
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 4,
              letterSpacing: '0.04em',
            }}>
              {video.category}
            </span>
          )}
        </div>

        {/* 내용 */}
        <div style={{ padding: '14px 16px 16px' }}>
          <h3 style={{
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: 6,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {video.title}
          </h3>
          {video.description && (
            <p style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              marginBottom: 12,
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {video.description}
            </p>
          )}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            color: 'var(--text-muted)',
          }}>
            <span>{formatDate(video.createdAt)}</span>
            {video.fileSize > 0 && (
              <span>{formatFileSize(video.fileSize)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
