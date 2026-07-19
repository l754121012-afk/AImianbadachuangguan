var app = getApp();
var VOICE_SERVER = 'http://10.1.2.155:3000';
var util = require('../../utils/util');
// 基于内容质量的回答分析评分
function analyzeAnswer(question, answer, timeSpent) {
  var result = { score: 0, dimensions: {} };

  // 1. 长度评分 (0-25分)
  var len = answer.length;
  var lenScore = 0;
  if (len >= 200) lenScore = 25;
  else if (len >= 100) lenScore = 20;
  else if (len >= 50) lenScore = 15;
  else if (len >= 20) lenScore = 10;
  else lenScore = 5;
  result.dimensions['内容完整'] = Math.min(100, Math.round(lenScore * 4));

  // 2. 关键词/专业术语评分 (0-25分)
  var proTerms = ['例如', '比如', '首先', '其次', '最后', '总之', '因为', '所以', '通过', '利用', '实现', '优化', '分析', '设计', '方案', '策略', '架构', '流程', '数据', '用户', '体验', '性能', '效率', '目标', '结果', 'STAR', '迭代', '复盘', '总结', '优势', '劣势', '挑战', '解决', '协作', '沟通', '负责', '主导', '参与', '改进', '提升', '降低', '增加', '减少', '模块', '系统', '平台', '工具', '技术', '方法', '框架', '模型', '算法', '指标', '转化', '留存', '活跃', '功能', '需求', '测试', '部署', '上线', '反馈'];
  var termCount = 0;
  for (var i = 0; i < proTerms.length; i++) {
    if (answer.indexOf(proTerms[i]) !== -1) termCount++;
  }
  var proScore = Math.min(25, Math.round(termCount * 2.5));
  result.dimensions['专业深度'] = Math.min(100, Math.round(proScore * 4));

  // 3. 逻辑结构评分 (0-25分) - 检查逻辑连接词和分段
  var logicWords = ['首先', '其次', '再次', '最后', '第一', '第二', '第三', '一方面', '另一方面', '不但', '而且', '虽然', '但是', '然而', '因此', '综上', '总的来说', '具体来说', '也就是说', '简而言之'];
  var logicCount = 0;
  for (var j = 0; j < logicWords.length; j++) {
    if (answer.indexOf(logicWords[j]) !== -1) logicCount++;
  }
  // 有编号或分点也加分
  var hasNumbers = (/\d[.、)）]/.test(answer));
  var hasSeparator = (/[；;]/.test(answer));
  var logicScore = Math.min(25, logicCount * 4 + (hasNumbers ? 5 : 0) + (hasSeparator ? 3 : 0));
  result.dimensions['表达逻辑'] = Math.min(100, Math.round(logicScore * 4));

  // 4. 时效评分 (0-25分) - 回答时间是否合理
  var timeScore = 0;
  if (timeSpent >= 15 && timeSpent <= 120) timeScore = 25;
  else if (timeSpent >= 10 && timeSpent <= 180) timeScore = 20;
  else if (timeSpent >= 5) timeScore = 15;
  else if (timeSpent >= 3) timeScore = 10;
  else timeScore = 5;
  result.dimensions['回答时效'] = Math.min(100, Math.round(timeScore * 4));

  // 5. 语言表达评分 (0-25分) - 基于句子完整性和多样性
  var sentences = answer.split(/[。！？!?]/);
  var completeSentences = 0;
  for (var k = 0; k < sentences.length; k++) {
    if (sentences[k].trim().length >= 5) completeSentences++;
  }
  var sentScore = Math.min(20, completeSentences * 3);
  // 有标点符号使用加分
  var hasPunctuation = /[，,。.！!？?、]/.test(answer);
  if (hasPunctuation) sentScore += 5;
  result.dimensions['语言表达'] = Math.min(100, Math.round(sentScore * 4));

  // 总分 = 四维之和（满分100）
  result.score = Math.round(lenScore + proScore + logicScore + timeScore + sentScore);
  result.score = Math.max(10, Math.min(100, result.score));

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
    score: 0
  },

  recorderManager: null,
  innerAudioContext: null,
  timer: null,
  seconds: 0,
  tempFilePath: '',
  questionStartTime: 0,

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
      that.setData({ isRecording: true, hasRecorded: false });
    });
    this.recorderManager.onStop(function(res) {
      that.tempFilePath = res.tempFilePath;
      that.setData({ isRecording: false, hasRecorded: true });
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
    var answerObj = {
      question: this.data.currentQuestion,
      answer: answer,
      time: timeSpent,
      score: 0
    };
    progress.answers.push(answerObj);
    progress.currentQuestion = this.data.questionIndex + 1;
    app.setInterviewProgress(progress);

        // 本地内容分析评分
    var analysis = analyzeAnswer(this.data.currentQuestion.question, answer, timeSpent);
    var score = analysis.score;
    answerObj.score = score;
    answerObj.dimensions = analysis.dimensions;
    app.setInterviewProgress(progress);
    this.setData({
      showNext: true,
      score: score
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
    for (var i = 0; i < answers.length; i++) {
      totalScore += answers[i].score || 0;
      // 精简question对象，只保留文本；同时保存questionId用于收藏匹配
      if (answers[i].question && typeof answers[i].question !== 'string') {
        answers[i].questionId = answers[i].question.id || answers[i].question.num || (i + 1);
        answers[i].question = answers[i].question.question || '';
      } else {
        answers[i].questionId = i + 1;
      }
    }
    var avgScore = answers.length > 0 ? Math.round(totalScore / answers.length) : 0;
    var title = (progress.category || '') + ' - ' + (progress.job || '');
    // 用storage传递数据，避免URL过长被截断
    wx.setStorageSync('reportData', JSON.stringify({ score: avgScore, title: title, answers: answers }));
    wx.redirectTo({
      url: '/pages/report/report?score=' + avgScore + '&title=' + encodeURIComponent(title)
    });
  }
});