import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { auth } from "./firebase";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import NavBar from "./components/NavBar";
import Budget from "./components/Budget";
import Savings from "./components/Savings";
import Debts from "./components/Debts";
import Footer from "./components/Footer";
import ToDo from "./components/To-Do";
import Notes from "./components/Notes";
import "./App.css";
import { ThemeProvider, useTheme } from "./components/ThemeContext";
import FinBloomLightLogo from "./assets/FinBloom_Light_Text.PNG";
import FinBloomDarkLogo from "./assets/FinBloom_Dark_Text.PNG";

const AppContent = () => {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="App">
      {user && location.pathname !== "/" && (
        <NavBar logo={theme === "dark" ? FinBloomDarkLogo : FinBloomLightLogo} />
      )}
      {location.pathname === "/" && (
        <div className="theme-toggle-container">
          <label className="switch">
            <input type="checkbox" onChange={toggleTheme} checked={theme === "dark"} />
            <span className="slider"></span>
          </label>
          <span>{theme === "light" ? "Try out dark theme!" : "Try out light theme!"}</span>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/savings" element={<Savings />} />
        <Route path="/debts" element={<Debts />} />
        <Route path="/todo" element={<ToDo />} />
        <Route path="/notes" element={<Notes />} />
      </Routes>
      {location.pathname !== "/" && <Footer />}
 
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;





