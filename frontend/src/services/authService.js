const API = import.meta.env.VITE_API_URL;

export async function login(email, password) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed");

  return await res.json();
}

export async function register(email, password) {
  const res = await fetch(`${API}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  // ✅ 如果失败，尽量把后端返回的错误 message 提取出来
  if (!res.ok) {
    let errorMessage = `Register failed (status ${res.status})`;

    try {
      const data = await res.json();       // 尝试解析为 JSON
      if (data && data.message) {
        errorMessage = data.message;       // 后端如果有 message，就用它
      }
    } catch (e) {
      // 如果不是 JSON，就退回用 text
      try {
        const text = await res.text();
        if (text) errorMessage = text;
      } catch (_) {}
    }

    throw new Error(errorMessage);
  }

  return await res.json();
}