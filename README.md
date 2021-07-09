# **SayacchiBot** #

[![build status](https://github.com/goodudetheboy/SayacchiBot/actions/workflows/node.js.yml/badge.svg)](https://github.com/goodudetheboy/SayacchiBot/actions)
[![issues](https://img.shields.io/github/issues/goodudetheboy/SayacchiBot)](https://github.com/goodudetheboy/SayacchiBot/issues)
[![forks](https://img.shields.io/github/forks/goodudetheboy/SayacchiBot)](https://github.com/goodudetheboy/SayacchiBot/network/members)
[![stars](https://img.shields.io/github/stars/goodudetheboy/SayacchiBot)](https://github.com/goodudetheboy/SayacchiBot/stargazers)
[![license](https://img.shields.io/github/license/goodudetheboy/SayacchiBot)](https://github.com/goodudetheboy/SayacchiBot/blob/main/LICENSE)

A cool Discord bot I wrote in appreciation of my favorite WeatherNews Caster: Hiyama Saya, AKA Sayacchi!

## Features ##

Aside the command line listed above, SayacchiBot also automatically detects whenever Sayacchi is live, and send appropriate message to your desired channel. To configure what channel where you want to receive the notification, go to `./interval.js`, and copy-paste your desired channel id in the `DESIRED_CHANNEL_ID` const. There's no error checking for this yet, so you HAVE to put something in there, or else it won't work lol.

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
```

## Installation ##

1. Install node
2. Run `npm install` in this project directory to install dependencies. This will take a while since I'm using puppeteer, which downloads the whole Chromium package
3. Go to ./config.json and put in your Discord token ID and the browser path that your environment will be using (`puppeteer` will be using this). I'll add support for Chromium dependency later.
4. Run `npm start`

## Hosting ##

Currently I'm hosting on repl.it, which works fine for now, but if you want to use it, you will need to create a Bash project instead of a Node.js project to run this project.
I haven't explored other options yet, but to use my project in Heroku, you may have to follow further instruction provided in the npm's page of [`images-scraper`](https://www.npmjs.com/package/images-scraper). 


## Bug Reporting ##

Raise an issue and I'll look into it ASAP, or maybe never, idk I'm a busy man.