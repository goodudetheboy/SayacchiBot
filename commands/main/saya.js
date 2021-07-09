const Discord = require('discord.js');
const Scraper = require('images-scraper');
const { browser_path } = require('../../config.json');
const MessageEmbed = Discord.MessageEmbed;
const Utils = require('../../utils/utils');

module.exports = {
    name: 'saya',
    description: 'Get random image of Sayacchi from Google Images.',
    args: false,
    async execute(message, args) {
        // TODO: add remove element and when currentI maxed out
        if(args.length == 0) {
            console.log(`Requesting Sayacchi image from storage by ${ message.author.id } - ${ message.author.username }`);
            return sendImage(message, 'UwU さやっち so kawaii');
        }
        
        switch(args[0]) {
            case 'refresh':
                message.channel.send('Refreshing images? I\'ll be right back!');
                await refreshImageStorage();
                message.channel.send('Images refreshed!');
        }
    },
    sendImage
}
/////////////////////////////MAIN FUNCTION/////////////////////////////
var imageStorage;

const google = new Scraper({
    puppeteer: {
        headless: true,
        executablePath: browser_path,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});
  
(async () => {// 檜山沙耶, Hiyama Saya
    console.log('Setting up image storage');
    await refreshImageStorage();
    console.log('Scrape complete, storage ready for usage');
})();

/////////////////////////////FUNCTIONS BELOW/////////////////////////////
async function refreshImageStorage() {
    console.log('Refreshing image storage');
    imageStorage = await google.scrape("檜山沙耶WNI", 150);
    console.log('Image storage refreshed');
}

function sendImage(message, customTitle) {
    let image = imageStorage[Utils.getRandomFromRange(0, imageStorage.length)];
    while(!Utils.checkImageUrl(image.url)) {
        image = imageStorage[Utils.getRandomFromRange(0, imageStorage.length)];
        console.log('URL not image, rerolling')
    }
    console.log(image.url);
    const embed = new MessageEmbed()
        .setTitle(customTitle)
        .setColor(0xff0000)
        .setImage(image.url);
    return message.channel.send(embed);
}