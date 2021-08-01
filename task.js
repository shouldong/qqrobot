"use strict"

const https = require("https")
const schedule = require('node-schedule')
const proxy = require("./proxy")
const fs = require("fs")

let URL_LIVE = "https://api.live.bilibili.com/xlive/web-room/v1/index/getDanmuMedalAnchorInfo?ruid=8060090"
let JOB_LIVE = "job_live"
let jobLiveCancel = false

let URL_VIDEO = "https://api.bilibili.com/x/space/arc/search?mid=8060090&ps=30&tid=0&pn=1&keyword=&order=pubdate&jsonp=jsonp"
let JOB_VIDEO = "job_video"
let jobVideoCancel = false
let lastUpdateVid = ""

let URL_RECORD = "https://api.bilibili.com/x/space/channel/video?mid=8060090&cid=31244&pn=1&ps=30&order=0&ctype=1&jsonp=jsonp"
let JOB_RECORD = "job_record"
let jobRecordCancel = false
let yesterdayRecord = ""

function checkLive() {
    https.get(URL_LIVE, (resp) => {
        let data = ''
        resp.on('data', (chunk) => {
            data += chunk
        })
        resp.on('end', () => {
            let json = JSON.parse(data)
            if (json.data.live_stream_status === 1) {
                console.log("checkLive: " + json)
                stopLiveJob()
                proxy.share("开播啦\nhttps://live.bilibili.com/915663", true)
            } else {
                console.log("还在拔腿毛，请稍等~")
            }
        })
    }).on("error", (err) => {
        console.error("checkLive error: " + err.message)
    })
}

function checkUpdate() {
    https.get(URL_VIDEO, (resp) => {
        let data = ''
        resp.on('data', (chunk) => {
            data += chunk
        })
        resp.on('end', () => {
            let json = JSON.parse(data)
            let vlist = json.data.list.vlist
            let bvid = vlist[0].bvid
            console.log("checkUpdate: " + vlist[0])
            if (lastUpdateVid !== bvid) {
                lastUpdateVid = bvid
                fs.writeFile('./data/lastVid', bvid, function (err) {
                    if (err) {
                        console.error("writeFile error: " + err)
                    } else {
                        console.log("writeFile success")
                    }
                })
                proxy.share("求三连[爱心]\nhttps://www.bilibili.com/video/" + bvid, true)
            } else {
                console.log("up主还未更新~")
            }
        })
    }).on("error", (err) => {
        console.error("checkUpdate error: " + err.message)
    })
}

function checkRecord() {
    https.get(URL_RECORD, (resp) => {
        let data = ''
        resp.on('data', (chunk) => {
            data += chunk
        })
        resp.on('end', () => {
            let json = JSON.parse(data)
            let archives = json.data.list.archives
            let pubdate = archives[0].pubdate
            let ctime = archives[0].ctime
            let bvid = archives[0].bvid
            let title = archives[0].title
            console.log("checkRecord: " + pubdate + ";" + ctime)
            if (true) {
                proxy.share(title + "\nhttps://www.bilibili.com/video/" + bvid, true)
            } else {
                console.log("up主昨天休息~")
            }
        })
    }).on("error", (err) => {
        console.error("checkRecord error: " + err.message)
    })
}

function scheduleLiveJob() {
    jobLiveCancel = false
    schedule.scheduleJob(JOB_LIVE, '0/5 * 20-22 * * *', ()=>{
        console.log("checkLive: " + new Date())
        checkLive()
    })
}

function stopLiveJob() {
    jobLiveCancel = true
    schedule.cancelJob(JOB_LIVE)
}

function scheduleVideoJob() {
    jobVideoCancel = false
    schedule.scheduleJob(JOB_VIDEO, '0 0/1 0,1,2,9-23 * * *', ()=>{
        console.log("checkUpdate: " + new Date())
        checkUpdate()
    })
}

function stopVideoJob() {
    jobVideoCancel = true
    schedule.cancelJob(JOB_VIDEO)
}

function scheduleRecordJob() {
    jobRecordCancel = false
    schedule.scheduleJob(JOB_VIDEO, '0 0/1 * * * *', ()=>{
        console.log("checkRecord: " + new Date())
        checkRecord()
    })
}

function stopRecordJob() {
    jobRecordCancel = true
    schedule.cancelJob(JOB_RECORD)
}

function start() {
    scheduleLiveJob()
    scheduleVideoJob()
    // scheduleRecordJob()

    schedule.scheduleJob("job_live_reset", '30 7 2 * * *', ()=>{
        console.log("job_live_reset: " + jobLiveCancel)
        if (jobLiveCancel) {
            scheduleLiveJob()
        }
    })

    fs.readFile('./data/lastVid', function (err, data) {
        if (err) {
            console.error("readFile error: " + err);
        } else {
            console.log("readFile lastVid: " + data);
            lastUpdateVid = data;
        }
    })
}

module.exports = {
    start: start
}