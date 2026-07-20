// AI面霸大闯关 - 题库主入口
// 题库总量: 6520题 (求职2180 + 考研2170 + 考公2170)
// 每个岗位60-65题，支持随机轮换
// 数据文件在分包中，首页预加载

var _jobBank = null;
var _kaoyanBank = null;
var _kaogongBank = null;

function loadBanks() {
  if (_jobBank) return;
  try {
    _jobBank = require('../subpkg-job/data/questions-job.js').JOB_QUESTIONS;
    _kaoyanBank = require('../subpkg-exam/data/questions-kaoyan.js').KAOYAN_QUESTIONS;
    _kaogongBank = require('../subpkg-exam/data/questions-kaogong.js').KAOGONG_QUESTIONS;
  } catch(e) {
    console.error('题库加载失败:', e);
    _jobBank = {};
    _kaoyanBank = {};
    _kaogongBank = {};
  }
}

function getQuestionBank() {
  loadBanks();
  return {
    job: _jobBank,
    kaoyan: _kaoyanBank,
    kaogong: _kaogongBank
  };
}

function getQuestions(scene, job, count) {
  loadBanks();
  var bank = getQuestionBank();
  var sceneData = bank[scene];
  if (!sceneData) return [];

  var questions = sceneData[job] || sceneData[Object.keys(sceneData)[0]] || [];
  if (!questions || questions.length === 0) return [];

  var n = count || 5;
  if (questions.length <= n) {
    var shuffled = questions.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = tmp;
    }
    return shuffled;
  }

  var indices = [];
  var used = {};
  while (indices.length < n) {
    var idx = Math.floor(Math.random() * questions.length);
    if (!used[idx]) {
      used[idx] = true;
      indices.push(idx);
    }
  }

  var result = [];
  for (var ri = 0; ri < indices.length; ri++) {
    var q = questions[indices[ri]];
    var obj = {};
    for (var key in q) {
      if (q.hasOwnProperty(key)) {
        if (key === 'answer' && Array.isArray(q[key])) {
          obj[key] = q[key].join('；');
        } else {
          obj[key] = q[key];
        }
      }
    }
    result.push(obj);
  }
  return result;
}

function getDefaultJob(scene, category) {
  var defaults = {
    job: {
      '技术研发': 'Java开发',
      '产品与设计': '产品经理',
      '市场与运营': '运营专员',
      '金融与咨询': '金融分析师',
      '医疗与健康': '临床医生',
      '制造与供应链': '生产主管'
    },
    kaoyan: {
      '理工类': '计算机科学',
      '文史类': '中国语言文学',
      '经管类': '工商管理',
      '法学类': '民商法',
      '教育类': '教育学',
      '医学类': '临床医学'
    },
    kaogong: {
      '国考': '综合管理',
      '省考': '省级机关',
      '事业编': '教育事业单位',
      '军队文职': '行政管理',
      '遴选': '省级遴选',
      '村官': '大学生村官'
    }
  };

  var sceneMap = defaults[scene];
  if (sceneMap && sceneMap[category]) {
    return sceneMap[category];
  }

  loadBanks();
  var bank = getQuestionBank();
  var bk = bank[scene];
  if (bk) {
    var keys = Object.keys(bk);
    if (keys.length > 0) return keys[0];
  }
  return 'Java开发';
}

module.exports = {
  QUESTION_BANK: {
    get job() { loadBanks(); return _jobBank; },
    get kaoyan() { loadBanks(); return _kaoyanBank; },
    get kaogong() { loadBanks(); return _kaogongBank; }
  },
  getQuestions: getQuestions,
  getDefaultJob: getDefaultJob
};