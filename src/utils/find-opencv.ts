"use strict";
import * as path from 'path';

var exec = require("child_process").exec;
var fs = require("fs");
var flag = process.argv[2] || "--exists";

// Normally |pkg-config opencv ...| could report either OpenCV 2.x or OpenCV 3.y
// depending on what is installed.  To enable both 2.x and 3.y to co-exist on
// the same machine, the opencv.pc for 3.y can be installed as opencv3.pc and
// then selected by |export PKG_CONFIG_OPENCV3=1| before building node-opencv.
var opencv = process.env.PKG_CONFIG_OPENCV3 === "1" ? "opencv3" : '"opencv >= 2.3.1"';

function main(){
    //Try using pkg-config, but if it fails and it is on Windows, try the fallback
    exec("pkg-config " + opencv + " " + flag, function(error, stdout, stderr){
        if(error){
            if(process.platform === "win32"){
                fallback();
            }
            else{
                console.error(opencv, flag);
                throw new Error("ERROR: failed to run: pkg-config");
            }
        }
        else{
            console.log(stdout);
        }
    });
}

//======================Windows Specific=======================================

function fallback(){
    exec("echo %OPENCV_LIB_DIR%", function(error, stdout, stderr){
        stdout = cleanupEchoOutput(stdout);
        if(error){
            throw new Error("ERROR: There was an error reading OPENCV_LIB_DIR");
        }
        else if(stdout === "%OPENCV_LIB_DIR%") {
            throw new Error("ERROR: OPENCV_LIB_DIR doesn't seem to be defined");
        }
        else {
            printPaths(stdout);
        }
    });
}

function printPaths(opencvPath){
    if(flag === "--cflags") {
        const includeDir = path.join(opencvPath, '..', '..', '..', 'include\\').replace(/\\/g, '/');
        console.log(includeDir);
    }
    else if(flag === "--libs") {
        var libPath = opencvPath + "\\";

        fs.readdir(libPath, function(err, files){
            if(err){
                throw new Error("ERROR: couldn't read the lib directory " + err);
            }

            var libs = "";
            for(var i = 0; i < files.length; i++){
                if(getExtension(files[i]) === "lib"){
                    libs = libs + " \"" + libPath + files[i] + "\" \r\n ";
                }
            }
            console.log(libs);
        });
    }
    else {
        throw new Error("Error: unknown argument '" + flag + "'");
    }
}

function cleanupEchoOutput(s){
    return s.slice(0, s.length - 2);
}

function getExtension(s){
    return s.substr(s.lastIndexOf(".") + 1);
}
main();