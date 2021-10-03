import * as tar from "tar";
import { promises as Fsp } from "fs";
import * as Path from "path";
import fetch from "node-fetch";

const pkg = require("../../package.json");
const ARCH = process.env.ARCH ? process.env.ARCH.replace("i686", "ia32").replace("x86_64", "x64") : process.arch;
const runtime = process.versions["electron"] ? "electron" : "node";
const name = `robot-v${pkg.version}-${runtime}-v${process.versions.modules}-${process.platform}-${ARCH}.tar.gz`;

(async () => {
    const dir = process.env["ROBOT_BIN"];
    if (dir) {
        console.log("Robot dir is set manually, skipping prebuilt binary download");
        return;
    }
    let url = process.env["ROBOT_PRE_BIN_HOST"] || "https://data.devop.lt/robot/build/";
    if (url.includes("{name}")) {
        url = url.replace("{name}", name);
    } else {
        url += name;
    }
    const binDir = Path.resolve("bin");
    const currentFile = Path.join(binDir, "CURRENT");
    try {
        if ((await Fsp.readFile(currentFile)).toString() === name) {
            console.log("Binaries already installed");
            return;
        }
    } catch (e) {
        // ignore
    }
    try {
        await Fsp.mkdir(binDir);
    } catch (e) {
        // ignore
    }
    console.log(`Downloading ${url}`);
    await download(url, binDir);
    await Fsp.writeFile(currentFile, name);
})();

async function download(from: string, to: string) {
    const res = await fetch(from);
    const body = res.body;
    if (!body) {
        throw new Error("Failed to receive");
    }
    if (res.status === 404) {
        throw new Error("Prebuilt binary not found");
    }
    if (res.status !== 200) {
        throw new Error("Error while downloading prebuilt binary");
    }
    await new Promise((resolve, reject) => {
        body.pipe(
            tar.extract({
                path: from,
                cwd: to,
            })
        );
        body.on("error", reject).on("finish", resolve);
    });
}
