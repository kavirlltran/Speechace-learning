// pages/index.js
import React, { useState, useRef } from 'react';

const practices = {
  "Practice 1": [
    "We should ‘finish the ‘project for our ‘history ‘class.",
    "‘Peter is re’vising for his e’xam ‘next ‘week.",
    "‘Students will ‘spend more ‘time ‘working with ‘other ‘classmates.",
    "I ‘like to ‘watch ‘videos that ‘help me ‘learn ‘new ‘things.",
    "I have in’stalled some ‘apps on my ‘phone."
  ],
  "Practice 2": [
    "Our ‘teacher ‘often ‘gives us ‘videos to ‘watch at ‘home.",
    "I ‘never ‘read ‘books on my ‘tablet at ‘night.",
    "It is a ‘new ‘way of ‘learning and ‘students ‘really ‘like it.",
    "You can ‘find a lot of ‘useful ‘tips on this ‘website.",
    "They should ‘make an ‘outline for their ‘presentation."
  ]
};

export default function Home() {
  // State để chọn bài thực hành và câu mẫu
  const [selectedPractice, setSelectedPractice] = useState("Practice 1");
  const [selectedSentence, setSelectedSentence] = useState(practices["Practice 1"][0]);
  
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Lấy danh sách câu mẫu theo bài thực hành đã chọn
  const sentences = practices[selectedPractice];

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
      
      {/* Chọn bài thực hành */}
      <div>
        <label>Chọn bài thực hành: </label>
        <select 
          value={selectedPractice}
          onChange={e => {
            const practice = e.target.value;
            setSelectedPractice(practice);
            // Khi thay đổi bài, cập nhật câu mẫu đầu tiên của bài đó
            setSelectedSentence(practices[practice][0]);
          }}
          style={{ fontSize: '16px', padding: '5px', margin: '10px' }}
        >
          {Object.keys(practices).map((practiceKey, idx) => (
            <option key={idx} value={practiceKey}>
              {practiceKey}
            </option>
          ))}
        </select>
      </div>

      {/* Hiển thị toàn bộ câu mẫu của bài thực hành */}
      <div style={{ margin: '20px 0' }}>
        <h3>Chọn câu mẫu:</h3>
        {sentences.map((s, idx) => (
          <div 
            key={idx}
            onClick={() => setSelectedSentence(s)}
            style={{ 
              cursor: 'pointer', 
              padding: '10px', 
              margin: '5px 0',
              border: s === selectedSentence ? '2px solid blue' : '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            {s}
          </div>
        ))}
      </div>

      {/* Ghi âm */}
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
