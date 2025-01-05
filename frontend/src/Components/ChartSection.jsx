import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import "./ChartSection.css";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const ChartSection = () => {
  const [transactions, setTransactions] = useState([]);
  const [overallChartData, setOverallChartData] = useState({
    labels: ["Income", "Expenses"],
    datasets: [
      {
        data: [0, 0], // Initial data
        backgroundColor: ["white", "white"],
      },
    ],
  });
  const [dailyExpenseChartData, setDailyExpenseChartData] = useState({
    labels: [], // Daily dates
    datasets: [
      {
        label: "Daily Expenses",
        data: [], // Initial data
        backgroundColor: "#DC143C",
      },
    ],
  });
  const [dailyIncomeChartData, setDailyIncomeChartData] = useState({
    labels: [], // Daily dates
    datasets: [
      {
        label: "Daily Income",
        data: [], // Initial data
        backgroundColor: "#22c703",
      },
    ],
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("http://localhost:3011/api/v1/transactions", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
        } else {
          console.error("Failed to fetch transactions.");
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    setOverallChartData({
      labels: ["Income", "Expenses"],
      datasets: [
        {
          data: [income, expenses],
          backgroundColor: ["#4CAF50", "#DC143C"],
        },
      ],
    });

    const dailyExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        const date = new Date(t.date).toLocaleDateString();
        acc[date] = (acc[date] || 0) + parseFloat(t.amount);
        return acc;
      }, {});

    const dailyExpenseLabels = Object.keys(dailyExpenses).sort();
    const dailyExpenseData = dailyExpenseLabels.map((date) => dailyExpenses[date]);

    setDailyExpenseChartData({
      labels: dailyExpenseLabels,
      datasets: [
        {
          label: "Daily Expenses",
          data: dailyExpenseData,
          backgroundColor: "#DC143C",
        },
      ],
    });

    const dailyIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => {
        const date = new Date(t.date).toLocaleDateString();
        acc[date] = (acc[date] || 0) + parseFloat(t.amount);
        return acc;
      }, {});

    const dailyIncomeLabels = Object.keys(dailyIncome).sort();
    const dailyIncomeData = dailyIncomeLabels.map((date) => dailyIncome[date]);

    setDailyIncomeChartData({
      labels: dailyIncomeLabels,
      datasets: [
        {
          label: "Daily Income",
          data: dailyIncomeData,
          backgroundColor: "#4CAF50",
        },
      ],
    });
  }, [transactions]);

  return (
    <div className="chart-section">
      <h2 style={{ color: "black" }}>Budget Analysis</h2>

      <div className="chart-container">
        <div className="pie_chart">
          <h3 style={{ color: "black" }}>Overall Budget Breakdown</h3>
          <Pie
            data={overallChartData}
            options={{
              plugins: {
                legend: {
                  labels: {
                    color: "black", // Legend text color
                  },
                },
              },
            }}
          />
        </div>

        <div className="bar_chart">
          <h3 style={{ color: "black" }}>Daily Expenses</h3>
          <Bar
            data={dailyExpenseChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { labels: { color: "black" } }, // Legend text color
              },
              scales: {
                x: {
                  ticks: { color: "black" },
                  grid: { color: "black" },
                },
                y: {
                  ticks: { color: "black" },
                  grid: { color: "black" },
                },
              },
            }}
          />
        </div>

        <div className="bar_chart">
          <h3 style={{ color: "black" }}>Daily Income</h3>
          <Bar
            data={dailyIncomeChartData}
            options={{
              responsive: true,
              plugins: {
                legend: { labels: { color: "black" } }, // Legend text color
              },
              scales: {
                x: {
                  ticks: { color: "black" },
                  grid: { color: "black" },
                },
                y: {
                  ticks: { color: "black" },
                  grid: { color: "black" },
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartSection;
