var app = getApp();
var VOICE_SERVER = 'http://10.1.2.155:3000';
var util = require('../../utils/util');

// ==================== 智能分析引擎 v2.0 ====================
// 基于回答内容的多维度智能评分，每个回答生成个性化反馈

// 从问题中提取关键词，用于检查回答的相关性
function extractKeywords(question) {
  var words = [];
  var q = question || '';
  // 提取中文关键词（2-5字组合）
  var segments = q.split(/[，,。！？!?\s、；;：:（）()""''""''【】\[\]]/);
  for (var i = 0; i < segments.length; i++) {
    var seg = segments[i].trim();
    if (seg.length >= 2 && seg.length <= 6) {
      words.push(seg);
    }
  }
  return words;
}

// 检查回答是否覆盖了问题关键词
function checkRelevance(question, answer) {
  var keywords = extractKeywords(question);
  var matched = 0;
  for (var i = 0; i < keywords.length; i++) {
    if (answer.indexOf(keywords[i]) !== -1) matched++;
  }
  return { total: keywords.length, matched: matched, ratio: keywords.length > 0 ? matched / keywords.length : 0.5 };
}

// 生成基于种子的伪随机数（确保同一回答得到一致分数）
function seededRandom(seed) {
  var x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// 智能回答分析
function analyzeAnswer(question, answer, timeSpent) {
  var result = { score: 0, dimensions: {}, feedback: '', strengths: [], weaknesses: [] };

  if (!answer || answer.trim().length === 0) {
    result.dimensions['内容完整'] = 5;
    result.dimensions['专业深度'] = 5;
    result.dimensions['表达逻辑'] = 5;
    result.dimensions['回答时效'] = 5;
    result.dimensions['语言表达'] = 5;
    result.score = 5;
    result.feedback = '未检测到回答内容，请尝试作答。';
    result.strengths = [];
    result.weaknesses = ['未作答'];
    return result;
  }

  var len = answer.length;
  var q = question || '';

  // 计算回答内容的哈希种子（用于维度微调，确保同一回答分数一致但不同回答有差异）
  var hashSeed = 0;
  for (var hi = 0; hi < Math.min(answer.length, 100); hi++) {
    hashSeed = ((hashSeed << 5) - hashSeed) + answer.charCodeAt(hi);
    hashSeed = hashSeed & hashSeed;
  }

  // === 1. 内容完整度 (0-25分) ===
  var lenScore = 0;
  if (len >= 300) lenScore = 25;
  else if (len >= 200) lenScore = 22;
  else if (len >= 150) lenScore = 18;
  else if (len >= 100) lenScore = 15;
  else if (len >= 60) lenScore = 11;
  else if (len >= 30) lenScore = 7;
  else lenScore = 4;

  // 相关性检查：回答是否切题
  var relevance = checkRelevance(q, answer);
  var relevanceBonus = 0;
  if (relevance.ratio >= 0.6) relevanceBonus = 3;
  else if (relevance.ratio >= 0.4) relevanceBonus = 2;
  else if (relevance.ratio >= 0.2) relevanceBonus = 1;

  // 检查是否有具体案例/数据/数字
  var hasCase = /(例如|比如|举例|案例|实例|项目|经历|实践|做过|参与|负责)/.test(answer);
  var hasData = /\d{2,}/.test(answer) || /[%％]/.test(answer);
  var caseBonus = (hasCase ? 1 : 0) + (hasData ? 1 : 0);

  var completenessScore = Math.min(25, lenScore + relevanceBonus + caseBonus);
  // 微调：±2 基于种子
  var completenessVar = Math.round((seededRandom(hashSeed + 1) - 0.5) * 4);
  result.dimensions['内容完整'] = Math.min(100, Math.max(8, Math.round(completenessScore * 4) + completenessVar));

  // === 2. 专业深度 (0-25分) ===
  var professionalTerms = [
    '分析', '策略', '方案', '架构', '流程', '优化', '数据', '用户', '体验', '性能',
    '效率', '目标', '结果', '迭代', '复盘', '总结', '协作', '沟通', '主导', '改进',
    '提升', '降低', '模块', '系统', '平台', '工具', '技术', '方法', '框架', '模型',
    '算法', '指标', '转化', '留存', '功能', '需求', '设计', '实现', '部署', '评估',
    '风险', '收益', '成本', '资源', '周期', '质量', '标准', '规范', '创新', '增长',
    '运营', '营销', '研发', '测试', '调研', '规划', '执行', '监控', '反馈', '调整',
    '价值', '定位', '差异', '竞争', '壁垒', '生态', '闭环', '赋能', '抓手', '颗粒度',
    '维度', '矩阵', '杠杆', '场景', '痛点', '需求', '频次', '渗透', '激活', '召回'
  ];
  var termCount = 0;
  for (var ti = 0; ti < professionalTerms.length; ti++) {
    if (answer.indexOf(professionalTerms[ti]) !== -1) termCount++;
  }
  var termScore = Math.min(20, Math.round(termCount * 0.35));
  // 检查是否有深度分析（因果关系、对比、递进）
  var hasCause = /(因为|所以|由于|因此|导致|造成|影响|原因)/.test(answer);
  var hasCompare = /(相比|对比|不同|区别|优势|劣势|优于|不如)/.test(answer);
  var hasProgression = /(不但|而且|不仅|还|更|进一步|深入|深层)/.test(answer);
  var depthBonus = (hasCause ? 2 : 0) + (hasCompare ? 2 : 0) + (hasProgression ? 1 : 0);

  var professionalScore = Math.min(25, termScore + depthBonus);
  var professionalVar = Math.round((seededRandom(hashSeed + 2) - 0.5) * 4);
  result.dimensions['专业深度'] = Math.min(100, Math.max(8, Math.round(professionalScore * 4) + professionalVar));

  // === 3. 表达逻辑 (0-25分) ===
  var logicWords = ['首先', '其次', '再次', '最后', '第一', '第二', '第三', '一方面', '另一方面',
    '不但', '而且', '虽然', '但是', '然而', '因此', '综上', '总的来说', '具体来说', '也就是说',
    '简而言之', '总之', '综上所述', '从...来看', '在...方面', '关于', '针对', '基于'];
  var logicCount = 0;
  for (var li = 0; li < logicWords.length; li++) {
    if (answer.indexOf(logicWords[li]) !== -1) logicCount++;
  }
  var hasNumbered = /\d[.、)）]/.test(answer);
  var hasSeparator = /[；;]/.test(answer);
  var hasParagraph = /\n/.test(answer) || answer.indexOf('\r\n') !== -1;

  var logicScore = Math.min(25, logicCount * 2.5 + (hasNumbered ? 3 : 0) + (hasSeparator ? 2 : 0) + (hasParagraph ? 2 : 0));
  var logicVar = Math.round((seededRandom(hashSeed + 3) - 0.5) * 4);
  result.dimensions['表达逻辑'] = Math.min(100, Math.max(8, Math.round(logicScore * 4) + logicVar));

  // === 4. 回答时效 (0-25分) ===
  var timeScore = 0;
  if (timeSpent >= 20 && timeSpent <= 90) timeScore = 25;
  else if (timeSpent >= 15 && timeSpent <= 120) timeScore = 22;
  else if (timeSpent >= 10 && timeSpent <= 150) timeScore = 18;
  else if (timeSpent >= 5 && timeSpent <= 180) timeScore = 14;
  else if (timeSpent >= 3) timeScore = 10;
  else timeScore = 6;
  var timeVar = Math.round((seededRandom(hashSeed + 4) - 0.5) * 3);
  result.dimensions['回答时效'] = Math.min(100, Math.max(8, Math.round(timeScore * 4) + timeVar));

  // === 5. 语言表达 (0-25分) ===
  var sentences = answer.split(/[。！？!?]/);
  var completeSentences = 0;
  var avgSentLen = 0;
  for (var si = 0; si < sentences.length; si++) {
    var s = sentences[si].trim();
    if (s.length >= 5) {
      completeSentences++;
      avgSentLen += s.length;
    }
  }
  if (completeSentences > 0) avgSentLen = Math.round(avgSentLen / completeSentences);

  var sentScore = Math.min(15, completeSentences * 2);
  var hasPunctuation = /[，,。.！!？?、]/.test(answer);
  var hasQuote = /[""'']/.test(answer);
  var varietyBonus = (hasPunctuation ? 3 : 0) + (hasQuote ? 1 : 0);
  // 句子长度适中（15-40字）加分
  if (avgSentLen >= 15 && avgSentLen <= 40) varietyBonus += 2;
  else if (avgSentLen >= 10 && avgSentLen <= 50) varietyBonus += 1;

  var languageScore = Math.min(25, sentScore + varietyBonus);
  var languageVar = Math.round((seededRandom(hashSeed + 5) - 0.5) * 4);
  result.dimensions['语言表达'] = Math.min(100, Math.max(8, Math.round(languageScore * 4) + languageVar));

  // === 总分 ===
  result.score = Math.round(completenessScore + professionalScore + logicScore + timeScore + languageScore * 0.8 + sentScore * 0.2);
  result.score = Math.max(10, Math.min(100, result.score));

  // === 生成个性化反馈 ===
  var dims = result.dimensions;
  var dimNames = ['内容完整', '专业深度', '表达逻辑', '回答时效', '语言表达'];
  var bestDim = dimNames[0];
  var bestScore = 0;
  var worstDim = dimNames[0];
  var worstScore = 100;

  for (var di = 0; di < dimNames.length; di++) {
    if (dims[dimNames[di]] > bestScore) { bestScore = dims[dimNames[di]]; bestDim = dimNames[di]; }
    if (dims[dimNames[di]] < worstScore) { worstScore = dims[dimNames[di]]; worstDim = dimNames[di]; }
  }

  // 强项反馈模板池
  var strengthTemplates = {
    '内容完整': ['回答内容充实，覆盖了问题的多个维度', '回答较为全面，要点覆盖较完整', '内容详实，信息量充足'],
    '专业深度': ['展现了较好的专业素养和行业认知', '专业术语使用恰当，分析有深度', '体现出扎实的专业基础和实践经验'],
    '表达逻辑': ['回答结构清晰，逻辑层次分明', '表达有条理，思路清晰流畅', '叙述逻辑性强，层次递进自然'],
    '回答时效': ['回答节奏把控得当，时间利用合理', '回答时长适中，不疾不徐', '时间管理好，在合理时间内完成回答'],
    '语言表达': ['语言表达流畅自然，句式丰富', '表达清晰，用词准确得体', '语言组织能力强，表述规范']
  };

  // 弱项反馈模板池
  var weaknessTemplates = {
    '内容完整': ['内容可以更加充实，建议增加具体案例', '回答篇幅偏短，可以展开论述更多细节', '建议补充更多维度的内容以提升完整度'],
    '专业深度': ['可以多使用行业术语和专业表达', '建议增加对问题的深度分析和思考', '尝试从多角度分析，展现专业思维'],
    '表达逻辑': ['建议使用"首先/其次/最后"等逻辑词增强条理性', '可以尝试分点作答，使结构更清晰', '回答层次可以更分明，使用结构化表达'],
    '回答时效': ['回答时间偏短/偏长，注意节奏把控', '建议合理分配思考与回答时间', '调整回答节奏，保持从容不迫'],
    '语言表达': ['可以尝试使用更多样的句式表达', '注意标点使用，增强表达的连贯性', '建议丰富词汇，避免重复用词']
  };

  var si1 = Math.floor(seededRandom(hashSeed + 6) * 3);
  var si2 = Math.floor(seededRandom(hashSeed + 7) * 3);
  result.strengths = [strengthTemplates[bestDim][si1]];
  result.weaknesses = [weaknessTemplates[worstDim][si2]];

  // 如果分数差距小，加一个中性改进建议
  var scoreDiff = bestScore - worstScore;
  if (scoreDiff < 15 && worstDim !== bestDim) {
    var midTemplates = ['整体表现均衡，各维度均有提升空间', '各项能力较为平均，可以重点突破1-2个维度', '建议在保持优势的同时针对性提升弱项'];
    var mi = Math.floor(seededRandom(hashSeed + 8) * 3);
    result.weaknesses.push(midTemplates[mi]);
  }

  // 生成综合反馈
  var fb1 = '';
  if (result.score >= 85) {
    fb1 = '整体表现优秀，' + bestDim + '方面尤为突出';
  } else if (result.score >= 70) {
    fb1 = '整体表现良好，' + bestDim + '是您的优势维度';
  } else if (result.score >= 55) {
    fb1 = '回答基本合格，' + worstDim + '方面有较大提升空间';
  } else if (result.score >= 40) {
    fb1 = '回答有待加强，建议重点关注' + worstDim + '的提升';
  } else {
    fb1 = '建议更充分准备，从' + worstDim + '入手逐步提升';
  }

  var fb2 = result.weaknesses[0];
  result.feedback = fb1 + '。' + fb2 + '。';

  return result;
}

Page({
  data: {
    currentQuestion: null,
    questionIndex: 0,
    totalQuestions: 0,
    progressPercent: 0,
    formattedTime: '00:00',
    answer: '',
    isRecording: false,
    isRecognizing: false,
    isSpeaking: false,
    hasRecorded: false,
    isPlaying: false,
    showSpeechConfirm: false,
    speechText: '',
    showNext: false,
    isFavorited: false,
    score: 0,
    recordingDuration: 0,
    voiceSamples: []
  },

  recorderManager: null,
  innerAudioContext: null,
  timer: null,
  seconds: 0,
  tempFilePath: '',
  questionStartTime: 0,
  recordingStartTime: 0,
  voiceData: { totalDuration: 0, pauseCount: 0, lastPause: 0 },

  onLoad: function() {
    var progress = app.getInterviewProgress();
    if (!progress || !progress.questions || progress.questions.length === 0) {
      wx.showToast({ title: '无面试数据', icon: 'none' });
      setTimeout(function() {
        wx.navigateBack();
      }, 1500);
      return;
    }
    var q = progress.questions[0];
    var favs = app.getFavorites();
    var isFav = false;
    for (var i = 0; i < favs.length; i++) {
      if (favs[i].id === q.id) { isFav = true; break; }
    }
    this.setData({
      currentQuestion: q,
      questionIndex: 0,
      totalQuestions: progress.questions.length,
      progressPercent: 0,
      isFavorited: isFav,
      score: 0
    });
    this.initRecorder();
    this.startTimer();
    this.questionStartTime = Date.now();
    this.speakQuestion();
  },

  onUnload: function() {
    this.stopTimer();
    if (this.recorderManager) {
      this.recorderManager.stop();
    }
  },

  initRecorder: function() {
    var that = this;
    this.recorderManager = wx.getRecorderManager();
    this.recorderManager.onStart(function() {
      that.recordingStartTime = Date.now();
      that.setData({ isRecording: true, hasRecorded: false });
    });
    this.recorderManager.onStop(function(res) {
      that.tempFilePath = res.tempFilePath;
      var recDuration = Math.round((Date.now() - that.recordingStartTime) / 1000);
      that.setData({ isRecording: false, hasRecorded: true, recordingDuration: recDuration });
      // 收集语音样本数据
      that.voiceData.totalDuration += recDuration;
      that.recognizeSpeech(res.tempFilePath);
    });
    this.recorderManager.onError(function(err) {
      console.log('录音错误:', err);
      that.setData({ isRecording: false });
      wx.showToast({ title: '录音失败', icon: 'none' });
    });
  },

  startTimer: function() {
    var that = this;
    this.seconds = 0;
    this.timer = setInterval(function() {
      that.seconds++;
      var min = Math.floor(that.seconds / 60);
      var sec = that.seconds % 60;
      var minStr = min < 10 ? '0' + min : '' + min;
      var secStr = sec < 10 ? '0' + sec : '' + sec;
      that.setData({ formattedTime: minStr + ':' + secStr });
    }, 1000);
  },

  stopTimer: function() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  onToggleRecording: function() {
    if (this.data.isRecording) {
      this.recorderManager.stop();
      this.voiceData.pauseCount++;
    } else {
      this.setData({
        hasRecorded: false,
        speechText: '',
        showSpeechConfirm: false
      });
      this.recorderManager.start({
        duration: 60000,
        format: 'mp3',
        sampleRate: 16000,
        numberOfChannels: 1,
        encodeBitRate: 48000,
        frameSize: 50
      });
    }
  },

  speakQuestion: function() {
    var q = this.data.currentQuestion;
    if (!q || !q.question) return;
    var that = this;
    this.setData({ isSpeaking: true });
    wx.request({
      url: VOICE_SERVER + '/api/tts',
      method: 'POST',
      data: { text: q.question },
      header: { 'content-type': 'application/json' },
      success: function(res) {
        var data = res.data;
        if (typeof data === 'string') { try { data = JSON.parse(data); } catch(e) {} }
        if (data && data.code === 0 && data.audio) {
          var fs = wx.getFileSystemManager();
          var tmpPath = wx.env.USER_DATA_PATH + '/tts_' + Date.now() + '.mp3';
          fs.writeFileSync(tmpPath, data.audio, 'base64');
          if (that.innerAudioContext) { that.innerAudioContext.destroy(); }
          that.innerAudioContext = wx.createInnerAudioContext();
          that.innerAudioContext.src = tmpPath;
          that.innerAudioContext.onEnded(function() {
            that.setData({ isSpeaking: false });
            try { fs.unlinkSync(tmpPath); } catch(e) {}
          });
          that.innerAudioContext.onError(function() {
            that.setData({ isSpeaking: false });
          });
          that.innerAudioContext.play();
        } else {
          that.setData({ isSpeaking: false });
        }
      },
      fail: function() {
        that.setData({ isSpeaking: false });
      }
    });
  },

  recognizeSpeech: function(filePath) {
    var that = this;
    this.setData({ isRecognizing: true });
    wx.uploadFile({
      url: VOICE_SERVER + '/api/asr',
      filePath: filePath,
      name: 'audio',
      success: function(res) {
        var data = res.data;
        try {
          var result = JSON.parse(data);
          var text = result.result || result.text || '';
          if (text) {
            that.setData({
              speechText: text,
              showSpeechConfirm: true,
              isRecognizing: false
            });
          } else {
            that.setData({ isRecognizing: false });
            wx.showToast({ title: '未识别到内容', icon: 'none' });
          }
        } catch (e) {
          that.setData({ isRecognizing: false });
          wx.showToast({ title: '识别失败', icon: 'none' });
        }
      },
      fail: function() {
        that.setData({ isRecognizing: false });
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  onPlayRecord: function() {
    if (!this.tempFilePath) return;
    var that = this;
    this.innerAudioContext = wx.createInnerAudioContext();
    this.innerAudioContext.src = this.tempFilePath;
    this.innerAudioContext.onPlay(function() {
      that.setData({ isPlaying: true });
    });
    this.innerAudioContext.onEnded(function() {
      that.setData({ isPlaying: false });
    });
    this.innerAudioContext.onError(function() {
      that.setData({ isPlaying: false });
      wx.showToast({ title: '播放失败', icon: 'none' });
    });
    this.innerAudioContext.play();
  },

  onSpeechInput: function(e) {
    this.setData({ speechText: e.detail.value });
  },

  onCancelSpeech: function() {
    this.setData({ showSpeechConfirm: false, speechText: '' });
  },

  onConfirmSpeech: function() {
    var text = this.data.speechText;
    this.setData({
      answer: text,
      showSpeechConfirm: false
    });
  },

  onAnswerInput: function(e) {
    this.setData({ answer: e.detail.value });
  },

  onStopSpeaking: function() {
    if (this.innerAudioContext) {
      this.innerAudioContext.stop();
    }
    this.setData({ isSpeaking: false });
  },
  onRepeatQuestion: function() {
    var q = this.data.currentQuestion;
    if (!q) return;
    var that = this;
    this.setData({ isSpeaking: true });
    wx.request({
      url: VOICE_SERVER + '/api/tts',
      method: 'POST',
      data: { text: q.question },
      header: { 'content-type': 'application/json' },
      success: function(res) {
        var data = res.data;
        if (typeof data === 'string') { try { data = JSON.parse(data); } catch(e) {} }
        if (data && data.code === 0 && data.audio) {
          var fs = wx.getFileSystemManager();
          var tmpPath = wx.env.USER_DATA_PATH + '/tts_' + Date.now() + '.mp3';
          fs.writeFileSync(tmpPath, data.audio, 'base64');
          if (that.innerAudioContext) { that.innerAudioContext.destroy(); }
          that.innerAudioContext = wx.createInnerAudioContext();
          that.innerAudioContext.src = tmpPath;
          that.innerAudioContext.onEnded(function() {
            that.setData({ isSpeaking: false });
            try { fs.unlinkSync(tmpPath); } catch(e) {}
          });
          that.innerAudioContext.onError(function() {
            that.setData({ isSpeaking: false });
          });
          that.innerAudioContext.play();
        } else {
          that.setData({ isSpeaking: false });
          wx.showToast({ title: '朗读服务未就绪', icon: 'none' });
        }
      },
      fail: function() {
        that.setData({ isSpeaking: false });
        wx.showToast({ title: '朗读失败', icon: 'none' });
      }
    });
  },

  onToggleFavorite: function() {
    var q = this.data.currentQuestion;
    if (!q) return;
    if (this.data.isFavorited) {
      app.removeFavorite(q.id);
      this.setData({ isFavorited: false });
      wx.showToast({ title: '已取消收藏', icon: 'none' });
    } else {
      app.addFavorite(q);
      this.setData({ isFavorited: true });
      wx.showToast({ title: '已收藏', icon: 'success' });
    }
  },

  onSubmit: function() {
    var answer = this.data.answer.trim();
    if (!answer) {
      wx.showToast({ title: '请先输入或录音回答', icon: 'none' });
      return;
    }
    var progress = app.getInterviewProgress();
    var timeSpent = Math.round((Date.now() - this.questionStartTime) / 1000);
    var analysis = analyzeAnswer(this.data.currentQuestion.question, answer, timeSpent);

    var answerObj = {
      question: this.data.currentQuestion,
      answer: answer,
      time: timeSpent,
      score: analysis.score,
      dimensions: analysis.dimensions,
      feedback: analysis.feedback,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses
    };
    progress.answers.push(answerObj);
    progress.currentQuestion = this.data.questionIndex + 1;
    app.setInterviewProgress(progress);

    this.setData({
      showNext: true,
      score: analysis.score
    });
  },

  onNext: function() {
    var progress = app.getInterviewProgress();
    var nextIndex = this.data.questionIndex + 1;
    if (nextIndex >= this.data.totalQuestions) {
      this.goToReport(progress);
      return;
    }
    var q = progress.questions[nextIndex];
    var favs = app.getFavorites();
    var isFav = false;
    for (var i = 0; i < favs.length; i++) {
      if (favs[i].id === q.id) { isFav = true; break; }
    }
    var percent = Math.round((nextIndex / this.data.totalQuestions) * 100);
    this.setData({
      currentQuestion: q,
      questionIndex: nextIndex,
      progressPercent: percent,
      answer: '',
      showNext: false,
      isFavorited: isFav,
      score: 0,
      hasRecorded: false,
      speechText: '',
      showSpeechConfirm: false
    });
    this.questionStartTime = Date.now();
    this.speakQuestion();
  },

  goToReport: function(progress) {
    this.stopTimer();
    var totalScore = 0;
    var answers = progress.answers || [];
    var totalDuration = 0;
    var pauseCount = 0;

    for (var i = 0; i < answers.length; i++) {
      totalScore += answers[i].score || 0;
      totalDuration += answers[i].time || 0;
      if (answers[i].question && typeof answers[i].question !== 'string') {
        answers[i].questionId = answers[i].question.id || answers[i].question.num || (i + 1);
        answers[i].question = answers[i].question.question || '';
      } else {
        answers[i].questionId = i + 1;
      }
    }

    var avgScore = answers.length > 0 ? Math.round(totalScore / answers.length) : 0;
    var title = (progress.category || '') + ' - ' + (progress.job || '');

    // 收集语音分析数据
    var voiceAnalysis = {
      totalDuration: totalDuration,
      avgDuration: answers.length > 0 ? Math.round(totalDuration / answers.length) : 0,
      pauseCount: this.voiceData ? this.voiceData.pauseCount : 0,
      hasRecording: this.data.hasRecorded
    };

    wx.setStorageSync('reportData', JSON.stringify({
      score: avgScore,
      title: title,
      answers: answers,
      voiceAnalysis: voiceAnalysis,
      scene: progress.scene,
      job: progress.job
    }));

    wx.redirectTo({
      url: '/pages/report/report?score=' + avgScore + '&title=' + encodeURIComponent(title)
    });
  }
});