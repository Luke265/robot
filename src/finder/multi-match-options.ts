import { MatchOptions } from "./match-options";

export interface MultiMatchOptions extends MatchOptions {
    flood?: { min: number, max: number };
    treshhold?: { type: number, min: number, max: number };
}