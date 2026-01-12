const db = require("./db");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// 미들웨어 설정
app.use(cors()); // 다른 도메인(프론트엔드)에서의 요청 허용
app.use(express.json()); // JSON 형태의 데이터를 읽기 위함

// DB 연결 확인
app.get("/api/connect", async (req, res) => {
	try {
		await db.query("SELECT 1");

		return res.status(200).json({
			status: true,
			message: "DB 연결 성공",
		});
	} catch (err) {
		console.error("DB 연결 실패:", err);

		return res.status(500).json({
			status: false,
			message: "DB 연결 실패",
		});
	}
});

// 기본 경로 확인용 API
app.get("/", (req, res) => {
	res.send("Memo Server is Running!");
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

// 메모 수정 API
app.put("/api/memos", async (req, res) => {
	const { id, content } = req.body;

	if (!id || !content)
		return res
			.status(400)
			.json({ message: "ID와 수정 내용을 모두 입력해주세요." });

	try {
		const [result] = await db.execute(
			"UPDATE memos SET content = ? WHERE id = ?",
			[content, id]
		);

		if (result.affectedRows === 0) {
			return res.status(404).json({ message: "해당 메모를 찾을 수 없습니다." });
		}

		res.status(200).json({ id, content });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "서버 오류가 발생했습니다." });
	}
});

// 메모 삭제 API
app.delete("/api/memos", async (req, res) => {
	const { id } = req.body;

	if (!id) return res.status(400).json({ message: "ID값이 누락되었습니다." });

	try {
		const [result] = await db.execute("DELETE FROM memos WHERE id = ?", [id]);

		if (result.affectedRows === 0) {
			return res.status(404).json({ message: "해당 메모를 찾을 수 없습니다." });
		}

		res.status(200).json({ id });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "서버 오류가 발생했습니다." });
	}
});
