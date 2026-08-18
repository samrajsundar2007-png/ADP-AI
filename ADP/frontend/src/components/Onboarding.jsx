import React from 'react';

export default function OnboardingModal({ open, onClose }) {
  if (!open) return null;

  const handleSkip = () => {
    localStorage.setItem('adp_skip_onboarding', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-white/10 max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-100">Welcome to ADP-AI Studio</h2>
          <p className="text-xs text-slate-400 leading-relaxed">An automated matrix computational studio mapping classification, regression algorithms, and live LLM co-pilot assistance parameters instantly over datasets.</p>
        </div>
        <div className="space-y-3 text-xs text-slate-300">
          <div className="flex gap-3"><span className="text-blue-400 font-bold">1.</span> <span>Upload tabular dataset matrix blocks within the control layout.</span></div>
          <div className="flex gap-3"><span className="text-indigo-400 font-bold">2.</span> <span>Declare evaluation index columns for automatic model computation.</span></div>
          <div className="flex gap-3"><span className="text-purple-400 font-bold">3.</span> <span>Interact dynamically with deep automated visual metrics.</span></div>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={handleSkip} className="flex-1 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 border border-white/5 hover:bg-white/5 rounded-lg transition">Don't show again</button>
          <button onClick={onClose} className="flex-1 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition shadow-lg shadow-blue-600/20">Launch Workspace</button>
        </div>
      </div>
    </div>
  );
}
