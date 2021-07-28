"use strict";

const https = require("https")
const schedule = require('node-schedule');
const proxy = require("./proxy")

let URL_LIVE = "https://api.live.bilibili.com/xlive/web-room/v1/index/getDanmuMedalAnchorInfo?ruid=8060090";
let JOB_LIVE = "job_live";
let jobLiveCancel = false;

let URL_VIDEO = "";
let JOB_VIDEO = "job_video";
let jobVideoCancel = false;

let URL_RECORD = "";
let JOB_RECORD = "job_record";
let jobRecordCancel = false;

function checkLive() {
    https.get(URL_LIVE, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            var json = JSON.parse(data);
            if (json.data.live_stream_status === 1) {
                stopLiveJob()
                proxy.share("开播啦")
            } else {
                console.log("还在拔腿毛，请稍等")
            }
        });
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

function checkUpdate() {

}

function checkRecord() {

}

function scheduleLiveJob() {
    jobLiveCancel = false;
    schedule.scheduleJob(JOB_LIVE, '0/5 * * * * *', ()=>{
        console.log("checkLive: " + new Date());
        checkLive();
    });
}

function stopLiveJob() {
    jobLiveCancel = true;
    schedule.cancelJob(JOB_LIVE);
}

function scheduleVideoJob() {
    jobVideoCancel = false;
    schedule.scheduleJob(JOB_VIDEO, '0 0/1 * * * *', ()=>{
        console.log("checkUpdate: " + new Date());
    })
}

function stopVideoJob() {
    jobVideoCancel = true;
    schedule.cancelJob(JOB_VIDEO);
}

function scheduleRecordJob() {
    jobRecordCancel = false;
    schedule.scheduleJob(JOB_VIDEO, '0 0/1 * * * *', ()=>{
        console.log("checkRecord: " + new Date());
    })
}

function stopRecordJob() {
    jobRecordCancel = true;
    schedule.cancelJob(JOB_RECORD);
}

function start() {
    scheduleLiveJob();
    // scheduleVideoJob();
    // scheduleRecordJob();

    // schedule.scheduleJob("job_live_reset", '0/5 * * * * *', ()=>{
    //     console.log("checkLive: " + new Date());
    // });
}

module.exports = {
    start: start
}