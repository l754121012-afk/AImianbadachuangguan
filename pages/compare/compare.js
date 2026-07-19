var app = getApp();

Page({
  data: {
    selectedTab: 0,
    tabs: ['权益对比', '首页效果', '报告效果', '记录效果'],
    // 四大套餐关键差异特征
    diffFeatures: [
      { label: '每日面试次数', values: ['3次/天', '5次/7天', '无限次', '无限次'], highlights: [false, true, true, true] },
      { label: '五维能力分析', values: ['模糊预览', '完整分析', '完整分析', '完整分析'], highlights: [false, true, true, true] },
      { label: 'AI综合点评', values: ['✗', '✗', '✓', '✓'], highlights: [false, false, true, true] },
      { label: 'AI深度分析', values: ['✗', '✗', '✗', '✓'], highlights: [false, false, false, true] },
      { label: '个性化提升建议', values: ['✗', '✗', '✗', '✓'], highlights: [false, false, false, true] },
      { label: '历史趋势对比', values: ['✗', '✗', '✗', '✓'], highlights: [false, false, false, true] },
      { label: '语音语调分析', values: ['✗', '✗', '✗', '✓'], highlights: [false, false, false, true] },
      { label: '广告', values: ['有', '无', '无', '无'], highlights: [false, true, true, true] }
    ],
    tierNames: ['免费版', '单次包', '冲刺包', 'Pro年卡'],
    tierColors: ['gray', 'gray', 'gold', 'pro']
  },

  onLoad: function() {},

  onTabTap: function(e) {
    var idx = e.currentTarget.dataset.index;
    this.setData({ selectedTab: idx });
  }
});
