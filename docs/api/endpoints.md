/docs/api/endpoints.md

````markdown
# 🔌 SPORTSIVE — API ENDPOINTS SPEC
Version 1.0 · Updated: 2025-11-12

본 문서는 **UI 설계서**(`/docs/architecture.md`, `/docs/ui/*.md`)와 **데이터 스키마**(`/docs/data/structure.md`)를 기반으로 작성된 **REST-like API 명세**입니다.  
샘플은 JSON 기준이며, 인증은 기본적으로 **Firebase Auth (Bearer Token)** 를 가정합니다.

---

## 0) 공통 규칙

### 인증
- 헤더: `Authorization: Bearer <idToken>`
- 비공개 리소스(밋업 생성/참가, 글쓰기 등) 필수

### 페이징
- 쿼리: `?limit=20&cursor=<opaque>`  
- 응답: `{"data":[...],"nextCursor":"...","hasMore":true}`

### 정렬 & 기간
- `?sort=recent|popular` (기본: `recent`)
- `?from=2025-11-01&to=2025-11-30` (ISO-8601 날짜/시각 허용)

### 지역 & 팀 필터
- `?region=london&team=arsenal&category=baseball`

### 에러 포맷
```json
{ "error": { "code": "NOT_FOUND", "message": "Event not found" } }
````

---

## 1) EVENTS — 경기/이벤트

### GET `/api/events`

목록 조회 (지도/리스트)

* Query: `region`, `city`, `category`, `competition`, `from`, `to`, `free=true|false`, `limit`, `cursor`
* 200

```json
{
  "events": [
    {
      "id": "evt_001",
      "title": "Arsenal vs Chelsea",
      "category": "football",
      "competition": "Premier League",
      "homeTeam": "Arsenal FC",
      "awayTeam": "Chelsea FC",
      "date": "2025-11-18T20:00:00Z",
      "venue": "Emirates Stadium",
      "city": "London",
      "region": "London",
      "location": {"lat": 51.5549, "lng": -0.1084},
      "status": "Scheduled",
      "homepageUrl": "https://..."
    }
  ],
  "nextCursor": null,
  "hasMore": false
}
```

### GET `/api/events/england/football`

영국 축구 이벤트(내부 통합용) — 이미 UI에서 사용

### GET `/api/events/:id`

* 200

```json
{
  "event": {
    "id": "evt_001",
    "title": "Arsenal vs Chelsea",
    "category": "football",
    "competition": "Premier League",
    "homeTeam": "Arsenal FC",
    "awayTeam": "Chelsea FC",
    "date": "2025-11-18T20:00:00Z",
    "venue": "Emirates Stadium",
    "city": "London",
    "region": "London",
    "location": {"lat": 51.5549, "lng": -0.1084},
    "status": "Scheduled"
  }
}
```

---

## 2) MEETUPS — 밋업

### GET `/api/meetups`

* Query: `region`, `eventId`, `teamId`, `q`, `type`, `age`, `date=this_week|next_week|weekend`, `limit`, `cursor`
* 200

```json
{ "meetups": [ /* MeetupWithEvent[] */ ], "nextCursor": null, "hasMore": false }
```

### POST `/api/community` (mode=meetup) ← **생성**

* Body

```json
{ "mode": "meetup", "text": "Watch together", "eventId": "evt_001", "teamId": "arsenal", "datetime": "2025-11-18T19:00:00Z", "location": {"name":"Camden Pub","lat":51.54,"lng":-0.14}, "maxParticipants": 10, "type":"public", "ageLimit":"18+" }
```

* 201

```json
{ "meetup": { "id": "m_01", "...": "..." }, "postId": "p_234" }
```

### POST `/api/meetups/:id/join`

* 200

```json
{ "status": "pending", "meetupId": "m_01" }
```

### POST `/api/meetups/:id/leave`

* 200

```json
{ "status": "left" }
```

### POST `/api/meetups/:id/approve`

* Body: `{ "userId": "uid_123" }`
* 200

```json
{ "status": "approved", "userId": "uid_123" }
```

> ⏱ 자동 정리: 시작 12시간 경과 밋업은 서버/크론에서 삭제

---

## 3) LIVE — 실시간 채팅

### GET `/api/live/football/rooms`

* Query: `eventId`
* 200

```json
{ "rooms": [ { "id":"l_07", "eventId":"evt_001", "title":"...","participants":["uid"], "datetime":"2025-11-18T20:00:00Z", "status":"LIVE", "homeTeam":"Arsenal FC", "awayTeam":"Chelsea FC", "homeTeamLogo":"/...", "awayTeamLogo":"/..." } ] }
```

### POST `/api/community` (mode=live) ← **라이브룸 생성**

* Body

```json
{ "mode":"live", "eventId":"evt_001", "teamId":"arsenal", "title":"Match Live Chat", "datetime":"2025-11-18T20:00:00Z" }
```

* 201

```json
{ "room": { "id":"l_07", "...":"..." }, "postId":"p_567" }
```

> 라이브룸 오픈/종료 규칙(UI 구현 기준):
>
> * 시작 2시간 전부터 입장 가능, 경기 종료 +30분까지 유지
> * 종료 시 커뮤니티 후기 자동 포스팅(옵션)

---

## 4) TEAMS — 팀

### GET `/api/teams/:teamId`

* 200

```json
{ "team": { "id":"arsenal","name":"Arsenal FC","logo":"/logos/arsenal.png","city":"London","region":"London","fans":2841 } }
```

### GET `/api/teams/:teamId/matches/next`

* 200

```json
{ "match": { "homeTeam":"Arsenal FC","awayTeam":"Chelsea FC","date":"2025-11-18T20:00:00Z","venue":"Emirates Stadium" } }
```

### GET `/api/teams/:teamId/meetups`

* 200

```json
{ "meetups": [ /* team meetups */ ] }
```

### GET `/api/teams/:teamId/fans/count`

* 200

```json
{ "count": 2841 }
```

### GET `/api/teams/:teamId/live`

* 200

```json
{ "rooms": [ /* live rooms linked to team */ ] }
```

### POST `/api/relationships/join`

* Body: `{ "teamId": "arsenal" }`
* 200

```json
{ "status":"joined","teamId":"arsenal" }
```

---

## 5) COMMUNITY — 피드/액션

### GET `/api/community/feed`

* Query: `type=post|meetup|live|relationship`, `team`, `user`, `region`, `limit`, `cursor`
* 200

```json
{ "feed": [ { "id":"p_01","type":"post","userId":"uid_1","userName":"Alex","team":"arsenal","region":"london","content":"..." } ], "nextCursor": null, "hasMore": false }
```

### POST `/api/community`

* Body (공통)

```json
{ "mode":"post|meetup|live|relationship", "text":"...", "team":"arsenal", "region":"london", "...": "extra per mode" }
```

* 201

```json
{ "id":"p_123", "pointsAwarded": 5 }
```

### GET `/api/community/friends`

```json
{ "friends":[ { "id":"uid_22","name":"Mina","action":"joined a meetup" } ] }
```

### GET `/api/community/fans`

```json
{ "fans":[ { "rank":1,"name":"Jamie","points":230 } ] }
```

### GET `/api/community/live`

```json
{ "live":[ { "id":"l_07","title":"...","status":"LIVE" } ] }
```

### GET `/api/community/meetups`

```json
{ "meetups":[ { "id":"m_01","title":"...","location":{"name":"Camden Pub"} } ] }
```

---

## 6) USERS — 프로필

### GET `/api/users/:userId`

* 200

```json
{
  "id":"uid_123",
  "name":"Jamie",
  "nickname":"Gooner_J",
  "region":"London",
  "fanPoints":230,
  "followingTeams":["arsenal"],
  "badges":["Early Fan","Meetup Creator"]
}
```

---

## 7) RELATIONSHIPS — 팔로우/추천

### POST `/api/relationships/follow`

* Body: `{ "targetUserId": "uid_456" }`
* 200

```json
{ "status":"following","target":"uid_456" }
```

### POST `/api/community` (mode=relationship) ← **추천 포스트**

* Body: `{ "mode":"relationship", "text":"Follow @Jamie for local meetups!" }`
* 201

```json
{ "id":"p_999", "pointsAwarded": 5 }
```

---

## 8) AUTH — 인증 (래퍼)

> Firebase Auth 사용. 서버에서는 토큰 검증만 수행.
> 필요 시 래핑 엔드포인트:

### POST `/api/auth/session`

* Body: `{ "idToken": "<firebase id token>" }`
* 200

```json
{ "status":"ok","uid":"uid_123" }
```

---

## 9) STATS / DISCOVERY — 추천/통계

### GET `/api/discovery/home`

홈 추천 카드(내 주변)

* Query: `region`, `lat`, `lng`
* 200

```json
{
  "freeEvents":[ /* 무료 경기 */ ],
  "nearbyMeetups":[ /* 근처 밋업 */ ],
  "liveNow":[ /* 실시간 경기/룸 */ ]
}
```

### GET `/api/stats/overview`

대시보드용 집계

```json
{ "activeMeetups":12, "liveNow":2, "topRegions":[{"region":"London","score":842}] }
```

---

## 10) 응답 타입 (TypeScript Interfaces · 발췌)

```ts
export type LatLng = { lat: number; lng: number };

export interface Event {
  id: string;
  title: string;
  category: string;
  competition?: string;
  homeTeam?: string;
  awayTeam?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  date: string; // ISO
  venue?: string;
  city?: string;
  region?: string;
  location?: LatLng;
  status?: "Scheduled" | "Live" | "Finished" | string;
  homepageUrl?: string;
}

export interface Meetup {
  id: string;
  title: string;
  eventId?: string;
  teamId?: string;
  hostId: string;
  datetime: string; // ISO
  location: { name: string } & LatLng;
  participants: string[];
  pendingParticipants?: string[];
  maxParticipants?: number;
  type?: "public" | "private";
  ageLimit?: string; // e.g. "18+"
  createdAt?: string;
}

export interface LiveRoom {
  id: string;
  eventId: string;
  title: string;
  participants: string[];
  datetime: string; // ISO
  status?: "Scheduled" | "LIVE" | "END";
  homeTeam?: string;
  awayTeam?: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
}

export interface FeedItem {
  id: string;
  type: "post" | "meetup" | "live" | "relationship";
  userId: string;
  userName: string;
  team?: string;
  region?: string;
  content?: string;
  meta?: { likes?: number; comments?: number; status?: string };
}
```

---

## 11) 상태코드 표준

|  코드 | 의미                    | 비고                 |
| --: | --------------------- | ------------------ |
| 200 | OK                    | 정상                 |
| 201 | Created               | 생성 완료              |
| 204 | No Content            | 본문 없음              |
| 400 | Bad Request           | 파라미터/스키마 오류        |
| 401 | Unauthorized          | 인증 실패/누락           |
| 403 | Forbidden             | 권한 부족 (호스트 전용 등)   |
| 404 | Not Found             | 리소스 없음             |
| 409 | Conflict              | 중복/상태 충돌 (중복 참가 등) |
| 429 | Too Many Requests     | 레이트 리밋             |
| 500 | Internal Server Error | 서버 오류              |

---

## 12) 보안/레이트 리밋

* 모든 변경(POST/PUT/PATCH/DELETE) 요청은 **토큰 검증** 필수
* 사용자 쓰기 작업에 **간단 레이트 리밋** 권장:

  * 글쓰기: 사용당 10/min
  * 밋업 생성: 사용자당 3/day
* 서버측 **입력 검증/정규화**(region/team/category 화이트리스트)
* 위치 정보는 좌표를 저장하되, **클라이언트 노출 시 소수점 4자리 이하 마스킹** 권장

---

## 13) Webhook/자동화 (선택)

* `POST /api/hooks/live/finished`

  * Body: `{ "eventId":"evt_001","roomId":"l_07" }`
  * 처리: 라이브 종료 → 커뮤니티 후기 생성, 알림 발송

---

## 14) 변경 로그

* **v1.0 (2025-11-12)**: 초기 스펙 작성 — Events/Meetups/Live/Teams/Community/Users/Stats 포함

---

```
```
