const app = getApp();

Page({
  data: {
    sceneTitle: '面试准备',
    categoryName: '',
    jobs: ['产品经理', 'Java开发', '前端开发', '运营专员', '市场营销', '财务会计'],
    jobIndex: 0,
    difficulties: ['基础', '进阶', '挑战'],
    difficultyIndex: 0,
    modes: [
      { id: 'voice', name: '语音面试', sub: '真实模拟体验', icon: '🎙️', active: true },
      { id: 'text', name: '文字面试', sub: '快速练习模式', icon: '⌨️', active: false }
    ]
  },

  onLoad(options) {
    // 接收场景参数
    const scene = options.scene || app.globalData.currentScene || 'job';
    const category = options.category || app.globalData.currentCategory || '';
    const continueFlag = options.continue;
    const continueTitle = options.title ? decodeURIComponent(options.title) : '';

    let jobs = [];
    let sceneTitle = '面试准备';

    // 根据场景和分类动态设置岗位
    if (scene === 'job') {
      sceneTitle = '求职面试';
      if (category === '互联网') jobs = ['产品经理', 'Java开发', '前端开发', 'UI设计师', '数据分析师', '算法工程师'];
      else if (category === '金融') jobs = ['金融分析师', '投资顾问', '风控专员', '客户经理', '基金经理', '保险顾问'];
      else if (category === '快消') jobs = ['品牌经理', '销售代表', '采购专员', '供应链专员', '市场策划', '渠道经理'];
      else if (category === '制造业') jobs = ['生产主管', '质量管理', '工艺工程师', '设备工程师', '采购经理', '仓储物流'];
      else if (category === '咨询') jobs = ['管理咨询', '战略咨询', 'IT咨询', '财务咨询', '人力资源', '市场调研'];
      else if (category === '医疗') jobs = ['临床医生', '药剂师', '护士', '医学检验', '康复治疗', '健康管理'];
      else jobs = ['产品经理', 'Java开发', '前端开发', '运营专员', '市场营销', '财务会计'];
    } else if (scene === 'kaoyan') {
      sceneTitle = '考研复试';
      if (category === '理工') jobs = ['计算机科学', '电子信息', '机械工程', '土木工程', '材料科学', '自动化'];
      else if (category === '文史') jobs = ['中国语言文学', '历史学', '哲学', '新闻传播', '外国语言文学', '考古学'];
      else if (category === '经管') jobs = ['工商管理', '金融学', '会计学', '经济学', '统计学', '国际贸易'];
      else if (category === '法学') jobs = ['民商法', '刑法', '国际法', '知识产权', '宪法行政法', '诉讼法'];
      else if (category === '教育') jobs = ['教育学', '心理学', '学前教育', '特殊教育', '教育技术', '体育教育'];
      else if (category === '医学') jobs = ['临床医学', '基础医学', '口腔医学', '公共卫生', '护理学', '药学'];
      else jobs = ['计算机科学', '工商管理', '中国语言文学', '临床医学', '法学', '教育学'];
    } else if (scene === 'kaogong') {
      sceneTitle = '考公面试';
      if (category === '国考') jobs = ['综合管理', '行政执法', '税务系统', '海关系统', '银保监', '统计系统'];
      else if (category === '省考') jobs = ['省级机关', '市级机关', '区县机关', '乡镇机关', '公安系统', '司法系统'];
      else if (category === '事业编') jobs = ['教育事业单位', '医疗事业单位', '科研事业单位', '文化事业单位', '体育事业单位', '农林水事业单位'];
      else if (category === '军队文职') jobs = ['行政管理', '工程技术', '医疗卫生', '教育教学', '科学研究', '会计审计'];
      else if (category === '遴选') jobs = ['省级遴选', '市级遴选', '县级遴选', '部门遴选', '专项遴选', '公开遴选'];
      else if (category === '村官') jobs = ['大学生村官', '三支一扶', '特岗教师', '西部计划', '乡村振兴', '社区工作者'];
      else jobs = ['综合管理', '行政执法', '税务系统', '教育事业单位', '医疗事业单位', '公安系统'];
    }

    this.setData({
      sceneTitle,
      categoryName: category,
      jobs,
      freeCount: app.globalData.freeCount,
      isVip: app.globalData.isVip
    });
  },

  onPickerChange(e) {
    this.setData({ jobIndex: e.detail.value });
  },

  onSelectDifficulty(e) {
    this.setData({ difficultyIndex: e.currentTarget.dataset.index });
  },

  onSelectMode(e) {
    const index = e.currentTarget.dataset.index;
    const modes = this.data.modes.map((m, i) => ({ ...m, active: i === index }));
    this.setData({ modes });
  },

  onStartInterview() {
    const { jobs, jobIndex, difficulties, difficultyIndex, modes } = this.data;
    app.globalData.currentJob = jobs[jobIndex];
    app.globalData.currentDifficulty = difficulties[difficultyIndex];
    const activeMode = modes.find(m => m.active);
    app.globalData.currentMode = activeMode.id;

    if (!app.canStartInterview()) {
      wx.showModal({
        title: '次数已用完',
        content: '免费次数已用完，升级套餐可无限练习',
        confirmText: '去升级',
        cancelText: '看广告',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/report/report' });
          } else if (res.cancel) {
            wx.showToast({ title: '广告播放中...', icon: 'none' });
          }
        }
      });
      return;
    }

    wx.navigateTo({ url: '/pages/interview/interview' });
  }
});
