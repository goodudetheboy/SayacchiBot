const Discord = require('discord.js');
const Scraper = require('images-scraper');
const MessageEmbed = Discord.MessageEmbed;
const Utils = require('../../utils.js');

module.exports = {
    name: 'saya',
    description: 'Get random image of Sayacchi from Google Images.',
    args: false,
    async execute(message, args) {
        // TODO: add remove element and when currentI maxed out
        if(args.length == 0) {
            console.log(`Requesting Sayacchi image from storage by ${message.author.id} - ${message.author.username}`);
            var image = imageStorage[Utils.getRandomFromRange(0, imageStorage.length)];
            while(!Utils.checkImageUrl(image.url)) {
                image = imageStorage[Utils.getRandomFromRange(0, imageStorage.length)];
                console.log('URL not image, rerolling')
            }
            // currentI++;
            console.log(image.url);
            const embed = new MessageEmbed()
                .setTitle('UwU さやっち so kawaii')
                .setColor(0xff0000)
                .setImage(image.url);
            return message.channel.send(embed);
        }
        
        switch(args[0]) {
            case 'refresh':
                message.channel.send('Refreshing images? I\'ll be right back!');
                await refreshImageStorage();
                message.channel.send('Images refreshed!');
        }
    }
}
/////////////////////////////MAIN FUNCTION/////////////////////////////
var imageStorage;

const google = new Scraper({
    puppeteer: {
        headless: true,
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