import { loadPersisted, savePersisted, clearPersisted } from "./persist.js";
import { enqueueOp } from "./sync.js";
const STORAGE_KEY = "smart-task-planner-v1";


const initial = {
  version: 0,
  tasks: [],
  filters: {
    q: "",
    showBlocked: false,
    minPriority: 1
  },
  ui: {
    loading: true,
    error: null,
    tips: [],
    online: navigator.onLine,
    syncing: false,
    syncError: null
  },
  syncQueue: [],
  lastResult: null,
};

export function createStore() {
  const persisted = loadPersisted();
  let state = persisted
    ? { ...initial, ...persisted, ui: { ...initial.ui, ...persisted.ui, loading: true, error: null } }
    : { ...initial };

  const listeners = new Set();

  function getState() {
    return state;
  }

  function persist(next) {
    // Persist only stable parts (not transient loading/errors)
    const toSave = {
      version: next.version,
      tasks: next.tasks,
      filters: next.filters,
      syncQueue: next.syncQueue,
      lastResult: next.lastResult,
      ui: { ...next.ui, loading: false, error: null } // do not persist loading/error
    };
    savePersisted(toSave);
  }

  function dispatch(action) {
    const prev = state;
    const next = reducer(prev, action);
    state = next;
    persist(next);
    listeners.forEach(fn => fn(state, action));
  }

  function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function resetAll() {
    clearPersisted();
    state = { ...initial, ui: { ...initial.ui, loading: false, error: null } };
    listeners.forEach(fn => fn(state, { type: "RESET" }));
  }

  return { getState, dispatch, subscribe, resetAll };
}

function reducer(state, action) {
  switch (action.type) {
    case "INIT_OK":
      return {
        ...state,
        version: state.version + 1,
        ui: { ...state.ui, loading: false, error: null, tips: action.tips ?? [] }
      };

    case "INIT_FAIL":
      return {
        ...state,
        version: state.version + 1,
        ui: { ...state.ui, loading: false, error: action.error ?? "Init failed" }
      };

    case "ONLINE_SET":
      return {
        ...state,
        version: state.version + 1,
        ui: { ...state.ui, online: action.online }
      };

    case "FILTER_SET":
      return {
        ...state,
        version: state.version + 1,
        filters: { ...state.filters, ...action.patch }
      };

    case "TASK_ADD": {
  const task = action.task;

  // 🔴 FIX: normalise deadline into ISO datetime
  let deadlineISO = null;
  if (task.deadline) {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    deadlineISO = new Date(`${today}T${task.deadline}`).toISOString();
  }

  const normalisedTask = {
    ...task,
    deadlineISO
  };

  const nextTasks = [...state.tasks, normalisedTask];

  // record change for sync simulation
  const withQueue = enqueueOp(state, {
    type: "TASK_ADD",
    taskId: normalisedTask.id,
    at: Date.now()
  });

  return {
    ...withQueue,
    version: state.version + 1,
    tasks: nextTasks
  };
}

    case "TASK_DELETE": {
      const id = action.taskId;
      // remove task + remove id from all dependencies
      const kept = state.tasks.filter(t => t.id !== id).map(t => ({
        ...t,
        dependsOn: (t.dependsOn ?? []).filter(dep => dep !== id),
      }));
      const withQueue = enqueueOp(state, { type: "TASK_DELETE", taskId: id, at: Date.now() });
      return { ...withQueue, version: state.version + 1, tasks: kept };
    }

    case "TASK_REORDER": {
      // action.orderedIds is full list order
      const byId = new Map(state.tasks.map(t => [t.id, t]));
      const reordered = action.orderedIds.map(id => byId.get(id)).filter(Boolean);
      const withQueue = enqueueOp(state, { type: "TASK_REORDER", at: Date.now() });
      return { ...withQueue, version: state.version + 1, tasks: reordered };
    }

    case "SCHEDULE_SET":
      return { ...state, version: state.version + 1, lastResult: action.result };

    case "SYNC_START":
      return { ...state, version: state.version + 1, ui: { ...state.ui, syncing: true, syncError: null } };

    case "SYNC_OK":
      return {
        ...state,
        version: state.version + 1,
        syncQueue: [],
        ui: { ...state.ui, syncing: false, syncError: null }
      };

    case "SYNC_FAIL":
      return {
        ...state,
        version: state.version + 1,
        ui: { ...state.ui, syncing: false, syncError: action.error ?? "Sync failed" }
      };

   case "CLEAR_TASKS":
  return {
    ...state,
    tasks: [],
    lastResult: null
  };

}


    
      return state;
  }
  

