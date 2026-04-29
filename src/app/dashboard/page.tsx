"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type DashboardData = {
  mastery: { component: string; attempts: number; correct: number; accuracy: number }[];
  sessions: { session: number; date: string; totalHands: number; correct: number; accuracy: number }[];
  rollingAccuracy: { hand: number; accuracy: number }[];
  overall: { totalHands: number; totalCorrect: number; accuracy: number };
};

const COMPONENT_COLORS: Record<string, string> = {
  Hard: "#0d9488",
  Soft: "#7c3aed",
  Pair: "#dc2626",
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const d = await res.json();
          setData(d);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      }
      setLoading(false);
    }

    if (status === "authenticated") {
      fetchData();
    }
  }, [status]);

  if (status === "loading" || status === "unauthenticated" || loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!data || data.overall.totalHands === 0) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-4">Dashboard</h1>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
            <p className="text-gray-400 text-lg mb-4">No practice data yet.</p>
            <Link
              href="/practice"
              className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-6 py-3 rounded-lg transition-colors"
            >
              Start Practicing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-400 text-sm">Your learning progress</p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold">{data.overall.totalHands}</div>
            <div className="text-gray-400 text-sm mt-1">Total Hands</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-green-400">{data.overall.totalCorrect}</div>
            <div className="text-gray-400 text-sm mt-1">Correct</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
            <div className="text-3xl font-bold text-yellow-400">{data.overall.accuracy}%</div>
            <div className="text-gray-400 text-sm mt-1">Overall Accuracy</div>
          </div>
        </div>

        {/* Accuracy Over Time */}
        {data.rollingAccuracy.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Accuracy Over Time</h2>
            <p className="text-gray-400 text-xs mb-4">Rolling average of last 10 hands</p>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.rollingAccuracy}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="hand"
                  stroke="#64748b"
                  fontSize={12}
                  label={{ value: "Hand #", position: "insideBottom", offset: -5, fill: "#64748b" }}
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                  labelStyle={{ color: "#94a3b8" }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={((value: number) => [`${value}%`, "Accuracy"]) as any}
                  labelFormatter={(label) => `Hand ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#eab308"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Mastery by Component */}
        {data.mastery.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Mastery by Hand Type</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.mastery} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="component" stroke="#64748b" fontSize={14} />
                <YAxis
                  stroke="#64748b"
                  fontSize={12}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                  labelStyle={{ color: "#94a3b8" }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={((value: number) => [`${value}%`, "Accuracy"]) as any}
                />
                <Bar dataKey="accuracy" radius={[6, 6, 0, 0]}>
                  {data.mastery.map((entry) => (
                    <Cell
                      key={entry.component}
                      fill={COMPONENT_COLORS[entry.component] || "#64748b"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Session History */}
        {data.sessions.length > 0 && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Session History</h2>
            <div className="space-y-2">
              {data.sessions
                .slice()
                .reverse()
                .map((s) => (
                  <div
                    key={s.session}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg text-sm"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400">Session {s.session}</span>
                      <span className="text-gray-500">{s.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-300">
                        {s.correct}/{s.totalHands} correct
                      </span>
                      <span
                        className={`font-semibold ${
                          s.accuracy >= 80
                            ? "text-green-400"
                            : s.accuracy >= 50
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {s.accuracy}%
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}