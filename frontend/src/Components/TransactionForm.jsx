// src/Components/TransactionForm.jsx

import React, { useState } from "react";
import "./TransactionForm.css";

const TransactionForm = ({ initialData = null, onSubmit, onClose }) => {
  const [formData, setFormData] = useState(
    initialData || { title: "", amount: "", type: "income", date: "" }
  );
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.title ||
      isNaN(formData.amount) ||
      formData.amount <= 0 ||
      !formData.date
    ) {
      setError("Please provide a valid title, amount, and date.");
      return;
    }

    onSubmit(formData);
    setFormData({ title: "", amount: "", type: "income", date: "" });
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="transaction-form">
      <h2>{initialData ? "Add Transaction": "Edit Transaction"}</h2>
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={formData.title}
        onChange={handleChange}
      />
      <input
        type="number"
        name="amount"
        placeholder="Amount"
        value={formData.amount}
        onChange={handleChange}
        step="0.01"
      />
      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
      />
      <div className="transaction-type">
        <label>
          <input
            type="radio"
            name="type"
            value="income"
            checked={formData.type === "income"}
            onChange={handleChange}
          />
          Income
        </label>
        <label>
          <input
            type="radio"
            name="type"
            value="expense"
            checked={formData.type === "expense"}
            onChange={handleChange}
          />
          Expense
        </label>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="form-actions">
        <button type="submit">{initialData ?  "Add":"Update"}</button>
        <button type="button" onClick={onClose} className="cancel-button">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
