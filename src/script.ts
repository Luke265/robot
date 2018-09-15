import { parse, PropertyParsers } from "./config";
import * as cv from "opencv4nodejs";
import { ScriptContext } from './script-context';
import { BINDS } from "./script-bindings";
import * as path from 'path';
import * as fs from 'fs';
import * as robotjs from 'robotjs';
import * as vm from 'vm';
import { Container } from "typedi";

export class Script {

    config: Config;
    parsedPath: path.ParsedPath;
    dir: string;

    constructor(public filePath: string, public context: ScriptContext) {
        if (!context) {
            throw new Error('Script context cannot be null');
        }
        this.parsedPath = path.parse(this.filePath);
        if (this.parsedPath.ext === '') {
            this.filePath += '/index.js';
            this.parsedPath = path.parse(this.filePath);
        }
        this.dir = this.parsedPath.dir;
    }

    get screenMat(): cv.Mat {
        return this.context.screenMat;
    }

    eval() {
        this.config = Script.getConfig(this.dir + '/' + this.parsedPath.name + '.json', this.dir);
        const script = this.getScript();
        const context = this.createScriptContext();
        vm.createContext(context);
        vm.runInContext(`(async () => {${script}})().catch(onError);`, context, {
            filename: 'index.js',
            lineOffset: 0,
            displayErrors: true
        });
        return context.exports;
    }

    private static getConfig(file: string, baseDir: string): Config {
        if (fs.existsSync(file)) {
            const configStr = fs.readFileSync(file).toString();
            return parse(JSON.parse(configStr), baseDir);
        }
        return { properties: {} };
    }

    private getScript() {
        if (fs.existsSync(this.filePath)) {
            if (this.parsedPath.ext === '.ts') {
                return this.context.compileAndGet(this.filePath);
            }
            return fs.readFileSync(this.filePath).toString();
        }
        throw new Error('File does not exist ' + this.filePath);
    }

    private createScriptContext(): any {
        Container.set(ScriptContext, this.context);
        Container.set(Script, this);
        const context: any = {};
        for (let [clasz, binds] of BINDS) {
            const instance: any = Container.get(clasz);
            for (let name of binds) {
                try {
                    const desc = Object.getOwnPropertyDescriptor(clasz.prototype, name);
                    if (context[name]) {
                        throw new Error('Context variable already set: ' + name);
                    }
                    if (typeof instance[name] === 'function') {
                        context[name] = instance[name].bind(instance);
                    } else if(desc) {
                        Object.defineProperty(context, name, {
                            get: desc.get ? desc.get.bind(instance) : undefined,
                            set: desc.set ? desc.set.bind(instance) : undefined
                        });
                    } else {
                        context[name] = instance[name];
                    }
                } catch (e) {
                    throw new Error(`Error while loading context ${clasz.name}.${name}: ` + e);
                }
            }
        }
        Container.remove(...Array.from(BINDS.keys()));
        Container.remove(ScriptContext, Script);
        return context;
    }
}