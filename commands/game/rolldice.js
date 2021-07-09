const MessageButton = require('discord-buttons').MessageButton;
const MessageActionRow = require('discord-buttons').MessageActionRow;


module.exports = {
    name: 'rolldice',
    description: 'Play a Cho-han, a.k.a. odd-or-even game with Sayacchi! Guess the correct odd or even of the Lucky Number (ラッキーナンバー）and win a special prize!',
    args: false,
    aliases: [ 'chohan' ],
    execute(message, args) {
       startGame(message); 
    },
    check
}

function startGame(message) {
    let evenButton = new MessageButton()
                        .setLabel("Even 丁")
                        .setStyle("red")
                        .setID("oddEven_even")

    let oddButton = new MessageButton()
                        .setLabel("Odd 半")
                        .setStyle("green")
                        .setID("oddEven_odd")


    let buttonRow = new MessageActionRow()
        .addComponent(oddButton)
        .addComponent(evenButton)

    message.channel.send("ゲームスタート！", { component: buttonRow });
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

function check(client, button, answer) {
    button.message.channel.send("Rolling dice... 🎲");
    button.message.delete();
    setTimeout(function() {
        console.log('Rolling dice');
    
        let dice1 = randomInteger(1, 6);
        let dice2 = randomInteger(1, 6);
        let sum = dice1 + dice2;
        let isOdd = (sum % 2 != 0);
        let youWinCheck;
    
        if (answer == "odd") {
            youWinCheck = isOdd;
        } else if (answer == "even") {
            youWinCheck = !isOdd;
        } else {
            Error.sendErrorCode(button.message, 2);
        }
    
        button.message.channel.send(`Dice 1 is ${ numberToEmoji(dice1) }`);
        button.message.channel.send(`Dice 2 is ${ numberToEmoji(dice2) }`);
        button.message.channel.send(`You chose ${ answer }`);
    
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
    let prize = client.commands.get("prize");
    prize.imagePrize(message, client);
}

function youLose(message) {
    message.channel.send("You lose :*(");
    message.channel.send("負けった 	｡･ﾟﾟ*(>д<)*ﾟﾟ･｡");
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