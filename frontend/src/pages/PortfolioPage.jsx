// ------------------------------------------------------------
// PortfolioPage.jsx
// ------------------------------------------------------------

import { useNavigate } from "react-router-dom";
import InvestorDonutChart from "../components/InvestorDonutChart";
import "../styles/portfolio.css";

export default function PortfolioPage() {
  const navigate = useNavigate();

  // Buffett（前 8，已归一化）
  const buffettData = [
    { name: "AAPL", value: 28.22, logo: "/logos/aapl.svg" },
    { name: "AXP", value: 24.83, logo: "/logos/axp.svg" },
    { name: "BAC", value: 13.18, logo: "/logos/bac.svg" },
    { name: "KO", value: 11.91, logo: "/logos/ko.svg" },
    { name: "CVX", value: 7.92,},
    { name: "MCO", value: 5.14,},
    { name: "OXY", value: 4.70,},
    { name: "CB", value: 4.10, },
  ];

  // Pelosi（前 6）
  const pelosiData = [
    { name: "AAPL", value: 31.91, logo: "/logos/aapl.svg" },
    { name: "AMZN", value: 12.02, logo: "/logos/amzn.svg" },
    { name: "GOOGL", value: 18.84, logo: "/logos/googl.svg" },
    { name: "CRM", value: 9.02, logo: "/logos/crm.svg" },
    { name: "MSFT", value: 13.18,logo: "/logos/msft.svg" },
    { name: "NVDA", value: 15.03,logo: "/logos/nvda.svg" },
  ];

  // Cathie Wood（前 6）
  const woodData = [
    { name: "TSLA", value: 29.50, logo: "/logos/tsla.svg" },
    { name: "ROKU", value: 14.81, logo: "/logos/roku.svg" },
    { name: "SHOP", value: 14.69, logo: "/logos/shop.svg" }, 
    { name: "PLTR", value: 13.75, logo: "/logos/pltr.svg" },
    { name: "AMD", value: 12.12, logo: "/logos/amd.svg" },
    { name: "COIN", value: 15.11, logo: "/logos/coin.svg" },
  ];

  return (
    <div className="portfolio-page">
      <h2>Famous Portfolios 名人持仓</h2>
      <p className="subtitle">
        Compare how top investors allocate capital.
      </p>

      <div className="portfolio-grid">
        {/* Buffett */}
        <div className="portfolio-card">
          <h3> Warren Buffett</h3>
          <div className="ytd-return">
    YTD&nbsp;
    <span className="ytd-positive">+10.44%</span>
  </div>    

          <InvestorDonutChart
            data={buffettData}
            avatar="/avatars/buffett.png"
          />
          <ul className="holding-list">
            {buffettData.map((i) => (
    <li
      key={i.name}
      className="holding-item"
      onClick={() => navigate(`/stock/${i.name.toLowerCase()}`)}
    >
      <span className="holding-symbol">{i.name}</span>
      <span className="holding-value">{i.value.toFixed(2)}%</span>
    </li>
  ))}
</ul>

        </div>

        {/* Pelosi */}
        <div className="portfolio-card">
          <h3> Nancy Pelosi</h3>
          <div className="ytd-return">
    YTD&nbsp;
    <span className="ytd-positive">+15.68%</span>
  </div>    
          <InvestorDonutChart
            data={pelosiData}
            avatar="/avatars/pelosi.png"
          />
          <ul className="holding-list">
            {pelosiData.map((i) => (
              <li
      key={i.name}
      className="holding-item"
      onClick={() => navigate(`/stock/${i.name.toLowerCase()}`)}
    >
  <span className="holding-symbol">{i.name}</span>
  <span className="holding-value">{i.value.toFixed(2)}%</span>
</li>

            ))}
          </ul>
        </div>

        {/* Cathie Wood */}
        <div className="portfolio-card">
          <h3> Cathie Wood</h3>
          <div className="ytd-return">
    YTD&nbsp;
    <span className="ytd-positive">+29.67%</span>
  </div>    
          <InvestorDonutChart
            data={woodData}
            avatar="/avatars/wood.png"
          />
          <ul className="holding-list">
            {woodData.map((i) => (
             <li
      key={i.name}
      className="holding-item"
      onClick={() => navigate(`/stock/${i.name.toLowerCase()}`)}
    >
  <span className="holding-symbol">{i.name}</span>
  <span className="holding-value">{i.value.toFixed(2)}%</span>
</li>

            ))}
          </ul>
        </div>
      </div>

      {/* Your portfolio */}
      <div className="your-portfolio">
        <h2>Your Portfolio 你的投资组合</h2>
        <p>Build and track your own portfolio in a dedicated page.</p>
        <button
          className="primary-btn"
          onClick={() => navigate("/myportfolio")}
        >
          Go to My Portfolio
        </button>
      </div>
    </div>
  );
}
