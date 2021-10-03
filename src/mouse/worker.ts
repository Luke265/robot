import { Mover } from "./mover";
import { workerData } from "worker_threads";

if (workerData.command === "move") {
    const [x, y, options] = workerData.args;
    const mover = new Mover(x, y, options);
    const repeat = () => setTimeout(() => {
        if (mover.step()) {
            repeat();
        }
    }, 2);
    repeat();
}
