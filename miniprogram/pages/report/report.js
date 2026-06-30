const app = getApp();
const { scoreToGradeInfo } = require('../../utils/util.js');

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
    let score = 87;
    let title = '综合评分';

    if (options.score) {
      score = parseInt(options.score);
    }
    if (options.title) {
      title = decodeURIComponent(options.title);
    }

    const gradeInfo = scoreToGradeInfo(score);
    const percentile = Math.min(95, Math.round(score * 0.9));
    const fromUpgrade = options.from === 'upgrade';

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
      setTimeout(() => { this.setData({ showPayment: true }); }, 500);
    }
  },

  checkUnlockTitles(score) {
    const history = app.globalData.interviewHistory;
    const totalCount = history.length;
    const avgScore = totalCount > 0
      ? Math.round(history.reduce((s, h) => s + h.score, 0) / totalCount)
      : score;

    const abilities = this.data.dimensions.map(d => ({ name: d.name.substring(0, 2), score: d.score }));

    const newTitles = app.calculateTitles({ totalCount, avgScore, abilities });
    const profile = app.getUserProfile();

    // 如果解锁了新称号，提示用户
    const oldTitles = app.getUnlockedTitles();
    const newlyUnlocked = newTitles.filter(t => !oldTitles.includes(t));
    if (newlyUnlocked.length > 0) {
      // 自动升级到最高级称号
      const titlePriority = ['面神', '面霸', '面试达人', '顶尖高手', '优秀选手', '合格选手', '面试新手', '面试小白'];
      const bestTitle = titlePriority.find(t => newTitles.includes(t)) || '面试小白';
      profile.title = bestTitle;
      app.setUserProfile(profile);
      this.setData({ unlockedTitle: newlyUnlocked[0] });
      wx.showToast({ title: '解锁称号：' + newlyUnlocked[0], icon: 'none', duration: 2000 });
    }
  },

  onUnlock() {
    if (this.data.isVip) {
      wx.showToast({ title: '已是会员', icon: 'none' });
      return;
    }
    this.setData({ showPayment: true });
  },

  onClosePayment() {
    this.setData({ showPayment: false });
  },

  onShare() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  onShareAppMessage() {
    const { score, gradeInfo } = this.data;
    return {
      title: `我的AI面试获得${gradeInfo.grade}评级！你也来试试？`,
      path: '/pages/index/index'
    };
  },

  onRetry() {
    wx.navigateTo({ url: '/pages/prepare/prepare' });
  }
});
