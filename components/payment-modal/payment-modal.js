Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },

  data: {
    selectedIndex: 1,
    prices: [
      { id: 'single', name: '单次体验', desc: '1次完整语音模拟 + 报告', price: '4.99' },
      { id: 'season', name: '求职季套餐', desc: '无限次模拟 + 完整报告 + 题库', price: '29.9', popular: true },
      { id: 'year', name: 'Pro 年卡', desc: '全部权益 + 面试技巧课程', price: '59.9' }
    ],
    features: [
      '无限次AI语音面试',
      '完整五维评分报告',
      '个性化岗位题库',
      '历史记录回放',
      '去除所有广告'
    ]
  },

  methods: {
    onSelect(e) {
      this.setData({ selectedIndex: e.currentTarget.dataset.index });
    },

    onClose: function() {
      this.triggerEvent('close');
    },

    onPay: function() {
      var selected = this.data.prices[this.data.selectedIndex];
      wx.showModal({
        title: '确认支付',
        content: '支付 ¥' + selected.price + ' 购买 ' + selected.name,
        confirmText: '立即支付',
        success: function(res) {
          if (res.confirm) {
            // TODO: 调用微信支付API
            wx.showToast({ title: '支付成功', icon: 'success' });
            this.triggerEvent('close');
            getApp().globalData.isVip = true;
            wx.setStorageSync('isVip', true);
          }
        }
      });
    }
  }
});
