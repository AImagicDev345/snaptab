// localStorage helpers for the anonymous participant id tied to a session.
// Keyed by session so a single browser can be a participant in multiple rooms
// (rare but doesn't cost anything to support).

const key = (sessionId: string) => `snaptab:${sessionId}:participantId`;

export function getLocalParticipantId(sessionId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key(sessionId));
  } catch {
    return null;
  }
}

export function setLocalParticipantId(sessionId: string, participantId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(sessionId), participantId);
  } catch {
    // Storage may be disabled (private mode); the app still works without persistence.
  }
}

export function clearLocalParticipantId(sessionId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(sessionId));
  } catch {
    // no-op
  }
}
