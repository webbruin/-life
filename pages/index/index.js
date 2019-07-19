//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    scale: 16,
    latitude: null,
    longitude: null,
    markers: [],
    now: null
  },
  onLoad: function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    app.globalData.amapsdk.getRegeo({
      success: res => {
        this.setData({
          latitude: res[0].latitude,
          longitude: res[0].longitude,
          origin: `${res[0].longitude},${res[0].latitude}`,
          citycode: res[0].regeocodeData.addressComponent.citycode
        })
        this._weatherNow(`${res[0].longitude},${res[0].latitude}`)
      },
      fail: err => {
        this.mapCtx = wx.createMapContext('myMap')
        wx.hideLoading()
        wx.showModal({
          title	: '地理位置已关闭',
          content: '将会影响一些功能的正常使用，如需重新开启，请至 设置→授权设置 打开',
          showCancel: false
        })
      }
    })
  },
  onReady: function (e) {
    this.mapCtx = wx.createMapContext('myMap')
  },
  toSetting: function () {
    wx.navigateTo({
      url: '../setting/index'
    })
  },
  toSearch: function () {
    wx.navigateTo({
      url: '../search/index'
    })
  },
  toWeather: function () {
    wx.navigateTo({
      url: '../weather/index'
    })
  },
  toPath: function () {
    wx.navigateTo({
      url: '../path/index'
    })
  },
  moveToLocation: function () {
    this.mapCtx.moveToLocation()
  },
  _weatherNow: function (location) {
    wx.request({
      url: 'https://free-api.heweather.net/s6/weather/now?location=' + location + '&key=' + app.globalData.heweather_Key,
      success: res => {
        wx.hideLoading()
        this.setData({
          now: res.data.HeWeather6[0].now
        })
      }
    })
  },
  onShareAppMessage: function() {
    return {
      title: '地图life',
      path: '/pages/index/index',
      imageUrl: '/image/logo.png'
    }
  }
})
