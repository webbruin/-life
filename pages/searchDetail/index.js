//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    result: {}
  },
  onLoad: function (options) {
    let prevPage = getCurrentPages()[getCurrentPages().length - 2]
    wx.setNavigationBarTitle({ title: options.name || '' })
    this.setData({
      origin: prevPage.data.origin,
      result: prevPage.data.result[options.index]
    })
  },
  toRoute: function () {
    let data = this.data.result
    wx.navigateTo({
      url: `../route/index?mode=driving&origin=${this.data.origin}&destination=${data.location}&from=我的位置&to=${data.name}&city=${data.citycode}&cityd=${data.citycode}`
    })
  }
})
