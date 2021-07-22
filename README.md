# **SayacchiBot** #

[![build status](https://github.com/goodudetheboy/SayacchiBot/actions/workflows/node.js.yml/badge.svg)](https://github.com/goodudetheboy/SayacchiBot/actions)
[![issues](https://img.shields.io/github/issues/goodudetheboy/SayacchiBot)](https://github.com/goodudetheboy/SayacchiBot/issues)
[![forks](https://img.shields.io/github/forks/goodudetheboy/SayacchiBot)](https://github.com/goodudetheboy/SayacchiBot/network/members)
[![stars](https://img.shields.io/github/stars/goodudetheboy/SayacchiBot)](https://github.com/goodudetheboy/SayacchiBot/stargazers)
[![license](https://img.shields.io/github/license/goodudetheboy/SayacchiBot)](https://github.com/goodudetheboy/SayacchiBot/blob/main/LICENSE)

A cool Discord bot I wrote in appreciation of my favorite WeatherNews Caster: Hiyama Saya, AKA Sayacchi!

## Features ##

- Get the entire WNI Timetable with simply `!timetable`, `!timetable saya` if you want to know when Sayacchi is live!
- Notifications whenever Sayacchi is live (channel must be specified in `.env`, `DESIRED_CHANNEL_ID` section)
- Realtime Tweet fetching from Sayacchi Twitter account
- Cool games you can play to earn special prizes!
- Get beautiful images of Sayacchi with `!saya`, powered by `puppeteer`!

## Full Command List ##

```
!saya
Get random image of Sayacchi from Google Images.

!timetable
Get Weather News Channel timetable from https://weathernews.jp/s/solive24/timetable.html.
    |   refresh: to refresh timetable,
    |   saya: to get my live time today,
    |   today: to get my timetable for today,
    |   tomorrow: to get my timetable for tomorrow,
    |   live: to check if I'm live now.

!help
List all of my commands or info about a specific command.

!reload
Reloads a command (for testing use only)

!rolldice
Play a Cho-han, a.k.a. odd-or-even game with Sayacchi! Guess the correct odd or even of the Lucky Number (ラッキーナンバー）, which is the sum of 2 dice, and win a special prize!
    |   leaderboard: to see the leaderboard,
    |   streak: to see your current streak,
    |   highscore: to see your highscore
```

## Installation ##

### Prerequisite ###

- **Discord Bot Token**
  - Obviously if you want to create a bot.
- **MongoDB SRV**
  - Create a MongoDB Atlast cluster database and generate a SRV. Watch this [tutorial](https://www.youtube.com/watch?v=8no3SktqagY) for more information on how to do this.
- **Twitter Bearer Token**
  - If you haven't already, apply for a Twitter Devevloper Account, create a new App in there, and retrieve the Twitter Bearer Token for the app.
- **node.js**

### Starting the Project #

1. Install node
2. Run `npm install` in this project directory to install dependencies. This will take a while since I'm using puppeteer, which downloads the whole Chromium package
3. Go to `./config.json` and input the browser path you want to use for images scraping for 
4. Create a `.env` file in the project folder directory, and fill in the following value:

    ```
    TEST_CHANNEL_ID= [test channel useful for debugging]
    DESIRED_CHANNEL_ID= [channel that will be used by SayacchiBot to stream realtime information, like Tweet]
    MONGODB_SRV= [your MongoDB SRV key]
    TWITTER_BEARER_TOKEN= [your Twitter Bearer Token]
    DISCORD_TOKEN= [your discord bot token]
    ```

5. Run `npm start`

## Hosting ##

Currently I'm hosting on repl.it, which works fine for now, but if you want to use it, you will need to create a Bash project instead of a Node.js project to run this project.
I haven't explored other options yet, but to use my project in Heroku, you may have to follow further instruction provided in the npm's page of [`images-scraper`](https://www.npmjs.com/package/images-scraper).

You will also need database for this project to run. You can follow this [Youtube video](https://www.youtube.com/watch?v=8no3SktqagY) to get a sense on how to set up a MongoDB server. You can also create your own database whereever, if you know what you're doing. Note that if you are hosting, you should `Allow access from anywhere` in MongoDB Atlas, if you decided to host it on repl.it (since repl.it change IP address every time and you won't know what IP address to whitelist in your Atlas).

## Bug Reporting ##

Raise an issue and I'll look into it ASAP, or maybe never, idk I'm a busy man.
