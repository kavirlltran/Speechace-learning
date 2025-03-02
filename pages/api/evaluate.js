// pages/api/evaluate.js
import FormData from 'form-data';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const { audio, text } = req.body;
  if (!audio || !text) {
    res.status(400).json({ message: 'Missing audio or text data' });
    return;
  }

  try {
    // Xử lý audio base64 -> buffer
    const base64Pattern = /^data:audio\/\w+;base64,/;
    let base64Data = audio;
    if (base64Pattern.test(audio)) {
      base64Data = audio.replace(base64Pattern, '');
    }
    const audioBuffer = Buffer.from(base64Data, 'base64');

    // Tạo form data gửi lên Speechace
    const formData = new FormData();
    formData.append('audio', audioBuffer, {
      filename: 'audio.webm',
      contentType: 'audio/webm'
    });
    formData.append('text', text);

    // Gọi API Speechace
    const speechaceKey = "kzsoOXHxN1oTpzvi85wVqqZ9Mqg6cAwmHhiTvv/fcvLKGaWgcsQkEivJ4D+t9StzW1YpCgrZp8DsFSfEy3YApSRDshFr4FlY0gyQwJOa6bAVpzh6NnoVQC50w7m/YYHAv";
    const apiUrl = `https://api.speechace.co/api/scoring/text/v9/json?key=${encodeURIComponent(speechaceKey)}&dialect=en-us&user_id=XYZ-ABC-99001`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: formData.getHeaders(),
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Speechace API error:', errorText);
      return res.status(500).json({ message: 'Speechace API error', error: errorText });
    }

    // Kết quả trả về từ Speechace
    const speechaceResult = await response.json();
    console.log("speechaceResult:", speechaceResult);

    // === CHUYỂN ĐỔI DỮ LIỆU ===
    // Tuỳ vào cấu trúc JSON thực tế của speechaceResult
    // Ví dụ: speechaceResult.pron_score_details.words = [ { word: "We", overall_score: 90 }, ... ]
    const normalWords = [];
    const stressedWords = [];

    // Ví dụ logic: Mọi từ có length > 5 coi là stressed (chỉ minh hoạ)
    if (speechaceResult?.pron_score_details?.words) {
      speechaceResult.pron_score_details.words.forEach((w) => {
        // Tuỳ vào logic bạn muốn
        const isStressed = w.word.includes("’") || w.word.includes("‘"); 
        if (isStressed) {
          stressedWords.push({
            word: w.word,
            score: w.overall_score || 0,
            stressScore: 100, // T tuỳ chỉnh
            comment: "Từ có trọng âm"
          });
        } else {
          normalWords.push({
            word: w.word,
            score: w.overall_score || 0,
            comment: "Từ bình thường"
          });
        }
      });
    }

    // Trả về đúng format mà client cần
    res.status(200).json({ normalWords, stressedWords });
  } catch (err) {
    console.error('Evaluation error:', err);
    res.status(500).json({ message: 'Evaluation error', error: err.toString() });
  }
}
