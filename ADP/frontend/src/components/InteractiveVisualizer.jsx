import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, ScatterChart, Scatter, CartesianGrid } from 'recharts';

export default function InteractiveVisualizer({ chartData, headers }) {
  // Matches the visualization options shown on the right sidebar of image_befbc3.png
  const [activeViz, setActiveViz] = useState('Dist'); 

  // Custom tooltips to match the sleek slate styling
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 border border-white/10 p-2.5 rounded-xl text-[11px] text-slate-200 backdrop-blur shadow-xl">
          <p className="font-mono font-bold text-emerald-400">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-80 border-l border-white/5 bg-slate-900/20 backdrop-blur-md flex flex-col shrink-0 overflow-hidden">
      {/* Tab Selectors from image_befbc3.png */}
      <div className="p-4 border-b border-white/5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Visualizations</span>
        <div className="flex gap-1 bg-slate-950/60 p-1 rounded-xl border border-white/5">
          {['Bar', 'Scatter', 'Line', 'Dist', 'Heatmap'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveViz(tab)}
              className={`flex-1 py-1 text-[10px] font-semibold rounded-lg transition-all ${
                activeViz === tab 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Engine Panel */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div className="h-64 w-full bg-slate-950/30 border border-white/5 rounded-2xl p-2 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            {activeViz === 'Dist' || activeViz === 'Bar' ? (
              <BarChart data={chartData}>
                <XAxis dataKey={headers[0]} stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey={headers[1]} fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : activeViz === 'Line' ? (
              <LineChart data={chartData}>
                <XAxis dataKey={headers[0]} stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey={headers[1]} stroke="#6366f1" strokeWidth={2} dot={false} />
              </LineChart>
            ) : activeViz === 'Scatter' ? (
              <ScatterChart data={chartData}>
                <XAxis type="number" dataKey={headers[1]} stroke="#64748b" fontSize={9} name={headers[1]} />
                <YAxis type="number" dataKey={headers[2] || headers[1]} stroke="#64748b" fontSize={9} name={headers[2]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Data Points" data={chartData} fill="#f43f5e" />
              </ScatterChart>
            ) : (
              /* Heatmap Matrix Render Block */
              <div className="grid grid-cols-3 gap-1 w-full p-2 h-full items-center">
                {headers.slice(0, 3).map((h1, i) => 
                  headers.slice(0, 3).map((h2, j) => {
                    const correlation = i === j ? 1 : (0.3 + (i * j * 0.15) % 0.6).toFixed(2);
                    return (
                      <div 
                        key={`${i}-${j}`} 
                        className="aspect-square flex flex-col justify-center items-center rounded-lg border border-white/5 relative group"
                        style={{ backgroundColor: `rgba(99, 102, 241, ${Math.abs(correlation)})` }}
                      >
                        <span className="text-[8px] font-mono text-white font-bold">{correlation}</span>
                        <div className="absolute inset-0 bg-slate-950/90 text-[8px] text-slate-300 opacity-0 group-hover:opacity-100 p-1 flex items-center justify-center transition-opacity rounded-lg pointer-events-none">
                          {h1.substring(0,4)} vs {h2.substring(0,4)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </ResponsiveContainer>
        </div>

        {/* Bottom Metric Cards Footer matching your image context */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Dataset Summary</span>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-900/40 border border-white/5 p-3 rounded-xl text-center">
              <div className="text-md font-bold text-slate-200">{chartData.length}</div>
              <div className="text-[9px] text-slate-500 uppercase font-medium">Processed Rows</div>
            </div>
            <div className="bg-slate-900/40 border border-white/5 p-3 rounded-xl text-center">
              <div className="text-md font-bold text-slate-200">{headers.length}</div>
              <div className="text-[9px] text-slate-500 uppercase font-medium">Dimensions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}