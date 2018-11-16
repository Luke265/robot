import * as robotjs from 'robotjs';
import { Robot } from "./robot";
import { Utils } from "../utils";

export type Modifier = 'alt' | 'command' | 'control' | 'shift';

export class Keyboard {

    constructor(private context: Robot) {

    }

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
            await this.context.delay(millis());
            robotjs.keyToggle(c, 'up');
            await this.context.delay(millis());
        }
    }

    async typeRaw(str: string, cpm = 420) {
        robotjs.typeStringDelayed(str, cpm);
    }

    async keyTap(key: string, mod: Modifier) {
        await this.keyToggle(key, true, mod);
        await this.keyToggle(key, false, mod);
    };

    async keyToggle(key: string, down: boolean, mod?: Modifier) {
        await this.context.delay(Utils.random(110, 60));
        robotjs.setKeyboardDelay(0);
        if (mod === undefined) {
            robotjs.keyToggle(key, down ? 'down' : 'up');
        } else {
            robotjs.keyToggle(key, down ? 'down' : 'up', mod);
        }
    }

    async keyComb(key: string) {
        const parts = key.split('+');
        for (let p of parts) {
            await this.keyToggle(p, true);
        }
        for (let i = parts.length - 1; i >= 0; i--) {
            await this.keyToggle(parts[i], false);
        }
    }

}
