Page({
  data: {
    questions: [],
    answers: [],
    currentIndex: 0,
    total: 0,
    currentQ: null,
    currentA: null
  },
  onLoad: function() {
    var data = wx.getStorageSync('replayData');
    if (!data || !data.questions || data.questions.length === 0) {
      wx.showToast({ title: '无回看数据', icon: 'none' });
      var that = this;
      setTimeout(function() {
        wx.navigateBack();
      }, 1500);
      return;
    }
    var firstQ = data.questions[0];
    var firstA = data.answers[0] ? data.answers[0].answer : '';
    this.setData({
      questions: data.questions,
      answers: data.answers,
      total: data.questions.length,
      currentQ: firstQ,
      currentA: firstA
    });
  },
  onPrev: function() {
    var idx = this.data.currentIndex - 1;
    if (idx < 0) return;
    var q = this.data.questions[idx];
    var a = this.data.answers[idx] ? this.data.answers[idx].answer : '';
    this.setData({
      currentIndex: idx,
      currentQ: q,
      currentA: a
    });
  },
  onNext: function() {
    var idx = this.data.currentIndex + 1;
    if (idx >= this.data.total) return;
    var q = this.data.questions[idx];
    var a = this.data.answers[idx] ? this.data.answers[idx].answer : '';
    this.setData({
      currentIndex: idx,
      currentQ: q,
      currentA: a
    });
  }
});