"use client";

import Calendar from "@/components/Calendar";

type AvailableDate = { id: number; submissionId: number; date: string };
type Submission = { id: number; tripId: number; createdAt: Date; dates: AvailableDate[] };

function buildHeatmap(submissions: Submission[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const sub of submissions) {
    for (const d of sub.dates) {
      map.set(d.date, (map.get(d.date) ?? 0) + 1);
    }
  }
  return map;
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getTopDates(heatmap: Map<string, number>, n = 5) {
  return [...heatmap.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n);
}

function getTopRanges(heatmap: Map<string, number>, minLen = 3, n = 3) {
  const allDates = [...heatmap.keys()].filter((d) => (heatmap.get(d) ?? 0) > 0).sort();
  const ranges: { start: string; end: string; score: number; len: number }[] = [];

  let i = 0;
  while (i < allDates.length) {
    const start = allDates[i];
    let j = i;
    // Extend while consecutive calendar days
    while (
      j + 1 < allDates.length &&
      daysBetween(allDates[j], allDates[j + 1]) === 1
    ) {
      j++;
    }
    const runDates = allDates.slice(i, j + 1);
    if (runDates.length >= minLen) {
      const score = runDates.reduce((s, d) => s + (heatmap.get(d) ?? 0), 0);
      ranges.push({ start: runDates[0], end: runDates[runDates.length - 1], score, len: runDates.length });
    }
    i = j + 1;
  }

  return ranges.sort((a, b) => b.score - a.score || b.len - a.len).slice(0, n);
}

function daysBetween(a: string, b: string) {
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  return Math.round((db - da) / 86_400_000);
}

export default function OverlapTab({ submissions }: { submissions: Submission[] }) {
  const heatmap = buildHeatmap(submissions);
  const maxCount = Math.max(0, ...heatmap.values());
  const topDates = getTopDates(heatmap);
  const topRanges = getTopRanges(heatmap);

  if (submissions.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 space-y-2">
        <div className="text-4xl">📅</div>
        <p className="font-medium">No submissions yet</p>
        <p className="text-sm">Add availability from the &quot;My Dates&quot; tab.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Group overlap</h2>
        <p className="text-sm text-gray-500 mt-1">
          {submissions.length} submission{submissions.length > 1 ? "s" : ""} — darker = more people available
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4">
        <Calendar mode="heatmap" heatmap={heatmap} maxCount={maxCount} />

        {/* Legend */}
        <div className="mt-4 flex items-center gap-2 justify-center">
          <span className="text-xs text-gray-400">Fewer</span>
          {["bg-blue-100", "bg-blue-300", "bg-blue-500", "bg-blue-700"].map((c) => (
            <div key={c} className={`w-5 h-5 rounded-full ${c}`} />
          ))}
          <span className="text-xs text-gray-400">More</span>
        </div>
      </div>

      {/* Top individual dates */}
      {topDates.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <h3 className="font-semibold text-gray-800 text-sm">🏆 Best individual dates</h3>
          <ol className="space-y-2">
            {topDates.map(([date, count], idx) => (
              <li key={date} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}</span>
                  <span className="text-sm text-gray-800">{formatDate(date)}</span>
                </span>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 rounded-full px-2 py-0.5">
                  {count} / {submissions.length}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Top date ranges */}
      {topRanges.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-3">
          <h3 className="font-semibold text-gray-800 text-sm">📆 Best multi-day windows</h3>
          <ol className="space-y-2">
            {topRanges.map((r, idx) => (
              <li key={r.start} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}</span>
                  <span className="text-sm text-gray-800">
                    {formatDate(r.start)} – {formatDate(r.end)}
                    <span className="text-xs text-gray-400 ml-1">({r.len}d)</span>
                  </span>
                </span>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5">
                  {r.score} overlap
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {topRanges.length === 0 && topDates.length > 0 && (
        <p className="text-center text-sm text-gray-400">
          No contiguous 3+ day windows found yet.
        </p>
      )}
    </div>
  );
}
