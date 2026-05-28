export function getRoute() {
  const hash = (location.hash || "#/planner").trim();
  const route = hash.startsWith("#/") ? hash.slice(2) : "planner";
  return route || "planner";
}

export function setRoute(route) {
  location.hash = `#/${route}`;
}

export function onRouteChange(handler) {
  window.addEventListener("hashchange", handler);
}
