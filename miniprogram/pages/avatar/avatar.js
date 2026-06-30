const app = getApp();

Page({
  data: {
    presetAvatars: ['👤', '😎', '🤓', '🦁', '🦊', '🐼', '🐯', '🐲', '👑', '⚡', '🔥', '💎', '🎯', '🚀', '🌟', '💪'],
    selectedAvatar: ''
  },

  onLoad() {
    const profile = app.getUserProfile();
    this.setData({ selectedAvatar: profile.avatar || '👤' });
  },

  onSelectPreset(e) {
    const avatar = e.currentTarget.dataset.avatar;
    this.setAvatar(avatar);
  },

  onChooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempPath = res.tempFiles[0].tempFilePath;
        this.setAvatar(tempPath);
      }
    });
  },

  setAvatar(avatar) {
    const profile = app.getUserProfile();
    profile.avatar = avatar;
    app.setUserProfile(profile);
    this.setData({ selectedAvatar: avatar });
    wx.showToast({ title: '头像已更新', icon: 'success' });
    // 通知上一页刷新
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage && prevPage.refreshData) {
      prevPage.refreshData();
    }
  }
});
