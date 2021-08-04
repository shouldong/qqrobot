"use strict"

function autoReply(content) {
    console.log("autoReply: " + content)
    if (isBeAt(content)) {
        console.log("autoReply be at")
        let replay = dispatchContent(content)
        if (replay) {
            return replay
        } else {
            return "你講咩嘢？I'm just a robot."
        }
    }
    return null
}

function isBeAt(content) {
    return content.search('CQ:at,qq=631676243,text=@我是机器瓜') !== -1;
}


function dispatchContent(content) {
    console.log("dispatchContent: " + content)
    if (content.search('笑话') !== -1 || content === '笑话') {
        console.log("dispatchContent tellJoke")
        return tellJoke()
    }
    return null
}

function tellJoke() {
    return JOKE_ARR[Math.floor(Math.random() * JOKE_ARR.length)]
}

let JOKE_ARR = [
    "有把游戏，关羽狂送人头。\n队友打字问：关羽可以猥琐一点吗？\n关羽沉默一会，公屏打字问：对面的咬金弟弟一起睡觉吗嘿嘿嘿。",
    "法国小哥最近在跟我学中文。\n有天我和他聊天时发了句呵呵，23333，他问我什么意思，我说就是夸你超好笑的意思。\n今天和他一起见中国朋友，朋友说完话后，法国小哥口齿清晰又标准的发出一句\"呵呵，两万三千三百三十三。\"全场死一般沉寂。"]

module.exports = {
    autoReply: autoReply
}