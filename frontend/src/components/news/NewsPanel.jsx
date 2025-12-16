import { useEffect, useState } from "react";
import { fetchGoogleNews } from "../../utils/news.js";
import "../../styles/news.css";

export default function NewsPanel({ symbol }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;

    setLoading(true);
    fetchGoogleNews(symbol)
      .then(setNews)
      .catch(() => setNews([]))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) {
    return <p className="news-muted">Loading news...</p>;
  }

  if (news.length === 0) {
    return <p className="news-muted">No recent news.</p>;
  }

  return (
    <ul className="news-list">
      {news.map((item) => (
        <li key={item.link} className="news-item">
          <a href={item.link} target="_blank" rel="noopener noreferrer">
            {item.title}
          </a>
          <div className="news-meta">
            <span>{item.source}</span>
            <span>{new Date(item.published).toLocaleDateString()}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
