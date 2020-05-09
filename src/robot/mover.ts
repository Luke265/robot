import { Utils } from "../utils";
import * as robotjs from 'robotjs';

export interface Options {
    wind?: number;
    gravity?: number;
}

const sqrt3 = Math.sqrt(3);
const sqrt5 = Math.sqrt(5);

export class Mover {
    veloX = 0;
    veloY = 0;
    windX = 0;
    windY = 0;
    stopped = false;
    options: Options;
    constructor(private x: number, private y: number, options?: Options) {
        this.options = {
            gravity: 15,
            wind: 10,
            ...options
        };
        if (this.options.gravity < 3 || this.options.gravity > 30) {
            throw new Error("Gravity must be between 3 and 30");
        }
        if (this.options.wind < 1 || this.options.wind > 30) {
            throw new Error("Wind speed must be between 1 and 30");
        }
    }

    step() {
        const t = this;
        if (t.stopped) {
            return false;
        }
        const { x, y } = robotjs.getMousePos();
        const dist = Math.hypot(x - t.x, y - t.y);
        const wind = Math.min(t.options.wind, dist);
        if (dist <= 1) {
            robotjs.moveMouse(t.x, t.y);
            return false;
        }
        const randomStepSize = Utils.random(1, 20);
        const maxStep = Math.min(randomStepSize, dist);
        robotjs.setMouseDelay(Utils.random(10));
        t.windX = t.windX / sqrt3 + (Utils.random(wind * 2 + 1) - wind) / sqrt5;
        t.windY = t.windY / sqrt3 + (Utils.random(wind * 2 + 1) - wind) / sqrt5;
        t.veloX = t.veloX + Utils.random(t.windX);
        t.veloY = t.veloY + Utils.random(t.windY);
        t.veloX = t.veloX + t.options.gravity * (t.x - x) / dist;
        t.veloY = t.veloY + t.options.gravity * (t.y - y) / dist;
        if (Math.hypot(t.veloX, t.veloY) > maxStep) {
            const randomDist = maxStep / 2.0 + Utils.random(maxStep / 2);
            const veloMag = Math.sqrt(t.veloX * t.veloX + t.veloY * t.veloY);
            t.veloX = (t.veloX / veloMag) * randomDist;
            t.veloY = (t.veloY / veloMag) * randomDist;
        }
        robotjs.moveMouse(
            Math.ceil(x + t.veloX),
            Math.ceil(y + t.veloY)
        );
        return true;
    }

}