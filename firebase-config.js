// ════════════════════════════════════════════════════════════
//  firebase-config.js
//  Apna Firebase project config yahan paste karo
//  Console → Project Settings → Your Apps → Web App → Config
// ════════════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ⬇️  APNA CONFIG YAHAN PASTE KARO
const firebaseConfig = {
  apiKey:            "AIzaSy_PASTE_YOUR_KEY_HERE",
  authDomain:        "your-project.firebaseapp.com",
  projectId:         "your-project-id",
  storageBucket:     "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abcdef123456"
};

const app  = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

export { app, auth, db };
