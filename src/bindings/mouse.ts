import { Utils } from "../utils";
import { Bind } from '../script-bindings';
import * as robotjs from 'robotjs';
import { CoreBindings } from "./core";
import { BindingUtils } from "./binding-utils";
import { FindBindings } from "./find";

@Bind()
export class MouseBindings {

    private static moving: Mover;

    @Bind()
    get mousePos() {
        return robotjs.getMousePos();
    }

    constructor(private core: CoreBindings, private find: FindBindings) {

    }

    @Bind()
    mousePress(...args) {
        let options = this.toMouseOptions(args) || {};
        options.action = 'press';
        this.mouse(options);
    }

    @Bind()
    mouseRelease(...args) {
        let options = this.toMouseOptions(args) || {};
        options.action = 'release';
        this.mouse(options);
    }

    toMouseOptions(args: any[]) {
        let options: MouseOptions;
        switch (typeof args[0]) {
            case 'boolean':
                options = { button: 'right' };
                break;
            case 'number':
                options = args[2] || {};
                options.position = {
                    x: args[0],
                    y: args[1]
                };
                break;
            case 'object':
                if (typeof args[1] === 'boolean') {
                    args[1] = { button: 'right' };
                }
                if (BindingUtils.isPoint(args[0])) {
                    options = args[1] || {};
                    options.position = BindingUtils.normalizePoint(args[0]);
                } else if (BindingUtils.isFindable(args[0])) {
                    options = args[1] || {};
                    options.position = this.find.findOne(args[0]);
                } else {
                    options = args[0];
                }
                break;
            case 'string':
                return this.toMouseOptions([this.core.property(args[0])]);
        }
        return options;
    }

    @Bind()
    mouseClick(...args) {
        this.mouse(this.toMouseOptions(args) || {});
    }

    private mouse(options: MouseOptions) {
        if (!options.button) {
            options.button = 'left';
        }
        if (!options.action) {
            options.action = 'click';
        }
        let rnd;
        if (typeof options.delay === 'number') {
            rnd = options.delay;
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
        if (options.position) {
            this.mouseMove(options.position, options);
        }
        robotjs.setMouseDelay(rnd);
        if (options.action === 'click' || options.action === 'press') {
            robotjs.mouseToggle("down", options.button);
        }
        if (options.action === 'click' || options.action === 'release') {
            robotjs.mouseToggle("up", options.button);
        }
        robotjs.setMouseDelay(20);
    }

    @Bind()
    mouseMove(...a) {
        let options: MouseMoveOptions = this.mouseMoveOptions(arguments);
        const mover = MouseBindings.moving = new Mover(options);
        try {
            while (mover.dist > 1) {
                mover.step();
            }
            mover.end();
        } finally {
            MouseBindings.moving = null;
        }
        /* let options: MouseMoveOptions = this.mouseMoveOptions(arguments);
         let startLocation = robotjs.getMousePos();
         let xs = startLocation.x, ys = startLocation.y, wind = options.wind, veloX = 0, veloY = 0, windX = 0, windY = 0,
             veloMag, lastX, lastY, sqrt2, sqrt3, sqrt5, maxStep, randomDist, dist, D;
         sqrt2 = Math.sqrt(2);
         sqrt3 = Math.sqrt(3);
         sqrt5 = Math.sqrt(5);
         while (Math.hypot(xs - options.point.x, ys - options.point.y) > 1) {
             startLocation = robotjs.getMousePos();
             xs = startLocation.x;
             ys = startLocation.y;
             //  TDist = Utils.distance(xs, ys, point.x, point.y);
             //TDist = Math.max(1, TDist);
 
             dist = Math.round(Math.hypot(xs - options.point.x, ys - options.point.y));
             wind = Math.min(wind, dist); //minE
             if (dist < 1) {
                 dist = 1;
             }
             //D = (Math.round((Math.round(TDist) * 0.3)) / 9);
             D = Utils.random(
                 Math.min(dist, 80),
                 Math.min(dist, 10)
             );
             // if (D > 100 || D < 100)
             // if (D < 25)
             //     D = Utils.random(10, 5);
 
             //if (Utils.random(32) == 1)
             //D = Utils.random(2, 3);
             if (D <= dist)
                 maxStep = D;
             else
                 maxStep = dist;
 
             if (dist >= 1) {
                 windX = windX / sqrt3 + (Utils.random(Math.round(wind * 2 + 1)) - wind) / sqrt5;
                 windY = windY / sqrt3 + (Utils.random(Math.round(wind * 2 + 1)) - wind) / sqrt5;
             } else {
                 windX = windX / sqrt2;
                 windY = windY / sqrt2;
             }
 
             veloX = veloX + Utils.random(windX);
             veloY = veloY + Utils.random(windY);
             veloX = veloX + options.gravity * (options.point.x - xs) / dist;
             veloY = veloY + options.gravity * (options.point.y - ys) / dist;
 
             if (Math.hypot(veloX, veloY) > maxStep) {
                 randomDist = maxStep / 2.0 + Utils.random(Math.round(Math.ceil(maxStep / 2)));
                 veloMag = Math.sqrt(veloX * veloX + veloY * veloY);
                 veloX = (veloX / veloMag) * randomDist;
                 veloY = (veloY / veloMag) * randomDist;
             }
             lastX = Math.round(xs);
             lastY = Math.round(ys);
             xs = xs + veloX;
             ys = ys + veloY;
 
             xs = Math.round(xs);
             ys = Math.round(ys);
             if (lastX != xs || lastY != ys) {
                 robotjs.moveMouse(xs, ys);
             }
 
             // W = Utils.random((Math.round(100 / MSP)), 1) * 6;
             //await this.wait(Math.round(W * 0.9));
         }
         const x = Math.round(options.point.x);
         const y = Math.round(options.point.y);
         if (x != Math.round(xs) || y != Math.round(ys)) {
             robotjs.moveMouse(x, y);
         }*/
    }


    private mouseMoveOptions(args): MouseMoveOptions {
        let options: MouseMoveOptions;
        if (args.length === 0) {
            throw new Error('Invalid args');
        }
        switch (typeof args[0]) {
            case 'number':
                options = args[2] || {};
                options.point = { x: args[0], y: args[1] }
                break;
            case 'object':
                options = args[1] || {};
                if (BindingUtils.isPoint(args[0])) {
                    options.point = BindingUtils.normalizePoint(args[0]);
                } else if (BindingUtils.isFindable(args[0])) {
                    options.point = this.find.findOne(args[0]);
                }
                break;
            case 'string':
                return this.mouseMoveOptions(this.core.property(args[0]));
        }
        if (!options.point) {
            throw new Error("Destination cannot be null");
        }
        if (!options.gravity) {
            options.gravity = 7;
        }
        if (!options.wind) {
            options.wind = 20;
        }
        if (options.gravity < 3 || options.gravity > 30) {
            throw new Error("Invalid mouse gravity");
        }
        if (options.wind < 1 || options.wind > 30) {
            throw new Error("Invalid mouse wind");
        }
        return options;
    }

    @Bind()
    async mouseMoveAsync(...a) {
        if (MouseBindings.moving) {
            MouseBindings.moving.end();
        }
        let options = this.mouseMoveOptions(arguments);
        const mover = new Mover(options);
        MouseBindings.moving = mover;
        try {
            await new Promise((resolve) => {
                const tick = () => !mover.stopped && mover.step() ? setTimeout(tick, 0) : resolve();
                setTimeout(tick, 0);
            });
        } finally {
            mover.end();
            MouseBindings.moving = null;
        }
    }

}
class Mover {
    xs = 0;
    ys = 0;
    wind = 0;
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
        return Math.round(Math.hypot(this.xs - this.options.point.x, this.ys - this.options.point.y));
    }
    stopped = false;
    D;
    startLocation;
    constructor(private options) {
        this.wind = options.wind;
    }

    step() {
        this.startLocation = robotjs.getMousePos();
        this.xs = this.startLocation.x;
        this.ys = this.startLocation.y;
        const dist = this.dist;
        if (dist < 1) {
            return false;
        }
        this.wind = Math.min(this.wind, dist);
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
            this.windX = this.windX / this.sqrt3 + (Utils.random(Math.round(this.wind * 2 + 1)) - this.wind) / this.sqrt5;
            this.windY = this.windY / this.sqrt3 + (Utils.random(Math.round(this.wind * 2 + 1)) - this.wind) / this.sqrt5;
        } else {
            this.windX = this.windX / this.sqrt2;
            this.windY = this.windY / this.sqrt2;
        }
        this.veloX = this.veloX + Utils.random(this.windX);
        this.veloY = this.veloY + Utils.random(this.windY);
        this.veloX = this.veloX + this.options.gravity * (this.options.point.x - this.xs) / dist;
        this.veloY = this.veloY + this.options.gravity * (this.options.point.y - this.ys) / dist;
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
        const x = Math.round(this.options.point.x);
        const y = Math.round(this.options.point.y);
        if (x != Math.round(this.xs) || y != Math.round(this.ys)) {
            robotjs.moveMouse(x, y);
        }
        this.stopped = true;
    }

}