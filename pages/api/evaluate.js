import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // tăng giới hạn nếu cần
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { audio, text } = req.body;
  if (!audio || !text) {
    return res.status(400).json({ error: "Missing audio or text" });
  }

  // Tách câu thành các từ
  // Nếu từ bắt đầu bằng ký tự ‘ (curly quote) hoặc ' (straight quote) thì đó là từ cần nhấn trọng âm.
  const words = text.split(/\s+/);
  const processedWords = words.map(rawWord => {
    // Loại bỏ dấu câu (.,!?) khỏi từ
    const cleanWord = rawWord.replace(/[.,!?]/g, "");
    if (cleanWord.startsWith("‘") || cleanWord.startsWith("'")) {
      // Loại bỏ ký tự nhấn trọng âm ở đầu
      return { word: cleanWord.slice(1), stressed: true };
    }
    return { word: cleanWord, stressed: false };
  });

  // Chuẩn bị gọi SpeechAce API
  const speechaceApiKey = process.env.SPEECHACE_API_KEY || "kzsoOXHxN1oTpzvi85wVqqZ9Mqg6cAwmHhiTvv/fcvLKGaWgcsQkEivJ4D+t9StzW1YpCgrZp8DsFSfEy3YApSRDshFr4FlY0gyQwJOa6bAVpzh6NnoVQC50w7m/YYHA";
  const speechaceUrl = "https://api.speechace.co/api/scoring/text/v0.1/json";

  // Xử lý audio: loại bỏ tiền tố "data:audio/webm;base64,"
  const base64Audio = audio.split(",")[1];
  const audioBuffer = Buffer.from(base64Audio, 'base64');

  // Tạo FormData để gửi file đến SpeechAce
  const formData = new FormData();
  formData.append("audio_data", audioBuffer, {
    filename: "recording.webm",
    contentType: "audio/webm",
  });
  formData.append("text", text);
  formData.append("key", speechaceApiKey);

  let apiResponse;
  try {
    apiResponse = await fetch(speechaceUrl, {
      method: "POST",
      body: formData,
      // Header Content-Type sẽ được formData tự thiết lập
    });
  } catch (error) {
    console.error("Lỗi khi gọi SpeechAce API:", error);
    return res.status(500).json({ error: "Lỗi khi gọi SpeechAce API" });
  }

  if (!apiResponse.ok) {
    const errorText = await apiResponse.text();
    console.error("SpeechAce API trả về lỗi:", errorText);
    return res.status(500).json({ error: "SpeechAce API trả về lỗi", details: errorText });
  }

  let apiResult;
  try {
    apiResult = await apiResponse.json();
  } catch (err) {
    console.error("Lỗi khi parse kết quả SpeechAce API:", err);
    return res.status(500).json({ error: "Lỗi khi parse kết quả SpeechAce API" });
  }

  // Mô phỏng kết quả đánh giá cho từng từ dựa trên processedWords
  const evaluatedResults = processedWords.map(item => {
    if (item.stressed) {
      // Giả lập điểm cho từ có trọng âm: điểm phát âm và điểm nhấn trọng âm
      const score = Math.floor(Math.random() * 21) + 80;      // 80-100
      const stressScore = Math.floor(Math.random() * 21) + 70;  // 70-90
      return { ...item, score, stressScore, comment: stressScore > 80 ? "Phát âm tốt và nhấn trọng âm đúng" : "Chưa nhấn đúng trọng âm" };
    } else {
      const score = Math.floor(Math.random() * 21) + 80; // 80-100
      return { ...item, score, comment: score > 85 ? "Phát âm tốt" : "Cần cải thiện" };
    }
  });

  // Tách kết quả thành 2 nhóm: từ thường và từ trọng âm
  const normalWords = evaluatedResults.filter(item => !item.stressed);
  const stressedWords = evaluatedResults.filter(item => item.stressed);

  return res.status(200).json({
    normalWords,
    stressedWords,
    rawApiResult: apiResult // (tùy chọn, dùng cho debug)
  });
}
