"use client";
import { useSyncExternalStore } from "react";

export type ThemePreference = "light" | "dark" | "system";

const KEY = "gsnm-admin-theme";
let memory: ThemePreference = "system";

function preferenceSnapshot(): ThemePreference {
  try {
    const value = localStorage.getItem(KEY);
    if (value === "dark" || value === "light") return value;
  } catch {
    /* use session memory */
  }
  return memory;
}
function systemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}
function snapshot(): "light" | "dark" {
  const preference = preferenceSnapshot();
  return preference === "system" ? systemTheme() : preference;
}
function subscribe(callback: () => void) {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener("storage", callback);
  window.addEventListener("gsnm-theme", callback);
  query.addEventListener("change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("gsnm-theme", callback);
    query.removeEventListener("change", callback);
  };
}

/** Light, dark or follow the device; remembered in this browser. */
export function setThemePreference(preference: ThemePreference) {
  memory = preference;
  try {
    if (preference === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, preference);
  } catch {
    /* session memory remains available */
  }
  window.dispatchEvent(new Event("gsnm-theme"));
}

export function useAdminTheme() {
  const theme = useSyncExternalStore(
    subscribe,
    snapshot,
    () => "light" as const,
  );
  const preference = useSyncExternalStore(
    subscribe,
    preferenceSnapshot,
    () => "system" as const,
  );
  function toggleTheme() {
    setThemePreference(theme === "dark" ? "light" : "dark");
  }
  return { theme, preference, toggleTheme, setPreference: setThemePreference };
}
