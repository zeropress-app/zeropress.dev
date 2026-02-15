# ZeroPress Theme Spec

> Status: Active (current runtime-aligned)

## 0. Core Philosophy

- Themes describe structure, not behavior.
- Theme bundle is pure files.
- Tooling (preview/validate/pack) is external.
- JavaScript 없이도 의미 있는 HTML이 렌더되어야 한다.

## 1. Scope

Theme는 아래만 담당한다.

- HTML 템플릿
- CSS/정적 자산
- 테마 메타데이터(`theme.json`)

범위 제외:

- 백엔드 API/인증/관리자 기능
- 클라이언트 라우팅 의존 구조
- 런타임 실행 로직 중심 앱 구조

## 2. Runtime Contract (Current)

현재 backend build/upload 프로세스와 호환되는 기본 구조:

```txt
my-theme/
  theme.json
  layout.html
  index.html
  post.html
  page.html
  archive.html
  category.html
  tag.html
  partials/
    *.html
  assets/
    style.css
    theme.js (optional)
```

핵심:

- 템플릿 파일은 **루트 레벨 `.html`** 기준
- `partials/`는 선택
- `assets/style.css`는 사실상 필수
- zip은 루트 또는 단일 top-level folder root(`basePrefix`) 허용

## 2.1 Optional Devtools Layer

`create-zeropress-theme --with-devtools`를 사용하면 테마 폴더에 개발 편의 파일(`package.json` 등)이 추가될 수 있다.

중요:

- 이는 로컬 개발 도구 레이어이며 테마 런타임 계약을 변경하지 않음
- 최종 업로드 zip은 순수 테마 파일 기준으로 검증됨
- `node_modules`와 lockfile은 패키징 제외 대상
- devtools는 `zeropress-theme` 명령 thin wrapper만 제공(별도 의존성/lockfile 없음)

## 3. theme.json (Current)

최소 예시:

```json
{
  "name": "my-theme",
  "version": "0.1.0",
  "author": "Author Name",
  "description": "Theme description"
}
```

필수 필드:

- `name` (string)
- `version` (semver)
- `author` (string)

권장 필드:

- `description` (string)

## 4. Template Rules

- `layout.html`은 `{{slot:content}}`를 정확히 1개 포함해야 함
- 허용 슬롯: `content`, `header`, `footer`, `meta`
- 중첩 슬롯 금지
- `layout.html` 내 `<script>` 금지
- Mustache 조건문/루프(`{{#...}}`, `{{/...}}`) 금지

## 5. Variables & Rendering

- 단순 변수 치환만 허용
- 서버 전처리 결과를 렌더하는 구조
- JS는 progressive enhancement 전용

## 6. Security/Packaging Rules

- Tool은 theme code를 실행하지 않음(정적 분석/렌더 기준)
- 경로 이탈 금지(`../`, absolute path 금지)
- symlink로 root 탈출 금지
- 배포 단위는 zip

권장 제외 파일:

- `.git`
- `node_modules`
- `dist`
- `*.log`
- `__MACOSX`, `.DS_Store`
- `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`

## 7. Validation Profile

오류(error):

- `theme.json` 누락/JSON 파싱 실패
- 필수 템플릿(`layout/index/post/page`) 누락
- `assets/style.css` 누락
- `version` semver 불일치
- `layout.html` 슬롯 규칙 위반
- 템플릿 문법 금지 패턴 위반

경고(warning):

- `archive.html`, `category.html`, `tag.html` 누락

## 8. CLI Alignment

`npx zeropress-theme validate/pack/dev`는 본 문서의 Runtime Contract를 기본 기준으로 삼는다.

## 9. Compatibility Notes

- pack 결과물은 루트 평탄화를 기본으로 한다.
- 서버 업로드 검증은 사용자 편의를 위해 single-folder root도 허용한다.

## 10. Toolkit Baseline

- Node.js: `>= 18.18.0`
- ESM only
- CJS 미지원
- 하위 버전 폴리필 미지원

초기 패키지 버전:

- `create-zeropress-theme@0.1.0`
- `zeropress-theme@0.1.0`
