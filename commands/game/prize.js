const Error = require('../../error/error.js');
const ImageStorage = require('../class/image-storage');

const PRIZE_NUM = 100;

module.exports = {
    name: 'prize',
    description: 'Play one of the games for a chance to win a special prize!',
    args: false,
    aliases: [],
    execute(message, args) {
        message.channel.send('Play one of the games for a chance to win a special prize!');
    },
    imagePrize
}

var specialPrize = new ImageStorage("檜山沙耶 インスタグラム", PRIZE_NUM);
var extraSpecialPrize = new ImageStorage("グラビアモデル", PRIZE_NUM);
var superDuperSpecialPrize = new ImageStorage("jav model", PRIZE_NUM);

(async () => {
    console.log("Setting up prize");
    await refreshPrize();
    console.log("Finished setting up prize");
})();

function imagePrize(message, streak) {
    try {
        if (streak == 10 || streak == 15) {
            sendSuperDuperSpecialPrize(message, streak);
        } else if (streak == 5 || streak == 12) {
            sendExtraSpecialPrize(message, streak);
        } else {
            sendSpecialPrize(message, streak);
        }
    } catch (error) {
        console.log(error);
        Error.sendErrorCode(message, 3);
    }
}

function sendSpecialPrize(message, streak) {
    specialPrize.sendImage(message,
        `Here\'s your special prize for the ${ streak } win streak!`
        + ` Plus a little キース from me 💋...`, 0xff0000);
    message.channel.send("Keep winning to unlock more exciting prizes!");
}

function sendExtraSpecialPrize(message, streak) {
    extraSpecialPrize.sendImage(message, `Congrats on the ${ streak } win streak!`
        + ` Here's an extra special prize!\n セックシーでしょう？`, '#c034eb');
    message.channel.send("Keep going, there's more exciting things waiting for you!");
}

function sendSuperDuperSpecialPrize(message, streak) {
    superDuperSpecialPrize.sendImage(message, `You are SUPER DUPER GOOD with the ${ streak } win streak!`
        + ` Here's a SUPER DUPER SPECIAL PRIZE to celebrate the milestone!\n`
        + ` おめでとう 🎉🎉🎉！`, '#eb3483');
}

async function refreshPrize() {
    console.log("Refreshing prize");
    await specialPrize.refresh();
    await extraSpecialPrize.refresh();
    await superDuperSpecialPrize.refresh();
    console.log("Finished refreshing prize");
}