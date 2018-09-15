#!/usr/bin/env node

import 'reflect-metadata';
import { ScriptContext } from './script-context';
import { CoreBindings } from './bindings/core';
import { FindBindings } from './bindings/find';
import { MouseBindings } from './bindings/mouse';
import { DebugBindings } from './bindings/debug';
import { KeyboardBindings } from './bindings/keyboard';

[CoreBindings, FindBindings, MouseBindings, DebugBindings, KeyboardBindings]

export function execute(file: string, args: any[], require: any) {
    process.nextTick(() => new ScriptContext(require, args).require(file));
}

const args = process.argv.slice(2);
if (args.length > 0) {
    const file = args[0];
    args.pop();
    execute(file, args, require);
}