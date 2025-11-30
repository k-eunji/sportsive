// ✅ src/types/comment.ts

export interface Reply {
  id: string;
  authorNickname: string;
  text: string;
  userId: string;
  createdAt: string | number | { _seconds: number; _nanoseconds?: number };

  /** 부모 댓글 ID */
  parentCommentId: string;

  /** 좋아요 개수 */
  likeCount?: number;

  /** ⭐ 내가 좋아요 눌렀는지 */
  isLiked?: boolean;   // ← 추가
  edited?: boolean; 
}

export interface Comment {
  id: string;
  authorNickname: string;
  text: string;
  userId: string;
  createdAt: string | number | { _seconds: number; _nanoseconds?: number };

  /** 좋아요 개수 */
  likeCount?: number;

  /** 대댓글 목록 */
  replies?: Reply[];

  /** ⭐ 내가 좋아요 눌렀는지 */
  isLiked?: boolean;  // ← 추가
  edited?: boolean; 
}
