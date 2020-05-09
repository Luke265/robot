import * as robotjs from 'robotjs';
import { Robot } from "./robot";
import { Utils } from "../utils";

export type Modifier = 'alt' | 'command' | 'control' | 'shift';

export class Keyboard {

     constructor(private context: Robot) {

    }

    async type(str: string) {
        const getDelay = () => {
            const random = Utils.random(100);
            if (random > 97) {
                return Utils.random(150, 232)
            } else if (random > 80) {
                return Utils.random(31, 140);
            } else if (random > 50) {
                Utils.random(31, 40)
            }
            return Utils.random(21, 56);
        }
        for (let c of str) {
            robotjs.keyToggle(c, 'down');
            await this.context.millis(getDelay());
            robotjs.keyToggle(c, 'up');
            await this.context.millis(getDelay());
        }
    }

    async typeRaw(str: string, cpm = 420) {
        robotjs.typeStringDelayed(str, cpm);
    }

    async tap(key: string, mod: Modifier) {
        await this.toggle(key, true, mod);
        await this.toggle(key, false, mod);
    };

    async toggle(key: string, down: boolean, mod?: Modifier) {
        await this.context.millis(Utils.random(60, 110));
        robotjs.setKeyboardDelay(0);
        if (mod === undefined) {
            robotjs.keyToggle(key, down ? 'down' : 'up');
        } else {
            robotjs.keyToggle(key, down ? 'down' : 'up', mod);
        }
    }

    async combination(key: string) {
        const parts = key.split('+');
        for (let p of parts) {
            await this.toggle(p, true);
        }
        for (let i = parts.length - 1; i >= 0; i--) {
            await this.toggle(parts[i], false);
        }
    }

}
