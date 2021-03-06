const Discord = require('discord.js');
const MessageEmbed = Discord.MessageEmbed;

const Utils = require('../../utils/utils');
const ImageStorage = require('../../class/image-storage');

const DEFAULT_MESSAGE_COLOR = 0xff0000;

module.exports = {
    name: 'saya',
    description: 'Get random image of Sayacchi from Google Images.',
    args: false,
    async execute(message, args) {
        // TODO: add remove element and when currentI maxed out
        if(args.length == 0) {
            console.log(`Requesting Sayacchi image from storage by ${ message.author.id } - ${ message.author.username }`);
            return imageStorage.sendImage(message, 'UwU さやっち so kawaii', DEFAULT_MESSAGE_COLOR);
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

//-----------------------------------------------------------------------------


var imageStorage = new ImageStorage("\"檜山沙耶\"写真", 150);
  
(async () => {// 檜山沙耶, Hiyama Saya
    console.log('Setting up image storage');
    await refreshImageStorage();
    console.log('Scrape complete, storage ready for usage');
})();

//-----------------------------------------------------------------------------

async function refreshImageStorage() {
    console.log('Refreshing image storage');
    try {
        await imageStorage.refresh();
    } catch(err) {
        console.log(err);
        console.log("Retrying refresh");
        await imageStorage.refresh();
    }
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