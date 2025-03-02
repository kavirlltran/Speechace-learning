// pages/api/evaluate.js
import FormData from 'form-data';
import fetch from 'node-fetch'; // Nếu bạn dùng Next.js 15, cần cài và import node-fetch

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
    // Nếu audio ở dạng Data URL: "data:audio/webm;base64,...."
    const base64Pattern = /^data:audio\/\w+;base64,/;
    let base64Data = audio;
    if (base64Pattern.test(audio)) {
      base64Data = audio.replace(base64Pattern, '');
    }
    const audioBuffer = Buffer.from(base64Data, 'base64');

    // === Tạo form data ===
    const formData = new FormData();
    // ĐỔI 'audio' → 'voice_data' (theo tài liệu Speechace)
    formData.append('voice_data', audioBuffer, {
      filename: 'audio.webm',
      contentType: 'audio/webm'
    });
    // Speechace yêu cầu 'text' là tham số chứa nội dung văn bản cần chấm
    formData.append('text', text);

    // Thay thế bằng key của bạn
    const speechaceKey = "kzsoOXHxN1oTpzvi85wVqqZ9Mqg6cAwmHhiTvv/fcvLKGaWgcsQkEivJ4D+t9StzW1YpCgrZp8DsFSfEy3YApSRDshFr4FlY0gyQwJOa6bAVpzh6NnoVQC50w7m/YYHAv";
    // Endpoint Text Scoring của Speechace (có dialect, user_id)
    const apiUrl = `https://api.speechace.co/api/scoring/text/v9/json?key=${encodeURIComponent(speechaceKey)}&dialect=en-us&user_id=XYZ-ABC-99001`;

    // Gọi Speechace API
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

    // Trả nguyên kết quả (hoặc tuỳ chỉnh lại thành normalWords / stressedWords)
    res.status(200).json(speechaceResult);
  } catch (err) {
    console.error('Evaluation error:', err);
    res.status(500).json({ message: 'Evaluation error', error: err.toString() });
  }
}
