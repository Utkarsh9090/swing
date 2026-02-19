/**
 * Technical Analysis Service
 * Calculates indicators: RSI, MACD, EMA, ADX, Volume Analysis, Candlestick Patterns
 */

const {
    RSI,
    MACD,
    EMA,
    SMA,
    ADX,
    BollingerBands,
    ATR
} = require('technicalindicators');

/**
 * Calculate all technical indicators for a stock
 * @param {Array} candles - Array of OHLCV candles
 * @returns {Object} All calculated indicators
 */
const calculateIndicators = (candles) => {
    if (!candles || candles.length < 26) {
        throw new Error('Insufficient data for technical analysis (need at least 26 candles)');
    }

    const closes = candles.map(c => c.close);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const volumes = candles.map(c => c.volume);

    // Calculate all indicators
    const rsi = calculateRSI(closes);
    const macd = calculateMACD(closes);
    const emas = calculateEMAs(closes);
    const adx = calculateADX(highs, lows, closes);
    const volumeAnalysis = analyzeVolume(volumes);
    const bollingerBands = calculateBollingerBands(closes);
    const atr = calculateATR(highs, lows, closes);
    const candlePatterns = detectCandlePatterns(candles);
    const trendAnalysis = analyzeTrend(closes, emas);
    const supportResistance = findSupportResistance(candles);

    // Swing trading patterns
    const swingPatterns = detectSwingPatterns(candles);

    // Create base indicators object for confluence calculation
    const baseIndicators = {
        rsi,
        macd,
        emas,
        adx,
        volumeAnalysis,
        bollingerBands,
        atr,
        candlePatterns,
        trendAnalysis,
        supportResistance,
        swingPatterns,
        currentPrice: closes[closes.length - 1],
        previousClose: closes[closes.length - 2]
    };

    // Calculate confluence checklist
    const confluence = calculateConfluence(baseIndicators);

    return {
        ...baseIndicators,
        confluence
    };
};

/**
 * Calculate RSI (14-period by default)
 */
const calculateRSI = (closes, period = 14) => {
    const rsiValues = RSI.calculate({
        values: closes,
        period: period
    });

    const currentRSI = rsiValues[rsiValues.length - 1];
    const previousRSI = rsiValues[rsiValues.length - 2];

    return {
        current: currentRSI,
        previous: previousRSI,
        history: rsiValues.slice(-20),
        isOversold: currentRSI < 30,
        isOverbought: currentRSI > 70,
        inSwingZone: currentRSI >= 40 && currentRSI <= 60,
        isRecovering: previousRSI < 40 && currentRSI >= 40
    };
};

/**
 * Calculate MACD (12, 26, 9)
 */
const calculateMACD = (closes) => {
    const macdValues = MACD.calculate({
        values: closes,
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        SimpleMAOscillator: false,
        SimpleMASignal: false
    });

    const current = macdValues[macdValues.length - 1];
    const previous = macdValues[macdValues.length - 2];
    const threeDaysAgo = macdValues[macdValues.length - 4];

    // Detect crossovers
    const bullishCrossover = previous && current &&
        previous.MACD <= previous.signal && current.MACD > current.signal;
    const bearishCrossover = previous && current &&
        previous.MACD >= previous.signal && current.MACD < current.signal;

    // Recent crossover (within 3 days)
    const recentBullishCrossover = macdValues.slice(-3).some((v, i, arr) => {
        if (i === 0) return false;
        const prev = arr[i - 1];
        return prev && v && prev.MACD <= prev.signal && v.MACD > v.signal;
    });

    return {
        macd: current?.MACD || 0,
        signal: current?.signal || 0,
        histogram: current?.histogram || 0,
        history: macdValues.slice(-20),
        isBullish: current?.MACD > current?.signal,
        bullishCrossover,
        bearishCrossover,
        recentBullishCrossover,
        histogramIncreasing: current?.histogram > previous?.histogram
    };
};

/**
 * Calculate multiple EMAs (9, 20, 21, 50, 200)
 */
const calculateEMAs = (closes) => {
    const ema9 = EMA.calculate({ values: closes, period: 9 });
    const ema20 = EMA.calculate({ values: closes, period: 20 });
    const ema21 = EMA.calculate({ values: closes, period: 21 });
    const ema50 = EMA.calculate({ values: closes, period: 50 });
    const ema200 = EMA.calculate({ values: closes, period: 200 });

    const currentPrice = closes[closes.length - 1];

    // EMA 9/21 Crossover Detection
    const currentEma9 = ema9[ema9.length - 1];
    const currentEma21 = ema21[ema21.length - 1];
    const prevEma9 = ema9[ema9.length - 2];
    const prevEma21 = ema21[ema21.length - 2];

    const ema9Above21 = currentEma9 > currentEma21;
    const ema9BullishCrossover = prevEma9 <= prevEma21 && currentEma9 > currentEma21;
    const ema9BearishCrossover = prevEma9 >= prevEma21 && currentEma9 < currentEma21;

    // Check for recent crossover (within last 3 days)
    let recentEma9Crossover = false;
    for (let i = 1; i <= 3; i++) {
        const idx = ema9.length - 1 - i;
        if (idx >= 0 && ema9[idx] && ema21[idx] && ema9[idx + 1] && ema21[idx + 1]) {
            if (ema9[idx] <= ema21[idx] && ema9[idx + 1] > ema21[idx + 1]) {
                recentEma9Crossover = true;
                break;
            }
        }
    }

    return {
        ema9: currentEma9,
        ema20: ema20[ema20.length - 1],
        ema21: currentEma21,
        ema50: ema50[ema50.length - 1],
        ema200: ema200.length > 0 ? ema200[ema200.length - 1] : null,

        // Trend conditions
        aboveEma9: currentPrice > currentEma9,
        aboveEma20: currentPrice > ema20[ema20.length - 1],
        aboveEma21: currentPrice > currentEma21,
        aboveEma50: currentPrice > ema50[ema50.length - 1],
        aboveEma200: ema200.length > 0 && currentPrice > ema200[ema200.length - 1],

        // EMA 9/21 crossover (popular swing trading signal)
        ema9Above21,
        ema9BullishCrossover,
        ema9BearishCrossover,
        recentEma9Crossover,

        // EMA alignment (bullish when shorter above longer)
        ema9Above20: currentEma9 > ema20[ema20.length - 1],
        ema20Above50: ema20[ema20.length - 1] > ema50[ema50.length - 1],
        ema50Above200: ema200.length > 0 && ema50[ema50.length - 1] > ema200[ema200.length - 1],

        // Price distance from EMAs (for support/resistance)
        distanceFromEma9: ((currentPrice - currentEma9) / currentEma9 * 100).toFixed(2),
        distanceFromEma21: ((currentPrice - currentEma21) / currentEma21 * 100).toFixed(2),
        distanceFromEma20: ((currentPrice - ema20[ema20.length - 1]) / ema20[ema20.length - 1] * 100).toFixed(2),
        distanceFromEma50: ((currentPrice - ema50[ema50.length - 1]) / ema50[ema50.length - 1] * 100).toFixed(2),

        history: {
            ema9: ema9.slice(-50),
            ema20: ema20.slice(-50),
            ema21: ema21.slice(-50),
            ema50: ema50.slice(-50)
        }
    };
};

/**
 * Calculate ADX (Average Directional Index)
 */
const calculateADX = (highs, lows, closes, period = 14) => {
    const adxValues = ADX.calculate({
        high: highs,
        low: lows,
        close: closes,
        period: period
    });

    const current = adxValues[adxValues.length - 1];

    return {
        adx: current?.adx || 0,
        pdi: current?.pdi || 0,  // Plus Directional Indicator
        mdi: current?.mdi || 0,  // Minus Directional Indicator
        isTrending: current?.adx > 25,
        isStrongTrend: current?.adx > 40,
        isBullishTrend: current?.pdi > current?.mdi,
        trendStrength: current?.adx > 40 ? 'Strong' : current?.adx > 25 ? 'Moderate' : 'Weak'
    };
};

/**
 * Analyze Volume
 */
const analyzeVolume = (volumes) => {
    const recentVolumes = volumes.slice(-20);
    const avgVolume20 = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
    const currentVolume = volumes[volumes.length - 1];
    const previousVolume = volumes[volumes.length - 2];

    const volumeRatio = currentVolume / avgVolume20;

    return {
        current: currentVolume,
        average20: avgVolume20,
        ratio: volumeRatio.toFixed(2),
        isAboveAverage: volumeRatio > 1.2,
        isHighVolume: volumeRatio > 1.5,
        isVeryHighVolume: volumeRatio > 2.0,
        isIncreasing: currentVolume > previousVolume,
        signal: volumeRatio > 1.5 ? 'STRONG' : volumeRatio > 1.2 ? 'MODERATE' : 'WEAK'
    };
};

/**
 * Calculate Bollinger Bands
 */
const calculateBollingerBands = (closes, period = 20, stdDev = 2) => {
    const bbValues = BollingerBands.calculate({
        values: closes,
        period: period,
        stdDev: stdDev
    });

    const current = bbValues[bbValues.length - 1];
    const currentPrice = closes[closes.length - 1];

    return {
        upper: current?.upper,
        middle: current?.middle,
        lower: current?.lower,
        bandwidth: ((current?.upper - current?.lower) / current?.middle * 100).toFixed(2),
        nearLower: currentPrice <= current?.lower * 1.02,
        nearUpper: currentPrice >= current?.upper * 0.98,
        percentB: ((currentPrice - current?.lower) / (current?.upper - current?.lower) * 100).toFixed(2)
    };
};

/**
 * Calculate ATR (Average True Range) - for stop loss calculation
 */
const calculateATR = (highs, lows, closes, period = 14) => {
    const atrValues = ATR.calculate({
        high: highs,
        low: lows,
        close: closes,
        period: period
    });

    const currentATR = atrValues[atrValues.length - 1];
    const currentPrice = closes[closes.length - 1];

    return {
        value: currentATR,
        percent: (currentATR / currentPrice * 100).toFixed(2),
        suggestedStopLoss: currentPrice - (currentATR * 2),
        suggestedTarget: currentPrice + (currentATR * 3)
    };
};

/**
 * Detect Candlestick Patterns
 */
const detectCandlePatterns = (candles) => {
    const last3 = candles.slice(-3);
    const patterns = [];

    const [threeAgo, twoAgo, current] = last3;

    // Calculate body and wick sizes
    const body = current.close - current.open;
    const upperWick = current.high - Math.max(current.open, current.close);
    const lowerWick = Math.min(current.open, current.close) - current.low;
    const bodySize = Math.abs(body);
    const totalRange = current.high - current.low;

    // Bullish Engulfing
    if (twoAgo && current.close > current.open &&
        twoAgo.close < twoAgo.open &&
        current.open < twoAgo.close &&
        current.close > twoAgo.open) {
        patterns.push({ name: 'Bullish Engulfing', type: 'bullish', strength: 'strong' });
    }

    // Hammer (bullish reversal)
    if (lowerWick > bodySize * 2 && upperWick < bodySize * 0.5 && body > 0) {
        patterns.push({ name: 'Hammer', type: 'bullish', strength: 'moderate' });
    }

    // Inverted Hammer
    if (upperWick > bodySize * 2 && lowerWick < bodySize * 0.5 && body > 0) {
        patterns.push({ name: 'Inverted Hammer', type: 'bullish', strength: 'moderate' });
    }

    // Doji (indecision)
    if (bodySize < totalRange * 0.1) {
        patterns.push({ name: 'Doji', type: 'neutral', strength: 'weak' });
    }

    // Morning Star (3-candle bullish reversal)
    if (threeAgo && twoAgo &&
        threeAgo.close < threeAgo.open && // First candle bearish
        Math.abs(twoAgo.close - twoAgo.open) < (threeAgo.high - threeAgo.low) * 0.3 && // Small body
        current.close > current.open && // Current bullish
        current.close > (threeAgo.open + threeAgo.close) / 2) {
        patterns.push({ name: 'Morning Star', type: 'bullish', strength: 'strong' });
    }

    // Bullish Marubozu (strong bullish)
    if (body > 0 && upperWick < bodySize * 0.1 && lowerWick < bodySize * 0.1) {
        patterns.push({ name: 'Bullish Marubozu', type: 'bullish', strength: 'strong' });
    }

    const hasBullishPattern = patterns.some(p => p.type === 'bullish');
    const hasStrongBullishPattern = patterns.some(p => p.type === 'bullish' && p.strength === 'strong');

    return {
        patterns,
        hasBullishPattern,
        hasStrongBullishPattern,
        currentCandle: {
            isBullish: body > 0,
            bodyPercent: (bodySize / totalRange * 100).toFixed(2)
        }
    };
};

/**
 * Analyze overall trend
 */
const analyzeTrend = (closes, emas) => {
    const recentCloses = closes.slice(-20);
    const startPrice = recentCloses[0];
    const endPrice = recentCloses[recentCloses.length - 1];
    const change = ((endPrice - startPrice) / startPrice * 100);

    // Count higher highs and higher lows
    let higherHighs = 0;
    let higherLows = 0;
    for (let i = 5; i < recentCloses.length; i++) {
        if (recentCloses[i] > recentCloses[i - 5]) higherHighs++;
    }

    const isUptrend = emas.aboveEma50 && emas.ema50Above200 && change > 0;
    const isDowntrend = !emas.aboveEma50 && !emas.ema50Above200 && change < 0;

    return {
        direction: isUptrend ? 'UP' : isDowntrend ? 'DOWN' : 'SIDEWAYS',
        strength: Math.abs(change) > 10 ? 'Strong' : Math.abs(change) > 5 ? 'Moderate' : 'Weak',
        change20Day: change.toFixed(2),
        isUptrend,
        isDowntrend,
        isSideways: !isUptrend && !isDowntrend,
        emaTrendAligned: emas.aboveEma50 && emas.ema50Above200
    };
};

/**
 * Find Support and Resistance levels
 */
const findSupportResistance = (candles) => {
    const closes = candles.map(c => c.close);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);

    const currentPrice = closes[closes.length - 1];

    // Find recent swing highs and lows
    const swingHighs = [];
    const swingLows = [];

    for (let i = 2; i < candles.length - 2; i++) {
        if (highs[i] > highs[i - 1] && highs[i] > highs[i - 2] &&
            highs[i] > highs[i + 1] && highs[i] > highs[i + 2]) {
            swingHighs.push(highs[i]);
        }
        if (lows[i] < lows[i - 1] && lows[i] < lows[i - 2] &&
            lows[i] < lows[i + 1] && lows[i] < lows[i + 2]) {
            swingLows.push(lows[i]);
        }
    }

    // Find nearest support (highest swing low below current price)
    const supportLevels = swingLows.filter(l => l < currentPrice).sort((a, b) => b - a);
    const nearestSupport = supportLevels[0] || lows[lows.length - 1];

    // Find nearest resistance (lowest swing high above current price)
    const resistanceLevels = swingHighs.filter(h => h > currentPrice).sort((a, b) => a - b);
    const nearestResistance = resistanceLevels[0] || highs[highs.length - 1];

    // Check if price is near support (within 2%)
    const nearSupport = (currentPrice - nearestSupport) / currentPrice < 0.02;

    return {
        nearestSupport,
        nearestResistance,
        supportLevels: supportLevels.slice(0, 3),
        resistanceLevels: resistanceLevels.slice(0, 3),
        nearSupport,
        distanceToSupport: ((currentPrice - nearestSupport) / currentPrice * 100).toFixed(2),
        distanceToResistance: ((nearestResistance - currentPrice) / currentPrice * 100).toFixed(2)
    };
};

/**
 * Detect Major Swing Trading Patterns
 * FLAG/PENNANT, TRIANGLE, DOUBLE TOP/BOTTOM, CONSOLIDATION BREAKOUT
 */
const detectSwingPatterns = (candles) => {
    const patterns = [];
    const closes = candles.map(c => c.close);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const volumes = candles.map(c => c.volume);

    const len = candles.length;
    const currentPrice = closes[len - 1];
    const avgVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const currentVolume = volumes[len - 1];

    // 1. FLAG/PENNANT PATTERN
    // Sharp move up (10%+ in 5-10 days) followed by sideways consolidation
    const flagPattern = detectFlagPattern(candles);
    if (flagPattern.detected) {
        patterns.push(flagPattern);
    }

    // 2. TRIANGLE PATTERN (Symmetrical/Ascending)
    const trianglePattern = detectTrianglePattern(candles);
    if (trianglePattern.detected) {
        patterns.push(trianglePattern);
    }

    // 3. DOUBLE TOP/BOTTOM
    const doublePattern = detectDoubleTopBottom(candles);
    if (doublePattern.detected) {
        patterns.push(doublePattern);
    }

    // 4. CONSOLIDATION BREAKOUT
    const consolidationPattern = detectConsolidationBreakout(candles);
    if (consolidationPattern.detected) {
        patterns.push(consolidationPattern);
    }

    const hasBullishPattern = patterns.some(p => p.type === 'bullish');
    const hasBreakout = patterns.some(p => p.isBreakout);

    return {
        patterns,
        hasBullishPattern,
        hasBreakout,
        patternCount: patterns.length,
        summary: patterns.length > 0 ? patterns.map(p => p.name).join(', ') : 'No major patterns detected'
    };
};

/**
 * Detect Flag/Pennant Pattern
 */
const detectFlagPattern = (candles) => {
    const len = candles.length;
    if (len < 20) return { detected: false };

    const closes = candles.map(c => c.close);
    const volumes = candles.map(c => c.volume);

    // Look for sharp move (flagpole) - 10%+ move in 5-10 days
    const lookbackStart = Math.max(0, len - 20);
    let maxMovePercent = 0;
    let poleEndIndex = -1;

    for (let i = lookbackStart; i < len - 5; i++) {
        for (let j = i + 5; j <= Math.min(i + 10, len - 5); j++) {
            const movePercent = ((closes[j] - closes[i]) / closes[i]) * 100;
            if (movePercent > maxMovePercent && movePercent > 10) {
                maxMovePercent = movePercent;
                poleEndIndex = j;
            }
        }
    }

    if (poleEndIndex === -1) return { detected: false };

    // Check for consolidation after the pole (price range narrows)
    const consolidationPrices = closes.slice(poleEndIndex);
    if (consolidationPrices.length < 3) return { detected: false };

    const consolidationHigh = Math.max(...consolidationPrices);
    const consolidationLow = Math.min(...consolidationPrices);
    const consolidationRange = ((consolidationHigh - consolidationLow) / consolidationLow) * 100;

    // Consolidation should be tight (< 5% range) and volume should dry up
    const consolidationVolumes = volumes.slice(poleEndIndex);
    const avgConsolidationVol = consolidationVolumes.reduce((a, b) => a + b, 0) / consolidationVolumes.length;
    const poleVolumes = volumes.slice(Math.max(0, poleEndIndex - 10), poleEndIndex);
    const avgPoleVol = poleVolumes.reduce((a, b) => a + b, 0) / poleVolumes.length;
    const volumeDryUp = avgConsolidationVol < avgPoleVol * 0.7;

    // Check for breakout
    const currentPrice = closes[len - 1];
    const isBreakout = currentPrice > consolidationHigh && volumes[len - 1] > avgConsolidationVol * 1.5;

    if (consolidationRange < 8 && (volumeDryUp || consolidationRange < 5)) {
        return {
            detected: true,
            name: 'Flag/Pennant',
            type: 'bullish',
            strength: 'strong',
            isBreakout,
            target: currentPrice + (currentPrice - closes[poleEndIndex - 5]) * 0.8, // Measured move
            description: `Sharp ${maxMovePercent.toFixed(1)}% move followed by ${consolidationRange.toFixed(1)}% consolidation. ${isBreakout ? 'BREAKOUT CONFIRMED!' : 'Watch for breakout above ' + consolidationHigh.toFixed(2)}`
        };
    }

    return { detected: false };
};

/**
 * Detect Triangle Pattern (Symmetrical/Ascending)
 */
const detectTrianglePattern = (candles) => {
    const len = candles.length;
    if (len < 15) return { detected: false };

    const recentCandles = candles.slice(-20);
    const highs = recentCandles.map(c => c.high);
    const lows = recentCandles.map(c => c.low);
    const closes = recentCandles.map(c => c.close);

    // Find swing highs and lows
    const swingHighs = [];
    const swingLows = [];

    for (let i = 2; i < recentCandles.length - 2; i++) {
        if (highs[i] > highs[i - 1] && highs[i] > highs[i - 2] && highs[i] > highs[i + 1] && highs[i] > highs[i + 2]) {
            swingHighs.push({ index: i, price: highs[i] });
        }
        if (lows[i] < lows[i - 1] && lows[i] < lows[i - 2] && lows[i] < lows[i + 1] && lows[i] < lows[i + 2]) {
            swingLows.push({ index: i, price: lows[i] });
        }
    }

    if (swingHighs.length < 2 || swingLows.length < 2) return { detected: false };

    // Check for converging highs (lower highs) and ascending/flat lows
    const highsTrend = swingHighs[swingHighs.length - 1].price < swingHighs[0].price;
    const lowsTrend = swingLows[swingLows.length - 1].price >= swingLows[0].price;

    // Ascending triangle: flat highs, higher lows
    const flatHighs = Math.abs(swingHighs[swingHighs.length - 1].price - swingHighs[0].price) / swingHighs[0].price < 0.02;
    const ascendingLows = swingLows[swingLows.length - 1].price > swingLows[0].price * 1.02;

    // Check for breakout
    const triangleHigh = Math.max(...swingHighs.map(h => h.price));
    const currentPrice = closes[closes.length - 1];
    const currentVolume = recentCandles[recentCandles.length - 1].volume;
    const avgVolume = recentCandles.slice(0, -1).reduce((a, c) => a + c.volume, 0) / (recentCandles.length - 1);
    const isBreakout = currentPrice > triangleHigh && currentVolume > avgVolume * 1.5;

    if (flatHighs && ascendingLows) {
        return {
            detected: true,
            name: 'Ascending Triangle',
            type: 'bullish',
            strength: 'strong',
            isBreakout,
            target: triangleHigh + (triangleHigh - swingLows[0].price),
            description: `Ascending triangle with resistance at ₹${triangleHigh.toFixed(2)}. ${isBreakout ? 'BREAKOUT CONFIRMED!' : 'Watch for breakout'}`
        };
    }

    if (highsTrend && lowsTrend) {
        return {
            detected: true,
            name: 'Symmetrical Triangle',
            type: 'neutral',
            strength: 'moderate',
            isBreakout,
            description: `Converging price action. Breakout direction will confirm trend.`
        };
    }

    return { detected: false };
};

/**
 * Detect Double Top/Bottom Pattern
 */
const detectDoubleTopBottom = (candles) => {
    const len = candles.length;
    if (len < 30) return { detected: false };

    const recentCandles = candles.slice(-40);
    const highs = recentCandles.map(c => c.high);
    const lows = recentCandles.map(c => c.low);
    const closes = recentCandles.map(c => c.close);

    // Find major swing highs for double top
    const swingHighs = [];
    const swingLows = [];

    for (let i = 3; i < recentCandles.length - 3; i++) {
        if (highs[i] === Math.max(...highs.slice(i - 3, i + 4))) {
            swingHighs.push({ index: i, price: highs[i] });
        }
        if (lows[i] === Math.min(...lows.slice(i - 3, i + 4))) {
            swingLows.push({ index: i, price: lows[i] });
        }
    }

    // Check for Double Bottom (W pattern - bullish reversal)
    if (swingLows.length >= 2) {
        const lastTwo = swingLows.slice(-2);
        const priceDiff = Math.abs(lastTwo[0].price - lastTwo[1].price) / lastTwo[0].price;
        const indexDiff = lastTwo[1].index - lastTwo[0].index;

        // Two lows at similar level, separated by at least 5 candles
        if (priceDiff < 0.03 && indexDiff >= 5) {
            const neckline = Math.max(...highs.slice(lastTwo[0].index, lastTwo[1].index));
            const currentPrice = closes[closes.length - 1];
            const isBreakout = currentPrice > neckline;
            const patternHeight = neckline - lastTwo[0].price;

            return {
                detected: true,
                name: 'Double Bottom',
                type: 'bullish',
                strength: 'strong',
                isBreakout,
                target: neckline + patternHeight,
                neckline,
                description: `W pattern with neckline at ₹${neckline.toFixed(2)}. ${isBreakout ? 'BREAKOUT CONFIRMED! Target: ₹' + (neckline + patternHeight).toFixed(2) : 'Watch for break above ₹' + neckline.toFixed(2)}`
            };
        }
    }

    // Check for Double Top (M pattern - bearish reversal)
    if (swingHighs.length >= 2) {
        const lastTwo = swingHighs.slice(-2);
        const priceDiff = Math.abs(lastTwo[0].price - lastTwo[1].price) / lastTwo[0].price;
        const indexDiff = lastTwo[1].index - lastTwo[0].index;

        if (priceDiff < 0.03 && indexDiff >= 5) {
            const neckline = Math.min(...lows.slice(lastTwo[0].index, lastTwo[1].index));
            const currentPrice = closes[closes.length - 1];
            const isBreakdown = currentPrice < neckline;

            return {
                detected: true,
                name: 'Double Top',
                type: 'bearish',
                strength: 'strong',
                isBreakout: isBreakdown,
                description: `M pattern with neckline at ₹${neckline.toFixed(2)}. ${isBreakdown ? 'BREAKDOWN - AVOID!' : 'Watch for support at ₹' + neckline.toFixed(2)}`
            };
        }
    }

    return { detected: false };
};

/**
 * Detect Consolidation Breakout
 */
const detectConsolidationBreakout = (candles) => {
    const len = candles.length;
    if (len < 15) return { detected: false };

    const volumes = candles.map(c => c.volume);
    const closes = candles.map(c => c.close);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);

    // Check for 2-4 weeks (10-20 days) of tight range
    for (let period = 10; period <= 20; period++) {
        if (len < period + 5) continue;

        const consolidationStart = len - period - 1;
        const consolidationPrices = closes.slice(consolidationStart, len - 1);
        const consolidationHighs = highs.slice(consolidationStart, len - 1);
        const consolidationLows = lows.slice(consolidationStart, len - 1);

        const rangeHigh = Math.max(...consolidationHighs);
        const rangeLow = Math.min(...consolidationLows);
        const rangePercent = ((rangeHigh - rangeLow) / rangeLow) * 100;

        // Tight range = less than 8% price movement
        if (rangePercent < 8) {
            const currentPrice = closes[len - 1];
            const currentVolume = volumes[len - 1];
            const avgConsolidationVol = volumes.slice(consolidationStart, len - 1).reduce((a, b) => a + b, 0) / period;

            // Check for breakout with volume spike
            const isBreakout = currentPrice > rangeHigh && currentVolume > avgConsolidationVol * 1.5;
            const isBreakdown = currentPrice < rangeLow && currentVolume > avgConsolidationVol * 1.5;

            if (isBreakout || rangePercent < 6) {
                return {
                    detected: true,
                    name: 'Consolidation Breakout',
                    type: isBreakout ? 'bullish' : 'neutral',
                    strength: isBreakout ? 'strong' : 'moderate',
                    isBreakout,
                    rangeHigh,
                    rangeLow,
                    target: rangeHigh + (rangeHigh - rangeLow), // Width of consolidation
                    description: `${period} days consolidation (${rangePercent.toFixed(1)}% range). ${isBreakout ? `BREAKOUT! Target: ₹${(rangeHigh + (rangeHigh - rangeLow)).toFixed(2)}` : `Watch for break above ₹${rangeHigh.toFixed(2)}`}`
                };
            }
        }
    }

    return { detected: false };
};

/**
 * Calculate Confluence Checklist
 * Must have 3/4 confirmations for a valid swing trade
 */
const calculateConfluence = (indicators) => {
    const { emas, rsi, macd, volumeAnalysis, trendAnalysis, supportResistance } = indicators;
    const currentPrice = indicators.currentPrice;

    const confluenceChecks = {
        trend: {
            name: 'Trend Confirmation',
            checks: [],
            score: 0,
            maxScore: 2,
            passed: false
        },
        volume: {
            name: 'Volume Confirmation',
            checks: [],
            score: 0,
            maxScore: 2,
            passed: false
        },
        momentum: {
            name: 'Momentum Confirmation',
            checks: [],
            score: 0,
            maxScore: 2,
            passed: false
        },
        pattern: {
            name: 'Pattern Confirmation',
            checks: [],
            score: 0,
            maxScore: 2,
            passed: false
        }
    };

    // 1. TREND CONFIRMATION
    // Price above 20 & 50 EMA (for long)
    if (emas.aboveEma20) {
        confluenceChecks.trend.checks.push('✅ Price above 20 EMA');
        confluenceChecks.trend.score += 1;
    } else {
        confluenceChecks.trend.checks.push('❌ Price below 20 EMA');
    }

    if (emas.aboveEma50) {
        confluenceChecks.trend.checks.push('✅ Price above 50 EMA');
        confluenceChecks.trend.score += 1;
    } else {
        confluenceChecks.trend.checks.push('❌ Price below 50 EMA');
    }

    // Stock in clear uptrend (HH & HL) - use trend analysis
    if (trendAnalysis.isUptrend) {
        confluenceChecks.trend.checks.push('✅ Clear uptrend (Higher Highs & Higher Lows)');
    }

    confluenceChecks.trend.passed = confluenceChecks.trend.score >= 2;

    // 2. VOLUME CONFIRMATION
    // Volume > 1.5x 20-day average
    const volumeRatio = parseFloat(volumeAnalysis.ratio);
    if (volumeRatio >= 1.5) {
        confluenceChecks.volume.checks.push(`✅ High volume (${volumeRatio}x average)`);
        confluenceChecks.volume.score += 2;
    } else if (volumeRatio >= 1.2) {
        confluenceChecks.volume.checks.push(`⚠️ Moderate volume (${volumeRatio}x average)`);
        confluenceChecks.volume.score += 1;
    } else {
        confluenceChecks.volume.checks.push(`❌ Low volume (${volumeRatio}x average)`);
    }

    confluenceChecks.volume.passed = confluenceChecks.volume.score >= 1;

    // 3. MOMENTUM CONFIRMATION
    // RSI in favorable zone (40-70 for long)
    if (rsi.current >= 40 && rsi.current <= 70) {
        confluenceChecks.momentum.checks.push(`✅ RSI in favorable zone (${rsi.current.toFixed(1)})`);
        confluenceChecks.momentum.score += 1;
    } else if (rsi.current < 40) {
        confluenceChecks.momentum.checks.push(`⚠️ RSI oversold (${rsi.current.toFixed(1)}) - potential bounce`);
        confluenceChecks.momentum.score += 0.5;
    } else {
        confluenceChecks.momentum.checks.push(`❌ RSI overbought (${rsi.current.toFixed(1)}) - risky entry`);
    }

    // MACD histogram positive
    if (macd.histogram > 0) {
        confluenceChecks.momentum.checks.push('✅ MACD histogram positive');
        confluenceChecks.momentum.score += 1;
    } else if (macd.histogramIncreasing) {
        confluenceChecks.momentum.checks.push('⚠️ MACD histogram improving');
        confluenceChecks.momentum.score += 0.5;
    } else {
        confluenceChecks.momentum.checks.push('❌ MACD histogram negative');
    }

    confluenceChecks.momentum.passed = confluenceChecks.momentum.score >= 1.5;

    // 4. PATTERN CONFIRMATION
    // Close above resistance (for long)
    const distToResistance = parseFloat(supportResistance.distanceToResistance);
    if (distToResistance < 1) {
        confluenceChecks.pattern.checks.push('⚠️ Near resistance - potential breakout');
        confluenceChecks.pattern.score += 1;
    } else if (distToResistance > 5) {
        confluenceChecks.pattern.checks.push('✅ Room to move (far from resistance)');
        confluenceChecks.pattern.score += 1;
    } else {
        confluenceChecks.pattern.checks.push('➖ Moderate distance from resistance');
        confluenceChecks.pattern.score += 0.5;
    }

    // Check if bouncing from support
    if (supportResistance.nearSupport) {
        confluenceChecks.pattern.checks.push('✅ Bouncing from support level');
        confluenceChecks.pattern.score += 1;
    }

    confluenceChecks.pattern.passed = confluenceChecks.pattern.score >= 1;

    // Calculate overall confluence
    const passedCount = [
        confluenceChecks.trend.passed,
        confluenceChecks.volume.passed,
        confluenceChecks.momentum.passed,
        confluenceChecks.pattern.passed
    ].filter(p => p).length;

    return {
        ...confluenceChecks,
        passedCount,
        totalChecks: 4,
        isValid: passedCount >= 3,
        summary: passedCount >= 4 ? '🟢 STRONG CONFLUENCE (4/4)' :
            passedCount >= 3 ? '🟢 VALID CONFLUENCE (3/4)' :
                passedCount >= 2 ? '🟡 WEAK CONFLUENCE (2/4)' :
                    '🔴 NO CONFLUENCE'
    };
};

module.exports = {
    calculateIndicators,
    calculateRSI,
    calculateMACD,
    calculateEMAs,
    calculateADX,
    analyzeVolume,
    calculateBollingerBands,
    calculateATR,
    detectCandlePatterns,
    detectSwingPatterns,
    calculateConfluence,
    analyzeTrend,
    findSupportResistance
};
