const db = require("./db");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// 미들웨어 설정
app.use(cors()); // 다른 도메인(프론트엔드)에서의 요청 허용
app.use(express.json()); // JSON 형태의 데이터를 읽기 위함

// 기본 경로 확인용 API
app.get("/", (req, res) => {
	res.send("Memo Server is Running (Without WebSocket)!");
});

// 서버 포트 설정
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
	console.log(`서버가 포트 ${PORT}에서 정상 작동 중입니다.`);
});

// 메모 생성 API
app.post("/api/memos", async (req, res) => {
	const { content } = req.body;

	if (!content) {
		return res.status(400).json({ message: "메모 내용을 입력해주세요." });
	}

	try {
		const [result] = await db.execute(
			"INSERT INTO memos (content) VALUES (?)",
			[content]
		);

		res.status(201).json({ id: result.insertId, content });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "서버 오류가 발생했습니다." });
	}
});

// 메모 목록 조회 API
app.get("/api/memos", async (req, res) => {
	try {
		const [rows] = await db.execute(
			"SELECT * FROM memos ORDER BY create_date DESC"
		);
		res.json(rows);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "서버 오류가 발생했습니다." });
	}
});
