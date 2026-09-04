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
//   email         — where the daily digest is sent
//   notifyByEmail — whether the user wants it
//   timezone      — so "today" resolves in the user's local time, not UTC
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

// The browser knows the user's IANA timezone (e.g. "Asia/Kolkata"). Phase 2's
// scheduled function needs it to resolve "today" in the user's own local time
// rather than UTC. Falls back to Asia/Kolkata if the browser can't report it.
function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
  } catch {
    return "Asia/Kolkata";
  }
}

// The path users/{uid} written once rather than in four places.
function profileRef(uid) {
  return doc(db, "users", uid);
}

// ---------------------------------------------------------------------------
// upsertUserProfile — runs on every sign-in and every page load with a live
// session (wired into AuthContext in Step 4).
//
// Reads before deciding whether to create or update. That read is the whole
// point: a plain setDoc() would rewrite notifyByEmail to the default every
// time, silently re-enabling email for someone who had turned it off.
//
// Note the deliberate asymmetry — timezone IS refreshed on every call because
// it is a detected fact that changes when the user moves. notifyByEmail is
// NOT, because it is a user choice that must survive.
// ---------------------------------------------------------------------------
export async function upsertUserProfile(user) {
  if (!user?.uid) return null;

  const ref = profileRef(user.uid);
  const snap = await getDoc(ref);

  // First sign-in — no document. Create it, defaults included.
  if (!snap.exists()) {
    const profile = {
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      notifyByEmail: NOTIFY_BY_EMAIL_DEFAULT,
      timezone: detectTimezone(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(ref, profile);
    return profile;
  }

  // Returning user — refresh detected fields in case the Google account,
  // display name or location changed. notifyByEmail is deliberately absent,
  // so the user's own choice survives.
  await updateDoc(ref, {
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    timezone: detectTimezone(),
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
