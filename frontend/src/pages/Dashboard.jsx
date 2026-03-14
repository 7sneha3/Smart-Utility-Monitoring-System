import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ---------------------------------------------
// Smart Utility Monitoring - Dashboard (React)
// Single file with multiple components:
// - Header
// - Filters
// - SummaryCards
// - EnergyTrend (line)
// - MonthlyComparison (bar)
// - PieCharts (resource & cost)
//
// Tailwind CSS is used for styling (project must have Tailwind set up)
// Charts use `recharts` library. Install with:
// npm install recharts
// ---------------------------------------------

// Utility: generate 50 days of dummy data (energy kWh and water L)

// function generateDummyData(days = 50) {
//   const today = new Date();
//   const data = [];
//   for (let i = days - 1; i >= 0; i--) {
//     const d = new Date();
//     d.setDate(today.getDate() - i);
//     const iso = d.toISOString().slice(0, 10);
//     // energy between 400 and 1200
//     const energy = Math.round(400 + Math.random() * 800 + (Math.sin(i / 4) * 80));
//     // water between 200 and 800
//     const water = Math.round(200 + Math.random() * 600 + (Math.cos(i / 6) * 50));
//     // cost example: energy cost ₹ per kWh ~ 3-6, water cost ₹ per L ~ 0.02-0.05
//     const energyCost = +(energy * (3 + Math.random() * 3)).toFixed(2);
//     const waterCost = +(water * (0.02 + Math.random() * 0.03)).toFixed(2);
//     data.push({ date: iso, energy, water, energyCost, waterCost });
//   }
//   return data;
// }


// Helper: aggregate to months
// function aggregateMonthwise(data) {
//   const map = {};
//   data.forEach((row) => {
//     const month = row.date.slice(0, 7); // YYYY-MM
//     if (!map[month]) map[month] = { energy: 0, water: 0 };
//     map[month].energy += row.energy;
//     map[month].water += row.water;
//   });
//   return Object.keys(map).map((m) => ({ month: m, energy: Math.round(map[m].energy), water: Math.round(map[m].water) }));
// }

// Color palette
const COLORS = ["#4ade80", "#60a5fa", "#f97316", "#a78bfa", "#fb7185"];

// ---------------- Subcomponents ----------------

function Header({ onRefresh }) {
  return (
    <div className="w-full px-6 py-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center shadow">
            <span className="text-white text-lg font-bold">⚡</span>
          </div>
          <div>
            <div className="text-white text-lg font-semibold">Analytics Dashboard</div>
            <div className="text-sm text-gray-300">Real-time Energy & Water Monitoring</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select className="text-g bg-white/5 px-3 py-2 rounded-md text-sm">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 50 Days</option>
            <option>Month-wise</option>
          </select>
          <button onClick={onRefresh} className="px-3 py-2 bg-green-500 rounded-md text-sm text-white">Refresh Data</button>
        </div>
      </div>
    </div>
  );
}

function SummaryCards({ data }) {
  const totalEnergy = data.reduce((s, r) => s + r.energy, 0);
  const totalWater = data.reduce((s, r) => s + r.water, 0);
  const totalCost = data.reduce((s, r) => s + r.energyCost + r.waterCost, 0).toFixed(2);
  // carbon footprint example: assume 0.0005 tons per kWh
  const carbon = +(totalEnergy * 0.0005).toFixed(2);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white/90 text-gray-900 p-4 rounded-lg shadow">
        <div className="text-sm">Total Energy Consumption</div>
        <div className="text-2xl font-bold">{totalEnergy.toLocaleString()} kWh</div>
        <div className="text-xs text-green-600 mt-1">▲ 12.5% from last month</div>
      </div>

      <div className="bg-white/90 text-gray-900 p-4 rounded-lg shadow">
        <div className="text-sm">Water Usage</div>
        <div className="text-2xl font-bold">{totalWater.toLocaleString()} L</div>
        <div className="text-xs text-red-600 mt-1">▼ 5.2% from last month</div>
      </div>

      <div className="bg-white/90 text-gray-900 p-4 rounded-lg shadow">
        <div className="text-sm">Total Cost</div>
        <div className="text-2xl font-bold">₹{Number(totalCost).toLocaleString()}</div>
        <div className="text-xs text-green-600 mt-1">▲ 8.3% from last month</div>
      </div>

      <div className="bg-white/90 text-gray-900 p-4 rounded-lg shadow">
        <div className="text-sm">Carbon Footprint</div>
        <div className="text-2xl font-bold">{carbon} tons</div>
        <div className="text-xs text-red-600 mt-1">▼ 3.8% from last month</div>
      </div>
    </div>
  );
}

function Filters({ range, setRange, metric, setMetric }) {
  return (
    <div className="flex items-center gap-4">
      <select value={range} onChange={(e) => setRange(e.target.value)} className="px-3 py-2 rounded-md bg-white/5">
        <option value="7">Last 7 Days</option>
        <option value="30">Last 30 Days</option>
        <option value="50">Last 50 Days</option>
        <option value="month">Month-wise</option>
      </select>

      <select value={metric} onChange={(e) => setMetric(e.target.value)} className="px-3 py-2 rounded-md bg-white/5">
        <option value="both">Energy & Water</option>
        <option value="energy">Energy</option>
        <option value="water">Water</option>
      </select>
    </div>
  );
}

function EnergyTrend({ data, metric }) {
  return (
    <div className="bg-white/90 p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Energy Consumption Trend</h3>
        <div className="text-sm text-gray-600">Daily</div>
      </div>
      <div className="w-full h-[250px]">
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="day" />
      <YAxis />
      <Tooltip />

      <Line
        type="monotone"
        dataKey="value"
        stroke={metric === "water" ? "#3B82F6" : "#10B981"}
        strokeWidth={3}
        dot={false}
      />

    </LineChart>
  </ResponsiveContainer>
</div>
    </div>
  );
}

function MonthlyComparison({ monthlyData }) {
  return (
    <div className="bg-white/90 p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Monthly Comparison</h3>
        <div className="text-sm text-gray-600">2025</div>
      </div>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="energy" fill="#10B981" />
            <Bar dataKey="water" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PieCharts({ data }) {
  // resource distribution (sum of energy vs water vs others)
  const totalEnergy = data.reduce((s, r) => s + r.energy, 0);
  const totalWater = data.reduce((s, r) => s + r.water, 0);
  const other = Math.max(0, Math.round((totalEnergy + totalWater) * 0.1));
  const resourceData = [
    { name: "Energy", value: totalEnergy },
    { name: "Water", value: totalWater },
    { name: "Other", value: other },
  ];

  const costEnergy = data.reduce((s, r) => s + r.energyCost, 0);
  const costWater = data.reduce((s, r) => s + r.waterCost, 0);
  const costOther = Math.round((costEnergy + costWater) * 0.1);
  const costData = [
    { name: "Energy Cost", value: costEnergy },
    { name: "Water Cost", value: costWater },
    { name: "Other", value: costOther },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white/90 p-4 rounded-lg shadow">
        <h4 className="font-semibold mb-3">Resource Distribution</h4>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={resourceData} dataKey="value" nameKey="name" outerRadius={80} fill="#8884d8">
                {resourceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white/90 p-4 rounded-lg shadow">
        <h4 className="font-semibold mb-3">Cost Breakdown</h4>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={costData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                {costData.map((entry, index) => (
                  <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ---------------- Main Dashboard Component ----------------
export default function DashboardPage() {

  // const fullData = useMemo(() => generateDummyData(50), []);
  
  const [range, setRange] = useState("50"); // default last 50 days
  const [metric, setMetric] = useState("both");
  const [chartData, setChartData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(3);
  const [selectedUtility, setSelectedUtility] = useState("");
  const [resourceType, setResourceType] = useState("energy");
  
  const fullData = chartData;
  
  const fetchConsumption = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:5000/consumption",
        {
          params: {
            type: resourceType,
            month: selectedMonth,
            sub_utility: selectedUtility
          }
        }
      );
  
      setChartData(response.data);
  
    } catch (error) {
      console.error("Error fetching consumption data:", error);
    }
  };


  useEffect(() => {
    fetchConsumption();
  }, [resourceType, selectedMonth, selectedUtility]);


  const filteredData = chartData;

  // const monthlyData = useMemo(() => aggregateMonthwise(fullData), [fullData]);

  const handleRefresh = () => {
    // placeholder: in real app you may re-fetch from backend
    console.log("refresh clicked");
  };

  return (
    <Layout>
      <div className="min-h-screen p-6" style={{ background: "linear-gradient(135deg, rgba(26,71,42,0.92) 0%, rgba(10,31,46,0.92) 50%, rgba(0,26,51,0.94) 100%)" }}>
        <div className="max-w-6xl mx-auto space-y-6">
          <Header onRefresh={handleRefresh} />

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Overview of energy & water consumption</h1>
            </div>

            <div className="flex items-center gap-3">

  <Filters
    range={range}
    setRange={setRange}
    metric={metric}
    setMetric={(val)=>{
      setMetric(val)
      setResourceType(val === "water" ? "water" : "energy")
    }}
  />

  {/* Month dropdown */}
  <select
    value={selectedMonth}
    onChange={(e)=>setSelectedMonth(e.target.value)}
    className="px-3 py-2 rounded-md bg-white/10 text-white"
  >
    <option value="1">Jan</option>
    <option value="2">Feb</option>
    <option value="3">Mar</option>
    <option value="4">Apr</option>
    <option value="5">May</option>
    <option value="6">Jun</option>
  </select>

  {/* Utility dropdown */}
  <select
    value={selectedUtility}
    onChange={(e)=>setSelectedUtility(e.target.value)}
    className="px-3 py-2 rounded-md bg-white/10 text-white"
  >
    <option value="">All Utilities</option>
    <option value="solar panels">Solar Panels</option>
    <option value="backup diesel generator">Backup Diesel Generator</option>
    <option value="borewell pump">Borewell Pump</option>
  </select>

</div>
          </div>

          {/* <SummaryCards data={fullData} /> */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnergyTrend data={filteredData} metric={metric} />
            {/* <MonthlyComparison monthlyData={monthlyData} /> */}
          </div>

          {/* <PieCharts data={fullData} /> */}

          {/* <div className="text-center text-gray-300 mt-6">© 2026 Energy & Water Management Portal</div> */}
        </div>
      </div>
    </Layout>
  );
}
