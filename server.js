// .env 파일을 로드하여 환경 변수를 사용할 수 있도록 설정
require("dotenv").config();

// 환경 변수에서 API 키를 불러오기
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// 필요한 라이브러리 불러오기
const axios = require("axios"); // HTTP 요청을 보내는 라이브러리
const fastify = require("fastify")({
  logger: true, // 요청 로그를 자세히 기록
  bodyLimit: 1048576, // 요청 본문의 크기 제한 (1MB)
});

// 기본 경로 추가 (테스트용)
fastify.get("/", async (request, reply) => {
  reply.send({ message: "서버가 정상적으로 실행 중입니다! 🚀" });
});


// CORS 설정 (모든 도메인에서 요청 허용)
fastify.register(require("@fastify/cors"), {
  origin: "*",
});

// Gemini AI에게 요청을 보내는 함수
async function makeReply(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const response = await axios({
    url, // 요청 보낼 URL
    method: "POST", // HTTP POST 요청
    data: {
      contents: [
        {
          parts: [
            {
              text: `${text} 기분일 때 추천할 힐링 푸드는? 50자 이내의 평문으로 작성해줘.`,
            },
          ],
        },
      ],
    },
    headers: {
      "Content-Type": "application/json",
    },
  });

  // API 응답 데이터 가져오기
  const json = response.data;

  // Gemini 응답 결과에서 추천된 텍스트를 반환
  return json.candidates[0].content.parts[0].text;
}

// Gemini AI에게 요청을 보내는 함수
async function makeReply2(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent?key=${GEMINI_API_KEY}`;

  const response = await axios({
    url, // 요청 보낼 URL
    method: "POST", // HTTP POST 요청
    data: {
      contents: [
        {
          parts: [
            {
              text: `${text} 기분일 때 추천할 힐링 푸드는? 50자 이내의 평문으로 작성해줘.`,
            },
          ],
        },
      ],
    },
    headers: {
      "Content-Type": "application/json",
    },
  });

  // API 응답 데이터 가져오기
  const json = response.data;

  // Gemini 응답 결과에서 추천된 텍스트를 반환
  return json.candidates[0].content.parts[0].text;
}

// 기본 엔드포인트 (테스트용)
fastify.post("/", function (request, reply) {
  const { body } = request;
  reply.send({ body });
});

// Gemini AI를 호출하는 엔드포인트
fastify.post("/1", async function (request, reply) {
  const { body } = request;
  const { text } = body;

  // AI 응답을 받아서 반환
  reply.send({ reply: await makeReply(text) });
});

// Groq AI를 호출하는 엔드포인트
fastify.post("/2", async function (request, reply) {
  const { body } = request;
  const { text } = body;

  // AI 응답을 받아서 반환
  reply.send({ reply: await makeReply2(text) });
});

// 서버 실행 (PORT 환경 변수에 설정된 포트에서 실행)
fastify.listen(
  { port: process.env.PORT || 3000, host: "0.0.0.0" }, // 기본 포트 3000 설정
  function (err, address) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
  }
);
