import type { Options } from "./mover";
import { millis, random } from "../utils/index";
import { getMousePos, mouseToggle } from "../robotjs";
import { mouseMoveHuman } from "../robot/bindings";

let moveStopHandle: (() => void) | null = null;
export type MouseButton = "left" | "right" | "middle";
export type MouseAction = "click" | "press" | "release";

export async function click(button: MouseButton = "left", action: MouseAction = "click", delay?: number) {
    const getDelay = () => {
        let rnd = 0;
        if (typeof delay === "number") {
            return delay;
        } else {
            rnd = random(200);
            if (rnd > 198) {
                return random(300, 600);
            } else if (rnd > 190) {
                return random(130, 300);
            } else {
                return random(78, 130);
            }
        }
    };
    await millis(getDelay());
    if (action === "click" || action === "press") {
        mouseToggle("down", button);
    }
    await millis(getDelay());
    if (action === "click" || action === "release") {
        mouseToggle("up", button);
    }
}

export function pos() {
    return getMousePos();
}

export function move(x: number, y: number, options?: Partial<Options>): Promise<void> {
    return new Promise((resolve) => {
        moveStopHandle = mouseMoveHuman(
            x,
            y,
            { delay: 1000, gravity: 100, wind: 120, maxStep: 20, interruptThreshold: 10, ...options },
            resolve
        );
    });
}

export function stop() {
    if (moveStopHandle) {
        moveStopHandle();
    }
    moveStopHandle = null;
}
