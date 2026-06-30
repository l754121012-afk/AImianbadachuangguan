Page({
  data: {
    favorites: [
      { id: 1, title: '自我介绍', question: '请做一个简短的自我介绍', scene: '求职面试', date: '6月29日' },
      { id: 2, title: '项目经历', question: '介绍最近的项目经历和困难', scene: '求职面试', date: '6月29日' },
      { id: 3, title: '职业规划', question: '你的职业规划是什么？', scene: '求职面试', date: '6月28日' }
    ]
  },

  onTapItem(e) {
    const item = e.currentTarget.dataset.item;
    wx.showModal({
      title: item.title,
      content: item.question,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  onRemove(e) {
    const id = e.currentTarget.dataset.id;
    const favorites = this.data.favorites.filter(f => f.id !== id);
    this.setData({ favorites });
    wx.showToast({ title: '已取消收藏', icon: 'none' });
  }
});
