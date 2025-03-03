// pages/index.js
import React, { useState, useRef } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: false }); 
// log: true nếu bạn muốn xem chi tiết quá trình ffmpeg chạy

export default function Home() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Khởi tạo ffmpeg (chỉ cần load 1 lần)
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);
  const loadFFmpeg = async () => {
    if (!isFFmpegLoaded) {
      await ffmpeg.load();
      setIsFFmpegLoaded(true);
    }
  };

  // Hàm chuyển webm -> wav bằng ffmpeg.wasm
  const convertWebmToWav = async (webmBlob) => {
    // 1. Ghi file đầu vào vào hệ thống ảo của ffmpeg
    ffmpeg.FS('writeFile', 'input.webm', await fetchFile(webmBlob));
    // 2. Chạy lệnh ffmpeg: input.webm -> output.wav
    await ffmpeg.run('-i', 'input.webm', 'output.wav');
    // 3. Đọc file output.wav từ hệ thống ảo
    const data = ffmpeg.FS('readFile', 'output.wav');
    // 4. Tạo blob WAV
    const wavBlob = new Blob([data.buffer], { type: 'audio/wav' });
    return wavBlob;
  };

  // Bắt đầu ghi âm
  const startRecording = async () => {
    setError(null);
    try {
      // Tải ffmpeg nếu chưa
      await loadFFmpeg();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = handleStop;
      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      console.error("Không truy cập được microphone", err);
      setError("Không truy cập được microphone");
    }
  };

  // Dừng ghi âm
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  // Khi ghi âm dừng
  const handleStop = async () => {
    // Tạo 1 Blob .webm
    const webmBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    // Chuyển .webm -> .wav
    let wavBlob;
    try {
      wavBlob = await convertWebmToWav(webmBlob);
    } catch (err) {
      console.error("Lỗi convert webm -> wav:", err);
      setError("Lỗi convert webm -> wav");
      return;
    }

    // Xem kết quả WAV
    const url = URL.createObjectURL(wavBlob);
    setAudioURL(url);

    // Từ đây, bạn có thể convert sang base64 và gửi API
    const reader = new FileReader();
    reader.readAsDataURL(wavBlob);
    reader.onloadend = async () => {
      const base64Wav = reader.result;
      // Gửi sang /api/evaluate
      try {
        const res = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            audio: base64Wav,
            text: "Hello world" // Hoặc câu bạn cần
          })
        });
        const data = await res.json();
        console.log("Speechace data:", data);
      } catch (err) {
        console.error("Lỗi khi đánh giá phát âm", err);
        setError("Lỗi khi đánh giá phát âm");
      }
    };
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Ghi âm .webm rồi chuyển sang .wav</h1>
      {recording ? (
        <button onClick={stopRecording}>Dừng ghi âm</button>
      ) : (
        <button onClick={startRecording}>Bắt đầu ghi âm</button>
      )}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {audioURL && (
        <div>
          <h3>File WAV sau khi convert:</h3>
          <audio src={audioURL} controls />
        </div>
      )}
    </div>
  );
}
