// ===========================================================================
// src/firebase/reminders.js
// PERSISTENCE ONLY — read/write reminder records in Firestore.
// A reminder has a TYPE: "dob" or "tamil".
//   dob:   { type:'dob', occasion, label, day, month, year(optional), alertMessage }
//   tamil: { type:'tamil', label, tamilMonth, tamilStar, alertMessage }
// We store the DEFINITION (not a fixed date) so it recurs every year forever.
// ===========================================================================

import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./config";

// Add a new reminder.
export async function addReminder(uid, data) {
  return addDoc(collection(db, "users", uid, "reminders"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

// List all reminders (most recently added first).
export async function listReminders(uid) {
  const q = query(
    collection(db, "users", uid, "reminders"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Get a single reminder by id (for editing).
export async function getReminder(uid, id) {
  const snap = await getDoc(doc(db, "users", uid, "reminders", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Update an existing reminder. `data` replaces the editable fields.
export async function updateReminder(uid, id, data) {
  return updateDoc(doc(db, "users", uid, "reminders", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Delete one reminder.
export async function deleteReminder(uid, id) {
  return deleteDoc(doc(db, "users", uid, "reminders", id));
}
