'use client';
interface Props {
  videoUrl: string;
  title?: string;
}

export default function VideoPlayer({ videoUrl, title }: Props) {
  return (
    <div style={{
      width: '100%',
      background: '#000',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow)',
    }}>
      <video
        src={videoUrl}
        controls
        playsInline
        style={{
          width: '100%',
          display: 'block',
          maxHeight: '70vh',
          background: '#000',
        }}
        title={title}
        preload="metadata"
      >
        이 브라우저는 HTML5 video를 지원하지 않습니다.
      </video>
    </div>
  );
}
