import React from "react";

export default function Navbar() {
  return (
    <header className="h-16 border-b border-white/5 bg-slate-900/60 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-20 relative">
      <div className="flex items-center gap-3">
        <img
          src="/adp-logo.png"
          alt="ADP AI Logo"
          className="h-12 w-auto object-contain rounded-md"
        />
      </div>

      <div className="flex items-center gap-4">
        <span className="text-[10px] tracking-widest uppercase px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full font-bold">
          Hackathon Prototype Build v1.0
        </span>
      </div>
    </header>
  );
}
