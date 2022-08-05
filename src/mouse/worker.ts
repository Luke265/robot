import { Mover } from "./mover";
import { parentPort } from "worker_threads";

let lastCommandAt = new Date();

parentPort!.on("message", ({ id, command, args }) => {
    try {
        if (command === "move") {
            const [x, y, options] = args;
            const mover = new Mover(x, y, options);
            const repeat = () => {
                if (mover.step()) {
                    if (options?.async) {
                        setTimeout(repeat, options.async);
                    } else {
                        repeat();
                    }
                } else {
                    parentPort?.postMessage({ id });
                }
            };
            repeat();
        }
        lastCommandAt = new Date();
    } catch (e) {
        parentPort?.postMessage({ id, error: e });
    }
});

const idleJob = setInterval(() => {
    if (Date.now() - lastCommandAt.getTime() >= 120_000) {
        clearInterval(idleJob);
    }
}, 120_000);
