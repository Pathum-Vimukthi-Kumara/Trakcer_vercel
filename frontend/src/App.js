import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./Login";
import SignUp from "./SignUp";
import Dashboard from "./Dashboard";
import Onboard from "./Onboard";
import Header from "./Header";
import TransactionsTable from "./TransactionsTable";
import Calendar from "./Calendar";

import ChartSection from "./Components/ChartSection";  
import Footer from "./Footer";

import "./Dashboard.css";
import "./Header.css";
import "./TransactionsTable.css";
import "./Calendar.css";


const App = () => {
  return (
    <div className="App">
      <Router>
        <Header />
        <main>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/profile" element={<Dashboard />} />
            <Route path="/transactions" element={<TransactionsTable />} />
            <Route path="/calendar" element={<Calendar />} />
            
            <Route path="/charts" element={<ChartSection />} />  
            <Route path="/" element={<Onboard />} />
          </Routes>
        </main>
     
      </Router>
      <Footer />
    </div>
  );
};

export default App;
