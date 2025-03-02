import { useState } from 'react';

export default function PracticePage() {
  // Danh sách các câu thực hành (ví dụ)
  const practiceSentences = [
    "Here's an example sentence with an apostrophe.",
    "Practice sentence number two.",
    "Don’t worry, be happy."
  ];

  // State để lưu câu đã chọn
  const [selectedSentence, setSelectedSentence] = useState(null);

  // Hàm xử lý khi chọn một câu trong danh sách
  const handleSelectSentence = (sentence) => {
    setSelectedSentence(sentence);
  };

  // Hàm bắt đầu đọc và ghi âm (giả sử gửi câu để đánh giá phát âm)
  const handleStartRecording = () => {
    if (!selectedSentence) return;
    // Gửi dữ liệu để đánh giá phát âm với câu đã chọn (selectedSentence)
    // ... (logic ghi âm/đánh giá phát âm)
  };

  return (
    <div>
      <h1>Practice</h1>
      {/* 2. Hiển thị danh sách các câu, mỗi dòng là một câu riêng biệt */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {practiceSentences.map((sentence, index) => {
          // 1. Loại bỏ dấu ' và ’ khỏi nội dung hiển thị câu
          const displaySentence = sentence.replace(/['’]/g, '');
          return (
            <li 
              key={index} 
              onClick={() => handleSelectSentence(sentence)}
              style={{
                cursor: 'pointer',
                padding: '8px',
                margin: '4px 0',
                // làm nổi bật câu được chọn
                backgroundColor: selectedSentence === sentence ? '#eef' : 'transparent'
              }}
            >
              {displaySentence}
            </li>
          );
        })}
      </ul>

      {/* Nút bắt đầu đọc và ghi âm, chỉ bật khi đã chọn một câu */}
      <button 
        onClick={handleStartRecording} 
        disabled={!selectedSentence}
        style={{ marginTop: '16px' }}
      >
        Bắt đầu đọc và ghi âm
      </button>
    </div>
  );
}
