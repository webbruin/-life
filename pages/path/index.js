//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    tabBarList: [
      {name: '驾车', mode: 'driving'},
      {name: '公交', mode: 'transit'},
      {name: '步行', mode: 'walking'},
      {name: '骑行', mode: 'riding'},
    ],
    tabBarIndex: 1,
    from: '',
    fromCityCode: '',
    to: '',
    toCityCode: '',
    address: '',
    options: {
      mode: 'transit',
      origin: '',
      destination: ''
    },
    result: [],
    history: []
  },
  onLoad: function () {
    let mode = 'options.mode'
    let origin = 'options.origin'
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        app.globalData.amapsdk.getRegeo({
          location: `${res.longitude},${res.latitude}`,
          success: res1 => {
            this.setData({
              from: '我的位置',
              fromCityCode: res1[0].regeocodeData.addressComponent.citycode,
              [origin]: `${res1[0].longitude},${res1[0].latitude}`,
              [mode]: this.data.tabBarList[this.data.tabBarIndex].mode
            })
          }
        })
      }
    })
  },
  onShow: function () {
    let history = wx.getStorageSync('SEARCH_INFO') || []
    if (history.length > 0) {
      this.setData({ history: history.reverse() })
    }
  },
  onSelectFromAddr: function () {
    let origin = 'options.origin'
    wx.chooseLocation({
      success: res => {
        app.globalData.amapsdk.getRegeo({
          location: `${res.longitude},${res.latitude}`,
          success: res1 => {
            this.setData({
              from: res.name,
              fromCityCode: res1[0].regeocodeData.addressComponent.citycode,
              address: res.address,
              [origin]: `${res1[0].longitude},${res1[0].latitude}`
            })
            if (this.data.options.destination && this.data.options.origin) {
              this.onSearch()
            }
          }
        })
      }
    })
  },
  onSelectToAddr: function () {
    let destination = 'options.destination'
    wx.chooseLocation({
      success: res => {
        app.globalData.amapsdk.getRegeo({
          location: `${res.longitude},${res.latitude}`,
          success: res1 => {
            this.setData({
              to: res.name,
              toCityCode: res1[0].regeocodeData.addressComponent.citycode,
              address: res.address,
              [destination]: `${res1[0].longitude},${res1[0].latitude}`
            })
            if (this.data.options.destination && this.data.options.origin) {
              this.onSearch()
            }
          }
        })
      }
    })
  },
  onCloseFrom: function () {
    let origin = 'options.origin'
    this.setData({
      from: '',
      fromCityCode: '',
      [origin]: ''
    })
  },
  onCloseTo: function () {
    let destination = 'options.destination'
    this.setData({
      to: '',
      toCityCode: '',
      [destination]: ''
    })
  },
  onTabBar: function (e) {
    let mode = 'options.mode'
    if (e.currentTarget.dataset.index !== this.data.tabBarIndex) {
      this.setData({
        tabBarIndex: e.currentTarget.dataset.index,
        [mode]: this.data.tabBarList[e.currentTarget.dataset.index].mode
      })
    }
  },
  onChange: function () {
    let origin = 'options.origin'
    let destination = 'options.destination'
    this.setData({
      from: this.data.to,
      to: this.data.from,
      [origin]: this.data.options.destination,
      [destination]: this.data.options.origin
    })
  },
  onSearch: function () {
    let data = this.data
    let mode = 'options.mode'
    let notEmpty = Object.keys(data.options).every(v => data.options[v])
    if (!notEmpty) {
      wx.showModal({
        content: '请选择起点或终点',
        showCancel: false
      })
      return
    }
    this.setData({
      tabBarIndex: data.tabBarIndex,
      [mode]: data.tabBarList[data.tabBarIndex].mode
    })
    this.cacheStorage()
    wx.navigateTo({
      url: `../route/index?mode=${data.options.mode}&origin=${data.options.origin}&destination=${data.options.destination}&city=${data.fromCityCode}&cityd=${data.toCityCode}&from=${data.from}&to=${data.to}&address=${data.address}`
    })
  },
  onSearchHistory: function (e) {
    let data = e.currentTarget.dataset.obj
    wx.navigateTo({
      url: `../route/index?mode=${this.data.options.mode}&origin=${data.options.origin}&destination=${data.options.destination}&city=${data.fromCityCode}&cityd=${data.toCityCode}&from=${data.from}&to=${data.to}&address=${data.address}`
    })
  },
  cacheStorage: function () {
    let history = wx.getStorageSync('SEARCH_INFO') || []
    if (wx.getStorageSync('SEARCH_INFO').length >= 10) history.shift()
    history.push({
      from: this.data.from,
      fromCityCode: this.data.fromCityCode,
      to: this.data.to,
      toCityCode: this.data.toCityCode,
      address: this.data.address,
      options: this.data.options
    })
    wx.setStorageSync('SEARCH_INFO', history)
  },
  onClearHistory: function () {
    try {
      wx.removeStorageSync('SEARCH_INFO')
    } catch (e) { }
    this.setData({ history: [] })
  },
  onShareAppMessage: function () { },
  getUserInfo: function (e) { }
})
