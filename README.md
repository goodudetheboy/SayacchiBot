# **SayacchiBot** #
A cool Discord bot I wrote in appreciation of my favorite WeatherNews Caster: Hiyama Saya, AKA Sayacchi!

---

### Features ###
TBA

---

### Full Command List ###
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
```

---

### Installation ###
1. Install node
2. Run `npm install` in this project directory to install dependencies. This will take a while since I'm using puppeteer, which downloads the whole Chromium package
3. Go to ./config.json and put in your Discord token ID and the browser path that your environment will be using (`puppeteer` will be using this). I'll add support for Chromium dependency later.
3. Run `npm start`

---

### Hosting ###
Currently I'm hosting on repl.it, which works fine for now, but if you want to use it, you will need to create a Bash project instead of a Node.js project to run this project.
I haven't explored other options yet, but to use my project in Heroku, you may have to follow further instruction provided in the npm's page of `images-scraper`, which is here: https://www.npmjs.com/package/images-scraper

---

### Bug Reporting ###
Raise an issue and I'll look into it ASAP, or maybe never, idk I'm a busy man.