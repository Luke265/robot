import { Mover } from "../robot/mover";
import { MessageChannel } from 'worker_threads';
import { Robot } from "../robot/robot";

let mover = null;
const { port1, port2 } = new MessageChannel();
const robot = new Robot();

async function move(x, y, options) {
    if (mover) {
        mover.stopped = true;
    }
    mover = new Mover(x, y, options);
    const result = await robot.whileFn(() => !mover.stopped && mover.step(), 30000, 0);
    port2.postMessage({
        command: 'move',
        args: [result]
    });
}

port1.on('message', (message) => {
    if (message.command === 'move') {
        move.apply(move, message.args);
    }
})