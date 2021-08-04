"use strict"

const { createClient } = require("oicq")
const uin = 631676243
const bot = createClient(uin)
const text = require('./text')

let isOnline = false
let TEST_GROUP_ID = 647415772
let WORK_GROUP_ID = 1104280840

function online() {
    bot.on("system", (data) => {
        console.log("system event: " + data.system_type)
    })
    bot.on("system.login.slider", () => {
        process.stdin.once("data", (input) => {
            bot.sliderLogin(input)
        })
    })
    bot.on("system.online", () => {
        console.log("上线了！")
        for (let group of bot.getGroupList().data.values()) {
            console.log("my group: " + group.group_name + "; " + group.group_id)
        }
        isOnline = true
        // share("突然出现~", false)
    })
    bot.on("system.offline", () => {
        console.log("下线了！")
        isOnline = false
        // console.log("重试上线...")
        // bot.login("23dd23b8cf68e175421e9bf7bf97315a")
    })
    bot.on("message.private", (data) => {
        console.log("msg.private: " + data.raw_message)
        // let reply = text.autoReply(data.raw_message)
        // console.log("msg.reply: " + reply)
        // if (reply) {
        //     let result = data.reply(reply)
        //     console.log("sendGroupMsg; " + result.retcode + "; " + result.status)
        // }
    })
    bot.on("message.group", (data) => {
        console.log("msg.group; id: " + data.group_id + "; msg: " + data.raw_message)
        if (data.group_id === WORK_GROUP_ID) {
            console.log("msg.group be target group")
            let reply = text.autoReply(data.raw_message)
            console.log("msg.reply: " + reply)
            let result = data.reply(reply)
            console.log("sendGroupMsg; " + result.retcode + "; " + result.status)
        }
    })

    bot.login("23dd23b8cf68e175421e9bf7bf97315a")//mm:123456
}

function botOnline() {
    return isOnline
}

function share(message, atAll) {
    console.log("share: " + message + "\nisOnline: " + isOnline)
    if (!isOnline) {
        return
    }
    if (atAll) {
        message = "@全体成员 " + message
    }
    let result = bot.sendGroupMsg(WORK_GROUP_ID, message)
    console.log("sendGroupMsg; " + result.retcode + "; " + result.status)
}

module.exports = {
    online: online,
    botOnline: botOnline,
    share: share
}

