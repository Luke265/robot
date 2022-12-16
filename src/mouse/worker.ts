import { Mover, Options } from "./mover";
import { parentPort } from "worker_threads";

let lastCommandAt = new Date();
let repeatJob: NodeJS.Timeout | null = null;
let taskId: string | number | null = null;

parentPort!.on("message", ({ id, command, args }) => {
    try {
        if (command === "move") {
            start(id, args);
        } else if (command === "stop") {
            stop();
        }
        lastCommandAt = new Date();
    } catch (e) {
        parentPort?.postMessage({ id, error: e });
    }
});

function start(id: number, args: [number, number, Options]) {
    const [x, y, options] = args;
    stop();
    taskId = id;
    const mover = new Mover(x, y, options);
    const tick = () => {
        if (taskId !== id) {
            return;
        }
        if (mover?.step()) {
            if (mover.options?.async) {
                repeatJob = setTimeout(tick, mover.options.async);
            } else {
                queueMicrotask(tick);
            }
        } else {
            stop();
        }
    };
    tick();
}

function stop() {
    if (repeatJob) {
        clearTimeout(repeatJob);
    }
    if (taskId !== null) {
        parentPort?.postMessage({ id: taskId });
    }
    repeatJob = null;
    taskId = null;
}

const idleJob = setInterval(() => {
    if (Date.now() - lastCommandAt.getTime() >= 120_000) {
        clearInterval(idleJob);
    }
}, 120_000);
