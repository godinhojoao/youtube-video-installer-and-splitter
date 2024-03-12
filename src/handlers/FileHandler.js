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

  static async moveFileToAnotherFolder(filePath, destinationFolder) {
    const fileName = path.basename(filePath);
    const destinationPath = path.join(destinationFolder, fileName);
    await fs.rename(filePath, destinationPath);
  }

  static async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error(`Error deleting file: ${error}`);
    }
  }
}

module.exports = { FileHandler }
