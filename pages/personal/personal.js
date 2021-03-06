// pages/personal/personal.js
var md5 = require('../../utils/util.js')
var api = require('../../utils/request_api.js')
var defaultData = '<xml><URL><![CDATA[https://python.0x2048.com/wx/]]></URL><ToUserName><![CDATA[mm]]></ToUserName><FromUserName><![CDATA[aa]]></FromUserName><CreateTime>111</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[##]]></Content><MsgId>123</MsgId></xml>'

var defaultMoreData = '<xml><URL><![CDATA[https://python.0x2048.com/wx/]]></URL><ToUserName><![CDATA[mm]]></ToUserName><FromUserName><![CDATA[aa]]></FromUserName><CreateTime>111</CreateTime><MsgType><![CDATA[text]]></MsgType><NeedAddWH><![CDATA[0]]></NeedAddWH><Content><![CDATA[##]]></Content><MsgId>123</MsgId></xml>'

var requestMoreDataDefault = 'https://www.instagram.com/graphql/query/?query_hash=#&variables=##&userAgent=###&X_Instagram_GIS=####'
var ua = ''
var queryId = ''
var queryData = ''
var insGISId = ''
var isHaveMore = true

var personalUrl = ''
var userName = ''
var picUrls = []
var isLoading = false;
var rhxgis = ''
var userId = ''
var picSrcUrls = []
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  preparePicSrcUrls: function() {
    for (var index = 0; index < picUrls.length; index++) {
      picSrcUrls.push(picUrls[index].srcHD)
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options)
    ua = ''
    queryId = ''
    queryData = ''
    insGISId = ''
    isHaveMore = true

    personalUrl = ''
    userName = ''
    picUrls = []
    isLoading = false;
    rhxgis = ''
    userId = ''
    picSrcUrls = []
    // ua = options.ua
    // queryId = options.queryId
    // queryData = options.queryData
    // insGISId = options.insGISId
    personalUrl = options.personalUrl
    userName = options.userName
    this.requestUrl(personalUrl)
  },

  requestMoreUrl: function(url) {
    if (isLoading) {
      return
    }
    if (!isHaveMore) {
      wx.showToast({
        title: '没有更多了，别拉了！！！',
      })
      return
    }
    isLoading = true
    wx.showLoading({
      title: '正在爬取中。。。',
    })
    var that = this
    wx.request({
      url: api.serverApi,
      method: 'POST',
      data: defaultMoreData.replace('##', url),
      success: function(res) {
        console.log(res)
        if (res.data.data.user == undefined) {
          return
        }
        var tmpPicUrls = res.data.data.user.edge_owner_to_timeline_media.edges
        // var tmpPicResult = []
        tmpPicUrls.forEach(function(item, index, tmpPicUrls) {
          console.log(item.node)
          if (item.node != undefined) {
            var danmuList = []
            if (item.node.is_video) {
              var comments = item.node.edge_media_to_comment.edges
              if (comments != undefined && comments.length > 0) {
                comments.forEach(function(item, index, comments) {
                  danmuList.push(item.node.text)
                })
              }

            }
            picUrls = picUrls.concat({
              'danmuList': danmuList,
              'videoUrl': item.node.is_video ? (api.getOriginData +item.node.video_url) : '',
              'isVideo': item.node.is_video,
              'src': item.node.thumbnail_src,
              'srcHD': api.getOriginData + item.node.thumbnail_resources[item.node.thumbnail_resources.length - 1].src
            })
          }
        })
        // console.log(tmpPicResult)
        // picUrls = picUrls.concat(tmpPicResult)
        that.setData({
          'picUrls': picUrls
        })
        that.preparePicSrcUrls()
        //计算新的 gis
        console.log(picUrls)
        isHaveMore = res.data.data.user.edge_owner_to_timeline_media.page_info.has_next_page
        if (isHaveMore) {
          queryData = '{"id":"' + userId + '","first":12,"after":"' + res.data.data.user.edge_owner_to_timeline_media.page_info.end_cursor + '"}'
          // console.log(queryData)
          var str = rhxgis + ':' + queryData
          // console.log(str)
          insGISId = md5.md5(str).toLowerCase()
          queryData = encodeURIComponent(queryData)
          console.log(insGISId)
        }
      },
      complete: function() {
        isLoading = false
        wx.hideLoading()
      }
    })
  },
  requestUrl: function(url) {
    if (isLoading) {
      return
    }
    isLoading = true
    wx.showLoading({
      title: '正在爬取中。。。',
    })
    var that = this
    wx.request({
      url: api.serverApi,
      method: "POST",
      data: defaultData.replace('##', url),
      success: function(e) {
        if (e.data.userAgent == undefined) {
          return;
        }
        console.log(e)
        if (e.data.errorcode) {
          console.log("请求失败")
        } else {

          var tmppicUrls = e.data.entry_data.ProfilePage["0"].graphql.user.edge_owner_to_timeline_media.edges
          queryId = e.data.queryId
          queryData = e.data.queryData
          ua = e.data.userAgent
          insGISId = e.data.X_Instagram_GIS
          rhxgis = e.data.rhx_gis
          userId = e.data.entry_data.ProfilePage["0"].graphql.user.id
          tmppicUrls.forEach(function(item, index, tmppicUrls) {
            console.log(item)
            if (item.node != undefined) {
              var danmuList = []
              if (item.node.is_video) {
                var comments = item.node.edge_media_to_comment.edges
                if (comments != undefined && comments.length > 0) {
                  comments.forEach(function(item, index, comments) {
                    danmuList.push(item.node.text)
                  })
                }
              }
              picUrls = picUrls.concat({
                'danmuList': danmuList,
                'videoUrl': item.node.is_video ? (api.getOriginData +item.node.video_url) : '',
                'isVideo': item.node.is_video,
                'src': api.getOriginData +item.node.thumbnail_src,
                'srcHD': api.getOriginData + item.node.thumbnail_resources[item.node.thumbnail_resources.length - 1].src
              })
            }
          })
          that.setData({
            'picUrls': picUrls
          })
          that.preparePicSrcUrls()
          console.log(picUrls)
          // console.log(picUrls[0].node.thumbnail_resources[1].src)
        }
      },
      complete: function() {
        isLoading = false
        wx.hideLoading()
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.setNavigationBarTitle({
      title: userName,
    })
    wx.request({
      url: api.serverApi,
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    picUrls = []
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  loadMore: function(e) {
    console.log('loadMore')
    var url = requestMoreDataDefault.replace('####', insGISId).replace('###', ua).replace('##', queryData).replace('#', queryId)
    this.requestMoreUrl(url)
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    console.log('onReachBottom')
    var url = requestMoreDataDefault.replace('####', insGISId).replace('###', ua).replace('##', queryData).replace('#', queryId)
    this.requestMoreUrl(url)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  picTap: function(res) {
    console.log(res)
    if (res.currentTarget.dataset.isvideo) {
      var videoDanmu = res.currentTarget.dataset.danmulist
      wx.navigateTo({
        url: '/pages/video/video?videoUrl=' + res.currentTarget.dataset.videourl + '&danmuList=' + videoDanmu + '',
      })
    } else {
      wx.previewImage({
        current: res.currentTarget.dataset.url,
        urls: picSrcUrls,
      })
    }
  }
})