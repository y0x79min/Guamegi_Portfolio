# Guamegi

대학 LMS에 흩어진 강의와 과제를 한 화면에서 확인하기 위해 만든 Vue·Node.js 기반 웹 서비스입니다. 2022년 학과 프로젝트로 개발했으며, 모바일 앱이 아닌 반응형 웹 애플리케이션입니다.

실제 대학 계정 없이도 화면을 확인할 수 있도록 `/glist`에서 공개용 목업 데이터를 불러옵니다. 목업은 7개 강의, 50개 과제, 완료 40개(80%)로 구성했습니다.

## 주요 기능

- 대학 LMS 로그인과 세션 처리
- 학교별 CSS 선택자 설정을 이용한 강의·과제 수집
- 강의별 과제 목록, 제출 여부, 마감일 통합 조회
- 전체·강의별 완료율 표시와 과제 필터링
- 과제 마감일 캘린더
- 강의별 기록장(게시글, 댓글, 추천·비추천)
- 학교·학과 단위 실시간 채팅과 닉네임/익명 모드
- 학교별 LMS 설정을 데이터베이스에서 관리

## 기술 스택

- Frontend: Vue 3, Vue Router, Axios, Vuetify, FullCalendar, Day.js
- Backend: Node.js, Express, Socket.IO
- Data collection: Puppeteer, Cheerio
- Database: MySQL/MariaDB

## 공개 데모 실행

### 준비물

- Node.js LTS
- Windows

### 실행

1. `start-guamegi.bat`을 실행합니다.
2. 패키지가 없으면 스크립트가 frontend/backend 의존성을 설치합니다.
3. 브라우저가 열리면 `http://localhost:8080/glist`로 이동합니다.

`/glist`는 `backend/public/mock/course-assignments.json`을 읽으므로 실제 학교 계정이나 LMS 접속 없이 강의·과제 화면을 확인할 수 있습니다.

## 실제 연동 환경 구성

1. MariaDB를 실행하고 `backend/sql/init-local.sql`을 적용합니다.
2. `.env.example`을 `backend/.env.local`로 복사합니다.
3. 로컬 데이터베이스 접속 정보를 입력합니다.
4. `start-guamegi.bat`을 실행합니다.

환경 변수와 인증 정보는 Git에 포함하지 않습니다.

## 프로젝트 구조

```text
Guamegi_Portfolio/
├─ frontend/                  # Vue 화면과 라우팅
├─ backend/
│  ├─ app.js                  # REST API, LMS 수집, 게시판 기능
│  ├─ bin/www.js              # HTTP/Socket.IO 서버
│  ├─ public/mock/            # 포트폴리오용 강의·과제 데이터
│  └─ sql/init-local.sql      # 로컬 DB 초기화 스크립트
├─ local-frontend-server.js   # 정적 화면 및 API/WebSocket 프록시
├─ start-guamegi.bat          # frontend/backend 통합 실행
└─ .env.example               # 공개 가능한 환경 변수 예시
```

## 설계 포인트

- 학교마다 다른 LMS 화면 구조를 코드 분기로만 쌓지 않고, 로그인 URL과 강의·과제 CSS 선택자를 `학교리스트` 테이블에서 관리했습니다.
- 수집한 강의·과제 데이터를 목록과 캘린더 화면이 함께 사용할 수 있는 구조로 전달했습니다.
- Socket.IO 방을 학교/학과 단위로 나눠 같은 소속 학생끼리 실시간으로 대화할 수 있게 구성했습니다.
- 포트폴리오 공개본에서는 실계정과 외부 LMS 의존성을 제거하고 같은 UI 흐름을 목업 JSON으로 재현했습니다.

## 검증용 목업 데이터

| 항목 | 값 |
|---|---:|
| 강의 | 7개 |
| 전체 과제 | 50개 |
| 완료 과제 | 40개 |
| 완료율 | 80% |

## 화면 자료

- [추후 이미지 추가] 메인 및 대학 로그인 화면
- [추후 이미지 추가] 강의·과제 통합 목록과 80% 진행률
- [추후 이미지 추가] 과제 캘린더
- [추후 이미지 추가] 강의 기록장
- [추후 이미지 추가] 학교·학과 실시간 채팅

## 한계와 공개 범위

2022년 당시 대학 LMS 구조를 기준으로 만든 학과 프로젝트라서 현재 실제 사이트의 URL·선택자와 다를 수 있습니다. 공개본은 구조와 구현 경험을 보여 주는 포트폴리오 용도이며, 실서비스 운영을 위한 보안 강화와 최신 의존성 업데이트가 추가로 필요합니다.

기존 저장소의 계정 정보, 환경 파일, 인증서, 로그는 공개본에서 제외했습니다.
