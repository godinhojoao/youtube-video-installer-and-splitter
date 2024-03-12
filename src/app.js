const { YoutubeHandler } = require('./handlers/YoutubeHandler');
const { FileHandler } = require('./handlers/FileHandler');
const { VideoHandler } = require('./handlers/VideoHandler');
const { InputHandler } = require('./handlers/InputHandler');
const { inputVideosFolder } = require('./consts');

(async function () {
  try {
    const youtubeVideoUrls = await InputHandler.getYoutubeVideoUrls();
    if (!youtubeVideoUrls.length) { return console.log('There are no Youtube video URLs.') }

    console.log('Starting to download and split videos...')
    await YoutubeHandler.downloadVideoBatch(youtubeVideoUrls);

    const videos = await FileHandler.getAllFilesByFolder(inputVideosFolder)
    if (!(videos && videos.length)) { return console.log('There are no videos to process.') }

    await VideoHandler.splitVideoBySizeBatch({ videos, maxSizeInMB: 60 });
    console.log('end!')
    process.exit(1);
  } catch (error) {
    console.log('error', error)
  }
})()
