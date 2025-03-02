// pages/api/evaluate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }
  
  const { audio, text } = req.body;
  // Ở đây, chúng ta giả định rằng việc xử lý audio được thực hiện riêng.
  // Ta chỉ tập trung vào đánh giá văn bản (các câu mẫu) để tách từ theo trọng âm.

  const words = text.split(' ');
  const normalWords = [];
  const stressedWords = [];

  // Regex kiểm tra cả dấu ‘ và dấu ’
  const stressRegex = /[‘’]/;

  words.forEach(word => {
    if (stressRegex.test(word)) {
      // Nếu cần, loại bỏ dấu nhấn để tính điểm từ cơ bản
      const cleanWord = word.replace(stressRegex, '');
      stressedWords.push({
        word: cleanWord,
        score: (Math.random() * 100).toFixed(2),
        stressScore: (Math.random() * 100).toFixed(2),
        comment: "Phát âm có trọng âm tốt"
      });
    } else {
      normalWords.push({
        word,
        score: (Math.random() * 100).toFixed(2),
        comment: "Phát âm bình thường"
      });
    }
  });

  res.status(200).json({ normalWords, stressedWords });
}
