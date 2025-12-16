import { useEffect, useRef } from "react";


export default function TradingViewChart({ symbol }) {
  const ref = useRef(null);


  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";


    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: "D",
      timezone: "America/New_York",
      theme: "light",
      style: "1",
      allow_symbol_change: true,
    });


    ref.current.appendChild(script);
  }, [symbol]);


  return <div ref={ref} className="tv-container" />;
}


