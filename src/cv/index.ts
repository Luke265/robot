import { loadNativeModule } from "../utils/native";
import type * as CV from "../../typings/opencv4nodejs/types";

const OpenCV = loadNativeModule("robot.node").OpenCV as typeof CV;

export = OpenCV;
