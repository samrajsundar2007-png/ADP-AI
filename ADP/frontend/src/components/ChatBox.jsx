import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../App";
import { api } from "../services/api";

export default function ChatBox() {
  const { activeFileId, chatLog, setChatLog, setChartPayload } = useApp();

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [voiceMessage, setVoiceMessage] = useState("");

  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const voiceBaseTextRef = useRef("");

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceSupported(false);
      setVoiceMessage("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setVoiceMessage("Listening... speak now.");
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let index = event.resultIndex; index < event.results.length; index++) {
        transcript += event.results[index][0].transcript;
      }

      const finalText = `${voiceBaseTextRef.current} ${transcript}`.trim();

      setInput(finalText);
    };

    recognition.onerror = (event) => {
      setListening(false);

      if (event.error === "not-allowed") {
        setVoiceMessage("Microphone permission blocked. Please allow microphone access.");
      } else if (event.error === "no-speech") {
        setVoiceMessage("No speech detected. Please try again.");
      } else {
        setVoiceMessage("Voice recognition stopped. Please try again.");
      }
    };

    recognition.onend = () => {
      setListening(false);
      setVoiceMessage("");
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const handleExportChat = () => {
    if (!chatLog || chatLog.length === 0) return;

    const formattedChat = chatLog
      .map((msg) => {
        const sender = msg.role === "user" ? "User" : "Gemini AI";

        return `[${sender}]\n${msg.content}\n-----------------------------------`;
      })
      .join("\n\n");

    const blob = new Blob([formattedChat], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "gemini_analytics_report.txt";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const startVoiceRecognition = () => {
    if (!activeFileId) {
      setVoiceMessage("Upload a dataset first, then ask using voice.");
      return;
    }

    if (!voiceSupported || !recognitionRef.current) {
      setVoiceMessage("Voice recognition is not supported in this browser.");
      return;
    }

    if (sending) return;

    try {
      voiceBaseTextRef.current = input.trim();

      recognitionRef.current.start();
    } catch (error) {
      setVoiceMessage("Voice recognition is already active.");
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setListening(false);
    setVoiceMessage("");
  };

  const handleSubmit = async () => {
    if (!input.trim() || !activeFileId || sending) return;

    const query = input.trim();

    setInput("");
    setSending(true);
    setVoiceMessage("");

    setChatLog((prev) => [
      ...prev,
      {
        role: "user",
        content: query,
      },
    ]);

    try {
      const data = await api.sendChatMessage(activeFileId, query);

      setChatLog((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.explanation,
        },
      ]);

      if (data.model_results) {
        setChartPayload(data.model_results);
      }
    } catch (err) {
      setChatLog((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Operational pipeline block encountered parsing queries.",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="w-80 border-l border-white/5 bg-slate-900/20 backdrop-blur-md flex flex-col shrink-0 overflow-hidden">
      <div className="p-4 border-b border-white/5 bg-slate-900/40">
        <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
          💬 Gemini Powered Analytics Co-Pilot
        </span>

        <p className="mt-1 text-[10px] text-slate-500">
          Ask using text or voice input
        </p>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {chatLog.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            } animate-fadeIn`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed border ${
                msg.role === "user"
                  ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/10"
                  : "bg-slate-900/80 border-white/5 text-slate-300"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        <div ref={scrollRef} />
      </div>

      <div className="p-4 border-t border-white/5 bg-slate-950/40 flex flex-col gap-2">
        {chatLog.length > 0 && (
          <button
            type="button"
            onClick={handleExportChat}
            className="w-full py-1.5 bg-slate-900/60 hover:bg-slate-900 border border-white/5 rounded-lg text-slate-400 hover:text-slate-200 text-[10px] font-medium transition flex items-center justify-center gap-1.5 mb-1"
          >
            📄 Download AI Insights Report
          </button>
        )}

        {voiceMessage && (
          <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-3 py-2 text-[10px] text-indigo-200">
            {voiceMessage}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={listening ? stopVoiceRecognition : startVoiceRecognition}
            disabled={!activeFileId || sending || !voiceSupported}
            className={`px-3 rounded-xl text-xs font-bold transition-all border ${
              listening
                ? "bg-red-500 border-red-400 text-white animate-pulse"
                : "bg-slate-900 border-white/5 text-slate-300 hover:bg-indigo-600 hover:text-white"
            } disabled:opacity-40`}
            title="Voice input"
          >
            {listening ? "■" : "🎙️"}
          </button>

          <input
            type="text"
            placeholder={
              activeFileId
                ? "Ask: 'Predict Sales'..."
                : "Awaiting CSV ingestion payload..."
            }
            disabled={!activeFileId || sending}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="bg-slate-900 border border-white/5 rounded-xl px-3 py-2.5 text-xs text-slate-200 flex-1 focus:outline-none focus:border-indigo-500 disabled:opacity-40 transition-all font-medium tracking-wide"
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!activeFileId || !input.trim() || sending}
            className="px-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl text-white font-medium text-xs transition-all shadow-md shadow-indigo-600/10"
          >
            {sending ? "..." : "Send"}
          </button>
        </div>

        <p className="text-[10px] text-slate-600 leading-4">
          Mic converts your speech into text. Then click Send to ask ADP AI.
        </p>
      </div>
    </div>
  );
}