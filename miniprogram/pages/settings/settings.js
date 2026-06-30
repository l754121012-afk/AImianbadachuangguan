Page({
  data: {
    nickname: '面试达人',
    voiceEnabled: true,
    notificationEnabled: true
  },

  onChangeNickname() {
    wx.showModal({
      title: '修改昵称',
      editable: true,
      placeholderText: '请输入新昵称',
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({ nickname: res.content });
          wx.showToast({ title: '修改成功', icon: 'success' });
        }
      }
    });
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
