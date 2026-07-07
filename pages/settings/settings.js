var app = getApp();

Page({
  data: {
    nickname: '面试达人',
    title: '面试小白',
    avatar: '👤',
    unlockedTitles: ['面试小白'],
    greetingMode: 'title', // 'nickname' | 'title'
    voiceEnabled: true,
    notificationEnabled: true
  },

  onLoad() {
    this.refreshData();
  },

  onShow: function() {
    this.refreshData();
  },

  refreshData: function() {
    var profile = app.getUserProfile();
    var titles = app.getUnlockedTitles();
    this.setData({
      nickname: profile.nickname,
      title: profile.title,
      avatar: profile.avatar,
      unlockedTitles: titles,
      greetingMode: profile.greetingMode || 'title'
    });
  },

  // 修改昵称
  onChangeNickname: function() {
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入新昵称',
      success: function(res) {
        if (res.confirm && res.content) {
          var profile = app.getUserProfile();
          profile.nickname = res.content;
          app.setUserProfile(profile);
          this.setData({ nickname: res.content });
          wx.showToast({ title: '修改成功', icon: 'success' });
        }
      }
    });
  },

  // 选择称号
  onSelectTitle: function() {
    var titles = this.data.unlockedTitles;
    wx.showActionSheetfunction({
      itemList: titles,
      success: function(res) {
        var selected = titles[res.tapIndex];
        var profile = app.getUserProfile();
        profile.title = selected;
        app.setUserProfile(profile);
        this.setData({ title: selected });
        wx.showToast({ title: '称号已更新', icon: 'success' });
      }
    });
  },

  // 切换问候语模式
  onToggleGreeting: function(e) {
    var mode = e.detail.value ? 'title' : 'nickname';
    var profile = app.getUserProfile();
    profile.greetingMode = mode;
    app.setUserProfile(profile);
    this.setData({ greetingMode: mode });
  },

  onToggleVoice: function(e) {
    this.setData({ voiceEnabled: e.detail.value });
  },

  onToggleNotification: function(e) {
    this.setData({ notificationEnabled: e.detail.value });
  },

  onClearCache: function() {
    wx.showModal({
      title: '确认清除',
      content: '将清除所有本地缓存数据',
      success: function(res) {
        if (res.confirm) {
          wx.clearStorage();
          wx.showToast({ title: '已清除', icon: 'success' });
          this.refreshData();
        }
      }
    });
  },

  onAbout: function() {
    wx.showModal({
      title: '关于',
      content: 'AI面霸大闯关 v1.0\nAI驱动的面试模拟练习工具',
      showCancel: false
    });
  }
});
