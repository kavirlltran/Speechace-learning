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
    // Loại bỏ prefix "data:audio/wav;base64,"
    const base64Pattern = /^data:audio\/\w+;base64,/;
    let base64Data = audio;
    if (base64Pattern.test(audio)) {
      base64Data = audio.replace(base64Pattern, '');
    }
    const audioBuffer = Buffer.from(base64Data, 'base64');

    // Tạo form-data gửi lên Speechace
    const formData = new FormData();
    formData.append('user_audio_file', audioBuffer, {
      filename: 'audio.wav',
      contentType: 'audio/wav'
    });
    formData.append('text', text);
    // Thêm các field khác theo yêu cầu

    // ...
    // Gọi Speechace
    // ...
    // Xử lý kết quả, trả về client
  } catch (err) {
    // ...
  }
}
