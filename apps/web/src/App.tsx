import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import DonorDashboardPage from "./pages/DonorDashboardPage";
import ReceiverDashboardPage from "./pages/ReceiverDashboardPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/donor" element={<DonorDashboardPage />} />
      <Route path="/receiver" element={<ReceiverDashboardPage />} />
    </Routes>
  );
}
