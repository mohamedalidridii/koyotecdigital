import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
    <Routes>
      <Route path="/*" element={<App />} />
    </Routes>
  </Router>
);
