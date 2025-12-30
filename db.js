const mysql = require("mysql2");
require("dotenv").config();

// 커넥션 풀 생성 (연결 효율화)
const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	port: process.env.DB_PORT,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
});

// 연결 테스트
pool.getConnection((err, connection) => {
	if (err) {
		console.error("데이터베이스 연결 실패:", err);
	} else {
		console.log("데이터베이스 연결 성공!");
		connection.release();
	}
});

module.exports = pool.promise(); // async/await 사용을 위해 promise 버전으로 수출
