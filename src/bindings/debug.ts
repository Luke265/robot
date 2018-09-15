import { Utils } from "../utils";
import { Bind } from '../script-bindings';
import * as cv from 'opencv4nodejs';
import { Mat, Vec3 } from "opencv4nodejs";
import { CoreBindings } from "./core";
import { MouseBindings } from "./mouse";
import { BindingUtils } from "./binding-utils";

@Bind()
export class DebugBindings {

    debugColor = new Vec3(0, 255, 0);
    debugCommands = [];
    lastDebugPos;
    debugHandler = (evt) => {
        if (evt.rawcode === 93) { // context key
            const pos = this.mouse.mousePos;
            this.core.refresh();
            this.core.print(
                'pos:', pos.x, pos.y,
                'rgb:', this.core.getScreenRGBAt(pos.x, pos.y),
                'hex:', this.core.getScreenHexAt(pos.x, pos.y)
            );
            if (this.lastDebugPos) {
                this.core.print(`Rect: [${this.lastDebugPos.x}, ${this.lastDebugPos.y}, ${pos.x - this.lastDebugPos.x}, ${pos.y - this.lastDebugPos.y}]`);
            }
            this.lastDebugPos = pos;
        }
    };

    constructor(private core: CoreBindings, private mouse: MouseBindings) {
    }

    @Bind()
    debug(result: any) {
        if (!result) {
            return;
        }
        if (typeof result === 'boolean') {
            if(result) {
                this.core.on('keydown', this.debugHandler);
            } else {
                this.core.off('keydown', this.debugHandler);
            }
        }
        this.debugRect(result);
        if (result.value) {
            this.debugCommands.push(
                (drawOn: Mat) => drawOn.putText(
                    "" + (result.value.toFixed(5)),
                    new cv.Point2(result.x - result.width, (result.y + result.height * 2) + 4),
                    cv.FONT_HERSHEY_PLAIN,
                    0.85,
                    this.debugColor,
                    1,
                    cv.LINE_AA
                )
            );
        }
    }

    @Bind()
    debugRect(rect: any) {
        if (!rect) {
            return;
        }
        this.debugCommands.push(
            (drawOn: Mat) => drawOn.drawRectangle(
                BindingUtils.normalizeRegion(rect),
                this.debugColor,
                2,
                cv.LINE_8
            )
        );
    }

    @Bind()
    debugShow(mat: Mat = this.core.screenMat, window: string = 'Debug') {
        if (mat as any === this.core.matFn) {
            mat = this.core.matFn();
        }
        for (let cmd of this.debugCommands) {
            cmd(mat);
        }
        this.debugCommands = [];
        cv.imshow(window, mat);
        cv.waitKey(1);
    }


    @Bind()
    setDebugColor(...args: any[]) {
        if (args.length === 1) {
            if (typeof args[0] === 'string') {
                this.debugColor = Utils.hexToVec(args[0]);
            } else if (args[0] instanceof Vec3) {
                this.debugColor = args[0];
            } else if (args[0] instanceof Array) {
                this.debugColor = Utils.rgbToVec.apply(Utils, args[0]);
            } else {
                throw new Error("Invalid color");
            }
        } else {
            this.debugColor = Utils.rgbToVec.apply(Utils, args);
        }
    }

}