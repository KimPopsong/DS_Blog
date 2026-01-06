# Resume Assets 폴더

이 폴더는 이력서에 사용할 이미지 파일들을 저장하는 곳입니다.

## 이미지 사용 방법

### 1. 마크다운 파일에서 이미지 사용

`src/content/resume/resume.md` 파일에서 이미지를 사용하려면:

```markdown
![이미지 설명](../../assets/resume/이미지파일명.jpg)
```

또는 HTML 태그를 직접 사용:

```html
<img src="/src/assets/resume/이미지파일명.jpg" alt="이미지 설명" />
```

### 2. MDX 파일로 변경하여 Astro Image 컴포넌트 사용

더 나은 이미지 최적화를 원한다면 `resume.md`를 `resume.mdx`로 변경하고:

```jsx
---
title: Resume
description: 김대성의 이력서
---

import { Image } from 'astro:assets';
import profileImage from '../../assets/resume/profile.jpg';

# 이력서

<Image src={profileImage} alt="프로필 사진" width={300} height={300} />
```

## 권장 이미지 형식

- 프로필 사진: JPG, PNG (권장 크기: 300x300px 이상)
- 자격증/수상 증명서: JPG, PNG
- 포트폴리오 스크린샷: JPG, PNG, WebP

## 파일 구조 예시

```
src/assets/resume/
├── profile.jpg          # 프로필 사진
├── certificate-1.jpg    # 자격증 이미지
├── award-1.jpg          # 수상 증명서
└── README.md            # 이 파일
```
