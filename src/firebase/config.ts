'use client';

/**
 * @fileOverview Firebase configuration object.
 * ค่าเหล่านี้ควรถูกดึงมาจาก Environment Variables ในไฟล์ .env
 * โปรดตรวจสอบให้แน่ใจว่าได้ระบุค่าที่ถูกต้องใน Firebase Console
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""
};

/**
 * ตรวจสอบว่ามีการระบุ API Key หรือไม่
 */
export const isFirebaseConfigured = () => {
  return !!firebaseConfig.apiKey && firebaseConfig.apiKey !== "";
};
