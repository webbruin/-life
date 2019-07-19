//index.js
//获取应用实例
import { debounce } from '../../utils/util'
const app = getApp()

Page({
  data: {
    origin: '',
    citycode: '',
    searchText: '',
    list: [
      {name: '美食', code: '050000', url: '/image/meishi.png', path: 'nearby'},
      {name: '酒店', code: '100000', url: '/image/jiudian.png', path: 'nearby'},
      {name: '景点', code: '110000', url: '/image/jingdian.png', path: 'nearby'},
      {name: '银行', code: '160100', url: '/image/yinhang.png', path: 'nearby'},
      {name: '电影院', code: '080601', url: '/image/dianying.png', path: 'nearby'},
      {name: '公交地铁', code: '150500&150700', url: '/image/qitacopy.png', path: 'nearby'},
      {name: '停车场', code: '150900', url: '/image/tingchechang.png', path: 'nearby'},
      {name: '加油站', code: '010100', url: '/image/jiayouzhancopy.png', path: 'nearby'},
      {name: '厕所', code: '200300', url: '/image/gonggongcesuocopy.png', path: 'nearby'},
      {name: '更多', url: '/image/gengduo.png', path: 'more'}
    ],
    result: '',
    distanceList: {},
    history: ''
  },
  onLoad: function () {
    app.globalData.amapsdk.getRegeo({
      success: res => {
        this.setData({
          origin: `${res[0].longitude},${res[0].latitude}`,
          citycode: res[0].regeocodeData.addressComponent.citycode
        })
      },
      fail: err => {
        wx.showModal({
          content: err.errMsg,
          showCancel: false
        })
      }
    })
  },
  onShow: function () {
    let history = wx.getStorageSync('NEARBY_INFO') || []
    if (history.length > 0) {
      this.setData({ history: history.reverse() })
    }
  },
  onKeyword: debounce(function (e) {
    this.setData({ searchText: e.detail.value })
    this._getInputtips(e.detail.value)
  }, 200),
  onSearch: function () {
    if (!this.data.searchText) {
      wx.showModal({
        content: '请输入关键词',
        showCancel: false
      })
      return
    }
    this.cacheStorage({ name: this.data.searchText })
    wx.navigateTo({
      url: `../nearby/index?name=${this.data.searchText}`
    })
  },
  toRoute: function (e) {
    let data = e.currentTarget.dataset.obj
    this.cacheStorage(data)
    wx.navigateTo({
      url: `../route/index?mode=driving&origin=${this.data.origin}&destination=${data.location}&from=我的位置&to=${data.name}&city=${this.data.citycode}&cityd=${data.adcode}&address=${data.address}`
    })
  },
  toNavigator: function (e) {
    let name = e.currentTarget.dataset.name
    this.cacheStorage({ name })
    wx.navigateTo({
      url: `../nearby/index?name=${name}`
    })
  },
  toSearchDetail: function (e) {
    let name = e.currentTarget.dataset.name
    let data = e.currentTarget.dataset.obj
    this.setData({
      result: [data]
    })
    wx.navigateTo({
      url: `../searchDetail/index?name=${name}&index=0`
    })
  },
  clearKeyword: function () {
    this.setData({ searchText: '' })
  },
  cacheStorage: function (data) {
    let history = wx.getStorageSync('NEARBY_INFO') || []
    if (wx.getStorageSync('NEARBY_INFO').length >= 10) history.shift()
    history.push(data)
    wx.setStorageSync('NEARBY_INFO', history)
  },
  onClearHistory: function () {
    try {
      wx.removeStorageSync('NEARBY_INFO')
    } catch (e) { }
    this.setData({ history: [] })
  },
  _getInputtips: function (keywords) {
    if (!keywords) return
    wx.showLoading({
      title: '搜索中',
      mask: true
    })
    this.setData({
      result: ''
    })
    wx.request({
      url: 'https://restapi.amap.com/v3/assistant/inputtips',
      data: {
        key: app.globalData.AMapWeb_Key,
        city: this.data.citycode,
        location: this.data.origin,
        keywords: keywords,
      },
      success: res => {
        wx.hideLoading()
        if (res.data.status === '1') {
          this.setData({
            result: res.data.tips
          })
          this.data.list.map(v => {
            if (v.name.indexOf(this.data.searchText) !== -1) {
              this.setData({
                reservedWord: v.name
              })
            }
          })
          try {
            let address_regeo = []
            res.data.tips.map(v => {
              if (v.location.length > 0) {
                address_regeo.push({ latitude: v.location.split(',')[1], longitude: v.location.split(',')[0] })
              }
            })
            this._calculateDistance(address_regeo)
          } catch (err) { }
        } else {
          console.log(err)
        }
      }
    })
  },
  _calculateDistance: function (to) {
    app.globalData.qqmapsdk.calculateDistance({
      to,
      success: res => {
        let obj = {}
        res.result.elements.map(v => {
          obj[`${v.to.lng},${v.to.lat}`] = v.distance
        })
        this.setData({
          distanceList: obj
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  }
})
