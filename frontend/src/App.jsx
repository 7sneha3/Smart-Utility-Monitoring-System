import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import Homepage from "./pages/Homepage";
import UploadPage from "./pages/UploadPage";
import ManualEntry from "./pages/ManualEntry";
import ReportsPage from "./pages/Reports";
import FAQ from "./pages/FAQ";
import ScrollToTop from "./components/ScrollToTop";
import './index.css';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/manual" element={<ManualEntry />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/faqs" element={<FAQ />} />
      </Routes>
    </Router>
  );
}




