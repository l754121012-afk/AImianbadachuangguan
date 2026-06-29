App({
  globalData: {
    userInfo: null,
    freeCount: 3,
    isVip: false,
    currentScene: '',
    currentDifficulty: '基础',
    currentMode: 'voice',
    interviewHistory: []
  },

  onLaunch() {
    console.log('AI面霸大闯关 启动');
    // 从本地存储恢复数据
    const freeCount = wx.getStorageSync('freeCount');
    if (freeCount !== '') {
      this.globalData.freeCount = freeCount;
    }
    const isVip = wx.getStorageSync('isVip');
    if (isVip !== '') {
      this.globalData.isVip = isVip;
    }
  },

  onShow() {
    // 应用显示时触发
  },

  // 减少免费次数
  useFreeCount() {
    if (this.globalData.freeCount > 0) {
      this.globalData.freeCount--;
      wx.setStorageSync('freeCount', this.globalData.freeCount);
      return true;
    }
    return false;
  },

  // 检查是否可以开始面试
  canStartInterview() {
    return this.globalData.freeCount > 0 || this.globalData.isVip;
  }
});
