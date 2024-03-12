const fs = require('fs').promises;
const path = require('path');

class FileHandler {
  static async getAllFilesByFolder(folderPath) {
    const files = await fs.readdir(folderPath);
    const filesWithStats = await Promise.all(files.map(async (file) => {
      const filePath = path.join(folderPath, file);
      const fileStat = await fs.stat(filePath);
      return { filePath, stat: fileStat };
    }))
    filesWithStats.sort((a, b) => b.stat.birthtimeMs - a.stat.birthtimeMs);
    return filesWithStats;
  }

  static async getMostRecentFileByFolder(folderPath) {
    const allFilesFromFolder = await FileHandler.getAllFilesByFolder(folderPath);
    return allFilesFromFolder && allFilesFromFolder[0];
  }

  static async moveAllFilesToAnotherFolder(folderPath, destinationFolder) {
    const files = await fs.readdir(folderPath);
    await Promise.all(files.map(async (file) => {
      const filePath = path.join(folderPath, file);
      const destinationPath = path.join(destinationFolder, file);
      await fs.rename(filePath, destinationPath);
    }));

    console.log(`Files moved from ${folderPath} to ${destinationFolder}`);
  }
}

module.exports = { FileHandler }
