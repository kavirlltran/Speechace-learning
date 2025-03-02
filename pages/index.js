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
  // State để chọn practice (mặc định là "Practice 1")
  const [selectedPractice, setSelectedPractice] = useState("Practice 1");
  // State để lưu câu đã chọn (giá trị gốc, vẫn giữ dấu)
  const [selectedSentence, setSelectedSentence] = useState(null);

  // Hàm để loại bỏ dấu ' và ’ khi hiển thị
  const formatSentence = (sentence) => sentence.replace(/['’]/g, '');

  // Xử lý khi thay đổi practice
  const handlePracticeChange = (event) => {
    const practice = event.target.value;
    setSelectedPractice(practice);
    setSelectedSentence(null); // reset câu đã chọn khi thay đổi practice
  };

  // Xử lý khi người dùng click chọn một câu trong danh sách
  const handleSentenceClick = (sentence) => {
    setSelectedSentence(sentence);
  };

  // Hàm xử lý khi người dùng bắt đầu ghi âm
  const handleStartRecording = () => {
    if (!selectedSentence) return;
    // Ở đây bạn tích hợp logic ghi âm và gửi dữ liệu (sử dụng selectedSentence gốc chứa dấu)
    console.log("Bắt đầu ghi âm với câu:", selectedSentence);
    // Ví dụ: gọi API để đánh giá phát âm, chuyển dữ liệu audio kèm selectedSentence
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Phần mềm đánh giá phát âm</h1>
      
      {/* Chọn Practice */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="practice-select" style={{ marginRight: '10px' }}>Chọn Practice:</label>
        <select
          id="practice-select"
          value={selectedPractice}
          onChange={handlePracticeChange}
          style={{ fontSize: '16px', padding: '5px' }}
        >
          {Object.keys(practices).map((key, index) => (
            <option key={index} value={key}>
              {key}
            </option>
          ))}
        </select>
      </div>
      
      {/* Hiển thị danh sách các câu của practice đã chọn */}
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
      
      {/* Nút bắt đầu đọc và ghi âm, chỉ được kích hoạt khi đã chọn câu */}
      <button 
        onClick={handleStartRecording} 
        disabled={!selectedSentence}
        style={{ padding: '10px 20px', fontSize: '16px' }}
      >
        Bắt đầu đọc và ghi âm
      </button>

      {/* Hiển thị câu đã chọn (đã được format) */}
      {selectedSentence && (
        <div style={{ marginTop: '20px', fontStyle: 'italic' }}>
          <strong>Câu đã chọn:</strong> {formatSentence(selectedSentence)}
        </div>
      )}
    </div>
  );
}
