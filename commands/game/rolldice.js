const MessageButton = require('discord-buttons').MessageButton;
const MessageActionRow = require('discord-buttons').MessageActionRow;


module.exports = {
    name: 'rolldice',
    description: 'Play a Cho-han, a.k.a. odd-or-even game with Sayacchi! Guess the correct odd or even of the Lucky Number (ラッキーナンバー）, which is the sum of 2 dice, and win a special prize! Higher win streak wins more special prize! Check current win streak with `rolldice streak`.',
    args: false,
    aliases: [ 'chohan' ],
    execute(message, args) {
        if (args.length == 0) {
            startGame(message); 
        }
        switch (args[0]) {
            case "streak":
                message.channel.send(`Current win streak is ${ winStreak }.`);
        }
    },
    check
}

var winStreak = 0;

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
    setTimeout(function() {
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
            youWin(button.message, client);
        } else {
            youLose(button.message);
        }
    }, 3000);
}

function youWin(message, client) {
    message.channel.send("You win!");
    message.channel.send("勝利！☆*:.｡.o(≧▽≦)o.｡.:*☆");
    winStreak = winStreak + 1;
    let prize = client.commands.get("prize");
    prize.imagePrize(message, winStreak);
}

function youLose(message) {
    message.channel.send("You lose :*(");
    message.channel.send("負けった 	｡･ﾟﾟ*(>д<)*ﾟﾟ･｡");
    winStreak = 0;
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