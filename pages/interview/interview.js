var app = getApp();
var VOICE_SERVER = 'http://10.1.2.155:3000';
var util = require('../../utils/util');

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
    this.recorderManager = wx.getRecorderManager();
    var that = this;
    this.recorderManager.onStart(function() {
      that.setData({ isRecording: true });
    });
    this.recorderManager.onStop(function(res) {
      that.tempFilePath = res.tempFilePath;
      that.setData({
        isRecording: false,
        hasRecorded: true
      });
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

    var that = this;
    wx.request({
      url: VOICE_SERVER + '/score',
      method: 'POST',
      data: {
        question: this.data.currentQuestion.question,
        reference: this.data.currentQuestion.reference || '',
        answer: answer
      },
      success: function(res) {
        var score = 0;
        if (res.data && typeof res.data.score === 'number') {
          score = res.data.score;
        } else {
          var answerLen = answer.length;
          if (answerLen > 200) score = 85;
          else if (answerLen > 100) score = 75;
          else if (answerLen > 50) score = 65;
          else if (answerLen > 20) score = 55;
          else score = 40;
        }
        answerObj.score = score;
        app.setInterviewProgress(progress);
        that.setData({
          showNext: true,
          score: score
        });
      },
      fail: function() {
        var answerLen = answer.length;
        var score = 70;
        if (answerLen > 200) score = 85;
        else if (answerLen > 100) score = 75;
        else if (answerLen > 50) score = 65;
        else if (answerLen > 20) score = 55;
        else score = 40;
        answerObj.score = score;
        app.setInterviewProgress(progress);
        that.setData({
          showNext: true,
          score: score
        });
      }
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
    for (var i = 0; i < progress.answers.length; i++) {
      totalScore += progress.answers[i].score;
    }
    var avgScore = Math.round(totalScore / progress.answers.length);
    var title = progress.category + ' - ' + progress.job;
    var answersStr = JSON.stringify(progress.answers);
    wx.redirectTo({
      url: '/pages/report/report?score=' + avgScore + '&title=' + encodeURIComponent(title) + '&answers=' + encodeURIComponent(answersStr)
    });
  }
});