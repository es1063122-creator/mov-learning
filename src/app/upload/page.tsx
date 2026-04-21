'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import UploadForm from '@/components/UploadForm';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'dongjin2024';

export default function UploadPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      setError('');
    } else {
      setError('비밀번호가 올바르지 않습니다.');
    }
  };

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
            관리자 전용 페이지입니다.
          </p>
        </div>

        {!authed ? (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '40px',
            maxWidth: 400,
            margin: '0 auto',
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, color: 'var(--text-primary)' }}>
              🔒 관리자 인증
            </h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="비밀번호를 입력하세요"
              style={{
                width: '100%',
                background: 'var(--bg)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                padding: '10px 14px',
                fontSize: 14,
                outline: 'none',
                marginBottom: 12,
              }}
            />
            {error && (
              <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{error}</p>
            )}
            <button
              onClick={handleLogin}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              확인
            </button>
          </div>
        ) : (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '32px',
          }}>
            <UploadForm />
          </div>
        )}
      </main>
    </>
  );
}
