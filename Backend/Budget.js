const mysql = require('mysql2');

// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Your MySQL username
  password: '', // Your MySQL password
  database: 'Test', // Ensure this database exists
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');

  // Function to create tables
  const createTable = (query, tableName) => {
    connection.query(query, (err) => {
      if (err) {
        console.error(`Error creating ${tableName} table:`, err);
        return;
      }
      console.log(`${tableName} table created or already exists.`);
    });
  };

  // Create the "budget" table
  createTable(
    `
    CREATE TABLE IF NOT EXISTS budget (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      budget_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    `,
    "budget"
  );

  // Create the "transactions" table
  createTable(
    `
    CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      date DATE NOT NULL,
      category VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    `,
    "transactions"
  );

  // Close the connection
  connection.end((err) => {
    if (err) {
      console.error('Error closing connection:', err);
    } else {
      console.log('Connection closed.');
    }
  });
});
