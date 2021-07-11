const MessageButton = require('discord-buttons').MessageButton;
const MessageActionRow = require('discord-buttons').MessageActionRow;
const RollDiceDB = require('../../models/rolldice-db');

module.exports = {
    name: 'rolldice',
    description: 'Play a Cho-han, a.k.a. odd-or-even game with Sayacchi! Guess the correct odd or even of the Lucky Number (ラッキーナンバー）, which is the sum of 2 dice, and win a special prize! Higher win streak wins more special prize! Check current win streak with `rolldice streak`.',
    args: false,
    aliases: [ 'chohan' ],
    async execute(message, args) {
        if (args.length == 0) {
            startGame(message); 
        }

        switch (args[0]) {
            case "streak":
                await sendCurrentStreak(message);
            case "highscore":
                await sendHighscore(message);
        }
    },
    check
}

function startGame(message) {
    let userId = message.author.id;

    let evenButton = new MessageButton()
                        .setLabel("Even 丁")
                        .setStyle("red")
                        .setID(`oddEven_${userId}_even`)

    let oddButton = new MessageButton()
                        .setLabel("Odd 半")
                        .setStyle("green")
                        .setID(`oddEven_${userId}_odd`)

    let buttonRow = new MessageActionRow()
                        .addComponent(evenButton)
                        .addComponent(oddButton);

    message.channel.send("Let's play the rolling dice game! Guess even or odd of sum of the two dice!");
    message.channel.send("ゲームスタート！", { component: buttonRow });
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function check(client, button, userId, answer) {
    button.message.channel.send("Rolling dice... 🎲🎲");
    button.message.delete();
    setTimeout(async function() {
        let user = `<@${ userId }>`;

        console.log('Rolling dice');
        let die1 = randomInteger(1, 6);
        let die2 = randomInteger(1, 6);
        let sum = die1 + die2;
        let isOdd = sum % 2 != 0;
        let youWinCheck;
    
        if (answer == "odd") {
            youWinCheck = isOdd;
        } else if (answer == "even") {
            youWinCheck = !isOdd;
        } else {
            Error.sendErrorCode(button.message, 2);
        }
    
        button.message.channel.send(`Die 1 is ${ numberToEmoji(die1) }`);
        button.message.channel.send(`Die 2 is ${ numberToEmoji(die2) }`);
        button.message.channel.send(`${ user }, you chose ${ answer }`);
    
        if (youWinCheck) {
            await youWin(button.message, client, userId);
        } else {
            await youLose(button.message, userId);
        }
    }, 3000);
}

async function youWin(message, client, userId) {
    message.channel.send("You win!");
    message.channel.send("勝利！☆*:.｡.o(≧▽≦)o.｡.:*☆");
    await checkExist(userId);
    RollDiceDB
        .findById(userId)
        .then(player => {
            let winStreak = player.currentStreak;
            winStreak = winStreak + 1;
            let highscore = (winStreak > player.highscore)
                            ? winStreak
                            : player.highscore ;
            updateStreak(winStreak, highscore, userId);
            let prize = client.commands.get('prize');
            prize.imagePrize(message, winStreak);
        })
        .catch(console.error);    

}

async function youLose(message, userId) {
    message.channel.send("You lose :*(");
    message.channel.send("負けった 	｡･ﾟﾟ*(>д<)*ﾟﾟ･｡");
    await checkExist(userId);
    RollDiceDB
        .findByIdAndUpdate(userId, { currentStreak: 0 })
        .then(() => { console.log('Streak reset succesfully'); })
        .catch(console.error);
}

function numberToEmoji(number) {
    switch (number) {
        case 1: return "1️⃣";
        case 2: return "2️⃣";
        case 3: return "3️⃣";
        case 4: return "4️⃣";
        case 5: return "5️⃣";
        case 6: return "6️⃣";
    }
}

async function sendCurrentStreak(message) {
    let userId = message.author.id;
    let user = `<@${userId}>`;
    await checkExist(userId);
    RollDiceDB
        .findById(userId)
        .then(player => { 
            return message.channel.send(`${ user }, your current win streak is ${ player.currentStreak }.`);
        })
        .catch(console.error);
}

async function sendHighscore(message) {
    let userId = message.author.id;
    let user = `<@${userId}>`;
    await checkExist(userId);
    RollDiceDB
        .findById(userId)
        .then(player => { 
            return message.channel.send(`${ user }, your highest streak is ${ player.highscore }.`);
        })
        .catch(console.error);
}

async function addPlayer(userId) {
    const player = new RollDiceDB({ _id: userId });
    await player.save()
        .then((result) => {
            console.log(`Added player with userId ${ userId } to rolldice database`);
        })
        .catch(console.error);
}

async function checkExist(userId) {
    const isExist = await RollDiceDB.exists({ _id: userId });
    if (!isExist) {
        await addPlayer(userId);
    }
}

function updateStreak(streak, highscore, userId) {
    RollDiceDB
        .findByIdAndUpdate(userId, { currentStreak: streak, highscore: highscore })
        .then(() => { console.log(`Streak updated to ${ streak } succesfully`); })
        .catch(console.error);
}