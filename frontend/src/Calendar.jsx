import React, { useState, useEffect } from "react";
import "./Calendar.css";

// Helper to get number of days in a given month and year
function getDaysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

// Helper to find the day of the week a particular date falls on (0=Sun, 1=Mon, etc.)
function getFirstDayOfMonth(year, monthIndex) {
  return new Date(year, monthIndex, 1).getDay();
}

const Calendar = () => {
  const [transactions, setTransactions] = useState([]);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [showTransactionPopup, setShowTransactionPopup] = useState(false);

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
        setTransactions(data);
      } else {
        console.error("Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear((prev) => prev - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear((prev) => prev + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleDateClick = (transactions) => {
    setSelectedTransactions(transactions);
    setShowTransactionPopup(true);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfWeek = getFirstDayOfMonth(currentYear, currentMonth);

  const calendarDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
    const dayTransactions = transactions.filter((t) => t.date === dateStr);

    calendarDays.push({
      dayNumber: i,
      transactions: dayTransactions,
    });
  }

  const blanksBefore = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    blanksBefore.push({ blank: true });
  }

  const allCells = [...blanksBefore, ...calendarDays];
  const rows = [];
  for (let i = 0; i < allCells.length; i += 7) {
    rows.push(allCells.slice(i, i + 7));
  }

  return (
    <div style={{ overflowY: "auto", maxHeight: "80vh", backgroundColor: "white", padding: "1rem" }}>
      <div className="calendar-container">
        <div className="calendar-nav">
          <button onClick={handlePrevMonth}>{"<"}</button>
          <h2>
            {new Date(currentYear, currentMonth).toLocaleString("default", { month: "long", year: "numeric" })}
          </h2>
          <button onClick={handleNextMonth}>{">"}</button>
        </div>

        <div className="calendar-grid calendar-header">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>

        <div className="calendar-grid calendar-body">
          {rows.map((week, idx) => (
            <React.Fragment key={idx}>
              {week.map((cell, cellIdx) => {
                if (cell.blank) {
                  return <div key={cellIdx} className="calendar-cell blank"></div>;
                } else {
                  const { dayNumber, transactions } = cell;
                  return (
                    <div key={cellIdx} className="calendar-cell date-cell" onClick={() => handleDateClick(transactions)}>
                      <div className="day-number">{dayNumber}</div>
                      <div className="dots">
                        {transactions.some(t => t.type === "expense") && <span className="dot dot-red"></span>}
                        {transactions.some(t => t.type === "income") && <span className="dot dot-green"></span>}
                      </div>
                    </div>
                  );
                }
              })}
            </React.Fragment>
          ))}
        </div>

        {showTransactionPopup && (
          <div className="transaction-popup">
            <h3>Transactions</h3>
            <ul>
              {selectedTransactions.map((t, idx) => (
                <li key={idx}>{t.title} - Rs.{t.amount}</li>
              ))}
            </ul>
            <button onClick={() => setShowTransactionPopup(false)}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
