/**
 * Stock Data Service
 * Fetches historical OHLCV data from Yahoo Finance API
 */

const axios = require('axios');

// Cache for stock data to reduce API calls
const dataCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

/**
 * Convert NSE symbol to Yahoo Finance format
 */
const toYahooSymbol = (symbol) => {
    // Handle special cases
    const specialSymbols = {
        'M&M': 'M%26M',
        'BAJAJ-AUTO': 'BAJAJ-AUTO'
    };

    const yahooSymbol = specialSymbols[symbol] || symbol;
    return `${yahooSymbol}.NS`;
};

/**
 * Fetch historical stock data from Yahoo Finance
 * @param {string} symbol - NSE stock symbol
 * @param {string} period - Time period (1mo, 3mo, 6mo, 1y, 2y)
 * @param {string} interval - Data interval (1d, 1wk)
 */
const getStockData = async (symbol, period = '2mo', interval = '1d') => {
    const cacheKey = `${symbol}_${period}_${interval}`;

    // Check cache
    const cached = dataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    try {
        const yahooSymbol = toYahooSymbol(symbol);
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`;

        const response = await axios.get(url, {
            params: {
                period1: Math.floor(Date.now() / 1000) - getPeriodSeconds(period),
                period2: Math.floor(Date.now() / 1000),
                interval: interval,
                includePrePost: false
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });

        const result = response.data.chart.result[0];
        const quotes = result.indicators.quote[0];
        const timestamps = result.timestamp;
        const meta = result.meta;

        // Format data
        const data = {
            symbol: symbol,
            currency: meta.currency,
            exchange: meta.exchangeName,
            regularMarketPrice: meta.regularMarketPrice,
            previousClose: meta.previousClose,
            fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
            fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
            candles: timestamps.map((time, i) => ({
                date: new Date(time * 1000).toISOString().split('T')[0],
                timestamp: time * 1000,
                open: quotes.open[i],
                high: quotes.high[i],
                low: quotes.low[i],
                close: quotes.close[i],
                volume: quotes.volume[i]
            })).filter(c => c.close !== null) // Remove null entries
        };

        // Cache the data
        dataCache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });

        return data;

    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error.message);
        throw new Error(`Failed to fetch data for ${symbol}`);
    }
};

/**
 * Fetch data for multiple stocks
 * @param {Array} symbols - Array of stock symbols
 * @param {string} period - Time period
 */
const getMultipleStocks = async (symbols, period = '2mo') => {
    const results = [];
    const batchSize = 5; // Process 5 stocks at a time to avoid rate limiting

    for (let i = 0; i < symbols.length; i += batchSize) {
        const batch = symbols.slice(i, i + batchSize);
        const promises = batch.map(async (symbol) => {
            try {
                const data = await getStockData(symbol, period);
                return { symbol, data, error: null };
            } catch (error) {
                return { symbol, data: null, error: error.message };
            }
        });

        const batchResults = await Promise.all(promises);
        results.push(...batchResults);

        // Small delay between batches to avoid rate limiting
        if (i + batchSize < symbols.length) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    return results;
};

/**
 * Get Nifty 50 index data for market health check
 */
const getNifty50Data = async () => {
    try {
        const url = 'https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI';

        const response = await axios.get(url, {
            params: {
                period1: Math.floor(Date.now() / 1000) - 86400 * 60, // 60 days
                period2: Math.floor(Date.now() / 1000),
                interval: '1d'
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        });

        const result = response.data.chart.result[0];
        const quotes = result.indicators.quote[0];
        const timestamps = result.timestamp;
        const meta = result.meta;

        return {
            symbol: 'NIFTY50',
            currentPrice: meta.regularMarketPrice,
            previousClose: meta.previousClose,
            change: meta.regularMarketPrice - meta.previousClose,
            changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100).toFixed(2),
            candles: timestamps.map((time, i) => ({
                date: new Date(time * 1000).toISOString().split('T')[0],
                close: quotes.close[i]
            })).filter(c => c.close !== null)
        };

    } catch (error) {
        console.error('Error fetching Nifty 50 data:', error.message);
        throw new Error('Failed to fetch Nifty 50 data');
    }
};

/**
 * Convert period string to seconds
 */
const getPeriodSeconds = (period) => {
    const periods = {
        '1mo': 30 * 86400,
        '3mo': 90 * 86400,
        '6mo': 180 * 86400,
        '1y': 365 * 86400,
        '2y': 730 * 86400
    };
    return periods[period] || periods['6mo'];
};

/**
 * Clear cache (useful for forcing fresh data)
 */
const clearCache = () => {
    dataCache.clear();
};

module.exports = {
    getStockData,
    getMultipleStocks,
    getNifty50Data,
    clearCache
};
