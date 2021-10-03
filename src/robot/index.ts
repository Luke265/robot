import { Event, EventType, IOHook } from "../keyboard/iohook";

let iohook: IOHook | null = null;

export { getClip, setClip, Tesseract } from "./bindings";
export * from "./screen";
export { Event, EventType } from "../keyboard/iohook";

export function on(evt: EventType, cb: (evt: Event) => void) {
    if (!iohook) {
        iohook = new IOHook();
        iohook.start();
    }
    iohook.on(evt, cb);
}

export function off(evt: EventType, cb: (evt: Event) => void) {
    if (!iohook) {
        return;
    }
    iohook.off(evt, cb);
    if (!iohook.hasListeners()) {
        iohook.unload();
        iohook = null;
    }
}
