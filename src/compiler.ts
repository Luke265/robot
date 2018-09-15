import * as path from 'path';
import * as fs from 'fs';

var libSource = fs.readFileSync(path.join(path.dirname(require.resolve('typescript')), 'lib.d.ts')).toString();

export function compile(fileNames: string[]): { [file: string]: string } {
    const ts = require('typescript');
    const options = {
        //inlineSourceMap: true,
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.CommonJS,
        newLine: 1
    };
    fileNames.push(path.resolve(__dirname + '/../typings/script.d.ts'));
    // Generated outputs
    var output = {};
    // Create a compilerHost object to allow the compiler to read and write files
    var compilerHost = ts.createCompilerHost(options);    
    /*const a = {
        getSourceFile: function (fileName, languageVersion) {
            if (fileName === "lib.d.ts")
                return ts.createSourceFile(fileName, libSource, options.target, false);
            return ts.createSourceFile(fileName, fs.readFileSync(fileName).toString(), options.target, false);
        },
        getSourceFileByPath(fileName: string, path: ts.Path, languageVersion: ts.ScriptTarget) {
            return ts.createSourceFile(fileName, fs.readFileSync(fileName).toString(), options.target, false);
        },
        fileExists(fileName: string) {
            return fs.existsSync(fileName);
        },
        readFile(fileName: string) {
            return fs.readFileSync(fileName).toString();
        },
        writeFile: function (name, text, writeByteOrderMark) {
            output[name] = text;
        },
        getDefaultLibFileName: function () { return "lib.d.ts"; },
        getDirectories: function () {
            return null;
        },
        useCaseSensitiveFileNames: function () { return false; },
        getCanonicalFileName: function (filename) { return filename; },
        getCurrentDirectory: function () { return ""; },
        getNewLine: function () { return "\n"; }
    };*/
    compilerHost.writeFile = (name, text, writeByteOrderMark) => {
        output[name] = text;
    };
    compilerHost.getSourceFileByPath = (fileName: string, path: any, languageVersion: any) => {
        return ts.createSourceFile(fileName, fs.readFileSync(fileName).toString(), options.target, false);
    };
    compilerHost.getSourceFile = (fileName, languageVersion) => {
        if (fileName === "lib.d.ts")
            return ts.createSourceFile(fileName, libSource, options.target, false);
        return ts.createSourceFile(fileName, fs.readFileSync(fileName).toString(), options.target, false);
    };
    let program = ts.createProgram(fileNames, options, compilerHost);
    let emitResult = program.emit();
    let allDiagnostics = ts
        .getPreEmitDiagnostics(program)
        .concat(emitResult.diagnostics);

    allDiagnostics.forEach(diagnostic => {
        if (diagnostic.file) {
            let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
                diagnostic.start!
            );
            let message = ts.flattenDiagnosticMessageText(
                diagnostic.messageText,
                "\n"
            );
            console.log(
                `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
            );
        } else {
            console.log(
                `${ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")}`
            );
        }
    });
    return output;
}