const API = import.meta.env.VITE_API_URL;

async function handleJsonError(res, defaultMsg) {
  let msg = `${defaultMsg} (status ${res.status})`;
  try {
    const data = await res.json();
    if (data && data.error) msg = data.error;
  } catch (_) {}
  throw new Error(msg);
}

export async function login(email, password) {
  const res = await fetch(`${API}/api/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) return handleJsonError(res, "Login failed");
  return await res.json();
}

export async function register(email, password) {
  const res = await fetch(`${API}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) return handleJsonError(res, "Register failed");
  return await res.json();
}
