// .env 파일을 로드하여 환경 변수를 사용할 수 있도록 설정
require("dotenv").config();

// 필요한 라이브러리 불러오기
const axios = require("axios"); // HTTP 요청을 보내는 라이브러리
const fastify = require("fastify")({
  logger: true, // 요청 로그를 자세히 기록
  bodyLimit: 1048576, // 요청 본문의 크기 제한 (1MB)
});

// ✅ Fastify 서버 준비 로그 추가
console.log("📢 Fastify 서버 실행 준비 중...");

// CORS 설정 (모든 도메인에서 요청 허용)
fastify.register(require("@fastify/cors"), {
  origin: "*",
  methods: ["GET", "POST"], // POST 요청도 허용
});

// 기본 경로 추가 (테스트용)
fastify.get("/", async (request, reply) => {
  reply.send({ message: "서버가 정상적으로 실행 중입니다! 🚀" });
});

// ✅ AI 응답 함수
async function makeReply(text) {
  console.log("📢 Gemini 1.5 API 호출...");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: `${text} 기분일 때 추천할 힐링 푸드는? 50자 이내의 평문으로 작성해줘.` }] }],
    });

    return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "추천을 받지 못했어요. 😢";
  } catch (error) {
    console.error("❌ Gemini 1.5 API 호출 실패:", error.response?.data || error.message);
    return "API 호출 실패";
  }
}

// ✅ AI 2.0 응답 함수
async function makeReply2(text) {
  console.log("📢 Gemini 2.0 API 호출...");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${process.env.GEMINI_API_KEY}`;

  try {
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: `${text} 기분일 때 추천할 힐링 푸드는? 50자 이내의 평문으로 작성해줘.` }] }],
    });

    return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "추천을 받지 못했어요. 😢";
  } catch (error) {
    console.error("❌ Gemini 2.0 API 호출 실패:", error.response?.data || error.message);
    return "API 호출 실패";
  }
}

// ✅ POST /1 등록 (디버깅 로그 추가)
fastify.post("/1", async function (request, reply) {
  console.log("📢 /1 엔드포인트 호출됨!");
  try {
    const { text } = request.body;
    if (!text) return reply.status(400).send({ error: "text 값이 필요합니다." });

    const aiReply = await makeReply(text);
    reply.send({ reply: aiReply });
  } catch (error) {
    console.error("/1 엔드포인트 오류:", error);
    reply.status(500).send({ error: "서버 오류 발생" });
  }
});

// ✅ POST /2 등록
fastify.post("/2", async function (request, reply) {
  console.log("📢 /2 엔드포인트 호출됨!");
  try {
    const { text } = request.body;
    if (!text) return reply.status(400).send({ error: "text 값이 필요합니다." });

    const aiReply = await makeReply2(text);
    reply.send({ reply: aiReply });
  } catch (error) {
    console.error("/2 엔드포인트 오류:", error);
    reply.status(500).send({ error: "서버 오류 발생" });
  }
});

// ✅ Fastify가 등록한 라우트 확인 (라우트 등록 후 실행해야 함)
fastify.ready(() => {
  console.log("🚀 Fastify 서버 준비 완료!");
  console.log(fastify.printRoutes()); // ✅ 등록된 모든 라우트 출력
});

// ✅ 서버 실행
fastify.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" }, function (err, address) {
  if (err) {
    console.error("❌ 서버 시작 오류:", err);
    process.exit(1);
  }
  console.log(`✅ 서버 실행 완료! Listening on ${address}`);
});
