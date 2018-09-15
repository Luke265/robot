'use strict';
const path = require('path');
const execa = require('execa');
const arch = require('arch');

// Binaries from: https://github.com/sindresorhus/win-clipboard
const winBinPath = arch() === 'x64' ? './clipboard_x86_64.exe' : './clipboard_i686.exe';

export function copy(opts?) {
    return execa(winBinPath, ['--copy'], opts);
}
export function paste(opts?) {
    return execa.stdout(winBinPath, ['--paste'], opts);
}
export function copySync(opts?) {
    return execa.sync(winBinPath, ['--copy'], opts);
}
export function pasteSync(opts?) {
    return execa.sync(winBinPath, ['--paste'], opts)
}
