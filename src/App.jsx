/**
 * App — root component with React Router configuration.
 *
 * Routes:
 *  /           → HomePage (navigation links)
 *  /admin      → AdminPage (admin control panel)
 *  /display    → DisplayPage (external monitor for candidate)
 *  /plan/:id   → StudyPlanPage (QR code destination)
 *  /analytics  → AnalyticsPage (admin data dashboard)
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import DisplayPage from "./pages/DisplayPage";
import StudyPlanPage from "./pages/StudyPlanPage";
import AnalyticsPage from "./pages/AnalyticsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/display" element={<DisplayPage />} />
        <Route path="/plan/:assessmentId" element={<StudyPlanPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
