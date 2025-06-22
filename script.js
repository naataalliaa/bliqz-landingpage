// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const waitlistContainer = document.getElementById("waitlist");

const q = query(collection(db, "waitlist"), orderBy("createdAt"));

onSnapshot(q, (snapshot) => {
  const waitlistData = [];

  snapshot.forEach((doc) => {
    waitlistData.push({ id: doc.id, ...doc.data() });
  });

  // Sort again by createdAt timestamp just to be safe
  waitlistData.sort((a, b) => {
    const timeA = a.createdAt?.seconds || 0;
    const timeB = b.createdAt?.seconds || 0;
    return timeA - timeB;
  });

  // Calculate cumulative positions
  let cumulativeSpots = 0;
  waitlistData.forEach(user => {
    const spots = user.spots || 0;
    cumulativeSpots += spots;
    user.position = cumulativeSpots;
  });

  // Display
  waitlistContainer.innerHTML = ""; // Clear
  waitlistData.forEach(user => {
    const entry = document.createElement("p");
    entry.textContent = `${user.email} — Position: ${user.position} — Spots: ${user.spots}`;
    waitlistContainer.appendChild(entry);
  });
});
