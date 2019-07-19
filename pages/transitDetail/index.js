//index.js
//获取应用实例
const app = getApp()

Page({
  scale: 13,
  latitude: null,
  longitude: null,
  markers: [],
  polyline: [],
  data: {
    tabBarList: ['详情', '地图'],
    tabBarIndex: 0,
    origin: '',
    destination: '',
    from: '',
    to: '',
    result: null
  },
  onLoad: function (options) {
    let prevPage = getCurrentPages()[getCurrentPages().length - (2)]
    wx.setNavigationBarTitle({
      title: prevPage.data.tabBarList[prevPage.data.tabBarIndex].name + '-路线详情'
    })
    this.setData({
      tabBarIndex: options.tabBarIndex || 0,
      origin: prevPage.data.options.origin,
      destination: prevPage.data.options.destination,
      from: prevPage.data.from,
      to: prevPage.data.to,
      result: prevPage.data.result.transits[options.index || 0]
    })
    this.initMap()
  },
  onReady: function () {
    this.mapCtx = wx.createMapContext('myMap')
  },
  bindTabBar: function (e) {
    if (e.currentTarget.dataset.index !== this.data.tabBarIndex) {
      this.setData({ tabBarIndex: e.currentTarget.dataset.index })
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
  calcScale: function (distance) {
    let zoom = [20,50,100,200,500,1000,2000,5000,10000,20000,50000,100000,200000,500000,1000000,2000000]
    let ind = zoom.findIndex(v => v >= distance)
    this.setData({
      scale: distance < 1000 ? 21 - ind : 20 - ind
    })
  },
  initMap: function () {
    let markers = [], transferMakers = [], railwayMarkers, polyline = [], walkline = [], railwayline = []
    this.calcScale(this.data.result.distance)
    this.data.result.segments.map((v, v_index) => {
      if (v.walking.steps) {
        let arr = []
        v.walking.steps.map(b => {
          b.polyline.split(';').map(a => { arr.push({ longitude: a.split(',')[0], latitude: a.split(',')[1] }) })
        })
        walkline.push({
          points: arr ? arr : [],
          color: '#885F29',
          width: 8,
          arrowLine: true
        })
      }
      if (v.bus.buslines[0]) {
        let arr = []
        if (v.bus.buslines[0].departure_stop.location || v.bus.buslines[0].arrival_stop.location) {
          transferMakers.push(v.bus.buslines[0].arrival_stop)
        }
        if (v.bus.buslines[0].via_stops) {
          v.bus.buslines[0].polyline.split(';').map(n => {
            arr.push({
              longitude: n.split(',')[0],
              latitude: n.split(',')[1]
            })
          })
          polyline.push({
            points: arr ? arr : [],
            color: '#8E3966',
            width: 8,
            arrowLine: true
          })
          v.bus.buslines[0].via_stops.map((i, i_index) => {
            markers.push({
              id: `${v_index}-${i_index}`,
              callout: {
                content: i.name,
                fontSize: '12',
                padding: '2',
                display: 'ALWAYS',
                textAlign: 'center'
              },
              longitude: i.location.split(',')[0],
              latitude: i.location.split(',')[1],
              iconPath: '/image/biaoji.png',
              width: 16,
              height: 16,
              zIndex: 997
            })
          })
        }
      }
      if (v.railway.id) {
        let arr = [],
            departure_stop = v.railway.departure_stop,
            arrival_stop = v.railway.arrival_stop
        arr.push({ longitude: departure_stop.location.split(' ')[0], latitude: departure_stop.location.split(' ')[1] })
        markers.push({
          callout: {
            content: departure_stop.name,
            fontSize: '12',
            padding: '2',
            display: 'ALWAYS',
            textAlign: 'center'
          },
          longitude: departure_stop.location.split(' ')[0],
          latitude: departure_stop.location.split(' ')[1],
          iconPath: '/image/biaoji1.png',
          width: 20,
          height: 20,
          zIndex: 997
        })
        v.railway.via_stops.map(v => {
          arr.push({
            longitude: v.location.split(',')[0],
            latitude: v.location.split(',')[1]
          })
          markers.push({
            callout: {
              content: v.name,
              fontSize: '12',
              padding: '2',
              display: 'ALWAYS',
              textAlign: 'center'
            },
            longitude: v.location.split(',')[0],
            latitude: v.location.split(',')[1],
            iconPath: '/image/biaoji.png',
            width: 20,
            height: 20,
            zIndex: 997
          })          
        })
        arr.push({ longitude: arrival_stop.location.split(' ')[0], latitude: arrival_stop.location.split(' ')[1] })
        markers.push({
          callout: {
            content: arrival_stop.name,
            fontSize: '12',
            padding: '2',
            display: 'ALWAYS',
            textAlign: 'center'
          },
          longitude: arrival_stop.location.split(' ')[0],
          latitude: arrival_stop.location.split(' ')[1],
          iconPath: '/image/biaoji1.png',
          width: 20,
          height: 20,
          zIndex: 997
        })
        railwayline.push({
          points: arr ? arr : [],
          color: '#4495ED',
          width: 8,
          arrowLine: true
        })
      }
    })
    transferMakers.push(this.data.result.segments[0].bus.buslines[0].departure_stop)
    transferMakers.map(v => {
      markers.push({
        callout: {
          content: v.name,
          fontSize: '12',
          padding: '2',
          display: 'ALWAYS',
          textAlign: 'center'
        },
        longitude: v.location.split(',')[0],
        latitude: v.location.split(',')[1],
        iconPath: '/image/biaoji1.png',
        width: 20,
        height: 20,
        zIndex: 997
      })
    })
    let length = Math.floor(polyline.length / 2)
    this.setData({
      latitude: polyline[length].points[Math.floor(polyline[length].points.length / 2)].latitude,
      longitude: polyline[length].points[Math.floor(polyline[length].points.length / 2)].longitude,
      markers: [
        {
          id: 'qidian',
          latitude: this.data.origin.split(',')[1],
          longitude: this.data.origin.split(',')[0],
          iconPath: '/image/qidian.png',
          width: 20,
          height: 30,
          zIndex: 999
        },
        {
          id: 'zhongdian',
          latitude: this.data.destination.split(',')[1],
          longitude: this.data.destination.split(',')[0],
          iconPath: '/image/zhongdian.png',
          width: 20,
          height: 30,
          zIndex: 999
        },
        ...markers
      ],
      polyline: [
        ...polyline,
        ...walkline,
        ...railwayline
      ]
    })
  },
  onShareAppMessage: function () { },
  getUserInfo: function (e) { }
})
