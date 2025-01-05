const mysql = require('mysql2');


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // Default MySQL username in XAMPP
  password: '',  // Default MySQL password in XAMPP (empty by default)
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the MySQL server:', err);
    return;
  }
  console.log('Connected to MySQL server.');

  // Step 1: Create the database (if it doesn't exist)
  connection.query('CREATE DATABASE IF NOT EXISTS test', (err, result) => {
    if (err) {
      console.error('Error creating database:', err);
      return;
    }
    console.log('Database created or already exists.');

    // Step 2: Switch to the "test" database
    connection.changeUser({ database: 'test' }, (err) => {
      if (err) {
        console.error('Error switching to the database:', err);
        return;
      }
      console.log('Switched to "test" database.');

     
      const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL
        );
      `;
      
      connection.query(createUsersTable, (err, result) => {
        if (err) {
          console.error('Error creating users table:', err);
          return;
        }
        console.log('Users table created or already exists.');

       
        connection.end();
      });
    });
  });
});
