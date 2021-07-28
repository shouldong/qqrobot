"use strict";

const { createClient, segment} = require("oicq");
const uin = 631676243;
const bot = createClient(uin)

let TEST_GROUP_ID = "647415772";

function online() {
    bot.on("system", (data) => {
        console.log("system event: " + data.system_type);
    });
    bot.on("system.login.slider", () => {
        process.stdin.once("data", (input) => {
            bot.sliderLogin(input);
        });
    });
    bot.on("system.online", () => {
        console.log("上线了！");
        console.log(bot.getGroupList().data);
        share("突然出现~", false)
    });
    bot.on("system.offline", () => {
        console.log("下线了！");
        // console.log("重试上线...");
        // bot.login("23dd23b8cf68e175421e9bf7bf97315a");
    });
    bot.on("message.private", (data) => {
        console.log("msg.private: " + data.raw_message);
        data.reply("hello, i'm a robot.");
    })
    bot.on("message.group", (data) => {
        console.log("msg.group; id: " + data.group_id + "; msg: " + data.raw_message);
        data.reply("hello, i'm a robot.");
    })

    bot.login("23dd23b8cf68e175421e9bf7bf97315a")//mm:123456
}

function share(message, atAll) {
    console.log(message)
    if (atAll) {
        message = "@全体成员 " + message
    }
    let result = bot.sendGroupMsg(TEST_GROUP_ID, message)
    console.log("sendGroupMsg; " + result.retcode + "; " + result.status)
}

module.exports = {
    online: online,
    share: share
}

