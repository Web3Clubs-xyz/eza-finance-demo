const sqlite3 = require('sqlite3').verbose();

const DB_FILE_PATH = 'eza_test.db';

const db = new sqlite3.Database(DB_FILE_PATH, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    // Create tables or perform any other initialization if needed
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      password TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS dao (
      id INTEGER PRIMARY KEY,
      user_id TEXT NOT NULL,
      wallet_id TEXT NOT NULL,
      current_wallet_balance	INTEGER NOT NULL DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS saccos (
      id INTEGER PRIMARY KEY,
      user_id TEXT NOT NULL,
      wallet_address TEXT NOT NULL,
      ilp_payment_pointer TEXT NOT NULL,
      wallet_rafiki_id TEXT NOT NULL,
      current_wallet_balance	INTEGER NOT NULL DEFAULT 0,
      country	TEXT DEFAULT 'Kenya'
    )`);


    db.run(`CREATE TABLE IF NOT EXISTS dao_deposits (
      id INTEGER PRIMARY KEY,
      dao TEXT NOT NULL,
      amount TEXT NOT NULL,
      is_fulfilled TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS loans (
      id INTEGER PRIMARY KEY,
      dao TEXT NOT NULL,
      sacco TEXT NOT NULL,
      amount TEXT NOT NULL,
      repayment_amount TEXT NOT NULL,
      interest_rate TEXT NOT NULL,
      is_given_fulfilled TEXT NOT NULL,
      is_repaid_fulfilled TEXT NOT NULL,
      is_approved	TEXT NOT NULL DEFAULT 'false',
      loan_status	TEXT NOT NULL DEFAULT 'INACTIVE',
      repaid_amount	INTEGER NOT NULL DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS liquiditor (
      id INTEGER PRIMARY KEY,
      user_id TEXT NOT NULL,
      wallet_address TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS liquiditor_deposits (
      id INTEGER PRIMARY KEY,
      liquidator TEXT NOT NULL,
      usdc_to_transfer TEXT NOT NULL,
      amount TEXT NOT NULL,
      is_fulfilled TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS sacco_deposits (
      id INTEGER PRIMARY KEY,
      sacco TEXT NOT NULL,
      amount TEXT NOT NULL,
      is_fulfilled TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS sacco_withdrawals (
      id INTEGER PRIMARY KEY,
      sacco TEXT NOT NULL,
      amount TEXT NOT NULL,
      is_fulfilled TEXT NOT NULL
    )`);

    //seed
    // Insert seed data into 'users' table
       // Insert seed data into 'users' table
       db.run(`INSERT INTO users (name, password) VALUES ('Mwalimu Sacco', 'password123')`, function(err) {
        if (err) {
          console.error('Error inserting record for Mwalimu Sacco:', err.message);
        } else {
          console.log(`Inserted record for Mwalimu Sacco with id ${this.lastID}`);
        }
      });
  
      db.run(`INSERT INTO users (name, password) VALUES ('sparkDAO', 'password123')`, function(err) {
        if (err) {
          console.error('Error inserting record for sparkDAO:', err.message);
        } else {
          console.log(`Inserted record for sparkDAO with id ${this.lastID}`);
        }
      });
  
      db.run(`INSERT INTO users (name, password) VALUES ('Alice Liquidator', 'password123')`, function(err) {
        if (err) {
          console.error('Error inserting record for Alice Liquidator:', err.message);
        } else {
          console.log(`Inserted record for Alice Liquidator with id ${this.lastID}`);
        }
      });
  
      // Insert seed data into 'dao' table
      db.run(`INSERT INTO dao (user_id, wallet_id) VALUES ('2', '0x73e65DBD630f90604062f6E02fAb9138e713edD9')`);
  
      // Insert seed data into 'saccos' table
      db.run(`INSERT INTO saccos (user_id, wallet_address, ilp_payment_pointer, wallet_rafiki_id) VALUES ('1', '', '$ilp.eza.money/mwalimusacco', '1d9fa398-23a2-4dd1-8d93-9e8fdb72edd0')`);
  
      // Insert seed data into 'dao_deposits' table
        //   db.run(`INSERT INTO dao_deposits (dao, amount, is_fulfilled) VALUES ('1', '100', 'false')`);
  
      // Insert seed data into 'loans' table
      db.run(`INSERT INTO loans (dao, sacco, amount, repayment_amount, interest_rate, is_given_fulfilled, is_repaid_fulfilled) VALUES ('1', '1', '500', '600', '', 'false', 'false')`);
  
      // Insert seed data into 'liquiditor' table
      db.run(`INSERT INTO liquiditor (user_id, wallet_address) VALUES ('3', '0x4838b106fce9647bdf1e7877bf73ce8b0bad5f97')`);
  
      // Insert seed data into 'liquiditor_deposits' table
        //   db.run(`INSERT INTO liquiditor_deposits (liquidator, usdc_to_transfer, amount, is_fulfilled) VALUES ('1', '50', '100', 'false')`);
  
      // Insert seed data into 'sacco_deposits' table
        //   db.run(`INSERT INTO sacco_deposits (sacco, amount, is_fulfilled) VALUES ('1', '200', 'false')`);
  
      // Insert seed data into 'sacco_withdrawals' table
        //   db.run(`INSERT INTO sacco_withdrawals (sacco, amount, is_fulfilled) VALUES ('1', '100', 'false')`);
  
      // You can add more INSERT statements as needed for other tables
  
      // Close the database connection
      db.close((err) => {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log('Closed the database connection.');
      });
    
  }
});

  