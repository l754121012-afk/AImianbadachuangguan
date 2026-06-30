const app = getApp();
const { getQuestions, getDefaultJob } = require('../../data/questions.js');

Page({
  data: {
    questions: [],
    currentIndex: 0,
    totalQuestions: 5,
    isRecording: false,
    timer: '00:00',
    aiMessage: '',
    userAnswer: '',
    showFinish: false,
    interviewTitle: ''
  },
  recordInterval: null,
  seconds: 0,

  onLoad(options) {
    const continueFlag = options.continue;
    const savedProgress = app.getInterviewProgress();

    if (continueFlag && savedProgress) {
      // 继续上次进度
      this.setData({
        questions: savedProgress.questions || [],
        currentIndex: savedProgress.currentQuestion || 0,
        totalQuestions: savedProgress.questions ? savedProgress.questions.length : 5,
        interviewTitle: savedProgress.job || '面试中',
        aiMessage: (savedProgress.questions || [])[savedProgress.currentQuestion || 0]?.question || '请开始回答'
      });
    } else {
      // 新面试
      this.startNewInterview();
    }
  },

  startNewInterview() {
    const scene = app.globalData.currentScene || 'job';
    const category = app.globalData.currentCategory || '互联网';
    const job = app.globalData.currentJob || getDefaultJob(scene, category);
    const difficulty = app.globalData.currentDifficulty || '基础';
    const mode = app.globalData.currentMode || 'voice';

    const questions = getQuestions(scene, job);

    this.setData({
      questions: questions.length > 0 ? questions : this.getDefaultQuestions(),
      totalQuestions: questions.length || 5,
      currentIndex: 0,
      interviewTitle: job,
      aiMessage: questions[0]?.question || '请做一个自我介绍'
    });

    // 保存初始进度
    app.setInterviewProgress({
      scene, category, job, difficulty, mode,
      questions: questions.length > 0 ? questions : this.getDefaultQuestions(),
      currentQuestion: 0,
      answers: [],
      startTime: Date.now()
    });

    app.useFreeCount();
  },

  getDefaultQuestions() {
    return [
      { id: 'd1', title: '自我介绍', question: '请做一个简短的自我介绍', type: '基础' },
      { id: 'd2', title: '项目经历', question: '介绍一下你最近参与的项目', type: '基础' },
      { id: 'd3', title: '职业规划', question: '你的职业规划是什么？', type: '基础' },
      { id: 'd4', title: '优势劣势', question: '谈谈你的优势和劣势', type: '基础' },
      { id: 'd5', title: '提问环节', question: '你有什么问题想问我的吗？', type: '基础' }
    ];
  },

  toggleRecording() {
    this.setData({ isRecording: !this.data.isRecording });
    if (this.data.isRecording) {
      this.seconds = 0;
      this.recordInterval = setInterval(() => {
        this.seconds++;
        const mins = Math.floor(this.seconds / 60).toString().padStart(2, '0');
        const secs = (this.seconds % 60).toString().padStart(2, '0');
        this.setData({ timer: `${mins}:${secs}` });
      }, 1000);
    } else {
      clearInterval(this.recordInterval);
    }
  },

  onNext() {
    const { currentIndex, totalQuestions, questions } = this.data;
    const nextIndex = currentIndex + 1;

    // 保存当前答案和进度
    const progress = app.getInterviewProgress();
    if (progress) {
      progress.currentQuestion = nextIndex;
      progress.answers.push({ questionIndex: currentIndex, answer: this.data.userAnswer });
      app.setInterviewProgress(progress);
    }

    if (nextIndex >= totalQuestions) {
      this.setData({ showFinish: true });
    } else {
      this.setData({
        currentIndex: nextIndex,
        aiMessage: questions[nextIndex]?.question || '',
        userAnswer: '',
        isRecording: false,
        timer: '00:00'
      });
      clearInterval(this.recordInterval);
      this.seconds = 0;
    }
  },

  onFinish() {
    clearInterval(this.recordInterval);
    const progress = app.getInterviewProgress();

    // 模拟评分
    const score = Math.floor(Math.random() * 20) + 75; // 75-95分
    const duration = progress ? Math.round((Date.now() - progress.startTime) / 60000) : 5;

    // 保存历史记录
    const record = {
      id: Date.now(),
      title: progress ? progress.job : '面试练习',
      date: new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      difficulty: progress ? progress.difficulty : '基础',
      mode: progress && progress.mode === 'voice' ? '语音' : '文字',
      score: score,
      icon: progress && progress.scene === 'job' ? '💼' : progress && progress.scene === 'kaoyan' ? '📚' : '🏛️',
      color: progress ? progress.scene : 'job',
      scene: progress ? progress.scene : 'job'
    };
    app.addInterviewHistory(record);

    // 清除进度
    app.clearInterviewProgress();

    wx.redirectTo({
      url: '/pages/report/report?score=' + score + '&title=' + encodeURIComponent(record.title)
    });
  },

  onUnload() {
    clearInterval(this.recordInterval);
  }
});
