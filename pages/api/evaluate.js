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
    // Nếu audio ở dạng data URL (ví dụ: "data:audio/webm;base64,...")
    // ta cần loại bỏ phần header và chỉ lấy chuỗi base64 thuần.
    const base64Pattern = /^data:audio\/\w+;base64,/;
    let base64Data = audio;
    if (base64Pattern.test(audio)) {
      base64Data = audio.replace(base64Pattern, '');
    }
    // Chuyển đổi chuỗi base64 thành buffer
    const audioBuffer = Buffer.from(base64Data, 'base64');

    // Tạo form data để gửi lên Speechace
    const formData = new FormData();
    formData.append('audio', audioBuffer, {
      filename: 'audio.webm',
      contentType: 'audio/webm'
    });
    formData.append('text', text);

    // Cấu hình Speechace API
    const speechaceKey = "kzsoOXHxN1oTpzvi85wVqqZ9Mqg6cAwmHhiTvv/fcvLKGaWgcsQkEivJ4D+t9StzW1YpCgrZp8DsFSfEy3YApSRDshFr4FlY0gyQwJOa6bAVpzh6NnoVQC50w7m/YYHAv";
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

    const speechaceResult = await response.json();
    // Bạn có thể xử lý thêm kết quả trả về (ví dụ: tách riêng các từ có trọng âm, từ bình thường) tùy vào định dạng của Speechace

    res.status(200).json(speechaceResult);
  } catch (err) {
    console.error('Evaluation error:', err);
    res.status(500).json({ message: 'Evaluation error', error: err.toString() });
  }
}
