//src/components/CommentsClient.tsx

'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@/context/UserContext';

type Props = {
  postId: string;
};

export default function CommentsClient({ postId }: Props) {
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState('');

  const { user, loading } = useUser();
  if (loading) return <p>Loading user...</p>;
  if (!user) return <p>Please log in.</p>;

  // ------------------ 댓글 가져오기 ------------------
  useEffect(() => {
    if (!postId) return;

    const fetchComments = async () => {
      try {
        const res = await axios.get('/api/comments', { params: { postId } });
        setComments(res.data.comments);
      } catch (err) {
        console.error('Failed to fetch comments', err);
        setComments([]);
      }
    };

    fetchComments();

    // 필요하면 주기적으로 polling
    // const interval = setInterval(fetchComments, 5000);
    // return () => clearInterval(interval);

  }, [postId]);

  // ------------------ 댓글 작성 ------------------
  const handleSubmit = async () => {
    if (!text.trim()) return;

    try {
      await axios.post('/api/comments', {
        postId,
        text,
        authorNickname: user.authorNickname,
        userId: user.uid,
      });

      // 작성 후 최신 댓글 가져오기
      const res = await axios.get('/api/comments', { params: { postId } });
      setComments(res.data.comments);

      setText('');
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h3>💬 Comments</h3>

      {/* Comment input */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ padding: '0.5rem', width: '70%' }}
        />
        <button onClick={handleSubmit} style={{ marginLeft: '0.5rem' }}>
          Post
        </button>
      </div>

      {/* Comment list */}
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <ul>
          {comments.map((comment) => (
            <li key={comment.id} style={{ marginBottom: '0.5rem' }}>
              <b>{comment.authorNickname}</b>: {comment.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
