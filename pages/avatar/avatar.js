var app = getApp();

Page({
  data: {
    presetAvatars: ['👤', '😎', '🤓', '🦁', '🦊', '🐼', '🐯', '🐲', '👑', '⚡', '🔥', '💎', '🎯', '🚀', '🌟', '💪'],
    selectedAvatar: ''
  },

  onLoad: function() {
    var profile = app.getUserProfile();
    this.setData({ selectedAvatar: profile.avatar || '👤' });
  },

  onSelectPreset: function(e) {
    var avatar = e.currentTarget.dataset.avatar;
    this.setAvatar(avatar);
  },

  onChooseImage: function() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        var tempPath = res.tempFiles[0].tempFilePath;
        this.setAvatar(tempPath);
      }
    });
  },

  setAvatar: function(avatar) {
    var profile = app.getUserProfile();
    profile.avatar = avatar;
    app.setUserProfile(profile);
    this.setData({ selectedAvatar: avatar });
    wx.showToast({ title: '头像已更新', icon: 'success' });
    // 通知上一页刷新
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.refreshData) {
      prevPage.refreshData();
    }
  }
});
