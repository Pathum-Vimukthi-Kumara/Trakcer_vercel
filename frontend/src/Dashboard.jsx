import React, { useState, useEffect } from "react";
import axios from "axios";
import Transaction from "./Components/Transactions";
import ChartSection from "./Components/ChartSection";
import "./Dashboard.css";


const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const transactionsData = await axios.get("http://localhost:3011/api/v1/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(transactionsData.data);
    } catch (error) {
      console.error("Error fetching data:", error.response ? error.response.data : error.message);
    }
  };

  const addTransaction = async (transaction) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://localhost:3011/api/v1/transactions", transaction, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Error adding transaction:", error.response ? error.response.data : error.message);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3011/api/v1/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions((prev) => prev.filter((transaction) => transaction.id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="dashboard">
      <div className="content-row">
        {/* Chart Section */}
        <div className="section">


        <Transaction transactions={transactions} addTransaction={addTransaction} deleteTransaction={deleteTransaction} />
        </div>

        {/* Transaction Section */}
        <div className="section">
        <ChartSection transactions={transactions} />
         
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
