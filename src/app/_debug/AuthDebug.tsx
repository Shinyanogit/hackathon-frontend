"use client";

import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import app from "@/lib/firebase";

export default function AuthDebug() {
  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken(true);
        // eslint-disable-next-line no-console
        console.log("[AuthDebug] UID:", user.uid);
        // eslint-disable-next-line no-console
        console.log("[AuthDebug] ID_TOKEN:", token);
      } else {
        // eslint-disable-next-line no-console
        console.log("[AuthDebug] user not signed in");
      }
    });
    return () => unsub();
  }, []);

  return null;
}
