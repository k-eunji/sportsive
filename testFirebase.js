import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  // 시뮬레이터용 config 넣기 (기본 Firebase config와 같음)
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// create user and write document
async function test() {
  const userCredential = await createUserWithEmailAndPassword(auth, 'test@example.com', 'password123');
  const user = userCredential.user;

  await setDoc(doc(db, 'users', user.uid), {
    email: user.email,
    authorNickname: 'tester',
    createdAt: new Date(),
  });

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  console.log(userDoc.data());
}

test();
