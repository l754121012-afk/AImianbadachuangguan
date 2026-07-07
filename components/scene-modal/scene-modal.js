Component({
  properties: {
    scene: {
      type: Object,
      value: {}
    }
  },

  data: {
    selectedCategory: ''
  },

  methods: {
    // 阻止内容区域冒泡（兜底）
    onContentTap: function() {
      // do nothing, just stop propagation
    },

    onSelectCategory: function(e) {
      var name = e.currentTarget.dataset.name;
      this.setData({ selectedCategory: name });
    },

    onClose: function() {
      this.triggerEvent('close');
    },

    onStart: function() {
      if (!this.data.selectedCategory) {
        wx.showToast({ title: '请先选择一个分类', icon: 'none' });
        return;
      }
      this.triggerEvent('select', {
        sceneId: this.properties.scene.id,
        categoryName: this.data.selectedCategory
      });
    }
  }
});
