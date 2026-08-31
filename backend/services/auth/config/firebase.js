import { initializeApp, cert } from "firebase-admin/app";

import serviceAccount from "../serviceAccount.json" with { type: "json" };  //firebase-admin ko initialize krne ke liye serviceAccount.json ka use kr rhe he

export const app = initializeApp({
  credential: cert(serviceAccount),  // Initialize Firebase Admin SDK with service account credentials
});