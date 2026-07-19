var app = getApp();

Page({
  data: {
    selectedTab: 0,
    tabs: ['权益对比', '首页效果', '报告效果', '记录效果'],
    tiers: [
      {
        id: 'free', name: '免费版', price: '0', unit: '永久',
        badge: '默认', badgeClass: 'badge-gray',
        desc: '入门体验，感受AI面试',
        rows: [
          { label: '每日免费次数', check: true },
          { label: '全部三大场景', check: true },
          { label: 'C-S基础评分', check: true },
          { label: '五维分析(模糊预览)', check: false },
          { label: 'AI深度点评', check: false },
          { label: '广告', check: false, text: '有广告' }
        ]
      },
      {
        id: 'single', name: '单次体验包', price: '9.99', unit: '7天',
        badge: '入门', badgeClass: 'badge-gray',
        desc: '短期体验VIP全部功能',
        rows: [
          { label: '5次完整面试', check: true },
          { label: '全部三大场景', check: true },
          { label: '完整五维分析', check: true },
          { label: '去广告', check: true },
          { label: 'AI深度点评', check: false },
          { label: '历史趋势', check: false }
        ]
      },
      {
        id: 'season', name: '求职季冲刺包', price: '29.9', unit: '90天',
        badge: '推荐', badgeClass: 'badge-gold', recommended: true,
        desc: '无限刷题，覆盖整个面试季',
        rows: [
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
        rows: [
          { label: '冲刺包全部权益', check: true },
          { label: 'AI深度分析+提升建议', check: true },
          { label: '历史趋势+进步曲线', check: true },
          { label: '语音语调分析', check: true },
          { label: '面试报告导出', check: true },
          { label: '优先使用新功能', check: true }
        ],
        highlight: '全部AI增值能力 · 一年畅用'
      }
    ],
    pages: [
      {
        name: '首页',
        icon: '🏠',
        desc: '全部场景开放，VIP身份标识',
        details: [
          { tier: '免费版', text: '全部场景卡片可见可点击，显示"💎 免费版"灰色徽章', cls: 'free' },
          { tier: '冲刺包', text: '显示"💎 求职季冲刺包"金色徽章，无场景限制', cls: 'vip' },
          { tier: 'Pro年卡', text: '金色Pro徽章，"AI教练"快捷入口直达深度分析页', cls: 'pro' }
        ]
      },
      {
        name: '准备页',
        icon: '🎯',
        desc: '次数展示 + 升级入口',
        details: [
          { tier: '免费版', text: '显示剩余次数，"看广告+1"按钮，"去升级"入口', cls: 'free' },
          { tier: '冲刺包', text: '显示"无限次"，底部"续费升级"', cls: 'vip' },
          { tier: 'Pro年卡', text: '显示"无限次"，底部"AI教练分析"入口', cls: 'pro' }
        ]
      },
      {
        name: '报告页',
        icon: '📋',
        desc: '核心差异化战场',
        details: [
          { tier: '免费版', text: 'C-S评分 + 模糊五维预览 + 前2题可见', cls: 'free' },
          { tier: '冲刺包', text: '完整五维 + AI综合点评 + 全部题目反馈', cls: 'vip' },
          { tier: 'Pro年卡', text: 'AI深度分析 + 个性化提升建议 + 历史对比曲线 + 语音语调报告', cls: 'pro' }
        ]
      },
      {
        name: '记录页',
        icon: '📊',
        desc: '成长数据可视化',
        details: [
          { tier: '免费版', text: '基础能力雷达 + 练习记录', cls: 'free' },
          { tier: '冲刺包', text: '完整能力雷达 + 历史回放', cls: 'vip' },
          { tier: 'Pro年卡', text: '能力趋势曲线 + 进步热力图 + 弱项智能诊断 + 报告导出', cls: 'pro' }
        ]
      }
    ]
  },

  onLoad: function() {
    // page loaded
  },

  onTabTap: function(e) {
    var idx = e.currentTarget.dataset.index;
    this.setData({ selectedTab: idx });
  }
});