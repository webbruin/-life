//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    mode: '',
    from: '',
    to: '',
    result: null,
  },
  onLoad: function (options) {
    let prevPage = getCurrentPages()[getCurrentPages().length - (2)]
    wx.setNavigationBarTitle({
      title: prevPage.data.tabBarList[prevPage.data.tabBarIndex].name + '-路线详情'
    })
    this.setData({
      mode: prevPage.data.options.mode,
      from: prevPage.data.from,
      to: prevPage.data.to,
      result: prevPage.data.result.paths[options.index || 0]
    })
  },
  onShareAppMessage: function () { },
  getUserInfo: function (e) { }
})
