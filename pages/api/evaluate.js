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

    // Tạo form-data gửi lên Speechace
    const formData = new FormData();
    // QUAN TRỌNG: Sử dụng tên field "voice_data" và đặt file là audio.wav với contentType audio/wav
    formData.append('voice_data', audioBuffer, {
      filename: 'audio.wav',
      contentType: 'audio/wav'
    });
    formData.append('text', text);

    // Speechace API Key & endpoint
    const speechaceKey = "kzsoOXHxN1oTpzvi85wVqqZ9Mqg6cAwmHhiTvv/fcvLKGaWgcsQkEivJ4D+t9StzW1YpCgrZp8DsFSfEy3YApSRDshFr4FlY0gyQwJOa6bAVpzh6NnoVQC50w7m/YYHAv";
    const apiUrl = `https://api.speechace.co/api/scoring/text/v9/json?key=${encodeURIComponent(speechaceKey)}&dialect=en-us&user_id=XYZ-ABC-99001`;

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

    // CHUYỂN ĐỔI DỮ LIỆU: Tách danh sách từ thành normalWords và stressedWords
    const normalWords = [];
    const stressedWords = [];

    const wordList = speechaceResult?.pron_score_details?.words || [];
    wordList.forEach((w) => {
      // Ví dụ: nếu từ chứa dấu trọng âm (‘ hoặc ’) hoặc dấu nháy đơn, coi là có trọng âm
      const isStressed = w.word.includes('’') || w.word.includes('‘') || w.word.includes("'");
      if (isStressed) {
        stressedWords.push({
          word: w.word,
          score: w.overall_score || 0,
          stressScore: 100, // Bạn có thể tùy chỉnh logic chấm điểm trọng âm
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

    return res.status(200).json({ normalWords, stressedWords });
  } catch (err) {
    console.error("Evaluation error:", err);
    return res.status(500).json({ message: 'Evaluation error', error: err.toString() });
  }
}
