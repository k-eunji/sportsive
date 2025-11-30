//src/store/usePostStore.ts

"use client";

import { create } from "zustand";

type PostState = {
  commentCounts: Record<string, number>;
  setCommentCount: (postId: string, count: number) => void;
  incrementCommentCount: (postId: string) => void;

  selectedHashtag: string;
  setSelectedHashtag: (hashtag: string) => void;

  selectedCategory: string;
  setSelectedCategory: (category: string) => void;

  selectedSort: "newest" | "popular" | "comments";
  setSelectedSort: (sort: "newest" | "popular" | "comments") => void;

  // 👇 숨긴 포스트 상태 추가
  hiddenPosts: string[];
  addHiddenPost: (postId: string) => void;
  removeHiddenPost: (postId: string) => void;
  setHiddenPosts: (postIds: string[]) => void;
};

export const usePostStore = create<PostState>((set) => ({
  commentCounts: {},
  setCommentCount: (postId, count) =>
    set((state) => ({
      commentCounts: {
        ...state.commentCounts,
        [postId]: count,
      },
    })),
  incrementCommentCount: (postId) =>
    set((state) => ({
      commentCounts: {
        ...state.commentCounts,
        [postId]: (state.commentCounts[postId] || 0) + 1,
      },
    })),

  selectedHashtag: "",
  setSelectedHashtag: (hashtag) => set({ selectedHashtag: hashtag }),

  selectedCategory: "All",
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  selectedSort: "newest",
  setSelectedSort: (sort) => set({ selectedSort: sort }),

  // 👇 숨김 관련 상태 & 액션
  hiddenPosts: [],
  addHiddenPost: (postId) =>
    set((state) => ({
      hiddenPosts: [...state.hiddenPosts, postId],
    })),
  removeHiddenPost: (postId) =>
    set((state) => ({
      hiddenPosts: state.hiddenPosts.filter((id) => id !== postId),
    })),
  setHiddenPosts: (postIds) => set({ hiddenPosts: postIds }),
}));
