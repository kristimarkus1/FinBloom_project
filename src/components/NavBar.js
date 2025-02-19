import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import "../styles/Navbar.css";

const NavBar = ({ logo }) => {
  
    const navigate = useNavigate();
  
    const handleLogout = async () => {
      try {
        await auth.signOut();
        navigate("/"); // Redirect to login page
      } catch (error) {
        console.error("Logout Error:", error.message);
      }
    };
  
    return (
      <nav className="navbar">
        <img src={logo} alt="FinBloom Logo" className="nav-logo" />
        <ul>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/budget">Budget</a></li>
          <li><a href="/savings">Savings</a></li>
          <li><a href="/debts">Debts</a></li>
          <li><a href="/todo">To-Do</a></li>
          <li><a href="/notes">Notes</a></li>
          <li><button className="logout-btn" onClick={handleLogout} >Logout</button></li>
        </ul>
      </nav>
    );
  };
  
  export default NavBar;

  





  