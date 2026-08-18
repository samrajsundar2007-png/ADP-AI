import React, { useMemo, useState } from "react";
import { useApp } from "../App";

const chartTabs = [
  { id: "bar", label: "Bar Chart", icon: "📊" },
  { id: "line", label: "Line Chart", icon: "📈" },
  { id: "pie", label: "Pie Chart", icon: "🥧" },
  { id: "histogram", label: "Histogram", icon: "▥" },
  { id: "scatter", label: "Scatter Plot", icon: "✨" },
  { id: "heatmap", label: "Heatmap", icon: "🧩" },
  { id: "box", label: "Box Plot", icon: "📦" },
  { id: "prediction", label: "Prediction", icon: "🎯" },
];

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalizeChartPayload(chartPayload) {
  const chartData = chartPayload?.chart_data || {};
  const labels = Array.isArray(chartData.labels) ? chartData.labels : [];
  const values = Array.isArray(chartData.values) ? chartData.values : [];

  return labels.map((label, index) => ({
    label: String(label),
    value: toNumber(values[index]),
    index: index + 1,
  }));
}

function getQuartile(sortedValues, q) {
  if (!sortedValues.length) return 0;

  const position = (sortedValues.length - 1) * q;
  const base = Math.floor(position);
  const rest = position - base;

  if (sortedValues[base + 1] !== undefined) {
    return sortedValues[base] + rest * (sortedValues[base + 1] - sortedValues[base]);
  }

  return sortedValues[base];
}

function buildHistogram(values) {
  if (!values.length) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const binCount = Math.min(6, Math.max(3, Math.ceil(Math.sqrt(values.length))));
  const range = max - min || 1;
  const binSize = range / binCount;

  const bins = Array.from({ length: binCount }, (_, index) => {
    const start = min + index * binSize;
    const end = index === binCount - 1 ? max : start + binSize;

    return {
      label: `${start.toFixed(1)} - ${end.toFixed(1)}`,
      count: 0,
    };
  });

  values.forEach((value) => {
    const index = Math.min(binCount - 1, Math.floor((value - min) / binSize));
    bins[index].count += 1;
  });

  return bins;
}

function EmptyCharts() {
  return (
    <div className="min-h-[480px] rounded-3xl border border-dashed border-slate-300 bg-white p-10 flex items-center justify-center text-center">
      <div className="max-w-xl">
        <div className="mx-auto mb-5 h-20 w-20 rounded-3xl bg-violet-50 flex items-center justify-center text-4xl">
          📈
        </div>

        <h2 className="text-2xl font-black text-slate-900">
          Visual charts are waiting for dataset analysis
        </h2>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          Upload a dataset and ask ADP AI to analyse or predict. Once the backend
          returns chart data, this section will automatically show visual charts
          such as bar, line, pie, histogram, scatter, heatmap, box plot, and prediction.
        </p>
      </div>
    </div>
  );
}

function ChartShell({ children }) {
  return (
    <div className="min-h-[360px] rounded-3xl border border-slate-200 bg-slate-50 p-5 overflow-hidden">
      {children}
    </div>
  );
}

function BarChartView({ data }) {
  const max = Math.max(...data.map((item) => Math.abs(item.value)), 1);

  return (
    <ChartShell>
      <div className="h-[330px] flex items-end gap-4 overflow-x-auto pb-3">
        {data.map((item) => {
          const height = Math.max(8, (Math.abs(item.value) / max) * 100);

          return (
            <div key={item.label} className="min-w-[75px] h-full grid grid-rows-[1fr_auto_auto] gap-2 text-center">
              <div className="h-full flex items-end justify-center border-b border-slate-300">
                <div
                  className="w-10 rounded-t-2xl bg-gradient-to-t from-violet-600 to-sky-400 shadow-lg"
                  style={{ height: `${height}%` }}
                  title={`${item.label}: ${item.value}`}
                />
              </div>

              <span className="truncate text-[11px] font-bold text-slate-500" title={item.label}>
                {item.label}
              </span>

              <b className="text-xs text-slate-900">{item.value.toFixed(2)}</b>
            </div>
          );
        })}
      </div>
    </ChartShell>
  );
}

function LineChartView({ data }) {
  const width = 760;
  const height = 320;
  const padding = 38;

  const values = data.map((item) => item.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;

  const points = data.map((item, index) => {
    const x = padding + (index / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((item.value - min) / range) * (height - padding * 2);

    return { ...item, x, y };
  });

  const path = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <ChartShell>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[320px] w-full rounded-2xl bg-white border border-slate-200">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#dbe4f2" strokeWidth="2" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#dbe4f2" strokeWidth="2" />

        <polyline points={path} fill="none" stroke="#6c4cff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

        {points.map((point) => (
          <circle key={point.label} cx={point.x} cy={point.y} r="7" fill="#6c4cff" stroke="#ffffff" strokeWidth="3">
            <title>
              {point.label}: {point.value}
            </title>
          </circle>
        ))}
      </svg>

      <div className="mt-3 flex flex-wrap gap-2">
        {data.slice(0, 8).map((item) => (
          <span key={item.label} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-500">
            {item.label}
          </span>
        ))}
      </div>
    </ChartShell>
  );
}

function PieChartView({ data }) {
  const total = data.reduce((sum, item) => sum + Math.abs(item.value), 0) || 1;

  let current = 0;
  const segments = data.map((item, index) => {
    const percentage = (Math.abs(item.value) / total) * 100;
    const start = current;
    const end = current + percentage;
    current = end;

    return {
      ...item,
      percentage,
      color: `hsl(${250 + index * 34}, 82%, ${56 + (index % 3) * 7}%)`,
      start,
      end,
    };
  });

  const gradient = segments
    .map((item) => `${item.color} ${item.start}% ${item.end}%`)
    .join(", ");

  return (
    <ChartShell>
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-center">
        <div
          className="mx-auto h-60 w-60 rounded-full shadow-xl grid place-items-center"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="h-28 w-28 rounded-full bg-white grid place-items-center text-center">
            <div>
              <b className="block text-3xl font-black text-slate-900">{data.length}</b>
              <span className="text-xs font-bold text-slate-500">groups</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {segments.map((item) => (
            <div key={item.label} className="grid grid-cols-[16px_1fr_auto] gap-3 items-center rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <span className="h-4 w-4 rounded-full" style={{ background: item.color }} />
              <p className="m-0 text-sm font-bold text-slate-700 truncate">{item.label}</p>
              <b className="text-sm text-slate-900">{item.percentage.toFixed(1)}%</b>
            </div>
          ))}
        </div>
      </div>
    </ChartShell>
  );
}

function HistogramView({ values }) {
  const bins = buildHistogram(values);
  const max = Math.max(...bins.map((bin) => bin.count), 1);

  return (
    <ChartShell>
      <div className="h-[330px] flex items-end gap-4 pb-3">
        {bins.map((bin) => {
          const height = Math.max(8, (bin.count / max) * 100);

          return (
            <div key={bin.label} className="flex-1 h-full grid grid-rows-[1fr_auto_auto] gap-2 text-center">
              <div className="h-full flex items-end justify-center border-b border-slate-300">
                <div
                  className="w-[70%] rounded-t-2xl bg-gradient-to-t from-emerald-500 to-lime-300"
                  style={{ height: `${height}%` }}
                />
              </div>

              <span className="text-[11px] font-bold text-slate-500">{bin.label}</span>
              <b className="text-xs text-slate-900">{bin.count}</b>
            </div>
          );
        })}
      </div>
    </ChartShell>
  );
}

function ScatterView({ data }) {
  const width = 760;
  const height = 320;
  const padding = 38;

  const xMax = Math.max(...data.map((item) => item.index), 1);
  const yValues = data.map((item) => item.value);
  const yMin = Math.min(...yValues, 0);
  const yMax = Math.max(...yValues, 1);
  const yRange = yMax - yMin || 1;

  const points = data.map((item) => {
    const x = padding + (item.index / xMax) * (width - padding * 2);
    const y = height - padding - ((item.value - yMin) / yRange) * (height - padding * 2);

    return { ...item, x, y };
  });

  return (
    <ChartShell>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[320px] w-full rounded-2xl bg-white border border-slate-200">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#dbe4f2" strokeWidth="2" />
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#dbe4f2" strokeWidth="2" />

        {points.map((point) => (
          <circle key={point.label} cx={point.x} cy={point.y} r="8" fill="#38bdf8" stroke="#ffffff" strokeWidth="3">
            <title>
              {point.label}: {point.value}
            </title>
          </circle>
        ))}
      </svg>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        Each point represents one feature/category value returned by the uploaded dataset analysis.
      </p>
    </ChartShell>
  );
}

function HeatmapView({ data }) {
  const values = data.map((item) => Math.abs(item.value));
  const max = Math.max(...values, 1);

  return (
    <ChartShell>
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-center">
        <div className="grid grid-cols-5 gap-2">
          {data.slice(0, 25).map((item, index) => {
            const opacity = Math.max(0.2, Math.abs(item.value) / max);

            return (
              <div
                key={`${item.label}-${index}`}
                className="h-12 w-12 rounded-xl bg-violet-600 text-white grid place-items-center text-[11px] font-black"
                style={{ opacity }}
                title={`${item.label}: ${item.value}`}
              >
                {item.value.toFixed(1)}
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="text-lg font-black text-slate-900">Correlation style view</h3>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            Stronger coloured cells represent stronger relationships or feature importance
            values detected from the uploaded dataset analysis.
          </p>
        </div>
      </div>
    </ChartShell>
  );
}

function BoxPlotView({ values }) {
  const sorted = [...values].sort((a, b) => a - b);

  const min = sorted[0] ?? 0;
  const max = sorted[sorted.length - 1] ?? 0;
  const q1 = getQuartile(sorted, 0.25);
  const median = getQuartile(sorted, 0.5);
  const q3 = getQuartile(sorted, 0.75);
  const range = max - min || 1;

  const toPercent = (value) => ((value - min) / range) * 100;

  return (
    <ChartShell>
      <div className="py-10">
        <div className="relative mx-8 h-36">
          <div
            className="absolute top-[70px] h-1 rounded-full bg-violet-600"
            style={{
              left: `${toPercent(min)}%`,
              width: `${toPercent(max) - toPercent(min)}%`,
            }}
          />

          <div
            className="absolute top-[42px] h-16 rounded-2xl border-4 border-violet-600 bg-violet-100"
            style={{
              left: `${toPercent(q1)}%`,
              width: `${Math.max(4, toPercent(q3) - toPercent(q1))}%`,
            }}
          />

          <div
            className="absolute top-[34px] h-20 w-1 rounded-full bg-slate-900"
            style={{ left: `${toPercent(median)}%` }}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            ["Min", min],
            ["Q1", q1],
            ["Median", median],
            ["Q3", q3],
            ["Max", max],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-bold text-slate-500">{label}</p>
              <b className="text-xl font-black text-slate-900">{value.toFixed(2)}</b>
            </div>
          ))}
        </div>
      </div>
    </ChartShell>
  );
}

function PredictionView({ chartPayload }) {
  const metrics = chartPayload?.metrics || {};
  const accuracy = chartPayload?.accuracy_score || metrics?.accuracy || metrics?.score || "Auto";
  const algorithm = chartPayload?.algorithm || metrics?.algorithm || "Auto selected";

  return (
    <ChartShell>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold text-slate-500">Selected Algorithm</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">{algorithm}</h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold text-slate-500">Accuracy Score</p>
          <h2 className="mt-2 text-2xl font-black text-emerald-600">{accuracy}%</h2>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-bold text-slate-500">Pipeline Status</p>
          <h2 className="mt-2 text-2xl font-black text-violet-600">Ready</h2>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-black text-slate-900">Prediction explanation</h3>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          ADP AI selected a suitable ML pipeline based on your question and uploaded
          dataset. Ask the AI Copilot for a simple explanation of this prediction result.
        </p>
      </div>
    </ChartShell>
  );
}

export default function Charts() {
  const { chartPayload } = useApp();
  const [activeTab, setActiveTab] = useState("bar");

  const data = useMemo(() => normalizeChartPayload(chartPayload), [chartPayload]);
  const values = useMemo(() => data.map((item) => item.value), [data]);

  const title =
    chartPayload?.chart_data?.title ||
    chartPayload?.algorithm ||
    "Dataset Visual Analysis";

  if (!chartPayload || data.length === 0) {
    return <EmptyCharts />;
  }

  const renderChart = () => {
    switch (activeTab) {
      case "bar":
        return <BarChartView data={data} />;

      case "line":
        return <LineChartView data={data} />;

      case "pie":
        return <PieChartView data={data} />;

      case "histogram":
        return <HistogramView values={values} />;

      case "scatter":
        return <ScatterView data={data} />;

      case "heatmap":
        return <HeatmapView data={data} />;

      case "box":
        return <BoxPlotView values={values} />;

      case "prediction":
        return <PredictionView chartPayload={chartPayload} />;

      default:
        return <BarChartView data={data} />;
    }
  };

  return (
    <div className="w-full rounded-3xl bg-white p-5">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            ADP AI generated these visual views from the uploaded dataset analysis payload.
          </p>
        </div>

        <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-600">
          Live dataset visuals
        </span>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {chartTabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            className={
              activeTab === tab.id
                ? "rounded-2xl bg-violet-600 px-4 py-3 text-sm font-black text-white shadow-lg"
                : "rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-600 hover:bg-violet-50"
            }
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div>{renderChart()}</div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h3 className="text-lg font-black text-slate-900">What this visual means</h3>
        <p className="mt-2 text-sm leading-7 text-slate-500">
          This chart is created from the values returned by your ADP AI backend after
          analysing the uploaded dataset. Use the chart buttons above to view the same
          dataset from different analytical angles.
        </p>
      </div>
    </div>
  );
}