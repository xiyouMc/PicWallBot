// pages/home/home.js
var api = require('../../utils/request_api.js')
var defaultData = '<xml><URL><![CDATA[https://python.0x2048.com/wx/]]></URL><ToUserName><![CDATA[mm]]></ToUserName><FromUserName><![CDATA[aa]]></FromUserName><CreateTime>111</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[##]]></Content><MsgId>123</MsgId></xml>'
var avatarUrl = ''
var picUrl = []
var inputUrl = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isHidePic: false,
    avatarUrl: avatarUrl,
    picUrl: picUrl,
    avatarName: '',
    inputUrl: '',
    videoUrl: '',
    //图片地址
    imgList: [],
    //是否采用衔接滑动  
    circular: false,
    //是否显示画板指示点  
    indicatorDots: true,
    //选中点的颜色  
    indicatorcolor: "#fff",
    //是否竖直  
    vertical: false,
    //是否自动切换  
    autoplay: false,
    //自动切换的间隔
    interval: 2500,
    //滑动动画时长毫秒  
    duration: 100,
    //所有图片的高度  
    imgheights: [],
    //图片宽度 
    imgwidth: 750,
    //默认  
    current: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this
    wx.getClipboardData({
      success: function(res) {
        if (res.data.indexOf('instagram.com') != -1 && inputUrl != res.data) {
          inputUrl = res.data
          that.setData({
            insUrl: res.data
          })
          that.requestPic(res.data)
        }
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  requestPic: function(url) {
    wx.showLoading({
      title: '正在爬取中。。。',
    })
    var that = this
    wx.request({
      url: api.serverApi,
      method: "POST",
      data: defaultData.replace('##', url),
      success: function(e) {
        console.log(e)
        if (e.data.errorcode) {
          console.log("请求失败")
        } else {
          // var reg = <Title><[CDATA[(/.*)]\.*<![CDATA[(\.*)><\/PicUrl>\.*<![CDATA[(.*)></Description>.*<![CDATA[(.*)>;
          // reg.exec(e.data)
          console.log(e.data)
          avatarUrl = e.data.avatar_url
          picUrl = e.data.imgsBase64;
          console.log(picUrl)
          that.setData({
            isHidePic: false,
            avatarUrl: e.data.avatar_url,
            avatarName: e.data.avatar_name,
            // picUrls: picUrl
            // picUrl: picUrl[0]
            // imgList: picUrl
            isVideo: e.data.isVideo
          })
          if (e.data.isVideo) {
            that.setData({
              videoUrl: e.data.videoUrl
            })
            // wx.downloadFile({
            //   url: e.data.videoUrl,
            //   success: function(res) {
            //     if (res.statusCode === 200) {
            //       wx.saveVideoToPhotosAlbum({
            //         filePath: res.tempFilePath,
            //         success(res) {
            //           console.log(res)
            //           wx.showToast({
            //             title: '保存成功',
            //           })
            //         }
            //       })
            //     }
            //   }
            // })

          } else {
            that.setData({
              imgList: picUrl
            })
          }
        }
      },
      complete: function() {
        wx.hideLoading()
      }
    })
  },

  getPic: function(e) {
    const insUrl = e.detail.value;
    console.log(insUrl)
    if (insUrl.indexOf('instagram.com') != -1) {
      //是 ins 的地址
      this.requestPic(insUrl)
    }
  },

  avatarTap: function() {
    wx.previewImage({
      urls: [avatarUrl],
    })
  },

  picTap: function() {
    wx.previewImage({
      urls: picUrl,
    })
  },

  clearText: function() {
    this.setData({
      insUrl: ''
    })
  },

  inputUrl: function(e) {
    inputUrl = e.detail.value
    console.log(inputUrl)
  },

  getPic: function() {
    if (inputUrl != '') {
      this.requestPic(inputUrl)
    }
  },

  imageLoad: function(e) {
    //获取图片真实宽度
    var imgwidth = e.detail.width,
      imgheight = e.detail.height,
      //宽高比
      ratio = imgwidth / imgheight;
    console.log(imgwidth, imgheight)
    //计算的高度值
    var viewHeight = 750 / ratio;
    var imgheight = viewHeight
    var imgheights = this.data.imgheights
    //把每一张图片的高度记录到数组里
    imgheights.push(imgheight)
    this.setData({
      imgheights: imgheights,
    })
  },

  bindchange: function(e) {
    console.log(e.detail.current)
    this.setData({
      current: e.detail.current
    })
  }
})