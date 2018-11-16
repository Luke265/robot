import * as cv from 'opencv4nodejs';
import * as ioHook from 'iohook';
import { getClip, setClip } from "./bindings";
import { Keyboard } from './keyboard';
import { Mouse } from './mouse';
import { Screen } from './screen';

export type Events = 'keydown' | 'keyup' | 'mouseclick' | 'mousedown' | 'mouseup' | 'mousemove' | 'mousedrag' | 'mousewheel';
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
export class Robot {

    private static ioHook = false;

    get clipboard() {
        return getClip();
    }

    set clipboard(input: string) {
        setClip(input);
    }

    keyboard = new Keyboard(this);
    mouse = new Mouse(this);
    screen = new Screen(this);

    on(evt: Events, cb: (evt: IOHookEvent) => void) {
        if (!Robot.ioHook) {
            Robot.ioHook = true;
            ioHook.start(false);
        }
        ioHook.on(evt, cb);
    }

    off(evt: Events, cb: (evt: IOHookEvent) => void) {
        if (Robot.ioHook) {
            ioHook.off(evt, cb);
        }
    }


    async repeat(fn: () => any, interval: number = 0) {
        return this.whileFn(async () => !await fn(), 0, interval);
        /*return new Promise((resolve) => {
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
        });*/
    }

    repeatSync(fn: () => any, interval?: number) {
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

    async whileFn(fn: () => boolean | any, timeout: number = 5000, delay: number = 100) {
        const started = Date.now();
        while (await fn()) {
            if (timeout > 0 && Date.now() - started > timeout) {
                return null;
            }
            if (delay > 0) {
                await this.delay(delay);
            }
        }
    }

    delay(time) {
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
