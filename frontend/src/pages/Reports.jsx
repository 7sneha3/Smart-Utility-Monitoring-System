import React, { useMemo, useState } from "react";
import Layout from "../components/Layout"; // your hamburger layout
import { format, parseISO } from "date-fns";

/**
 * Reports.jsx
 * Option B - Semi-functional Reports Archive using dummy data
 *
 * Drop into src/pages/Reports.jsx
 * Requires: Tailwind CSS, Layout component
 */

function generateDummyReports(count = 24) {
  const types = ["Daily", "Monthly", "Quarterly", "Yearly"];
  const locations = ["Building A", "Building B", "All Buildings", "Plant 1"];
  const today = new Date();
  const reports = [];
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 120); // up to 120 days back
    const d = new Date(today);
    d.setDate(today.getDate() - daysAgo);
    const dateISO = d.toISOString().slice(0, 10);
    const type = types[Math.floor(Math.random() * types.length)];
    const loc = locations[Math.floor(Math.random() * locations.length)];
    const energy = Math.round(500 + Math.random() * 4000); // kWh
    const water = Math.round(200 + Math.random() * 3000); // L
    const cost = Math.round(energy * (3 + Math.random() * 3) + water * (0.02 + Math.random() * 0.03));
    const sizeMB = +(0.5 + Math.random() * 12).toFixed(2);
    const title = `${type} Consumption Report - ${format(d, "MMM dd, yyyy")}`;
    reports.push({
      id: `RPT-${1000 + i}`,
      title,
      generated: dateISO,
      type,
      location: loc,
      energy,
      water,
      cost,
      sizeMB,
    });
  }
  // sort newest first
  return reports.sort((a, b) => (a.generated < b.generated ? 1 : -1));
}

function StatBox({ title, value }) {
  return (
    <div className="bg-white/90 text-gray-900 p-6 rounded-lg shadow flex-1">
      <div className="text-sm">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  );
}

function ReportCard({ r, onView }) {
  return (
    <div className="bg-white/95 rounded-2xl p-5 shadow border border-gray-200">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-blue-600">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="#7C83FF" strokeWidth="1.2" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-lg">{r.title}</div>
            <div className="text-xs text-gray-500 mt-1">
              Generated: {format(parseISO(r.generated), "MMM d, yyyy")} • {r.location}
            </div>
          </div>
        </div>
        <div>
          <span className="text-xs px-3 py-1 rounded-full bg-green-50 text-green-600">{r.type}</span>
        </div>
      </div>

      <div className="mt-4 bg-gray-50 rounded-md p-3 text-sm text-gray-700 grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-gray-500">Energy Used</div>
          <div className="font-semibold mt-1">{r.energy.toLocaleString()} kWh</div>
          <div className="text-xs text-gray-400 mt-1">Total Cost</div>
          <div className="font-semibold">₹{r.cost.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Water Used</div>
          <div className="font-semibold mt-1">{r.water.toLocaleString()} L</div>
          <div className="text-xs text-gray-400 mt-1">File Size</div>
          <div className="font-semibold">{r.sizeMB} MB</div>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onView(r)}
          className="flex-1 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"
        >
          View
        </button>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            // simulate download
            const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${r.id}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="flex-1 py-2 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 text-white text-center"
        >
          Download
        </a>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const allReports = useMemo(() => generateDummyReports(28), []);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [loc, setLoc] = useState("All Locations");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewReport, setViewReport] = useState(null);

  // Locations list from data
  const locations = useMemo(() => {
    const set = new Set(allReports.map((r) => r.location));
    return ["All Locations", ...Array.from(set)];
  }, [allReports]);

  // Filter logic
  const filtered = useMemo(() => {
    return allReports.filter((r) => {
      if (typeFilter !== "All" && r.type !== typeFilter) return false;
      if (loc !== "All Locations" && r.location !== loc) return false;
      if (q && !r.title.toLowerCase().includes(q.toLowerCase())) return false;
      if (dateFrom) {
        const df = new Date(dateFrom);
        if (new Date(r.generated) < df) return false;
      }
      if (dateTo) {
        const dt = new Date(dateTo);
        // include the day fully
        dt.setHours(23, 59, 59, 999);
        if (new Date(r.generated) > dt) return false;
      }
      return true;
    });
  }, [allReports, typeFilter, loc, q, dateFrom, dateTo]);

  // Summary numbers
  const totalReports = filtered.length;
  const thisMonthCount = filtered.filter((r) => {
    const rp = parseISO(r.generated);
    const now = new Date();
    return rp.getMonth() === now.getMonth() && rp.getFullYear() === now.getFullYear();
  }).length;
  const quarterlyCount = filtered.filter((r) => {
    const rp = parseISO(r.generated);
    const month = rp.getMonth(); // 0-index
    return [0,1,2].includes(month) ? true : false; // example: Q1
  }).length;
  const totalSize = filtered.reduce((s, r) => s + Number(r.sizeMB), 0).toFixed(2) + " MB";

  return (
    <Layout>
      <div className="min-h-screen p-6" style={{ background: "linear-gradient(135deg, rgba(26,71,42,0.92) 0%, rgba(10,31,46,0.92) 50%, rgba(0,26,51,0.94) 100%)" }}>
        {/* Top bar like your design */}
        <div className="max-w-6xl mx-auto">

          {/* Title + Filters */}
          <div className="text-center text-white mb-6">
            <h1 className="text-3xl font-bold">Reports Archive</h1>
            <p className="text-sm text-gray-300 mt-2">Browse and download historical consumption reports</p>
          </div>

          {/* Search & filters box */}
          <div className="bg-white/90 rounded-xl p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="flex-1">
                <input
                  placeholder="Search by report name..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-gray-200"
                />
              </div>

              <div className="flex gap-3">
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 rounded-md border border-gray-200" />
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 rounded-md border border-gray-200" />
                <select value={loc} onChange={(e) => setLoc(e.target.value)} className="px-3 py-2 rounded-md border border-gray-200">
                  {locations.map((L) => <option key={L} value={L}>{L}</option>)}
                </select>
                <button onClick={() => { setQ(""); setDateFrom(""); setDateTo(""); setLoc("All Locations"); setTypeFilter("All"); }} className="px-3 py-2 bg-gray-50 rounded-md">Clear</button>
                <button onClick={() => {}} className="px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-md">Search</button>
              </div>
            </div>
          </div>

          {/* Type tabs */}
          <div className="flex gap-3 mb-6">
            {["All", "Daily", "Monthly", "Quarterly", "Yearly"].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-2 rounded-md ${typeFilter === t ? "bg-gradient-to-r from-green-400 to-blue-500 text-white" : "bg-white/5 text-white border border-white/10"}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Summary boxes */}
          <div className="flex gap-4 mb-8">
            <StatBox title="Total Reports" value={totalReports} />
            <StatBox title="This Month" value={thisMonthCount} />
            <StatBox title="Quarterly Reports" value={quarterlyCount} />
            <StatBox title="Total Size" value={totalSize} />
          </div>

          {/* Report cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((r) => (
              <ReportCard key={r.id} r={r} onView={(rep) => setViewReport(rep)} />
            ))}
          </div>

          {/* view modal */}
          {viewReport && (
            <div className="fixed inset-0 z-60 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50" onClick={() => setViewReport(null)}></div>
              <div className="relative max-w-3xl w-full bg-white rounded-2xl p-6 z-70">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{viewReport.title}</h3>
                    <div className="text-sm text-gray-500">Generated: {format(parseISO(viewReport.generated), "PPP")}</div>
                  </div>
                  <button onClick={() => setViewReport(null)} className="px-3 py-1 bg-gray-100 rounded-md">Close</button>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <div className="text-xs text-gray-500">Energy Used</div>
                    <div className="font-semibold">{viewReport.energy} kWh</div>
                    <div className="text-xs text-gray-500 mt-2">Total Cost</div>
                    <div className="font-semibold">₹{viewReport.cost}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Water Used</div>
                    <div className="font-semibold">{viewReport.water} L</div>
                    <div className="text-xs text-gray-500 mt-2">File Size</div>
                    <div className="font-semibold">{viewReport.sizeMB} MB</div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button onClick={() => setViewReport(null)} className="px-4 py-2 rounded-md border">Close</button>
                  <a href="#" onClick={(e) => { e.preventDefault(); /* same download */ const blob = new Blob([JSON.stringify(viewReport, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${viewReport.id}.json`; a.click(); URL.revokeObjectURL(url); }} className="px-4 py-2 bg-green-500 text-white rounded-md">Download</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
