import * as cv from 'opencv4nodejs';
import * as ioHook from 'iohook';
import { getClip, setClip, getDesktopResolution, Capture } from "./robot";
import * as robotjs from 'robotjs';
import { Utils } from './utils';
import { Mover } from './mover';
import { Finder } from './finder';
import { MatchOptions } from './match-options';
import { MultiMatchOptions } from './multi-match-options';
import { Result } from './result';

export type Events = 'keydown' | 'keyup' | 'mouseclick' | 'mousedown' | 'mouseup' | 'mousemove' | 'mousedrag' | 'mousewheel';
export type Modifier = 'alt' | 'command' | 'control' | 'shift';
export type MouseButton = 'left' | 'right' | 'middle';
export type MouseAction = 'click' | 'press' | 'release';
export interface IOHookEvent {
    type: string,
    shiftKey?: boolean,
    altKey?: boolean,
    ctrlKey?: boolean,
    metaKey?: boolean,
    keychar?: number,
    keycode?: number,
    rawcode?: number,
    button?: number,
    clicks?: number,
    x?: number,
    y?: number,
}
export class Context {

    private static ioHook = false;

    get clipboard() {
        return getClip();
    }

    set clipboard(input: string) {
        setClip(input);
    }

    keyboard = new Keyboard();
    mouse = new Mouse();
    screen = new Vision();

    static on(evt: Events, cb: (evt: IOHookEvent) => void) {
        if (!Context.ioHook) {
            Context.ioHook = true;
            ioHook.start(false);
        }
        ioHook.on(evt, cb);
    }

    static off(evt: Events, cb: (evt: IOHookEvent) => void) {
        if (Context.ioHook) {
            ioHook.off(evt, cb);
        }
    }


    static repeat(fn: () => any, interval: number = 0) {
        return new Promise((resolve) => {
            let result;
            const promiseTick = () => {
                if (result && result.then) {
                    return result.then(promiseBind);
                }
                result = fn();
                if (result === false) {
                    return resolve();
                }
                return fna();
            };
            const fna = () => setTimeout(promiseTick, interval);
            const promiseBind = (r) => {
                result = r;
                fna();
            };
            promiseTick();
        });
    }

    static repeatSync(fn: () => any, interval?: number) {
        if (interval > 0) {
            const normalTick = () => fn() !== false && setTimeout(normalTick, interval);
            return normalTick();
        }
        const normalTick = () => fn() !== false && normalBind();
        const normalBind = setTimeout.bind(global, normalTick);
        const result = fn();
        if (result !== false) {
            normalBind();
        }
    }

    static async until(fn: () => any, timeout: number = 5000, delay: number = 100) {
        let result;
        let started = Date.now();
        while (await fn() === undefined) {
            if (Date.now() - started > timeout) {
                return null;
            }
            if (delay > 0) {
                await Context.delay(delay);
            }
        }
        return result;
    }

    static delay(time) {
        return new Promise((resolve) => {
            const end = Date.now() + time;
            const timer = setInterval(() => {
                if (Date.now() > end) {
                    clearInterval(timer);
                    resolve();
                    return;
                }
                cv.waitKey(1);
            }, 1);
        });
    }

}

export class Keyboard {

    async type(str: string) {
        const millis = () => {
            const random = Utils.random(100);
            if (random > 97) {
                return Utils.random(232, 150)
            } else if (random > 80) {
                return Utils.random(140, 31);
            } else if (random > 50) {
                Utils.random(40, 31)
            }
            return Utils.random(56, 21);
        }
        for (let c of str) {
            robotjs.keyToggle(c, 'down');
            await Context.delay(millis());
            robotjs.keyToggle(c, 'up');
            await Context.delay(millis());
        }
    }

    async typeRaw(str: string, cpm = 420) {
        robotjs.typeStringDelayed(str, cpm);
    }

    async keyTap(key, mod: Modifier) {
        await this.keyToggle(key, true, mod);
        await this.keyToggle(key, false, mod);
    };

    async keyToggle(key, down, mod: Modifier) {
        await Context.delay(Utils.random(110, 60));
        robotjs.setKeyboardDelay(0);
        if (mod === undefined) {
            robotjs.keyToggle(key, down ? 'down' : 'up');
        } else {
            robotjs.keyToggle(key, down ? 'down' : 'up', mod);
        }
    }

}

export class Mouse {

    private static moving: Mover;

    get pos() {
        return robotjs.getMousePos();
    }

    mouse(button: MouseButton = 'left', action: MouseAction = 'click', delay?: number) {
        let rnd;
        if (typeof delay === 'number') {
            rnd = delay;
        } else {
            rnd = Utils.random(200);
            if (rnd > 198) {
                rnd = Utils.random(600, 300);
            } else if (rnd > 190) {
                rnd = Utils.random(300, 130);
            } else {
                rnd = Utils.random(130, 78);
            }
        }
        robotjs.setMouseDelay(rnd);
        if (action === 'click' || action === 'press') {
            robotjs.mouseToggle("down", button);
        }
        if (action === 'click' || action === 'release') {
            robotjs.mouseToggle("up", button);
        }
        robotjs.setMouseDelay(20);
    }

    mouseMoveSync(x, y, options) {
        const mover = Mouse.moving = new Mover(x, y, options);
        try {
            while (mover.dist > 1) {
                mover.step();
            }
            mover.end();
        } finally {
            Mouse.moving = null;
        }
    }

    async mouseMove(x, y, options) {
        if (Mouse.moving) {
            Mouse.moving.end();
        }
        const mover = Mouse.moving = new Mover(x, y, options);
        try {
            await new Promise((resolve) => {
                const tick = () => !mover.stopped && mover.step() ? setTimeout(tick, 0) : resolve();
                setTimeout(tick, 0);
            });
        } finally {
            mover.end();
            Mouse.moving = null;
        }
    }

}

export class Vision {

    mat: cv.Mat;
    capture: any;
    
    refresh() {
        if (!this.capture) {
            this.capture = new Capture();
            const [width, height] = getDesktopResolution();
            this.mat = new cv.Mat(Math.ceil(height / 8) * 8, Math.ceil(width / 8) * 8, cv.CV_8UC3);
        }
        return this.capture.grab(this.mat, 0);
    }

    findMany(options: MultiMatchOptions): IterableIterator<Result> {
        return new Finder(options).findMany();
    }

    findOne(options: MatchOptions): Result {
        return new Finder(options).find();
    }

    async untilFound(finder: Finder, timeout?: number, delay?: number) {
        let result;
        await Context.until(() => {
            this.refresh();
            if (result = finder.find()) {
                return true;
            }
        }, timeout, delay);
        return result;
    }

}