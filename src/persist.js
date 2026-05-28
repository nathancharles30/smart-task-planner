const KEY = "smart-task-planner:v2";

export function loadPersisted() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePersisted(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function clearPersisted() {
  localStorage.removeItem(KEY);
}
