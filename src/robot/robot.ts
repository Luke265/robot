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

    private static ioHook = null;

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
            Robot.ioHook = require('iohook');
            Robot.ioHook.start(false);
        }
        Robot.ioHook.on(evt, cb);
    }

    off(evt: Events, cb: (evt: IOHookEvent) => void) {
        if (Robot.ioHook) {
            Robot.ioHook.off(evt, cb);
            if (Robot.ioHook.eventNames().length === 0) {
                Robot.ioHook.unload();
                Robot.ioHook = null;
            }
        }
    }

    /**
     * 
     * @param callback - Function that will be repeatedly called. If returned true, then repeating will stop
     * @param interval - Default: 0
     */
    repeat(callback: () => boolean | any, interval: number = 0) {
        return this.whileFn(async () => !await callback(), 0, interval);
    }

    all(...args: Promise<any>[]) {
        return Promise.all(args);
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

    /**
     * 
     * @param callback - Callback which will be repeatedly called until it returns false
     * @param timeout - Default: 5000
     * @param delay  - Default: 100
     */
    async whileFn(callback: () => boolean | any, timeout: number = 5000, delay: number = 100): Promise<boolean> {
        const started = Date.now();
        while (await this.next(callback)) {
            if (timeout > 0 && Date.now() - started > timeout) {
                return false;
            }
            if (delay > 0) {
                await this.millis(delay);
            }
        }
        return true;
    }

    millis(time: number) {
        return new Promise((resolve) => process.nextTick(() => setTimeout(resolve, time)));
    }

    next<T>(cb: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => process.nextTick(async () => {
            try {
                resolve(await cb());
            } catch (e) {
                reject(e);
            }
        }));
    }

}
