const Discord = require('discord.js');
const puppeteer = require('puppeteer');
const MessageEmbed = Discord.MessageEmbed;
const Error = require('../../error/error.js')

module.exports = {
    name: 'timetable',
    description: 'Get Weather News Channel timetable from https://weathernews.jp/s/solive24/timetable.html.',
    args: false,
    aliases: [ 'schedule' ],
    async execute(message, args) {
        if(args.length == 0){
            message.channel.send('I\'m getting the timetable, please wait for me ok <3');
            message.channel.send('番組表？ちょっと待ってね ❤');
            await sendTimetable(message, 0).catch(console.error);
            return;
        } 
            // TODO: Check timetable of other casters too
        switch(args[0]) {
            case 'refresh':
                message.channel.send('You want to refresh the timetable? Ok then');
                await refreshTimetable();
                message.channel.send('Timetable refreshed!');
                break;
            case 'saya':
            case 'sayacchi':
                // TODO: check if timetable is too old by getting time from somewhere
                message.channel.send('You want to know what time I\'m live?');
                var timeslots = await checkLive('hiyama');
                var errorStopper = 0;
                while(typeof timeslots === 'undefined') {
                    message.channel.send('Too bad there\'s nothing on my current timetable, I\'ll refresh my timetable for you!');
                    await refreshTimetable();
                    timeslots = await checkLive('hiyama');
                    // In case of infinite while loop, return and send error code 1
                    if(errorStopper == 10) return Error.sendErrorCode(message, 1);
                    errorStopper++;
                }
                if(timeslots.length == 0) {
                    message.channel.send('Too bad I\'ll not be live in my current timetable,but you can try refreshing by doing \`!timetable refresh\` to see if thing\'s better!');
                    return;
                }
                message.channel.send('Here\'s when I will be live:');
                for(var i=0; i < timeslots.length; i++) {
                    sendTimeslot(message, timeslots[i]);
                }
                break;
            case 'today': // TODO:
                message.channel.send('You want to know the timetable for today?');
                sendTimetable(message, 1);
                break;
            case 'tomorrow': // TODO:
                message.channel.send('You want to know the timetable for tomorrow?');
                sendTimetable(message, 2);
                break;
        }
    }
}
/////////////////////////////MAIN FUNCTION/////////////////////////////
var timetable;
var todayTimetable;
var tmrTimetable;
refreshAndSplitTimetable();



/////////////////////////////FUNCTIONS BELOW/////////////////////////////

// Retrieve WNI timetable data from https://weathernews.jp/s/solive24/timetable.html
async function getTimetable() {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const [page] = await browser.pages();
    
        await page.goto('https://weathernews.jp/s/solive24/timetable.html', { waitUntil: 'networkidle0' });
    
        console.log('Retrieving WNI timetable data');
        const data = await page.evaluate(() => {
            var timetable = [];
            var content = document.getElementsByClassName('content');
            for(var i=0; i < content.length; i++) {
                var entry = []
                entry[0] = content[i].getElementsByClassName('time')[0].innerHTML;
                entry[1] = content[i].getElementsByClassName('title')[0].innerHTML;
                entry[2] = content[i].getElementsByClassName('img_caster')[0].getAttribute('src');
                entry[3] = entry[2].replace(/\/s\/topics\/img\/caster\/|2018|_m1|\.jpg/gm, '');
                timetable[i] = entry;
            }
            return timetable;
        })
        .catch(console.error);
        console.log('WNI timetable data retrieved successfully');
        await browser.close();

        var dataMap = new Map();
        // Remapping this because can't return Map from page.evaluate()
        for(var i = 0; i < data.length; i++) {
            dataMap.set(i, {
                time: data[i][0],
                title: data[i][1],
                casterImg: data[i][2],
                casterName: data[i][3] 
            })
        }
        return dataMap;
    } catch (err) {
        console.error(err);
    }
}

/*  
    Send WNI timetable data from storage, if nothing in storage then refresh
    limit:  0 => send all
            1 => send today's
            2 => send tomorrow's (not implemented yet)
 */
async function sendTimetable(message, limit) {
    message.channel.send("Here's your timetable!");

    // TODO: put a more robust try/catch here
    var timetableToSend = (limit == 0) ? this.timetable : ((limit == 1) ? this.todayTimetable : this.tmrTimetable);
    if(typeof timetableToSend === 'undefined') {
        await refreshAndSplitTimetable();
    }

    for(var i = 0; i < timetableToSend.size; i++) {
        var timeslot = timetableToSend.get(i);
        sendTimeslot(message, timeslot);
    }

    message.channel.send('That\'s all!');
    message.channel.send('それだけです！');
}

// Refresh WNI timetable in storage
async function refreshTimetable() {
    console.log('Refreshing timetable');
    this.timetable = await getTimetable();
    console.log('Timetable successfully refreshed');
}

// Split timetable in storage to today and tomorrow
async function splitTimetable() {
    console.log('Splitting timetable');
    var todayI = 0;
    var tomorrowI = 0;
    this.todayTimetable = new Map();
    this.tmrTimetable = new Map();

    for(var i=0; i < this.timetable.size; i++) {
        var timeslot = this.timetable.get(i);
        // check for today's timeslot by comparing with previous time slot
        if(i != 0 && timeslot.time.localeCompare(this.timetable.get(i-1).time) < 0) {
            tomorrowI = i;
            break;
        }
        this.todayTimetable.set(i, timeslot);
    }


    for(var k=0; tomorrowI < this.timetable.size; k++) {
        this.tmrTimetable.set(k, this.timetable.get(tomorrowI)); 
        tomorrowI++;
    }

    console.log(this.tmrTimetable);

    console.log('Timetable succesfully split');
}

// Refresh and split timetable
async function refreshAndSplitTimetable() {
    await refreshTimetable();
    await splitTimetable();
}

// Create and send a MessageEmbed from input time slot data
function sendTimeslot(message, timeslot) {
    var embed = new MessageEmbed()
        .setColor('#0099ff')    
        .setTitle(timeslot.time)
        .setAuthor(timeslot.title, 'https://weathernews.jp/' + timeslot.casterImg);
    message.channel.send(embed);
}

/* 
    Check if input caster name has live time slots in timetable in storage
    return code:    -1: no timetable in storage,
                    0 : no time slot in current timetable,
                    1 : input caster's name has time slot
 */
function checkLive(casterName) {
    if(typeof this.timetable === 'undefined') return undefined; 
    var result = [];
    var k = 0;
    for(var i=0; i < this.timetable.size; i++) {
        let timeslot = this.timetable.get(i);
        if(casterName.localeCompare(timeslot.casterName) == 0) {
            result[k] = timeslot;
            k++;
        }
    }
    return result;
}

function checkLiveWithCurrentTime(casterName) {
    var timeslots = checkLive(casterName);

}

// Get time of input timezone from UTC
// JST UTC+9
function getCurrentTimeFromTimezone(timezone) {
    var d = new Date();
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    var nd = new Date(utc + (3600000*timezone));
    return nd;
}