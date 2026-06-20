// ===========================================================================
// src/firebase/reminders.js
// PERSISTENCE ONLY — read/write reminder records in Firestore.
// A reminder has a TYPE: "dob" or "tamil".
//   dob:   { type:'dob',   label, day, month, year(optional), alertMessage }
//   tamil: { type:'tamil', label, tamilMonth, tamilStar,      alertMessage }
// We store the DEFINITION (not a fixed date) so it recurs every year forever.
// ===========================================================================

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./config";

// Stored under users/{uid}/reminders (rules already protect users/{uid}/**).
export async function addReminder(uid, data) {
  return addDoc(collection(db, "users", uid, "reminders"), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function listReminders(uid) {
  const q = query(
    collection(db, "users", uid, "reminders"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteReminder(uid, id) {
  return deleteDoc(doc(db, "users", uid, "reminders", id));
}
