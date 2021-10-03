import { loadNativeModule } from "../utils/native";
import type * as RJS from "../../typings/robotjs/types.d";

const RobotJS = loadNativeModule("robotjs.node") as typeof RJS;

export = RobotJS;
