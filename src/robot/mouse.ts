import * as robotjs from 'robotjs';
import { Robot } from "./robot";
import { Mover, Options } from "./mover";
import { Utils } from "../utils";
// import {Worker} from 'worker_threads';

export type MouseButton = 'left' | 'right' | 'middle';
export type MouseAction = 'click' | 'press' | 'release';

export class Mouse {

    public static DEBUG_MOUSE_DOWN = Symbol('mouse_down');
    private static moving: Mover;
    // private worker: Worker;

    get pos() {
        return robotjs.getMousePos();
    }

    constructor(private context: Robot) {
        // this.worker = new Worker("../thread/mouse.js");
    }

    async click(button: MouseButton = 'left', action: MouseAction = 'click', delay?: number) {
        const getDelay = () => {
            let rnd = 0;
            if (typeof delay === 'number') {
                return delay;
            } else {
                rnd = Utils.random(200);
                if (rnd > 198) {
                    return Utils.random(300, 600);
                } else if (rnd > 190) {
                    return Utils.random(130, 300);
                } else {
                    return Utils.random(78, 130);
                }
            }
        }
        await this.context.millis(getDelay());
        robotjs.setMouseDelay(0);
        if (action === 'click' || action === 'press') {
            robotjs.mouseToggle("down", button);
        }
        await this.context.millis(getDelay());
        if (action === 'click' || action === 'release') {
            robotjs.mouseToggle("up", button);
        }
    }

    moveSync(x: number, y: number, options?: Options) {
        if (Mouse.moving) {
            Mouse.moving.stopped = true;
        }
        const mover = Mouse.moving = new Mover(x, y, options);
        while (mover.step());
    }

    move(x: number, y: number, options?: Options) {
        //return this.workerCommand('move', x, y, options);
        if (Mouse.moving) {
            Mouse.moving.stopped = true;
        }
        const mover = Mouse.moving = new Mover(x, y, options);
        return this.context.whileFn(() => !mover.stopped && mover.step(), 30000, 0);
    }

    /*private workerCommand(command: string, ...args: any[]) {
        return new Promise((resolve) => {
            const id = command + '_' + Math.random();
            this.worker.postMessage({
                id,
                command,
                args
            });
            const cb = (message) => {
                if (message.id === id) {
                    resolve(message.args);
                    this.worker.off('message', cb);
                }
            };
            this.worker.on('message', cb);
        });
    }*/

}
