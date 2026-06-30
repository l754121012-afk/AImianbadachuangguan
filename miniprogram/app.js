App({
  globalData: {
    userInfo: null,
    freeCount: 3,
    isVip: false,
    currentScene: '',
    currentCategory: '',
    currentJob: '',
    currentDifficulty: '基础',
    currentMode: 'voice',
    interviewHistory: []
  },

  onLaunch() {
    console.log('AI面霸大闯关 启动');
    this._loadFromStorage();
  },

  // ===== 本地存储加载 =====
  _loadFromStorage() {
    const freeCount = wx.getStorageSync('freeCount');
    if (freeCount !== '') this.globalData.freeCount = freeCount;

    const isVip = wx.getStorageSync('isVip');
    if (isVip !== '') this.globalData.isVip = isVip;

    const history = wx.getStorageSync('interviewHistory');
    if (history) this.globalData.interviewHistory = history;
  },

  // ===== 用户资料 =====
  getUserProfile() {
    const profile = wx.getStorageSync('userProfile');
    return profile || {
      nickname: '面试达人',
      title: '面试小白',
      avatar: '👤',
      greetingMode: 'title' // 'nickname' | 'title'
    };
  },

  setUserProfile(profile) {
    wx.setStorageSync('userProfile', profile);
  },

  // ===== 面试进度 =====
  getInterviewProgress() {
    return wx.getStorageSync('interviewProgress') || null;
  },

  setInterviewProgress(progress) {
    wx.setStorageSync('interviewProgress', progress);
  },

  clearInterviewProgress() {
    wx.removeStorageSync('interviewProgress');
  },

  // ===== 收藏题目 =====
  getFavorites() {
    return wx.getStorageSync('favorites') || [];
  },

  setFavorites(favorites) {
    wx.setStorageSync('favorites', favorites);
  },

  addFavorite(item) {
    const favorites = this.getFavorites();
    if (!favorites.find(f => f.id === item.id)) {
      favorites.unshift(item);
      this.setFavorites(favorites);
    }
  },

  removeFavorite(id) {
    const favorites = this.getFavorites().filter(f => f.id !== id);
    this.setFavorites(favorites);
  },

  // ===== 称号系统 =====
  getUnlockedTitles() {
    return wx.getStorageSync('unlockedTitles') || ['面试小白'];
  },

  setUnlockedTitles(titles) {
    wx.setStorageSync('unlockedTitles', titles);
  },

  // 计算当前应解锁的称号
  calculateTitles(stats) {
    const titles = new Set(this.getUnlockedTitles());
    const { totalCount, avgScore, abilities } = stats;

    if (totalCount >= 1) titles.add('面试新手');
    if (totalCount >= 5) titles.add('面试达人');
    if (totalCount >= 10) titles.add('面霸');
    if (totalCount >= 20) titles.add('面神');
    if (avgScore >= 70) titles.add('合格选手');
    if (avgScore >= 80) titles.add('优秀选手');
    if (avgScore >= 90) titles.add('顶尖高手');
    if (abilities) {
      const abilityMap = {};
      abilities.forEach(a => { abilityMap[a.name] = a.score; });
      if (abilityMap['表达'] >= 85) titles.add('表达之星');
      if (abilityMap['逻辑'] >= 85) titles.add('逻辑之王');
      if (abilityMap['专业'] >= 85) titles.add('专业精英');
      if (abilityMap['应变'] >= 85) titles.add('应变大师');
      if (abilityMap['礼仪'] >= 85) titles.add('礼仪典范');
      if (abilities.every(a => a.score >= 80)) titles.add('全能选手');
    }

    const titleList = Array.from(titles);
    this.setUnlockedTitles(titleList);
    return titleList;
  },

  // ===== 历史记录 =====
  addInterviewHistory(record) {
    const history = this.globalData.interviewHistory;
    history.unshift(record);
    if (history.length > 50) history.pop();
    this.globalData.interviewHistory = history;
    wx.setStorageSync('interviewHistory', history);
  },

  // ===== 免费次数 =====
  useFreeCount() {
    if (this.globalData.freeCount > 0) {
      this.globalData.freeCount--;
      wx.setStorageSync('freeCount', this.globalData.freeCount);
      return true;
    }
    return false;
  },

  canStartInterview() {
    return this.globalData.freeCount > 0 || this.globalData.isVip;
  }
});
