//@version=5
strategy("NIFTY50 EMA Trend Strategy", overlay=true, 
     initial_capital=1000000, commission_type=strategy.commission.percent, commission_value=0.02)

// ─────────────────────────────────────
// INPUTS
// ─────────────────────────────────────
emaFastLen = input.int(20, "Fast EMA")
emaSlowLen = input.int(50, "Slow EMA")
emaTrendLen = input.int(200, "Trend EMA")
rsiLen      = input.int(14, "RSI Length")
atrLen      = input.int(14, "ATR Length")

// ─────────────────────────────────────
// INDICATORS
// ─────────────────────────────────────
emaFast  = ta.ema(close, emaFastLen)
emaSlow  = ta.ema(close, emaSlowLen)
emaTrend = ta.ema(close, emaTrendLen)
rsi      = ta.rsi(close, rsiLen)
atr      = ta.atr(atrLen)

// ─────────────────────────────────────
// CONDITIONS
// ─────────────────────────────────────
bullTrend = close > emaTrend
bearTrend = close < emaTrend

bullSignal = ta.crossover(emaFast, emaSlow) and rsi > 50 and bullTrend
bearSignal = ta.crossunder(emaFast, emaSlow) and rsi < 50 and bearTrend

// Stop Loss / Take Profit
longSL  = close - 1.5 * atr
longTP  = close + 2 * atr
shortSL = close + 1.5 * atr
shortTP = close - 2 * atr

// ─────────────────────────────────────
// ORDERS
// ─────────────────────────────────────
if (bullSignal)
    strategy.entry("Long", strategy.long)
    strategy.exit("Long Exit", "Long", stop=longSL, limit=longTP)

if (bearSignal)
    strategy.entry("Short", strategy.short)
    strategy.exit("Short Exit", "Short", stop=shortSL, limit=shortTP)

// ─────────────────────────────────────
// PLOTTING
// ─────────────────────────────────────
plot(emaFast,  "EMA 20", color=color.yellow)
plot(emaSlow,  "EMA 50", color=color.orange)
plot(emaTrend, "EMA 200", color=color.blue)
