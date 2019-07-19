//app.js
const QQMapWX = require('libs/qqmap-wx-jssdk.min.js');
const AMap = require('libs/amap-wx.js');

App({
  onLaunch: function () {
    this.globalData.qqmapsdk = new QQMapWX({key: '3EHBZ-DJVCS-WT7O7-6GUZ5-IKPWH-SYFFQ'});
    this.globalData.amapsdk = new AMap.AMapWX({key: 'cc21f8deb767d8aa0282debd9f365356'});
  },
  globalData: {
    userInfo: null,
    AMapWeb_Key: 'b7ca1bb98e1c6260903cb270f751f111',
    heweather_Key: '9105cfbb72d046309252958b48b59d7a',
    qqmapsdk: null,
    amapsdk: null
  }
})