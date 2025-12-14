import { createContext, useContext, useEffect, useState } from "react";

const WatchlistContext = createContext();

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState([]);

  // 初始化（localStorage fallback + 后端同步）
  useEffect(() => {
    // 1️⃣ localStorage 兜底
    const saved = JSON.parse(localStorage.getItem("watchlist") || "[]");
    if (Array.isArray(saved)) {
      setWatchlist(saved);
    }

    // 2️⃣ 后端同步（已登录用户）
    fetch("/api/news/watchlist/", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then((serverList) => {
        if (Array.isArray(serverList)) {
          setWatchlist(serverList);
          localStorage.setItem(
            "watchlist",
            JSON.stringify(serverList)
          );
        }
      })
      .catch(() => {
        // 未登录 / 后端不可用 → 继续使用 localStorage
      });
  }, []);

  // 同步 localStorage
  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
  }, [watchlist]);

  // ✅ 自动大写 + 去空格（唯一入口）
  function add(symbol) {
    const sym = String(symbol).trim().toUpperCase();
    if (!sym) return;

    setWatchlist((prev) =>
      prev.includes(sym) ? prev : [...prev, sym]
    );
  }

  function remove(symbol) {
    const sym = String(symbol).trim().toUpperCase();

    setWatchlist((prev) => prev.filter((s) => s !== sym));
  }

  return (
    <WatchlistContext.Provider value={{ watchlist, add, remove }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  return useContext(WatchlistContext);
}
