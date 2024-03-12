const { YoutubeHandler } = require('./handlers/YoutubeHandler');
const { FileHandler } = require('./handlers/FileHandler');
const { VideoHandler } = require('./handlers/VideoHandler');
const { InputHandler } = require('./handlers/InputHandler');
const { inputVideosFolder, doneVideosFolder } = require('./consts');

(async function () {
  try {
    const youtubeVideoUrls = await InputHandler.getYoutubeVideoUrls();
    if (!youtubeVideoUrls.length) { return console.log('There are no Youtube video URLs.') }

    await YoutubeHandler.downloadVideoBatch(youtubeVideoUrls);

    const videos = await FileHandler.getAllFilesByFolder(inputVideosFolder)
    if (!(videos && videos.length)) { return console.log('There are no videos to process.') }

    await VideoHandler.splitVideoBySizeBatch({ videos, maxSizeInMB: 60 });
    await FileHandler.moveAllFilesToAnotherFolder(inputVideosFolder, doneVideosFolder)
    console.log('done!')
    process.exit(1);
  } catch (error) {
    console.log('error', error)
  }
})()

