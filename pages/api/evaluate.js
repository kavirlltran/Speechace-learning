// pages/api/evaluate.js
import FormData from 'form-data';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { audio, text } = req.body;
  if (!audio || !text) {
    return res.status(400).json({ message: 'Missing audio or text data' });
  }

  try {
    // Loại bỏ prefix "data:audio/xxx;base64," nếu có
    const base64Pattern = /^data:audio\/\w+;base64,/;
    let base64Data = audio;
    if (base64Pattern.test(audio)) {
      base64Data = audio.replace(base64Pattern, '');
    }
    const audioBuffer = Buffer.from(base64Data, 'base64');

    // Tạo form-data cho Speechace
    const formData = new FormData();
    // user_audio_file = file ghi âm
    formData.append('user_audio_file', audioBuffer, {
      filename: 'audio.wav', // nếu fallback .webm, bạn có thể đổi 'audio.webm'
      contentType: 'audio/wav' // fallback: 'audio/webm'
    });
    // Thêm các tham số
    formData.append('text', text);
    formData.append('question_info', "u1/q1");
    formData.append('include_intonation', "1");
    formData.append('stress_version', "0.8");

    // Speechace key
    const speechaceKey = "kzsoOXHxN1oTpzvi85wVqqZ9Mqg6cAwmHhiTvv/fcvLKGaWgcsQkEivJ4D+t9StzW1YpCgrZp8DsFSfEy3YApSRDshFr4FlY0gyQwJOa6bAVpzh6NnoVQC50w7m/YYHA";
    // Endpoint v0.5
    const apiUrl = `https://api.speechace.co/api/scoring/text/v0.5/json?key=${encodeURIComponent(speechaceKey)}&dialect=en-us&user_id=XYZ-ABC-99001`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: formData.getHeaders(),
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Speechace API error:", errorText);
      return res.status(500).json({ message: 'Speechace API error', error: errorText });
    }

    const speechaceResult = await response.json();
    console.log("speechaceResult:", speechaceResult);

    // Tách kết quả => normalWords & stressedWords
    const normalWords = [];
    const stressedWords = [];
    const wordList = speechaceResult?.pron_score_details?.words || [];

    wordList.forEach((w) => {
      // Xác định từ nào "trọng âm"
      const isStressed = w.word.includes('’') || w.word.includes('‘') || w.word.includes("'");
      if (isStressed) {
        stressedWords.push({
          word: w.word,
          score: w.overall_score || 0,
          stressScore: 100,
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

    // Trả về kết quả
    return res.status(200).json({ normalWords, stressedWords });
  } catch (err) {
    console.error("Evaluation error:", err);
    return res.status(500).json({ message: 'Evaluation error', error: err.toString() });
  }
}
