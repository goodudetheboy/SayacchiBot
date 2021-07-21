// original code taken from https://github.com/twitterdev/Twitter-API-v2-sample-code/tree/main/Filtered-Stream
// LICENSE: Apache-2.0 License

const needle = require('needle');
const { TWITTER_BEARER_TOKEN, TEST_CHANNEL_ID } = require('../config.json');
const DESIRED_CHANNEL_ID = '839154353046290513';

const Discord = require('discord.js');
const MessageEmbed = Discord.MessageEmbed;
const Error = require('../error/error');

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules';
const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=created_at&expansions=author_id,attachments.media_keys&user.fields=name,profile_image_url&media.fields=media_key,preview_image_url,type,url';

module.exports = {
    async initialize(client) {
        (async () => {
            console.log('Tweet fetching initializing');
            tweetChannel = client.channels.cache.get(DESIRED_CHANNEL_ID);
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

var tweetChannel;

// Edit rules as desired below
const rules = [{
        'value': 'from:sayahiyama_1027',
    }, {
        'value': 'from:1417353851020083202'
    }, {
        'value': 'from:wni_live'
    }, {
        'value': 'from:yuki_uchida_'
    }, {
        'value': 'from:wni_jp'
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
            sendTweet(json);
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
        let media = json['includes']['media'][0];
        let user = json['includes']['users'][0];
        let tweet = json['data'];
    
        let imageUrl = undefined;
        if (json['includes']['media'][0]['type'] == 'photo') {
            imageUrl = media['url'];
        } else {
            imageUrl = media['preview_image_url'];
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
    
        tweetChannel.send(embed);
    } catch(error) {
        console.log(error);
    }
}
