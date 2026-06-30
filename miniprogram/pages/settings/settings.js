const app = getApp();

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

  onShow() {
    this.refreshData();
  },

  refreshData() {
    const profile = app.getUserProfile();
    const titles = app.getUnlockedTitles();
    this.setData({
      nickname: profile.nickname,
      title: profile.title,
      avatar: profile.avatar,
      unlockedTitles: titles,
      greetingMode: profile.greetingMode || 'title'
    });
  },

  // 修改昵称
  onChangeNickname() {
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入新昵称',
      success: (res) => {
        if (res.confirm && res.content) {
          const profile = app.getUserProfile();
          profile.nickname = res.content;
          app.setUserProfile(profile);
          this.setData({ nickname: res.content });
          wx.showToast({ title: '修改成功', icon: 'success' });
        }
      }
    });
  },

  // 选择称号
  onSelectTitle() {
    const titles = this.data.unlockedTitles;
    wx.showActionSheet({
      itemList: titles,
      success: (res) => {
        const selected = titles[res.tapIndex];
        const profile = app.getUserProfile();
        profile.title = selected;
        app.setUserProfile(profile);
        this.setData({ title: selected });
        wx.showToast({ title: '称号已更新', icon: 'success' });
      }
    });
  },

  // 切换问候语模式
  onToggleGreeting(e) {
    const mode = e.detail.value ? 'title' : 'nickname';
    const profile = app.getUserProfile();
    profile.greetingMode = mode;
    app.setUserProfile(profile);
    this.setData({ greetingMode: mode });
  },

  onToggleVoice(e) {
    this.setData({ voiceEnabled: e.detail.value });
  },

  onToggleNotification(e) {
    this.setData({ notificationEnabled: e.detail.value });
  },

  onClearCache() {
    wx.showModal({
      title: '确认清除',
      content: '将清除所有本地缓存数据',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorage();
          wx.showToast({ title: '已清除', icon: 'success' });
          this.refreshData();
        }
      }
    });
  },

  onAbout() {
    wx.showModal({
      title: '关于',
      content: 'AI面霸大闯关 v1.0\nAI驱动的面试模拟练习工具',
      showCancel: false
    });
  }
});
