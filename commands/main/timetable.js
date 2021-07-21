const Discord = require('discord.js');
const puppeteer = require('puppeteer');
const { browser_path } = require('../../config.json');
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
            return sendTimetable(message, 0).catch(console.error);
        } 
            // TODO: Check timetable of other casters too
        switch(args[0]) {
            case 'refresh':
                message.channel.send('You want to refresh the timetable? Ok then');
                await refreshAndSplitTimetable();
                return message.channel.send('Timetable refreshed!');
            case 'saya':
            case 'sayacchi':
                await checkLiveCommand(message);
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
    // Return value true, if online, and false if not
    checkLiveInRepeat(channel, casterName) {
        // TODO: Currently this only supports 'saya', to be expanded later
        console.log(`Checking ${ casterName }'s live status`);
        console.log(`Current time : ${ getCurrentTimeFromTimezone('+9').getHours() }`); 
        // You might not need this during testing
        if(typeof getStoredTimetable() === 'undefined') {
            console.log('Schedule not yet populated');
            return false;
        } else if(checkLiveWithCurrentTime(casterName)) {
            channel.send(`Sayacchi is live now!`);
            return true;
        } else {
            // replace ${ casterName } with Sayacchi for now
            // TODO: add some sort of name storage to be more flexible
            console.log(`Sayacchi is not live now`);
            return false;
        }
    }
}

//-----------------------------------------------------------------------------

var timetable;
var todayTimetable;
var tomorrowTimetable;
(async () => {
    await refreshAndSplitTimetable();
    setInterval(function() {
        console.log("Interval refreshing of timetable");
        refreshAndSplitTimetable();
    }, 1000 * 60 * 60)
})();

//-----------------------------------------------------------------------------

// Retrieve WNI timetable data from https://weathernews.jp/s/solive24/timetable.html
async function retrieveTimetable() {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            executablePath: browser_path,
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
 *  Send WNI timetable data from storage, if nothing in storage then refresh
 *  limit:  0 => send all
 *          1 => send today's
 *          2 => send tomorrow's (not implemented yet)
 */
async function sendTimetable(message, limit) {
    message.channel.send("Here's your timetable!");

    // TODO: put a more robust try/catch here
    var timetableToSend = (limit == 0) ? this.timetable : ((limit == 1) ? this.todayTimetable : this.tomorrowTimetable);
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
    this.tomorrowTimetable = new Map();
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
        this.tomorrowTimetable.set(k, this.timetable.get(tomorrowI)); 
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

/**
 * Helper function for check live command
 */
async function checkLiveCommand(message) {
    // TODO: check if timetable is too old by getting time from somewhere
    message.channel.send('You want to know what time I\'m live?');
    var timeslotsToday = checkLiveInTimetable('hiyama', getStoredTodayTimetable());
    var timeslotsTomorrow = checkLiveInTimetable('hiyama', getStoredTomorrowTimetable());
    var errorStopper = 0;
    while(typeof timeslotsToday === 'undefined') {
        message.channel.send('Too bad there\'s nothing on my current timetable, I\'ll refresh my timetable for you!');
        await refreshTimetable();
        timeslotsToday = checkLiveInTimetable('hiyama', getStoredTodayTimetable());
        timeslotsTomorrow = checkLiveInTimetable('hiyama', getStoredTomorrowTimetable());
        // In case of infinite while loop, return and send error code 1
        if(errorStopper == 5) return Error.sendErrorCode(message, 1);
        errorStopper++;
    }

    var day = 0; // 0 = today, 1 = tomorrow
    while(day <= 1) {
        var timeslots = (day == 0) ? timeslotsToday : timeslotsTomorrow;
        var dayText = (day == 0) ? 'today' : 'tomorrow';
        if(timeslots.length == 0) {
            message.channel.send(`Too bad I\'ll not be live ${ dayText }, but you can try refreshing by doing \`!timetable refresh\` to see if thing\'s better!`);
        } else {
            message.channel.send(`Here\'s when I will be live ${ dayText }:`);
            for (var timeslot of timeslots) {
                sendTimeslot(message, timeslot);
            }
        }
        day++;
    }
}

/* 
 *  Check if input caster name has live time slots in timetable in storage
 *  return array of timeslot for caster if input caster name is live,
 *  undefined else
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
 *  Check if input caster name is currently live in today's timetable
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

/**
 * Log the input timetable
 * 
 * @param {*} timetable timetable to be logged
 */
function logTimetable(timetable) {
    for(var i=0; i < timetable.size; i++) {
        var timeslot = timetable.get(i);
        console.log(`${ timeslot.time } - ${ timeslot.casterName }`);
    }
}

function logTimetable(timetable) {
    for(var i=0; i < timetable.size; i++) {
        var timeslot = timetable.get(i);
        console.log(`${ timeslot.time } - ${ timeslot.casterName }`);
    }
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

function getStoredTodayTimetable() {
    return this.todayTimetable;
}

function getStoredTomorrowTimetable() {
    return this.tomorrowTimetable;
}