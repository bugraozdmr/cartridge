const mysql = require('mysql2/promise');

async function test() {
  try {
    const connection = await mysql.createConnection("mysql://root:root@localhost:3306/cartridge_db");
    console.log("Connected successfully!");
    const [rows] = await connection.execute("SHOW TABLES;");
    console.log("Tables:", rows);
    await connection.end();
  } catch (err) {
    console.error("Connection failed:", err.message);
  }
}

test();
