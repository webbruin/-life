//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    isShowPop: false,
    addr: '',
    location: '',
    updatetime: '',
    result: {
      now: null,
      forecast: null,
      lifestyle: null
    },
    lifestyleName: {
      comf: '舒适度',
      drsg: '穿衣',
      flu: '感冒',
      sport: '运动',
      trav: '旅游',
      uv: '紫外线',
      cw: '洗车',
      air: '空气'
    }
  },
  onLoad: function () {
    wx.authorize({
      scope: 'scope.userLocation',
      success: () => {
        wx.getLocation({
          type: 'gcj02',
          success: res => {
            this.setData({
              location: `${res.longitude},${res.latitude}`
            })
            app.globalData.amapsdk.getRegeo({
              location: `${res.longitude},${res.latitude}`,
              success: result => {
                this.setData({
                  addr: `${result[0].regeocodeData.addressComponent.province}${result[0].regeocodeData.addressComponent.district}`
                })
              }
            })
            this._weatherNow(this.data.location)
            this._weatherForecast(this.data.location)
            this._weatherLifestyle(this.data.location)
          },
          fail: err => {
            wx.showModal({
              content: err.errMsg,
              showCancel: false
            })
          }
        })
      }
    })
  },
  onPullDownRefresh: function () {
    getCurrentPages().pop().onLoad()
    setTimeout(() => wx.stopPullDownRefresh(), 500)
  },
  onChangeRegion: function () {
    wx.chooseLocation({
      success: res => {
        app.globalData.amapsdk.getRegeo({
          location: `${res.longitude},${res.latitude}`,
          success: result => {
            this.setData({
              addr: `${result[0].regeocodeData.addressComponent.province}${result[0].regeocodeData.addressComponent.district}`,
              location: `${result[0].longitude},${result[0].latitude}`
            })
            this._weatherNow(this.data.location)
            this._weatherForecast(this.data.location)
            this._weatherLifestyle(this.data.location)
          }
        })
      }
    })
  },
  openShare: function (e) {
    this.setData({
      isShowPop: !this.data.isShowPop,
      index: e.currentTarget.dataset.index
    })
  },
  onIsShowPop: function (e) {
    this.setData({
      isShowPop: e.detail
    })
  },
  _weatherNow: function (location) {
    let now = 'result.now'
    wx.request({
      url: 'https://free-api.heweather.net/s6/weather/now?location=' + location + '&key=' + app.globalData.heweather_Key,
      success: res => {
        this.setData({
          updatetime: res.data.HeWeather6[0].update.loc.substring(11, 16),
          [now]: res.data.HeWeather6[0].now
        })
      }
    })
  },
  _weatherForecast: function (location) {
    let forecast = 'result.forecast'
    wx.request({
      url: 'https://free-api.heweather.net/s6/weather/forecast?location=' + location + '&key=' + app.globalData.heweather_Key,
      success: res => {
        this.setData({
          [forecast]: res.data.HeWeather6[0].daily_forecast
        })
      }
    })
  },
  _weatherLifestyle: function (location) {
    let lifestyle = 'result.lifestyle'
    wx.request({
      url: 'https://free-api.heweather.net/s6/weather/lifestyle?location=' + location + '&key=' + app.globalData.heweather_Key,
      success: res => {
        this.setData({
          [lifestyle]: res.data.HeWeather6[0].lifestyle
        })
      }
    })
  }
})
