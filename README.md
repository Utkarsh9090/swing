# SwingTrade India - Stock Screener 📈

A powerful swing trading assistant tailored for the Indian Stock Market. This tool automates technical analysis to identify high-probability trading setups using a multi-factor scoring engine.

## 🚀 Key Features

*   **Smart Scoring Engine**: Evaluates stocks on a 0-10 scale using 10+ technical indicators (RSI, MACD, ADX, Trend, Volume, etc.) to identify "Strong Buy" opportunities.
*   **Automated Trade Setups**: Instantly generates precise Entry, Target (1:2 & 1:3 R:R), and Stop Loss levels based on Volatility (ATR) and Support/Resistance zones.
*   **Interactive Dashboard**: Real-time monitoring of NIFTY 50, with intuitive filters for Market Cap, Sector, and Signal strength alongside a personal Watchlist.
*   **Visual Analysis**: Integrated interactive charts (TradingView style) showing 6 months of price action with overlay indicators and signal visualizations.
*   **Comprehensive Screening**: Scans the market for Candlestick Patterns (Bullish Engulfing, Hammer, etc.) and volume anomalies to confirm trend reversals.

## 🛠️ Installation & Setup

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Start the server**:
    ```bash
    npm run dev
    ```
3.  **Open in browser**:
    Visit `http://localhost:3000`

## 🏗️ Tech Stack

*   **Backend**: Node.js, Express.js
*   **Frontend**: Vanilla JavaScript, CSS3, HTML5
*   **Charting**: Lightweight Charts (TradingView)
*   **Data Analysis**: TechnicalIndicators.js
