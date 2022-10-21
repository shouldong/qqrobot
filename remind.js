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
    const options = {
        hostname: 'api.live.bilibili.com',
        path: '/xlive/web-room/v1/index/getDanmuMedalAnchorInfo?ruid=8060090',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
            'cookie': 'LIVE_BUVID=AUTO6016214944556328; buvid3=9E84F568-64F3-93BC-CF53-8625119E130239113infoc; rpdid=|(umk)lkulJ)0J\'uYku)JuJR); video_page_version=v_old_home; CURRENT_BLACKGAP=0; blackside_state=0; i-wanna-go-back=-1; CURRENT_QUALITY=120; nostalgia_conf=-1; buvid_fp=9E84F568-64F3-93BC-CF53-8625119E130239113infoc; buvid_fp_plain=undefined; SESSDATA=538e34b8%2C1670414421%2Cf3b01%2A61; bili_jct=3ae52c15d94d4498efe6a2b43c5dcc4d; DedeUserID=2952576; DedeUserID__ckMd5=21cf6dff04678c55; sid=advtryls; b_ut=5; hit-dyn-v2=1; fingerprint3=9dab6d922722aabfbf89b55ae2b5695d; fingerprint=03e151e4a0d77c8712a7c1c147c3db65; b_nut=100; CURRENT_FNVAL=4048; bp_video_offset_2952576=706096201329541100'
        }
    }
    https.get(options, (resp) => {
        let data = ''
        resp.on('data', (chunk) => {
            data += chunk
        })
        resp.on('end', () => {
            try {
                let json = JSON.parse(data)
                if (json.data.live_stream_status === 1) {
                    console.log("checkLive: " + json)
                    stopLiveJob()
                    proxy.share("开播啦", "https://live.bilibili.com/915663", true)
                } else {
                    console.log("还在拔腿毛，请稍等~")
                }
            } catch (err) {
                console.error("checkLive error: " + err.stack)
            }
        })
    }).on("error", (err) => {
        console.error("checkLive error: " + err.message)
    })
}

function checkUpdate() {
    const options = {
        hostname: 'api.bilibili.com',
        path: '/x/space/arc/search?mid=8060090&ps=30&tid=0&pn=1&keyword=&order=pubdate&jsonp=jsonp',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
            'cookie': 'LIVE_BUVID=AUTO6016214944556328; buvid3=9E84F568-64F3-93BC-CF53-8625119E130239113infoc; rpdid=|(umk)lkulJ)0J\'uYku)JuJR); video_page_version=v_old_home; CURRENT_BLACKGAP=0; blackside_state=0; i-wanna-go-back=-1; CURRENT_QUALITY=120; nostalgia_conf=-1; buvid_fp=9E84F568-64F3-93BC-CF53-8625119E130239113infoc; buvid_fp_plain=undefined; SESSDATA=538e34b8%2C1670414421%2Cf3b01%2A61; bili_jct=3ae52c15d94d4498efe6a2b43c5dcc4d; DedeUserID=2952576; DedeUserID__ckMd5=21cf6dff04678c55; sid=advtryls; b_ut=5; hit-dyn-v2=1; fingerprint3=9dab6d922722aabfbf89b55ae2b5695d; fingerprint=03e151e4a0d77c8712a7c1c147c3db65; b_nut=100; CURRENT_FNVAL=4048; bp_video_offset_2952576=706096201329541100'
        }
    }
    https.get(options, (resp) => {
        let data = ''
        resp.on('data', (chunk) => {
            data += chunk
        })
        resp.on('end', () => {
            try {
                let json = JSON.parse(data)
                let code = json.code;
                if (code !== 0)
                {
                    console.log("checkUpdate Error return: " + data)
                    return
                }

                let vlist = json.data.list.vlist
                let bvid = vlist[0].bvid
                console.log("checkUpdate: " + bvid)
                if (lastUpdateVid !== bvid) {
                    lastUpdateVid = bvid
                    fs.writeFile('./data/lastVid', bvid, function (err) {
                        if (err) {
                            console.error("writeFile error: " + err)
                        } else {
                            console.log("writeFile success")
                        }
                    })
                    proxy.share("更新啦！求三连", "https://www.bilibili.com/video/" + bvid, true)
                } else {
                    console.log("up主还未更新~")
                }
            } catch (err) {
                console.error("checkUpdate error: " + err.stack)
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
            try {
                let json = JSON.parse(data)
                let archives = json.data.list.archives
                let pubdate = archives[0].pubdate
                let ctime = archives[0].ctime
                let bvid = archives[0].bvid
                let title = archives[0].title
                let todayStr = new Date().toLocaleDateString();
                let pubdateStr = new Date(pubdate * 1000).toLocaleDateString();
                let ctimeStr = new Date(ctime * 1000).toLocaleDateString();
                console.log("checkRecord: " + pubdateStr + ";" + ctimeStr + "; " + todayStr)
                if (todayStr === ctimeStr) {
                    proxy.share(title, "https://www.bilibili.com/video/" + bvid, false)
                } else {
                    console.log("up主昨天休息~")
                }
            } catch (err) {
                console.error("checkRecord error: " + err.stack)
            }
        })
    }).on("error", (err) => {
        console.error("checkRecord error: " + err.message)
    })
}

function scheduleLiveJob() {
    jobLiveCancel = false
    schedule.scheduleJob(JOB_LIVE, '0/30 * 19-22 * * *', ()=>{
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
    schedule.scheduleJob(JOB_VIDEO, '0 0 10 * * *', ()=>{
        console.log("checkRecord: " + new Date())
        checkRecord()
    })
}

function stopRecordJob() {
    jobRecordCancel = true
    schedule.cancelJob(JOB_RECORD)
}

let USER_AGENTS = []
function loadUAConfig() {
    let files = fs.readdirSync('./uaconfig')
    for (let i = 0; i < 12; i++)
    {
        let data = fs.readFileSync('./uaconfig/' + files[i])
        let config = JSON.parse(data)
        for (let j = 0; j < 250; j++)
        {
            if (j === 0)
            {
                USER_AGENTS[i] = [];
            }
            USER_AGENTS[i][j] = config[j];
        }
    }
}

function start() {
    if (fs.existsSync('./data/lastVid')) {
        let buffer = fs.readFileSync('./data/lastVid')
        lastUpdateVid = buffer.toString()
    }
    console.log("lastUpdateVid: " + lastUpdateVid)

    scheduleLiveJob()
    scheduleVideoJob()
    scheduleRecordJob()

    schedule.scheduleJob("job_live_reset", '30 7 2 * * *', ()=>{
        console.log("job_live_reset: " + jobLiveCancel)
        if (jobLiveCancel) {
            scheduleLiveJob()
        }
    })
}

module.exports = {
    start: start
}