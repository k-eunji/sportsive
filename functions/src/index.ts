// functions/src/index.ts

import * as admin from "firebase-admin";
import express, { Request, Response, NextFunction } from "express";
import { onRequest } from "firebase-functions/v2/https";
import cors from "cors";

interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

admin.initializeApp();
const db = admin.firestore();

const app = express();


// ----------------------------
// 기본 루트 (상태 확인용)
// ----------------------------
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Hello Sportsive API is running 🚀");
});


// ----------------------------
// CORS 처리 (모든 origin 허용, preflight 자동 처리)
// ----------------------------
app.use(cors({ origin: true }));
app.use(express.json());

// ----------------------------
// 헬퍼: userId 배열로 유저 정보 가져오기
// ----------------------------
async function fetchUsers(
  ids: string[]
): Promise<
  { userId: string; authorNickname: string; authorPhotoURL?: string | null }[]
> {
  const users = await Promise.all(
    ids.map(async (id) => {
      const snap = await db.collection("users").doc(id).get();
      if (!snap.exists) return null;
      const data = snap.data() || {};
      return {
        userId: snap.id,
        authorNickname: data.authorNickname || "Unknown",
        authorPhotoURL: data.authorPhotoURL || null,
      };
    })
  );
  return users.filter(Boolean) as {
    userId: string;
    authorNickname: string;
    authorPhotoURL?: string | null;
  }[];
}

// ----------------------------
// POST /toggleFollow
// ----------------------------
// POST /toggleFollow
app.post(
  "/toggleFollow",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { currentUserId, targetUserId } = req.body;
      if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
        res.status(400).json({ error: "Invalid request" });
        return;
      }

      const [currentSnap, targetSnap] = await Promise.all([
        db.collection("users").doc(currentUserId).get(),
        db.collection("users").doc(targetUserId).get(),
      ]);

      if (!currentSnap.exists || !targetSnap.exists) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const currentFollowing: string[] = currentSnap.data()?.following as string[] || [];
      const targetFollowers: string[] = targetSnap.data()?.followers as string[] || [];
      const isFollowing = currentFollowing.includes(targetUserId);

      const batch = db.batch();
      batch.update(db.collection("users").doc(currentUserId), {
        following: isFollowing
          ? admin.firestore.FieldValue.arrayRemove(targetUserId)
          : admin.firestore.FieldValue.arrayUnion(targetUserId),
      });
      batch.update(db.collection("users").doc(targetUserId), {
        followers: isFollowing
          ? admin.firestore.FieldValue.arrayRemove(currentUserId)
          : admin.firestore.FieldValue.arrayUnion(currentUserId),
      });

      await batch.commit();

      // followers 배열 반환
      const updatedFollowers = isFollowing
        ? targetFollowers.filter(uid => uid !== currentUserId)
        : [...targetFollowers, currentUserId];

      res.json({
        following: !isFollowing,
        followers: updatedFollowers,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);


// ----------------------------
// GET /getUserProfile
// ----------------------------
interface UserIdQuery {
  userId: string;
}

app.get(
  "/getUserProfile",
  async (
    req: Request<
      Record<string, never>,
      Record<string, never>,
      unknown,
      UserIdQuery
    >,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.query.userId;
      if (!userId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }

      const snap = await db.collection("users").doc(userId).get();
      if (!snap.exists) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const data = snap.data() || {};
      res.json({
        userId: snap.id,
        authorNickname: data.authorNickname || "Unknown",
        authorPhotoURL: data.authorPhotoURL || null,
        followers: data.followers || [],
        following: data.following || [],
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: (err as Error).message });
    }
  }
);

// ----------------------------
// GET /getFollowers
// ----------------------------
app.get(
  "/getFollowers",
  async (
    req: Request<
      Record<string, never>,
      Record<string, never>,
      unknown,
      UserIdQuery
    >,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.query.userId;
      if (!userId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }

      const snap = await db.collection("users").doc(userId).get();
      if (!snap.exists) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const data = snap.data() || {};
      const followers = await fetchUsers(data.followers || []);
      res.json({ followers });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: (err as Error).message });
    }
  }
);

// ----------------------------
// GET /getFollowing
// ----------------------------
app.get(
  "/getFollowing",
  async (
    req: Request<
      Record<string, never>,
      Record<string, never>,
      unknown,
      UserIdQuery
    >,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.query.userId;
      if (!userId) {
        res.status(400).json({ error: "userId is required" });
        return;
      }

      const snap = await db.collection("users").doc(userId).get();
      if (!snap.exists) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const data = snap.data() || {};
      const following = await fetchUsers(data.following || []);
      res.json({ following });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: (err as Error).message });
    }
  }
);

// functions/src/index.ts

app.post("/removeFollower", async (req: Request, res: Response) => {
  try {
    const { currentUserId, targetUserId } = req.body;
    if (!currentUserId || !targetUserId) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    const batch = db.batch();
    // 내 followers 배열에서 제거
    batch.update(db.collection("users").doc(currentUserId), {
      followers: admin.firestore.FieldValue.arrayRemove(targetUserId),
    });
    // 상대방 following 배열에서도 제거
    batch.update(db.collection("users").doc(targetUserId), {
      following: admin.firestore.FieldValue.arrayRemove(currentUserId),
    });

    await batch.commit();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /hidePost
app.post("/hidePost", async (req: Request, res: Response) => {
  try {
    const { postId, userId } = req.body;
    if (!postId || !userId) {
      res.status(400).json({ error: "postId and userId are required" });
      return;
    }

    const postRef = db.collection("posts").doc(postId);

    await postRef.update({
      hiddenBy: admin.firestore.FieldValue.arrayUnion(userId)
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /unhidePost
app.post("/unhidePost", async (req: Request, res: Response) => {
  try {
    const { postId, userId } = req.body;
    if (!postId || !userId) {
      res.status(400).json({ error: "postId and userId are required" });
      return;
    }

    const postRef = db.collection("posts").doc(postId);

    await postRef.update({
      hiddenBy: admin.firestore.FieldValue.arrayRemove(userId)
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// functions/src/index.ts

// GET /getHiddenPosts
app.get("/getHiddenPosts", async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    const snap = await db.collection("posts").where("hiddenBy", "array-contains", userId).get();
    const hiddenPosts = snap.docs.map(doc => doc.id);

    res.json({ hiddenPosts });
  } catch (err) {
    console.error("getHiddenPosts error", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ----------------------------
// 인증 미들웨어
// ----------------------------
const validateFirebaseIdToken = async (req: any, res: Response, next?: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    req.user = decodedToken;
    if (next) next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Unauthorized" });
  }
};

// ----------------------------
// 서브컬렉션 삭제 헬퍼
// ----------------------------
async function deleteCollectionDocs(collectionRef: FirebaseFirestore.CollectionReference) {
  const snapshot = await collectionRef.get();
  if (snapshot.empty) return;

  const batchSize = 500;
  let batch = db.batch();
  let count = 0;

  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
    count++;
    if (count === batchSize) {
      batch.commit();
      batch = db.batch();
      count = 0;
    }
  });
  await batch.commit();
}

// ----------------------------
// DELETE ROOM
// ----------------------------
app.post("/deleteRoom", validateFirebaseIdToken, async (req: Request, res: Response) => {
  const requesterId = (req as AuthenticatedRequest).user?.uid;
  if (!requesterId) return res.status(401).json({ error: "Unauthorized" });

  const { matchId } = req.body;
  if (!matchId) return res.status(400).json({ error: "matchId required" });

  const matchRef = db.collection("matches").doc(matchId);
  const matchSnap = await matchRef.get();
  if (!matchSnap.exists) return res.status(404).json({ error: "Not found" });
  if (matchSnap.data()?.creatorId !== requesterId)
    return res.status(403).json({ error: "Only creator can delete" });

  await deleteCollectionDocs(matchRef.collection("participants"));
  await deleteCollectionDocs(matchRef.collection("messages"));
  await matchRef.delete();

  res.json({ success: true });
});

// ----------------------------
// Firebase v2 export
// ----------------------------
export const api = onRequest(app);

export { openReviewsAfterMeetup } from "./openReviews";
export * from "./momvoteScheduler";
