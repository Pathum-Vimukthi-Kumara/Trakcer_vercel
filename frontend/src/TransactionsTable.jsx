import React, { useState, useEffect } from "react";
import "./TransactionsTable.css";

const TransactionsTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("http://localhost:3011/api/v1/transactions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const formattedData = data.map((transaction) => ({
          ...transaction,
          amount: parseFloat(transaction.amount),
        }));
        setTransactions(formattedData);
      } else {
        const error = await response.json();
        setApiError(error.message || "Failed to fetch transactions.");
      }
    } catch (error) {
      setApiError("An unexpected error occurred while fetching transactions.");
    }
  };

  return (
    <div className="transactions-table"
    style={{
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
  
  }}>
    <div className="transactions-table">
      <h2>All Transactions</h2>

      {apiError && <p className="error">{apiError}</p>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th id="Id">ID</th>
              <th>Title</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.id}</td>
                  <td>{transaction.title}</td>
                  <td
                    className={
                      transaction.type === "income" ? "type-income" : "type-expense"
                    }
                  >
                    {transaction.type.charAt(0).toUpperCase() +
                      transaction.type.slice(1)}
                  </td>
                  <td>
                    {typeof transaction.amount === "number"
                      ? `Rs.${Number(transaction.amount).toFixed(2)}`
                      : "Invalid Amount"}
                  </td>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-transactions">
                  No transactions available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
};

export default TransactionsTable;