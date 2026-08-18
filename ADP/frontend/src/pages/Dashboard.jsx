import React, { useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Charts from "../components/Charts";
import ChatBox from "../components/ChatBox";
import { useApp } from "../App";

const navItems = [
  { id: "status", label: "Current Status", icon: "⚡" },
  { id: "overview", label: "Dataset Overview", icon: "📁" },
  { id: "summary", label: "Statistical Summary", icon: "📊" },
  { id: "charts", label: "Visual Charts", icon: "📈" },
  { id: "heatmap", label: "Correlation Heatmap", icon: "🧩" },
  { id: "prediction", label: "Prediction Model", icon: "🎯" },
  { id: "recommendations", label: "Recommendations", icon: "💡" },
  { id: "report", label: "AI Report", icon: "📄" },
];

function safeValue(value, fallback = "Auto") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  if (Array.isArray(value)) {
    return value.length;
  }

  if (typeof value === "object") {
    return Object.keys(value).length;
  }

  return String(value);
}

function getDatasetValue(healthReport, keys, fallback = "Auto") {
  if (!healthReport) return fallback;

  for (const key of keys) {
    const value = healthReport[key];

    if (value !== null && value !== undefined && value !== "") {
      return safeValue(value, fallback);
    }
  }

  return fallback;
}

function EmptyState() {
  return (
    <section className="organized-empty-state">
      <div>
        <div className="empty-icon">📤</div>

        <h1>Upload your dataset to start ADP AI analysis</h1>

        <p>
          Use the upload box on the left sidebar. After upload, ADP AI will
          unlock dataset overview, statistical summary, charts, prediction
          model, recommendations, and report sections.
        </p>

        <div className="empty-flow">
          <div>
            <span>1</span>
            Upload Dataset
          </div>

          <div>
            <span>2</span>
            Auto Analysis
          </div>

          <div>
            <span>3</span>
            Prediction Report
          </div>
        </div>
      </div>
    </section>
  );
}

function CurrentStatus({ activeFileId, healthReport, chartPayload }) {
  const steps = [
    {
      title: "Dataset uploaded",
      desc: activeFileId
        ? "Your dataset file is successfully connected to ADP AI."
        : "Waiting for dataset upload.",
      done: Boolean(activeFileId),
    },
    {
      title: "Data quality checked",
      desc: healthReport
        ? "Missing values, duplicate rows, and data health are inspected."
        : "ADP AI will check missing values and dataset quality.",
      done: Boolean(healthReport),
    },
    {
      title: "Visualization prepared",
      desc: chartPayload
        ? "Charts and frontend visualization data are ready."
        : "Charts will be generated after analysis.",
      done: Boolean(chartPayload),
    },
    {
      title: "Prediction pipeline ready",
      desc: activeFileId
        ? "You can now ask ADP AI questions or run predictive analysis."
        : "Prediction starts after dataset upload.",
      done: Boolean(activeFileId),
    },
  ];

  return (
    <section className="organized-panel">
      <div className="panel-title-row">
        <div>
          <h1>Your Status</h1>
          <p>Track what ADP AI is doing with your uploaded dataset.</p>
        </div>

        <span className="status-badge-ready">
          {activeFileId ? "Dataset Active" : "Waiting"}
        </span>
      </div>

      <div className="status-timeline">
        {steps.map((step, index) => (
          <div className="status-step" key={step.title}>
            <div className={step.done ? "status-dot done" : "status-dot"}>
              {step.done ? "✓" : index + 1}
            </div>

            <div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DatasetOverview({ healthReport }) {
  const cards = [
    [
      "Total Rows",
      getDatasetValue(healthReport, ["rows", "total_rows", "row_count"], "Auto"),
    ],
    [
      "Total Columns",
      getDatasetValue(
        healthReport,
        ["columns", "total_columns", "column_count"],
        "Auto"
      ),
    ],
    [
      "Missing Values",
      getDatasetValue(
        healthReport,
        ["missing_values", "missing", "null_values"],
        "Checked"
      ),
    ],
    [
      "Duplicate Rows",
      getDatasetValue(
        healthReport,
        ["duplicate_rows", "duplicates", "duplicate_count"],
        "Checked"
      ),
    ],
    ["Data Quality", healthReport ? "Analysed" : "Pending"],
    ["Dataset Status", healthReport ? "Ready" : "Waiting"],
  ];

  return (
    <section className="organized-panel">
      <div className="panel-title-row">
        <div>
          <h1>Dataset Overview</h1>
          <p>Clean summary of uploaded dataset structure and quality.</p>
        </div>
      </div>

      <div className="overview-grid">
        {cards.map(([label, value]) => (
          <div className="overview-card" key={label}>
            <p>{label}</p>
            <h2>{String(value)}</h2>
          </div>
        ))}
      </div>

      <div className="dataset-note-box">
        <h3>What ADP checked</h3>
        <p>
          ADP AI inspected your dataset structure, row count, column count,
          missing value patterns, duplicate records, and readiness for
          prediction.
        </p>
      </div>
    </section>
  );
}
function StatisticalSummary() {
  const { statSummary, healthReport } = useApp();

  const rawSummary =
    statSummary ||
    healthReport?.statistical_summary ||
    healthReport?.stat_summary ||
    healthReport?.numeric_summary ||
    healthReport?.summary_stats ||
    healthReport?.summary ||
    healthReport?.stats ||
    [];

  const summaryData = Array.isArray(rawSummary)
    ? rawSummary
    : Object.entries(rawSummary || {}).map(([column, values]) => ({
        column,
        ...(typeof values === "object" && values !== null ? values : {}),
      }));

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "number") return Number(value).toFixed(2);
    return value;
  };

  return (
    <section className="organized-panel">
      <div className="panel-title-row">
        <div>
          <h1>Statistical Summary</h1>
          <p>
            Quick numerical overview of your dataset using mean, median,
            minimum, maximum, and standard deviation.
          </p>
        </div>
      </div>

      <div className="summary-table-wrap">
        <table className="summary-table">
          <thead>
            <tr>
              <th>Column</th>
              <th>Mean</th>
              <th>Median</th>
              <th>Min</th>
              <th>Max</th>
              <th>Std Dev</th>
            </tr>
          </thead>

          <tbody>
            {summaryData && summaryData.length > 0 ? (
              summaryData.map((row, index) => (
                <tr key={index}>
                  <td>{row.column || row.name || row[0] || "-"}</td>
                  <td>{formatNumber(row.mean ?? row.Mean ?? row.average ?? row.avg ?? row[1])}</td>
                  <td>{formatNumber(row.median ?? row.Median ?? row[2])}</td>
                  <td>{formatNumber(row.min ?? row.minimum ?? row.Min ?? row[3])}</td>
                  <td>{formatNumber(row.max ?? row.maximum ?? row.Max ?? row[4])}</td>
                  <td>{formatNumber(row.std ?? row.std_dev ?? row.standard_deviation ?? row["std dev"] ?? row[5])}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  Upload a CSV/XLSX dataset with numerical columns to view statistical summary.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PredictionPanel() {
  const { activeFileId, chartPayload, setChartPayload } = useApp();

  const [targetColumn, setTargetColumn] = useState("");
  const [taskType, setTaskType] = useState("auto");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runPrediction = async () => {
    if (!activeFileId) {
      alert("Please upload a dataset first.");
      return;
    }

    if (!targetColumn.trim()) {
      alert("Please enter target column name.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:8000/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file_id: activeFileId,
          target_column: targetColumn.trim(),
          task_type: taskType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Prediction failed.");
      }

      setChartPayload(data);

      alert("Prediction completed. Report is ready.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="organized-panel">
      <div className="panel-title-row">
        <div>
          <h1>Prediction Model</h1>
          <p>
            Train Random Forest model and generate prediction report.
          </p>
        </div>
      </div>

      <div className="prediction-grid">
        <div className="prediction-card">
          <p>Model Used</p>
          <h2>Random Forest</h2>
        </div>

        <div className="prediction-card">
          <p>Task Type</p>
          <h2>{taskType === "auto" ? "Auto Detect" : taskType}</h2>
        </div>

        <div className="prediction-card">
          <p>Report Status</p>
          <h2>{chartPayload?.report_id ? "Ready" : "Not Ready"}</h2>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <label className="block text-sm font-black text-slate-700">
          Target Column Name
        </label>

        <input
          type="text"
          value={targetColumn}
          onChange={(event) => setTargetColumn(event.target.value)}
          placeholder="Example: placement, sales, marks, salary"
          className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-violet-500"
        />

        <label className="mt-4 block text-sm font-black text-slate-700">
          Prediction Type
        </label>

        <select
          value={taskType}
          onChange={(event) => setTaskType(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-violet-500"
        >
          <option value="auto">Auto Detect</option>
          <option value="classification">Classification</option>
          <option value="regression">Regression</option>
        </select>

        <button
          type="button"
          onClick={runPrediction}
          disabled={loading}
          className="mt-5 rounded-2xl bg-violet-600 px-6 py-3 text-sm font-black text-white disabled:opacity-60"
        >
          {loading ? "Training Random Forest..." : "Run Random Forest Prediction"}
        </button>

        {error && (
          <p className="mt-3 text-sm font-bold text-red-500">
            {error}
          </p>
        )}
      </div>

      {chartPayload && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-lg font-black text-slate-900">
            Prediction Result
          </h3>

          <p className="mt-2 text-sm text-slate-600">
            Algorithm: <b>{chartPayload.algorithm}</b>
          </p>

          <p className="mt-1 text-sm text-slate-600">
            Accuracy Score: <b>{chartPayload.accuracy_score}%</b>
          </p>

          <p className="mt-1 text-sm text-slate-600">
            Report ID: <b>{chartPayload.report_id || "Not generated yet"}</b>
          </p>
        </div>
      )}
    </section>
  );
}

function RecommendationsPanel() {
  const { chartPayload } = useApp();

  const recommendations = chartPayload?.recommendations || [];
  const sections = chartPayload?.recommendation_sections || {};

  if (!chartPayload) {
    return (
      <section className="organized-panel">
        <div className="panel-title-row">
          <div>
            <h1>Recommendations</h1>
            <p>Run Random Forest prediction to generate data-based recommendations.</p>
          </div>
        </div>

        <div className="dataset-note-box">
          <h3>No recommendation yet</h3>
          <p>
            First upload a dataset, go to Prediction Model, enter target column,
            and click Run Random Forest Prediction.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="organized-panel">
      <div className="panel-title-row">
        <div>
          <h1>Smart Recommendations</h1>
          <p>
            ADP AI generated these recommendations from dataset patterns,
            Random Forest feature importance, and target column behaviour.
          </p>
        </div>

        <span className="status-badge-ready">
          AI Recommendations Ready
        </span>
      </div>

      <div className="recommendation-list">
        {recommendations.length > 0 ? (
          recommendations.map((item, index) => (
            <div className="recommendation-item" key={index}>
              <span>✓</span>
              <p>{item}</p>
            </div>
          ))
        ) : (
          <div className="recommendation-item">
            <span>!</span>
            <p>No recommendations returned from backend yet.</p>
          </div>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-black text-slate-900">
            Data Quality Advice
          </h3>

          <div className="mt-3 space-y-2">
            {(sections.data_quality || []).map((item, index) => (
              <p key={index} className="text-sm leading-6 text-slate-600">
                • {item}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-black text-slate-900">
            Target Analysis
          </h3>

          <div className="mt-3 space-y-2">
            {(sections.target_analysis || []).map((item, index) => (
              <p key={index} className="text-sm leading-6 text-slate-600">
                • {item}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-black text-slate-900">
            Domain Strategy
          </h3>

          <div className="mt-3 space-y-2">
            {(sections.domain_strategy || []).map((item, index) => (
              <p key={index} className="text-sm leading-6 text-slate-600">
                • {item}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-black text-slate-900">
            Goal Improvement Plan
          </h3>

          <div className="mt-3 space-y-2">
            {(sections.goal_strategy || []).map((item, index) => (
              <p key={index} className="text-sm leading-6 text-slate-600">
                • {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ReportPanel() {
  const { chartPayload } = useApp();

  const reportId = chartPayload?.report_id;

  const openDownload = (url, message) => {
    if (!reportId || !url) {
      alert(message);
      return;
    }

    window.open(`http://localhost:8000${url}`, "_blank");
  };

  const jsonReportUrl =
    chartPayload?.report_download_url ||
    (reportId ? `/api/report/download/${reportId}` : "");

  const pdfReportUrl =
    chartPayload?.pdf_report_download_url ||
    (reportId ? `/api/report/download-pdf/${reportId}` : "");

  const excelReportUrl =
    chartPayload?.excel_report_download_url ||
    (reportId ? `/api/report/download-excel/${reportId}` : "");

  return (
    <section className="organized-panel">
      <div className="panel-title-row">
        <div>
          <h1>AI Prediction Report</h1>
          <p>
            Download the Random Forest prediction report generated after model
            training.
          </p>
        </div>

        <span className="status-badge-ready">
          {reportId ? "Report Ready" : "Report Not Ready"}
        </span>
      </div>

      <div className="report-actions-grid">
        <button
          type="button"
          onClick={() =>
            openDownload(
              jsonReportUrl,
              "Prediction report not ready yet. First run prediction using ADP AI."
            )
          }
        >
          Download Prediction Report
        </button>

        <button
          type="button"
          onClick={() =>
            openDownload(
              pdfReportUrl,
              "PDF report not ready yet. First run prediction using ADP AI."
            )
          }
        >
          Download PDF Report
        </button>

        <button
          type="button"
          onClick={() =>
            openDownload(
              excelReportUrl,
              "Excel report not ready yet. First run prediction using ADP AI."
            )
          }
        >
          Download Excel Summary
        </button>

        <button type="button" disabled>
          Generate Python Script
        </button>
      </div>

      <div className="dataset-note-box">
        <h3>Report includes</h3>
        <p>
          Model name, task type, target column, accuracy metrics, feature
          importance, prediction samples, smart recommendations, model selection
          reason, and prediction flow.
        </p>
      </div>

      {chartPayload && (
        <div className="dataset-note-box">
          <h3>Current Report Status</h3>
          <p>
            Algorithm: <b>{chartPayload.algorithm || "Random Forest"}</b>
            <br />
            Accuracy Score: <b>{chartPayload.accuracy_score || "N/A"}%</b>
            <br />
            Report ID: <b>{reportId || "Not generated yet"}</b>
          </p>
        </div>
      )}
    </section>
  );
}

function VisualChartsPanel() {
  return (
    <section className="organized-panel charts-organized-panel">
      <div className="panel-title-row">
        <div>
          <h1>Visual Charts</h1>
          <p>
            Bar chart, line chart, pie chart, histogram, scatter plot, box plot,
            and other visual insights.
          </p>
        </div>
      </div>

      <div className="existing-charts-wrapper">
        <Charts />
      </div>
    </section>
  );
}

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("status");

  const appContext = useApp();

  const activeFileId = appContext?.activeFileId;
  const healthReport = appContext?.healthReport;
  const chartPayload = appContext?.chartPayload;

  const datasetUploaded = Boolean(activeFileId);

  const activeTitle = useMemo(() => {
    const current = navItems.find((item) => item.id === activeSection);
    return current ? current.label : "Current Status";
  }, [activeSection]);

  const renderActiveSection = () => {
    if (!datasetUploaded) {
      return <EmptyState />;
    }

    switch (activeSection) {
      case "status":
        return (
          <CurrentStatus
            activeFileId={activeFileId}
            healthReport={healthReport}
            chartPayload={chartPayload}
          />
        );

      case "overview":
        return <DatasetOverview healthReport={healthReport} />;

      case "summary":
        return <StatisticalSummary />;

      case "charts":
        return <VisualChartsPanel />;

      case "heatmap":
        return <HeatmapPanel />;

      case "prediction":
        return <PredictionPanel />;

      case "recommendations":
        return <RecommendationsPanel />;

      case "report":
        return <ReportPanel />;

      default:
        return (
          <CurrentStatus
            activeFileId={activeFileId}
            healthReport={healthReport}
            chartPayload={chartPayload}
          />
        );
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden dashboard-shell">
      <Navbar />

      <div className="organized-dashboard-layout">
        <Sidebar />

        <aside className="organized-nav-panel">
          <div className="organized-nav-head">
            <h2>ADP AI Tools</h2>
            <p>
              {datasetUploaded
                ? "Choose what you want to view."
                : "Upload dataset to unlock tools."}
            </p>
          </div>

          <div className="upload-status-mini">
            <span className={datasetUploaded ? "dot active" : "dot"}></span>

            <div>
              <h4>{datasetUploaded ? "Dataset Uploaded" : "Waiting Upload"}</h4>
              <p>
                {datasetUploaded ? "Analysis tools unlocked" : "Use upload box"}
              </p>
            </div>
          </div>

          <nav className="organized-nav-buttons">
            {navItems.map((item) => (
              <button
                type="button"
                key={item.id}
                className={activeSection === item.id ? "active" : ""}
                onClick={() => setActiveSection(item.id)}
                disabled={!datasetUploaded && item.id !== "status"}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="organized-main-area">
          <div className="organized-main-top">
            <div>
              <h1>{datasetUploaded ? "ADP AI Workspace" : "ADP AI Workspace"}</h1>
              <p>
                {datasetUploaded
                  ? "Your selected dataset intelligence section is shown below."
                  : "Upload your dataset first to begin predictive analysis."}
              </p>
            </div>

            <span className="workspace-pill">
              {datasetUploaded ? "Analysis Ready" : "No Dataset"}
            </span>
          </div>

          <div className="organized-content-area">{renderActiveSection()}</div>
        </main>

        <aside className="organized-chat-area">
          <ChatBox />
        </aside>
      </div>
    </div>
  );
}