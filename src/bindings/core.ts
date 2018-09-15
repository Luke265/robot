import { Utils } from "../utils";
import { Bind } from '../script-bindings';
import * as cv from 'opencv4nodejs';
import { Rect } from "opencv4nodejs";
import { PropertyParsers } from "../config";
import { ScriptContext } from "../script-context";
import { Script } from "../script";
import * as path from 'path';
import * as ioHook from 'iohook';
import { getClip, setClip } from "../robot";
import { VK } from "../vk";

@Bind()
export class CoreBindings {
    
    private static ioHook = false;
    
    @Bind()
    m2: any;
    
    @Bind()
    exports = {};
    
    @Bind()
    console = console;

    @Bind()
    setTimeout = setTimeout;
    
    @Bind()
    cv = cv;
    
    @Bind()
    Rect = cv.Rect;
    
    @Bind()
    Mat = cv.Mat;
    
    @Bind()
    process = process;
    
    @Bind()
    VK = VK;

    @Bind()
    get clipboard() {
        return getClip();
    }
    
    set clipboard(input: string) {
        setClip(input);
    }
    
    @Bind()
    exit = process.exit.bind(process);
    
    @Bind()
    loadImage(path) {
        return PropertyParsers.Image(path, this.script.dir);
    }
    
    @Bind()
    onError = console.error.bind(console);
    
    constructor(protected scriptContext: ScriptContext, protected script: Script) {
        const m = require('module');
        this.m2 = new m.Module();
        this.m2.id = script.filePath;
        this.m2.filename = script.filePath;
        this.m2.loaded = true;
        this.m2.paths = [process.cwd() + '/node_modules'];
        this.refresh = scriptContext.refresh.bind(scriptContext);
    }
    
    @Bind()
    matFn = () => this.script.screenMat;
    
    @Bind()
    on(evt, cb) {
        if (!CoreBindings.ioHook) {
            CoreBindings.ioHook = true;
            ioHook.start(false);
        }
        ioHook.on(evt, cb);
    }
    
    @Bind()
    off(evt, cb) {
        if (CoreBindings.ioHook) {
           ioHook.off(evt, cb);
        }
    }
    
    @Bind()
    random(min, max) {
        return Utils.random(max, min);
    }
    
    @Bind()
    rect(x, y, w, h) {
        return new Rect(x, y, w, h);
    }
    
    @Bind()
    image(path: string) {
        return PropertyParsers.Image(path, this.script.dir);
    }
    
    @Bind()
    moment = require('moment');
    
    @Bind()
    refresh;
    
    @Bind()
    rgbToHex = Utils.rgbToHex.bind(Utils);
    
    @Bind()
    print = console.log.bind(console);
    
    @Bind()
    get screenMat() {
        return this.scriptContext.screenMat;
    }
    
    @Bind()
    get args() {
        return this.scriptContext.args;
    }
    
    @Bind()
    require(script) {
        if (script === 'core') {
            return null;
        }
        const scriptParts = path.parse(script);
        if (scriptParts.ext === '.json') {
            return require(path.resolve(this.script.dir, script));
        } else if (script.startsWith('.')) {
            if (!scriptParts.ext) {
                scriptParts.ext = '.js';
            }
            return this.scriptContext.require(path.resolve(this.script.dir, scriptParts.name + scriptParts.ext));
        }
        return this.m2.require(script);
    }
    
    @Bind()
    repeat(fn: () => any, interval: number = 0) {
        return new Promise((resolve) => {
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
        });
    }
    
    @Bind()
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
    
    @Bind()
    async until(fn: () => any, timeout: number = 5000, delay: number = 100) {
        let result;
        let started = Date.now();
        while (!fn()) {
            if (Date.now() - started > timeout) {
                return null;
            }
            if (delay > 0) {
                await this.delay(delay);
            }
        }
        return result;
    }
    
    @Bind()
    property(propName: string) {
        if (!this.script.config.properties.hasOwnProperty(propName)) {
            throw new Error(`Property ${propName} not found`);
        }
        const prop = this.script.config.properties[propName];
        if (typeof prop === 'string') {
            throw new Error('Unsupported property type: string');
        }
        return prop;
    }
    
    @Bind()
    getScreenRGBAt(x, y) {
        return <number[]><any>this.script.screenMat.atRaw(y, x);
    }
    
    @Bind()
    getScreenHexAt(x, y) {
        return Utils.rgbToHex.apply(Utils, this.getScreenRGBAt(x, y));
    }
    
    @Bind()
    delay(time) {
        return new Promise((resolve) => {
            const end = Date.now() + time;
            const timer = setInterval(() => {
                if(Date.now() > end) {
                    clearInterval(timer);
                    resolve();
                    return;
                }
                cv.waitKey(1);
            }, 1);
        });
    }
    
}