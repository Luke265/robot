import { Utils } from "./utils";
import * as robotjs from 'robotjs';

export interface Options {
    wind?: number;
    gravity?: number;
}

export class Mover {
    xs = 0;
    ys = 0;
    veloX = 0;
    veloY = 0;
    windX = 0;
    windY = 0;
    veloMag;
    sqrt2 = Math.sqrt(2);
    sqrt3 = Math.sqrt(3);
    sqrt5 = Math.sqrt(5);
    maxStep;
    randomDist;
    get dist() {
        return Math.round(Math.hypot(this.xs - this.x, this.ys - this.y));
    }
    stopped = false;
    D;
    startLocation;
    constructor(private x: number, private y: number, private options: Options) {
        if (options.gravity < 3 || options.gravity > 30) {
            throw new Error("Invalid mouse gravity");
        }
        if (options.wind < 1 || options.wind > 30) {
            throw new Error("Invalid mouse wind");
        }
    }

    step() {
        this.startLocation = robotjs.getMousePos();
        this.xs = this.startLocation.x;
        this.ys = this.startLocation.y;
        const dist = this.dist;
        if (dist < 1) {
            return false;
        }
        this.options.wind = Math.min(this.options.wind, dist);
        this.D = Utils.random(
            Math.min(dist, 20),
            Math.min(dist, 1)
        );
        if (Math.random() > 0.3) {
            robotjs.setMouseDelay(Math.round(Math.random() * 10));
        }
        if (this.D <= dist) {
            this.maxStep = this.D;
        } else {
            this.maxStep = dist;
        }
        if (dist >= 1) {
            this.windX = this.windX / this.sqrt3 + (Utils.random(Math.round(this.options.wind * 2 + 1)) - this.options.wind) / this.sqrt5;
            this.windY = this.windY / this.sqrt3 + (Utils.random(Math.round(this.options.wind * 2 + 1)) - this.options.wind) / this.sqrt5;
        } else {
            this.windX = this.windX / this.sqrt2;
            this.windY = this.windY / this.sqrt2;
        }
        this.veloX = this.veloX + Utils.random(this.windX);
        this.veloY = this.veloY + Utils.random(this.windY);
        this.veloX = this.veloX + this.options.gravity * (this.x - this.xs) / dist;
        this.veloY = this.veloY + this.options.gravity * (this.y - this.ys) / dist;
        if (Math.hypot(this.veloX, this.veloY) > this.maxStep) {
            this.randomDist = this.maxStep / 2.0 + Utils.random(Math.round(Math.ceil(this.maxStep / 2)));
            this.veloMag = Math.sqrt(this.veloX * this.veloX + this.veloY * this.veloY);
            this.veloX = (this.veloX / this.veloMag) * this.randomDist;
            this.veloY = (this.veloY / this.veloMag) * this.randomDist;
        }
        this.xs = Math.round(this.xs + this.veloX);
        this.ys = Math.round(this.ys + this.veloY);
        robotjs.moveMouse(this.xs, this.ys);
        return true;
    }

    end() {
        const x = Math.round(this.x);
        const y = Math.round(this.y);
        if (x != Math.round(this.xs) || y != Math.round(this.ys)) {
            robotjs.moveMouse(x, y);
        }
        this.stopped = true;
    }

}