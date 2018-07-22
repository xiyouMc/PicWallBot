// pages/video/video.js
var videoUrl = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    'isShowSave': true,
    'saveTip': '保存到相册'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    videoUrl = options.videoUrl
    if (videoUrl != undefined) {
      this.setData({
        'videoUrl': videoUrl
      })
    }

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

  saveToAblum: function(e) {
    wx.showLoading({
      title: '保存中...',
    })
    wx.downloadFile({
      url: videoUrl,
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
  }
})