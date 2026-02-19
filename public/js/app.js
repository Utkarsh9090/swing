/**
 * SwingTrade India - Main Application
 * Stock Screener with Multi-Factor Analysis
 */

// Global state
let allStocks = [];
let filteredStocks = [];
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
let currentSort = { field: 'score', direction: 'desc' };
let chart = null;

// API Base URL
const API_BASE = '/api';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadSectors();
    loadMarketHealth();
    loadScreenedStocks();
    updateWatchlistCount();
});

/**
 * Load sector options
 */
async function loadSectors() {
    try {
        const response = await fetch(`${API_BASE}/sectors`);
        const data = await response.json();

        if (data.success) {
            const select = document.getElementById('sectorFilter');
            data.sectors.forEach(sector => {
                const option = document.createElement('option');
                option.value = sector.name;
                option.textContent = `${sector.name} (${sector.stockCount})`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading sectors:', error);
    }
}

/**
 * Load market health (Nifty 50)
 */
async function loadMarketHealth() {
    try {
        const response = await fetch(`${API_BASE}/market-health`);
        const data = await response.json();

        if (data.success) {
            document.getElementById('niftyPrice').textContent = `₹${formatNumber(data.currentPrice)}`;

            const changeEl = document.getElementById('niftyChange');
            const changeValue = parseFloat(data.changePercent);
            changeEl.textContent = `${changeValue >= 0 ? '+' : ''}${data.changePercent}%`;
            changeEl.className = `market-change ${changeValue >= 0 ? 'positive' : 'negative'}`;

            const badgeEl = document.getElementById('marketBadge');
            badgeEl.textContent = data.marketStatus;
            badgeEl.className = `market-badge ${data.marketStatus.toLowerCase()}`;
        }
    } catch (error) {
        console.error('Error loading market health:', error);
        document.getElementById('marketBadge').textContent = 'Error';
    }
}

/**
 * Load screened stocks
 */
async function loadScreenedStocks() {
    const sector = document.getElementById('sectorFilter').value;
    const minScore = document.getElementById('scoreFilter').value;

    showLoadingState();

    try {
        const params = new URLSearchParams({
            minScore: 0,  // Always fetch all stocks, filter on frontend
            limit: 100
        });

        if (sector) {
            params.append('sector', sector);
        }

        console.log('Fetching stocks from API...');
        const response = await fetch(`${API_BASE}/screen?${params}`);
        const data = await response.json();
        console.log('API Response:', data);

        if (data.success) {
            allStocks = data.stocks;
            console.log('Loaded stocks:', allStocks.length);
            applyFilters();
            updateStats();
            renderTopPicks();
            document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
        } else {
            console.error('API returned failure:', data);
            showError('API returned an error');
        }
    } catch (error) {
        console.error('Error loading stocks:', error);
        showError('Failed to load stock data. Please try again.');
    }
}

/**
 * Apply filters
 */
function applyFilters() {
    const signal = document.getElementById('signalFilter').value;
    const search = document.getElementById('searchInput').value.toLowerCase();
    const minScore = parseFloat(document.getElementById('scoreFilter').value) || 0;
    const marketCap = document.getElementById('marketCapFilter')?.value || '';

    console.log('Applying filters - minScore:', minScore, 'signal:', signal, 'marketCap:', marketCap, 'allStocks:', allStocks.length);

    filteredStocks = allStocks.filter(stock => {
        // Market cap filter
        if (marketCap && stock.marketCap !== marketCap) return false;

        // Signal filter
        if (signal && stock.signal !== signal) return false;

        // Search filter
        if (search && !stock.symbol.toLowerCase().includes(search) &&
            !stock.name?.toLowerCase().includes(search)) {
            return false;
        }

        // Score filter
        if (stock.score < minScore) return false;

        return true;
    });

    console.log('Filtered stocks:', filteredStocks.length);
    sortStocks();
    renderStockTable();
    document.getElementById('stockCount').textContent = `(${filteredStocks.length} stocks)`;
}

/**
 * Sort stocks
 */
function sortTable(field) {
    if (currentSort.field === field) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.field = field;
        currentSort.direction = 'desc';
    }

    sortStocks();
    renderStockTable();
}

function sortStocks() {
    const { field, direction } = currentSort;

    filteredStocks.sort((a, b) => {
        let valA, valB;

        switch (field) {
            case 'symbol':
                valA = a.symbol;
                valB = b.symbol;
                break;
            case 'sector':
                valA = a.sector || '';
                valB = b.sector || '';
                break;
            case 'price':
                valA = a.currentPrice || 0;
                valB = b.currentPrice || 0;
                break;
            case 'change':
                valA = parseFloat(a.priceChange) || 0;
                valB = parseFloat(b.priceChange) || 0;
                break;
            case 'rsi':
                valA = a.indicators?.rsi || 0;
                valB = b.indicators?.rsi || 0;
                break;
            case 'volume':
                valA = parseFloat(a.indicators?.volumeRatio) || 0;
                valB = parseFloat(b.indicators?.volumeRatio) || 0;
                break;
            case 'score':
            default:
                valA = a.score;
                valB = b.score;
        }

        if (typeof valA === 'string') {
            return direction === 'asc'
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        }

        return direction === 'asc' ? valA - valB : valB - valA;
    });
}

/**
 * Render top picks
 */
function renderTopPicks() {
    const container = document.getElementById('topPicksGrid');
    const topPicks = allStocks.filter(s => s.score >= 7).slice(0, 8);

    if (topPicks.length === 0) {
        container.innerHTML = `
            <div class="loading-card">
                <p>No strong signals found today. Check back later!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = topPicks.map(stock => {
        const changeClass = parseFloat(stock.priceChange) >= 0 ? 'positive' : 'negative';
        const isStrongBuy = stock.signal === 'STRONG_BUY';

        // Get signal reasons
        const reasons = stock.signalReasons;
        const reasonsHtml = reasons && reasons.items && reasons.items.length > 0
            ? `<div class="pick-reasons ${reasons.type}">
                <span class="reasons-title">${reasons.title}</span>
                <ul class="reasons-list">
                    ${reasons.items.slice(0, 3).map(r => `<li>${r}</li>`).join('')}
                </ul>
               </div>`
            : '';

        return `
            <div class="pick-card ${isStrongBuy ? 'strong-buy' : ''}" onclick="viewStock('${stock.symbol}')">
                <div class="pick-header">
                    <span class="pick-symbol">${stock.symbol}</span>
                    <span class="pick-score">
                        ${stock.signalEmoji} ${stock.score}/10
                    </span>
                </div>
                <div class="pick-body">
                    <p class="pick-name">${stock.name || stock.symbol}</p>
                    <span class="pick-price">₹${formatNumber(stock.currentPrice)}</span>
                    <span class="pick-change ${changeClass}">${stock.priceChange >= 0 ? '+' : ''}${stock.priceChange}%</span>
                </div>
                ${reasonsHtml}
                <div class="pick-footer">
                    <span class="pick-sector">${stock.sector || 'Unknown'}</span>
                    <span class="pick-signal ${stock.signal.toLowerCase().replace('_', '-')}">${stock.signalEmoji} ${stock.signal.replace('_', ' ')}</span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Render stock table
 */
function renderStockTable() {
    const tbody = document.getElementById('stockTableBody');

    if (filteredStocks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="loading-cell">
                    <p>No stocks match your filters.</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredStocks.map(stock => {
        const changeClass = parseFloat(stock.priceChange) >= 0 ? 'positive' : 'negative';
        const rsi = stock.indicators?.rsi || 0;
        const rsiClass = rsi < 30 ? 'oversold' : rsi > 70 ? 'overbought' : 'neutral';
        const volumeRatio = stock.indicators?.volumeRatio || '0';
        const volumeClass = parseFloat(volumeRatio) > 1.5 ? 'high' : '';
        const isWatchlisted = watchlist.includes(stock.symbol);
        const signalClass = stock.signal.toLowerCase().replace('_', '-');

        // Generate reasons tooltip
        const reasons = stock.signalReasons;
        const reasonsTooltip = reasons && reasons.items && reasons.items.length > 0
            ? reasons.items.join(' • ')
            : '';

        return `
            <tr data-symbol="${stock.symbol}">
                <td>
                    <button class="btn-star ${isWatchlisted ? 'active' : ''}" onclick="toggleWatchlist('${stock.symbol}')">
                        ${isWatchlisted ? '⭐' : '☆'}
                    </button>
                </td>
                <td>
                    <div class="cell-symbol">${stock.symbol}</div>
                    <div class="cell-name">${stock.name || ''}</div>
                </td>
                <td><span class="cell-sector">${stock.sector || 'Unknown'}</span></td>
                <td class="cell-price">₹${formatNumber(stock.currentPrice)}</td>
                <td><span class="cell-change ${changeClass}">${stock.priceChange >= 0 ? '+' : ''}${stock.priceChange}%</span></td>
                <td class="cell-rsi ${rsiClass}">${rsi.toFixed(1)}</td>
                <td class="cell-macd">${stock.indicators?.macdBullish ? '✅' : '❌'}</td>
                <td class="cell-volume ${volumeClass}">${volumeRatio}x</td>
                <td class="cell-score">${stock.signalEmoji} ${stock.score}</td>
                <td>
                    <span class="cell-signal ${signalClass}" title="${reasonsTooltip}">
                        ${stock.signal.replace('_', ' ')}
                    </span>
                </td>
                <td class="cell-actions">
                    <button class="btn-reason" onclick="showDetailedReasons('${stock.symbol}')">Reason</button>
                    <button class="btn-view" onclick="viewStock('${stock.symbol}')">View</button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Update stats
 */
function updateStats() {
    const strongBuy = allStocks.filter(s => s.signal === 'STRONG_BUY').length;
    const buy = allStocks.filter(s => s.signal === 'BUY').length;

    document.getElementById('strongBuyCount').textContent = strongBuy;
    document.getElementById('buyCount').textContent = buy;
}

/**
 * View stock details
 */
async function viewStock(symbol) {
    const modal = document.getElementById('stockModal');
    modal.classList.add('active');

    // Reset content
    document.getElementById('modalSymbol').textContent = symbol;
    document.getElementById('modalName').textContent = 'Loading...';

    try {
        const response = await fetch(`${API_BASE}/stock/${symbol}`);
        const data = await response.json();

        if (data.success) {
            renderStockModal(data);
        } else {
            throw new Error(data.error || 'Failed to load stock data');
        }
    } catch (error) {
        console.error('Error loading stock:', error);
        document.getElementById('modalName').textContent = 'Error loading data';
    }
}

/**
 * Render stock modal
 */
function renderStockModal(data) {
    const { symbol, name, sector, currentPrice, previousClose, score, indicators, candles } = data;

    // Header
    document.getElementById('modalSymbol').textContent = symbol;
    document.getElementById('modalName').textContent = `${name} • ${sector}`;
    document.getElementById('modalPrice').textContent = `₹${formatNumber(currentPrice)}`;

    const change = ((currentPrice - previousClose) / previousClose * 100).toFixed(2);
    const changeEl = document.getElementById('modalChange');
    changeEl.textContent = `${change >= 0 ? '+' : ''}${change}%`;
    changeEl.className = `modal-change ${change >= 0 ? 'positive' : 'negative'}`;

    // Score
    document.getElementById('modalScore').textContent = score.score;

    const signalBadge = document.getElementById('modalSignal');
    signalBadge.textContent = `${score.signalEmoji} ${score.signal.replace('_', ' ')}`;
    signalBadge.className = `signal-badge ${score.signal.toLowerCase().replace('_', '-')}`;

    document.getElementById('modalSignalText').textContent = score.signalText;

    // Trade Setup
    if (score.tradeSetup) {
        document.getElementById('modalEntry').textContent = `₹${score.tradeSetup.entry}`;
        document.getElementById('modalTarget1').textContent = `₹${score.tradeSetup.target1}`;
        document.getElementById('modalTarget2').textContent = `₹${score.tradeSetup.target2}`;
        document.getElementById('modalStopLoss').textContent = `₹${score.tradeSetup.stopLoss}`;
        document.getElementById('modalRisk').textContent = `${score.tradeSetup.riskPercent}%`;
        document.getElementById('modalReward').textContent = `${score.tradeSetup.rewardPercent}%`;
        document.getElementById('modalRR').textContent = `1:${score.tradeSetup.riskRewardRatio}`;
    }

    // Set TradingView Link (6 months = 6M timeframe)
    const tradingViewUrl = `https://www.tradingview.com/chart/?symbol=NSE:${symbol}&interval=D`;
    const tradingViewLink = document.getElementById('tradingViewLink');
    tradingViewLink.href = tradingViewUrl;

    // Make chart container clickable to open TradingView
    const chartContainer = document.getElementById('chartContainer');
    chartContainer.style.cursor = 'pointer';
    chartContainer.onclick = () => window.open(tradingViewUrl, '_blank');

    // Render chart with support/resistance levels
    renderChart(candles, score.tradeSetup, indicators.supportResistance);

    // Render indicators
    renderIndicators(indicators, score.indicators);

    // Render breakdown
    renderBreakdown(score.breakdown);
}

/**
 * Render candlestick chart
 */
function renderChart(candles, tradeSetup, supportResistance) {
    const container = document.getElementById('chartContainer');
    container.innerHTML = '';

    if (chart) {
        chart.remove();
    }

    chart = LightweightCharts.createChart(container, {
        width: container.clientWidth,
        height: 350,
        layout: {
            background: { color: '#1a2332' },
            textColor: '#9ca3af',
        },
        grid: {
            vertLines: { color: 'rgba(75, 85, 99, 0.2)' },
            horzLines: { color: 'rgba(75, 85, 99, 0.2)' },
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        rightPriceScale: {
            borderColor: 'rgba(75, 85, 99, 0.3)',
        },
        timeScale: {
            borderColor: 'rgba(75, 85, 99, 0.3)',
            timeVisible: true,
        },
    });

    // Candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#10b981',
        wickDownColor: '#ef4444',
        wickUpColor: '#10b981',
    });

    const chartData = candles.map(c => ({
        time: c.date,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
    }));

    candlestickSeries.setData(chartData);

    // Add horizontal lines for trade setup
    if (tradeSetup) {
        const lastDate = candles[candles.length - 1].date;

        // Entry line
        candlestickSeries.createPriceLine({
            price: parseFloat(tradeSetup.entry),
            color: '#3b82f6',
            lineWidth: 2,
            lineStyle: LightweightCharts.LineStyle.Dashed,
            axisLabelVisible: true,
            title: 'Entry',
        });

        // Target lines
        candlestickSeries.createPriceLine({
            price: parseFloat(tradeSetup.target1),
            color: '#10b981',
            lineWidth: 1,
            lineStyle: LightweightCharts.LineStyle.Dotted,
            axisLabelVisible: true,
            title: 'T1',
        });

        candlestickSeries.createPriceLine({
            price: parseFloat(tradeSetup.target2),
            color: '#10b981',
            lineWidth: 2,
            lineStyle: LightweightCharts.LineStyle.Dashed,
            axisLabelVisible: true,
            title: 'T2',
        });

        // Stop loss line
        candlestickSeries.createPriceLine({
            price: parseFloat(tradeSetup.stopLoss),
            color: '#ef4444',
            lineWidth: 2,
            lineStyle: LightweightCharts.LineStyle.Dashed,
            axisLabelVisible: true,
            title: 'SL',
        });
    }

    // Add Support and Resistance lines
    if (supportResistance) {
        // Draw support levels (green)
        const supportLevels = supportResistance.supportLevels || [];
        if (supportResistance.nearestSupport) {
            candlestickSeries.createPriceLine({
                price: parseFloat(supportResistance.nearestSupport),
                color: '#10b981',
                lineWidth: 2,
                lineStyle: LightweightCharts.LineStyle.Dashed,
                axisLabelVisible: true,
                title: 'S1',
            });
        }
        supportLevels.slice(1, 3).forEach((level, idx) => {
            candlestickSeries.createPriceLine({
                price: parseFloat(level),
                color: 'rgba(16, 185, 129, 0.6)',
                lineWidth: 1,
                lineStyle: LightweightCharts.LineStyle.Dotted,
                axisLabelVisible: true,
                title: `S${idx + 2}`,
            });
        });

        // Draw resistance levels (orange/red)
        if (supportResistance.nearestResistance) {
            candlestickSeries.createPriceLine({
                price: parseFloat(supportResistance.nearestResistance),
                color: '#f59e0b',
                lineWidth: 2,
                lineStyle: LightweightCharts.LineStyle.Dashed,
                axisLabelVisible: true,
                title: 'R1',
            });
        }
        const resistanceLevels = supportResistance.resistanceLevels || [];
        resistanceLevels.slice(1, 3).forEach((level, idx) => {
            candlestickSeries.createPriceLine({
                price: parseFloat(level),
                color: 'rgba(245, 158, 11, 0.6)',
                lineWidth: 1,
                lineStyle: LightweightCharts.LineStyle.Dotted,
                axisLabelVisible: true,
                title: `R${idx + 2}`,
            });
        });
    }

    // Volume series
    const volumeSeries = chart.addHistogramSeries({
        color: '#3b82f6',
        priceFormat: {
            type: 'volume',
        },
        priceScaleId: '',
        scaleMargins: {
            top: 0.8,
            bottom: 0,
        },
    });

    const volumeData = candles.map(c => ({
        time: c.date,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)',
    }));

    volumeSeries.setData(volumeData);

    chart.timeScale().fitContent();

    // Resize handler
    window.addEventListener('resize', () => {
        chart.applyOptions({ width: container.clientWidth });
    });
}

/**
 * Render indicators
 */
function renderIndicators(indicators, simpleIndicators) {
    const grid = document.getElementById('indicatorsGrid');

    const indicatorItems = [
        {
            label: 'RSI (14)', value: indicators.rsi?.current?.toFixed(1) || '--',
            class: indicators.rsi?.isOversold ? 'bearish' : indicators.rsi?.isOverbought ? 'neutral' : 'bullish'
        },
        {
            label: 'MACD', value: indicators.macd?.isBullish ? 'Bullish' : 'Bearish',
            class: indicators.macd?.isBullish ? 'bullish' : 'bearish'
        },
        {
            label: 'ADX', value: indicators.adx?.adx?.toFixed(1) || '--',
            class: indicators.adx?.isTrending ? 'bullish' : 'neutral'
        },
        {
            label: 'Trend', value: indicators.trend?.direction || '--',
            class: indicators.trend?.isUptrend ? 'bullish' : indicators.trend?.isDowntrend ? 'bearish' : 'neutral'
        },
        {
            label: 'Volume', value: `${indicators.volume?.ratio || '--'}x`,
            class: indicators.volume?.isHighVolume ? 'bullish' : 'neutral'
        },
        {
            label: '50 EMA', value: `₹${formatNumber(indicators.emas?.ema50)}`,
            class: indicators.emas?.aboveEma50 ? 'bullish' : 'bearish'
        },
        {
            label: '200 EMA', value: indicators.emas?.ema200 ? `₹${formatNumber(indicators.emas.ema200)}` : 'N/A',
            class: indicators.emas?.aboveEma200 ? 'bullish' : 'bearish'
        },
        {
            label: 'Pattern', value: indicators.patterns?.patterns?.[0]?.name || 'None',
            class: indicators.patterns?.hasBullishPattern ? 'bullish' : 'neutral'
        },
    ];

    grid.innerHTML = indicatorItems.map(ind => `
        <div class="indicator-card">
            <span class="indicator-label">${ind.label}</span>
            <span class="indicator-value ${ind.class}">${ind.value}</span>
        </div>
    `).join('');
}

/**
 * Render score breakdown
 */
function renderBreakdown(breakdown) {
    const list = document.getElementById('breakdownList');

    const factors = [
        { key: 'trend', name: 'Trend Alignment' },
        { key: 'rsi', name: 'RSI Position' },
        { key: 'macd', name: 'MACD Signal' },
        { key: 'volume', name: 'Volume Confirmation' },
        { key: 'pattern', name: 'Candlestick Pattern' },
        { key: 'support', name: 'Support/Resistance' },
        { key: 'adx', name: 'ADX Strength' },
        { key: 'week52', name: '52-Week Position' },
        { key: 'riskReward', name: 'Risk-Reward Ratio' },
    ];

    list.innerHTML = factors.map(factor => {
        const data = breakdown[factor.key];
        if (!data) return '';

        const passed = data.passed;
        const scoreClass = data.score >= data.max * 0.7 ? 'high' : data.score >= data.max * 0.4 ? 'medium' : 'low';

        return `
            <div class="breakdown-item ${passed ? 'passed' : 'failed'}">
                <div>
                    <div class="breakdown-factor">${factor.name}</div>
                    <div class="breakdown-reason">${data.reasons?.join(', ') || '--'}</div>
                </div>
                <div class="breakdown-score ${scoreClass}">${data.score}/${data.max}</div>
            </div>
        `;
    }).join('');
}

/**
 * Watchlist functions
 */
function toggleWatchlist(symbol) {
    const index = watchlist.indexOf(symbol);

    if (index > -1) {
        watchlist.splice(index, 1);
    } else {
        watchlist.push(symbol);
    }

    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    updateWatchlistCount();
    renderStockTable();
}

function updateWatchlistCount() {
    document.getElementById('watchlistCount').textContent = watchlist.length;
}

function showWatchlist() {
    const modal = document.getElementById('watchlistModal');
    modal.classList.add('active');

    const content = document.getElementById('watchlistContent');

    if (watchlist.length === 0) {
        content.innerHTML = '<p class="empty-watchlist">No stocks in watchlist. Click ⭐ to add stocks.</p>';
        return;
    }

    const watchlistStocks = allStocks.filter(s => watchlist.includes(s.symbol));

    content.innerHTML = watchlistStocks.map(stock => `
        <div class="watchlist-item">
            <div class="watchlist-info">
                <span class="watchlist-symbol">${stock.symbol}</span>
                <span class="watchlist-name">${stock.name || ''}</span>
            </div>
            <span class="watchlist-score">${stock.signalEmoji} ${stock.score}/10</span>
            <button class="btn-remove" onclick="removeFromWatchlist('${stock.symbol}')">Remove</button>
        </div>
    `).join('');
}

function removeFromWatchlist(symbol) {
    toggleWatchlist(symbol);
    showWatchlist();
}

function closeWatchlistModal() {
    document.getElementById('watchlistModal').classList.remove('active');
}

/**
 * Modal functions
 */
function closeModal() {
    document.getElementById('stockModal').classList.remove('active');
    if (chart) {
        chart.remove();
        chart = null;
    }
}

/**
 * Refresh data
 */
async function refreshData() {
    const btn = document.getElementById('refreshBtn');
    btn.classList.add('loading');

    await Promise.all([
        loadMarketHealth(),
        loadScreenedStocks()
    ]);

    btn.classList.remove('loading');
}

/**
 * Utility functions
 */
function formatNumber(num) {
    if (!num) return '--';
    return parseFloat(num).toLocaleString('en-IN', {
        maximumFractionDigits: 2
    });
}

function showLoadingState() {
    document.getElementById('topPicksGrid').innerHTML = `
        <div class="loading-card">
            <div class="spinner"></div>
            <p>Screening 250+ stocks...</p>
            <p class="loading-sub">This may take 15-30 seconds</p>
        </div>
    `;

    document.getElementById('stockTableBody').innerHTML = `
        <tr>
            <td colspan="11" class="loading-cell">
                <div class="spinner"></div>
                <p>Analyzing Large Cap & Mid Cap stocks...</p>
                <p class="loading-sub">Fetching real-time data from NSE</p>
            </td>
        </tr>
    `;
}

function showError(message) {
    document.getElementById('topPicksGrid').innerHTML = `
        <div class="loading-card">
            <p>❌ ${message}</p>
        </div>
    `;

    document.getElementById('stockTableBody').innerHTML = `
        <tr>
            <td colspan="11" class="loading-cell">
                <p>❌ ${message}</p>
            </td>
        </tr>
    `;
}

// Close modals on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeWatchlistModal();
        closeReasonsModal();
    }
});

/**
 * Show detailed reasons modal with technical analysis
 */
function showDetailedReasons(symbol) {
    const stock = allStocks.find(s => s.symbol === symbol);
    if (!stock) {
        console.error('Stock not found:', symbol);
        return;
    }

    const modal = document.getElementById('reasonsModal');
    const title = document.getElementById('reasonsModalTitle');
    const content = document.getElementById('reasonsModalContent');

    const signal = stock.signal;
    const reasons = stock.signalReasons || {};
    const indicators = stock.indicators || {};
    const breakdown = stock.breakdown || {};

    // Set title based on signal type
    let titleIcon = '📊';
    let titleText = 'Technical Analysis';
    let signalClass = '';

    if (signal === 'STRONG_BUY') {
        titleIcon = '🔥';
        titleText = 'Strong Buy - Technical Analysis';
        signalClass = 'bullish';
    } else if (signal === 'BUY') {
        titleIcon = '✅';
        titleText = 'Buy Signal - Technical Analysis';
        signalClass = 'bullish';
    } else if (signal === 'WATCHLIST') {
        titleIcon = '⏳';
        titleText = 'Watchlist - What to Monitor';
        signalClass = 'neutral';
    } else if (signal === 'AVOID') {
        titleIcon = '⚠️';
        titleText = 'Avoid - Risk Factors';
        signalClass = 'bearish';
    }

    title.innerHTML = `${titleIcon} ${stock.symbol} - ${titleText}`;

    // Build technical indicators section
    const rsi = indicators.rsi || 0;
    const rsiStatus = rsi < 30 ? '🟢 Oversold (Bullish)' : rsi > 70 ? '🔴 Overbought (Bearish)' : '🟡 Neutral';
    const macdStatus = indicators.macdBullish ? '🟢 Bullish Crossover' : '🔴 Bearish';
    const volumeRatio = indicators.volumeRatio || 0;
    const volumeStatus = volumeRatio > 1.5 ? '🟢 High Volume Confirmation' : volumeRatio > 1 ? '🟡 Normal Volume' : '🔴 Low Volume';
    const trendStatus = indicators.aboveSMA20 && indicators.aboveSMA50 ? '🟢 Strong Uptrend' :
        indicators.aboveSMA20 ? '🟡 Short-term Bullish' : '🔴 Downtrend';

    // Build breakdown section from scoring
    let breakdownHTML = '';
    const breakdownLabels = {
        trend: '📊 Trend Analysis',
        rsi: '📈 RSI Momentum',
        macd: '📉 MACD Signal',
        volume: '📊 Volume',
        pattern: '🕯️ Candlestick Pattern',
        support: '📍 Support Level',
        adx: '💪 Trend Strength (ADX)',
        sector: '🏢 Sector',
        week52: '📅 52-Week Position',
        riskReward: '⚖️ Risk/Reward'
    };

    if (breakdown && Object.keys(breakdown).length > 0) {
        breakdownHTML = Object.entries(breakdown).map(([key, item]) => {
            const scoreClass = item.score > 1 ? 'positive' : item.score > 0 ? 'neutral' : 'negative';
            const icon = item.score > 1 ? '✅' : item.score > 0 ? '➖' : '❌';
            const label = breakdownLabels[key] || key;
            // Handle both 'reason' string and 'reasons' array
            const reasonText = item.reason || (item.reasons && item.reasons.length > 0 ? item.reasons.join(', ') : 'No data');
            return `
                <div class="breakdown-item ${scoreClass}">
                    <span class="breakdown-icon">${icon}</span>
                    <span class="breakdown-label">${label}</span>
                    <span class="breakdown-text">${reasonText}</span>
                    <span class="breakdown-score">+${item.score}</span>
                </div>
            `;
        }).join('');
    }

    // Action recommendation
    let actionHTML = '';
    if (signal === 'STRONG_BUY') {
        actionHTML = `
            <div class="action-box positive">
                <h4>📈 Recommended Action</h4>
                <p>Strong technical setup detected. Consider entering with proper position sizing.</p>
                <ul>
                    <li>Entry: Around ₹${formatNumber(stock.tradeSetup?.entry || stock.currentPrice)}</li>
                    <li>Target: ₹${formatNumber(stock.tradeSetup?.target1 || (stock.currentPrice * 1.05))}</li>
                    <li>Stop Loss: ₹${formatNumber(stock.tradeSetup?.stopLoss || (stock.currentPrice * 0.97))}</li>
                </ul>
            </div>
        `;
    } else if (signal === 'BUY') {
        actionHTML = `
            <div class="action-box positive">
                <h4>📈 Recommended Action</h4>
                <p>Good setup but wait for confirmation. Consider a smaller position size.</p>
                <ul>
                    <li>Wait for price to hold above ₹${formatNumber(stock.currentPrice * 0.98)}</li>
                    <li>Look for increased volume confirmation</li>
                </ul>
            </div>
        `;
    } else if (signal === 'WATCHLIST') {
        actionHTML = `
            <div class="action-box neutral">
                <h4>⏳ Recommended Action</h4>
                <p>Not ready for entry. Add to watchlist and wait for:</p>
                <ul>
                    <li>RSI to drop below 40 for better entry</li>
                    <li>MACD bullish crossover</li>
                    <li>Volume spike above 1.5x average</li>
                </ul>
            </div>
        `;
    } else {
        actionHTML = `
            <div class="action-box negative">
                <h4>⚠️ Recommended Action</h4>
                <p>Technical indicators are weak. Avoid entry until conditions improve.</p>
                <ul>
                    <li>Wait for trend reversal signals</li>
                    <li>Look for support levels to hold</li>
                    <li>Monitor for fundamental news</li>
                </ul>
            </div>
        `;
    }

    // TradingView URL
    const tradingViewUrl = `https://www.tradingview.com/chart/?symbol=NSE:${stock.symbol}&interval=D`;

    // Build full content
    content.innerHTML = `
        <div class="reasons-tabs">
            <div class="reasons-score-header ${signalClass}">
                <div class="score-info">
                    <span class="big-score">${stock.signalEmoji} ${stock.score}/10</span>
                    <span class="score-label">${stock.signal.replace('_', ' ')}</span>
                </div>
                <a href="${tradingViewUrl}" target="_blank" class="chart-btn-reasons">
                    📈 View Chart
                </a>
            </div>
        </div>

        <div class="tech-analysis-section">
            <h4>📊 Chart Technical Indicators</h4>
            <div class="indicators-grid-mini">
                <div class="indicator-item">
                    <span class="ind-label">RSI (14)</span>
                    <span class="ind-value">${rsi.toFixed(1)}</span>
                    <span class="ind-status">${rsiStatus}</span>
                </div>
                <div class="indicator-item">
                    <span class="ind-label">MACD</span>
                    <span class="ind-value">${indicators.macdHistogram?.toFixed(2) || '--'}</span>
                    <span class="ind-status">${macdStatus}</span>
                </div>
                <div class="indicator-item">
                    <span class="ind-label">EMA 9/21</span>
                    <span class="ind-value">${indicators.ema9Above21 ? '✅ 9>21' : '❌ 9<21'}</span>
                    <span class="ind-status">${indicators.ema9BullishCrossover ? '🟢 Fresh Bullish Cross!' : indicators.recentEma9Crossover ? '🟢 Recent Bullish Cross' : indicators.ema9Above21 ? '🟢 Bullish' : '🔴 Bearish'}</span>
                </div>
                <div class="indicator-item">
                    <span class="ind-label">Volume</span>
                    <span class="ind-value">${volumeRatio}x avg</span>
                    <span class="ind-status">${volumeStatus}</span>
                </div>
                <div class="indicator-item">
                    <span class="ind-label">Price vs EMA 21</span>
                    <span class="ind-value">${indicators.aboveEma21 ? '↑ Above' : '↓ Below'}</span>
                    <span class="ind-status">${indicators.aboveEma21 ? '🟢 Bullish' : '🔴 Bearish'} (${indicators.distanceFromEma21}%)</span>
                </div>
                <div class="indicator-item">
                    <span class="ind-label">Trend</span>
                    <span class="ind-value">${indicators.aboveSMA20 ? '↑' : '↓'} SMA</span>
                    <span class="ind-status">${trendStatus}</span>
                </div>
            </div>
        </div>

        ${indicators.swingPatterns && indicators.swingPatterns.patterns.length > 0 ? `
        <div class="patterns-section">
            <h4>🔍 Swing Trading Patterns Detected</h4>
            <div class="patterns-list">
                ${indicators.swingPatterns.patterns.map(p => `
                    <div class="pattern-item ${p.type}">
                        <div class="pattern-header">
                            <span class="pattern-name">${p.name}</span>
                            ${p.isBreakout ? '<span class="pattern-breakout">BREAKOUT!</span>' : ''}
                        </div>
                        <p class="pattern-desc">${p.description}</p>
                        ${p.target ? `<span class="pattern-target">Target: ₹${p.target.toFixed(2)}</span>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${indicators.confluence ? `
        <div class="confluence-section">
            <h4>📋 Confluence Checklist (${indicators.confluence.passedCount}/4)</h4>
            <div class="confluence-summary ${indicators.confluence.isValid ? 'valid' : 'invalid'}">
                ${indicators.confluence.summary}
            </div>
            <div class="confluence-checks">
                <div class="confluence-item ${indicators.confluence.trend.passed ? 'passed' : 'failed'}">
                    <span class="conf-icon">${indicators.confluence.trend.passed ? '✅' : '❌'}</span>
                    <span class="conf-name">Trend</span>
                    <span class="conf-detail">${indicators.confluence.trend.checks.join(', ')}</span>
                </div>
                <div class="confluence-item ${indicators.confluence.volume.passed ? 'passed' : 'failed'}">
                    <span class="conf-icon">${indicators.confluence.volume.passed ? '✅' : '❌'}</span>
                    <span class="conf-name">Volume</span>
                    <span class="conf-detail">${indicators.confluence.volume.checks.join(', ')}</span>
                </div>
                <div class="confluence-item ${indicators.confluence.momentum.passed ? 'passed' : 'failed'}">
                    <span class="conf-icon">${indicators.confluence.momentum.passed ? '✅' : '❌'}</span>
                    <span class="conf-name">Momentum</span>
                    <span class="conf-detail">${indicators.confluence.momentum.checks.join(', ')}</span>
                </div>
                <div class="confluence-item ${indicators.confluence.pattern.passed ? 'passed' : 'failed'}">
                    <span class="conf-icon">${indicators.confluence.pattern.passed ? '✅' : '❌'}</span>
                    <span class="conf-name">Pattern</span>
                    <span class="conf-detail">${indicators.confluence.pattern.checks.join(', ')}</span>
                </div>
            </div>
        </div>
        ` : ''}

        ${breakdownHTML ? `
        <div class="breakdown-section-mini">
            <h4>🎯 Score Breakdown</h4>
            <div class="breakdown-list-mini">
                ${breakdownHTML}
            </div>
        </div>
        ` : ''}

        ${reasons.items && reasons.items.length > 0 ? `
        <div class="key-reasons-section">
            <h4>${reasons.title || '📋 Key Factors'}</h4>
            <ul class="reasons-detail-list">
                ${reasons.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
        ` : ''}

        ${actionHTML}

        <div class="news-section">
            <h4>📰 Market Context</h4>
            <p class="news-note">For latest news and updates, check:</p>
            <div class="news-links">
                <a href="https://www.google.com/search?q=${stock.symbol}+NSE+news" target="_blank" class="news-link">Google News</a>
                <a href="https://www.moneycontrol.com/india/stockpricequote/${stock.symbol}" target="_blank" class="news-link">MoneyControl</a>
                <a href="https://economictimes.com/markets" target="_blank" class="news-link">ET Markets</a>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

/**
 * Close reasons modal
 */
function closeReasonsModal() {
    document.getElementById('reasonsModal').classList.remove('active');
}

