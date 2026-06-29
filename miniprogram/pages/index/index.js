const app = getApp();

Page({
  data: {
    freeCount: 3,
    isVip: false,
    scenes: [
      { id: 'job', name: '求职面试', desc: '互联网 / 金融 / 制造 · 校招/实习', icon: '💼', color: 'job' },
      { id: 'kaoyan', name: '考研复试', desc: '理工 / 文史 / 经管 / 法学', icon: '🎓', color: 'kaoyan' },
      { id: 'kaogong', name: '考公面试', desc: '国考 / 省考 / 事业编 · 结构化', icon: '🏛️', color: 'kaogong' }
    ]
  },

  onLoad() {
    this.setData({
      freeCount: app.globalData.freeCount,
      isVip: app.globalData.isVip
    });
  },

  onShow() {
    this.setData({
      freeCount: app.globalData.freeCount,
      isVip: app.globalData.isVip
    });
  },

  onSelectScene(e) {
    const scene = e.currentTarget.dataset.scene;
    app.globalData.currentScene = scene;
    wx.navigateTo({
      url: '/pages/prepare/prepare'
    });
  },

  onGoHistory() {
    wx.showToast({ title: '历史记录功能开发中', icon: 'none' });
  }
});
