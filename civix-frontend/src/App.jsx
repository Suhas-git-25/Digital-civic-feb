import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PetitionList from "./pages/petitions/PetitionList";
import PetitionDetail from "./pages/petitions/PetitionDetail";
import CreatePetition from "./pages/petitions/CreatePetition";

import PollList from "./pages/polls/PollList";
import CreatePoll from "./pages/polls/CreatePoll";
import PollDetail from "./pages/polls/PollDetail";

import ReportsDashboard from "./pages/reports/ReportsDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/petitions"
          element={
            <ProtectedRoute>
              <PetitionList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/petitions/:id"
          element={
            <ProtectedRoute>
              <PetitionDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-petition"
          element={
            <ProtectedRoute>
              <CreatePetition />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-petition/:id"
          element={
            <ProtectedRoute>
              <CreatePetition />
            </ProtectedRoute>
          }
        />
        
        {/* Polls Routes */}
        <Route
          path="/polls"
          element={
            <ProtectedRoute>
              <PollList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-poll"
          element={
            <ProtectedRoute>
              <CreatePoll />
            </ProtectedRoute>
          }
        />
        <Route
          path="/polls/:id"
          element={
            <ProtectedRoute>
              <PollDetail />
            </ProtectedRoute>
          }
        />
        
        {/* Reports Route */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
