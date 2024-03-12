const ytdl = require('ytdl-core')
const fs = require('fs')
const path = require('path')

class YoutubeHandler {
  static cleanup(downloadStream, writeStream) {
    if (downloadStream) {
      downloadStream.destroy()
    }
    if (writeStream) {
      writeStream.end()
    }
  }

  static async downloadVideo(videoUrl) {
    const info = await ytdl.getInfo(videoUrl)
    const videoTitle = info.videoDetails.title
    const outputFileName = path.join(__dirname, '..', 'media', 'input', `${videoTitle}.mp4`).split(' ').join('_')
    const downloadStream = ytdl(videoUrl, { filter: 'audioandvideo' })
    const writeStream = fs.createWriteStream(outputFileName)

    return new Promise((resolve, reject) => {
      downloadStream.on('data', chunk => {
        writeStream.write(chunk)
      })

      downloadStream.on('end', () => {
        this.cleanup(downloadStream, writeStream)
        resolve(outputFileName)
      })

      downloadStream.on('error', err => {
        console.error(`Error: ${err.message}`)
        this.cleanup(downloadStream, writeStream)
        reject(err)
      })

      process.on('SIGINT', () => {
        this.cleanup(downloadStream, writeStream)
        process.exit()
      })
    })
  }

  static async downloadVideoBatch(videoUrls) {
    const downloadVideosPromises = videoUrls.map(async (url) => await YoutubeHandler.downloadVideo(url))
    await Promise.all(downloadVideosPromises)
    console.log('Finished to install videos from youtube!')
  }
}

module.exports = { YoutubeHandler }
