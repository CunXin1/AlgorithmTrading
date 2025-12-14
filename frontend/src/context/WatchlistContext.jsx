import { createContext, useContext, useEffect, useRef, useState } from "react";

const WatchlistContext = createContext(null);

/**
 * WatchlistProvider
 *
 * - 单一事实来源：后端 /api/core/watchlist/
 * - 未登录：localStorage fallback
 * - optimistic update
 * - 自动 uppercase
 */
export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState([]);
  const [ready, setReady] = useState(false); // 是否完成初始化
  const isLoggedInRef = useRef(false);

  /* ------------------------------
     初始化：后端优先，localStorage 兜底
     ------------------------------ */
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // 1️⃣ localStorage 兜底（未登录 / 首屏）
      try {
        const saved = JSON.parse(localStorage.getItem("watchlist") || "[]");
        if (Array.isArray(saved) && !cancelled) {
          setWatchlist(saved);
        }
      } catch {
        // ignore
      }

      // 2️⃣ 尝试后端（已登录）
      try {
        const res = await fetch("/api/core/watchlist/", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("not logged in");

        const serverList = await res.json();
        if (Array.isArray(serverList) && !cancelled) {
          isLoggedInRef.current = true;
          setWatchlist(serverList);
          localStorage.setItem("watchlist", JSON.stringify(serverList));
        }
      } catch {
        // 未登录 → 继续用 localStorage
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------
     同步 localStorage（仅兜底用）
     ------------------------------ */
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist, ready]);

  /* ------------------------------
     helpers
     ------------------------------ */
  function normalize(symbol) {
    return String(symbol || "").trim().toUpperCase();
  }

  /* ------------------------------
     add symbol
     ------------------------------ */
  async function add(symbol) {
    const sym = normalize(symbol);
    if (!sym) return;

    setWatchlist((prev) => {
      if (prev.includes(sym)) return prev;
      return [...prev, sym];
    });

    // 未登录 → 不打后端
    if (!isLoggedInRef.current) return;

    try {
      await fetch("/api/core/watchlist/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: sym }),
      });
    } catch {
      // 后端失败不回滚（乐观更新）
    }
  }

  /* ------------------------------
     remove symbol
     ------------------------------ */
  async function remove(symbol) {
    const sym = normalize(symbol);
    if (!sym) return;

    setWatchlist((prev) => prev.filter((s) => s !== sym));

    if (!isLoggedInRef.current) return;

    try {
      await fetch("/api/core/watchlist/", {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: sym }),
      });
    } catch {
      // ignore
    }
  }

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        add,
        remove,
        ready, // dashboard 可用来等初始化
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
