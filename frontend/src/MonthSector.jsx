import React, { useState } from "react";
import "./MonthSelector.css";

const MonthSelector = ({ onMonthChange }) => {
  const [date, setDate] = useState(new Date());

  const next = () => {
    const newDate = new Date(date.setMonth(date.getMonth() + 1));
    setDate(newDate);
    updateActiveMonth(newDate);
  };

  const prev = () => {
    const newDate = new Date(date.setMonth(date.getMonth() - 1));
    setDate(newDate);
    updateActiveMonth(newDate);
  };

  const updateActiveMonth = (newDate) => {
    const year = newDate.getFullYear();
    const month = newDate.getMonth();
    const monthName = newDate.toLocaleString("default", { month: "long" });
    if (onMonthChange) {
      onMonthChange([year, month, monthName]);
    }
  };

  const year = date.getFullYear();
  const month = date.toLocaleString("default", { month: "long" });

  return (
    <div>
      <div className="btn-group" role="group" aria-label="Basic example">
        <button type="button" className="btn btn-primary" onClick={prev}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            fill="currentColor"
            className="bi bi-chevron-left"
            viewBox="0 0 18 18"
          >
            <path
              fillRule="evenodd"
              d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"
            />
          </svg>
        </button>
        <button type="button" className="btn btn-primary" onClick={next}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            fill="currentColor"
            className="bi bi-chevron-right"
            viewBox="0 0 18 18"
          >
            <path
              fillRule="evenodd"
              d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
            />
          </svg>
        </button>
      </div>

      <nav
        aria-label="breadcrumb"
        style={{
          display: "inline-flex",
          fontSize: "1.2em",
          borderLeft: "5px",
          padding: "5px",
        }}
      >
        <ol className="breadcrumb">
          <li className="breadcrumb-item">{year}</li>
          <li className="breadcrumb-item active" aria-current="page">
            {month}
          </li>
        </ol>
      </nav>
    </div>
  );
};

export default MonthSelector;
