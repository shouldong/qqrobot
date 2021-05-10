"use strict";
const { createClient } = require("oicq");
const uin = 631676243;
const bot = createClient(uin)

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

    var result = bot.sendGroupMsg("647415772", "hello???");
    console.log(result.retcode + " " + result.status);
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
    console.log("msg.group: " + data.raw_message);
    data.reply("hello, i'm a robot.");
})

// bot.login("23dd23b8cf68e175421e9bf7bf97315a");
setInterval(() => {
    console.log(new Date());
}, 1000 * 10);