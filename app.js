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

  onLaunch: function() {
    console.log('AI面霸大闯关 启动');
    this._loadFromStorage();
  },

  _loadFromStorage: function() {
    var freeCount = wx.getStorageSync('freeCount');
    if (freeCount !== '') this.globalData.freeCount = freeCount;
    var isVip = wx.getStorageSync('isVip');
    if (isVip !== '') this.globalData.isVip = isVip;
    var history = wx.getStorageSync('interviewHistory');
    if (history) this.globalData.interviewHistory = history;
  },

  getUserProfile: function() {
    var profile = wx.getStorageSync('userProfile');
    return profile || {
      nickname: '面试达人',
      title: '面试小白',
      avatar: '👤',
      greetingMode: 'title'
    };
  },

  setUserProfile: function(profile) {
    wx.setStorageSync('userProfile', profile);
  },

  getInterviewProgress: function() {
    return wx.getStorageSync('interviewProgress') || null;
  },

  setInterviewProgress: function(progress) {
    wx.setStorageSync('interviewProgress', progress);
  },

  clearInterviewProgress: function() {
    wx.removeStorageSync('interviewProgress');
  },

  getFavorites: function() {
    return wx.getStorageSync('favorites') || [];
  },

  setFavorites: function(favorites) {
    wx.setStorageSync('favorites', favorites);
  },

  addFavorite: function(item) {
    var favorites = this.getFavorites();
    var exists = false;
    for (var i = 0; i < favorites.length; i++) {
      if (favorites[i].id === item.id) { exists = true; break; }
    }
    if (!exists) {
      favorites.unshift(item);
      this.setFavorites(favorites);
    }
  },

  removeFavorite: function(id) {
    var allFavs = this.getFavorites();
    var favorites = [];
    for (var i = 0; i < allFavs.length; i++) {
      if (allFavs[i].id !== id) favorites.push(allFavs[i]);
    }
    this.setFavorites(favorites);
  },

  getUnlockedTitles: function() {
    return wx.getStorageSync('unlockedTitles') || ['面试小白'];
  },

  setUnlockedTitles: function(titles) {
    wx.setStorageSync('unlockedTitles', titles);
  },

  calculateTitles: function(stats) {
    var titles = this.getUnlockedTitles();
    var totalCount = stats.totalCount;
    var avgScore = stats.avgScore;
    var abilities = stats.abilities;

    var addTitle = function(title) {
      for (var i = 0; i < titles.length; i++) {
        if (titles[i] === title) return;
      }
      titles.push(title);
    };

    if (totalCount >= 1) addTitle('面试新手');
    if (totalCount >= 5) addTitle('面试达人');
    if (totalCount >= 10) addTitle('面霸');
    if (totalCount >= 20) addTitle('面神');
    if (avgScore >= 70) addTitle('合格选手');
    if (avgScore >= 80) addTitle('优秀选手');
    if (avgScore >= 90) addTitle('顶尖高手');
    if (abilities) {
      var abilityMap = {};
      for (var ai = 0; ai < abilities.length; ai++) {
        abilityMap[abilities[ai].name] = abilities[ai].score;
      }
      if (abilityMap['表达'] >= 85) addTitle('表达之星');
      if (abilityMap['逻辑'] >= 85) addTitle('逻辑之王');
      if (abilityMap['专业'] >= 85) addTitle('专业精英');
      if (abilityMap['应变'] >= 85) addTitle('应变大师');
      if (abilityMap['礼仪'] >= 85) addTitle('礼仪典范');
      var all80 = true;
      for (var aj = 0; aj < abilities.length; aj++) {
        if (abilities[aj].score < 80) { all80 = false; break; }
      }
      if (all80) addTitle('全能选手');
    }

    this.setUnlockedTitles(titles);
    return titles;
  },

  addInterviewHistory: function(record) {
    var history = this.globalData.interviewHistory;
    history.unshift(record);
    if (history.length > 50) history.pop();
    this.globalData.interviewHistory = history;
    wx.setStorageSync('interviewHistory', history);
  },

  useFreeCount: function() {
    if (this.globalData.freeCount > 0) {
      this.globalData.freeCount--;
      wx.setStorageSync('freeCount', this.globalData.freeCount);
      return true;
    }
    return false;
  },

  canStartInterview: function() {
    return this.globalData.freeCount > 0 || this.globalData.isVip;
  }
});