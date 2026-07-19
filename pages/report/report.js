var app = getApp();
var _mod = require('../../utils/util.js'); var scoreToGradeInfo = _mod.scoreToGradeInfo;

Page({
  data: {
    score: 87,
    gradeInfo: {},
    percentile: 78,
    interviewTitle: '综合评分',
    dimensions: [],
    previewDimensions: [],
    questions: [],
    showPayment: false,
    isVip: false,
    vipLevel: 0,
    isUnlocked: false,
    isPro: false,
    previewCount: 2,
    lockedCount: 0,
    fromUpgrade: false,
    unlockedTitle: '',
    aiAnalysis: '',
    suggestions: [],
    voiceData: {},
    trendData: []
  },

  onLoad: function(options) {
    var score = 87;
    var title = '综合评分';
    var answersData = [];

    if (options.score) { score = parseInt(options.score); }
    if (options.title) { title = decodeURIComponent(options.title); }

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
      try { answersData = JSON.parse(decodeURIComponent(options.answers)); } catch(e) {}
    }

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

    var previewDimensions = [];
    for (var pdi = 0; pdi < dimensions.length; pdi++) {
      previewDimensions.push({ name: dimensions[pdi].name, score: Math.round(dimensions[pdi].score * 0.7) });
    }

    var favorites = [];
    try {
      var favData = wx.getStorageSync('favorites');
      if (favData) { favorites = favData; }
    } catch(e) {}

    var questions = [];
    var previewCount = 2;
    var badgeMap = { '优秀': 'excellent', '良好': 'good', '合格': 'ok', '待提升': 'improve', '需努力': 'weak' };
    for (var qi = 0; qi < answersData.length; qi++) {
      var ans = answersData[qi];
      var qScore = ans.score || 0;
      var badge = '待提升';
      var feedback = '回答内容较少，建议更详细地展开论述。';
      if (qScore >= 85) { badge = '优秀'; feedback = '回答非常出色，逻辑清晰，内容丰富。'; }
      else if (qScore >= 70) { badge = '良好'; feedback = '回答较完整，建议增加具体案例和数据支撑。'; }
      else if (qScore >= 55) { badge = '合格'; feedback = '回答基本切题，建议使用结构化表达。'; }
      else if (qScore >= 40) { badge = '待提升'; feedback = '回答较为简略，建议从多角度分析问题。'; }
      else { badge = '需努力'; feedback = '回答内容不足，建议多练习结构化表达。'; }
      var qText = (typeof ans.question === 'string') ? ans.question : (ans.question ? (ans.question.question || ans.question || '') : '');
      var qId = ans.questionId || (qi + 1);
      var isFav = false;
      for (var fi = 0; fi < favorites.length; fi++) {
        if (favorites[fi].id === qId) { isFav = true; break; }
      }
      questions.push({
        id: qi + 1,
        questionId: qId,
        title: qText.length > 10 ? qText.substring(0, 10) : (qText || '第' + (qi+1) + '题'),
        text: qText,
        userAnswer: ans.answer || '',
        feedback: feedback,
        badge: badge,
        badgeKey: badgeMap[badge] || 'improve',
        score: qScore,
        time: ans.time || 0,
        show: qi < previewCount,
        favorited: isFav
      });
    }

    if (questions.length === 0) {
      var demoQuestions = [
        { q: '请做一个简单的自我介绍', a: '我是一名有3年经验的产品经理，擅长数据分析和用户研究，曾主导过多个从0到1的产品项目。', s: 85, b: '优秀', bk: 'excellent', f: '回答结构清晰，涵盖了工作经验和核心能力，可以进一步突出与岗位的匹配度。' },
        { q: '你认为自己最大的优点是什么', a: '我的逻辑分析能力较强，能够快速梳理复杂问题并找到关键切入点。', s: 78, b: '良好', bk: 'good', f: '回答简洁有力，建议补充一个具体案例来增强说服力。' },
        { q: '你为什么选择我们公司', a: '贵公司在行业内的创新能力和技术实力非常吸引我，我希望能在这样的平台上成长。', s: 72, b: '良好', bk: 'good', f: '回答较为通用，建议提前了解公司具体业务，说出更个性化的理由。' },
        { q: '你对薪资有什么期望', a: '我期望的薪资范围是15-20K，具体可以根据岗位职责和公司福利体系来协商。', s: 65, b: '合格', bk: 'ok', f: '回答直接但略显生硬，可以同时表达对成长机会的重视。' },
        { q: '请描述一次你解决困难问题的经历', a: '在上一个项目中，我们遇到了用户留存率下降的问题，我通过数据分析定位到关键流失节点，提出了优化方案。', s: 80, b: '良好', bk: 'good', f: '回答使用了STAR框架，结构完整。建议补充量化的成果数据。' }
      ];
      for (var dqi = 0; dqi < demoQuestions.length; dqi++) {
        var dq = demoQuestions[dqi];
        var dqIsFav = false;
        for (var dfi = 0; dfi < favorites.length; dfi++) {
          if (favorites[dfi].id === (dqi + 1)) { dqIsFav = true; break; }
        }
        questions.push({
          id: dqi + 1,
          title: dq.q.length > 10 ? dq.q.substring(0, 10) : dq.q,
          text: dq.q,
          userAnswer: dq.a,
          feedback: dq.f,
          badge: dq.b,
          badgeKey: dq.bk,
          score: dq.s,
          time: 0,
          show: dqi < previewCount,
          favorited: dqIsFav
        });
      }
    }

    var lockedCount = Math.max(0, questions.length - previewCount);

    var level = app.getVipLevel ? app.getVipLevel() : 0;
    var isUnlocked = level >= 1;
    var isPro = level >= 3;

    var gradeInfo = scoreToGradeInfo(score);
    var percentile = Math.min(95, Math.round(score * 0.9));
    var fromUpgrade = options.from === 'upgrade';

    var aiAnalysis = '您的表达逻辑表现突出（' + dimensions[0].score + '分），在结构化表达方面有扎实基础。专业深度（' + (dimensions[2] ? dimensions[2].score : dimensions[0].score) + '分）是主要提升空间，建议加强行业案例积累。整体水平处于中等偏上，通过针对性练习可快速提升至A级。';

    var suggestions = [
      '每周练习2-3道专业深度题，重点积累行业案例和数据分析',
      '使用STAR法则答题模板，提升回答的完整性和结构化',
      '建议进行模拟群面练习，提升临场应变能力'
    ];

    var voiceData = { speed: 142, pause: '2.3s', confidence: 78, fluency: 85 };

    var trendData = [
      { date: '6/25', score: 68 },
      { date: '7/2', score: 72 },
      { date: '7/9', score: 75 },
      { date: '7/16', score: 79 },
      { date: '本次', score: score }
    ];

    this.setData({
      score: score,
      gradeInfo: gradeInfo,
      percentile: percentile,
      interviewTitle: title,
      dimensions: dimensions,
      previewDimensions: previewDimensions,
      questions: questions,
      isVip: app.globalData.isVip,
      vipLevel: level,
      isUnlocked: isUnlocked,
      isPro: isPro,
      previewCount: previewCount,
      lockedCount: lockedCount,
      fromUpgrade: fromUpgrade,
      aiAnalysis: aiAnalysis,
      suggestions: suggestions,
      voiceData: voiceData,
      trendData: trendData
    });
    this.checkUnlockTitles(score);

    if (fromUpgrade && !isUnlocked) {
      var that = this;
      setTimeout(function() { that.setData({ showPayment: true }); }, 500);
    }
  },

  onToggleFav: function(e) {
    var id = e.currentTarget.dataset.id;
    var questions = this.data.questions;
    var q = questions[id - 1];
    if (!q) return;
    q.favorited = !q.favorited;

    if (q.favorited) {
      var favItem = {
        id: q.questionId || id,
        question: q.text || '',
        title: q.title || ''
      };
      app.addFavorite(favItem);
    } else {
      app.removeFavorite(q.questionId || id);
    }

    this.setData({ questions: questions });
    wx.showToast({ title: q.favorited ? '已收藏' : '已取消', icon: 'none' });
  },

  checkUnlockTitles: function(score) {
    var history = app.globalData.interviewHistory;
    var totalCount = history.length;
    var avgScore = totalCount > 0
      ? (function() { var sum = 0; for (var ri = 0; ri < history.length; ri++) sum += history[ri].score; return Math.round(sum / totalCount); })()
      : score;
    var abilities = [];
    for (var ai = 0; ai < this.data.dimensions.length; ai++) {
      var d = this.data.dimensions[ai];
      abilities.push({ name: d.name.substring(0, 2), score: d.score });
    }
    var newTitles = app.calculateTitles({ totalCount: totalCount, avgScore: avgScore, abilities: abilities });
    var profile = app.getUserProfile();
    var oldTitles = app.getUnlockedTitles();
    var newlyUnlocked = [];
    for (var ni = 0; ni < newTitles.length; ni++) {
      if (oldTitles.indexOf(newTitles[ni]) === -1) newlyUnlocked.push(newTitles[ni]);
    }
    if (newlyUnlocked.length > 0) {
      var titlePriority = ['面神', '面霸', '面试达人', '顶尖高手', '优秀选手', '合格选手', '面试新手', '面试小白'];
      var bestTitle = '面试小白';
      for (var ti = 0; ti < titlePriority.length; ti++) {
        if (newTitles.indexOf(titlePriority[ti]) >= 0) { bestTitle = titlePriority[ti]; break; }
      }
      profile.title = bestTitle;
      app.setUserProfile(profile);
      this.setData({ unlockedTitle: newlyUnlocked[0] });
      wx.showToast({ title: '解锁称号：' + newlyUnlocked[0], icon: 'none', duration: 2000 });
    }
  },

  onUnlock: function() {
    var level = app.getVipLevel ? app.getVipLevel() : 0;
    if (level >= 3) {
      this.setData({ isUnlocked: true, isVip: true, vipLevel: level, isPro: true });
      wx.showToast({ title: '已是Pro会员', icon: 'success' });
      return;
    }
    this.setData({ showPayment: true });
  },

  onVipChanged: function() {
    var level = app.getVipLevel ? app.getVipLevel() : 0;
    this.setData({
      isUnlocked: level >= 1,
      isPro: level >= 3,
      isVip: app.globalData.isVip,
      vipLevel: level,
      showPayment: false
    });
    if (level >= 1) {
      wx.showToast({ title: '报告已解锁', icon: 'success' });
    }
  },

  onClosePayment: function() {
    var level = app.getVipLevel ? app.getVipLevel() : 0;
    this.setData({
      showPayment: false,
      isUnlocked: level >= 1,
      isPro: level >= 3,
      isVip: app.globalData.isVip,
      vipLevel: level
    });
  },

  onShare: function() {
    wx.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] });
  },

  onShareAppMessage: function() {
    var score = this.data.score;
    var gradeInfo = this.data.gradeInfo;
    return {
      title: '我的AI面试获得' + gradeInfo.grade + '评级！你也来试试？',
      path: '/pages/index/index'
    };
  },

  onRetry: function() {
    wx.navigateTo({ url: '/pages/prepare/prepare' });
  }
});