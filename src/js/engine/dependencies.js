// js/engine/dependencies.js

/**
 * Graph: Map(taskId -> array of dependencyIds)
 */
export function buildDependencyGraph(tasks) {
  const ids = new Set(tasks.map(t => t.id));
  const graph = new Map();
  for (const t of tasks) {
    const deps = (t.dependsOn ?? []).filter(d => ids.has(d));
    graph.set(t.id, deps);
  }
  return graph;
}

export function hasCycle(graph) {
  // DFS color marking: 0 unvisited, 1 visiting, 2 visited
  const color = new Map();
  for (const node of graph.keys()) color.set(node, 0);

  function dfs(u) {
    color.set(u, 1);
    for (const v of graph.get(u) ?? []) {
      const c = color.get(v) ?? 0;
      if (c === 1) return true;
      if (c === 0 && dfs(v)) return true;
    }
    color.set(u, 2);
    return false;
  }

  for (const node of graph.keys()) {
    if ((color.get(node) ?? 0) === 0) {
      if (dfs(node)) return true;
    }
  }
  return false;
}

/**
 * Dependencies satisfied if:
 * - dependency is already marked "done", OR
 * - dependency taskId is already placed in current schedule.
 */
export function depsSatisfied(task, allTasks, placedSet) {
  const deps = task.dependsOn ?? [];
  if (deps.length === 0) return true;

  const byId = new Map(allTasks.map(t => [t.id, t]));
  for (const depId of deps) {
    const dep = byId.get(depId);
    if (!dep) continue; // unknown dep ignored
    if (dep.status === "done") continue;
    if (!placedSet.has(depId)) return false;
  }
  return true;
}
