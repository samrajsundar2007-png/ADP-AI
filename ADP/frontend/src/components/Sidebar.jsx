  import React from 'react';
  import UploadBox from './UploadBox';
  import ExportPanel from './ExportPanel';
  import { useApp } from '../App';

  export default function Sidebar() {
    const { healthReport } = useApp();

    return (
      <aside className="w-80 border-r border-white/5 bg-slate-950/40 backdrop-blur-md p-6 flex flex-col gap-5 overflow-y-auto shrink-0 relative z-10">
        <div className="space-y-1">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ingestion Core</h3>
          <p className="text-[11px] text-slate-500 leading-normal">Ingest raw structured datasets to run immediate diagnostic models.</p>
        </div>
        
        <UploadBox />

        {healthReport ? (
          <div className="flex-1 flex flex-col gap-4 animate-fadeIn min-h-0">
            
            {/* Synced with your custom .glass-panel-glow container token parameters */}
            <div className="p-4 rounded-xl glass-panel-glow space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Data Integrity Score</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${healthReport.data_quality_score > 75 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                  {healthReport.data_quality_score}%
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 p-0.5 border border-white/5 rounded-full">
                <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full transition-all duration-700" style={{ width: `${healthReport.data_quality_score}%` }}></div>
              </div>
            </div>

            {/* Synced with your custom .glass-panel metric layout borders */}
            <div className="p-4 rounded-xl glass-panel space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Suggested Target Index</span>
              <div className="text-xs font-semibold text-indigo-300 font-mono bg-indigo-500/10 px-3 py-2 rounded-lg border border-indigo-500/10 break-all flex items-center gap-2">
                🎯 {healthReport.suggested_target_columns?.[0] || "None Detected"}
              </div>
            </div>

            <div className="p-4 rounded-xl glass-panel flex-1 overflow-y-auto min-h-[140px] space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Recommended Processing Steps</span>
              <ul className="space-y-2">
                {healthReport.recommended_preprocessing_steps?.map((step, idx) => (
                  <li key={idx} className="text-[11px] text-slate-400 flex gap-2.5 leading-relaxed bg-white/[0.01] border border-white/[0.02] p-2 rounded-lg">
                    <span className="text-indigo-400 font-bold select-none">✓</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl p-6 text-center bg-white/[0.01]">
            <div className="w-10 h-10 rounded-full bg-slate-900/60 border border-white/5 flex items-center justify-center text-slate-400 text-base mb-3 shadow-inner">📊</div>
            <p className="text-xs font-semibold text-slate-400">System Awaiting Ingestion</p>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal max-w-[180px]">Load an external data asset file to compile diagnostic schemas live.</p>
          </div>
        )}
        
        <ExportPanel />
      </aside>
    );
  }
