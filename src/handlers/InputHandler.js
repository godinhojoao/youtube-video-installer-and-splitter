const readline = require('readline');
const { isValidYoutubeLink } = require('../utils/validateYoutubeLink');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
let answers = []

class InputHandler {
  static async handleInput(message) {
    rl.question(message, (input) => {
      input = input.trim()
      if (input.toLowerCase() === 'ok') {
        rl.close()
      } else {
        answers.push(input)
        this.handleInput('')
      }
    });

    return new Promise((resolve) => {
      rl.on('close', () => {
        resolve(answers)
        answers = []
      })
    })
  }

  static async getYoutubeVideoUrls() {
    const message = 'Enter YouTube video URL (or type "ok" to finish):\n'
    const youtubeVideoUrls = await this.handleInput(message);
    const validYoutubeVideoUrls = youtubeVideoUrls.filter(url => isValidYoutubeLink(url))
    return validYoutubeVideoUrls
  }
}

module.exports = { InputHandler };
