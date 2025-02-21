// pages/index.js
import { useState, useRef } from 'react';
// Nếu bạn muốn sử dụng TensorFlow.js thực sự, bạn cần cài đặt và import: 
// import * as tf from '@tensorflow/tfjs';

// Dummy deep learning evaluation function – thay thế bằng mô hình thật khi cần
const deepLearningEvaluate = async (audioBlob, text) => {
  // Ở đây bạn có thể thực hiện tiền xử lý audio, trích xuất đặc trưng, load mô hình và chạy inference
  // Ví dụ này chỉ trả về dữ liệu mẫu sau 2 giây (giả lập thời gian tính toán)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: "success",
        text_score: {
          text: text,
          // Dữ liệu mẫu cho kết quả (bạn cần thay thế bằng kết quả từ mô hình học sâu thực tế)
          word_score_list: [
            { word: "You", quality_score: 35, phone_score_list: [{ phone: "y", stress_score: 65 }] },
            { word: "can", quality_score: 80, phone_score_list: [{ phone: "k", stress_score: 95 }] },
            { word: "find", quality_score: 60, phone_score_list: [{ phone: "f", stress_score: 75 }] },
            { word: "a", quality_score: 90, phone_score_list: [] },
            { word: "lot", quality_score: 50, phone_score_list: [] },
            { word: "of", quality_score: 85, phone_score_list: [] },
            { word: "useful", quality_score: 90, phone_score_list: [{ phone: "u", stress_score: 80 }] },
            { word: "tips", quality_score: 95, phone_score_list: [] },
            { word: "on", quality_score: 100, phone_score_list: [] },
            { word: "this", quality_score: 100, phone_score_list: [] },
            { word: "website", quality_score: 100, phone_score_list: [] },
          ]
        }
      });
    }, 2000);
  });
};

// Hàm loại bỏ dấu nhấn khỏi câu (để gửi lên mô hình)
const cleanSentence = (sentence) => {
  return sentence.replace(/[‘’']/g, "");
};

// Hàm kiểm tra xem từ có dấu nhấn hay không (dựa trên ký tự dấu)
const isStressed = (word) => /[‘’']/.test(word);

// Hàm tạo nội dung đánh giá (chia làm 2 dòng: normal và stressed)
function getDetailedSummaryComponents(result, originalSentence) {
  if (
    !result ||
    !result.text_score ||
    !result.text_score.word_score_list ||
    !originalSentence
  )
    return null;

  // Tách các từ từ câu gốc
  const originalWords = originalSentence.split(/\s+/).filter(Boolean);
  const normalWords = [];
  const stressedWords = [];
  originalWords.forEach((word) => {
    const cleaned = cleanSentence(word).toLowerCase();
    if (isStressed(word)) {
      stressedWords.push(cleaned);
    } else {
      normalWords.push(cleaned);
    }
  });

  // Khởi tạo đối tượng lưu trữ đánh giá cho 2 nhóm
  const normalIssues = { incorrect: [], improvement: [] };
  const stressedIssues = { incorrect: [], improvement: [] };

  // Phân loại từ dựa trên kết quả từ mô hình
  result.text_score.word_score_list.forEach((wordObj) => {
    const wordClean = wordObj.word.toLowerCase();

    // Nhóm normal: từ không có dấu nhấn trong câu gốc
    if (normalWords.includes(wordClean)) {
      if (wordObj.quality_score < 40) {
        normalIssues.incorrect.push(wordObj.word);
      } else if (wordObj.quality_score < 70) {
        normalIssues.improvement.push(wordObj.word);
      }
    }
    // Nhóm stressed: từ có dấu nhấn trong câu gốc
    else if (stressedWords.includes(wordClean)) {
      if (wordObj.phone_score_list) {
        let sumStress = 0, count = 0;
        wordObj.phone_score_list.forEach((phone) => {
          if (typeof phone.stress_score !== "undefined") {
            sumStress += phone.stress_score;
            count++;
          }
        });
        const avgStress = count > 0 ? sumStress / count : 100;
        if (avgStress < 70) {
          stressedIssues.incorrect.push(wordObj.word);
        } else if (avgStress < 85) {
          stressedIssues.improvement.push(wordObj.word);
        }
      }
    }
  });

  // Tạo nội dung dòng 1 (normal)
  let normalContent;
  if (normalIssues.incorrect.length > 0 || normalIssues.improvement.length > 0) {
    normalContent = (
      <>
        {normalIssues.incorrect.length > 0 && (
          <span>
            <strong>Các từ phát âm chưa đúng:</strong> {normalIssues.incorrect.join(", ")}
          </span>
        )}
        {normalIssues.improvement.length > 0 && (
          <>
            {normalIssues.incorrect.length > 0 && " | "}
            <span>
              <strong>Các từ cần cải thiện:</strong> {normalIssues.improvement.join(", ")}
            </span>
          </>
        )}
      </>
    );
  } else {
    normalContent = <span><strong>Phát âm tốt.</strong></span>;
  }

  // Tạo nội dung dòng 2 (stressed)
  let stressedContent;
  if (stressedIssues.incorrect.length > 0 || stressedIssues.improvement.length > 0) {
    stressedContent = (
      <>
        {stressedIssues.incorrect.length > 0 && (
          <span>
            <strong>Các từ trọng âm phát âm chưa đúng:</strong> {stressedIssues.incorrect.join(", ")}
          </span>
        )}
        {stressedIssues.improvement.length > 0 && (
          <>
            {stressedIssues.incorrect.length > 0 && " | "}
            <span>
              <strong>Các từ cần cải thiện trọng âm:</strong> {stressedIssues.improvement.join(", ")}
            </span>
          </>
        )}
      </>
    );
  } else {
    stressedContent = <span><strong>Trọng âm tốt.</strong></span>;
  }

  return (
    <>
      <p>{normalContent}</p>
      <p>{stressedContent}</p>
    </>
  );
}

// Component hiển thị kết quả đánh giá trong một textbox readonly
function EvaluationResults({ result, originalSentence }) {
  const summaryComponents = getDetailedSummaryComponents(result, originalSentence);
  // Chuyển đổi nội dung đánh giá thành chuỗi để hiển thị trong textarea
  const finalSummary = `Kết quả đánh giá\n${(() => {
    // Tạo chuỗi cho dòng normal
    const incorrect = [];
    const improvement = [];
    const originalWords = originalSentence.split(/\s+/).filter(Boolean);
    const normalWords = originalWords.filter((w) => !isStressed(w)).map((w) => cleanSentence(w).toLowerCase());
    result.text_score.word_score_list.forEach((wordObj) => {
      const wordClean = wordObj.word.toLowerCase();
      if (normalWords.includes(wordClean)) {
        if (wordObj.quality_score < 40) incorrect.push(wordObj.word);
        else if (wordObj.quality_score < 70) improvement.push(wordObj.word);
      }
    });
    if (incorrect.length === 0 && improvement.length === 0)
      return "Phát âm tốt.";
    return `${incorrect.length > 0 ? "Các từ phát âm chưa đúng: " + incorrect.join(", ") : ""}${(incorrect.length > 0 && improvement.length > 0) ? " | " : ""}${improvement.length > 0 ? "Các từ cần cải thiện: " + improvement.join(", ") : ""}`;
  })()}\n\n${(() => {
    // Tạo chuỗi cho dòng stressed
    const incorrect = [];
    const improvement = [];
    const originalWords = originalSentence.split(/\s+/).filter(Boolean);
    const stressedWords = originalWords.filter((w) => isStressed(w)).map((w) => cleanSentence(w).toLowerCase());
    result.text_score.word_score_list.forEach((wordObj) => {
      const wordClean = wordObj.word.toLowerCase();
      if (stressedWords.includes(wordClean)) {
        if (wordObj.phone_score_list) {
          let sum = 0, cnt = 0;
          wordObj.phone_score_list.forEach((phone) => {
            if (typeof phone.stress_score !== "undefined") {
              sum += phone.stress_score;
              cnt++;
            }
          });
          const avg = cnt > 0 ? sum / cnt : 100;
          if (avg < 70) incorrect.push(wordObj.word);
          else if (avg < 85) improvement.push(wordObj.word);
        }
      }
    });
    if (incorrect.length === 0 && improvement.length === 0)
      return "Trọng âm tốt.";
    return `${incorrect.length > 0 ? "Các từ trọng âm phát âm chưa đúng: " + incorrect.join(", ") : ""}${(incorrect.length > 0 && improvement.length > 0) ? " | " : ""}${improvement.length > 0 ? "Các từ cần cải thiện trọng âm: " + improvement.join(", ") : ""}`;
  })()}`;
  return (
    <div className="evaluation-textbox">
      <label>Kết quả đánh giá</label>
      <textarea readOnly value={finalSummary} />
    </div>
  );
}

// Hàm sử dụng Web Speech API để phát âm mẫu (self-learning)
const playSamplePronunciation = (text) => {
  if ('speechSynthesis' in window && text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Trình duyệt của bạn không hỗ trợ chức năng này.");
  }
};

export default function HomePage() {
  // Danh sách câu mẫu cho Practice 1 (bản gốc có dấu)
  const practice1List = [
    "We should ‘finish the ‘project for our ‘history ‘class.",
    "Peter is re’vising for his e’xam ‘next ‘week.",
    "‘Students will ‘spend more ‘time ‘working with ‘other ‘classmates.",
    "I ‘like to ‘watch ‘videos that ‘help me ‘learn ‘new ‘things.",
    "I have in’stalled some ‘apps on my ‘phone."
  ];

  // Danh sách câu mẫu cho Practice 2 (bản gốc có dấu)
  const practice2List = [
    "Our 'teacher 'often 'gives us 'videos to 'watch at 'home.",
    "I 'never 'read 'books on my 'tablet at 'night.",
    "It is a 'new 'way of 'learning and 'students 'really 'like it.",
    "You can 'find a lot of 'useful tips on this 'website.",
    "They should 'make an 'outline for their 'presentation."
  ];

  const [selectedPractice, setSelectedPractice] = useState("practice1");
  // text: nội dung đã làm sạch để gửi lên mô hình
  const [text, setText] = useState("");
  // originalSentence: bản gốc có dấu nhấn để đánh giá
  const [originalSentence, setOriginalSentence] = useState("");
  const [result, setResult] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  // State cho tiến độ học của bot (progress bar)
  const [learningProgress, setLearningProgress] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Khi chọn câu mẫu, lưu cả bản gốc và phiên bản làm sạch cho textbox
  const handleSelectSentence = (sentence) => {
    setOriginalSentence(sentence);
    setText(cleanSentence(sentence));
  };

  // Chuyển đổi giữa Practice
  const handlePracticeSwitch = (practice) => {
    setSelectedPractice(practice);
    setText("");
    setOriginalSentence("");
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  // Phát âm mẫu cho nội dung đang có
  const handlePlaySample = () => {
    playSamplePronunciation(text);
  };

  // Bắt đầu ghi âm
  const startRecording = async () => {
    if (!navigator.mediaDevices) {
      alert("Trình duyệt của bạn không hỗ trợ ghi âm.");
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      alert("Trình duyệt của bạn không hỗ trợ tính năng ghi âm.");
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };
      
      mediaRecorderRef.current.onerror = (event) => {
        console.error("MediaRecorder error: ", event.error);
        alert("Đã xảy ra lỗi khi ghi âm: " + event.error.message);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Lỗi khi ghi âm:", error);
      alert("Không thể ghi âm. Vui lòng kiểm tra quyền microphone của bạn.");
    }
  };

  // Dừng ghi âm
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Hàm mô phỏng tiến độ học của bot (progress bar)
  const startLearningProgress = () => {
    setLearningProgress(0);
    const interval = setInterval(() => {
      setLearningProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 300);
  };

  // Phát audio mẫu "01.wav" từ thư mục public
  const playAudio01 = () => {
    const audio = new Audio("/01.wav");
    audio.play();
  };

  // Gửi dữ liệu lên mô hình deep learning (dummy function) để đánh giá phát âm
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text || !audioBlob) {
      alert("Vui lòng chọn nội dung và ghi âm để đánh giá.");
      return;
    }
    setLoading(true);

    // Thay thế fetch API bằng deep learning evaluation function
    try {
      const data = await deepLearningEvaluate(audioBlob, text);
      setResult(data);
    } catch (error) {
      console.error("Lỗi khi đánh giá:", error);
      setResult({ error: "Có lỗi xảy ra khi đánh giá." });
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <div className="signature">By Luong Kieu Trang</div>
      <h1>Speechace Pronunciation Evaluator</h1>

      <div className="practice-switch">
        <button
          onClick={() => handlePracticeSwitch("practice1")}
          className={selectedPractice === "practice1" ? "active" : ""}
        >
          Practice 1
        </button>
        <button
          onClick={() => handlePracticeSwitch("practice2")}
          className={selectedPractice === "practice2" ? "active" : ""}
        >
          Practice 2
        </button>
      </div>

      {selectedPractice === "practice1" && (
        <div className="practice-list">
          {practice1List.map((sentence, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectSentence(sentence)}
              className={`sentence ${
                text === cleanSentence(sentence) ? "selected" : ""
              }`}
            >
              {cleanSentence(sentence)}
            </div>
          ))}
        </div>
      )}
      {selectedPractice === "practice2" && (
        <div className="practice-list">
          {practice2List.map((sentence, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectSentence(sentence)}
              className={`sentence ${
                text === cleanSentence(sentence) ? "selected" : ""
              }`}
            >
              {cleanSentence(sentence)}
            </div>
          ))}
        </div>
      )}

      <div className="textbox-container">
        <label>Nhập nội dung bạn đọc:</label>
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Chọn nội dung từ Practice"
          required
        />
      </div>

      <div className="sample-pronunciation">
        <button type="button" onClick={handlePlaySample}>
          Phát âm mẫu
        </button>
        <button type="button" onClick={playAudio01}>
          Phát audio 01.wav
        </button>
      </div>

      <div className="learning-progress">
        <label>Tiến độ học của bot:</label>
        <progress value={learningProgress} max="100" />
        <span>{learningProgress}%</span>
        <button type="button" onClick={startLearningProgress}>
          Bắt đầu học
        </button>
      </div>

      <div className="recording-section">
        <label>Ghi âm trực tiếp:</label>
        <div className="recording-buttons">
          {!isRecording ? (
            <button type="button" onClick={startRecording}>
              Bắt đầu ghi âm
            </button>
          ) : (
            <button type="button" onClick={stopRecording}>
              Dừng ghi âm
            </button>
          )}
        </div>
        {audioUrl && (
          <div className="audio-preview">
            <p>Xem trước âm thanh:</p>
            <audio controls src={audioUrl}></audio>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="submit-form">
        <button type="submit" disabled={loading}>
          {loading ? "Đang đánh giá..." : "Đánh giá phát âm"}
        </button>
      </form>

      {result && result.status === "success" && (
        <EvaluationResults result={result} originalSentence={originalSentence} />
      )}
      {result && result.error && (
        <div className="error-message">
          <h2>Lỗi:</h2>
          <p>{result.error}</p>
        </div>
      )}

      <style jsx>{`
        .container {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          text-align: center;
          font-family: Arial, sans-serif;
          background: url("/nen xanh.jpg") no-repeat center center;
          background-size: cover;
          min-height: 100vh;
        }
        .signature {
          position: absolute;
          top: 10px;
          right: 10px;
          color: yellow;
          font-weight: bold;
          font-size: 1.2rem;
        }
        h1 {
          margin-bottom: 1.5rem;
          color: #fff;
        }
        .practice-switch button {
          margin: 0 0.5rem;
          padding: 0.5rem 1rem;
          font-size: 1rem;
          border: 1px solid #0070f3;
          background: #fff;
          color: #0070f3;
          cursor: pointer;
          transition: background 0.3s, color 0.3s;
        }
        .practice-switch button.active,
        .practice-switch button:hover {
          background: #0070f3;
          color: #fff;
        }
        .practice-list {
          border: 1px solid #ccc;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          text-align: left;
          background: rgba(255, 255, 255, 0.8);
        }
        .sentence {
          padding: 0.5rem;
          margin-bottom: 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .sentence:hover {
          background: #f0f0f0;
        }
        .sentence.selected {
          background: #d0eaff;
        }
        .textbox-container {
          margin-bottom: 1.5rem;
          text-align: left;
          background: none;
          padding: 0;
          border-radius: 0;
        }
        .textbox-container label {
          font-weight: bold;
          color: #fff;
        }
        .textbox-container textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }
        .textbox-container textarea:focus {
          border-color: #0070f3;
          outline: none;
        }
        .sample-pronunciation {
          margin-bottom: 1.5rem;
          text-align: left;
        }
        .sample-pronunciation button {
          padding: 0.5rem 1rem;
          font-size: 1rem;
          background: #0070f3;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.3s;
          margin-right: 1rem;
        }
        .sample-pronunciation button:hover {
          background: #005bb5;
        }
        .learning-progress {
          margin-bottom: 1.5rem;
          text-align: left;
          background: rgba(255, 255, 255, 0.8);
          padding: 1rem;
          border-radius: 8px;
        }
        .learning-progress label {
          font-weight: bold;
          margin-right: 1rem;
        }
        .learning-progress progress {
          vertical-align: middle;
          margin-right: 1rem;
          width: 200px;
          height: 20px;
        }
        .recording-section {
          margin-bottom: 1.5rem;
          text-align: left;
          background: none;
          padding: 0;
          border-radius: 0;
        }
        .recording-buttons button {
          padding: 0.5rem 1rem;
          font-size: 1rem;
          border: 1px solid #0070f3;
          background: #fff;
          color: #0070f3;
          cursor: pointer;
          transition: background 0.3s, color 0.3s;
          margin-right: 1rem;
        }
        .recording-buttons button:hover {
          background: #0070f3;
          color: #fff;
        }
        .audio-preview {
          margin-top: 1rem;
        }
        .submit-form button {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          background: #0070f3;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .submit-form button:hover {
          background: #005bb5;
        }
        .error-message {
          color: red;
          margin-top: 1.5rem;
          background: rgba(255, 255, 255, 0.8);
          padding: 1rem;
          border-radius: 8px;
        }
        /* Phần kết quả đánh giá được hiển thị trong textbox readonly */
        .evaluation-textbox {
          margin: 2rem auto;
          max-width: 600px;
          text-align: left;
        }
        .evaluation-textbox label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: bold;
          font-size: 1.2rem;
          color: #000;
        }
        .evaluation-textbox textarea {
          width: 100%;
          min-height: 150px;
          padding: 1rem;
          border: 2px solid #333;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          font-size: 1.2rem;
          white-space: pre-wrap;
          resize: vertical;
        }
        .evaluation-textbox textarea:focus {
          outline: none;
          border-color: #0070f3;
        }
        @media (max-width: 600px) {
          .evaluation-textbox {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </div>
  );
}
