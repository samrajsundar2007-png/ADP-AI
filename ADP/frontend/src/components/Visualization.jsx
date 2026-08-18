import React, { useState } from 'react';
import { useDataset } from '../context/Datasetcontext';
import { api } from '../services/api';

export default function Visualization() {
  const { fileId, setPredictionData } = useDataset();
  const [target, setTarget] = useState('');
  const [running, setRunning] = useState(false);

  const initPipeline = async () => {
    if (!target || !fileId) return;
    setRunning(true);
    try {
      const results = await api.runPrediction(fileId, target);
      setPredictionData(results);
    } catch (err) {
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  if (!fileId) return null;

  return (
    <div className="p-5 rounded-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm space-y-4">
      <div className="text-sm font-medium text-slate-200">🧠 AI Automated Target Execution</div>
      <div className="flex gap-2">
        <input type="text" placeholder="Declare evaluation target index (e.g. price)..." value={target} onChange={(e) => setTarget(e.target.value)} className="bg-slate-950 border border-white/10 rounded-md px-3 py-2 text-xs text-slate-200 w-full focus:outline-none focus:border-blue-500 placeholder-slate-600 transition-all" />
        <button onClick={initPipeline} disabled={running} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-md text-xs font-medium transition whitespace-nowrap">
          {running ? 'Processing...' : 'Run Pipeline'}
        </button>
      </div>
    </div>
  );
}
