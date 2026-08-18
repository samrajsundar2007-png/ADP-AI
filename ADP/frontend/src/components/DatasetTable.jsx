import React from 'react';

export default function DatasetTable({ dataHeaders, dataRows, onClose }) {
  return (
    <div className="flex-1 flex flex-col bg-slate-950/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden animate-fadeIn h-full">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-white/5 bg-slate-900/40 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Full Dataset Explorer</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Showing all rows and dimensions</p>
        </div>
        <button 
          onClick={onClose}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl border border-white/5 transition"
        >
          ✕ Back to Co-Pilot Chat
        </button>
      </div>

      {/* Scrollable Table View */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-slate-900/80 sticky top-0 border-b border-white/5 backdrop-blur">
              {dataHeaders.map((header, idx) => (
                <th key={idx} className="p-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {dataRows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-white/[0.02] transition-colors">
                {dataHeaders.map((header, colIdx) => (
                  <td key={colIdx} className="p-3 text-xs text-slate-300 font-mono">
                    {row[header] ?? row[colIdx]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}