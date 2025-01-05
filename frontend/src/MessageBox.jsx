import React from "react";
import "./MessageBox.css";

const MessageBox = ({ message, onClose }) => {
  if (!message) return null; // Do not render if no message

  return (
    <div className="message-box">
      <div className="message-box-content">
        <p>{message}</p>
        <button onClick={onClose} className="close-button">
          Close
        </button>
      </div>
    </div>
  );
};

export default MessageBox;
