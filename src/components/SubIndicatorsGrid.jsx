import React from 'react';
import { Layers, Activity, Shield, TrendingUp, BarChart2, DollarSign } from 'lucide-react';
import { getSentimentCategory } from '../constants/config';

export default function SubIndicatorsGrid({ data }) {
  if (!data || !data.subIndicators || Object.keys(data.subIndicators).length === 0) {
    return null;
  }

  const {
    sp500Momentum,
    vixVolatility,
    stockPriceStrength,
    stockPriceBreadth,
    putCallOptions,
    junkBondDemand,
    safeHavenDemand
  } = data.subIndicators;

  const indicators = [
    {
      name: 'Market Momentum',
      detail: 'S&P 500 vs 125-day average',
      item: sp500Momentum,
      icon: <TrendingUp className="w-4 h-4 text-blue-400" />
    },
    {
      name: 'Market Volatility',
      detail: 'VIX vs 50-day average',
      item: vixVolatility,
      icon: <Activity className="w-4 h-4 text-amber-400" />
    },
    {
      name: 'Stock Price Strength',
      detail: '52-week highs vs lows',
      item: stockPriceStrength,
      icon: <BarChart2 className="w-4 h-4 text-emerald-400" />
    },
    {
      name: 'Stock Price Breadth',
      detail: 'McClellan volume index',
      item: stockPriceBreadth,
      icon: <Layers className="w-4 h-4 text-sky-400" />
    },
    {
      name: 'Put and Call Options',
      detail: 'CBOE put/call ratio',
      item: putCallOptions,
      icon: <DollarSign className="w-4 h-4 text-purple-400" />
    },
    {
      name: 'Junk Bond Demand',
      detail: 'Yield spread vs investment grade',
      item: junkBondDemand,
      icon: <Shield className="w-4 h-4 text-rose-400" />
    },
    {
      name: 'Safe Haven Demand',
      detail: 'Stocks vs 20-day treasuries',
      item: safeHavenDemand,
      icon: <Activity className="w-4 h-4 text-indigo-400" />
    }
  ].filter(ind => ind.item && typeof ind.item.score === 'number');

  if (indicators.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <h3 className="text-base font-bold text-slate-100">Market Driver Indicators</h3>
          <p className="text-xs text-slate-400 mt-0.5">7 core market components</p>
        </div>
        <span className="text-xs text-slate-400">CNN Data Feeds</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 mt-5">
        {indicators.map((ind, idx) => {
          const score = ind.item.score;
          const rating = ind.item.rating || 'neutral';
          const sentiment = getSentimentCategory(score);

          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 truncate">
                    {ind.icon}
                    <span className="truncate">{ind.name}</span>
                  </div>
                  <span className={`text-[10px] font-semibold capitalize px-2 py-0.5 rounded border shrink-0 ${sentiment.color} ${sentiment.bg} ${sentiment.border}`}>
                    {rating}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-mono text-white">
                    {score.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">0-100 scale</span>
                </div>
              </div>

              {/* Progress track */}
              <div className="w-full bg-slate-900 rounded-full h-1.5 mt-3 overflow-hidden border border-slate-800">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, score))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
