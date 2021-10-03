import { loadNativeModule } from "../utils/native";
import type * as R from "../../typings/robot/types.d";

const Robot = loadNativeModule("robot.node") as typeof R;

export = Robot;
