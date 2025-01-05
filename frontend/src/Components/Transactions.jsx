// src/Components/Transactions.jsx

import React, { useState, useEffect, useCallback } from "react";
import "./Transactions.css";
import { FaTrash, FaSearch, FaEdit, FaPlus } from "react-icons/fa";
import Modal from "react-modal";
import TransactionForm from "./TransactionForm"; // Ensure correct path

Modal.setAppElement("#root"); // Important for accessibility

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  const [apiError, setApiError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("income"); // 'income' or 'expense'
  const [editFormData, setEditFormData] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const calculateTotals = useCallback(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + (typeof t.amount === "number" ? t.amount : 0), 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + (typeof t.amount === "number" ? t.amount : 0), 0);

    setTotalIncome(income);
    setTotalExpense(expense);
    setBalance(income - expense);
  }, [transactions]);

  useEffect(() => {
    calculateTotals();
  }, [transactions, calculateTotals]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("http://localhost:3011/api/v1/transactions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched Transactions:", data); // For debugging

        if (Array.isArray(data)) {
          // Ensure amount is a number
          const parsedData = data.map((t) => ({
            ...t,
            amount: parseFloat(t.amount) || 0,
          }));
          setTransactions(parsedData);
        } else {
          console.error("Expected an array but got:", data);
          setTransactions([]);
          setApiError("Invalid API response format.");
        }
      } else {
        const error = await response.json();
        setApiError(error.message || "Failed to fetch transactions");
      }
    } catch (error) {
      setApiError("An unexpected error occurred while fetching transactions.");
    }
  };

  const addTransaction = async (transaction) => {
    try {
      const response = await fetch("http://localhost:3011/api/v1/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(transaction),
      });

      if (response.ok) {
        await fetchTransactions();
        closeModal();
      } else {
        const error = await response.json();
        setApiError(error.message || "Failed to add transaction");
      }
    } catch (error) {
      setApiError("An unexpected error occurred while adding the transaction.");
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const response = await fetch(`http://localhost:3011/api/v1/transactions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        await fetchTransactions();
      } else {
        const error = await response.json();
        setApiError(error.message || "Failed to delete transaction");
      }
    } catch (error) {
      setApiError("An unexpected error occurred while deleting the transaction.");
    }
  };

  const updateTransaction = async (id, updatedTransaction) => {
    try {
      const response = await fetch(`http://localhost:3011/api/v1/transactions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedTransaction),
      });

      if (response.ok) {
        await fetchTransactions();
        setEditFormData(null);
      } else {
        const error = await response.json();
        setApiError(error.message || "Failed to update transaction");
      }
    } catch (error) {
      setApiError("An unexpected error occurred while updating the transaction.");
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
    setEditFormData(null); // Ensure edit form is closed
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType("income");
  };

  const handleAddSubmit = (transaction) => {
    addTransaction(transaction);
  };

  const handleEditSubmit = (transaction) => {
    updateTransaction(editFormData.id, transaction);
  };

  const filteredTransactions = Array.isArray(transactions)
    ? transactions.filter((t) => t.title?.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <div className="transactions">
      <h2>Transactions</h2>

      {apiError && <p className="error">{apiError}</p>}

      <div className="summary">
        <div className="summary-box income">
          <h3>Total Income</h3>
          <p>Rs.{isNaN(totalIncome) ? "0.00" : totalIncome.toFixed(2)}</p>
        </div>
        <div className="summary-box expense">
          <h3>Total Expense</h3>
          <p>Rs.{isNaN(totalExpense) ? "0.00" : totalExpense.toFixed(2)}</p>
        </div>
        <div className="summary-box balance">
          <h3>Balance</h3>
          <p>Rs.{isNaN(balance) ? "0.00" : balance.toFixed(2)}</p>
        </div>
      </div>

      <div className="controls">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="add-buttons">
          <button onClick={() => openModal("income")} className="add-income">
            <FaPlus /> Add Income
          </button>
          <button onClick={() => openModal("expense")} className="add-expense">
            <FaPlus /> Add Expense
          </button>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Add Transaction"
        className="modal"
        overlayClassName="overlay"
      >
        <TransactionForm
          initialData={{ type: modalType }}
          onSubmit={handleAddSubmit}
          onClose={closeModal}
        />
      </Modal>

      {/* Edit Transaction Modal */}
      {editFormData && (
        <Modal
          isOpen={!!editFormData}
          onRequestClose={() => setEditFormData(null)}
          contentLabel="Edit Transaction"
          className="modal"
          overlayClassName="overlay"
        >
          <TransactionForm
            initialData={editFormData}
            onSubmit={handleEditSubmit}
            onClose={() => setEditFormData(null)}
          />
        </Modal>
      )}

      <div className="transaction-list">
        {filteredTransactions.map((t) => (
          <div key={t.id} className={`transaction-item ${t.type}`}>
            <div className="transaction-details">
              <span className="transaction-title">{t.title}</span>
              <span className="transaction-date">{t.date}</span>
              <span className="transaction-amount">
                Rs.{typeof t.amount === "number" ? t.amount.toFixed(2) : "0.00"}
              </span>
            </div>
            <div className="transaction-actions">
              <button onClick={() => deleteTransaction(t.id)} title="Delete">
                <FaTrash />
              </button>
              <button onClick={() => setEditFormData(t)} title="Edit">
                <FaEdit />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transactions;
