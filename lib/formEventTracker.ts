"use client";

export function useFormEventTracker() {
  function getSessionId(): string {
    try {
      return sessionStorage.getItem("__site_session_id") || "";
    } catch {
      return "";
    }
  }

  function post(body: object): void {
    fetch("/api/log/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {});
  }

  return {
    trackStart: () => post({ sessionId: getSessionId(), eventType: "STARTED" }),
    trackFieldError: (fieldName: string) =>
      post({ sessionId: getSessionId(), eventType: "FIELD_ERROR", fieldName }),
    trackAbandoned: () => post({ sessionId: getSessionId(), eventType: "ABANDONED" }),
    trackSubmitted: () => post({ sessionId: getSessionId(), eventType: "SUBMITTED" }),
  };
}
