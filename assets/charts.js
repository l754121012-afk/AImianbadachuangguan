// assets/charts.js
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // --- Chart 1: Revenue Model ---
  var chartRevenue = echarts.init(document.getElementById('chart-revenue'), null, { renderer: 'svg' });
  chartRevenue.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      axisPointer: { type: 'shadow' },
      backgroundColor: '#1a1a2e',
      borderColor: '#2d2d44',
      textStyle: { color: '#e5e7eb' }
    },
    legend: {
      data: ['付费收入', '广告收入', '总收入'],
      top: 5,
      textStyle: { color: muted, fontSize: 12 }
    },
    grid: { left: 60, right: 30, top: 50, bottom: 40 },
    xAxis: {
      type: 'category',
      data: ['100 DAU', '300 DAU', '500 DAU', '1000 DAU', '2000 DAU', '5000 DAU', '10000 DAU'],
      axisLabel: { color: muted, fontSize: 11 },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'value',
      name: '月收入（元）',
      nameTextStyle: { color: muted, fontSize: 11 },
      axisLabel: { color: muted, fontSize: 11, formatter: function(v) { return v >= 10000 ? (v/10000).toFixed(1) + '万' : v; } },
      splitLine: { lineStyle: { color: rule } },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [
      {
        name: '付费收入',
        type: 'bar',
        stack: 'total',
        data: [200, 900, 2250, 6000, 14400, 45000, 105000],
        itemStyle: { color: accent, borderRadius: [0,0,0,0] }
      },
      {
        name: '广告收入',
        type: 'bar',
        stack: 'total',
        data: [135, 540, 1050, 2400, 5100, 13500, 27000],
        itemStyle: { color: accent2, borderRadius: [4,4,0,0] }
      },
      {
        name: '总收入',
        type: 'line',
        data: [335, 1440, 3300, 8400, 19500, 58500, 132000],
        lineStyle: { color: '#10b981', width: 2, type: 'dashed' },
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#10b981' }
      }
    ]
  });
  window.addEventListener('resize', function() { chartRevenue.resize(); });

  // --- Chart 2: Seasonal Rhythm ---
  var chartSeason = echarts.init(document.getElementById('chart-season'), null, { renderer: 'svg' });
  chartSeason.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: '#1a1a2e',
      borderColor: '#2d2d44',
      textStyle: { color: '#e5e7eb' }
    },
    legend: {
      data: ['DAU预测', '广告投放力度'],
      top: 5,
      textStyle: { color: muted, fontSize: 12 }
    },
    grid: { left: 60, right: 60, top: 50, bottom: 40 },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLabel: { color: muted, fontSize: 11 },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: [
      {
        type: 'value',
        name: 'DAU',
        nameTextStyle: { color: muted },
        axisLabel: { color: muted },
        splitLine: { lineStyle: { color: rule } },
        axisLine: { lineStyle: { color: rule } }
      },
      {
        type: 'value',
        name: '投放占比',
        max: 50,
        nameTextStyle: { color: muted },
        axisLabel: { color: muted, formatter: '{value}%' },
        splitLine: { show: false },
        axisLine: { lineStyle: { color: rule } }
      }
    ],
    series: [
      {
        name: 'DAU预测',
        type: 'line',
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: accent + '40' }, { offset: 1, color: 'transparent' }]
          }
        },
        lineStyle: { color: accent, width: 2.5 },
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: accent },
        data: [800, 700, 1500, 1800, 900, 600, 500, 800, 2000, 3500, 4000, 1000]
      },
      {
        name: '广告投放力度',
        type: 'bar',
        yAxisIndex: 1,
        data: [20, 20, 40, 40, 5, 5, 5, 5, 35, 35, 35, 0],
        itemStyle: { color: accent2 + '60', borderRadius: [3, 3, 0, 0] },
        barWidth: '40%'
      }
    ]
  });
  window.addEventListener('resize', function() { chartSeason.resize(); });

  // --- Chart 3: Gantt Chart ---
  var chartGantt = echarts.init(document.getElementById('chart-gantt'), null, { renderer: 'svg' });
  chartGantt.setOption({
    animation: false,
    tooltip: {
      trigger: 'axis',
      appendToBody: true,
      backgroundColor: '#1a1a2e',
      borderColor: '#2d2d44',
      textStyle: { color: '#e5e7eb' },
      formatter: function(params) {
        var p = params[0];
        return p.name + '<br/>工期：第' + p.value[0] + '-' + p.value[1] + '天（共' + (p.value[1]-p.value[0]+1) + '天）';
      }
    },
    grid: { left: 140, right: 40, top: 20, bottom: 30 },
    xAxis: {
      type: 'value',
      min: 1, max: 21,
      axisLabel: { color: muted, formatter: '第{value}天' },
      splitLine: { lineStyle: { color: rule } },
      axisLine: { lineStyle: { color: rule } }
    },
    yAxis: {
      type: 'category',
      data: [
        '题库引擎',
        'AI对话引擎',
        'ASR/TTS集成',
        '评分报告生成',
        '用户+支付系统',
        '广告+裂变系统',
        'UI开发调试',
        '审核提交'
      ],
      axisLabel: { color: ink, fontSize: 12 },
      axisLine: { lineStyle: { color: rule } },
      axisTick: { show: false }
    },
    series: [{
      type: 'custom',
      renderItem: function(params, api) {
        var categoryIndex = api.value(0);
        var start = api.coord([api.value(1), categoryIndex]);
        var end = api.coord([api.value(2), categoryIndex]);
        var height = api.size([0, 1])[1] * 0.5;
        var rectShape = echarts.graphic.clipRectByRect({
          x: start[0], y: start[1] - height / 2,
          width: end[0] - start[0], height: height
        }, { x: params.coordSys.x, y: params.coordSys.y, width: params.coordSys.width, height: params.coordSys.height });
        return rectShape && { type: 'rect', shape: rectShape, style: api.style(), transition: ['shape'] };
      },
      encode: { x: [1, 2], y: 0 },
      data: [
        [0, 1, 4],     // 题库引擎 Day1-4
        [1, 2, 6],     // AI对话 Day2-6
        [2, 5, 10],    // ASR/TTS Day5-10
        [3, 7, 11],    // 评分报告 Day7-11
        [4, 8, 12],    // 用户+支付 Day8-12
        [5, 12, 15],   // 广告+裂变 Day12-15
        [6, 6, 16],    // UI Day6-16
        [7, 17, 19]    // 审核 Day17-19
      ],
      itemStyle: {
        color: function(params) {
          var colors = [accent, accent2, '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#ef4444'];
          return colors[params.dataIndex] + 'cc';
        },
        borderRadius: 3
      }
    }]
  });
  window.addEventListener('resize', function() { chartGantt.resize(); });

  // --- Chart 4: KPI Radar ---
  var chartKpi = echarts.init(document.getElementById('chart-kpi'), null, { renderer: 'svg' });
  chartKpi.setOption({
    animation: false,
    tooltip: {
      appendToBody: true,
      backgroundColor: '#1a1a2e',
      borderColor: '#2d2d44',
      textStyle: { color: '#e5e7eb' }
    },
    radar: {
      indicator: [
        { name: '用户增长', max: 100 },
        { name: '付费转化', max: 100 },
        { name: '用户留存', max: 100 },
        { name: '裂变系数', max: 100 },
        { name: '收入增长', max: 100 },
        { name: '产品体验', max: 100 }
      ],
      shape: 'circle',
      splitNumber: 4,
      axisName: { color: ink, fontSize: 12 },
      splitLine: { lineStyle: { color: rule } },
      splitArea: { show: false },
      axisLine: { lineStyle: { color: rule } }
    },
    series: [
      {
        name: '第30天',
        type: 'radar',
        data: [{ value: [20, 30, 30, 20, 10, 50], name: '第30天' }],
        lineStyle: { color: accent2 },
        itemStyle: { color: accent2 },
        areaStyle: { color: accent2 + '20' }
      },
      {
        name: '第60天',
        type: 'radar',
        data: [{ value: [40, 50, 50, 45, 35, 65], name: '第60天' }],
        lineStyle: { color: accent },
        itemStyle: { color: accent },
        areaStyle: { color: accent + '20' }
      },
      {
        name: '第90天',
        type: 'radar',
        data: [{ value: [70, 70, 65, 65, 65, 80], name: '第90天' }],
        lineStyle: { color: '#10b981' },
        itemStyle: { color: '#10b981' },
        areaStyle: { color: '#10b981' + '20' }
      }
    ],
    legend: {
      bottom: 5,
      textStyle: { color: muted, fontSize: 12 }
    }
  });
  window.addEventListener('resize', function() { chartKpi.resize(); });

})();
