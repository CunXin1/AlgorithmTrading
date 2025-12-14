import React, { useEffect, useMemo, useState } from "react";
import { fetchGoogleNews } from "../../utils/news";
import { useWatchlist } from "../../context/WatchlistContext";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US");
}

export default function MyNewsBlock() {
  const { watchlist } = useWatchlist();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  // query：watchlist 前 3 个 + 兜底关键词
  const query = useMemo(() => {
    const top = (watchlist || []).slice(0, 3);
    if (top.length === 0) return "market OR finance OR earnings";
    return `${top.join(" OR ")} OR market OR finance OR earnings`;
  }, [watchlist]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchGoogleNews(query)
      .then((data) => {
        if (cancelled) return;
        setNews(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (cancelled) return;
        setNews([]);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <div className="dash-card">
      <div className="dash-card-header">
        <h3 className="dash-card-title">News for You</h3>
        <div className="dash-badge">Query: {query}</div>
      </div>

      {loading ? (
        <div className="dash-empty">Loading news…</div>
      ) : news.length === 0 ? (
        <div className="dash-empty">No news found.</div>
      ) : (
        <ul className="news-list">
          {news.map((n, i) => (
            <li key={i} className="news-row">
              <a className="news-link" href={n.link} target="_blank" rel="noreferrer">
                {n.title}
              </a>
              <div className="news-meta">
                {n.source} · {formatDate(n.published)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
