var app = getApp();
var _mod = require('../../utils/util.js'); var scoreToGradeInfo = _mod.scoreToGradeInfo;;

Page({
  data: {
    score: 87,
    gradeInfo: {},
    percentile: 78,
    interviewTitle: '综合评分',
    dimensions: [
      { name: '表达逻辑', score: 90 },
      { name: '内容完整', score: 85 },
      { name: '语言表达', score: 82 },
      { name: '情绪自信', score: 88 },
      { name: '回答时效', score: 86 }
    ],
    questions: [
      { id: 1, title: '自我介绍', text: '请做一个简短的自我介绍', feedback: '结构清晰，先说背景再说动机，逻辑完整。建议增加与岗位相关的关键数据或成果。', badge: '优秀' },
      { id: 2, title: '项目经历', text: '介绍最近的项目经历和困难', feedback: '回答较完整，但缺少具体的量化指标。建议用STAR法则描述。', badge: '待提升' }
    ],
    showPayment: false,
    isVip: false,
    fromUpgrade: false,
    unlockedTitle: ''
  },

  onLoad(options) {
    var score = 87;
    var title = '综合评分';

    if (options.score) {
      score = parseInt(options.score);
    }
    if (options.title) {
      title = decodeURIComponent(options.title);
    }

    var gradeInfo = scoreToGradeInfo(score);
    var percentile = Math.min(95, Math.round(score * 0.9));
    var fromUpgrade = options.from === 'upgrade';

    this.setData({
      score,
      gradeInfo,
      percentile,
      interviewTitle: title,
      isVip: app.globalData.isVip,
      fromUpgrade
    });

    // 计算并解锁称号
    this.checkUnlockTitles(score);

    if (fromUpgrade && !app.globalData.isVip) {
      setTimeout(function() { this.setData({ showPayment: true }); }, 500);
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
