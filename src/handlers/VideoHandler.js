const { ONE_MEGABYTE_IN_BYTES, outputVideosFolder } = require('../consts');
const { FileHandler } = require('./FileHandler');
const { spawn } = require('child_process');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffprobePath = require('@ffprobe-installer/ffprobe').path
const ffmpeg = require('fluent-ffmpeg')
ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath)

class VideoHandler {
  static getVideoDurationInSeconds(video) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(video.filePath, (err, metadata) => {
        if (err) {
          console.error('Error reading video metadata:', err)
          reject(err)
          return
        }
        const durationInSeconds = metadata.format.duration
        resolve(durationInSeconds)
      })
    })
  }

  static async splitVideoBySize({ video, maxSizeInMB }) {
    const BASENAME = video.filePath.replace(/\.[^/.]+$/, '');
    const fileSizeInBytes = video.stat.size
    const fileSizeInMB = fileSizeInBytes / ONE_MEGABYTE_IN_BYTES
    if (fileSizeInMB <= maxSizeInMB) {
      return console.log(`Video ${video.filePath} is already within the specified size limit.`)
    }

    const videoDurationInSeconds = await this.getVideoDurationInSeconds(video)
    const durationOfEntireFileInSeconds = videoDurationInSeconds
    const maxSizeInBytes = maxSizeInMB * ONE_MEGABYTE_IN_BYTES;
    let currentDuration = 0;
    let partIndex = 1;
    async function encodeNextVideoPart() {
      const outputPartFilePath = `${BASENAME}-part_${partIndex}.mp4`.replace('media/input', 'media/output');
      const args = [
        '-ss', currentDuration.toString(),
        '-i', video.filePath,
        '-y',
        '-acodec', 'copy',
        '-vcodec', 'copy',
        '-fs', maxSizeInBytes.toString(),
        outputPartFilePath
      ];
      await VideoHandler.spawnFfmpegProcess(args);
      partIndex++;

      const mostRecentVideo = await FileHandler.getMostRecentFileByFolder(outputVideosFolder);
      currentDuration += await VideoHandler.getVideoDurationInSeconds(mostRecentVideo);
      if (Math.floor(currentDuration) < Math.floor(durationOfEntireFileInSeconds)) {
        return await encodeNextVideoPart();
      }
      console.log(`Finished splitting video ${video.filePath} with duration ${(durationOfEntireFileInSeconds / 60).toFixed(2)} minutes into parts.`)
    }
    await encodeNextVideoPart();
  }

  static async splitVideoBySizeBatch({ videos, maxSizeInMB }) {
    const splitVideosPromises = videos.map(video => VideoHandler.splitVideoBySize({ video, maxSizeInMB }))
    await Promise.all(splitVideosPromises)
    console.log(`Finished to split all ${videos.length} videos by size of ${maxSizeInMB}mb!\n`)
  }

  static spawnFfmpegProcess(args) {
    const ffmpegProcess = spawn(ffmpegPath, args);
    if (process.env.DEBUG) {
      ffmpegProcess.stdout.on('data', (data) => {
        console.log(`ffmpeg stdout: ${data}`);
      });
      ffmpegProcess.stderr.on('data', (data) => {
        console.error(`ffmpeg stderr: ${data}`);
      });
    }
    return new Promise((resolve, reject) => {
      ffmpegProcess.on('close', (code) => {
        if (code === 0) {
          resolve()
        } else {
          reject(`ffmpeg process exited with code ${code}`);
        }
      });
    })
  }
}

module.exports = { VideoHandler }
