// components/arrowRight/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShowPop: {
      type: Boolean,
      value: false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    openShare: function () {
      this.setData({
        isShowPop: !this.data.isShowPop
      })
      this.triggerEvent('isShowPop', this.data.isShowPop)
    }
  }
})
