var app = getApp();

Page({
  data: {
    selectedModalTierIndex: 0,
    showPayment: false,
    selectedTierIndex: 0,
    tiers: [
      {
        id: 'free', name: '免费版', price: '0', unit: '永久',
        badge: '默认', badgeClass: 'badge-gray',
        desc: '入门体验，感受AI面试',
        summaryRows: [
          { label: '每日3次免费面试', check: true },
          { label: '全部三大场景', check: true },
          { label: 'C-S基础评分', check: true },
          { label: '五维分析(模糊预览)', check: false },
          { label: 'AI深度分析', check: false },
          { label: '有广告', check: false }
        ]
      },
      {
        id: 'single', name: '单次体验包', price: '9.99', unit: '7天',
        badge: '入门', badgeClass: 'badge-gray',
        desc: '短期体验VIP全部功能',
        summaryRows: [
          { label: '5次完整面试', check: true },
          { label: '全部三大场景', check: true },
          { label: '完整五维分析', check: true },
          { label: '去广告', check: true },
          { label: 'AI深度分析', check: false },
          { label: '历史趋势', check: false }
        ]
      },
      {
        id: 'season', name: '求职季冲刺包', price: '29.9', unit: '90天',
        badge: '推荐', badgeClass: 'badge-gold', recommended: true,
        desc: '无限刷题，覆盖整个面试季',
        summaryRows: [
          { label: '无限次面试', check: true },
          { label: '全部三大场景', check: true },
          { label: '完整五维+AI点评', check: true },
          { label: '历史记录回放', check: true },
          { label: '去广告+专属称号', check: true },
          { label: 'Pro高级分析', check: false }
        ],
        highlight: '性价比最高 · 覆盖完整面试季'
      },
      {
        id: 'year', name: 'Pro 年卡', price: '59.9', unit: '365天',
        badge: '旗舰', badgeClass: 'badge-gray',
        desc: 'AI教练全年陪你上岸',
        summaryRows: [
          { label: '冲刺包全部权益', check: true },
          { label: 'AI深度分析+提升建议', check: true },
          { label: '历史趋势+进步曲线', check: true },
          { label: '语音语调分析', check: true },
          { label: '面试报告导出', check: true },
          { label: '优先使用新功能', check: true }
        ],
        highlight: '全部AI增值能力 · 一年畅用'
      }
    ]
  },

  onLoad: function() {},

  onBuy: function(e) {
    var pageIdx = e.currentTarget.dataset.index;
    // 页面有4个套餐(免费版+3个付费版)，弹窗只有3个付费版
    // 页面索引1(单次体验包)→弹窗索引0, 2→1, 3→2
    var modalIdx = pageIdx > 0 ? pageIdx - 1 : 0;
    this.setData({ selectedTierIndex: pageIdx, selectedModalTierIndex: modalIdx, showPayment: true }, function() {
      // 双保险：selectComponent 直接设置组件选中状态
      var modal = this.selectComponent('#paymentModal');
      if (modal && modal.data.selectedIndex !== modalIdx) {
        modal.setData({
          selectedIndex: modalIdx,
          currentBenefits: modal.data.prices[modalIdx].benefits
        });
      }
    });
  },

  onClosePayment: function() {
    this.setData({ showPayment: false });
  },

  onVipChanged: function() {
    this.setData({ showPayment: false });
    wx.showToast({ title: '升级成功！', icon: 'success' });
  },

  onCompare: function() {
    wx.navigateTo({ url: '/pages/compare/compare' });
  }
});
