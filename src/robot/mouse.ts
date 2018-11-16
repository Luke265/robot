import * as robotjs from 'robotjs';
import { Robot } from "./robot";
import { Mover } from "./mover";
import { Utils } from "../utils";

export type MouseButton = 'left' | 'right' | 'middle';
export type MouseAction = 'click' | 'press' | 'release';

export class Mouse {

    private static moving: Mover;

    get pos() {
        return robotjs.getMousePos();
    }

    constructor(private context: Robot) {

    }

    async mouse(button: MouseButton = 'left', action: MouseAction = 'click', delay?: number) {
        const millis = () => {
            let rnd;
            if (typeof delay === 'number') {
                return delay;
            } else {
                rnd = Utils.random(200);
                if (rnd > 198) {
                    return Utils.random(600, 300);
                } else if (rnd > 190) {
                    return Utils.random(300, 130);
                } else {
                    return Utils.random(130, 78);
                }
            }
        }
        await this.context.delay(millis());
        robotjs.setMouseDelay(0);
        if (action === 'click' || action === 'press') {
            robotjs.mouseToggle("down", button);
        }
        await this.context.delay(millis());
        if (action === 'click' || action === 'release') {
            robotjs.mouseToggle("up", button);
        }
    }

    mouseMoveSync(x, y, options) {
        if (Mouse.moving) {
            Mouse.moving.stopped = true;
        }
        const mover = Mouse.moving = new Mover(x, y, options);
        while (mover.step());
    }

    async mouseMove(x, y, options) {
        if (Mouse.moving) {
            Mouse.moving.stopped = true;
        }
        const mover = Mouse.moving = new Mover(x, y, options);
        return this.context.whileFn(() => !mover.stopped && mover.step(), 30000, 0);
    }

}
