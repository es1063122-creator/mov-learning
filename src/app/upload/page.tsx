'use client';
import Navbar from '@/components/Navbar';
import UploadForm from '@/components/UploadForm';

export default function UploadPage() {
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 8,
            letterSpacing: '-0.02em',
          }}>
            영상 업로드
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            교육영상을 업로드하세요.
          </p>
        </div>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '32px',
        }}>
          <UploadForm />
        </div>
      </main>
    </>
  );
}
