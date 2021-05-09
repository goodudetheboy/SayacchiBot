module.exports = {
    name: 'timetable',
    description: 'Get Weather News Channel timetable from https://weathernews.jp/s/solive24/timetable.html',
    async execute(message, args) {
        message.channel.send('I\'m getting the timetable, please wait for me ok <3');
        message.channel.send('番組表？ちょっと待ってね ❤');
        var timetable = await getTimetable();
        // 1 = time, 2 = title, 3 = img_caster
        for(var i = 0; i < timetable.length; i++) {
            var embed = new MessageEmbed()
            .setColor('#0099ff')    
            .setTitle(timetable[i][0])
            .setAuthor(timetable[i][1], 'https://weathernews.jp/' + timetable[i][2]);
            message.channel.send(embed);
        }
        message.channel.send('That\'s all!');
        message.channel.send('それだけです！');
    }
}

const Discord = require('discord.js');
const puppeteer = require('puppeteer');
const MessageEmbed = Discord.MessageEmbed;

async function getTimetable() {
    try {
        const browser = await puppeteer.launch({headless: true});
        const [page] = await browser.pages();
    
        await page.goto('https://weathernews.jp/s/solive24/timetable.html', { waitUntil: 'networkidle0' });
    
        console.log('Getting WNI timetable data');
        const data = await page.evaluate(() => {
            var timetable = [];
            var content = document.getElementsByClassName('content');
            for(var i = 0; i < content.length; i++) {
                var entry = []
                entry[0] = content[i].getElementsByClassName('time')[0].innerHTML;
                entry[1] = content[i].getElementsByClassName('title')[0].innerHTML;
                entry[2] = content[i].getElementsByClassName('img_caster')[0].getAttribute('src');
                timetable[i] = entry;
            }
            return timetable;
        })
        .catch(console.error);
        await browser.close();
        return data;
    } catch (err) {
        console.error(err);
    }
}
  
//   (async function main() {
//       var timetable = await getTimetable();
//       console.log(timetable);
//   })();