/**
 * API Routes
 * Endpoints for stock screening, analysis, and market data
 */

const express = require('express');
const router = express.Router();
const { getStockData, getMultipleStocks, getNifty50Data } = require('../services/stockDataService');
const { calculateIndicators } = require('../services/technicalAnalysis');
const { calculateScore, screenStocks } = require('../services/scoringEngine');
const { stockList, getSectors, getStocksBySector, getStockInfo } = require('../services/stockList');

// Indian Stock Market API for real-time data
const {
    getRealTimeStock,
    getMultipleRealTimeStocks,
    searchStocks,
    getNifty50Status,
    checkAPIHealth
} = require('../services/indianStockAPI');

/**
 * GET /api/screen
 * Screen all stocks and return ranked list
 */
router.get('/screen', async (req, res) => {
    try {
        const { sector, minScore = 5, limit = 50 } = req.query;

        // Get stocks to screen
        let stocks = sector ? getStocksBySector(sector) : stockList;

        // Screen all stocks (increased limit to cover Large Cap + Mid Cap)
        const stocksToScreen = stocks.slice(0, 250);

        console.log(`Screening ${stocksToScreen.length} stocks...`);

        // Fetch data for all stocks
        const stockSymbols = stocksToScreen.map(s => s.symbol);
        const stocksData = await getMultipleStocks(stockSymbols);

        // Add stock info to data
        const stocksWithInfo = stocksData.map(s => ({
            ...s,
            ...(getStockInfo(s.symbol) || {})
        }));

        // Screen and score
        const results = [];
        for (const stock of stocksWithInfo) {
            if (stock.data && stock.data.candles && stock.data.candles.length >= 26) {
                try {
                    const scoreResult = calculateScore(stock.data);
                    if (scoreResult.score >= parseFloat(minScore)) {
                        results.push({
                            symbol: stock.symbol,
                            name: stock.name || stock.symbol,
                            sector: stock.sector,
                            marketCap: stock.marketCap,
                            ...scoreResult
                        });
                    }
                } catch (err) {
                    console.error(`Error scoring ${stock.symbol}:`, err.message);
                }
            }
        }

        // Sort by score descending
        results.sort((a, b) => b.score - a.score);

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            screened: stocksToScreen.length,
            qualified: results.length,
            stocks: results.slice(0, parseInt(limit))
        });

    } catch (error) {
        console.error('Screening error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/stock/:symbol
 * Get detailed analysis for a single stock
 */
router.get('/stock/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const { period = '2mo' } = req.query;

        console.log(`Analyzing ${symbol}...`);

        // Fetch stock data
        const stockData = await getStockData(symbol.toUpperCase(), period);

        // Calculate indicators
        const indicators = calculateIndicators(stockData.candles);

        // Calculate score
        const scoreResult = calculateScore(stockData);

        // Get stock info
        const stockInfo = getStockInfo(symbol.toUpperCase());

        res.json({
            success: true,
            symbol: symbol.toUpperCase(),
            name: stockInfo?.name || symbol,
            sector: stockInfo?.sector || 'Unknown',
            exchange: stockData.exchange,
            currency: stockData.currency,
            currentPrice: stockData.regularMarketPrice,
            previousClose: stockData.previousClose,
            fiftyTwoWeekHigh: stockData.fiftyTwoWeekHigh,
            fiftyTwoWeekLow: stockData.fiftyTwoWeekLow,
            score: scoreResult,
            indicators: {
                rsi: indicators.rsi,
                macd: indicators.macd,
                emas: indicators.emas,
                adx: indicators.adx,
                volume: indicators.volumeAnalysis,
                trend: indicators.trendAnalysis,
                patterns: indicators.candlePatterns,
                supportResistance: indicators.supportResistance,
                bollingerBands: indicators.bollingerBands,
                atr: indicators.atr
            },
            candles: stockData.candles.slice(-30) // Last 30 candles for ~1 month chart view
        });

    } catch (error) {
        console.error(`Error analyzing ${req.params.symbol}:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/market-health
 * Get Nifty 50 market health indicator
 */
router.get('/market-health', async (req, res) => {
    try {
        const niftyData = await getNifty50Data();

        // Calculate trend
        const closes = niftyData.candles.map(c => c.close);
        const sma20 = closes.slice(-20).reduce((a, b) => a + b, 0) / 20;
        const sma50 = closes.slice(-50).reduce((a, b) => a + b, 0) / Math.min(50, closes.length);

        const currentPrice = niftyData.currentPrice;
        const isAbove20SMA = currentPrice > sma20;
        const isAbove50SMA = currentPrice > sma50;

        let marketStatus, statusEmoji;
        if (isAbove20SMA && isAbove50SMA && niftyData.changePercent > 0) {
            marketStatus = 'BULLISH';
            statusEmoji = '🟢';
        } else if (!isAbove20SMA && !isAbove50SMA && niftyData.changePercent < 0) {
            marketStatus = 'BEARISH';
            statusEmoji = '🔴';
        } else {
            marketStatus = 'NEUTRAL';
            statusEmoji = '🟡';
        }

        res.json({
            success: true,
            index: 'NIFTY 50',
            currentPrice: niftyData.currentPrice,
            previousClose: niftyData.previousClose,
            change: niftyData.change,
            changePercent: niftyData.changePercent,
            sma20,
            sma50,
            isAbove20SMA,
            isAbove50SMA,
            marketStatus,
            statusEmoji,
            recommendation: marketStatus === 'BULLISH'
                ? 'Favorable for long trades'
                : marketStatus === 'BEARISH'
                    ? 'Caution advised for new positions'
                    : 'Mixed signals - be selective'
        });

    } catch (error) {
        console.error('Market health error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/sectors
 * Get all sectors with stock count
 */
router.get('/sectors', async (req, res) => {
    try {
        const sectors = getSectors();
        const sectorData = sectors.map(sector => ({
            name: sector,
            stockCount: getStocksBySector(sector).length
        }));

        res.json({
            success: true,
            sectors: sectorData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/top-picks
 * Get top 10 stocks with highest scores
 */
router.get('/top-picks', async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Use a subset of high-liquidity stocks for faster response
        const topStocks = stockList.slice(0, 50);
        const symbols = topStocks.map(s => s.symbol);

        console.log('Fetching top picks...');
        const stocksData = await getMultipleStocks(symbols);

        const results = [];
        for (const stock of stocksData) {
            if (stock.data && stock.data.candles && stock.data.candles.length >= 26) {
                try {
                    const scoreResult = calculateScore(stock.data);
                    const stockInfo = getStockInfo(stock.symbol);
                    if (scoreResult.score >= 6) {
                        results.push({
                            symbol: stock.symbol,
                            name: stockInfo?.name || stock.symbol,
                            sector: stockInfo?.sector,
                            price: stock.data.regularMarketPrice,
                            ...scoreResult
                        });
                    }
                } catch (err) {
                    // Skip stocks with errors
                }
            }
        }

        results.sort((a, b) => b.score - a.score);

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            picks: results.slice(0, parseInt(limit))
        });

    } catch (error) {
        console.error('Top picks error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/stocks
 * Get list of all available stocks
 */
router.get('/stocks', (req, res) => {
    const { sector } = req.query;

    let stocks = sector ? getStocksBySector(sector) : stockList;

    res.json({
        success: true,
        count: stocks.length,
        stocks: stocks
    });
});

// ==========================================
// REAL-TIME DATA ENDPOINTS (Indian Stock Market API)
// ==========================================

/**
 * GET /api/realtime/:symbol
 * Get real-time stock data from Indian Stock Market API
 */
router.get('/realtime/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const { exchange = 'NSE' } = req.query;

        console.log(`Fetching real-time data for ${symbol} from ${exchange}...`);

        const data = await getRealTimeStock(symbol.toUpperCase(), exchange.toUpperCase());

        res.json({
            success: true,
            source: 'Indian Stock Market API',
            realtime: true,
            ...data
        });

    } catch (error) {
        console.error(`Real-time fetch error for ${req.params.symbol}:`, error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/realtime-batch
 * Get real-time data for multiple stocks
 */
router.get('/realtime-batch', async (req, res) => {
    try {
        const { symbols, exchange = 'NSE' } = req.query;

        if (!symbols) {
            return res.status(400).json({
                success: false,
                error: 'symbols parameter is required (comma-separated)'
            });
        }

        const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());

        console.log(`Fetching real-time data for ${symbolList.length} stocks...`);

        const results = await getMultipleRealTimeStocks(symbolList, exchange.toUpperCase());

        res.json({
            success: true,
            source: 'Indian Stock Market API',
            realtime: true,
            count: results.length,
            stocks: results
        });

    } catch (error) {
        console.error('Real-time batch error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/search
 * Search for stocks by name or symbol
 */
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'q (query) parameter is required'
            });
        }

        const results = await searchStocks(q);

        res.json({
            success: true,
            query: q,
            count: results.length,
            results: results
        });

    } catch (error) {
        console.error('Search error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/health
 * Check API health status
 */
router.get('/health', async (req, res) => {
    const indianAPIStatus = await checkAPIHealth();

    res.json({
        success: true,
        server: 'SwingTrade India API',
        status: 'running',
        timestamp: new Date().toISOString(),
        dataSources: {
            yahooFinance: { available: true, purpose: 'Historical data & Technical Analysis' },
            indianStockAPI: {
                available: indianAPIStatus.available,
                purpose: 'Real-time prices',
                message: indianAPIStatus.message
            }
        }
    });
});

module.exports = router;

