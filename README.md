# 동진 교육영상 사이트

동진토건 교육영상 업로드 및 스트리밍 사이트 (1차 MVP)

## 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| 영상 저장 | Firebase Storage |
| DB | Firestore |
| 배포 | Vercel |
| 코드 관리 | GitHub |

---

## 🚀 처음 시작하기

### 1단계 — Firebase 프로젝트 생성

1. [Firebase 콘솔](https://console.firebase.google.com/) 접속
2. 새 프로젝트 생성 (예: `dongjin-edu-video`)
3. **Firestore Database** 활성화 → 테스트 모드로 시작
4. **Storage** 활성화 → 테스트 모드로 시작
5. 왼쪽 ⚙️ 프로젝트 설정 → **웹앱 추가** → 설정값 복사

### 2단계 — 환경변수 설정

```bash
cp .env.local.example .env.local
```

`.env.local` 파일을 열고 Firebase에서 복사한 값을 붙여넣습니다:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dongjin-edu-video.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dongjin-edu-video
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dongjin-edu-video.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# 관리자 업로드/관리 페이지 비밀번호
NEXT_PUBLIC_ADMIN_PASSWORD=원하는비밀번호
```

### 3단계 — 의존성 설치 및 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 4단계 — Firestore 인덱스 설정

처음 영상 목록을 불러올 때 Firestore에서 복합 인덱스 생성 링크가 콘솔에 출력됩니다.
해당 링크를 클릭하면 자동으로 인덱스가 생성됩니다.

필요한 인덱스:
- 컬렉션: `videos`
- 필드: `isPublished` (오름차순) + `createdAt` (내림차순)

---

## 📁 폴더 구조

```
edu-video-site/
├─ src/
│  ├─ app/
│  │  ├─ page.tsx              # 메인 (영상 목록)
│  │  ├─ upload/page.tsx       # 영상 업로드
│  │  ├─ admin/page.tsx        # 관리자 (공개/삭제)
│  │  ├─ videos/[id]/page.tsx  # 영상 상세 + 재생
│  │  ├─ layout.tsx
│  │  └─ globals.css
│  ├─ components/
│  │  ├─ VideoCard.tsx         # 목록 카드
│  │  ├─ VideoPlayer.tsx       # HTML5 플레이어
│  │  ├─ UploadForm.tsx        # 업로드 폼
│  │  └─ Navbar.tsx            # 상단 네비게이션
│  ├─ lib/
│  │  ├─ firebase.ts           # Firebase 초기화
│  │  ├─ storage.ts            # Storage 업로드/삭제
│  │  └─ firestore.ts          # Firestore CRUD
│  └─ types/
│     └─ video.ts              # VideoItem 타입
├─ firestore.rules             # Firestore 보안 규칙
├─ storage.rules               # Storage 보안 규칙
├─ .env.local.example
├─ next.config.js
└─ package.json
```

---

## 🔥 Firebase 규칙 및 인덱스 배포 (Firebase CLI)

GitHub에 올린 `firestore.rules`, `firestore.indexes.json`, `storage.rules` 파일을
Firebase CLI로 직접 배포합니다. **콘솔에서 수동 클릭 불필요.**

### Firebase CLI 설치 및 배포

```bash
# 1. Firebase CLI 설치 (최초 1회)
npm install -g firebase-tools

# 2. Firebase 로그인
firebase login

# 3. 프로젝트 연결
firebase use --add
# → 목록에서 프로젝트 선택 후 별칭 입력 (예: default)

# 4. Firestore 규칙 + 인덱스 배포
firebase deploy --only firestore

# 5. Storage 규칙 배포
firebase deploy --only storage

# 6. 한번에 전체 배포
firebase deploy --only firestore,storage
```

### 관련 파일 설명

| 파일 | 역할 |
|------|------|
| `firebase.json` | Firebase CLI 설정 (어떤 파일을 어디에 적용할지) |
| `firestore.rules` | Firestore 읽기/쓰기 보안 규칙 |
| `firestore.indexes.json` | Firestore 복합 인덱스 정의 |
| `storage.rules` | Firebase Storage 보안 규칙 |

> GitHub에 이 파일들을 올려두면, 팀원 누구나 `firebase deploy` 한 번으로 동일한 규칙을 적용할 수 있습니다.

---

## 🌐 Vercel 배포

1. [Vercel](https://vercel.com/) 가입 후 GitHub 리포 연결
2. Vercel 프로젝트 설정 → **Environment Variables** 에서 `.env.local` 값들 입력
3. Deploy 클릭 → 자동 배포

---

## 📋 페이지 설명

| 경로 | 설명 | 접근 |
|------|------|------|
| `/` | 공개된 영상 목록 | 누구나 |
| `/videos/[id]` | 영상 재생 | 누구나 |
| `/upload` | 영상 업로드 | 비밀번호 인증 |
| `/admin` | 공개/비공개 전환, 삭제 | 비밀번호 인증 |

---

## 📐 Firestore 데이터 구조

### `videos/{videoId}`

| 필드 | 타입 | 설명 |
|------|------|------|
| title | string | 영상 제목 |
| description | string | 영상 설명 |
| category | string | 카테고리 |
| videoUrl | string | Firebase Storage 다운로드 URL |
| storagePath | string | Storage 내부 경로 (삭제용) |
| fileName | string | 원본 파일명 |
| fileSize | number | 파일 크기 (bytes) |
| contentType | string | MIME 타입 |
| thumbnailUrl | string | 썸네일 이미지 URL |
| isPublished | boolean | 공개 여부 |
| createdAt | Timestamp | 등록 시각 |
| updatedAt | Timestamp | 수정 시각 |

---

## 📦 Storage 폴더 구조

```
videos/
  └─ 2026/04/1713838392_safety_edu_01.mp4

thumbnails/
  └─ 2026/04/1713838392_safety_edu_01.jpg
```

---

## ⚠️ 주의사항

- `.env.local` 파일은 **절대 GitHub에 올리지 마세요** (`.gitignore`에 포함됨)
- 현재 보안 규칙은 개발용 임시 설정입니다. 운영 전 Firestore/Storage 규칙을 강화하세요.
- 관리자 비밀번호가 `NEXT_PUBLIC_` 접두사이므로 브라우저 소스에서 보일 수 있습니다. 추후 Firebase Auth로 전환을 권장합니다.

---

## 🔜 2차 개발 예정 항목

- [ ] Firebase Auth 기반 관리자 로그인
- [ ] 사용자 회원가입/로그인
- [ ] 영상 진도율 저장
- [ ] 수료증 PDF 발급
- [ ] 시청 통계 대시보드
- [ ] 현장별/회사별 영상 분리
