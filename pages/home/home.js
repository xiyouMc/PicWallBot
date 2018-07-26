// pages/home/home.js
var api = require('../../utils/request_api.js')
var defaultData = '<xml><URL><![CDATA[https://python.0x2048.com/wx/]]></URL><ToUserName><![CDATA[mm]]></ToUserName><FromUserName><![CDATA[aa]]></FromUserName><CreateTime>111</CreateTime><MsgType><![CDATA[text]]></MsgType><Content><![CDATA[##]]></Content><MsgId>123</MsgId></xml>'
var avatarUrl = ''
var avatarName = ''
var dataUrls = []
var inputUrl = ''
var isVideo = false
// var videoUrl = ''
var saveTip = '保存到相册'
var isShowSave = true
var onLoadInputUrl = ''
var isLoading = false
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isHidePic: true,
    avatarUrl: avatarUrl,
    avatarName: avatarName,
    inputUrl: inputUrl,
    //图片 或者视频地址
    dataUrls: dataUrls,
    // videoUrls: videoUrls,
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
    current: 0,
    saveTip: saveTip,
    isShowSave: isShowSave,
    needShowSwipe: false,
    needShowVideo: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('fdsdsfsdf')
    console.log(options.inputUrl)
    onLoadInputUrl = options.inputUrl
    inputUrl = ''


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
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
    if (onLoadInputUrl !== null && onLoadInputUrl !== undefined && onLoadInputUrl !== '') {
      that.setData({
        insUrl: onLoadInputUrl
      })
      that.requestPic(onLoadInputUrl)
    } else {
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
    }
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
    if (isLoading) {
      return
    }
    isLoading = true
    this.setData({
      needShowSwipe: false,
      needShowVideo: false
    })
    wx.showLoading({
      title: '正在爬取中。。。',
    })
    dataUrls = []
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
          console.log(e.data)
          if (e.data.graphql == undefined) {
            return
          }
          var shortcodeMedia = e.data.graphql.shortcode_media
          var owner = shortcodeMedia.owner

          avatarUrl = api.getOriginData + owner.profile_pic_url
          avatarName = owner.username
          if (shortcodeMedia.edge_sidecar_to_children) {
            var edges = shortcodeMedia.edge_sidecar_to_children.edges
            edges.forEach(function(item, index, edges) {
              var node = item.node
              var isVideo = node.is_video
              var danmuList = []
              if (node.is_video && node.edge_media_to_comment != undefined) {
                var comments = node.edge_media_to_comment.edges
                if (comments != undefined && comments.length > 0) {
                  comments.forEach(function(item, index, comments) {
                    danmuList.push(item.node.text)
                  })
                }
              }
              dataUrls.push({
                'danmuList': danmuList,
                "src": api.getOriginData + node.display_resources[1].src,
                'videoUrl': isVideo ? (api.getOriginData + node.video_url) : '',
                "isVideo": isVideo
              })
            })
          } else {
            var danmuList = []
            if (shortcodeMedia.is_video) {
              var comments = shortcodeMedia.edge_media_to_comment.edges
              if (comments != undefined && comments.length > 0) {
                comments.forEach(function(item, index, comments) {
                  danmuList.push(item.node.text)
                })
              }
            }
            console.log(danmuList)
            dataUrls.push({
              'danmuList': danmuList,
              "src": api.getOriginData + shortcodeMedia.display_resources[1].src,
              'videoUrl': shortcodeMedia.is_video ? (api.getOriginData + shortcodeMedia.video_url) : '',
              "isVideo": shortcodeMedia.is_video

            })

          }

          isVideo = shortcodeMedia.is_video
          console.log('test->>>>>>>>>>>')
          console.log(dataUrls)
          that.setData({
            isHidePic: false,
            avatarUrl: api.getOriginData + avatarUrl,
            avatarName: avatarName,
            // picUrls: picUrl
            // picUrl: picUrl[0]
            // imgList: picUrl
            isVideo: isVideo,
            isShowSave: true,
            saveTip: '保存到相册',
            dataUrls: dataUrls
          })

        }
      },
      complete: function() {
        isLoading = false
        wx.hideLoading()
      }
    })
  },

  saveToAblum: function(e) {
    wx.showLoading({
      title: '保存中...',
    })
    var that = this
    for (var index = 0; index < dataUrls.length; index++) {
      var isVideo = dataUrls[index].isVideo
      var url = dataUrls[index].src
      if (isVideo) {
        wx.downloadFile({
          url: url,
          success: function(res) {
            if (res.statusCode === 200) {
              wx.saveVideoToPhotosAlbum({
                filePath: res.tempFilePath,
                success(res) {
                  console.log(res)
                  saveTip = ' 保存成功'
                  that.setData({
                    saveTip: saveTip
                  })
                  isShowSave = false
                  setTimeout(
                    function() {
                      that.setData({
                        isShowSave: isShowSave
                      })
                    },
                    1000
                  )
                }
              })
            }
          },
          complete: function() {
            wx.hideLoading()
          }
        })
      } else {
        wx.getImageInfo({
          src:  url,
          success: function(res) {
            wx.saveImageToPhotosAlbum({
              filePath: res.path,
              success: function(res) {
                saveTip = '保存成功'
                that.setData({
                  saveTip: saveTip
                })
                isShowSave = false
                setTimeout(
                  function() {
                    that.setData({
                      isShowSave: isShowSave
                    })
                  },
                  1000
                )
              }
            })
          },
          fail: function(e) {
            wx.showToast({
              title: e,
            })
          },
          complete: function() {
            wx.hideLoading()
          }
        })
      }
    }
  },

  getPic: function(e) {
    const insUrl = e.detail.value;
    console.log(insUrl)
    if (insUrl.indexOf('instagram.com') != -1) {
      //是 ins 的地址
      this.requestPic(insUrl)
    } else {
      wx.showToast({
        title: '您填写的地址不对',
      })
    }
  },

  avatarTap: function() {
    wx.previewImage({
      urls: [avatarUrl],
    })
  },

  picTap: function(event) {
    console.log(event)

    if (event.currentTarget.dataset.videourl != undefined && event.currentTarget.dataset.videourl != '') {
      var videoDanmu = event.currentTarget.dataset.danmulist
      wx.navigateTo({
        url: '/pages/video/video?videoUrl=' + event.currentTarget.dataset.videourl + '&danmuList=' + videoDanmu + '',
      })
    } else {
      var picUrls = []
      for (var index = 0; index < dataUrls.length; index++) {
        if (!dataUrls[index].isVideo) {
          picUrls.push(dataUrls[index].src)
        }
      }
      wx.previewImage({
        urls: picUrls,
      })
    }
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

  getBtPic: function() {
    console.log('getBtPic')
    console.log(inputUrl)
    if (inputUrl != '') {
      this.requestPic(inputUrl)
    } else {
      wx.showToast({
        title: '您填写的地址不对',
      })
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
  },

  picError: function(e) {
    wx.showModal({
      title: '提示',
      content: '网络有问题，如无法解决请点击右下角客服咨询',
    })
    this.setData({
      isHidePic: true,
      avatarUrl: '',
      avatarName: avatarName,
      // picUrls: picUrl
      // picUrl: picUrl[0]
      // imgList: picUrl
      isVideo: 'false',
      isShowSave: false,
      saveTip: '保存到相册',
      dataUrls: []
    })
  },
  onShareAppMessage: function(res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '一键下载 Instagram 图片和视频，很赞',
      path: '/pages/home/home?inputUrl=' + inputUrl,
      imageUrl: dataUrls[0].src
    }
  }
})