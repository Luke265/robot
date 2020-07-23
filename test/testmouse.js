const {
    Robot
} = require('../lib/robot/robot');
const robot = new Robot();

setInterval(() => {
    console.log(robot.mouse.pos);
}, 1000);