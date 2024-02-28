const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: '34.82.42.68',     
  user: 'root',
  password: 'vcspassword',  
  database: 'vcs',        
  port: 3306
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');

  // Query to show all tables in the connected database
  connection.query('SHOW TABLES', (err, results) => {
    if (err) {
      console.error('Error fetching tables:', err);
      return;
    }

    // Display the list of tables
    console.log('Tables in the database:');
    results.forEach((row) => {
      console.log(row[`Tables_in_${connection.config.database}`]);
    });

    // Close the connection when done
    connection.end();
  });
});
