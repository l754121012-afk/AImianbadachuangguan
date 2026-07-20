var app = getApp();
var questionsModule = require('../../data/questions.js');

// 各场景分类→岗位映射（与题库严格对应）
var CATEGORY_JOBS = {
  job: {
    '技术研发': ['Java开发', '前端开发', 'Python开发', '算法工程师', '测试工程师', '运维工程师'],
    '产品与设计': ['产品经理', 'UI设计师', '交互设计师', '数据分析师', '游戏策划', '用户研究员'],
    '市场与运营': ['运营专员', '品牌经理', '市场策划', '新媒体运营', '销售代表', '增长运营'],
    '金融与咨询': ['金融分析师', '投资顾问', '管理咨询', '风控专员', '基金经理', '保险顾问'],
    '医疗与健康': ['临床医生', '药剂师', '护士', '医学检验', '健康管理', '医疗器械销售'],
    '制造与供应链': ['生产主管', '质量管理', '工艺工程师', '采购经理', '仓储物流', '供应链专员']
  },
  kaoyan: {
    '理工类': ['计算机科学', '电子信息', '机械工程', '土木工程', '材料科学', '自动化'],
    '文史类': ['中国语言文学', '历史学', '哲学', '新闻传播', '外国语言文学', '考古学'],
    '经管类': ['工商管理', '金融学', '会计学', '经济学', '统计学', '国际贸易'],
    '法学类': ['民商法', '刑法', '国际法', '知识产权', '宪法行政法', '诉讼法'],
    '教育类': ['教育学', '心理学', '学前教育', '特殊教育', '教育技术', '体育教育'],
    '医学类': ['临床医学', '基础医学', '口腔医学', '公共卫生', '护理学', '药学']
  },
  kaogong: {
    '国考': ['综合管理', '行政执法', '税务系统', '海关系统', '银保监', '统计系统'],
    '省考': ['省级机关', '市级机关', '区县机关', '乡镇机关', '公安系统', '司法系统'],
    '事业编': ['教育事业单位', '医疗事业单位', '科研事业单位', '文化事业单位', '体育事业单位', '农林水事业单位'],
    '军队文职': ['行政管理', '工程技术', '医疗卫生', '教育教学', '科学研究', '会计审计'],
    '遴选': ['省级遴选', '市级遴选', '县级遴选', '部门遴选', '专项遴选', '公开遴选'],
    '村官': ['大学生村官', '三支一扶', '特岗教师', '西部计划', '乡村振兴', '社区工作者']
  }
};

// 获取默认岗位列表（题库中实际存在的岗位）
function getDefaultJobs(scene, category) {
  var sceneMap = CATEGORY_JOBS[scene];
  if (sceneMap && sceneMap[category]) {
    return sceneMap[category];
  }
  // 回退：从题库中取前6个岗位
  var bank = questionsModule.QUESTION_BANK[scene];
  if (bank) {
    var keys = Object.keys(bank);
    if (keys.length > 0) return keys.slice(0, 6);
  }
  return ['Java开发', '前端开发', 'Python开发', '算法工程师', '测试工程师', '运维工程师'];
}

Page({
  data: {
    sceneTitle: '面试准备',
    categoryName: '',
    jobs: ['Java开发', '前端开发', 'Python开发', '算法工程师', '测试工程师', '运维工程师'],
    jobIndex: 0,
    difficulties: ['基础', '进阶', '挑战'],
    difficultyIndex: 0,
    modes: [
      { id: 'voice', name: '语音面试', sub: '真实模拟体验', icon: '🎙️', active: true },
      { id: 'text', name: '文字面试', sub: '快速练习模式', icon: '⌨️', active: false }
    ],
    showPayment: false,
    showAd: false,
    adCountdown: 5,
    adTimer: null
  },

  onLoad: function(options) {
    // 接收场景参数（显式解码，防止框架未解码）
    var scene = (options.scene && decodeURIComponent(options.scene)) || app.globalData.currentScene || 'job';
    var category = (options.category && decodeURIComponent(options.category)) || app.globalData.currentCategory || '';
    var continueFlag = options.continue;
    var continueTitle = options.title ? decodeURIComponent(options.title) : '';

    var jobs = getDefaultJobs(scene, category);
    var sceneTitle = '面试准备';

    if (scene === 'job') {
      sceneTitle = '求职面试';
    } else if (scene === 'kaoyan') {
      sceneTitle = '考研复试';
    } else if (scene === 'kaogong') {
      sceneTitle = '考公面试';
    }

    this.setData({
      sceneTitle: sceneTitle,
      categoryName: category,
      jobs: jobs,
      freeCount: app.globalData.freeCount,
      isVip: app.globalData.isVip
    });
  },

  onPickerChange: function(e) {
    this.setData({ jobIndex: e.detail.value });
  },

  onSelectDifficulty: function(e) {
    this.setData({ difficultyIndex: e.currentTarget.dataset.index });
  },

  onSelectMode: function(e) {
    var index = e.currentTarget.dataset.index;
    var modes = []; for (var mi = 0; mi < this.data.modes.length; mi++) { var m = this.data.modes[mi]; var obj2 = { name: m.name, icon: m.icon }; obj2.active = (mi === index); modes.push(obj2); }
    this.setData({ modes: modes });
  },

  onStartInterview: function() {
    var that = this;
    var jobs = this.data.jobs; var jobIndex = this.data.jobIndex; var difficulties = this.data.difficulties; var difficultyIndex = this.data.difficultyIndex; var modes = this.data.modes;
    app.globalData.currentJob = jobs[jobIndex];
    app.globalData.currentDifficulty = difficulties[difficultyIndex];
    var activeMode = null; for (var mi = 0; mi < modes.length; mi++) { if (modes[mi].active) { activeMode = modes[mi]; break; } }
    app.globalData.currentMode = activeMode.id;

    if (!app.canStartInterview()) {
      wx.showModal({
        title: '次数已用完',
        content: '免费次数已用完，升级套餐可无限练习',
        confirmText: '去升级',
        cancelText: '看广告',
        success: function(res) {
          if (res.confirm) {
            that.setData({ showPayment: true });
          } else if (res.cancel) {
            that.startAdReward();
          }
        }
      });
      return;
    }

    var scene = app.globalData.currentScene || 'job';
    var category = app.globalData.currentCategory || '';
    var job = app.globalData.currentJob || questionsModule.getDefaultJob(scene, category);
    var questions = questionsModule.getQuestions(scene, job);
    if (!questions || questions.length === 0) {
      wx.showToast({ title: '暂无该岗位题目', icon: 'none' });
      return;
    }

    var progress = {
      questions: questions,
      answers: [],
      currentQuestion: 0,
      scene: scene,
      category: category,
      job: job,
      difficulty: app.globalData.currentDifficulty,
      mode: activeMode.id,
      startTime: Date.now()
    };
    app.setInterviewProgress(progress);
    app.useInterviewCount();
    wx.navigateTo({ url: '/pages/interview/interview' });
  },

  startAdReward: function() {
    var that = this;
    var level = app.getVipLevel ? app.getVipLevel() : 0;
    if (level >= 2) {
      wx.showToast({ title: '会员无需看广告', icon: 'none' });
      return;
    }
    this.setData({ showAd: true, adCountdown: 5 });
    var timer = setInterval(function() {
      var count = that.data.adCountdown - 1;
      if (count <= 0) {
        clearInterval(timer);
        that.setData({ showAd: false, adCountdown: 0 });
        app.addFreeCount(1);
        wx.showToast({ title: '奖励已到账 +1次', icon: 'success' });
      } else {
        that.setData({ adCountdown: count });
      }
    }, 1000);
    this.setData({ adTimer: timer });
  },

  onCloseAd: function() {
    if (this.data.adTimer) {
      clearInterval(this.data.adTimer);
    }
    if (this.data.adCountdown > 0) {
      wx.showToast({ title: '需观看完整广告', icon: 'none' });
      return;
    }
    this.setData({ showAd: false });
  },

  onClosePayment: function() {
    this.setData({ showPayment: false });
  },

  stopPropagation: function() {}
});