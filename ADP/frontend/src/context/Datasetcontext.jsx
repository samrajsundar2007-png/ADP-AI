import React, { createContext, useContext, useState } from 'react';

const DatasetContext = createContext();

export function DatasetProvider({ children }) {
  const [fileId, setFileId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! Drop a CSV dataset below to begin predictive automation.' }
  ]);

  return (
    <DatasetContext.Provider value={{
      fileId, setFileId,
      summary, setSummary,
      predictionData, setPredictionData,
      messages, setMessages
    }}>
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  return useContext(DatasetContext);
}
