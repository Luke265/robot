export function millis(time: number) {
    return new Promise((resolve) => process.nextTick(() => setTimeout(resolve, time)));
}

export function random(num: number, max?: number) {
    if (max === undefined) {
        return Math.floor(Math.random() * num);
    }
    return Math.floor(Math.random() * (max - num)) + num;
}

export function componentToHex(c: number) {
    return c.toString(16).padStart(2, "0");
}

export function rgbToHex(r: number, g: number, b: number) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
