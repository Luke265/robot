import * as Path from "path";
import { constants, accessSync } from "fs";

export function loadNativeModule(name: string) {
    const dir = process.env["ROBOT_BIN"];
    if (dir) {
        return require(Path.join(dir, name));
    }
    return require(nativeModulePath(name));
}

export function nativeModulePath(name: string) {
    const path = getPkgJsonDir();
    if (!path) {
        throw new Error("Package.json dir not found");
    }
    return Path.join(path, "bin", name);
}

export function getPkgJsonDir() {
    for (let path of module.paths) {
        try {
            const prospectivePkgJsonDir = Path.dirname(path);
            accessSync(Path.join(prospectivePkgJsonDir, "package.json"), constants.F_OK);
            return prospectivePkgJsonDir;
        } catch (e) {
            // ignore
        }
    }
    return null;
}
