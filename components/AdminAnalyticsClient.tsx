"use client";

import { useState, useEffect } from "react";

interface PageView {
  date: string;
  views: number;
  sessions: number;
}

interface Referrer {
  referrer: string;
  count: number;
}

interface AnalyticsData {
  ok: boolean;
  pageViewsByDay: PageView[];
  deviceBreakdown: { mobile: number; desktop: number };
  topReferrers: Referrer[];
}

interface Props {
  initialData: AnalyticsData;
}

export default function AdminAnalyticsClient({ initialData }: Props) {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<AnalyticsData>(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    fetch(`${base}/api/admin/analytics?days=${days}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.ok) setData(d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  const maxViews = Math.max(1, Math.max(...(data.pageViewsByDay || []).map((p) => p.views)));

  return (
    <div className="space-y-6">
      {/* Day range buttons */}
      <div className="flex gap-2">
        {[7, 14, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            style={{
              backgroundColor: days === d ? "var(--brand-green)" : "rgba(255, 255, 255, 0.05)",
              color: days === d ? "white" : "rgba(255, 255, 255, 0.7)",
            }}
          >
            {d}d
          </button>
        ))}
      </div>

      {/* Page views chart */}
      <div
        className="rounded-lg p-6"
        style={{ backgroundColor: "#1a2e1a", border: "1px solid rgba(255, 255, 255, 0.1)" }}
      >
        <h2 className="mb-6 text-xl font-semibold text-white">Page Views by Day</h2>
        {data.pageViewsByDay && data.pageViewsByDay.length > 0 ? (
          <div className="flex items-end justify-start gap-2 overflow-x-auto pb-4 h-40">
            {data.pageViewsByDay.map((pv, idx) => {
              const barHeight = (pv.views / maxViews) * 120;
              return (
                <div key={idx} className="flex flex-col items-center gap-2 min-w-fit">
                  <div
                    className="rounded-t"
                    style={{
                      width: "32px",
                      height: `${barHeight}px`,
                      backgroundColor: "var(--brand-green)",
                    }}
                    title={`${pv.views} views, ${pv.sessions} sessions`}
                  />
                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(pv.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400">No data available</p>
        )}
      </div>

      {/* Device breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className="rounded-lg p-6"
          style={{ backgroundColor: "#1a2e1a", border: "1px solid rgba(255, 255, 255, 0.1)" }}
        >
          <p className="text-sm text-gray-400 font-medium">Mobile</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {data.deviceBreakdown.mobile}%
          </p>
        </div>
        <div
          className="rounded-lg p-6"
          style={{ backgroundColor: "#1a2e1a", border: "1px solid rgba(255, 255, 255, 0.1)" }}
        >
          <p className="text-sm text-gray-400 font-medium">Desktop</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {data.deviceBreakdown.desktop}%
          </p>
        </div>
      </div>

      {/* Top referrers */}
      <div
        className="rounded-lg p-6"
        style={{ backgroundColor: "#1a2e1a", border: "1px solid rgba(255, 255, 255, 0.1)" }}
      >
        <h2 className="mb-6 text-xl font-semibold text-white">Top Referrers</h2>
        {data.topReferrers && data.topReferrers.length > 0 ? (
          <div className="space-y-4">
            {data.topReferrers.map((ref, idx) => {
              const maxCount = Math.max(
                1,
                Math.max(...(data.topReferrers || []).map((r) => r.count))
              );
              const barWidth = (ref.count / maxCount) * 100;
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300 truncate">{ref.referrer}</span>
                    <span className="text-gray-400">{ref.count}</span>
                  </div>
                  <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: "var(--brand-green)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400">No referrer data available</p>
        )}
      </div>
    </div>
  );
}
