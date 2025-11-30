// src/types/team.ts

export interface TeamDetail {
  id: string;
  name: string;
  logo?: string;
  region?: string;
  city?: string;
  homepageUrl?: string;
  transportInfo?: string;
  venue?: string;
  foundedYear?: number;
  instagram?: string;
  x?: string;
  youtube?: string;
}

export interface Fan {
  id: string;           
  nickname: string;     
  level: number;        
  avatarUrl?: string;   
}

export interface Insight {
  id: string;               // 고유 아이디
  title: string;            // 분석글 제목
  summary: string;          // 요약
  content?: string;         // 전체 내용 (선택적)
  authorId: string;         // 작성자 ID
  authorNickname: string;   // 작성자 닉네임
  createdAt: string;        // ISO 문자열
  updatedAt?: string;       // 선택적
  tags?: string[];          // 선택적 해시태그
}

export interface Team extends TeamDetail {
  // 목록용, 필요하면 추가 필드
}
