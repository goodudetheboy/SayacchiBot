const Discord = require('discord.js');
const MessageEmbed = Discord.MessageEmbed;
const Utils = require('../../utils/utils');
const ImageStorage = require('../class/image-storage');

module.exports = {
    name: 'saya',
    description: 'Get random image of Sayacchi from Google Images.',
    args: false,
    async execute(message, args) {
        // TODO: add remove element and when currentI maxed out
        if(args.length == 0) {
            console.log(`Requesting Sayacchi image from storage by ${ message.author.id } - ${ message.author.username }`);
            return imageStorage.sendImage(message, 'UwU さやっち so kawaii', 0xff0000);
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
var imageStorage = new ImageStorage("檜山沙耶WNI", 150);
  
(async () => {// 檜山沙耶, Hiyama Saya
    console.log('Setting up image storage');
    await refreshImageStorage();
    console.log('Scrape complete, storage ready for usage');
})();

/////////////////////////////FUNCTIONS BELOW/////////////////////////////
async function refreshImageStorage() {
    console.log('Refreshing image storage');
    await imageStorage.refresh();
    console.log('Image storage refreshed');
}

function sendImage(message, customTitle) {
    let image = imageStorage.getRandomImage();
    while(!Utils.checkImageUrl(image.url)) {
        image = imageStorage.getRandomImage();
        console.log('URL not image, rerolling')
    }
    console.log(image.url);
    const embed = new MessageEmbed()
        .setTitle(customTitle)
        .setColor(0xff0000)
        .setImage(image.url);
    return message.channel.send(embed);
}