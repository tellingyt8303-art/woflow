// ════════════════════════════════════════════════════════════
//  auth-guard.js
//  Har protected page mein include karo
//  User logged out ho toh login.html pe redirect karta hai
//  Admin page ke liye role check karta hai
// ════════════════════════════════════════════════════════════

import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { doc, getDoc }        from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ── Current user + Firestore data ───────────────────────────
export let currentUser     = null;
export let currentUserData = null;

// ── Auth state ready hone tak wait karo ─────────────────────
export function requireAuth(adminOnly = false) {
  return new Promise((resolve, reject) => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsub(); // listener hatao
      if (!user) {
        window.location.href = "login.html";
        return reject("not_logged_in");
      }

      // Firestore se user data lo
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.exists() ? snap.data() : {};
        currentUser     = user;
        currentUserData = { uid: user.uid, email: user.email, ...data };

        // Admin check
        if (adminOnly && currentUserData.role !== "admin") {
          window.location.href = "dashboard.html";
          return reject("not_admin");
        }

        resolve(currentUserData);
      } catch (e) {
        console.error("Auth guard error:", e);
        window.location.href = "login.html";
        reject(e);
      }
    });
  });
}

// ── Already logged in? Redirect away from login/signup ──────
export function redirectIfLoggedIn() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const snap = await getDoc(doc(db, "users", user.uid));
    const role = snap.exists() ? snap.data().role : "user";
    window.location.href = role === "admin" ? "admin.html" : "dashboard.html";
  });
}

// ── Logout ───────────────────────────────────────────────────
export async function logout() {
  await auth.signOut();
  window.location.href = "login.html";
}
