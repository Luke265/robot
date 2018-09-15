import { Mat, CV_8UC3 } from "opencv4nodejs";
import { Script } from './script';
import { Capture, getDesktopResolution } from './robot';

export class ScriptContext {

    cache: Map<string, {}> = new Map();
    compileCache: Map<string, string> = new Map();
    screenMat: Mat;
    screenMatBase: Mat;
    capture: Capture;

    constructor(public rootRequire: any, public args: any[]) {

    }

    require(file) {
        let result = this.cache.get(file);
        if (result) {
            return result;
        }
        const script = new Script(file, this);
        result = script.eval();
        this.cache.set(file, result);
        return result;
    }

    compileAndGet(fileName: string) {
        let compiled = this.compileCache.get(fileName);
        if (!compiled) {
            const files = require('./compiler').compile([fileName]);
            for (let name in files) {
                this.compileCache.set(name, compiled = files[name]);
            }
        }
        return compiled;
    }

    refresh(block: number = 0) {
        if (!this.capture) {
            this.capture = new Capture();
            const [width, height] = getDesktopResolution();
            this.screenMat = new Mat(Math.ceil(height / 8) * 8, Math.ceil(width / 8) * 8, CV_8UC3);
        }
        return this.capture.grab(this.screenMat, block);
    }

}