const Discord = require('discord.js');
const MessageEmbed = Discord.MessageEmbed;

const Scraper = require('images-scraper');
const Utils = require('../utils/utils');

const { browser_path } = require('../config.json');

module.exports = class ImageStorage {
    constructor(imageQuery, imageNum) {
        this.imageQuery = String(imageQuery)
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
        this.imageStorage = await this.scraper.scrape(this.imageQuery, this.imageNum);    
    }

    getRandomImage() {
        let random = Utils.getRandomFromRange(0, this.imageStorage.length);
        return this.getImageByIndex(random)
    }

    getImageByIndex(index) {
        return this.imageStorage[index];
    }

    sendImage(message, customTitle, customColor) {
        let image = this.getRandomImage();
        while(!Utils.checkImageUrl(image.url)) {
            image = this.getRandomImage();
        }
        const embed = new MessageEmbed()
            .setTitle(customTitle)
            .setColor(customColor)
            .setImage(image.url);
        return message.channel.send(embed);
    }
}
