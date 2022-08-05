import type { Options } from "./mover";
import * as Path from "path";
import { Worker } from "worker_threads";
import { millis, random } from "../utils/index";
import { getMousePos, mouseToggle } from "../robotjs";

let worker: Worker | null = null;
let commandId = 0;
export type MouseButton = "left" | "right" | "middle";
export type MouseAction = "click" | "press" | "release";

export async function click(button: MouseButton = "left", action: MouseAction = "click", delay?: number) {
    const getDelay = () => {
        let rnd = 0;
        if (typeof delay === "number") {
            return delay;
        } else {
            rnd = random(200);
            if (rnd > 198) {
                return random(300, 600);
            } else if (rnd > 190) {
                return random(130, 300);
            } else {
                return random(78, 130);
            }
        }
    };
    await millis(getDelay());
    if (action === "click" || action === "press") {
        mouseToggle("down", button);
    }
    await millis(getDelay());
    if (action === "click" || action === "release") {
        mouseToggle("up", button);
    }
}

export function pos() {
    return getMousePos();
}

export function move(x: number, y: number, options?: Partial<Options & { async?: number }>) {
    return workerCommand("move", x, y, options);
}

function workerCommand(command: string, ...args: any[]): Promise<void> {
    return new Promise(async (resolve, reject) => {
        if (!worker) {
            worker = new Worker(Path.join(__dirname, "worker.js"));
            worker.once("error", () => (worker = null));
            worker.once("exit", () => (worker = null));
        }
        const id = commandId++;
        const listener = (data: any) => {
            if (data.id === id && worker) {
                worker.off("message", listener);
                worker.off("error", reject);
                worker.off("exit", resolve);
                if (data.error) {
                    reject(data.error);
                } else {
                    resolve();
                }
            }
        };
        worker.once("error", reject);
        worker.once("exit", resolve);
        worker.on("message", listener);
        worker.postMessage({
            id,
            command,
            args,
        });
    });
}
