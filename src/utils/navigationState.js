const NAV_STATE_KEY = "madadgaar_nav_state";

export function setNavigationState(state) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(NAV_STATE_KEY, JSON.stringify(state ?? {}));
}

export function consumeNavigationState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(NAV_STATE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(NAV_STATE_KEY);
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getNavigationStateSnapshot() {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(NAV_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function pushWithState(router, path, state) {
  setNavigationState(state);
  router.push(path);
}

export function replaceWithState(router, path, state) {
  setNavigationState(state);
  router.replace(path);
}
