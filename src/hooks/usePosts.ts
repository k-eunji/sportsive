//src/hooks/usePosts.ts

import { useEffect, useState } from "react";
import { Post, getPosts, GetPostsParams } from "../lib/api/posts";

export function usePosts(params: GetPostsParams) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const data = await getPosts(params); // Firestore 직접 호출 없음
        setPosts(data);
      } catch (err) {
        setError(err as Error);
      }
      setLoading(false);
    }
    fetchPosts();
  }, [params]);

  return { posts, loading, error };
}
