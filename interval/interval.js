const { TEST_CHANNEL_ID } = require('../config.json');

const HOUR_IN_MILLISECOND = 1000 * 60 * 60;
const DESIRED_CHANNEL_ID = '839154353046290513';
const DELAY_TIME_IN_HOUR = 5;

module.exports = {
    run(client) {
        setCheckLive(client);
    }
}

var checkLiveInterval;

function setCheckLive(client) {
    console.log('Live checking initalizing');

    const timetableCommand = client.commands.get('timetable');
    const checkLiveChannel = client.channels.cache.get(TEST_CHANNEL_ID); // replace args inside for DESIRED_CHANNEL_ID
    checkLiveInterval = setInterval(function() {
        if(timetableCommand.checkLiveInRepeat(checkLiveChannel, 'hiyama')) {
            console.log(`Sayacchi is online, delaying live checking for another ${ DELAY_TIME_IN_HOUR } hours`);
            delayCheckLive(client);         
        }   
    }, 1 * HOUR_IN_MILLISECOND);

    console.log('Live checking initalized');
}

function delayCheckLive(client) {
    clearInterval(checkLiveInterval);
    setTimeout(setCheckLive(client), DELAY_TIME_IN_HOUR * HOUR_IN_MILLISECOND);
}