const app = getApp();

Page({
  data: {
    isVip: false,
    totalCount: 12,
    avgScore: 79,
    totalTime: '5h',
    abilities: [
      { name: '表达', score: 82, color: 'linear-gradient(90deg, #f59e0b, #d97706)' },
      { name: '逻辑', score: 75, color: 'linear-gradient(90deg, #3b82f6, #2563eb)' },
      { name: '专业', score: 68, color: 'linear-gradient(90deg, #10b981, #059669)' },
      { name: '应变', score: 80, color: 'linear-gradient(90deg, #8b5cf6, #7c3aed)' },
      { name: '礼仪', score: 90, color: 'linear-gradient(90deg, #ec4899, #db2777)' }
    ],
    historyList: []
  },

  onLoad() {
    this.refreshData();
  },

  onShow() {
    this.refreshData();
  },

  refreshData() {
    this.setData({ isVip: app.globalData.isVip });

    const history = app.globalData.interviewHistory;
    if (history && history.length > 0) {
      const scores = history.map(h => h.score);
      this.setData({
        historyList: history,
        totalCount: history.length,
        avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      });
    } else {
      // 演示数据
      this.setData({
        historyList: [
          { id: 1, title: '互联网产品经理', date: '6月29日', time: '14:32', difficulty: '进阶', mode: '语音', score: 87, icon: '💼', color: 'job' },
          { id: 2, title: '计算机专业复试', date: '6月28日', time: '09:15', difficulty: '基础', mode: '文字', score: 76, icon: '📚', color: 'kaoyan' },
          { id: 3, title: '公务员结构化面试', date: '6月27日', time: '20:00', difficulty: '挑战', mode: '语音', score: 81, icon: '🏛️', color: 'kaogong' },
          { id: 4, title: '快消管培生', date: '6月26日', time: '16:45', difficulty: '基础', mode: '语音', score: 72, icon: '💼', color: 'job' },
          { id: 5, title: '金融投行', date: '6月25日', time: '10:30', difficulty: '挑战', mode: '文字', score: 78, icon: '💼', color: 'job' }
        ]
      });
    }
  },

  onMenuTap(e) {
    const menu = e.currentTarget.dataset.menu;
    switch (menu) {
      case 'favorites':
        wx.showToast({ title: '收藏题目功能开发中', icon: 'none' });
        break;
      case 'stats':
        wx.showToast({ title: '练习统计功能开发中', icon: 'none' });
        break;
      case 'settings':
        wx.showToast({ title: '设置功能开发中', icon: 'none' });
        break;
      case 'upgrade':
        wx.navigateTo({ url: '/pages/report/report' });
        break;
    }
  }
});
