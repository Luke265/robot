import { Utils } from "../utils";
import { Bind } from '../script-bindings';
import * as robotjs from 'robotjs';
import { CoreBindings } from "./core";

@Bind()
export class KeyboardBindings {

    constructor(private core: CoreBindings) {

    }

    @Bind()
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
            await this.core.delay(millis());
            robotjs.keyToggle(c, 'up');
            await this.core.delay(millis());
        }
    }

    @Bind()
    async typeRaw(str: string, cpm = 420) {
        robotjs.typeStringDelayed(str, cpm);
    }

    @Bind()
    async keyTap(key, mod) {
        await this.keyToggle(key, true, mod);
        await this.keyToggle(key, false, mod);
    };

    @Bind()
    async keyToggle(key, down, mod) {
        await this.core.delay(Utils.random(110, 60));
        robotjs.setKeyboardDelay(0);
        if (mod === undefined) {
            robotjs.keyToggle(key, down ? 'down' : 'up');
        } else {
            robotjs.keyToggle(key, down ? 'down' : 'up', mod);
        }
    }

}