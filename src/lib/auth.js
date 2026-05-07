import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
};