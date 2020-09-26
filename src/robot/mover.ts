import { Utils } from "../utils";
import * as robotjs from 'robotjs';

export interface Options {
    wind: number;
    gravity: number;
    stepDelay: number;
    interruptThreshold: number;
}

const sqrt3 = Math.sqrt(3);
const sqrt5 = Math.sqrt(5);

export class Mover {
    veloX = 0;
    veloY = 0;
    windX = 0;
    windY = 0;
    lastX: number | null = null;
    lastY: number | null = null;
    stopped = false;
    options: Options;
    constructor(private x: number, private y: number, options?: Partial<Options>) {
        this.options = {
            wind: 10,
            gravity: 15,
            stepDelay: 10,
            interruptThreshold: 10,
            ...options
        };
        if (this.options.gravity < 0) {
            throw new Error("Invalid gravity option");
        }
        if (this.options.wind < 0) {
            throw new Error("Illegal wind option");
        }
        if (this.options.stepDelay < 0) {
            throw new Error("Illegal stepDelay option");
        }
    }

    step() {
        const t = this;
        if (t.stopped) {
            return false;
        }
        const { x, y } = robotjs.getMousePos();
        const interruptThreshold = t.options.interruptThreshold;
        if (
            interruptThreshold > -1 &&
            t.lastX !== null &&
            t.lastY !== null &&
            (Math.abs(t.lastX - x) > interruptThreshold || (Math.abs(t.lastY - y) > interruptThreshold))
        ) {
            throw new Error('Mouse movement interrupted');
        }
        const dist = Math.hypot(x - t.x, y - t.y);
        const wind = Math.min(t.options.wind, dist);
        if (dist <= 1) {
            robotjs.moveMouse(t.x, t.y);
            return false;
        }
        const randomStepSize = Utils.random(1, 20);
        const maxStep = Math.min(randomStepSize, dist);
        robotjs.setMouseDelay(Utils.random(t.options.stepDelay));
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
        t.lastX = Math.ceil(x + t.veloX);
        t.lastY = Math.ceil(y + t.veloY);
        robotjs.moveMouse(t.lastX, t.lastY);
        return true;
    }

}