// pages/plugin/plugin.js
var api = require('../../utils/request_api.js')
var defaultData = '<xml><URL><![CDATA[https://python.0x2048.com/wx/]]></URL><ToUserName><![CDATA[mm]]></ToUserName><FromUserName><![CDATA[aa]]></FromUserName><CreateTime>111</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[##]]></Content><MsgId>123</MsgId></xml>'
var avatarUrl = ''
var avatarName = ''
var dataUrls = []
var personalUrl = ''
var onLoadPersonalUrl = ''
var savedAvatarKey = 'SavedAvatarKey'
var inputUrl = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options != undefined) {
      console.log('fdsdsfsdf')
      console.log(options.personalUrl)
      onLoadPersonalUrl = options.personalUrl
    }
    dataUrls = wx.getStorageSync(savedAvatarKey)
    if (dataUrls == '') {
      dataUrls = []
    }
    console.log(dataUrls)
    personalUrl = ''
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.setData({
      'dataUrls': dataUrls,
      'isHidePic': false
    })
    var isShowConfig = wx.getStorageSync('isShowIns')
    if (isShowConfig != undefined && isShowConfig) {
      this.setData({
        'urlConfig': ' Instagram '
      })
    } else {
      wx.request({
        url: api.configApi,
        success: function(res) {
          console.log(res)
          wx.setStorageSync('isShowIns', res.data.isShowIns)
          if (res.data.isShowIns) {
            this.setData({
              'urlConfig': ' Instagram '
            })
          }
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this
    if (onLoadPersonalUrl !== null && onLoadPersonalUrl !== undefined && onLoadPersonalUrl !== '') {
      that.setData({
        insUrl: onLoadPersonalUrl
      })
      that.requestPic(onLoadPersonalUrl)
    } else {
      wx.getClipboardData({
        success: function(res) {
          if (res.data.indexOf('instagram.com') != -1 && personalUrl != res.data) {
            personalUrl = res.data
            that.setData({
              insUrl: res.data
            })
            that.requestPic(res.data)
          }
        }
      })
    }
  },
  avatarTap: function(res) {
    console.log(res)
    var name = res.currentTarget.dataset.name
    var personalUrl = res.currentTarget.dataset.url
    wx.navigateTo({
      url: '/pages/personal/personal?userName=' + name + '&personalUrl=' + personalUrl,
    })
  },

  requestPic: function(url) {
    if (personalUrl === url) {
      return
    }
    var isHasPersonal = false;
    for (var index = 0; index < dataUrls.length; index++) {
      if (url === dataUrls[index].personalUrl) {
        isHasPersonal = true;
        break
      }
    }
    if (isHasPersonal) {
      wx.showToast({
        title: '已經添加到列表了！',
      })
      return
    }

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
          wx.showToast({
            title: '我怀疑你写错了地址！！！',
          })
          return;
        }
        console.log(e)
        if (e.data.errorcode) {
          console.log("请求失败")
        } else {
          var postCount = e.data.entry_data.ProfilePage["0"].graphql.user.edge_owner_to_timeline_media.count
          avatarName = e.data.entry_data.ProfilePage["0"].graphql.user.username
          avatarUrl = e.data.entry_data.ProfilePage["0"].graphql.user.profile_pic_url_hd
          personalUrl = url
          if (avatarName.length > 12) {
            avatarName = avatarName.substring(0, 11) + '...';
          }
          dataUrls.push({
            'postCount': postCount,
            'avatarName': avatarName,
            'avatarUrl': avatarUrl,
            'personalUrl': personalUrl
          })
          wx.setStorageSync(savedAvatarKey, dataUrls)
          that.setData({
            'dataUrls': dataUrls,
            'isHidePic': false
          })
        }
      },
      complete: function() {
        wx.hideLoading()
      }
    })
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
    wx.setStorageSync(savedAvatarKey, dataUrls)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    console.log('onReachBottom')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  getPic: function(e) {
    var insUrl = e.detail.value;
    console.log(insUrl)
    if (insUrl.indexOf('instagram.com') != -1) {
      //是 ins 的地址
      this.requestPic(insUrl)
    } else {
      insUrl = 'https://instagram.com/' + insUrl
      this.requestPic(insUrl)
    }
  },

  inputUrl: function(e) {
    inputUrl = e.detail.value
    if (inputUrl.indexOf('instagram.com') != -1) {
      //是 ins 的地址
      // this.requestPic(insUrl)
    } else {
      inputUrl = 'https://instagram.com/' + inputUrl
      // this.requestPic(insUrl)
    }
    console.log(inputUrl)
  },
  getPic: function() {
    if (inputUrl != '') {
      this.requestPic(inputUrl)
    }
  },
})