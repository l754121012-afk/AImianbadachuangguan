var formatTime = function(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();
  return formatNumber(year) + "/" + formatNumber(month) + "/" + formatNumber(day) + " " + formatNumber(hour) + ":" + formatNumber(minute) + ":" + formatNumber(second);
};

var formatNumber = function(n) {
  n = n.toString();
  return n[1] ? n : "0" + n;
};

var scoreToGrade = function(score) {
  if (score >= 90) return "S";
  if (score >= 75) return "A";
  if (score >= 60) return "B";
  return "C";
};

var gradeToColor = function(grade) {
  var map = {
    "S": { bg: "rgba(245,158,11,0.15)", text: "#f59e0b", border: "rgba(245,158,11,0.3)", desc: "卓越" },
    "A": { bg: "rgba(59,130,246,0.15)", text: "#3b82f6", border: "rgba(59,130,246,0.3)", desc: "良好" },
    "B": { bg: "rgba(16,185,129,0.15)", text: "#10b981", border: "rgba(16,185,129,0.3)", desc: "合格" },
    "C": { bg: "rgba(239,68,68,0.15)",  text: "#ef4444", border: "rgba(239,68,68,0.3)",  desc: "待提升" }
  };
  return map[grade] || map["C"];
};

var scoreToGradeInfo = function(score) {
  var grade = scoreToGrade(score);
  var color = gradeToColor(grade);
  return { grade: grade, label: color.label, color: color.color };
};

module.exports = {
  formatTime: formatTime,
  scoreToGrade: scoreToGrade,
  gradeToColor: gradeToColor,
  scoreToGradeInfo: scoreToGradeInfo
};