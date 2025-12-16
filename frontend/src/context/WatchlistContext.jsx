import { createContext, useContext, useEffect, useState } from "react";
import { getCSRFToken } from "../utils/csrf";
import { ENDPOINTS } from "../api/config";

const WatchlistContext = createContext(null);

/**
 * WatchlistProvider
 *
 * 设计原则：
 * - 单一事实来源：后端数据库
 * - 必须登录（基于 Django session）
 * - 不使用 localStorage
 * - 所有写操作必须带 CSRF
 */
export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState([]);
  const [ready, setReady] = useState(false);

  /* ------------------------------
     初始化：只从后端读取
     ------------------------------ */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(ENDPOINTS.WATCHLIST, {
          credentials: "include",
        });

        if (!res.ok) {
          // 未登录 / 403 / 302
          setWatchlist([]);
          return;
        }

        const data = await res.json();
        if (!cancelled && Array.isArray(data)) {
          setWatchlist(data);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------
     helpers
     ------------------------------ */
  function normalize(symbol) {
    return String(symbol || "").trim().toUpperCase();
  }

  /* ------------------------------
     add symbol（写数据库）
     ------------------------------ */
  async function add(symbol) {
    const sym = normalize(symbol);
    if (!sym) return;

    const res = await fetch(ENDPOINTS.WATCHLIST, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken(),
      },
      body: JSON.stringify({ symbol: sym }),
    });

    if (!res.ok) {
      // 403 / 401 / 500 → 直接放弃，不更新 UI
      return;
    }

    const data = await res.json();
    if (Array.isArray(data)) {
      // 后端返回的是权威状态
      setWatchlist(data);
    }
  }

  /* ------------------------------
     remove symbol（写数据库）
     ------------------------------ */
  async function remove(symbol) {
    const sym = normalize(symbol);
    if (!sym) return;

    const res = await fetch(ENDPOINTS.WATCHLIST, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken(),
      },
      body: JSON.stringify({ symbol: sym }),
    });

    if (!res.ok) {
      return;
    }

    const data = await res.json();
    if (Array.isArray(data)) {
      setWatchlist(data);
    }
  }

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        add,
        remove,
        ready, // 页面可以用来判断是否初始化完成
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

/* ------------------------------
   Hook
   ------------------------------ */
export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) {
    throw new Error("useWatchlist must be used within WatchlistProvider");
  }
  return ctx;
}
