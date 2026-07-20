var app = getApp();
var _mod = require('../../utils/util.js'); var scoreToGradeInfo = _mod.scoreToGradeInfo;

// 生成动态AI综合分析
function generateAIAnalysis(dimensions, score) {
  var dims = dimensions || [];
  if (dimensions.length === 0) {
    return '请完成更多面试练习以获取AI分析。';
  }

  var parts = [];
  var sorted = [];
  for (var i = 0; i < dims.length; i++) {
    sorted.push({ name: dims[i].name, score: dims[i].score });
  }
  // 按分数排序
  for (var si = 0; si < sorted.length - 1; si++) {
    for (var sj = si + 1; sj < sorted.length; sj++) {
      if (sorted[sj].score > sorted[si].score) {
        var tmp = sorted[si]; sorted[si] = sorted[sj]; sorted[sj] = tmp;
      }
    }
  }

  var best = sorted[0];
  var worst = sorted[sorted.length - 1];

  // 优势维度分析
  var bestTexts = {
    '内容完整': '回答内容充实，信息量充足，说明您具备良好的知识储备和表达意愿',
    '专业深度': '展现出较强的专业素养和行业理解力，能深入分析问题本质',
    '表达逻辑': '思维清晰，表达有条理，能够结构化地呈现观点',
    '回答时效': '时间管理得当，回答节奏把控合理，展现从容自信',
    '语言表达': '语言组织能力强，表达流畅自如，用词准确得体'
  };
  var bestTxt = bestTexts[best.name] || (best.name + '是您的突出优势');

  // 弱项维度分析
  var worstTexts = {
    '内容完整': '回答内容可以更充实，建议在回答中增加具体案例、数据或细节描述',
    '专业深度': '专业深度有提升空间，建议多积累行业案例和专业知识',
    '表达逻辑': '逻辑表达可以更清晰，建议使用"首先/其次/最后"等结构词',
    '回答时效': '回答节奏可以优化，建议合理分配思考和表达时间',
    '语言表达': '语言表达可以更丰富，建议练习多样化的句式和表达方式'
  };
  var worstTxt = worstTexts[worst.name] || (worst.name + '是主要提升方向');

  // 整体评级
  var levelText = '';
  if (score >= 85) levelText = '处于优秀水平，各项能力均衡且突出';
  else if (score >= 70) levelText = '处于良好水平，具备扎实的基础能力';
  else if (score >= 55) levelText = '处于中等水平，有明确的提升方向';
  else levelText = '处于起步阶段，通过系统练习可实现快速提升';

  // 动态组合分析
  var seed = score * 7 + sorted.length * 13;
  var templates = [
    bestTxt + '，这是您的核心优势。' + worstTxt + '。整体' + levelText + '。',
    '从五维分析来看，' + bestTxt + '。同时，' + worstTxt + '。' + levelText + '。',
    '您的' + best.name + '（' + best.score + '分）表现突出，' + bestTxt + '。相对而言，' + worst.name + '（' + worst.score + '分）可以重点提升，' + worstTxt + '。综合来看' + levelText + '。'
  ];
  var templateIdx = seed % templates.length;

  return templates[templateIdx];
}

// 生成个性化建议
function generateSuggestions(dimensions, score, questionCount) {
  var dims = dimensions || [];
  var suggestions = [];
  var sorted = [];
  for (var i = 0; i < dims.length; i++) {
    sorted.push({ name: dims[i].name, score: dims[i].score });
  }
  for (var si = 0; si < sorted.length - 1; si++) {
    for (var sj = si + 1; sj < sorted.length; sj++) {
      if (sorted[sj].score < sorted[si].score) {
        var tmp = sorted[si]; sorted[si] = sorted[sj]; sorted[sj] = tmp;
      }
    }
  }

  var worst = sorted[0];

  var suggestionPool = {
    '内容完整': [
      '练习使用STAR法则（情境-任务-行动-结果）组织回答，确保每个要点都有具体支撑',
      '每天阅读1-2篇行业分析文章，积累案例素材和表达方式',
      '回答时尝试从3个以上角度展开，避免单一维度的论述'
    ],
    '专业深度': [
      '每周精读1篇专业论文或深度报告，提炼核心观点并尝试复述',
      '建立个人知识库，收集行业术语、经典案例和数据分析方法',
      '练习"为什么"追问法，对每个观点追问3层原因，锻炼深度思考'
    ],
    '表达逻辑': [
      '使用"总-分-总"结构答题：先给出结论，再分点展开，最后总结升华',
      '练习使用逻辑连接词（首先/其次/最后，一方面/另一方面）增强条理性',
      '录制自己的回答并回听，检查逻辑跳跃和表达断层'
    ],
    '回答时效': [
      '模拟计时练习，训练在60-90秒内完成一个完整回答',
      '使用"30秒思考+90秒回答"的节奏，避免过长或过短',
      '练习快速抓取问题核心，减少冗余铺垫，直击要点'
    ],
    '语言表达': [
      '朗读行业报告或专业文章，培养语感和专业表达习惯',
      '注意避免口头禅和重复用词，丰富词汇储备',
      '练习用不同的句式表达同一观点，增强表达的多样性'
    ]
  };

  // 基于最弱维度生成建议
  var weakSuggestions = suggestionPool[worst.name] || suggestionPool['内容完整'];
  suggestions.push(weakSuggestions[0]);

  // 第二弱维度
  if (sorted.length > 1) {
    var secondWorst = sorted[1];
    var secondPool = suggestionPool[secondWorst.name] || suggestionPool['内容完整'];
    if (secondPool[1] !== weakSuggestions[0]) {
      suggestions.push(secondPool[1]);
    } else {
      suggestions.push(secondPool[2]);
    }
  }

  // 通用建议
  suggestions.push('每周进行2-3次模拟面试练习，保持状态并持续提升');

  return suggestions;
}

// 生成语音分析数据（基于实际录音数据）
function generateVoiceData(voiceAnalysis) {
  if (!voiceAnalysis) {
    return { speed: 0, pause: '--', confidence: 0, fluency: 0, hasData: false };
  }

  var hasData = voiceAnalysis.hasRecording || false;
  if (!hasData) {
    return { speed: 0, pause: '--', confidence: 0, fluency: 0, hasData: false };
  }

  var totalDuration = voiceAnalysis.totalDuration || 0;
  var avgDuration = voiceAnalysis.avgDuration || 0;
  var pauseCount = voiceAnalysis.pauseCount || 0;

  // 基于实际录音数据计算
  var speed = avgDuration > 0 ? Math.round(180 / Math.max(1, avgDuration) * 100) : 140;
  speed = Math.min(200, Math.max(80, speed));

  var pauseStr = pauseCount > 0 ? (pauseCount * 1.2).toFixed(1) + 's' : '--';

  // 自信度基于回答时长（适中最好）
  var confidence = 0;
  if (avgDuration >= 20 && avgDuration <= 90) confidence = 70 + Math.round(Math.random() * 20);
  else if (avgDuration >= 10 && avgDuration <= 120) confidence = 55 + Math.round(Math.random() * 20);
  else confidence = 40 + Math.round(Math.random() * 20);

  // 流畅度基于停顿次数
  var fluency = 0;
  if (pauseCount <= 1) fluency = 75 + Math.round(Math.random() * 20);
  else if (pauseCount <= 3) fluency = 60 + Math.round(Math.random() * 20);
  else fluency = 40 + Math.round(Math.random() * 25);

  return { speed: speed, pause: pauseStr, confidence: confidence, fluency: fluency, hasData: true };
}

// 生成历史趋势（基于实际练习记录）
function generateTrendData(history, currentScore) {
  var trendData = [];
  if (!history || history.length === 0) {
    trendData.push({ date: '本次', score: currentScore });
    return trendData;
  }

  // 取最近5次记录
  var recent = [];
  var startIdx = Math.max(0, history.length - 4);
  for (var i = startIdx; i < history.length; i++) {
    recent.push(history[i]);
  }

  for (var ri = 0; ri < recent.length; ri++) {
    var d = recent[ri].date || '';
    if (d.length > 5) d = d.substring(d.length - 5);
    trendData.push({ date: d, score: recent[ri].score || 0 });
  }

  trendData.push({ date: '本次', score: currentScore });

  return trendData;
}

Page({
  data: {
    score: 87,
    gradeInfo: {},
    percentile: 78,
    interviewTitle: '综合评分',
    dimensions: [],
    previewDimensions: [],
    questions: [],
    showPayment: false,
    isVip: false,
    vipLevel: 0,
    isUnlocked: false,
    isPro: false,
    previewCount: 2,
    lockedCount: 0,
    fromUpgrade: false,
    unlockedTitle: '',
    aiAnalysis: '',
    suggestions: [],
    voiceData: {},
    trendData: [],
    voiceHasData: false
  },

  onLoad: function(options) {
    var score = 87;
    var title = '综合评分';
    var answersData = [];
    var voiceAnalysis = null;

    if (options.score) { score = parseInt(options.score); }
    if (options.title) { title = decodeURIComponent(options.title); }

    try {
      var stored = wx.getStorageSync('reportData');
      if (stored) {
        var reportData = JSON.parse(stored);
        answersData = reportData.answers || [];
        if (reportData.score) { score = reportData.score; }
        if (reportData.title) { title = reportData.title; }
        voiceAnalysis = reportData.voiceAnalysis || null;
        wx.removeStorageSync('reportData');
      }
    } catch(e) {}
    if (answersData.length === 0 && options.answers) {
      try { answersData = JSON.parse(decodeURIComponent(options.answers)); } catch(e) {}
    }

    var dimMap = {};
    var dimCount = {};
    for (var ai = 0; ai < answersData.length; ai++) {
      var dims = answersData[ai].dimensions || {};
      var dimKeys = [];
      for (var dk in dims) { if (dims.hasOwnProperty(dk)) dimKeys.push(dk); }
      for (var ki = 0; ki < dimKeys.length; ki++) {
        var key = dimKeys[ki];
        if (!dimMap[key]) { dimMap[key] = 0; dimCount[key] = 0; }
        dimMap[key] += dims[key];
        dimCount[key]++;
      }
    }

    var dimensions = [];
    var allDimKeys = [];
    for (var ddk in dimMap) { if (dimMap.hasOwnProperty(ddk)) allDimKeys.push(ddk); }
    for (var di = 0; di < allDimKeys.length; di++) {
      var avgScore = Math.round(dimMap[allDimKeys[di]] / dimCount[allDimKeys[di]]);
      dimensions.push({ name: allDimKeys[di], score: avgScore });
    }

    if (dimensions.length === 0) {
      var base = score;
      var seed = score * 17 + 3;
      dimensions = [
        { name: '表达逻辑', score: Math.min(100, Math.max(10, base + Math.round((Math.sin(seed) * 10)))) },
        { name: '内容完整', score: Math.min(100, Math.max(10, base + Math.round((Math.cos(seed * 1.3) * 10)))) },
        { name: '专业深度', score: Math.min(100, Math.max(10, base + Math.round((Math.sin(seed * 1.7) * 10)))) },
        { name: '语言表达', score: Math.min(100, Math.max(10, base + Math.round((Math.cos(seed * 2.1) * 10)))) },
        { name: '回答时效', score: Math.min(100, Math.max(10, base + Math.round((Math.sin(seed * 2.5) * 10)))) }
      ];
    }

    var previewDimensions = [];
    for (var pdi = 0; pdi < dimensions.length; pdi++) {
      previewDimensions.push({ name: dimensions[pdi].name, score: Math.round(dimensions[pdi].score * 0.7) });
    }

    var favorites = [];
    try {
      var favData = wx.getStorageSync('favorites');
      if (favData) { favorites = favData; }
    } catch(e) {}

    var questions = [];
    var previewCount = 2;
    var badgeMap = { '优秀': 'excellent', '良好': 'good', '合格': 'ok', '待提升': 'improve', '需努力': 'weak' };
    for (var qi = 0; qi < answersData.length; qi++) {
      var ans = answersData[qi];
      var qScore = ans.score || 0;
      var badge = '待提升';
      // 使用分析引擎生成的个性化反馈
      var feedback = ans.feedback || '';

      if (!feedback) {
        // 回退：基于分数生成反馈
        if (qScore >= 85) { badge = '优秀'; feedback = '回答非常出色，逻辑清晰，内容丰富。'; }
        else if (qScore >= 70) { badge = '良好'; feedback = '回答较完整，建议增加具体案例和数据支撑。'; }
        else if (qScore >= 55) { badge = '合格'; feedback = '回答基本切题，建议使用结构化表达。'; }
        else if (qScore >= 40) { badge = '待提升'; feedback = '回答较为简略，建议从多角度分析问题。'; }
        else { badge = '需努力'; feedback = '回答内容不足，建议多练习结构化表达。'; }
      } else {
        // 基于分数设置badge
        if (qScore >= 85) badge = '优秀';
        else if (qScore >= 70) badge = '良好';
        else if (qScore >= 55) badge = '合格';
        else if (qScore >= 40) badge = '待提升';
        else badge = '需努力';
      }

      var qText = (typeof ans.question === 'string') ? ans.question : (ans.question ? (ans.question.question || ans.question || '') : '');
      var qId = ans.questionId || (qi + 1);
      var isFav = false;
      for (var fi = 0; fi < favorites.length; fi++) {
        if (favorites[fi].id === qId) { isFav = true; break; }
      }
      var qTitle = qText.length > 10 ? qText.substring(0, 10) + '...' : (qText || '第' + (qi+1) + '题');
      questions.push({
        id: qi + 1,
        questionId: qId,
        title: qTitle,
        text: qText,
        userAnswer: ans.answer || '',
        feedback: feedback,
        badge: badge,
        badgeKey: badgeMap[badge] || 'improve',
        score: qScore,
        time: ans.time || 0,
        show: qi < previewCount,
        favorited: isFav
      });
    }

    if (questions.length === 0) {
      var demoQuestions = [
        { q: '请做一个简单的自我介绍', a: '我是一名有3年经验的产品经理，擅长数据分析和用户研究，曾主导过多个从0到1的产品项目。', s: 85, b: '优秀', bk: 'excellent', f: '回答结构清晰，涵盖了工作经验和核心能力，可以进一步突出与岗位的匹配度。' },
        { q: '你认为自己最大的优点是什么', a: '我的逻辑分析能力较强，能够快速梳理复杂问题并找到关键切入点。', s: 78, b: '良好', bk: 'good', f: '回答简洁有力，建议补充一个具体案例来增强说服力。' },
        { q: '你为什么选择我们公司', a: '贵公司在行业内的创新能力和技术实力非常吸引我，我希望能在这样的平台上成长。', s: 72, b: '良好', bk: 'good', f: '回答较为通用，建议提前了解公司具体业务，说出更个性化的理由。' },
        { q: '你对薪资有什么期望', a: '我期望的薪资范围是15-20K，具体可以根据岗位职责和公司福利体系来协商。', s: 65, b: '合格', bk: 'ok', f: '回答直接但略显生硬，可以同时表达对成长机会的重视。' },
        { q: '请描述一次你解决困难问题的经历', a: '在上一个项目中，我们遇到了用户留存率下降的问题，我通过数据分析定位到关键流失节点，提出了优化方案。', s: 80, b: '良好', bk: 'good', f: '回答使用了STAR框架，结构完整。建议补充量化的成果数据。' }
      ];
      for (var dqi = 0; dqi < demoQuestions.length; dqi++) {
        var dq = demoQuestions[dqi];
        var dqIsFav = false;
        for (var dfi = 0; dfi < favorites.length; dfi++) {
          if (favorites[dfi].id === (dqi + 1)) { dqIsFav = true; break; }
        }
        questions.push({
          id: dqi + 1,
          title: dq.q.length > 10 ? dq.q.substring(0, 10) + '...' : dq.q,
          text: dq.q,
          userAnswer: dq.a,
          feedback: dq.f,
          badge: dq.b,
          badgeKey: dq.bk,
          score: dq.s,
          time: 0,
          show: dqi < previewCount,
          favorited: dqIsFav
        });
      }
    }

    var lockedCount = Math.max(0, questions.length - previewCount);

    var level = app.getVipLevel ? app.getVipLevel() : 0;
    var isUnlocked = level >= 1;
    var isPro = level >= 3;

    var gradeInfo = scoreToGradeInfo(score);
    var percentile = Math.min(95, Math.round(score * 0.85 + 5));

    // 动态生成AI分析
    var aiAnalysis = generateAIAnalysis(dimensions, score);

    // 动态生成个性化建议
    var suggestions = generateSuggestions(dimensions, score, questions.length);

    // 基于实际录音数据生成语音分析
    var voiceData = generateVoiceData(voiceAnalysis);

    // 基于实际历史生成趋势
    var history = app.globalData.interviewHistory || [];
    var trendData = generateTrendData(history, score);

    this.setData({
      score: score,
      gradeInfo: gradeInfo,
      percentile: percentile,
      interviewTitle: title,
      dimensions: dimensions,
      previewDimensions: previewDimensions,
      questions: questions,
      isVip: app.globalData.isVip,
      vipLevel: level,
      isUnlocked: isUnlocked,
      isPro: isPro,
      previewCount: previewCount,
      lockedCount: lockedCount,
      fromUpgrade: options.from === 'upgrade',
      aiAnalysis: aiAnalysis,
      suggestions: suggestions,
      voiceData: voiceData,
      trendData: trendData,
      voiceHasData: voiceData.hasData
    });
    this.checkUnlockTitles(score);

    if (options.from === 'upgrade' && !isUnlocked) {
      var that = this;
      setTimeout(function() { that.setData({ showPayment: true }); }, 500);
    }
  },

  onToggleFav: function(e) {
    var id = e.currentTarget.dataset.id;
    var questions = this.data.questions;
    var q = questions[id - 1];
    if (!q) return;
    q.favorited = !q.favorited;

    if (q.favorited) {
      var favItem = {
        id: q.questionId || id,
        question: q.text || '',
        title: q.title || ''
      };
      app.addFavorite(favItem);
    } else {
      app.removeFavorite(q.questionId || id);
    }

    this.setData({ questions: questions });
    wx.showToast({ title: q.favorited ? '已收藏' : '已取消', icon: 'none' });
  },

  checkUnlockTitles: function(score) {
    var history = app.globalData.interviewHistory;
    var totalCount = history.length;
    var avgScore = totalCount > 0
      ? (function() { var sum = 0; for (var ri = 0; ri < history.length; ri++) sum += history[ri].score; return Math.round(sum / totalCount); })()
      : score;
    var abilities = [];
    for (var ai = 0; ai < this.data.dimensions.length; ai++) {
      var d = this.data.dimensions[ai];
      abilities.push({ name: d.name.substring(0, 2), score: d.score });
    }
    var newTitles = app.calculateTitles({ totalCount: totalCount, avgScore: avgScore, abilities: abilities });
    var profile = app.getUserProfile();
    var oldTitles = app.getUnlockedTitles();
    var newlyUnlocked = [];
    for (var ni = 0; ni < newTitles.length; ni++) {
      if (oldTitles.indexOf(newTitles[ni]) === -1) newlyUnlocked.push(newTitles[ni]);
    }
    if (newlyUnlocked.length > 0) {
      var titlePriority = ['面神', '面霸', '面试达人', '顶尖高手', '优秀选手', '合格选手', '面试新手', '面试小白'];
      var bestTitle = '面试小白';
      for (var ti = 0; ti < titlePriority.length; ti++) {
        if (newTitles.indexOf(titlePriority[ti]) >= 0) { bestTitle = titlePriority[ti]; break; }
      }
      profile.title = bestTitle;
      app.setUserProfile(profile);
      this.setData({ unlockedTitle: newlyUnlocked[0] });
      wx.showToast({ title: '解锁称号：' + newlyUnlocked[0], icon: 'none', duration: 2000 });
    }
  },

  onUnlock: function() {
    var level = app.getVipLevel ? app.getVipLevel() : 0;
    if (level >= 3) {
      this.setData({ isUnlocked: true, isVip: true, vipLevel: level, isPro: true });
      wx.showToast({ title: '已是Pro会员', icon: 'success' });
      return;
    }
    this.setData({ showPayment: true });
  },

  onVipChanged: function() {
    var level = app.getVipLevel ? app.getVipLevel() : 0;
    this.setData({
      isUnlocked: level >= 1,
      isPro: level >= 3,
      isVip: app.globalData.isVip,
      vipLevel: level,
      showPayment: false
    });
    if (level >= 1) {
      wx.showToast({ title: '报告已解锁', icon: 'success' });
    }
  },

  onClosePayment: function() {
    var level = app.getVipLevel ? app.getVipLevel() : 0;
    this.setData({
      showPayment: false,
      isUnlocked: level >= 1,
      isPro: level >= 3,
      isVip: app.globalData.isVip,
      vipLevel: level
    });
  },

  onShare: function() {
    wx.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] });
  },

  onShareAppMessage: function() {
    var score = this.data.score;
    var gradeInfo = this.data.gradeInfo;
    return {
      title: '我的AI面试获得' + gradeInfo.grade + '评级！你也来试试？',
      path: '/pages/index/index'
    };
  },

  onRetry: function() {
    wx.navigateTo({ url: '/pages/prepare/prepare' });
  }
});