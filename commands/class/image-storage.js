const Scraper = require('images-scraper');
const { browser_path } = require('../../config.json');
const Utils = require('../../utils/utils');

module.exports = class ImageStorage {
    constructor(imageQuery, imageNum) {
        this.imageQuery = String(imageQuery);
        this.imageNum = imageNum;
        this.scraper = new Scraper({
            puppeteer: {
                headless: true,
                executablePath: browser_path,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });
    }

    async refresh() {
        this.imageStorage
            = await this.scraper.scrape(this.imageQuery, this.imageNum);
    }

    getRandomImage() {
        let random = Utils.getRandomFromRange(0, this.imageStorage.length);
        return this.getImageByIndex(random)
    }

    getImageByIndex(index) {
        return this.imageStorage[index];
    }
}
