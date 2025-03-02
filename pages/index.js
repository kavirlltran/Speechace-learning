import React, { useState } from 'react';

const practices = {
  "Practice 1": [
    "We should ‘finish the ‘project for our ‘history ‘class.",
    "‘Peter is re’vising for his e’xam ‘next ‘week.",
    "‘Students will ‘spend more ‘time ‘working with ‘other ‘classmates.",
    "I ‘like to ‘watch ‘videos that ‘help me ‘learn ‘new ‘things.",
    "I have in’stalled some ‘apps on my ‘phone."
  ],
  "Practice 2": [
    "Our 'teacher 'often 'gives us 'videos to 'watch at 'home.",
    "I 'never 'read 'books on my 'tablet at 'night.",
    "It is a 'new 'way of 'learning and 'students 'really 'like it.",
    "You can 'find a lot of 'useful 'tips on this 'website.",
    "They should 'make an 'outline for their 'presentation."
  ]
};

export default function Home() {
  // State để chọn Practice (mặc định là "Practice 1")
  const [selectedPractice, setSelectedPractice] = useState("Practice 1");
  // State để lưu câu đã chọn (giá trị gốc, giữ dấu)
  const [selectedSentence, setSelectedSentence] = useState(null);

  // Hàm loại bỏ dấu ' và ’ để hiển thị
  const formatSentence = (sentence) => sentence.replace(/['’]/g, '');

  // Xử lý thay đổi Practice (nếu người dùng thay đổi từ dropdown)
  const handlePracticeChange = (event) => {
    const practice = event.target.value;
    setSelectedPractice(practice);
    setSelectedSentence(null); // Reset câu đã chọn khi thay đổi practice
  };

  // Xử lý khi người dùng click chọn một câu
  const handleSentenceClick = (sentence) => {
    setSelectedSentence(sentence);
  };

  // Hàm bắt đầu ghi âm (bao gồm yêu cầu cấp quyền mic)
  const handleStartRecording = async () => {
    if (!selectedSentence) return;
    try {
      // Yêu cầu cấp quyền microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Mic access granted", stream);
      // Nếu quyền được cấp, bạn có thể tích hợp logic ghi âm ở đây.
      alert("Đã cấp quyền mic. Bắt đầu ghi âm với câu đã chọn!");
      // Ví dụ: Bạn có thể truyền 'selectedSentence' cùng với file audio đến API.
    } catch (error) {
      console.error("Không thể truy cập microphone:", error);
      alert("Không thể truy cập microphone. Vui lòng cấp quyền và thử lại.");
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Phần mềm đánh giá phát âm</h1>
      
      {/* Dropdown chọn Practice */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="practice-select" style={{ marginRight: '10px' }}>Chọn Practice:</label>
        <select
          id="practice-select"
          value={selectedPractice}
          onChange={handlePracticeChange}
          style={{ fontSize: '16px', padding: '5px' }}
        >
          {Object.keys(practices).map((key, index) => (
            <option key={index} value={key}>{key}</option>
          ))}
        </select>
      </div>
      
      {/* Hiển thị danh sách câu của Practice đã chọn */}
      <div style={{ marginBottom: '20px' }}>
        <h3>Nội dung {selectedPractice}:</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {practices[selectedPractice].map((sentence, index) => (
            <li 
              key={index}
              onClick={() => handleSentenceClick(sentence)}
              style={{
                cursor: 'pointer',
                padding: '8px',
                marginBottom: '4px',
                backgroundColor: selectedSentence === sentence ? '#d0eaff' : '#f0f0f0'
              }}
            >
              {formatSentence(sentence)}
            </li>
          ))}
        </ul>
      </div>
      
      {/* Nút bắt đầu ghi âm, chỉ bật khi có câu được chọn */}
      <button 
        onClick={handleStartRecording} 
        disabled={!selectedSentence}
        style={{ padding: '10px 20px', fontSize: '16px' }}
      >
        Bắt đầu đọc và ghi âm
      </button>
      
      {/* Hiển thị câu đã chọn */}
      {selectedSentence && (
        <div style={{ marginTop: '20px', fontStyle: 'italic' }}>
          <strong>Câu đã chọn:</strong> {formatSentence(selectedSentence)}
        </div>
      )}
    </div>
  );
}
