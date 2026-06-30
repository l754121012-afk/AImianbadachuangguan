const app = getApp();
const { getQuestions, getDefaultJob } = require('../../data/questions.js');

Page({
  data: {
    freeCount: 3,
    isVip: false,
    highScore: '--',
    greeting: '你好',
    greetingName: '面试达人',
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
    const profile = app.getUserProfile();
    const hour = new Date().getHours();
    let greet = '你好';
    if (hour < 6) greet = '夜深了';
    else if (hour < 12) greet = '早安';
    else if (hour < 14) greet = '午安';
    else if (hour < 18) greet = '下午好';
    else greet = '晚上好';

    const name = profile.greetingMode === 'nickname' ? profile.nickname : profile.title;

    this.setData({
      freeCount: app.globalData.freeCount,
      isVip: app.globalData.isVip,
      greeting: greet,
      greetingName: name
    });

    // 从本地存储加载面试历史
    const history = app.globalData.interviewHistory;
    const progress = app.getInterviewProgress();

    let recentList = [];

    // 如果有进行中的面试，放在第一位
    if (progress) {
      recentList.push({
        id: 'progress',
        title: progress.job || '进行中',
        date: '进行中',
        difficulty: progress.difficulty,
        mode: progress.mode === 'voice' ? '语音' : '文字',
        score: null,
        icon: progress.scene === 'job' ? '💼' : progress.scene === 'kaoyan' ? '📚' : '🏛️',
        color: progress.scene || 'job',
        scene: progress.scene,
        completed: false,
        questionIndex: progress.currentQuestion || 1,
        totalQuestions: progress.questions ? progress.questions.length : 5
      });
    }

    // 添加历史记录
    if (history && history.length > 0) {
      history.slice(0, 3).forEach(h => {
        recentList.push({
          ...h,
          completed: true,
          totalQuestions: 5
        });
      });
      const scores = history.filter(h => h.score).map(h => h.score);
      if (scores.length > 0) {
        this.setData({ highScore: Math.max(...scores) });
      }
    } else {
      // 演示数据（仅在没有真实数据时显示）
      if (!progress) {
        recentList.push(
          { id: 1, title: '互联网产品经理', date: '6月29日', difficulty: '进阶', mode: '语音', score: 87, icon: '💼', color: 'job', scene: 'job', completed: true, totalQuestions: 5 },
          { id: 2, title: '计算机专业复试', date: '6月28日', difficulty: '基础', mode: '文字', score: 76, icon: '📚', color: 'kaoyan', scene: 'kaoyan', completed: true, totalQuestions: 5 }
        );
        this.setData({ highScore: 87 });
      }
    }

    this.setData({ recentList });
  },

  // 点击最近练习项
  onTapRecent(e) {
    const item = e.currentTarget.dataset.item;
    if (item.id === 'progress' || !item.completed) {
      wx.showModal({
        title: '继续练习',
        content: '当前进度：第' + item.questionIndex + '/' + item.totalQuestions + '题，是否继续上次进度？',
        confirmText: '继续',
        cancelText: '从头开始',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/interview/interview?continue=1' });
          } else {
            app.clearInterviewProgress();
            wx.navigateTo({ url: '/pages/interview/interview' });
          }
        }
      });
    } else {
      wx.navigateTo({
        url: '/pages/report/report?score=' + item.score + '&title=' + encodeURIComponent(item.title)
      });
    }
  },

  onSelectScene(e) {
    const scene = e.currentTarget.dataset.scene;
    this.setData({
      currentModalScene: scene,
      showSceneModal: true
    });
  },

  onCloseModal() {
    this.setData({ showSceneModal: false });
  },

  onSelectCategory(e) {
    const { sceneId, categoryName } = e.detail;
    app.globalData.currentScene = sceneId;
    app.globalData.currentCategory = categoryName;
    this.setData({ showSceneModal: false });
    wx.navigateTo({
      url: '/pages/prepare/prepare?scene=' + sceneId + '&category=' + encodeURIComponent(categoryName)
    });
  }
});
