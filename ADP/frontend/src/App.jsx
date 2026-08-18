import React, { useState, createContext, useContext } from "react";
import Dashboard from "./pages/Dashboard";

import AuthPage from "./components/AuthPage";
import UserManual from "./components/UserManual";

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export default function App() {
  const [currentPhase, setCurrentPhase] = useState("LOGIN");

  const [activeFileId, setActiveFileId] = useState(null);
  const [healthReport, setHealthReport] = useState(null);
  const [chartPayload, setChartPayload] = useState(null);

  // ADD THIS
  const [statSummary, setStatSummary] = useState([]);

  const [chatLog, setChatLog] = useState([
    {
      role: "assistant",
      content:
        "Systems active. Drop a spreadsheet block into the Ingestion Hub to begin.",
    },
  ]);

  if (currentPhase === "LOGIN") {
    return <AuthPage onLoginSuccess={() => setCurrentPhase("MANUAL")} />;
  }

  if (currentPhase === "MANUAL") {
    return <UserManual onStartExploring={() => setCurrentPhase("WORKSPACE")} />;
  }

  return (
    <AppContext.Provider
      value={{
        activeFileId,
        setActiveFileId,
        healthReport,
        setHealthReport,
        chartPayload,
        setChartPayload,
        chatLog,
        setChatLog,

        // ADD THIS
        statSummary,
        setStatSummary,
      }}
    >
      <Dashboard />
    </AppContext.Provider>
  );
}
