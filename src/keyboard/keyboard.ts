import { keyToggle, setKeyboardDelay } from "../robotjs";
import { millis, random } from "../utils/index";

function typeDelay() {
    const num = random(100);
    if (num > 97) {
        return random(150, 232);
    } else if (num > 80) {
        return random(31, 140);
    } else if (num > 50) {
        random(31, 40);
    }
    return random(21, 56);
}

export type Modifier = "alt" | "command" | "control" | "shift";
export async function type(str: string) {
    for (let c of str) {
        keyToggle(c, "down");
        await millis(typeDelay());
        keyToggle(c, "up");
        await millis(typeDelay());
    }
}

export async function tap(key: string, mod?: Modifier) {
    await toggle(key, true, mod);
    await toggle(key, false, mod);
}

export async function toggle(key: string, down: boolean, mod?: Modifier) {
    await millis(random(60, 150));
    setKeyboardDelay(0);
    if (mod === undefined) {
        keyToggle(key, down ? "down" : "up");
    } else {
        keyToggle(key, down ? "down" : "up", mod);
    }
}

export async function combination(key: string) {
    const parts = key.split("+");
    for (let p of parts) {
        await toggle(p, true);
    }
    for (let i = parts.length - 1; i >= 0; i--) {
        await toggle(parts[i], false);
    }
}
