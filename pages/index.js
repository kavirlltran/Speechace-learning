// pages/index.js
import React, { useState, useRef } from 'react';

const practice1Sentences = [
  "We should ‘finish the ‘project for our ‘history ‘class.",
  "‘Peter is re’vising for his e’xam ‘next ‘week.",
  "‘Students will ‘spend more ‘time ‘working with ‘other ‘classmates.",
  "I ‘like to ‘watch ‘videos that ‘help me ‘learn ‘new ‘things.",
  "I have in’stalled some ‘apps on my ‘phone."
];

const practice2Sentences = [
  "Our ‘teacher ‘often ‘gives us ‘videos to ‘watch at ‘home.",
  "I ‘never ‘read ‘books on my ‘tablet at ‘night.",
  "It is a ‘new ‘way of ‘learning and ‘students ‘really ‘like it.",
  "You can ‘find a lot of ‘useful ‘tips on this ‘website.",
  "They should ‘make an ‘outline for their ‘presentation."
];

function PracticeBlock({ title, sentences }) {
  const [selectedSentence, setSelectedSentence] = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    setResults(null);
    setError(null);
    if (!selectedSentence) {
      alert("Vui lòng chọn một câu trước khi ghi âm!");
      return;
    }
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

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleStop = async () => {
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const url = URL.createObjectURL(audioBlob);
    setAudioURL(url);

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
    <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px' }}>
      <h2>{title}</h2>
      <div>
        <p>Chọn một câu mẫu:</p>
        <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
          {sentences.map((s, idx) => (
            <li key={idx} style={{ margin: '5px 0' }}>
              <button
                onClick={() => setSelectedSentence(s)}
                style={{ 
                  padding: '8px 12px', 
                  fontSize: '14px', 
                  backgroundColor: selectedSentence === s ? '#ddd' : '#fff',
                  border: '1px solid #aaa',
                  cursor: 'pointer'
                }}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {selectedSentence && (
        <div style={{ marginTop: '10px' }}>
          <p><strong>Câu đã chọn:</strong> {selectedSentence}</p>
        </div>
      )}
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
          <h3>Kết quả đánh giá</h3>
          <div>
            <h4>Từ thường</h4>
            <ul>
              {results.normalWords.map((item, idx) => (
                <li key={idx}>
                  {item.word}: {item.score} - {item.comment}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Từ trọng âm</h4>
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

export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Phần mềm đánh giá phát âm</h1>
      <PracticeBlock title="Practice 1" sentences={practice1Sentences} />
      <PracticeBlock title="Practice 2" sentences={practice2Sentences} />
    </div>
  );
}
