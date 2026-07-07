var app = getApp();
var _mod = require('../../utils/util.js'); var scoreToGradeInfo = _mod.scoreToGradeInfo;

Page({
  data: {
    score: 87,
    gradeInfo: {},
    percentile: 78,
    interviewTitle: '综合评分',
    dimensions: [],
    questions: [],
    showPayment: false,
    isVip: false,
    fromUpgrade: false,
    unlockedTitle: ''
  },

  onLoad: function(options) {
    var score = 87;
    var title = '综合评分';
    var answersData = [];

    if (options.score) {
      score = parseInt(options.score);
    }
    if (options.title) {
      title = decodeURIComponent(options.title);
    }

    // 从storage或URL解析回答数据
    try {
      var stored = wx.getStorageSync('reportData');
      if (stored) {
        var reportData = JSON.parse(stored);
        answersData = reportData.answers || [];
        if (reportData.score) { score = reportData.score; }
        if (reportData.title) { title = reportData.title; }
        wx.removeStorageSync('reportData');
      }
    } catch(e) {}
    if (answersData.length === 0 && options.answers) {
      try {
        answersData = JSON.parse(decodeURIComponent(options.answers));
      } catch(e) {}
    }

    if (fromUpgrade && !app.globalData.isVip) {
      setTimeout(function() { this.setData({ showPayment: true }); }, 500);
    }

    // 根据每道题的维度数据动态计算五维平均分
    var dimMap = {};
    var dimCount = {};
    for (var ai = 0; ai < answersData.length; ai++) {
      var dims = answersData[ai].dimensions || {};
      var dimKeys = [];
      for (var dk in dims) { if (dims.hasOwnProperty(dk)) dimKeys.push(dk); }
      for (var ki = 0; ki < dimKeys.length; ki++) {
        var key = dimKeys[ki];
        if (!dimMap[key]) { dimMap[key] = 0; dimCount[key] = 0; }
        dimMap[key] += dims[key];
        dimCount[key]++;
      }
    }

    var dimensions = [];
    var allDimKeys = [];
    for (var ddk in dimMap) { if (dimMap.hasOwnProperty(ddk)) allDimKeys.push(ddk); }
    for (var di = 0; di < allDimKeys.length; di++) {
      var avgScore = Math.round(dimMap[allDimKeys[di]] / dimCount[allDimKeys[di]]);
      dimensions.push({ name: allDimKeys[di], score: avgScore });
    }

    // 如果没有维度数据，基于总分生成默认维度
    if (dimensions.length === 0) {
      var base = score;
      dimensions = [
        { name: '表达逻辑', score: Math.min(100, Math.max(10, base + Math.round((Math.random() - 0.5) * 20))) },
        { name: '内容完整', score: Math.min(100, Math.max(10, base + Math.round((Math.random() - 0.5) * 20))) },
        { name: '语言表达', score: Math.min(100, Math.max(10, base + Math.round((Math.random() - 0.5) * 20))) },
        { name: '情绪自信', score: Math.min(100, Math.max(10, base + Math.round((Math.random() - 0.5) * 20))) },
        { name: '回答时效', score: Math.min(100, Math.max(10, base + Math.round((Math.random() - 0.5) * 20))) }
      ];
    }

    // 生成每道题的反馈
    var questions = [];
    for (var qi = 0; qi < answersData.length; qi++) {
      var ans = answersData[qi];
      var qScore = ans.score || 0;
      var badge = "待提升";
      var feedback = "回答内容较少，建议更详细地展开论述。";
      if (qScore >= 85) { badge = '优秀'; feedback = '回答非常出色，逻辑清晰，内容丰富。'; }
      else if (qScore >= 70) { badge = '良好'; feedback = '回答较完整，建议增加具体案例和数据支撑。'; }
      else if (qScore >= 55) { badge = '合格'; feedback = '回答基本切题，建议使用结构化表达。'; }
      else if (qScore >= 40) { badge = '待提升'; feedback = '回答较为简略，建议从多角度分析问题。'; }
      else { badge = '需努力'; feedback = '回答内容不足，建议多练习结构化表达。'; }
      var qText = (typeof ans.question === "string") ? ans.question : (ans.question ? ans.question : "");
      questions.push({
        id: qi + 1,
        title: qText.length > 10 ? qText.substring(0, 10) : (qText || "第" + (qi+1) + "题"),
        text: qText,
        userAnswer: ans.answer || '',
        feedback: feedback,
        badge: badge,
        score: qScore,
        time: ans.time || 0
      });
    }

    var gradeInfo = scoreToGradeInfo(score);
    var percentile = Math.min(95, Math.round(score * 0.9));
    var fromUpgrade = options.from === "upgrade";

    this.setData({
      score: score,
      gradeInfo: gradeInfo,
      percentile: percentile,
      interviewTitle: title,
      dimensions: dimensions,
      questions: questions,
      isVip: app.globalData.isVip,
      fromUpgrade: fromUpgrade
    });
    this.checkUnlockTitles(score);

    if (fromUpgrade && !app.globalData.isVip) {
      var that = this;
      setTimeout(function() { that.setData({ showPayment: true }); }, 500);
    }
  },

  checkUnlockTitles: function(score) {
    var history = app.globalData.interviewHistory;
    var totalCount = history.length;
    var avgScore = totalCount > 0
      ? (function() { var sum = 0; for (var ri = 0; ri < history.length; ri++) sum += history[ri].score; return Math.round(sum / totalCount); })()
      : score;

    var abilities = []; for (var ai = 0; ai < this.data.dimensions.length; ai++) { var d = this.data.dimensions[ai]; abilities.push({ name: d.name.substring(0, 2), score: d.score }); }

    var newTitles = app.calculateTitles({ totalCount: totalCount, avgScore: avgScore, abilities: abilities });
    var profile = app.getUserProfile();

    // 如果解锁了新称号，提示用户
    var oldTitles = app.getUnlockedTitles();
    var newlyUnlocked = []; for (var ni = 0; ni < newTitles.length; ni++) { if (oldTitles.indexOf(newTitles[ni]) === -1) newlyUnlocked.push(newTitles[ni]); }
    if (newlyUnlocked.length > 0) {
      // 自动升级到最高级称号
      var titlePriority = ['面神', '面霸', '面试达人', '顶尖高手', '优秀选手', '合格选手', '面试新手', '面试小白'];
      var bestTitle = '面试小白'; for (var ti = 0; ti < titlePriority.length; ti++) { if (newTitles.indexOf(titlePriority[ti]) >= 0) { bestTitle = titlePriority[ti]; break; } }
      profile.title = bestTitle;
      app.setUserProfile(profile);
      this.setData({ unlockedTitle: newlyUnlocked[0] });
      wx.showToast({ title: '解锁称号：' + newlyUnlocked[0], icon: 'none', duration: 2000 });
    }
  },

  onUnlock: function() {
    if (this.data.isVip) {
      wx.showToast({ title: '已是会员', icon: 'none' });
      return;
    }
    this.setData({ showPayment: true });
  },

  onClosePayment: function() {
    this.setData({ showPayment: false });
  },

  onShare: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  onShareAppMessage: function() {
    var score = this.data.score; var gradeInfo = this.data.gradeInfo;
    return {
      title: '我的AI面试获得' + gradeInfo.grade + '评级！你也来试试？',
      path: '/pages/index/index'
    };
  },

  onRetry: function() {
    wx.navigateTo({ url: '/pages/prepare/prepare' });
  }
});
