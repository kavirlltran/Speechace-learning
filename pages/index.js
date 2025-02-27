// pages/index.js
import React, { useState, useRef } from 'react';

const sentences = [
  "We should ‘finish the ‘project for our ‘history ‘class.",
  "‘Peter is re’vising for his e’xam ‘next ‘week.",
  "‘Students will ‘spend more ‘time ‘working with ‘other ‘classmates.",
  "I ‘like to ‘watch ‘videos that ‘help me ‘learn ‘new ‘things.",
  "I have in’stalled some ‘apps on my ‘phone."
];

export default function Home() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [results, setResults] = useState(null);
  const [selectedSentence, setSelectedSentence] = useState(sentences[0]);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Bắt đầu ghi âm bằng API MediaRecorder
  const startRecording = async () => {
    setResults(null);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
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

  // Xử lý khi ghi âm dừng
  const handleStop = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const url = URL.createObjectURL(audioBlob);
    setAudioURL(url);

    // Chuyển Blob thành chuỗi Base64
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64data = reader.result;
      try {
        const res = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            audio: base64data,
            text: selectedSentence
          })
        });
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Lỗi khi đánh giá phát âm", err);
        setError("Lỗi khi đánh giá phát âm");
      }
    };
  };

  // Tải kết quả đánh giá về file TXT
  const downloadResult = () => {
    let txtContent = "Kết quả đánh giá phát âm:\n\n";
    if (results) {
      txtContent += "==== Đánh giá từ thường ====\n";
      results.normalWords.forEach(item => {
        txtContent += `${item.word}: ${item.score} - ${item.comment}\n`;
      });
      txtContent += "\n==== Đánh giá từ trọng âm ====\n";
      results.stressedWords.forEach(item => {
        txtContent += `${item.word}: Phát âm ${item.score} - Trọng âm ${item.stressScore} - ${item.comment}\n`;
      });
    }
    const blob = new Blob([txtContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ketqua.txt';
    link.click();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Phần mềm đánh giá phát âm</h1>
      <div>
        <label>Chọn câu mẫu: </label>
        <select 
          value={selectedSentence}
          onChange={e => setSelectedSentence(e.target.value)}
          style={{ fontSize: '16px', padding: '5px', margin: '10px' }}
        >
          {sentences.map((s, idx) => (
            <option key={idx} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div style={{ margin: '20px 0' }}>
        {recording ? (
          <button onClick={stopRecording} style={{ padding: '10px 20px', fontSize: '16px' }}>
            Dừng ghi âm
          </button>
        ) : (
          <button onClick={startRecording} style={{ padding: '10px 20px', fontSize: '16px' }}>
            Bắt đầu ghi âm
          </button>
        )}
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {audioURL && (
        <div>
          <h3>Audio đã ghi</h3>
          <audio src={audioURL} controls />
        </div>
      )}
      {results && (
        <div style={{ marginTop: '20px' }}>
          <h2>Kết quả đánh giá</h2>
          <div>
            <h3>Từ thường</h3>
            <ul>
              {results.normalWords.map((item, idx) => (
                <li key={idx}>
                  {item.word}: {item.score} - {item.comment}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Từ trọng âm</h3>
            <ul>
              {results.stressedWords.map((item, idx) => (
                <li key={idx}>
                  {item.word}: Phát âm {item.score} - Trọng âm {item.stressScore} - {item.comment}
                </li>
              ))}
            </ul>
          </div>
          <button onClick={downloadResult} style={{ marginTop: '20px', padding: '10px 20px', fontSize: '16px' }}>
            Tải kết quả TXT
          </button>
        </div>
      )}
    </div>
  );
}
