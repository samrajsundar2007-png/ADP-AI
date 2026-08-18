import React from 'react';
import { useDataset } from '../context/Datasetcontext';

export default function SummaryPannel() {
  const { summary } = useDataset();

  if (!summary) {
    return (
      <div className="p-4 rounded-xl border border-white/5 bg-slate-900/30 text-center text-xs text-slate-500 py-8">
        Awaiting dataset analysis to profile mathematical features.
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm space-y-4">
      <div className="text-sm font-medium text-slate-200">📊 Architectural Summary</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-950/60 border border-white/5 p-3 rounded-lg">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Metrics Block</div>
          <div className="text-xl font-bold text-slate-200 mt-0.5">{summary.rows}</div>
        </div>
        <div className="bg-slate-950/60 border border-white/5 p-3 rounded-lg">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Dimensional Matrix</div>
          <div className="text-xl font-bold text-slate-200 mt-0.5">{summary.columns}</div>
        </div>
      </div>
      <div className="bg-slate-950/40 border border-white/5 p-3 rounded-lg flex items-center justify-between">
        <span className="text-xs text-slate-400">Target Pipeline Matrix</span>
        <span className="text-[10px] px-2 py-0.5 font-bold uppercase rounded bg-indigo-500/10 text-indigo-400 tracking-wider">{summary.suggested_task}</span>
      </div>
    </div>
  );
}
