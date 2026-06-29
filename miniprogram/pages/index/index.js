const app = getApp();

Page({
  data: {
    freeCount: 3,
    isVip: false,
    highScore: '--',
    greeting: '你好，面试达人',
    showSceneModal: false,
    currentModalScene: null,
    recentList: [],
    scenes: [
      {
        id: 'job', name: '求职面试', desc: '互联网、金融、快消等 12 个行业',
        icon: '💼', color: 'job', badge: '热门', badgeColor: 'badge-amber',
        categories: [
          { name: '互联网', icon: '💻', count: '68题' },
          { name: '金融', icon: '🏦', count: '45题' },
          { name: '快消', icon: '🛒', count: '32题' },
          { name: '制造业', icon: '🏭', count: '28题' },
          { name: '咨询', icon: '📊', count: '36题' },
          { name: '医疗', icon: '🏥', count: '24题' }
        ]
      },
      {
        id: 'kaoyan', name: '考研复试', desc: '专业课、英语口语、综合素质',
        icon: '📚', color: 'kaoyan', badge: '新增', badgeColor: 'badge-blue',
        categories: [
          { name: '理工', icon: '⚙️', count: '52题' },
          { name: '文史', icon: '📖', count: '38题' },
          { name: '经管', icon: '💹', count: '42题' },
          { name: '法学', icon: '⚖️', count: '30题' },
          { name: '教育', icon: '📝', count: '28题' },
          { name: '医学', icon: '🩺', count: '22题' }
        ]
      },
      {
        id: 'kaogong', name: '考公面试', desc: '结构化面试、无领导小组讨论',
        icon: '🏛️', color: 'kaogong', badge: '结构化', badgeColor: 'badge-green',
        categories: [
          { name: '国考', icon: '🏛️', count: '56题' },
          { name: '省考', icon: '🗺️', count: '48题' },
          { name: '事业编', icon: '📋', count: '36题' },
          { name: '军队文职', icon: '🎖️', count: '20题' },
          { name: '遴选', icon: '📑', count: '18题' },
          { name: '村官', icon: '🌾', count: '15题' }
        ]
      }
    ]
  },

  onLoad() {
    this.refreshData();
  },

  onShow() {
    this.refreshData();
  },

  refreshData() {
    this.setData({
      freeCount: app.globalData.freeCount,
      isVip: app.globalData.isVip
    });
    // 设置问候语
    const hour = new Date().getHours();
    let greeting = '你好';
    if (hour < 6) greeting = '夜深了';
    else if (hour < 12) greeting = '早安';
    else if (hour < 14) greeting = '午安';
    else if (hour < 18) greeting = '下午好';
    else greeting = '晚上好';
    this.setData({ greeting: greeting + '，面试达人' });

    // 模拟最近练习数据（后续接入云数据库）
    const history = app.globalData.interviewHistory;
    if (history && history.length > 0) {
      this.setData({
        recentList: history.slice(0, 3),
        highScore: Math.max(...history.map(h => h.score))
      });
    } else {
      // 演示数据
      this.setData({
        recentList: [
          { id: 1, title: '互联网产品经理', date: '6月29日', difficulty: '进阶', mode: '语音', score: 87, icon: '💼', color: 'job', scene: 'job' },
          { id: 2, title: '计算机专业复试', date: '6月28日', difficulty: '基础', mode: '文字', score: 76, icon: '📚', color: 'kaoyan', scene: 'kaoyan' },
          { id: 3, title: '公务员结构化面试', date: '6月27日', difficulty: '挑战', mode: '语音', score: 81, icon: '🏛️', color: 'kaogong', scene: 'kaogong' }
        ],
        highScore: 87
      });
    }
  },

  // 点击最近练习项（第一项=继续练习）
  onTapRecent(e) {
    const item = e.currentTarget.dataset.item;
    const scene = this.data.scenes.find(s => s.id === item.scene);
    if (scene) {
      app.globalData.currentScene = item.scene;
      wx.navigateTo({
        url: '/pages/prepare/prepare?continue=1&title=' + encodeURIComponent(item.title)
      });
    }
  },

  // 点击场景卡片 → 弹出浮层
  onSelectScene(e) {
    const scene = e.currentTarget.dataset.scene;
    this.setData({
      currentModalScene: scene,
      showSceneModal: true
    });
  },

  // 关闭浮层
  onCloseModal() {
    this.setData({ showSceneModal: false });
  },

  // 选择岗位/科目 → 进入准备页
  onSelectCategory(e) {
    const { sceneId, categoryName } = e.detail;
    app.globalData.currentScene = sceneId;
    app.globalData.currentCategory = categoryName;
    this.setData({ showSceneModal: false });
    wx.navigateTo({
      url: '/pages/prepare/prepare?category=' + encodeURIComponent(categoryName)
    });
  }
});
