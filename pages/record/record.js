var app = getApp();

Page({
  data: {
    isVip: false,
    vipLevelName: '免费版',
    titleClass: 'title-gray',
    vipBadgeClass: 'vip-badge-gray',
    showPayment: false,
    nickname: '面试达人',
    title: '面试小白',
    avatar: '👤',
    totalCount: 0,
    avgScore: 0,
    totalTime: '0h',
    abilities: [
      { name: '表达', score: 0, color: 'linear-gradient(90deg, #f59e0b, #d97706)' },
      { name: '逻辑', score: 0, color: 'linear-gradient(90deg, #3b82f6, #2563eb)' },
      { name: '专业', score: 0, color: 'linear-gradient(90deg, #10b981, #059669)' },
      { name: '应变', score: 0, color: 'linear-gradient(90deg, #8b5cf6, #7c3aed)' },
      { name: '礼仪', score: 0, color: 'linear-gradient(90deg, #ec4899, #db2777)' }
    ],
    historyList: []
  },

  onLoad: function() {
    this.refreshData();
  },

  onShow: function() {
    this.refreshData();
  },

  refreshData: function() {
    var profile = app.getUserProfile();
    var history = app.globalData.interviewHistory;

    var vipLevel = app.getVipLevel ? app.getVipLevel() : 0;
    var userTitle = profile.title || '面试小白';
    var titleClass = app.getTitleClass ? app.getTitleClass(userTitle) : 'title-gray';
    var vipBadgeClass = 'vip-badge-gray';
    if (vipLevel >= 3) { vipBadgeClass = 'vip-badge-pro'; }
    else if (vipLevel >= 2) { vipBadgeClass = 'vip-badge-gold'; }
    else if (vipLevel >= 1) { vipBadgeClass = 'vip-badge-blue'; }

    this.setData({
      isVip: app.globalData.isVip,
      vipLevelName: app.getVipLevelName ? app.getVipLevelName() : '免费版',
      titleClass: titleClass,
      vipBadgeClass: vipBadgeClass,
      nickname: profile.nickname,
      title: userTitle,
      avatar: profile.avatar
    });

    if (history && history.length > 0) {
      var scores = []; for (var si = 0; si < history.length; si++) scores.push(history[si].score);
      var totalCount = history.length;
      var sum = 0; for (var si2 = 0; si2 < scores.length; si2++) sum += scores[si2]; var avgScore = Math.round(sum / scores.length);

      // 模拟能力数据（后续从真实评分计算）
      var baseScores = [82, 75, 68, 80, 90];
      var abilities = [
        { name: '表达', score: Math.min(100, baseScores[0] + totalCount * 2), color: 'linear-gradient(90deg, #f59e0b, #d97706)' },
        { name: '逻辑', score: Math.min(100, baseScores[1] + totalCount * 2), color: 'linear-gradient(90deg, #3b82f6, #2563eb)' },
        { name: '专业', score: Math.min(100, baseScores[2] + totalCount * 2), color: 'linear-gradient(90deg, #10b981, #059669)' },
        { name: '应变', score: Math.min(100, baseScores[3] + totalCount * 2), color: 'linear-gradient(90deg, #8b5cf6, #7c3aed)' },
        { name: '礼仪', score: Math.min(100, baseScores[4] + totalCount * 2), color: 'linear-gradient(90deg, #ec4899, #db2777)' }
      ];

      this.setData({
        historyList: history.slice(0, 5),
        totalCount,
        avgScore,
        totalTime: Math.round(totalCount * 0.5) + 'h',
        abilities
      });
    } else {
      // 演示数据
      this.setData({
        historyList: [
          { id: 1, title: '互联网产品经理', date: '6月29日', time: '14:32', difficulty: '进阶', mode: '语音', score: 87, icon: '💼', color: 'job' },
          { id: 2, title: '计算机专业复试', date: '6月28日', time: '09:15', difficulty: '基础', mode: '文字', score: 76, icon: '📚', color: 'kaoyan' },
          { id: 3, title: '公务员结构化面试', date: '6月27日', time: '20:00', difficulty: '挑战', mode: '语音', score: 81, icon: '🏛️', color: 'kaogong' }
        ],
        totalCount: 12,
        avgScore: 79,
        totalTime: '5h',
        abilities: [
          { name: '表达', score: 82, color: 'linear-gradient(90deg, #f59e0b, #d97706)' },
          { name: '逻辑', score: 75, color: 'linear-gradient(90deg, #3b82f6, #2563eb)' },
          { name: '专业', score: 68, color: 'linear-gradient(90deg, #10b981, #059669)' },
          { name: '应变', score: 80, color: 'linear-gradient(90deg, #8b5cf6, #7c3aed)' },
          { name: '礼仪', score: 90, color: 'linear-gradient(90deg, #ec4899, #db2777)' }
        ]
      });
    }
  },

  // 点击头像更换
  onTapAvatar: function() {
    wx.navigateTo({ url: '/pages/avatar/avatar' });
  },

  // 点击历史记录项
  onTapHistory: function(e) {
    var score = e.currentTarget.dataset.score;
    var title = e.currentTarget.dataset.title;
    wx.navigateTo({
      url: '/pages/report/report?score=' + score + '&title=' + encodeURIComponent(title)
    });
  },

  onUpgrade: function() {
    wx.navigateTo({ url: '/pages/benefits/benefits' });
  },

  onMenuTap: function(e) {
    var menu = e.currentTarget.dataset.menu;
    switch (menu) {
      case 'favorites':
        wx.navigateTo({ url: '/pages/favorites/favorites' });
        break;
      case 'stats':
        wx.showToast({ title: '练习统计功能开发中', icon: 'none' });
        break;
      case 'settings':
        wx.navigateTo({ url: '/pages/settings/settings' });
        break;
      case 'upgrade':
        wx.navigateTo({ url: '/pages/benefits/benefits' });
        break;
    }
  }
});
