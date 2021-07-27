const TEST_CHANNEL_ID = process.env.TEST_CHANNEL_ID;
const DESIRED_CHANNEL_ID_2 = process.env.DESIRED_CHANNEL_ID_2;

const HOUR_IN_MILLISECOND = 1000 * 60 * 60;
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
    const checkLiveChannel = client.channels.cache.get(DESIRED_CHANNEL_ID_2); // replace args inside for TEST_CHANNEL_ID

    // ground live checking until a full hour
    setTimeout(function() {
        if(timetableCommand.checkLiveInRepeat(checkLiveChannel, 'hiyama')) {
            console.log(`Sayacchi is online, delaying live checking for another ${ DELAY_TIME_IN_HOUR } hours`);
        }
        setCheckLiveInterval(client, checkLiveChannel, timetableCommand);
    }, millisecondsUntilNextFullHour());

    console.log('Live checking initalized');
}

function setCheckLiveInterval(client, checkLiveChannel, timetableCommand) {
    // live checking interval initializing  
    checkLiveInterval = setInterval(function() {
        if(timetableCommand.checkLiveInRepeat(checkLiveChannel, 'hiyama')) {
            console.log(`Sayacchi is online, delaying live checking for another ${ DELAY_TIME_IN_HOUR } hours`);
            delayCheckLive(client);         
        }
    }, 1 * HOUR_IN_MILLISECOND);
}

function delayCheckLive(client) {
    clearInterval(checkLiveInterval);
    setTimeout(function() {
        setCheckLiveInterval(client);
    }, DELAY_TIME_IN_HOUR * HOUR_IN_MILLISECOND);
}

function millisecondsUntilNextFullHour() {
    let d = new Date();
    let min = d.getMinutes();
    return (60 - min) * 60 * 1000;
}