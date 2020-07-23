const {
    Robot
} = require('../lib/robot/robot');
const robot = new Robot();

let count = 0;
let start = Date.now();
while (true) {
    robot.screen.refresh();
    count++;
    if (Date.now() - start >= 1000) {
        console.log('FPS:', count);
        count = 0
        start = Date.now();
    }
}