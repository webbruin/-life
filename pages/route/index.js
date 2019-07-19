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
    scale: 11,
    schemeIndex: 0,
    latitude: '',
    longitude: '',
    markers: [],
    polyline: [],
    points: [],
    lineArray: [
      {name: '推荐路线(便捷)', value: 0},
      {name: '花钱少', value: 1},
      {name: '换乘少', value: 2},
      {name: '步行少', value: 3},
      {name: '不坐地铁', value: 5}
    ],
    lineIndex: '0'
  },
  onLoad: function (options) {
    this.setData({
      options: {
        mode: options.mode || '',
        origin: options.origin || '',
        destination: options.destination || ''
      },
      from: options.from || '',
      to: options.to || '',
      city: options.city || '',
      cityd: options.cityd || '',
      address: options.address || '',
      tabBarIndex: this.data.tabBarList.findIndex(v => v.mode === options.mode)
    })
    wx.setNavigationBarTitle({
      title: this.data.tabBarList.filter(v => v.mode === this.data.options.mode)[0].name + '-路线'
    })
  },
  onReady: function () {
    this.mapCtx = wx.createMapContext('myMap')
    switch (this.data.options.mode) {
      case 'driving':
        this._getDrivingRoute(this.data.options);
        break;
      case 'walking':
        this._getWalkingRoute(this.data.options);
        break;
      case 'transit':
        this._getTransitRoute(this.data.options);
        break;
      case 'riding':
        this._getRidingRoute(this.data.options);
        break;
    }
  },
  moveToLocation: function () {
    this.mapCtx.moveToLocation()
  },
  magnifyScale: function () {
    if (this.data.scale < 20) {
      this.data.scale++
      this.setData({
        scale: this.data.scale
      })
    }
  },
  shrinkScale: function () {
    if (this.data.scale > 0) {
      this.data.scale--
      this.setData({
        scale: this.data.scale
      })
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
  onTabBar: function (e) {
    let mode = 'options.mode'
    wx.setNavigationBarTitle({
      title: this.data.tabBarList[e.currentTarget.dataset.index].name + '-路线'
    })
    if (e.currentTarget.dataset.index !== this.data.tabBarIndex) {
      this.setData({
        tabBarIndex: e.currentTarget.dataset.index,
        [mode]: this.data.tabBarList[e.currentTarget.dataset.index].mode
      })
    }
    switch (this.data.options.mode) {
      case 'driving':
        this._getDrivingRoute(this.data.options);
        break;
      case 'walking':
        this._getWalkingRoute(this.data.options);
        break;
      case 'transit':
        this._getTransitRoute(this.data.options);
        break;
      case 'riding':
        this._getRidingRoute(this.data.options);
        break;
    }
  },
  onSelectScheme: function (e) {
    if (e.currentTarget.dataset.index !== this.data.schemeIndex) {
      this.setData({
        schemeIndex: e.currentTarget.dataset.index,
        polyline: [
          /*{
            points: this.data.points.filter((value, index) => index !== e.currentTarget.dataset.index)[1],
            color: '#9CE09D',
            width: 8,
          },
          {
            points: this.data.points.filter((value, index) => index !== e.currentTarget.dataset.index)[0],
            color: '#9CE09D',
            width: 8,
          },*/
          {
            points: this.data.points.filter((value, index) => index === e.currentTarget.dataset.index)[0],
            color: '#4FB83A',
            width: 8,
            arrowLine: true
          }
        ]
      })
    }
  },
  onSearch: function () {
    switch (this.data.options.mode) {
      case 'driving':
        this._getDrivingRoute(this.data.options);
        break;
      case 'walking':
        this._getWalkingRoute(this.data.options);
        break;
      case 'transit':
        this._getTransitRoute(this.data.options);
        break;
      case 'riding':
        this._getRidingRoute(this.data.options);
        break;
    }
  },
  bindSelectDate: function () {
    this.setData({
      showDate: !this.data.showDate
    })
  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    })
  },
  bindConfirmDate: function () {
    if (!this.data.date || !this.data.time) {
      wx.showModal({
        content: '请选择日期和时间',
        showCancel: false
      })
      return
    }
    this.setData({
      showDate: !this.data.showDate
    })
    this._getTransitRoute(
      this.data.options,
      this.data.lineArray[this.data.lineIndex].value,
      {
        date: this.data.date,
        time: this.data.time
      }
    );
  },
  bindLineChange: function (e) {
    if (e.detail.value !== this.data.lineIndex) {
      this.setData({
        lineIndex: e.detail.value
      })
      this._getTransitRoute(this.data.options, this.data.lineArray[this.data.lineIndex].value);
    }
  },
  startNavigator: function () {
    wx.openLocation({
      latitude: Number(this.data.options.destination.split(',')[1]),
      longitude: Number(this.data.options.destination.split(',')[0]),
      scale: this.data.scale,
      name: this.data.to,
      address: this.data.address
    })
  },
  drivingRoute: function (data) {
    let points = [];
    if(data.paths && data.paths[0] && data.paths[0].steps){
      this.calcScale(data.paths[0].distance)
      for(let a = 0; a < data.paths.length; a++) {
        points[a] = [];
        for(let i = 0; i < data.paths[a].steps.length; i++){
          let poLen = data.paths[a].steps[i].polyline.split(';');
          for(let j = 0;j < poLen.length; j++){
            if (j % 10 === 0) {
              points[a].push({
                longitude: parseFloat(poLen[j].split(',')[0]),
                latitude: parseFloat(poLen[j].split(',')[1])
              })
            }
          }
        }
      }
    }
    this.setData({
      points,
      latitude: points[0][Math.floor(points[0].length / 2)].latitude,
      longitude: points[0][Math.floor(points[0].length / 2)].longitude,
      markers: [
        {
          latitude: points[0][0].latitude,
          longitude: points[0][0].longitude,
          iconPath: '/image/qidian.png',
          width: 20,
          height: 30,
          zIndex: 999
        },
        {
          latitude: points[0][points[0].length - 1].latitude,
          longitude: points[0][points[0].length - 1].longitude,
          iconPath: '/image/zhongdian.png',
          width: 20,
          height: 30,
          zIndex: 999
        }
      ],
      polyline: [
        // {
        //   points: points[2] ? points[2] : [],
        //   color: '#9CE09D',
        //   width: 8,
        //   arrowLine: false
        // },
        // {
        //   points: points[1] ? points[1] : [],
        //   color: '#9CE09D',
        //   width: 8,
        //   arrowLine: false
        // },
        {
          points: points[0] ? points[0] : [],
          color: '#4FB83A',
          width: 8,
          arrowLine: true
        }
      ]
    });
  },
  transitRoute: function () { },
  walkingRoute: function (data) {
    let points = [];
    if(data.paths && data.paths[0]) {
      this.calcScale(data.paths[0].distance)
      for(let i = 0; i < data.paths[0].steps.length; i++){
        let poLen = data.paths[0].steps[i].polyline.split(';');
        for(let j = 0;j < poLen.length; j++){
          points.push({
            longitude: parseFloat(poLen[j].split(',')[0]),
            latitude: parseFloat(poLen[j].split(',')[1])
          })
        }
      }
    }
    this.setData({
      points: points,
      latitude: points[Math.floor(points.length / 2)].latitude,
      longitude: points[Math.floor(points.length / 2)].longitude,
      markers: [
        {
          latitude: points[0].latitude,
          longitude: points[0].longitude,
          iconPath: '/image/qidian.png',
          width: 20,
          height: 30,
          zIndex: 999
        },
        {
          latitude: points[points.length - 1].latitude,
          longitude: points[points.length - 1].longitude,
          iconPath: '/image/zhongdian.png',
          width: 20,
          height: 30,
          zIndex: 999
        }
      ],
      polyline: [
        {
          points: points,
          color: '#94661E',
          width: 8,
          arrowLine: true
        }
      ]
    });
  },
  ridingRoute: function (data) {
    let points = [];
    if(data.paths && data.paths[0]) {
      this.calcScale(data.paths[0].distance)
      for(let i = 0; i < data.paths[0].steps.length; i++){
        let poLen = data.paths[0].steps[i].polyline.split(';');
        for(let j = 0;j < poLen.length; j++){
          points.push({
            longitude: parseFloat(poLen[j].split(',')[0]),
            latitude: parseFloat(poLen[j].split(',')[1])
          })
        }
      }
    }
    this.setData({
      points: points,
      latitude: points[Math.floor(points.length / 2)].latitude,
      longitude: points[Math.floor(points.length / 2)].longitude,
      markers: [
        {
          latitude: points[0].latitude,
          longitude: points[0].longitude,
          iconPath: '/image/qidian.png',
          width: 20,
          height: 30,
          zIndex: 999
        },
        {
          latitude: points[points.length - 1].latitude,
          longitude: points[points.length - 1].longitude,
          iconPath: '/image/zhongdian.png',
          width: 20,
          height: 30,
          zIndex: 999
        }
      ],
      polyline: [
        {
          points: points,
          color: '#4495ED',
          width: 8,
          arrowLine: true
        }
      ]
    });
  },
  calcScale: function (distance) {
    let zoom = [20,50,100,200,500,1000,2000,5000,10000,20000,50000,100000,200000,500000,1000000,2000000]
    let ind = zoom.findIndex(v => v >= distance)
    this.setData({
      scale: distance < 1000 ? 21 - ind : 20 - ind
    })
  },
  _getDrivingRoute: function (data) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: 'https://restapi.amap.com/v3/direction/driving',
      data: {
        key: app.globalData.AMapWeb_Key,
        ...data,
        strategy: '10',
        extensions: 'all',
      },
      success: res => {
        wx.hideLoading()
        if (res.data.status === '1') {
          this.drivingRoute(res.data.route)
          this.setData({
            result: {
              taxi_cost: res.data.route.taxi_cost,
              paths: res.data.route.paths.map(v => {
                return {
                  ...v,
                  steps: v.steps.map(n => {
                    return {
                      road: n.road,
                      instruction: n.instruction,
                      distance: n.distance,
                      duration: n.duration,
                      tolls: n.tolls,
                    }
                  })
                }
              })
            }
          })
        } else {
          this.setData({
            result: null,
            markers: [],
            polyline: []
          })
          wx.showModal({
            content: res.data.info,
            showCancel: false
          })
        }
      }
    })
  },
  _getTransitRoute: function (data, strategy, date = {}) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: 'https://restapi.amap.com/v3/direction/transit/integrated',
      data: {
        key: app.globalData.AMapWeb_Key,
        ...data,
        city: this.data.city,
        cityd: this.data.cityd,
        strategy,
        extensions: 'all',
        nightflag: '1',
        ...date,
      },
      success: res => {
        wx.hideLoading()
        if (res.data.status === '1') {
          this.setData({result: res.data.route})
        } else {
          wx.showModal({
            content: res.data.info,
            showCancel: false
          })
        }
      }
    })
  },
  _getWalkingRoute: function (data) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: 'https://restapi.amap.com/v3/direction/walking',
      data: {
        key: app.globalData.AMapWeb_Key,
        ...data
      },
      success: res => {
        wx.hideLoading()
        if (res.data.status === '1') {
          this.walkingRoute(res.data.route)
          this.setData({
            result: {
              taxi_cost: res.data.route.taxi_cost,
              paths: res.data.route.paths.map(v => {
                return {
                  ...v,
                  steps: v.steps.map(n => {
                    return {
                      road: n.road,
                      instruction: n.instruction,
                      distance: n.distance,
                      duration: n.duration,
                      tolls: n.tolls,
                    }
                  })
                }
              })
            }
          })
        } else {
          this.setData({
            result: null,
            markers: [],
            polyline: []
          })
          wx.showModal({
            content: res.data.info,
            showCancel: false
          })
        }
      }
    })
  },
  _getRidingRoute: function (data) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.request({
      url: 'https://restapi.amap.com/v4/direction/bicycling',
      data: {
        key: app.globalData.AMapWeb_Key,
        ...data
      },
      success: res => {
        wx.hideLoading()
        if (res.data.errcode === 0) {
          this.ridingRoute(res.data.data)
          this.setData({
            result: {
              taxi_cost: res.data.data.taxi_cost,
              paths: res.data.data.paths.map(v => {
                return {
                  ...v,
                  steps: v.steps.map(n => {
                    return {
                      road: n.road,
                      instruction: n.instruction,
                      distance: n.distance,
                      duration: n.duration,
                      tolls: n.tolls,
                    }
                  })
                }
              })
            }
          })
        } else {
          this.setData({
            result: null,
            markers: [],
            polyline: []
          })
          wx.showModal({
            content: res.data.errmsg,
            showCancel: false
          })
        }
      }
    })
  },
  onShareAppMessage: function () { },
  getUserInfo: function (e) { }
})
