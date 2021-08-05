// original code taken from https://github.com/twitterdev/Twitter-API-v2-sample-code/tree/main/Filtered-Stream
// LICENSE: Apache-2.0 License

const needle = require('needle');
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const TEST_CHANNEL_ID = process.env.TEST_CHANNEL_ID;
const DESIRED_CHANNEL_ID = process.env.DESIRED_CHANNEL_ID;
const DESIRED_CHANNEL_ID_2 = process.env.DESIRED_CHANNEL_ID_2;

const Discord = require('discord.js');
const MessageEmbed = Discord.MessageEmbed;
const ErrorSender = require('../error/error');

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=created_at&expansions=author_id,attachments.media_keys&user.fields=name,profile_image_url&media.fields=media_key,preview_image_url,type,url';

module.exports = {
    async initialize(client) {
        (async () => {
            console.log('Tweet fetching initializing');
            tempClient = client;
            retrieveTweetChannel();
            let currentRules;
            try {
                // Gets the complete list of rules currently applied to the stream
                currentRules = await getAllRules();
        
                // Delete all rules. Comment the line below if you want to keep your existing rules.
                await deleteAllRules(currentRules);
        
                // Add rules to the stream. Comment the line below if you don't want to add new rules.
                await setRules();
        
            } catch (e) {
                console.error(e);
                tweetChannel.send('Problem setting up Tweet fetching');
            }
        
            // Listen to the stream.
            streamConnect(0);
            console.log('Tweet fetching initialized');
        })();
    }
}

var tempClient;
var tweetChannel;  // for weather news
var tweetChannel2; // for pics
var testChannel;

// Edit rules as desired below
const rules = [{
        'value': 'from:sayahiyama_1027', // 1052079838746435584
    }, {
        'value': 'from:yuki_uchida_' // 1245974107532849157
    }, {
        'value': 'from:yui_k06'     // 1052086549951602694
    }, {
        'value': 'from:nana617_919' // 616115769
    }, {
        'value': 'from:goodudetheboy' // 3269123629
    }, {
        'value': 'from:wni_live' // 713252858913632256
    }, {
        'value': 'from:wni_jp' // 712914636203433984
    }
];

//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------

async function getAllRules() {
    const response = await needle('get', rulesURL, {
        headers: {
            "authorization": `Bearer ${TWITTER_BEARER_TOKEN}`
        }
    })
    if (response.statusCode !== 200) {
        console.log("Error:", response.statusMessage, response.statusCode)
        throw new Error(response.body);
    }
    return (response.body);
}

async function deleteAllRules(rules) {
    if (!Array.isArray(rules.data)) {
        return null;
    }
    const ids = rules.data.map(rule => rule.id);
    const data = {
        "delete": {
            "ids": ids
        }
    }

    const response = await needle('post', rulesURL, data, {
        headers: {
            "content-type": "application/json",
            "authorization": `Bearer ${TWITTER_BEARER_TOKEN}`
        }
    })

    if (response.statusCode !== 200) {
        throw new Error(response.body);
    }

    return (response.body);
}

async function setRules() {
    const data = {
        "add": rules
    }

    const response = await needle('post', rulesURL, data, {
        headers: {
            "content-type": "application/json",
            "authorization": `Bearer ${TWITTER_BEARER_TOKEN}`
        }
    })

    if (response.statusCode !== 201) {
        throw new Error(response.body);
    }

    return (response.body);
}

function streamConnect(retryAttempt) {
    const stream = needle.get(streamURL, {
        headers: {
            "User-Agent": "v2FilterStreamJS",
            "Authorization": `Bearer ${TWITTER_BEARER_TOKEN}`
        },
        timeout: 20000
    });

    stream.on('data', data => {
        try {
            const json = JSON.parse(data);
            if (json['includes'] !== undefined) {
                sendTweet(json);
            }
            // A successful connection resets retry count.
            retryAttempt = 0;
        } catch (e) {
            if (data.detail === "This stream is currently at the maximum allowed connection limit.") {
                console.log(data.detail)
            } else {
                // Keep alive signal received. Do nothing.
            }
        }
    }).on('err', error => {
        if (error.code !== 'ECONNRESET') {
            console.log(error.code);
        } else {
            // This reconnection logic will attempt to reconnect when a disconnection is detected.
            // To avoid rate limits, this logic implements exponential backoff, so the wait time
            // will increase if the client cannot reconnect to the stream. 
            setTimeout(() => {
                console.warn("A connection error occurred. Reconnecting...")
                streamConnect(++retryAttempt);
            }, 2 ** retryAttempt)
        }
    });

    return stream;
}

function sendTweet(json) {
    try {
        let mediaArr = json['includes']['media'];
        let user = json['includes']['users'][0];
        let tweet = json['data'];
        let author_id = tweet['author_id'];

        console.log(`Sending Tweet from ${ author_id }`);

        let imageUrl = undefined;
        if (mediaArr != undefined) {
            let media = mediaArr[0];
            if (media['type'] == 'photo') {
                imageUrl = media['url'];
            } else {
                imageUrl = media['preview_image_url'];
            }
        }

        let name = user['name'];
        let profile_image_url = user['profile_image_url'];
        let text = tweet['text'];
        let created_at = tweet['created_at'];

        let embed = new MessageEmbed()
            .setColor('#00acee')
            .setAuthor(name, profile_image_url)
            .setDescription(text)
            .setFooter('Twitter')
            .setTimestamp(Date.parse(created_at));
        if (imageUrl != undefined) {
            embed.setImage(imageUrl);
        }
    
        let channelToSend = (isFromWeatherNews(author_id)) ? tweetChannel : tweetChannel2;

        for (let i=0; i<=5; i++) {
            if (channelToSend == undefined) {
                console.log(`channelToSend, retrying attempt ${ i }`);
                retrieveTweetChannel();
                channelToSend = (isFromWeatherNews(author_id)) ? tweetChannel : tweetChannel2;
            }
            if (i == 5) {
                console.log("Problem sending tweet");
                console.log("Dumping json content:")
                console.log(json);
                return;
            }
            break;
        }
        channelToSend.send(embed);

    } catch(error) {
        console.log(error);
        ErrorSender.sendErrorCodeToChannel(testChannel, 4);
        testChannel.send(error.stack);
        testChannel.send(json);
    }
}

function retrieveTweetChannel() {
    tweetChannel = tempClient.channels.cache.get(DESIRED_CHANNEL_ID);
    tweetChannel2 = tempClient.channels.cache.get(DESIRED_CHANNEL_ID_2);
    testChannel = tempClient.channels.cache.get(TEST_CHANNEL_ID);

}

function isFromWeatherNews(author_id) {
    switch (author_id) {
        case "713252858913632256":
        case "712914636203433984":
        // case "3269123629":
            return true;
    }
    return false;
}
