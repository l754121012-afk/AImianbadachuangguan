const app = getApp();

Page({
  data: {
    favorites: []
  },

  onLoad() {
    this.loadFavorites();
  },

  onShow() {
    this.loadFavorites();
  },

  loadFavorites() {
    const favorites = app.getFavorites();
    this.setData({ favorites });
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
    app.removeFavorite(id);
    this.loadFavorites();
    wx.showToast({ title: '已取消收藏', icon: 'none' });
  }
});
