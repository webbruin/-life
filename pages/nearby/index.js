//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    keyword: '',
    location: '',
    adcode: '',
    pageSize: 20,
    page: 1,
    result: '',
    over: false
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({ title: this.data.keyword || options.name })
    this.setData({
      keyword: this.data.keyword || options.name
    })
    this._getLocation()
  },
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      result: ''
    })
    getCurrentPages().pop().onLoad()
  },
  onReachBottom: function () {
    if (!this.data.over) {
      this.data.page++
      this.setData({
        page: this.data.page
      })
      this._getPoiAround()
    }
  },
  toRoute: function (e) {
    let data = e.currentTarget.dataset.obj
    wx.navigateTo({
      url: `../route/index?mode=driving&origin=${this.data.origin}&destination=${data.location}&from=我的位置&to=${data.name}&city=${data.citycode}&cityd=${data.citycode}&address=${data.address}`
    })
  },
  _getLocation: function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        this.setData({
          location: `${res.latitude},${res.longitude}`,
          origin: `${res.longitude},${res.latitude}`
        })
        this._reverseGeocoder()
      },
      fail: err => {
        wx.hideLoading()
        wx.showModal({
          content: err.errMsg,
          showCancel: false
        })
      }
    })
  },
  _reverseGeocoder: function () {
    app.globalData.qqmapsdk.reverseGeocoder({
      location: this.data.location,
      success: res => {
        this.setData({
          adcode: res.result.ad_info.adcode
        })
        this._getPoiAround()
      }
    })
  },
  _getPoiAround: function () {
    wx.request({
      url: 'https://restapi.amap.com/v3/place/around',
      data: {
        key: app.globalData.AMapWeb_Key,
        city: this.data.adcode,
        location: this.data.location,
        keywords: this.data.keyword,
        offset: this.data.pageSize,
        page: this.data.page,
        extensions: 'all',
        radius: '50000'
      },
      success: res => {
        wx.stopPullDownRefresh()
        wx.hideLoading()
        if (res.data.status === '1') {
          this.setData({
            result: [...this.data.result, ...res.data.pois],
            over: res.data.pois.length <= 0 ? true : false
          })
        } else {
          console.log(err)
        }
      }
    })
  }
})
