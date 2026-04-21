'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navLink = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        style={{
          color: active ? 'var(--accent)' : 'var(--text-secondary)',
          fontSize: 14,
          fontWeight: active ? 600 : 400,
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          background: active ? 'var(--accent-dim)' : 'transparent',
          transition: 'all 0.15s',
        }}
      >
        {label}
      </Link>
    );
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(13, 15, 18, 0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            background: 'var(--accent)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>교육영상</span>
        </Link>
        <nav style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {navLink('/', '영상 목록')}
          {navLink('/upload', '업로드')}
          {navLink('/admin', '관리')}
        </nav>
      </div>
    </header>
  );
}
