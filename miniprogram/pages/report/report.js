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
    fromUpgrade: false
  },

  onLoad(options) {
    // 接收参数
    let score = 87;
    let title = '综合评分';

    if (options.score) {
      score = parseInt(options.score);
    }
    if (options.title) {
      title = decodeURIComponent(options.title);
    }

    // 计算C-S等级
    const gradeInfo = scoreToGradeInfo(score);

    // 根据分数动态设置百分位
    const percentile = Math.min(95, Math.round(score * 0.9));

    // 如果是从升级入口进入，自动弹出付费弹窗
    const fromUpgrade = options.from === 'upgrade';

    this.setData({
      score,
      gradeInfo,
      percentile,
      interviewTitle: title,
      isVip: app.globalData.isVip,
      fromUpgrade
    });

    if (fromUpgrade && !app.globalData.isVip) {
      setTimeout(() => {
        this.setData({ showPayment: true });
      }, 500);
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
      path: '/pages/index/index',
      imageUrl: '/assets/share-poster.png'
    };
  },

  // 重新练习
  onRetry() {
    wx.navigateTo({ url: '/pages/prepare/prepare' });
  }
});
