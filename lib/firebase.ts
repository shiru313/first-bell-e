import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * Firebase configuration.
 * Keep keys in env for production.
 */
const firebaseConfig = {
  apiKey: "AIzaSyDR8GMFYgN6-NAsvo3XmFEPWnnVjrGhFOc",
  authDomain: "firstbell-a0382.firebaseapp.com",
  projectId: "firstbell-a0382",
};

/**
 * Prevents multiple Firebase initializations in Next.js.
 */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

/**
 * Firestore database instance.
 */
export const db = getFirestore(app);

/**
 * Firebase authentication instance.
 */
export const auth = getAuth(app);

/**
 * Converts text into URL-friendly slug.
 */
export function slugify(text: string): string {
  return text
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}