// ===========================================================================
// src/firebase/userProfile.js
//
// Manages the user profile document at users/{uid}.
//
// Firestore currently holds reminders at users/{uid}/reminders/{id}, but no
// document exists at users/{uid} itself — Firestore permits a subcollection
// under an absent parent. This file creates that parent.
//
// The parent stores what Phase 2's scheduled function needs:
//   email        — where the daily digest is sent
//   notifyByEmail — whether the user wants it
//
// Reminder data is untouched here; reminders.js still owns that.
// ===========================================================================

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

// Written on a user's FIRST sign-in only. Because upsert below reads before
// it writes, changing this later affects new users only — existing Firestore
// documents keep whatever they were given.
const NOTIFY_BY_EMAIL_DEFAULT = true;

// The path users/{uid} written once rather than in four places.
function profileRef(uid) {
  return doc(db, "users", uid);
}

// ---------------------------------------------------------------------------
// upsertUserProfile — runs on every sign-in (wired up in Step 4).
//
// Reads before deciding whether to create or update. That read is the whole
// point: a plain setDoc() on each sign-in would rewrite notifyByEmail to the
// default every time, silently re-enabling email for someone who had turned
// it off. The read costs one document fetch per sign-in — negligible, and it
// is what makes the preference durable.
// ---------------------------------------------------------------------------
export async function upsertUserProfile(user) {
  if (!user?.uid) return null;

  const ref = profileRef(user.uid);
  const snap = await getDoc(ref);

  // First sign-in — no document. Create it, default included.
  if (!snap.exists()) {
    const profile = {
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      notifyByEmail: NOTIFY_BY_EMAIL_DEFAULT,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, profile);
    return profile;
  }

  // Returning user — refresh identity fields in case the Google account or
  // display name changed. notifyByEmail is deliberately absent from this
  // update, so the user's own choice survives.
  await updateDoc(ref, {
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    updatedAt: serverTimestamp(),
  });

  return snap.data();
}

// ---------------------------------------------------------------------------
// getUserProfile — plain read. Used in Step 7 so the toggle renders in the
// correct position. Returns null when no document exists.
// ---------------------------------------------------------------------------
export async function getUserProfile(uid) {
  if (!uid) return null;
  const snap = await getDoc(profileRef(uid));
  return snap.exists() ? snap.data() : null;
}

// ---------------------------------------------------------------------------
// setNotifyByEmail — called when the user flips the toggle (Step 7).
// Boolean() guards against a handler passing a string or undefined, which
// would store a non-boolean and break the Phase 2 query.
// ---------------------------------------------------------------------------
export async function setNotifyByEmail(uid, enabled) {
  if (!uid) return;
  await updateDoc(profileRef(uid), {
    notifyByEmail: Boolean(enabled),
    updatedAt: serverTimestamp(),
  });
}
