/**
 * Indian Stock Market API Service with Yahoo Finance Fallback
 * Primary: Free Indian Stock Market API (when available)
 * Fallback: Yahoo Finance Chart API (always available)
 * No API key required!
 */

const axios = require('axios');

// Primary API (Indian Stock Market API)
const PRIMARY_URL = 'https://military-jobye-haiqstudios-14f59639.koyeb.app';

// Fallback: Yahoo Finance Chart API (same as stockDataService)
const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

// Cache for stock data
const dataCache = new Map();
const CACHE_TTL = 60 * 1000; // 1 minute cache for real-time data

// Track API availability
let primaryAPIAvailable = false; // Start with false, check on first call
let lastPrimaryCheck = 0;
const PRIMARY_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

/**
 * Get real-time stock data from Yahoo Finance Chart API
 */
const getYahooRealtime = async (symbol, exchange = 'NSE') => {
    const suffix = exchange === 'BSE' ? '.BO' : '.NS';
    const yahooSymbol = `${symbol}${suffix}`;

    try {
        const url = `${YAHOO_CHART_URL}/${yahooSymbol}`;

        const response = await axios.get(url, {
            params: {
                range: '1d',
                interval: '1m',
                includePrePost: false
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });

        const result = response.data.chart.result[0];
        if (!result) {
            throw new Error(`No data for ${symbol}`);
        }

        const meta = result.meta;
        const quote = result.indicators?.quote?.[0] || {};

        // Get today's OHLC from the intraday data
        const timestamps = result.timestamp || [];
        const opens = quote.open || [];
        const highs = quote.high || [];
        const lows = quote.low || [];
        const closes = quote.close || [];
        const volumes = quote.volume || [];

        // Calculate day high/low from intraday data
        const validHighs = highs.filter(h => h != null);
        const validLows = lows.filter(l => l != null);
        const validVolumes = volumes.filter(v => v != null);

        const dayHigh = validHighs.length > 0 ? Math.max(...validHighs) : meta.regularMarketDayHigh;
        const dayLow = validLows.length > 0 ? Math.min(...validLows) : meta.regularMarketDayLow;
        const totalVolume = validVolumes.length > 0 ? validVolumes.reduce((a, b) => a + b, 0) : meta.regularMarketVolume;

        const lastPrice = meta.regularMarketPrice;
        const previousClose = meta.chartPreviousClose || meta.previousClose;
        const change = lastPrice - previousClose;
        const percentChange = previousClose > 0 ? ((change / previousClose) * 100) : 0;

        return {
            symbol: symbol,
            exchange: exchange,
            ticker: yahooSymbol,
            companyName: meta.shortName || meta.longName || symbol,
            lastPrice: lastPrice,
            change: parseFloat(change.toFixed(2)),
            percentChange: parseFloat(percentChange.toFixed(2)),
            previousClose: previousClose,
            open: meta.regularMarketOpen || (opens.find(o => o != null)),
            dayHigh: dayHigh,
            dayLow: dayLow,
            yearHigh: meta.fiftyTwoWeekHigh,
            yearLow: meta.fiftyTwoWeekLow,
            volume: totalVolume,
            marketCap: null, // Not available in chart API
            currency: meta.currency || 'INR',
            lastUpdate: new Date().toISOString(),
            marketState: meta.marketState,
            source: 'Yahoo Finance (Real-time)'
        };

    } catch (error) {
        console.error(`Yahoo Finance error for ${symbol}:`, error.message);
        throw error;
    }
};

/**
 * Get real-time stock data from Indian Stock Market API
 */
const getFromPrimaryAPI = async (symbol, exchange = 'NSE') => {
    const suffix = exchange === 'BSE' ? '.BO' : '.NS';
    const url = `${PRIMARY_URL}/stock?symbol=${symbol}${suffix}&res=num`;

    const response = await axios.get(url, {
        timeout: 5000,
        headers: {
            'User-Agent': 'SwingTradeIndia/1.0'
        }
    });

    if (response.data.status !== 'success') {
        throw new Error(`API returned error for ${symbol}`);
    }

    const stockData = response.data.data;

    return {
        symbol: symbol,
        exchange: exchange,
        ticker: response.data.ticker,
        companyName: stockData.company_name,
        lastPrice: stockData.last_price,
        change: stockData.change,
        percentChange: stockData.percent_change,
        previousClose: stockData.previous_close,
        open: stockData.open,
        dayHigh: stockData.day_high,
        dayLow: stockData.day_low,
        yearHigh: stockData.year_high,
        yearLow: stockData.year_low,
        volume: stockData.volume,
        marketCap: stockData.market_cap,
        peRatio: stockData.pe_ratio,
        dividendYield: stockData.dividend_yield,
        sector: stockData.sector,
        industry: stockData.industry,
        currency: stockData.currency,
        lastUpdate: stockData.last_update,
        source: 'Indian Stock Market API'
    };
};

/**
 * Get real-time stock data with automatic fallback
 * @param {string} symbol - NSE stock symbol (e.g., RELIANCE, TCS)
 * @param {string} exchange - 'NSE' or 'BSE' (default: NSE)
 */
const getRealTimeStock = async (symbol, exchange = 'NSE') => {
    const cacheKey = `${symbol}_${exchange}_realtime`;

    // Check cache first
    const cached = dataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    let data;

    // Try primary API if it was available recently
    if (primaryAPIAvailable || Date.now() - lastPrimaryCheck > PRIMARY_CHECK_INTERVAL) {
        try {
            data = await getFromPrimaryAPI(symbol, exchange);
            primaryAPIAvailable = true;
            lastPrimaryCheck = Date.now();
        } catch (error) {
            console.log(`Primary API unavailable, using Yahoo Finance for ${symbol}`);
            primaryAPIAvailable = false;
            lastPrimaryCheck = Date.now();
        }
    }

    // Fallback to Yahoo Finance
    if (!data) {
        data = await getYahooRealtime(symbol, exchange);
    }

    // Cache the data
    dataCache.set(cacheKey, {
        data: data,
        timestamp: Date.now()
    });

    return data;
};

/**
 * Get real-time data for multiple stocks
 * @param {Array} symbols - Array of stock symbols
 * @param {string} exchange - 'NSE' or 'BSE'
 */
const getMultipleRealTimeStocks = async (symbols, exchange = 'NSE') => {
    const results = [];
    const batchSize = 10; // Increased from 5 for faster loading

    for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize);
        const promises = batch.map(async (symbol) => {
            try {
                const data = await getRealTimeStock(symbol, exchange);
                return { symbol, data, error: null };
            } catch (error) {
                return { symbol, data: null, error: error.message };
            }
        });

        const batchResults = await Promise.all(promises);
        results.push(...batchResults);

        // Reduced delay between batches for faster loading
        if (i + batchSize < symbols.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    return results;
};

/**
 * Search for stocks by name or symbol
 */
const searchStocks = async (query) => {
    // Use local search from stock list
    const { stockList } = require('./stockList');
    const queryLower = query.toLowerCase();

    return stockList
        .filter(stock =>
            stock.symbol.toLowerCase().includes(queryLower) ||
            stock.name.toLowerCase().includes(queryLower)
        )
        .slice(0, 15)
        .map(stock => ({
            symbol: stock.symbol,
            companyName: stock.name,
            sector: stock.sector
        }));
};

/**
 * Get Nifty 50 index status using ^NSEI
 */
const getNifty50Status = async () => {
    try {
        const url = `${YAHOO_CHART_URL}/%5ENSEI`;

        const response = await axios.get(url, {
            params: { range: '1d', interval: '1m' },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });

        const meta = response.data.chart.result[0].meta;
        const previousClose = meta.chartPreviousClose || meta.previousClose;
        const currentPrice = meta.regularMarketPrice;
        const change = currentPrice - previousClose;
        const percentChange = previousClose > 0 ? ((change / previousClose) * 100) : 0;

        return {
            symbol: 'NIFTY 50',
            ticker: '^NSEI',
            currentPrice: currentPrice,
            previousClose: previousClose,
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(percentChange.toFixed(2)),
            marketState: meta.marketState,
            lastUpdate: new Date().toISOString()
        };

    } catch (error) {
        console.error('Error fetching Nifty 50:', error.message);
        return {
            symbol: 'NIFTY 50',
            currentPrice: null,
            change: null,
            changePercent: null,
            error: error.message
        };
    }
};

/**
 * Clear cache
 */
const clearCache = () => {
    dataCache.clear();
};

/**
 * Check API health status
 */
const checkAPIHealth = async () => {
    // Check primary API
    let primaryStatus = { available: false, message: 'Not checked' };
    try {
        await axios.get(`${PRIMARY_URL}/`, { timeout: 3000 });
        primaryStatus = { available: true, message: 'Online' };
        primaryAPIAvailable = true;
    } catch (error) {
        primaryStatus = { available: false, message: 'Unavailable - using fallback' };
        primaryAPIAvailable = false;
    }

    // Check Yahoo Finance
    let yahooStatus = { available: false, message: 'Not checked' };
    try {
        await axios.get(`${YAHOO_CHART_URL}/RELIANCE.NS?range=1d&interval=1m`, { timeout: 5000 });
        yahooStatus = { available: true, message: 'Online' };
    } catch (error) {
        yahooStatus = { available: false, message: error.message };
    }

    return {
        primary: { name: 'Indian Stock Market API', ...primaryStatus },
        fallback: { name: 'Yahoo Finance', ...yahooStatus },
        activeSource: primaryAPIAvailable ? 'Indian Stock Market API' : 'Yahoo Finance'
    };
};

module.exports = {
    getRealTimeStock,
    getMultipleRealTimeStocks,
    searchStocks,
    getNifty50Status,
    clearCache,
    checkAPIHealth,
    PRIMARY_URL,
    YAHOO_CHART_URL
};
