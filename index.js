"use strict";
const rp = require('request-promise');
const cheerio = require('cheerio');
const Parser = require('rss-parser');
const dayjs = require('dayjs');
const _ = require('lodash');
const del = require('del');
const log = require('./utils/log');
const bot = require('./utils/bot');
const credentials = require('./credentials');

let bots=credentials.bots;
bots=bots.map(botc=>{botc.bot=bot(botc); botc.alive=false; botc.message=""; return botc});

setInterval(async function () {
    let botsToSend=[];
    let botsCanSend=[];
    for(let botc of bots){
        let oldAlive=botc.alive;
        let newStat={};
        try {
            newStat=await botc.bot("get_status");
        }catch(e){
            newStat.retcode=e.code;
        }
        newStat.retcode=newStat.retcode||0;
        if(!newStat) {
            botc.alive = false;
            botc.message="调用返回为空"
        }else
        if(newStat.retcode!=0) {
            botc.alive = false;
            botc.message="调用返回状态码为"+newStat.retcode;
        }else
        if(!newStat.good) {
            botc.alive = false;
            botc.message="返回NotGood，可能已掉线";
        }else {
            botc.alive=true;
            botc.message="正常"
        }
        if(oldAlive!=botc.alive)botsToSend.push(botc);
        if(botc.alive)botsCanSend.push(botc);
        log(botc.name+" - "+botc.message);
    }
    if(botsToSend.length>0) {
        const botTosend = botsCanSend[Math.floor(Math.random() * botsCanSend.length)];
        const message=botsToSend.map(botc => (botc.name + "状态变更为" + botc.message)).join("\n");
        botTosend.bot('send_group_msg', {
            group_id: botTosend.sendGroup,
            message: message+credentials.suffix,
        });
        log(message);
    }else log("无事发生");
},60000);