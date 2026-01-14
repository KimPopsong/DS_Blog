# DS Blog 프로젝트 개요

## 프로젝트 소개

이 프로젝트는 **백엔드 개발자 김대성의 개인 블로그**입니다. Astro 프레임워크를 기반으로 구축된 정적 사이트 생성(SSG) 블로그로, 블로그 포스트, 프로젝트 포트폴리오, 이력서를 관리합니다.

**배포 URL**: https://www.dskim.dev  
**배포 플랫폼**: Vercel

---

## 기술 스택

### 핵심 기술
- **Framework**: Astro 5.16.6
- **Content Format**: MDX (Markdown + JSX)
- **Image Optimization**: Sharp 0.34.3
- **Language**: TypeScript

### 주요 기능
- **Content Collections**: 타입 안전한 컨텐츠 관리 (Blog, Project, Resume)
- **RSS Feed**: `@astrojs/rss`를 통한 RSS 피드 생성
- **Sitemap**: `@astrojs/sitemap`을 통한 자동 사이트맵 생성
- **Image Optimization**: Sharp를 통한 이미지 최적화

### 개발 도구
- **PDF 생성**: Puppeteer (이력서 PDF 생성용)
- **파일 감시**: Chokidar
- **병렬 실행**: Concurrently

---

## 프로젝트 구조

```
DS_Blog/
├── src/
│   ├── assets/              # 이미지, 폰트 등 정적 자산
│   │   ├── projects/        # 프로젝트 이미지
│   │   └── resume/          # 이력서 이미지
│   ├── components/          # 재사용 가능한 Astro 컴포넌트
│   │   ├── BaseHead.astro   # 메타데이터, SEO 설정
│   │   ├── Header.astro     # 네비게이션 헤더
│   │   ├── Footer.astro     # 푸터
│   │   ├── FormattedDate.astro  # 날짜 포맷팅
│   │   └── HeaderLink.astro     # 헤더 링크 컴포넌트
│   ├── content/            # MDX 컨텐츠 파일
│   │   ├── blog/           # 블로그 포스트 (YYYYMMDDHHMM.mdx 형식)
│   │   ├── project/        # 프로젝트 포트폴리오
│   │   └── resume/         # 이력서
│   ├── layouts/            # 페이지 레이아웃
│   │   └── BlogPost.astro  # 블로그/프로젝트 포스트 레이아웃
│   ├── pages/              # 라우팅 페이지
│   │   ├── index.astro     # 홈페이지
│   │   ├── blog/
│   │   │   ├── index.astro      # 블로그 목록 페이지
│   │   │   └── [...slug].astro  # 블로그 포스트 동적 라우팅
│   │   ├── project/
│   │   │   ├── index.astro      # 프로젝트 목록 페이지
│   │   │   └── [...slug].astro  # 프로젝트 상세 동적 라우팅
│   │   ├── resume.astro    # 이력서 페이지
│   │   ├── 404.astro       # 404 에러 페이지
│   │   └── rss.xml.js      # RSS 피드 생성
│   ├── styles/
│   │   └── global.css      # 전역 스타일 (다크 모드)
│   ├── consts.ts           # 사이트 상수 (SITE_TITLE, SITE_DESCRIPTION)
│   └── content.config.ts   # Content Collections 스키마 정의
├── public/                 # 정적 파일 (빌드 시 그대로 복사)
│   ├── favicon.svg
│   ├── fonts/              # 웹폰트
│   ├── og.png              # Open Graph 이미지
│   └── robots.txt
├── scripts/
│   └── generate-resume-pdf.js  # 이력서 PDF 생성 스크립트
├── astro.config.mjs        # Astro 설정 파일
├── package.json
└── tsconfig.json
```

---

## 데이터 흐름 및 아키텍처

### 1. 컨텐츠 작성 → 렌더링 흐름

```
MDX 파일 작성 (src/content/blog/*.mdx)
    ↓
Content Collections 스키마 검증 (src/content.config.ts)
    ↓
getCollection()으로 컨텐츠 로드
    ↓
동적 라우팅 (pages/blog/[...slug].astro)
    ↓
BlogPost 레이아웃으로 렌더링 (layouts/BlogPost.astro)
    ↓
정적 HTML 생성 (빌드 시)
```

### 2. 주요 파일 간 의존성

- **`src/content.config.ts`**: 컨텐츠 스키마 정의 → 모든 컨텐츠 파일의 frontmatter 검증
- **`src/pages/blog/[...slug].astro`**: `getCollection('blog')`로 컨텐츠 로드 → `BlogPost` 레이아웃 사용
- **`src/layouts/BlogPost.astro`**: 블로그와 프로젝트 모두에서 공통 사용
- **`src/components/BaseHead.astro`**: 모든 페이지에서 메타데이터 제공
- **`src/consts.ts`**: 사이트 전역 상수 (제목, 설명)

---

## 주요 파일 상세 설명

### 1. `src/content.config.ts` - 컨텐츠 스키마 정의

이 파일은 **Content Collections**의 스키마를 정의합니다. Zod를 사용하여 타입 안전성을 보장합니다.

**주요 컬렉션**:
- **blog**: 블로그 포스트
  - 필수: `title`, `description`, `pubDate`
  - 선택: `updatedDate`, `heroImage`, `tags`
- **project**: 프로젝트 포트폴리오
  - 추가 필드: `startDate`, `endDate`, `thumbnail`, `gitHub`, `gitLab`, `link`, `teamSize` 등
- **resume**: 이력서
  - 최소한의 스키마 (title, description은 선택)

**파일 경로 패턴**:
- Blog: `src/content/blog/YYYYMMDDHHMM.mdx` (예: `202601060145.mdx`)
- Project: `src/content/project/PROJECT_NAME.mdx` (예: `PICA.mdx`)

### 2. `src/pages/blog/index.astro` - 블로그 목록 페이지

**주요 기능**:
- 모든 블로그 포스트를 날짜순으로 정렬하여 표시
- 첫 번째 포스트를 "Featured Post"로 강조 표시
- 클라이언트 사이드 검색 기능 (제목, 내용, 태그 검색)
- 페이지네이션 (페이지당 10개 포스트)
- URL 쿼리 파라미터로 검색어와 페이지 번호 유지

**검색 로직**:
- MDX 파일을 직접 읽어 본문 내용 추출
- 마크다운 문법 제거 후 검색 인덱스 생성
- 클라이언트 사이드에서 실시간 필터링

### 3. `src/pages/blog/[...slug].astro` - 블로그 포스트 동적 라우팅

**동작 방식**:
1. `getCollection('blog')`로 모든 블로그 포스트 로드
2. `getStaticPaths()`에서 각 포스트의 `id`를 `slug`로 매핑
3. `render()` 함수로 MDX를 HTML로 변환
4. `BlogPost` 레이아웃으로 감싸서 렌더링

**URL 구조**: `/blog/202601060145/` (파일명이 slug가 됨)

### 4. `src/layouts/BlogPost.astro` - 공통 레이아웃

**사용처**: 블로그 포스트와 프로젝트 포스트 모두에서 사용

**주요 기능**:
- Hero 이미지 표시 (있는 경우)
- 제목, 날짜, 태그 표시
- 프로젝트인 경우: GitHub/GitLab 링크, 팀 크기 등 추가 정보 표시
- MDX 컨텐츠를 `<slot />`으로 렌더링

**조건부 렌더링**:
- `isProject` 변수로 블로그/프로젝트 구분
- 프로젝트인 경우에만 링크 버튼 표시

### 5. `src/pages/project/index.astro` - 프로젝트 목록 페이지

**특징**:
- 프로젝트를 지정된 순서로 정렬: `['PICA', 'GOLDEN_TICKET', 'TODO', 'MERGE', 'FOX_BOOK_FINDER']`
- `thumbnail` 이미지가 있으면 우선 사용, 없으면 `heroImage` 사용
- 프로젝트 기간 (`startDate` ~ `endDate`) 표시

### 6. `src/pages/rss.xml.js` - RSS 피드 생성

**기능**:
- `getCollection('blog')`로 모든 블로그 포스트 로드
- `@astrojs/rss`를 사용하여 RSS XML 생성
- 각 포스트의 frontmatter 데이터를 RSS 아이템으로 변환

**접근 경로**: `/rss.xml`

### 7. `astro.config.mjs` - Astro 설정

**주요 설정**:
- **Site URL**: `https://www.dskim.dev`
- **Integrations**: 
  - `@astrojs/mdx`: MDX 지원
  - `@astrojs/sitemap`: 자동 사이트맵 생성
- **Image Service**: Sharp 사용
  - `limitInputPixels: 268402689` (기본값의 약 4배) - 큰 이미지 처리용

### 8. `src/components/BaseHead.astro` - 메타데이터 관리

**기능**:
- SEO 메타 태그 (title, description)
- Open Graph 태그 (소셜 미디어 공유용)
- Twitter Card 태그
- Canonical URL
- RSS 피드 링크
- 폰트 프리로드

**이미지 처리**:
- `image` prop이 있으면 해당 이미지를 OG 이미지로 사용
- 없으면 `public/og.png`를 기본값으로 사용

### 9. `src/styles/global.css` - 전역 스타일

**디자인 시스템**:
- **다크 모드 전용**: 밝은 텍스트, 어두운 배경
- **색상 팔레트**: 
  - Accent: `#4f8cff` (파란색)
  - 텍스트: 밝은 회색 계열
  - 배경: `#050814` (어두운 파란색)
- **네온 글로우 효과**: 카드 호버 시 네온 효과
- **폰트**: Atkinson (웹폰트)

---

## 컨텐츠 작성 방법

### 블로그 포스트 작성

**파일 위치**: `src/content/blog/YYYYMMDDHHMM.mdx`

**Frontmatter 형식**:
```yaml
---
title: "포스트 제목"
pubDate: 2026-01-06T01:45+09:00
description: "포스트 설명"
updatedDate: 2026-01-07T10:00+09:00  # 선택
heroImage: ../../assets/blog/image.webp  # 선택
tags: ["태그1", "태그2"]  # 선택
---

## 본문 내용
마크다운 형식으로 작성
```

**파일명 규칙**: `YYYYMMDDHHMM.mdx` (예: `202601060145.mdx`)

### 프로젝트 포트폴리오 작성

**파일 위치**: `src/content/project/PROJECT_NAME.mdx`

**Frontmatter 형식**:
```yaml
---
title: "프로젝트 이름"
description: "프로젝트 설명"
pubDate: 2026-01-01T00:00+09:00
startDate: 2025-01-01T00:00+09:00  # 선택
endDate: 2025-12-31T23:59+09:00     # 선택
thumbnail: ../../assets/projects/PROJECT/thumbnail.webp  # 선택
heroImage: ../../assets/projects/PROJECT/hero.webp       # 선택
tags: ["기술1", "기술2"]  # 선택
gitHub: "https://github.com/user/repo"  # 선택
gitHubPrivate: true  # 선택 (비공개 저장소인 경우)
gitLab: "https://gitlab.com/user/repo"  # 선택
link: "https://project-url.com"  # 선택
linkClosed: false  # 선택 (서비스 종료 여부)
teamSize: "3명"  # 선택
---

## 프로젝트 상세 내용
```

---

## 개발 환경 설정

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (http://localhost:4321)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

### 특수 스크립트

```bash
# 이력서 PDF 생성
npm run generate-pdf
```

---

## 주요 기능 상세

### 1. 검색 기능 (블로그 목록 페이지)

**검색 타입**:
- 전체: 제목, 설명, 태그, 내용 모두 검색
- 제목: 제목만 검색
- 내용: 본문 내용만 검색
- 태그: 태그만 검색

**구현 방식**:
- 서버 사이드에서 MDX 파일을 읽어 본문 추출
- 마크다운 문법 제거 후 클라이언트에 전달
- 클라이언트 사이드에서 실시간 필터링
- URL 쿼리 파라미터로 검색 상태 유지

### 2. 페이지네이션

- 페이지당 10개 포스트 표시
- 검색 결과에 따라 동적으로 페이지 수 조정
- URL 쿼리 파라미터로 페이지 번호 유지

### 3. 이미지 최적화

- Astro의 `Image` 컴포넌트 사용
- Sharp를 통한 자동 최적화
- WebP 형식으로 변환
- 반응형 이미지 제공

### 4. SEO 최적화

- 각 페이지별 메타 태그 설정
- Open Graph 태그로 소셜 미디어 공유 최적화
- 자동 사이트맵 생성
- RSS 피드 제공
- Canonical URL 설정

---

## 확장 방법

### 새로운 컬렉션 추가

1. `src/content.config.ts`에 새 컬렉션 정의:
```typescript
const newCollection = defineCollection({
  loader: glob({ base: './src/content/newCollection', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    // ... 스키마 정의
  }),
});

export const collections = { blog, resume, project, newCollection };
```

2. `src/content/newCollection/` 폴더 생성 및 MDX 파일 작성
3. `src/pages/newCollection/` 폴더에 페이지 생성

### 새로운 페이지 추가

`src/pages/` 폴더에 `.astro` 파일을 추가하면 자동으로 라우팅됩니다.

예: `src/pages/about.astro` → `/about` 경로로 접근 가능

### 컴포넌트 추가

`src/components/` 폴더에 `.astro` 파일을 추가하고 필요한 곳에서 import하여 사용합니다.

---

## 주의사항

1. **이미지 경로**: 
   - 컨텐츠에서 이미지 사용 시 상대 경로 사용: `../../assets/...`
   - `public/` 폴더의 이미지는 절대 경로: `/images/...`

2. **파일명 규칙**:
   - 블로그: `YYYYMMDDHHMM.mdx` 형식 필수 (정렬 및 URL 생성용)
   - 프로젝트: 대문자 스네이크 케이스 권장 (예: `GOLDEN_TICKET.mdx`)

3. **이미지 최적화**:
   - 큰 이미지는 Sharp의 `limitInputPixels` 설정에 주의
   - WebP 형식 사용 권장

4. **빌드 시점**:
   - 모든 페이지는 빌드 시점에 정적 HTML로 생성됨 (SSG)
   - 동적 데이터는 빌드 시점에만 가져올 수 있음

---

## 배포 정보

- **플랫폼**: Vercel
- **빌드 명령어**: `npm run build`
- **출력 디렉토리**: `dist/`
- **사이트 URL**: https://www.dskim.dev

---

## 참고 자료

- [Astro 공식 문서](https://docs.astro.build/)
- [Content Collections 가이드](https://docs.astro.build/en/guides/content-collections/)
- [MDX 가이드](https://docs.astro.build/en/guides/markdown-content/)

