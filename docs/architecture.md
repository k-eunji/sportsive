/docs/architecture.md


````markdown
# 🏟 SPORTSIVE — FULL ARCHITECTURE DOCUMENTATION
Version 1.0 · Updated: 2025-11-12

---

## 1. 🎯 Core Concept
**Sportsive**는 지역 기반 스포츠 커뮤니티 플랫폼이다.  
누구나 내 주변에서 열리는 경기와 밋업을 찾고,  
함께 관람하거나 실시간으로 응원할 수 있다.  
인기 종목뿐 아니라 **비인기·아마추어 경기까지** 모두 포함한다.

---

## 2. 🌍 Mission
> “스포츠를 통해 지역 사람들을 연결한다.”  
> 런던의 작은 공원 야구 경기부터 프리미어리그까지,  
> Sportsive는 모든 스포츠 경험을 가까운 거리에서 발견하고 공유할 수 있게 만든다.

---

## 3. 🧭 App Overview

| Section | 역할 | 설명 |
|----------|------|------|
| **Events (홈)** | 지도 기반 경기 탐색 | 내 주변 경기 / 무료 경기 또는 유료 경기 등 |
| **Meetups** | 지역 팬 모임 | 경기 함께 보기 밋업 모집, 함께 플레이하기, 함께 펌에서 보기 등  / 참가 |
| **Live** | 경기 실시간 응원 채팅 | 경기 중 대화방 / 관람 후기 자동 포스팅 |
| **Teams** | 팀 중심 팬 허브 | 팀별 팬 피드 / 밋업 / 경기 일정 / 팬존 |
| **Community** | 전체 피드 | 지역 + 팀 + 밋업 후기 통합 커뮤니티 |
| **Profile** | 사용자 활동 요약 | 내가 만든 밋업 / 참여 이력 / 포인트 / 팬 레벨 |

---

## 4. 🗺️ Page IA Diagram

```mermaid
flowchart TD
    A[Home (Events / Map)] --> B[Event Detail]
    B --> C[Meetup Creation]
    C --> D[Live Room]
    D --> E[Team Page]
    E --> F[Community Feed]
    F <--> G[Profile]
````

---

## 5. 🔗 Data & API Flow

```text
events → meetups → teamId → community
live → teamId → community (realtime)
```

| 데이터 출처           | 사용처             | 목적            |
| ---------------- | --------------- | ------------- |
| `/api/events`    | 지도 기반 경기 표시     | 지역 경기 탐색      |
| `/api/meetups`   | 밋업 생성 / 참여      | 팬 연결          |
| `/api/live`      | 실시간 경기방         | 응원 / 후기 자동 등록 |
| `/api/teams/:id` | 팀 정보 / 밋업 / 경기  | 팀 커뮤니티 허브     |
| `/api/community` | 피드 / 후기 / 밋업 공유 | 커뮤니티 통합 피드    |
| `/api/users/:id` | 프로필 / 포인트 / 밋업  | 유저 활동 요약      |

---

## 6. 🧠 UX Flow (User Scenarios)

### 📍 [런던 근처 야구 경기 찾기]

1. 홈(Event Map)에서 런던 지역 선택
2. 무료 아마추어 야구 경기 클릭
3. 경기 정보 확인 → “밋업 만들기” 클릭
4. Meetup 생성 → 커뮤니티에 자동 공유

### 🤝 [팀 팬들과 밋업 만들기]

1. 팀 페이지 → 근처 밋업 목록
2. “새 밋업 만들기” 클릭
3. 경기 / 장소 / 시간 설정
4. 생성 후 → Community Feed 자동 등록

### 💬 [라이브 채팅 후 후기 작성]

1. Live 페이지 → 경기 라이브룸 입장
2. 실시간 응원
3. 경기 종료 후 → 후기 자동 포스트

### 🧍 [내 활동 확인]

1. Profile → 밋업 / 포스트 / 포인트 확인
2. 응원 팀 / 지역 노출
3. 팬 레벨 확인

---

## 7. 🧱 Page Responsibility

| Page                | Purpose     | Key Components                                                 | Primary Data        |
| ------------------- | ----------- | -------------------------------------------------------------- | ------------------- |
| `/events`           | 지도 기반 경기 탐색 | `EventMap`, `EventList`, `EventFilterBar`                      | `/api/events`       |
| `/events/[id]`      | 개별 경기 상세    | `EventDetail`, `EventActions`                                  | `/api/events/:id`   |
| `/meetups`          | 밋업 탐색 / 생성  | `MeetupList`, `CreateMeetupModal`, `MeetupSearchBar`           | Firebase: `meetups` |
| `/live`             | 경기 실시간 채팅   | `LiveRoomList`, `LiveRoomCard`                                 | `/api/live`         |
| `/live/[roomId]`    | 라이브룸 상세     | `ChatArea`, `ParticipantsList`                                 | Realtime DB         |
| `/teams/[teamId]`   | 팀 허브        | `TeamHeader`, `TeamTabs`, `TeamOverview`, `FanFeed`, `FanZone` | `/api/teams/:id`    |
| `/community`        | 전체 피드       | `FeedComposer`, `FeedList`, `FeedFilterBar`, `RightSidebar`    | `/api/community`    |
| `/profile/[userId]` | 프로필 / 활동 요약 | `ProfileHeader`, `ActivitySummary`, `ProfileTabs`              | `/api/users/:id`    |

---

## 8. 🧩 Entity Relationship

```text
Event
 ├── hasMany → Meetup
 │       └── belongsTo → Team
 │
 ├── hasMany → LiveRoom
 │       └── belongsTo → Team
 │
 └── referencedBy → Community Post (type=post|meetup|live)

User
 ├── hasMany → Meetup (hosted)
 ├── hasMany → LiveRoom (joined)
 ├── hasMany → Community Post
 └── belongsToMany → Team (following)
```

---

## 9. 🏟 Team Page — 지역 기반 리디자인

| Section           | 역할             | 설명                                                       |
| ----------------- | -------------- | -------------------------------------------------------- |
| **Header (Hero)** | 팀 로고, 팬 수, CTA | `Join Fans`, `Next Match`, `Nearby Fans`                 |
| **Tabs**          | 콘텐츠 전환         | `Overview`, `Fan Feed`, `Meetups`, `Matches`, `Fan Zone` |
| **Overview**      | 핵심 정보 요약       | 근처 팬, 다음 경기, 최근 밋업, 인기 글                                 |
| **Fan Feed**      | 팀 피드           | 팬글 / 후기 / 밈 등                                            |
| **Meetups**       | 팬 밋업 리스트       | 지역 기반 필터링                                                |
| **Matches**       | 경기 일정          | `/api/events?teamId=` 연동                                 |
| **Fan Zone**      | 투표 / 챌린지       | 참여형 콘텐츠                                                  |

**지역성 강화 포인트**

* `/api/teams/:id?region=London` → 근처 팬 수, 경기, 밋업 반환
* 사이드바에 “Nearby Meetups”, “Live Now”, “Top Local Fans” 표시

---

## 10. 💬 Community Page 구조

* 필터: `?type=post|meetup|live|relationship&region=&team=`
* `FeedComposer`: 모드별 CTA / placeholder 변경
* `RightSidebar`: Nearby Meetups, Live Matches, Friend Activity, Top Fans
* **포인트 시스템:**

  * 게시물 작성 +5
  * 밋업 생성 +10
  * 후기 작성 +5

---

## 11. ⚙️ Tech Stack

| Layer          | Tech                                               |
| -------------- | -------------------------------------------------- |
| Frontend       | Next.js 15 · React · TypeScript · Tailwind CSS     |
| Backend        | Next API Routes · Firebase Firestore / Realtime DB |
| Auth           | Firebase Auth (Google / Email)                     |
| Map / Location | Leaflet or Mapbox GL                               |
| Realtime Chat  | Firebase Realtime DB / WebSocket                   |
| Notifications  | Sonner / ToastArea                                 |
| UI Components  | shadcn/ui · lucide-react · Framer Motion           |

---

## 12. 🚧 Roadmap

* [ ] Team Page → 지역 기반 리디자인
* [ ] Community Feed → region / team 필터 통합
* [ ] Home → 위치 기반 추천 경기 / 밋업
* [ ] Live → 종료 후 후기 자동 포스트
* [ ] 경기 데이터 API (OpenSports / custom)
* [ ] Profile → Fan Level / Badge 시스템
* [ ] Mobile UI 최적화

---

## 13. 🧭 Long-Term Vision

> “Sportsive는 단순한 팬 커뮤니티가 아니다.
> 지역 사회 속에서 스포츠를 발견하고,
> 낯선 사람들이 함께 응원하는 문화를 만든다.”

**핵심 가치**

* ⚽ 모든 스포츠의 평등한 접근성
* 🏙️ 지역 중심의 연결
* 💬 실시간 소통
* 🧍 팬 경험의 확장

---

## 14. 🧰 Developer Notes

* 파일 위치: `/docs/architecture.md`
* 추천 확장:

  * Markdown Preview Enhanced
  * Mermaid Preview
* 수정 시 커밋 메시지 예시:

  ```
  docs: update IA flow and add TeamPage redesign spec
  ```

---

✅ **정리**
이 문서 한 개로 **Sportsive의 구조, 데이터 흐름, UX 시나리오, 기술 스택, 로드맵**까지 모두 포함된다.
새로운 기능 추가 시 Roadmap 섹션에 체크박스로 기록하면
이 문서가 “살아있는 설계 문서”가 된다.

