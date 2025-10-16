import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Patients from "./pages/Patients";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const handleLogin = (token) => {
    localStorage.setItem("token", token);
    setToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(""); // important! triggers rerender
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={token ? <Navigate to="/patients" /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/patients"
          element={token ? <Patients token={token} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to={token ? "/patients" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
