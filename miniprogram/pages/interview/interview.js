const app = getApp();

Page({
  data: {
    currentQuestion: 1,
    totalQuestions: 5,
    timer: 0,
    isRecording: false,
    recordingTimer: null,
    questions: [
      { id: 1, text: '请先做一个简短的自我介绍，重点说明你的教育背景和求职动机。', type: 'ai' },
      { id: 2, text: '请介绍一下你最近的一个项目经历，重点讲一下你在其中遇到的困难和解决方案。', type: 'ai' }
    ],
    answers: []
  },

  onLoad() {
    // 加载面试题目
  },

  onUnload() {
    this.stopRecording();
  },

  toggleRecording() {
    if (this.data.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  },

  startRecording() {
    this.setData({ isRecording: true, timer: 0 });
    const timer = setInterval(() => {
      this.setData({ timer: this.data.timer + 1 });
    }, 1000);
    this.setData({ recordingTimer: timer });
  },

  stopRecording() {
    if (this.data.recordingTimer) {
      clearInterval(this.data.recordingTimer);
    }
    this.setData({ isRecording: false, recordingTimer: null });
  },

  formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  },

  onSwitchToText() {
    wx.showToast({ title: '已切换文字模式', icon: 'none' });
  },

  onFinish() {
    this.stopRecording();
    app.useFreeCount();
    wx.redirectTo({ url: '/pages/report/report' });
  }
});
