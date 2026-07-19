var app = getApp();
var _mod = require('../../data/questions.js'); var getQuestions = _mod.getQuestions; var getDefaultJob = _mod.getDefaultJob;;

Page({
  data: {
    freeCount: 3,
    isVip: false,
    vipLevelName: '免费版',
    userTitle: '面试小白',
    titleClass: 'title-gray',
    vipBadgeClass: 'vip-badge-gray',
    highScore: '--',
    greeting: '你好',
    avatar: '🤖',
    greetingName: '面试达人',
    showSceneModal: false,
    currentModalScene: null,
    recentList: [],
    scenes: [
      {
        id: 'job', name: '求职面试', desc: '技术研发、产品设计、金融等 6 大方向',
        icon: '💼', color: 'job', badge: '热门', badgeColor: 'badge-amber',
        categories: [
          { name: '技术研发', icon: '💻', count: '70题' },
          { name: '产品与设计', icon: '🎨', count: '65题' },
          { name: '市场与运营', icon: '📈', count: '65题' },
          { name: '金融与咨询', icon: '🏦', count: '60题' },
          { name: '医疗与健康', icon: '🏥', count: '60题' },
          { name: '制造与供应链', icon: '🏭', count: '60题' }
        ]
      },
      {
        id: 'kaoyan', name: '考研复试', desc: '理工、经管、文史等 6 大学科门类',
        icon: '📚', color: 'kaoyan', badge: '新增', badgeColor: 'badge-blue',
        categories: [
          { name: '理工类', icon: '⚙️', count: '65题' },
          { name: '文史类', icon: '📖', count: '60题' },
          { name: '经管类', icon: '💹', count: '65题' },
          { name: '法学类', icon: '⚖️', count: '60题' },
          { name: '教育类', icon: '📝', count: '60题' },
          { name: '医学类', icon: '🩺', count: '60题' }
        ]
      },
      {
        id: 'kaogong', name: '考公面试', desc: '国考、省考、事业编等 6 大方向',
        icon: '🏛️', color: 'kaogong', badge: '结构化', badgeColor: 'badge-green',
        categories: [
          { name: '国考', icon: '🏛️', count: '70题' },
          { name: '省考', icon: '🗺️', count: '60题' },
          { name: '事业编', icon: '📋', count: '60题' },
          { name: '军队文职', icon: '🎖️', count: '60题' },
          { name: '遴选', icon: '📑', count: '60题' },
          { name: '村官', icon: '🌾', count: '60题' }
        ]
      }
    ]
  },

  onLoad: function() {
    this.refreshData();
  },

  onShow: function() {
    this.refreshData();
  },

  refreshData: function() {
    var profile = app.getUserProfile();
    var hour = new Date().getHours();
    var greet = '你好';
    if (hour < 6) greet = '夜深了';
    else if (hour < 12) greet = '早安';
    else if (hour < 14) greet = '午安';
    else if (hour < 18) greet = '下午好';
    else greet = '晚上好';

    var name = profile.nickname || '面试达人';

    var vipLevel = app.getVipLevel ? app.getVipLevel() : 0;
    var userTitle = profile.title || '面试小白';
    var titleClass = app.getTitleClass ? app.getTitleClass(userTitle) : 'title-gray';
    var vipBadgeClass = 'vip-badge-gray';
    if (vipLevel >= 3) { vipBadgeClass = 'vip-badge-pro'; }
    else if (vipLevel >= 2) { vipBadgeClass = 'vip-badge-gold'; }
    else if (vipLevel >= 1) { vipBadgeClass = 'vip-badge-blue'; }

    this.setData({
      freeCount: app.globalData.freeCount,
      isVip: app.globalData.isVip,
      vipLevelName: app.getVipLevelName ? app.getVipLevelName() : '免费版',
      userTitle: userTitle,
      titleClass: titleClass,
      vipBadgeClass: vipBadgeClass,
      avatar: profile.avatar || '👤',
      greeting: greet,
      greetingName: name
    });

    var history = app.globalData.interviewHistory;
    var progress = app.getInterviewProgress();

    var recentList = [];

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

    if (history && history.length > 0) {
      var maxScore = 0;
      for (var si3 = 0; si3 < Math.min(3, history.length); si3++) {
        var hItem = history[si3];
        recentList.push({
          id: hItem.id,
          title: hItem.title,
          date: hItem.date,
          difficulty: hItem.difficulty,
          mode: hItem.mode,
          score: hItem.score,
          icon: hItem.icon,
          color: hItem.color,
          scene: hItem.scene,
          completed: true,
          totalQuestions: 5
        });
        if (hItem.score > maxScore) maxScore = hItem.score;
      }
      if (maxScore > 0) {
        this.setData({ highScore: maxScore });
      }
    } else {
      if (!progress) {
        recentList.push(
          { id: 1, title: '互联网产品经理', date: '6月29日', difficulty: '进阶', mode: '语音', score: 87, icon: '💼', color: 'job', scene: 'job', completed: true, totalQuestions: 5 },
          { id: 2, title: '计算机专业复试', date: '6月28日', difficulty: '基础', mode: '文字', score: 76, icon: '📚', color: 'kaoyan', scene: 'kaoyan', completed: true, totalQuestions: 5 }
        );
        this.setData({ highScore: 87 });
      }
    }

    var completedToday = 0;
    for (var ci = 0; ci < recentList.length; ci++) {
      if (recentList[ci].completed) completedToday++;
    }
    this.setData({ recentList: recentList, completedToday: completedToday });
  },

  onVipChanged: function() {
    this.refreshData();
  },

  onTapRecent: function(e) {
    var item = e.currentTarget.dataset.item;
    if (item.id === 'progress' || !item.completed) {
      wx.showModal({
        title: '继续练习',
        content: '当前进度：第' + item.questionIndex + '/' + item.totalQuestions + '题，是否继续上次进度？',
        confirmText: '继续',
        cancelText: '从头开始',
        success: function(res) {
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

  onSelectScene: function(e) {
    var scene = e.currentTarget.dataset.scene;
    this.setData({
      currentModalScene: scene,
      showSceneModal: true
    });
  },

  onTapAvatar: function() {
    wx.navigateTo({ url: '/pages/avatar/avatar' });
  },

  onCloseModal: function() {
    this.setData({ showSceneModal: false });
  },

  onSelectCategory: function(e) {
    var sceneId = e.detail.sceneId; var categoryName = e.detail.categoryName;
    app.globalData.currentScene = sceneId;
    app.globalData.currentCategory = categoryName;
    this.setData({ showSceneModal: false });
    wx.navigateTo({
      url: '/pages/prepare/prepare?scene=' + sceneId + '&category=' + encodeURIComponent(categoryName)
    });
  }
});