"use strict"

const { createClient, segment} = require("oicq")
const uin = 631676243
const qqBot = createClient(uin)
const text = require('./chat')

let isOnline = false
let TEST_GROUP_ID = 647415772
let WORK_GROUP_ID = 1104280840
let MYSELF_ID = 243496254

let FACE_ID_HEART = 66;
let FACE_ID_FUNNY = 178;

function online() {
    qqBot.on("system", (data) => {
        console.log("system event: " + data.system_type)
    })
    qqBot.on("system.login.slider", () => {
        process.stdin.once("data", (input) => {
            qqBot.sliderLogin(input)
        })
    })
    qqBot.on("system.online", () => {
        console.log("上线了！")
        for (let group of qqBot.getGroupList().data.values()) {
            console.log("my group: " + group.group_name + "; " + group.group_id)
        }
        isOnline = true
        // share("突然出现~", false)
    })
    qqBot.on("system.offline", () => {
        console.log("下线了！")
        isOnline = false
        // console.log("重试上线...")
        // qqBot.login("23dd23b8cf68e175421e9bf7bf97315a")
    })
    qqBot.on("message.private", (data) => {
        console.log("msg.private: " + data.raw_message)
        // let reply = text.autoReply(data.raw_message)
        // console.log("msg.reply: " + reply)
        // if (reply) {
        //     let result = data.reply(reply)
        //     console.log("sendGroupMsg; " + result.retcode + "; " + result.status)
        // }
    })
    qqBot.on("message.group", (data) => {
        console.log("msg.group; gid: " + data.group_id + "; msg: " + data.raw_message + "; " + data.message_id)
        if (data.group_id === WORK_GROUP_ID) {
            console.log("msg.group be target group")
            let reply = text.autoReply(data.raw_message)
            console.log("msg.reply: " + reply)
            if (reply != null) {
                // segment.reply(data.message_id), reply
                data.reply(segment.text(reply)).then(r => console.log("result: " + r.retcode + "; " + r.status))
            }
        }
    })

    qqBot.login("23dd23b8cf68e175421e9bf7bf97315a")//mm:123456
}

function qqOnline() {
    return isOnline
}

function share(message, url, atAll) {
    console.log("share: " + message + "\nisOnline: " + isOnline)
    if (!isOnline) {
        return
    }
    if (atAll) {
        qqBot.sendGroupMsg(WORK_GROUP_ID, /*segment.at("all"),*/ segment.text(message + "\n" + url))
            .then(r => console.log("result: " + r.retcode + "; " + r.status))
        // qqBot.sendGroupMsg(WORK_GROUP_ID, segment.share(url, message))
        // .then(r => console.log("result: " + r.retcode + "; " + r.status));
    } else {
        // qqBot.sendPrivateMsg(MYSELF_ID, message + "\n" + url)
        //     .then(r => console.log("result: " + r.retcode + "; " + r.status))
    }
}

module.exports = {
    online: online,
    qqOnline: qqOnline,
    share: share
}

