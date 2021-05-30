const Discord = require('discord.js');
const puppeteer = require('puppeteer');
const MessageEmbed = Discord.MessageEmbed;
const Error = require('../../error/error.js')

module.exports = {
    name: 'timetable',
    description: 'Get Weather News Channel timetable from https://weathernews.jp/s/solive24/timetable.html. Args: `refresh` to refresh timetable, `saya` to get my live time today, `today` to get my timetable for today, `tomorrow` to get my timetable for tomorrow, `live` to check if I\'m live now.',
    args: false,
    aliases: [ 'schedule' ],
    async execute(message, args) {
        if(!args.length) {
            message.channel.send('I\'m getting the timetable, please wait for me ok <3');
            message.channel.send('番組表？ちょっと待ってね ❤');
            return await sendTimetable(message, 0).catch(console.error);
        } 
            // TODO: Check timetable of other casters too
        var timetable = getStoredTimetable();
        switch(args[0]) {
            case 'refresh':
                message.channel.send('You want to refresh the timetable? Ok then');
                await refreshAndSplitTimetable();
                return message.channel.send('Timetable refreshed!');
            case 'saya':
            case 'sayacchi':
                // TODO: check if timetable is too old by getting time from somewhere
                message.channel.send('You want to know what time I\'m live?');
                var timeslots = await checkLiveInTimetable('hiyama', timetable);
                var errorStopper = 0;
                while(typeof timeslots === 'undefined') {
                    message.channel.send('Too bad there\'s nothing on my current timetable, I\'ll refresh my timetable for you!');
                    await refreshTimetable();
                    timeslots = await checkLiveInTimetable('hiyama', timetable);
                    // In case of infinite while loop, return and send error code 1
                    if(errorStopper == 10) return Error.sendErrorCode(message, 1);
                    errorStopper++;
                }
                if(timeslots.length == 0) {
                   return message.channel.send('Too bad I\'ll not be live in my current timetable, but you can try refreshing by doing \`!timetable refresh\` to see if thing\'s better!');
                }
                message.channel.send('Here\'s when I will be live:');
                for(var i=0; i < timeslots.length; i++) {
                    sendTimeslot(message, timeslots[i]);
                }
                break;
            case 'today': // TODO:
                message.channel.send('You want to know the timetable for today?');
                return sendTimetable(message, 1);
            case 'tomorrow': // TODO:
                message.channel.send('You want to know the timetable for tomorrow?');
                return sendTimetable(message, 2);
            case 'live':
                // TODO: check live time of other caster too
                // if(typeof args[1] === 'undefined') return message.channel.send('Please provide a caster\'s name >.<');
                if(checkLiveWithCurrentTime('hiyama')) {
                    return message.channel.send(`Yes! I'm currently live now!`);
                } else {
                    return message.channel.send(`Oopsie! Looks like I'm not live now! Check back later!`);
                }
        }
    },
    // Set interval to check live, input time is in HOUR
    async checkLiveInRepeat(channel, casterName) {
        // TODO: Currently this only supports 'saya', to be expanded later
        console.log(`Checking ${ casterName }'s live status`);

        // You might not need this during testing
        await refreshAndSplitTimetable();

        if(typeof getStoredTimetable() === 'undefined') {
            return console.log('Schedule not yet populated');
        }
        return (checkLiveWithCurrentTime(casterName)) ?
            channel.send(`${ casterName } is live now!`) :
            console.log(`${ casterName } is not live now`);
    }
}
/////////////////////////////MAIN FUNCTION/////////////////////////////
var timetable;
var todayTimetable;
var tmrTimetable;
(async () => {
    await refreshAndSplitTimetable();
    // await checkLiveInRepeat('saya', 1000);
})();

/////////////////////////////FUNCTIONS BELOW/////////////////////////////

// Retrieve WNI timetable data from https://weathernews.jp/s/solive24/timetable.html
async function retrieveTimetable() {
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
                entry[3] = entry[2].replace(/\/s\/topics\/img\/caster\/|2018|_m1|_m2|\.jpg/gm, '');
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
    this.timetable = await retrieveTimetable();
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
    return array of timeslot for caster if input caster name is live,
    undefined else
 */
function checkLiveInTimetable(casterName, timetable) {
    if(typeof timetable === 'undefined') return undefined; 
    var result = [];
    var k = 0;
    for(var i=0; i < timetable.size; i++) {
        let timeslot = timetable.get(i);
        if(casterName.localeCompare(timeslot.casterName) == 0) {
            result[k] = timeslot;
            k++;
        }
    }
    return result;
}

/* 
    Check if input caster name is currently live in today's timetable
 */
function checkLiveWithCurrentTime(casterName) {
    var timeslots = checkLiveInTimetable(casterName, this.todayTimetable);
    if(timeslots.length == 0) {
        return false;
    }
    var liveHour = parseInt(timeslots[0].time.substring(0, 2), 10);
    var currentHour = getCurrentTimeFromTimezone('+9').getHours();
    return (currentHour >= liveHour && currentHour < liveHour+3);
}

// Set interval to check live, input time is in HOUR
function checkLiveInRepeat(channel, casterName, timetInHour) {
    return setInterval(function() {
        
    }, parseInt(timetInHour));
}

// Get time of input timezone from UTC
// JST UTC+9
function getCurrentTimeFromTimezone(timezone) {
    var d = new Date();
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    var nd = new Date(utc + (3600000*timezone));
    return nd;
}

function getStoredTimetable() {
    return this.timetable;
}

