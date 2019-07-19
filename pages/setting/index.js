//index.js
//获取应用实例
const app = getApp()

Page({
  data: { },
  onLoad: function () {
    wx.getUserInfo({
      success: res => {
        this.setData({
          userInfo: res.userInfo
        })
      }
    })
  },
  openSetting: function () {
    wx.openSetting()
  },
  onClearHistory: function () {
    wx.showActionSheet({
      itemList: ['清空'],
      itemColor: '#f00',
      success: res => {
        wx.clearStorage()
      }
    })
  },
  onShareAppMessage: function() {
    return {
      title: '地图life',
      path: '/pages/index/index',
      imageUrl: '/image/logo.png'
    }
  },
  getUserInfo: function (e) {
    this.setData({
      userInfo: e.detail.userInfo
    })
  }
})
