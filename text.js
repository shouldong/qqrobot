"use strict";
var tell_joke = require('./joke');

function process_text(content) {
    if (content.search('笑话') != -1) {
        return tell_joke();
    }
    return "hello, i'm a robot.";
}

export default process_text;