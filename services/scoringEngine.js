/**
 * Scoring Engine
 * Multi-factor confirmation system for swing trading signals
 * Only signals scoring 7+ out of 10 are considered actionable
 */

const { calculateIndicators } = require('./technicalAnalysis');

/**
 * Calculate comprehensive score for a stock
 * @param {Object} stockData - Stock data with candles
 * @param {Object} marketHealth - Nifty 50 health data
 * @returns {Object} Score breakdown and final signal
 */
const calculateScore = (stockData, marketHealth = null) => {
    const { candles, fiftyTwoWeekHigh, fiftyTwoWeekLow } = stockData;

    if (!candles || candles.length < 26) {
        return {
            score: 0,
            signal: 'INSUFFICIENT_DATA',
            breakdown: {},
            error: 'Need at least 50 days of data'
        };
    }

    try {
        const indicators = calculateIndicators(candles);
        const breakdown = {};
        let totalScore = 0;

        // Factor 1: Trend Alignment (1.5 points)
        // Price above 50 EMA AND 50 EMA above 200 EMA
        const trendScore = calculateTrendScore(indicators);
        breakdown.trend = trendScore;
        totalScore += trendScore.score;

        // Factor 2: RSI Sweet Spot (1.0 point)
        // RSI between 40-60 OR recovering from 30-40
        const rsiScore = calculateRSIScore(indicators.rsi);
        breakdown.rsi = rsiScore;
        totalScore += rsiScore.score;

        // Factor 3: MACD Bullish (1.0 point)
        // MACD above signal OR fresh crossover
        const macdScore = calculateMACDScore(indicators.macd);
        breakdown.macd = macdScore;
        totalScore += macdScore.score;

        // Factor 4: Volume Confirmation (1.5 points)
        // Today's volume > 1.5x 20-day average
        const volumeScore = calculateVolumeScore(indicators.volumeAnalysis);
        breakdown.volume = volumeScore;
        totalScore += volumeScore.score;

        // Factor 5: Price Action / Candlestick Pattern (1.0 point)
        // Bullish pattern detected
        const patternScore = calculatePatternScore(indicators.candlePatterns);
        breakdown.pattern = patternScore;
        totalScore += patternScore.score;

        // Factor 6: Support/Resistance (1.0 point)
        // Price bouncing from key support
        const supportScore = calculateSupportScore(indicators);
        breakdown.support = supportScore;
        totalScore += supportScore.score;

        // Factor 7: ADX Strength (1.0 point)
        // ADX > 25 (trending, not ranging)
        const adxScore = calculateADXScore(indicators.adx);
        breakdown.adx = adxScore;
        totalScore += adxScore.score;

        // Factor 8: Sector Strength (0.5 points)
        // Skip if no market data available
        const sectorScore = { score: 0, reason: 'Sector analysis not available', max: 0.5 };
        breakdown.sector = sectorScore;

        // Factor 9: 52-Week Position (0.5 point)
        // Price between 20-80% of 52-week range
        const weekPositionScore = calculate52WeekScore(indicators.currentPrice, fiftyTwoWeekHigh, fiftyTwoWeekLow);
        breakdown.week52 = weekPositionScore;
        totalScore += weekPositionScore.score;

        // Factor 10: Risk-Reward (1.0 point)
        // R:R >= 1:2
        const rrScore = calculateRiskRewardScore(indicators);
        breakdown.riskReward = rrScore;
        totalScore += rrScore.score;

        // Calculate entry, target, stop loss
        const tradeSetup = calculateTradeSetup(indicators);

        // Determine final signal
        const signal = getSignal(totalScore);

        // Generate signal reasons for display
        const signalReasons = generateSignalReasons(breakdown, totalScore);

        return {
            score: Math.round(totalScore * 10) / 10,
            maxScore: 10,
            signal: signal.type,
            signalEmoji: signal.emoji,
            signalText: signal.text,
            confidence: signal.confidence,
            signalReasons,
            breakdown,
            indicators: {
                rsi: indicators.rsi.current,
                macdHistogram: indicators.macd.histogram,
                macdBullish: indicators.macd.isBullish,
                volumeRatio: indicators.volumeAnalysis.ratio,
                adx: indicators.adx.adx,
                trend: indicators.trendAnalysis.direction,
                ema50: indicators.emas.ema50,
                ema200: indicators.emas.ema200
            },
            tradeSetup,
            currentPrice: indicators.currentPrice,
            priceChange: ((indicators.currentPrice - indicators.previousClose) / indicators.previousClose * 100).toFixed(2)
        };

    } catch (error) {
        return {
            score: 0,
            signal: 'ERROR',
            breakdown: {},
            error: error.message
        };
    }
};

/**
 * Factor 1: Trend Alignment Score
 */
const calculateTrendScore = (indicators) => {
    const { emas, trendAnalysis } = indicators;
    let score = 0;
    let reasons = [];

    if (emas.aboveEma50) {
        score += 0.5;
        reasons.push('Price above 50 EMA');
    }

    if (emas.ema50Above200) {
        score += 0.5;
        reasons.push('50 EMA above 200 EMA');
    }

    if (trendAnalysis.isUptrend) {
        score += 0.5;
        reasons.push('Confirmed uptrend');
    }

    return {
        score: Math.min(score, 1.5),
        max: 1.5,
        reasons,
        passed: score >= 1.0
    };
};

/**
 * Factor 2: RSI Score
 */
const calculateRSIScore = (rsi) => {
    let score = 0;
    let reasons = [];

    if (rsi.inSwingZone) {
        score = 1.0;
        reasons.push(`RSI at ${rsi.current.toFixed(1)} - momentum room available`);
    } else if (rsi.isRecovering) {
        score = 1.0;
        reasons.push('RSI recovering from oversold zone');
    } else if (rsi.current >= 35 && rsi.current <= 65) {
        score = 0.5;
        reasons.push(`RSI at ${rsi.current.toFixed(1)} - acceptable range`);
    } else if (rsi.isOverbought) {
        score = 0;
        reasons.push('RSI overbought - risky entry');
    } else if (rsi.isOversold) {
        score = 0.5;
        reasons.push('RSI oversold - potential reversal');
    }

    return {
        score,
        max: 1.0,
        reasons,
        value: rsi.current,
        passed: score >= 0.5
    };
};

/**
 * Factor 3: MACD Score
 */
const calculateMACDScore = (macd) => {
    let score = 0;
    let reasons = [];

    if (macd.bullishCrossover) {
        score = 1.0;
        reasons.push('Fresh MACD bullish crossover');
    } else if (macd.recentBullishCrossover) {
        score = 0.8;
        reasons.push('Recent MACD bullish crossover (within 3 days)');
    } else if (macd.isBullish && macd.histogramIncreasing) {
        score = 0.7;
        reasons.push('MACD bullish with increasing momentum');
    } else if (macd.isBullish) {
        score = 0.5;
        reasons.push('MACD above signal line');
    }

    return {
        score,
        max: 1.0,
        reasons,
        passed: score >= 0.5
    };
};

/**
 * Factor 4: Volume Score
 */
const calculateVolumeScore = (volumeAnalysis) => {
    let score = 0;
    let reasons = [];

    if (volumeAnalysis.isVeryHighVolume) {
        score = 1.5;
        reasons.push(`Volume ${volumeAnalysis.ratio}x average - very high interest`);
    } else if (volumeAnalysis.isHighVolume) {
        score = 1.2;
        reasons.push(`Volume ${volumeAnalysis.ratio}x average - strong interest`);
    } else if (volumeAnalysis.isAboveAverage) {
        score = 0.8;
        reasons.push(`Volume ${volumeAnalysis.ratio}x average - above normal`);
    } else {
        score = 0.3;
        reasons.push('Below average volume');
    }

    return {
        score: Math.min(score, 1.5),
        max: 1.5,
        reasons,
        ratio: volumeAnalysis.ratio,
        passed: score >= 0.8
    };
};

/**
 * Factor 5: Candlestick Pattern Score
 */
const calculatePatternScore = (patterns) => {
    let score = 0;
    let reasons = [];

    if (patterns.hasStrongBullishPattern) {
        score = 1.0;
        const strongPatterns = patterns.patterns.filter(p => p.strength === 'strong');
        reasons.push(`Strong pattern: ${strongPatterns.map(p => p.name).join(', ')}`);
    } else if (patterns.hasBullishPattern) {
        score = 0.6;
        const bullishPatterns = patterns.patterns.filter(p => p.type === 'bullish');
        reasons.push(`Bullish pattern: ${bullishPatterns.map(p => p.name).join(', ')}`);
    } else if (patterns.currentCandle.isBullish) {
        score = 0.3;
        reasons.push('Current candle is bullish');
    }

    return {
        score,
        max: 1.0,
        reasons,
        patterns: patterns.patterns,
        passed: score >= 0.5
    };
};

/**
 * Factor 6: Support/Resistance Score
 */
const calculateSupportScore = (indicators) => {
    const { supportResistance, emas } = indicators;
    let score = 0;
    let reasons = [];

    // Near EMA support
    const distFrom20 = Math.abs(parseFloat(emas.distanceFromEma20));
    const distFrom50 = Math.abs(parseFloat(emas.distanceFromEma50));

    if (distFrom20 <= 1 && emas.aboveEma20) {
        score += 0.5;
        reasons.push('Price near 20 EMA support');
    }

    if (distFrom50 <= 2 && emas.aboveEma50) {
        score += 0.3;
        reasons.push('Price near 50 EMA support');
    }

    if (supportResistance.nearSupport) {
        score += 0.2;
        reasons.push('Near swing low support');
    }

    return {
        score: Math.min(score, 1.0),
        max: 1.0,
        reasons,
        passed: score >= 0.4
    };
};

/**
 * Factor 7: ADX Score
 */
const calculateADXScore = (adx) => {
    let score = 0;
    let reasons = [];

    if (adx.isStrongTrend && adx.isBullishTrend) {
        score = 1.0;
        reasons.push(`Strong bullish trend (ADX: ${adx.adx.toFixed(1)})`);
    } else if (adx.isTrending && adx.isBullishTrend) {
        score = 0.7;
        reasons.push(`Moderate bullish trend (ADX: ${adx.adx.toFixed(1)})`);
    } else if (adx.isTrending) {
        score = 0.4;
        reasons.push(`Trending market (ADX: ${adx.adx.toFixed(1)})`);
    } else {
        score = 0;
        reasons.push('Ranging market - weak trend');
    }

    return {
        score,
        max: 1.0,
        reasons,
        value: adx.adx,
        passed: score >= 0.5
    };
};

/**
 * Factor 9: 52-Week Position Score
 */
const calculate52WeekScore = (currentPrice, high52, low52) => {
    let score = 0;
    let reasons = [];

    if (!high52 || !low52) {
        return { score: 0, max: 0.5, reasons: ['52-week data not available'], passed: false };
    }

    const range = high52 - low52;
    const position = ((currentPrice - low52) / range * 100);

    if (position >= 20 && position <= 80) {
        score = 0.5;
        reasons.push(`Price at ${position.toFixed(0)}% of 52-week range`);
    } else if (position < 20) {
        score = 0.3;
        reasons.push('Near 52-week low - recovery potential');
    } else {
        score = 0;
        reasons.push('Near 52-week high - risky entry');
    }

    return {
        score,
        max: 0.5,
        reasons,
        position: position.toFixed(0),
        passed: score >= 0.3
    };
};

/**
 * Factor 10: Risk-Reward Score
 */
const calculateRiskRewardScore = (indicators) => {
    const { currentPrice, atr, supportResistance } = indicators;
    let score = 0;
    let reasons = [];

    const stopLoss = Math.max(
        currentPrice - (atr.value * 2),
        supportResistance.nearestSupport * 0.99
    );

    const target = Math.min(
        currentPrice + (atr.value * 3),
        supportResistance.nearestResistance * 0.99
    );

    const risk = currentPrice - stopLoss;
    const reward = target - currentPrice;
    const rrRatio = reward / risk;

    if (rrRatio >= 3) {
        score = 1.0;
        reasons.push(`Excellent R:R ratio of 1:${rrRatio.toFixed(1)}`);
    } else if (rrRatio >= 2) {
        score = 0.7;
        reasons.push(`Good R:R ratio of 1:${rrRatio.toFixed(1)}`);
    } else if (rrRatio >= 1.5) {
        score = 0.4;
        reasons.push(`Acceptable R:R ratio of 1:${rrRatio.toFixed(1)}`);
    } else {
        score = 0;
        reasons.push(`Poor R:R ratio of 1:${rrRatio.toFixed(1)}`);
    }

    return {
        score,
        max: 1.0,
        reasons,
        ratio: rrRatio.toFixed(2),
        passed: score >= 0.5
    };
};

/**
 * Calculate Trade Setup
 */
const calculateTradeSetup = (indicators) => {
    const { currentPrice, atr, supportResistance } = indicators;

    // Entry: Current price (or slight pullback)
    const entry = currentPrice;

    // Stop Loss: 2x ATR below entry or just below support
    const stopLoss = Math.max(
        currentPrice - (atr.value * 2),
        supportResistance.nearestSupport * 0.99
    );

    // Target 1: 2x ATR above entry
    const target1 = currentPrice + (atr.value * 2);

    // Target 2: 3x ATR above entry or near resistance
    const target2 = Math.min(
        currentPrice + (atr.value * 3),
        supportResistance.nearestResistance * 0.99
    );

    const risk = entry - stopLoss;
    const reward = target2 - entry;

    return {
        entry: entry.toFixed(2),
        stopLoss: stopLoss.toFixed(2),
        target1: target1.toFixed(2),
        target2: target2.toFixed(2),
        riskPercent: ((risk / entry) * 100).toFixed(2),
        rewardPercent: ((reward / entry) * 100).toFixed(2),
        riskRewardRatio: (reward / risk).toFixed(2),
        positionSizeNote: `Risk ${((risk / entry) * 100).toFixed(1)}% per trade`
    };
};

/**
 * Generate Signal Reasons
 * Aggregates key reasons from the breakdown for display
 */
const generateSignalReasons = (breakdown, score) => {
    const reasons = [];
    const issues = [];

    // Collect positive factors (passed = true)
    const factors = ['trend', 'rsi', 'macd', 'volume', 'pattern', 'support', 'adx', 'week52', 'riskReward'];

    for (const factor of factors) {
        const data = breakdown[factor];
        if (data && data.reasons && data.reasons.length > 0) {
            if (data.passed) {
                // Good factor - add first reason
                reasons.push(data.reasons[0]);
            } else if (data.score === 0) {
                // Failed factor - add as issue
                issues.push(data.reasons[0]);
            }
        }
    }

    // For BUY/STRONG_BUY signals (score >= 7), show positive reasons
    // For WATCHLIST (score 5-6.9), show mix of positives and what's missing
    // For AVOID (score < 5), show what's wrong

    if (score >= 7) {
        return {
            type: 'bullish',
            title: score >= 8 ? '🔥 Strong Setup' : '✅ Buy Reasons',
            items: reasons.slice(0, 4), // Top 4 reasons
            summary: `${reasons.length} bullish factors confirmed`
        };
    } else if (score >= 5) {
        return {
            type: 'neutral',
            title: '⏳ Watch For',
            items: [...reasons.slice(0, 2), ...issues.slice(0, 2)],
            summary: `${reasons.length} positive, needs ${issues.length} more confirmations`
        };
    } else {
        return {
            type: 'bearish',
            title: '⚠️ Avoid Because',
            items: issues.slice(0, 4),
            summary: `${issues.length} negative factors detected`
        };
    }
};

/**
 * Get Signal Classification
 */
const getSignal = (score) => {
    if (score >= 8) {
        return {
            type: 'STRONG_BUY',
            emoji: '🟢',
            text: 'Strong Buy - High confidence setup',
            confidence: 'HIGH'
        };
    } else if (score >= 7) {
        return {
            type: 'BUY',
            emoji: '🟡',
            text: 'Buy - Good setup with caution',
            confidence: 'MEDIUM'
        };
    } else if (score >= 5) {
        return {
            type: 'WATCHLIST',
            emoji: '⚪',
            text: 'Watchlist - Monitor for better entry',
            confidence: 'LOW'
        };
    } else {
        return {
            type: 'AVOID',
            emoji: '🔴',
            text: 'Avoid - Weak setup',
            confidence: 'NONE'
        };
    }
};

/**
 * Screen multiple stocks and rank by score
 */
const screenStocks = async (stocksWithData, marketHealth = null) => {
    const results = [];

    for (const stock of stocksWithData) {
        if (stock.data && stock.data.candles) {
            const scoreResult = calculateScore(stock.data, marketHealth);
            results.push({
                symbol: stock.symbol,
                name: stock.data.name || stock.symbol,
                ...scoreResult
            });
        }
    }

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
};

module.exports = {
    calculateScore,
    screenStocks,
    getSignal
};
