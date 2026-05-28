export function enqueueOp(state, op) {
  return { ...state, syncQueue: [...state.syncQueue, op] };
}

export async function flushQueueSimulated(queue, { signal } = {}) {
  // Simulate network latency + concurrency-safe async workflow
  await new Promise((resolve, reject) => {
    const t = setTimeout(resolve, 700);
    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(t);
        reject(new Error("Sync aborted"));
      });
    }
  });
  // Pretend server accepted everything
  return { ok: true, applied: queue.length };
}
