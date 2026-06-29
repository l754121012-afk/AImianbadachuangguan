const app = getApp();

Page({
  data: {
    jobs: ['产品经理 - 互联网行业', 'Java开发 - 互联网行业', '前端开发 - 互联网行业', '运营专员 - 电商行业', '市场营销 - 快消行业', '财务会计 - 金融行业'],
    jobIndex: 0,
    difficulties: ['基础', '进阶', '挑战'],
    difficultyIndex: 0,
    modes: [
      { id: 'voice', name: '语音面试', sub: '真实模拟体验', icon: '🎙️', active: true },
      { id: 'text', name: '文字面试', sub: '快速练习模式', icon: '⌨️', active: false }
    ]
  },

  onLoad() {
    // 页面加载
  },

  onPickerChange(e) {
    this.setData({ jobIndex: e.detail.value });
  },

  onSelectDifficulty(e) {
    this.setData({ difficultyIndex: e.currentTarget.dataset.index });
  },

  onSelectMode(e) {
    const index = e.currentTarget.dataset.index;
    const modes = this.data.modes.map((m, i) => ({ ...m, active: i === index }));
    this.setData({ modes });
  },

  onStartInterview() {
    const { jobs, jobIndex, difficulties, difficultyIndex, modes } = this.data;
    app.globalData.currentDifficulty = difficulties[difficultyIndex];
    const activeMode = modes.find(m => m.active);
    app.globalData.currentMode = activeMode.id;

    if (!app.canStartInterview()) {
      wx.showModal({
        title: '次数已用完',
        content: '免费次数已用完，升级套餐可无限练习',
        confirmText: '去升级',
        cancelText: '看广告',
        success: (res) => {
          if (res.confirm) {
            // TODO: 打开付费弹窗
          } else if (res.cancel) {
            wx.showToast({ title: '广告播放中...', icon: 'none' });
          }
        }
      });
      return;
    }

    wx.navigateTo({ url: '/pages/interview/interview' });
  }
});
