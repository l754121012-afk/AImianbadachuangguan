// 面试题库数据
var QUESTION_BANK = {
  job: {
    '产品经理': [
      { id: 'j1', title: '自我介绍', question: '请做一个简短的自我介绍，重点突出与产品相关的经验和能力。', type: '基础' },
      { id: 'j2', title: '项目经历', question: '介绍你最近负责的一个产品项目，包括背景、你的角色、关键决策和最终成果。', type: '基础' },
      { id: 'j3', title: '需求分析', question: '如果让你设计一款面向老年人的健康监测App，你会如何开展需求分析？', type: '专业' },
      { id: 'j4', title: '竞品分析', question: '请对比分析抖音和小红书的内容推荐策略，说说各自的优劣势。', type: '专业' },
      { id: 'j5', title: '数据驱动', question: '上线新功能后数据表现不佳，你会如何分析原因并制定优化方案？', type: '进阶' }
    ],
    'Java开发': [
      { id: 'j6', title: '自我介绍', question: '请介绍你的技术背景和擅长的技术栈。', type: '基础' },
      { id: 'j7', title: '项目难点', question: '你参与的项目中遇到的最大技术挑战是什么？如何解决的？', type: '基础' },
      { id: 'j8', title: 'JVM原理', question: '请简述Java内存模型，以及垃圾回收机制的工作原理。', type: '专业' },
      { id: 'j9', title: '高并发', question: '如何设计一个能支撑百万QPS的秒杀系统？请从架构层面说明。', type: '进阶' },
      { id: 'j10', title: '微服务', question: '微服务架构下服务间调用失败，你有哪些容错和降级方案？', type: '进阶' }
    ],
    '前端开发': [
      { id: 'j11', title: '自我介绍', question: '请介绍你的前端技术栈和项目经验。', type: '基础' },
      { id: 'j12', title: '性能优化', question: '首屏加载时间超过3秒，你会从哪些方面进行优化？', type: '专业' },
      { id: 'j13', title: '框架对比', question: 'Vue和React的核心设计思想有何不同？你更倾向于哪个？', type: '专业' },
      { id: 'j14', title: '跨端方案', question: '请对比Flutter、React Native和原生开发的优劣势。', type: '进阶' },
      { id: 'j15', title: '工程化', question: '如何设计前端监控体系来及时发现线上问题？', type: '进阶' }
    ],
    '运营专员': [
      { id: 'j16', title: '自我介绍', question: '请介绍你的运营经验和擅长的运营领域。', type: '基础' },
      { id: 'j17', title: '活动策划', question: '如果要为一款新上线的APP策划拉新活动，你的整体思路是什么？', type: '专业' },
      { id: 'j18', title: '数据分析', question: '日活突然下降20%，你会如何分析原因？', type: '专业' },
      { id: 'j19', title: '用户增长', question: '请设计一套完整的用户增长方案，包含获客、激活、留存各环节。', type: '进阶' },
      { id: 'j20', title: '危机处理', question: '产品出现负面舆情，作为运营负责人你会如何应对？', type: '进阶' }
    ]
  },
  kaoyan: {
    '计算机科学': [
      { id: 'k1', title: '自我介绍', question: '请做自我介绍，重点介绍本科阶段的科研或项目经历。', type: '基础' },
      { id: 'k2', title: '报考动机', question: '为什么选择我们学校/专业？你对导师的研究方向有什么了解？', type: '基础' },
      { id: 'k3', title: '数据结构', question: '请比较红黑树和AVL树的区别，以及各自的应用场景。', type: '专业' },
      { id: 'k4', title: '操作系统', question: '进程和线程的区别是什么？什么时候用多进程，什么时候用多线程？', type: '专业' },
      { id: 'k5', title: '研究规划', question: '如果被录取，你的研究生阶段规划是什么？有没有读博的打算？', type: '综合' }
    ],
    '工商管理': [
      { id: 'k6', title: '自我介绍', question: '请做自我介绍，突出你的管理实践或商业分析能力。', type: '基础' },
      { id: 'k7', title: '职业规划', question: '读完MBA后你的职业规划是什么？MBA如何帮助你实现目标？', type: '基础' },
      { id: 'k8', title: '案例分析', question: '某传统零售企业业绩下滑，请分析可能的原因并提出转型建议。', type: '专业' },
      { id: 'k9', title: '领导力', question: '请举例说明你在团队中展现领导力的经历。', type: '综合' },
      { id: 'k10', title: '时事热点', question: '如何看待当前人工智能对传统行业的冲击？企业应如何应对？', type: '综合' }
    ]
  },
  kaogong: {
    '综合管理': [
      { id: 'g1', title: '自我介绍', question: '请做一个2分钟的自我介绍。', type: '基础' },
      { id: 'g2', title: '综合分析', question: '有人说"细节决定成败"，也有人说"成大事者不拘小节"，你怎么看？', type: '综合' },
      { id: 'g3', title: '应急应变', question: '你正在主持一场重要会议，突然停电了，你会怎么处理？', type: '应变' },
      { id: 'g4', title: '人际关系', question: '你和同事共同完成一项任务，但同事不配合，你怎么办？', type: '人际' },
      { id: 'g5', title: '组织管理', question: '单位要组织一次重阳节敬老活动，领导交给你负责，你会如何组织？', type: '组织' }
    ],
    '行政执法': [
      { id: 'g6', title: '自我介绍', question: '请做一个自我介绍，说明你适合行政执法岗位的原因。', type: '基础' },
      { id: 'g7', title: '法治观念', question: '严格执法与温情执法如何平衡？请谈谈你的看法。', type: '综合' },
      { id: 'g8', title: '应急处理', question: '执法过程中遭遇群众围观拍摄，有人煽动情绪，你怎么办？', type: '应变' },
      { id: 'g9', title: '职业素养', question: '作为执法人员，如何做到公正廉洁？', type: '综合' },
      { id: 'g10', title: '服务意识', question: '有群众投诉执法态度不好，领导让你处理，你会怎么做？', type: '人际' }
    ]
  }
};

// 获取指定场景和岗位的题目
function getQuestions(scene, job) {
  var sceneData = QUESTION_BANK[scene];
  if (!sceneData) return [];
  var questions = sceneData[job] || sceneData[Object.keys(sceneData)[0]] || [];
  var result = []; for (var qi = 0; qi < questions.length; qi++) { var q = questions[qi]; var obj = {}; for (var key in q) { if (q.hasOwnProperty(key)) obj[key] = q[key]; } obj.num = qi + 1; result.push(obj); } return result;
}

// 获取默认岗位
function getDefaultJob(scene, category) {
  var defaults = {
    job: { '互联网': '产品经理', '金融': '金融分析师', '快消': '品牌经理', '制造业': '生产主管', '咨询': '管理咨询', '医疗': '临床医生' },
    kaoyan: { '理工': '计算机科学', '文史': '中国语言文学', '经管': '工商管理', '法学': '民商法', '教育': '教育学', '医学': '临床医学' },
    kaogong: { '国考': '综合管理', '省考': '省级机关', '事业编': '教育事业单位', '军队文职': '行政管理', '遴选': '省级遴选', '村官': '大学生村官' }
  };
  return (defaults[scene] && defaults[scene][category]) || '产品经理';
}

module.exports = {
  getQuestions,
  getDefaultJob,
  QUESTION_BANK
};
