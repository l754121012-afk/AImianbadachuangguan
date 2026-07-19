Component({ 
  properties: { 
    show: { type: Boolean, value: false } 
  }, 

  data: { 
    selectedIndex: 1, 
    prices: [ 
      { id: "single", name: "单次体验包", price: "9.99", desc: "尝鲜体验，感受AI面试", 
        benefits: ["5次完整AI面试", "完整五维评分报告", "7天有效期内使用"], 
        days: 7, interviews: 5, level: 1 }, 
      { id: "season", name: "求职季冲刺包", price: "29.9", desc: "面试季定心丸，无限刷题", popular: true, 
        benefits: ["无限次AI面试", "完整五维评分+AI点评", "历史记录回放", "去除所有广告", "专属面试称号"], 
        days: 90, interviews: -1, level: 2 }, 
      { id: "year", name: "Pro 年卡", price: "59.9", desc: "全年无忧，AI教练陪你上岸", 
        benefits: ["冲刺包全部权益", "AI深度分析+提升建议", "历史趋势对比+进步曲线", "语音语调分析", "面试报告导出", "优先使用新功能"], 
        days: 365, interviews: -1, level: 3 } 
    ], 
    currentBenefits: [] 
  }, 

  lifetimes: { 
    attached: function() { 
      this.setData({ currentBenefits: this.data.prices[1].benefits }); 
    } 
  }, 

  methods: { 
    onSelect: function(e) { 
      var idx = e.currentTarget.dataset.index; 
      this.setData({ 
        selectedIndex: idx, 
        currentBenefits: this.data.prices[idx].benefits 
      }); 
    }, 

    onClose: function() { 
      this.triggerEvent("close"); 
    }, 

    stopPropagation: function() {},

    onPreviewBenefits: function() {
      wx.navigateTo({ url: '/pages/compare/compare' });
    }, 

    onPay: function() { 
      var that = this; 
      var selected = this.data.prices[this.data.selectedIndex]; 
      wx.showModal({ 
        title: "确认支付", 
        content: "支付 ¥" + selected.price + " 购买 " + selected.name + "（" + selected.days + "天有效）", 
        confirmText: "立即支付", 
        success: function(res) { 
          if (res.confirm) { 
            // 模拟支付成功，写入会员信息 
            var app = getApp(); 
            var now = Date.now(); 
            var expireTime = now + selected.days * 24 * 60 * 60 * 1000; 
            app.globalData.isVip = true; 
            app.globalData.vipLevel = selected.level; 
            app.globalData.vipExpireTime = expireTime; 
            app.globalData.vipInterviews = selected.interviews; 
            app.globalData.vipUsedInterviews = 0; 
            wx.setStorageSync("isVip", true); 
            wx.setStorageSync("vipLevel", selected.level); 
            wx.setStorageSync("vipExpireTime", expireTime); 
            wx.setStorageSync("vipInterviews", selected.interviews); 
            wx.setStorageSync("vipUsedInterviews", 0); 
            wx.showToast({ title: "支付成功！已开通", icon: "success", duration: 2000 }); 
            that.triggerEvent("close"); 
            // 通知页面刷新 
            var pages = getCurrentPages(); 
            if (pages.length > 0) { 
              var page = pages[pages.length - 1]; 
              if (page.onVipChanged) { page.onVipChanged(); } 
            } 
          } 
        } 
      }); 
    } 
  } 
}); 
