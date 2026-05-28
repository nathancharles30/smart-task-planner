export async function fetchTips(signal) {
  const url = `${import.meta.env.BASE_URL}tips.json`;
  const res = await fetch(url, { signal });

  if (!res.ok) throw new Error(`Tips fetch failed (${res.status})`);

  // Defensive: if server returned HTML, show a clearer error
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const preview = (await res.text()).slice(0, 60);
    throw new Error(`Expected JSON but got "${ct}". Preview: ${preview}`);
  }

  return res.json();
}
