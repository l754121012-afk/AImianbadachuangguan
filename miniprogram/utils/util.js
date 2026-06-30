const formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`;
};

const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : `0${n}`;
};

/* ===== C-S 等级评分体系 =====
 * 底层保留数字分数用于计算，展示用C-S等级
 * S: 90-100 (卓越)
 * A: 75-89  (良好)
 * B: 60-74  (合格)
 * C: 0-59   (待提升)
 */
const scoreToGrade = score => {
  if (score >= 90) return 'S';
  if (score >= 75) return 'A';
  if (score >= 60) return 'B';
  return 'C';
};

const gradeToColor = grade => {
  const map = {
    'S': { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', border: 'rgba(245,158,11,0.3)', desc: '卓越' },
    'A': { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', border: 'rgba(59,130,246,0.3)', desc: '良好' },
    'B': { bg: 'rgba(16,185,129,0.15)', text: '#10b981', border: 'rgba(16,185,129,0.3)', desc: '合格' },
    'C': { bg: 'rgba(239,68,68,0.15)',  text: '#ef4444', border: 'rgba(239,68,68,0.3)',  desc: '待提升' }
  };
  return map[grade] || map['C'];
};

const scoreToGradeInfo = score => {
  const grade = scoreToGrade(score);
  const color = gradeToColor(grade);
  return { grade, ...color };
};

module.exports = {
  formatTime,
  scoreToGrade,
  gradeToColor,
  scoreToGradeInfo
};
