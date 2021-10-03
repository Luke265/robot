export declare function setKeyboardDelay(ms: number) : void
export declare function keyTap(key: string, modifier?: string | string[]) : void
export declare function keyToggle(key: string, down: string, modifier?: string | string[]) : void
export declare function typeString(string: string) : void
export declare function typeStringDelayed(string: string, cpm: number) : void
export declare function setMouseDelay(delay: number) : void
export declare function updateScreenMetrics() : void
export declare function moveMouse(x: number, y: number) : void
export declare function moveMouseSmooth(x: number, y: number,speed?:number) : void
export declare function mouseClick(button?: string, double?: boolean) : void
export declare function mouseToggle(down?: string, button?: string) : void
export declare function dragMouse(x: number, y: number) : void
export declare function scrollMouse(x: number, y: number) : void
export declare function getMousePos(): { x: number, y: number }
export declare function getScreenSize(): { width: number, height: number }