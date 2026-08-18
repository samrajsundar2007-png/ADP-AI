import React from 'react';
import { useApp } from '../App';

export default function ExportPanel() {
  // Switched to useApp context to maintain state sync across dashboard components
  const { chartPayload } = useApp();

  // Function to dynamically download the payload as a JSON file
  const handleDownload = () => {
    // Safety check: ensure there is data to save
    const dataToSave = chartPayload || { message: "No metrics generated yet." };
    
    // Convert the Javascript object into a JSON string blob
    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // Create an invisible link, trigger the download, and clean it up
    const link = document.createElement("a");
    link.href = url;
    link.download = "architectural_metrics.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 rounded-xl border border-white/5 bg-slate-900/50 backdrop-blur-sm mt-auto space-y-3">
      <div className="text-xs font-medium text-slate-300">⚙️ Pipeline Artifact Export</div>
      <button 
        onClick={handleDownload} /* Trigger the download when clicked */
        disabled={!chartPayload} 
        className="w-full py-2 bg-slate-950/60 hover:bg-slate-950 border border-white/10 disabled:opacity-30 rounded-lg text-slate-300 font-medium text-xs transition flex items-center justify-center gap-2"
      >
        📥 Save Architectural Metrics
      </button>
    </div>
  );
}