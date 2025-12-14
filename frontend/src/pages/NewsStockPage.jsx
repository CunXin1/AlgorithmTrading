import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchGoogleNews } from "../utils/news";
import "../styles/newspage.css";
import { useWatchlist } from "../context/WatchlistContext";

export default function NewsStockPage() {
    const { symbol } = useParams();

    const [fedNews, setFedNews] = useState([]);
    const [trendingNews, setTrendingNews] = useState([]);
    const [stockNews, setStockNews] = useState([]);
    const [search, setSearch] = useState(symbol || "");

    const { watchlist, add, remove } = useWatchlist();

    useEffect(() => {
        fetchGoogleNews("Federal Reserve Jerome Powell").then(setFedNews);
        fetchGoogleNews("Nasdaq 100 OR Bitcoin BTC").then(setTrendingNews);
    }, []);

    // 当 symbol 改变时，重新拉该股票新闻
    useEffect(() => {
        if (!symbol) return;
        setSearch(symbol);
        fetchGoogleNews(symbol).then(setStockNews);
    }, [symbol]);

    function formatDate(dateStr) {
        if (!dateStr) return "";
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US");
    }

    function normalizeSymbol(input) {
        return (input || "").trim().toUpperCase();
    }

    function handleSearchSubmit(e) {
        e.preventDefault();
        const sym = normalizeSymbol(search);
        if (!sym) return;
        window.location.href = `/news/${sym}`;
    }

    function handleAddWatchlist() {
        const sym = normalizeSymbol(search);
        if (!sym) return;
        add(sym);
    }

    return (
        <div className="news-page">
            <div className="news-container">

                {/* ===== Fed News ===== */}
                <div className="fed-wrapper">
                    <div className="news-block fed-block">
                        <div className="fed-left">
                            <img
                                src="/avatars/powell.png"
                                alt="Jerome Powell"
                            />
                        </div>

                        <div className="fed-right">
                            <h2>Fed News</h2>

                            {fedNews.map((n, i) => (
                                <div key={i} className="news-item">
                                    <a href={n.link} target="_blank" rel="noreferrer">
                                        {n.title}
                                    </a>
                                    <div className="news-meta">
                                        {n.source} · {formatDate(n.published)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ===== Search Bar ===== */}
                <div className="fed-search-wrapper">
                    <form
                        className="news-search-bar"
                        onSubmit={handleSearchSubmit}
                    >
                        <input
                            type="text"
                            placeholder="Search Stock"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <button type="submit" className="search-btn">
                            Search
                        </button>

                        <button
                            type="button"
                            className="watchlist-btn"
                            onClick={handleAddWatchlist}
                        >
                            + Watchlist
                        </button>
                    </form>
                </div>

                {/* ===== 下半区 ===== */}
                <div className="news-lower">

                    {/* 左侧新闻 */}
                    <div className="news-left">
                        <div className="news-block trending-block">
                            <h2>Trending News</h2>
                            {trendingNews.map((n, i) => (
                                <div key={i} className="news-item">
                                    <a href={n.link} target="_blank" rel="noreferrer">
                                        {n.title}
                                    </a>
                                    <div className="news-meta">
                                        {n.source} · {formatDate(n.published)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="news-block picks-block">
                            <h2>{normalizeSymbol(symbol)} News</h2>
                            {stockNews.map((n, i) => (
                                <div key={i} className="news-item">
                                    <a href={n.link} target="_blank" rel="noreferrer">
                                        {n.title}
                                    </a>
                                    <div className="news-meta">
                                        {n.source} · {formatDate(n.published)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 右侧 */}
                    <div className="news-right">
                        <div className="news-block">
                            <h2>My Watchlist</h2>

                            {watchlist.length === 0 && (
                                <div className="watchlist-empty">No stocks yet</div>
                            )}

                            {watchlist.map((sym) => (
                                <div key={sym} className="watchlist-row">
                                    <span
                                        className="watchlist-item"
                                        onClick={() => (window.location.href = `/news/${sym}`)}
                                    >
                                        {sym}
                                    </span>
                                    <span
                                        className="watchlist-remove"
                                        onClick={() => remove(sym)}
                                    >
                                        ×
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="news-block">
                            <h2>Trending Stocks</h2>
                            {["TSLA", "HOOD", "PLTR"].map((sym) => (
                                <div
                                    key={sym}
                                    className="recommend-item"
                                    onClick={() => (window.location.href = `/news/${sym}`)}
                                >
                                    {sym}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
