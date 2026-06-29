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
    onSelectCategory(e) {
      const name = e.currentTarget.dataset.name;
      this.setData({ selectedCategory: name });
    },

    onClose() {
      this.triggerEvent('close');
    },

    onStart() {
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
