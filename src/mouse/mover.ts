import { getMousePos, moveMouse, setMouseDelay } from "../robotjs";
import { random } from "../utils/index";

const sqrt3 = Math.sqrt(3);
const sqrt5 = Math.sqrt(5);

export interface Options {
    wind: number;
    gravity: number;
    maxStep: number;
    interruptThreshold: number;
}

export class Mover {
    veloX = 0;
    veloY = 0;
    windX = 0;
    windY = 0;
    lastX: number;
    lastY: number;
    stopped = false;
    options: Options;
    constructor(private dstX: number, private dstY: number, options?: Partial<Options>) {
        this.options = {
            wind: 10,
            gravity: 15,
            maxStep: 20,
            interruptThreshold: 10,
            ...options,
        };
        if (this.options.gravity < 0) {
            throw new Error("Invalid gravity option");
        }
        if (this.options.wind < 0) {
            throw new Error("Illegal wind option");
        }
        if (this.options.maxStep < 0) {
            throw new Error("Illegal maxStep option");
        }
        setMouseDelay(1);
        const { x, y } = getMousePos();
        this.lastX = x;
        this.lastY = y;
    }

    step() {
        const t = this;
        if (t.stopped) {
            return false;
        }
        const { x, y } = getMousePos();
        const interruptThreshold = t.options.interruptThreshold;
        if (
            interruptThreshold > -1 &&
            t.lastX !== null &&
            t.lastY !== null &&
            (Math.abs(t.lastX - x) > interruptThreshold || Math.abs(t.lastY - y) > interruptThreshold)
        ) {
            throw new Error("Mouse movement interrupted");
        }
        const dist = Math.hypot(x - t.dstX, y - t.dstY);
        const wind = Math.min(t.options.wind, dist);
        // weird problem with rounding in robotjs, so it must be greater than 1
        if (dist <= 5) {
            moveMouse(t.dstX, t.dstY);
            return false;
        }
        const randomStepSize = random(1, Math.min(t.options.maxStep, dist));
        const maxStep = Math.min(randomStepSize, dist);
        t.windX = t.windX / sqrt3 + ((wind * 2 + 1) - wind) / sqrt5;
        t.windY = t.windY / sqrt3 + (random(wind * 2 + 1) - wind) / sqrt5;
        t.veloX = t.veloX + random(t.windX);
        t.veloY = t.veloY + random(t.windY);
        t.veloX = t.veloX + (t.options.gravity * (t.dstX - x)) / dist;
        t.veloY = t.veloY + (t.options.gravity * (t.dstY - y)) / dist;
        if (Math.hypot(t.veloX, t.veloY) > maxStep) {
            const randomDist = maxStep / 2.0 + random(maxStep / 2);
            const veloMag = Math.sqrt(t.veloX * t.veloX + t.veloY * t.veloY);
            t.veloX = (t.veloX / veloMag) * randomDist;
            t.veloY = (t.veloY / veloMag) * randomDist;
        }
        t.lastX = Math.ceil(x + t.veloX);
        t.lastY = Math.ceil(y + t.veloY);
        moveMouse(t.lastX, t.lastY);
        return true;
    }
}
