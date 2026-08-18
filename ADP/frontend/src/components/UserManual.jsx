import Logo from "./Logo";

const steps = [
  {
    number: "1",
    icon: "📁",
    title: "Upload any dataset",
    desc: "Drop your CSV, Excel, JSON, or TXT file. ADP AI instantly reads columns, data types, missing values, and sample rows.",
    tags: ["CSV", "XLSX", "JSON", "TXT"],
    color: "blue",
  },
  {
    number: "2",
    icon: "💬",
    title: "Ask anything in plain English",
    desc: 'Type questions like "Which customers are most likely to churn?" or "What drives revenue?"',
    tags: [],
    color: "purple",
  },
  {
    number: "3",
    icon: "📊",
    title: "Get charts and insights report",
    desc: "ADP AI generates analysis, visual charts, insights, and prediction results from your dataset.",
    tags: [],
    color: "green",
  },
  {
    number: "4",
    icon: "📥",
    title: "Download your report",
    desc: "Export a complete predictive analysis report, generated Python script, or prediction CSV.",
    tags: [],
    color: "orange",
  },
];

export default function UserManual({ onStartExploring }) {
  return (
    <main className="manual-light-page">
      <section className="manual-light-card">
        <div className="manual-top">
          <Logo />

          <span className="manual-badge">✨ Welcome to ADP AI</span>
        </div>

        <div className="manual-hero">
          <h1>Instructions to use ADP AI</h1>
          <p>
            ADP AI reads your dataset, understands its structure, answers
            questions in plain English, and generates predictive insights,
            charts, and reports.
          </p>
        </div>

        <div className="manual-divider"></div>

        <div className="manual-steps">
          {steps.map((step) => (
            <div className="manual-step" key={step.number}>
              <div className={`manual-number ${step.color}`}>
                {step.number}
              </div>

              <div className="manual-step-content">
                <h3>
                  <span>{step.icon}</span>
                  {step.title}
                </h3>

                <p>{step.desc}</p>

                {step.tags.length > 0 && (
                  <div className="manual-tags">
                    {step.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="manual-divider"></div>

        <div className="manual-footer">
          <label className="manual-check">
            <input type="checkbox" />
            <span>Don’t show this again</span>
          </label>

          <button className="primary-button manual-start" onClick={onStartExploring}>
            Start Analysing →
          </button>
        </div>
      </section>
    </main>
  );
}