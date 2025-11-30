// components/FirestoreTest.tsx

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase"; // firebase 설정 파일에서 가져오기
import { collection, addDoc, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";

function FirestoreTest() {
  const [data, setData] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  // ✅ Firestore에서 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "posts"));
        const posts = querySnapshot.docs.map((doc) => doc.data());
        setData(posts);
      } catch (error) {
        console.error("Error getting posts: ", error);
      }
    };
    fetchData();
  }, []);

  // ✅ 포스트 추가 함수
  const addPost = async () => {
    if (auth?.currentUser) { // ✅ null-safe 처리
      try {
        await addDoc(collection(db, "posts"), {
          text: "새로운 포스트 내용",
          userId: auth.currentUser.uid,
          createdAt: new Date(),
        });
        setMessage("✅ 포스트가 성공적으로 추가되었습니다.");
      } catch (error) {
        console.error("Error adding document: ", error);
        setMessage("❌ 포스트 추가 실패.");
      }
    } else {
      setMessage("⚠️ 로그인 후 이용해주세요.");
    }
  };

  // ✅ 로그아웃 함수
  const handleSignOut = async () => {
    if (!auth) return; // ✅ null-safe
    try {
      await signOut(auth);
      setMessage("👋 로그아웃 되었습니다.");
    } catch (error) {
      console.error("로그아웃 오류: ", error);
      setMessage("❌ 로그아웃 실패.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md space-y-4">
      <h1 className="text-2xl font-bold mb-4">Firestore 테스트</h1>

      {auth?.currentUser ? ( // ✅ null-safe
        <div className="space-y-2">
          <p>현재 사용자: {auth.currentUser.email}</p>
          <button
            onClick={addPost}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            포스트 추가
          </button>
          <button
            onClick={handleSignOut}
            className="ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            로그아웃
          </button>
        </div>
      ) : (
        <p className="text-gray-600">로그인되지 않았습니다.</p>
      )}

      <p className="text-green-700">{message}</p>

      <div>
        <h2 className="text-xl font-semibold mt-6 mb-2">📄 포스트 목록</h2>
        {data.length > 0 ? (
          data.map((post, index) => (
            <div
              key={index}
              className="border p-3 rounded mb-2 bg-white shadow-sm"
            >
              <p>{post.text}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">아직 포스트가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default FirestoreTest;
