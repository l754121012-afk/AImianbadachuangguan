var app = getApp();

Page({
  data: {
    favorites: []
  },

  onLoad() {
    this.loadFavorites();
  },

  onShow: function() {
    this.loadFavorites();
  },

  loadFavorites: function() {
    var favorites = app.getFavorites();
    this.setData({ favorites: favorites });
  },

  onTapItem: function(e) {
    var item = e.currentTarget.dataset.item;
    wx.showModal({
      title: item.title,
      content: item.question,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  onRemove: function(e) {
    var id = e.currentTarget.dataset.id;
    app.removeFavorite(id);
    this.loadFavorites();
    wx.showToast({ title: '已取消收藏', icon: 'none' });
  }
});
