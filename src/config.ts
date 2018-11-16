import { imread, Rect } from 'opencv4nodejs';
import * as cv from 'opencv4nodejs';
import * as path from 'path';
import * as fs from 'fs';
import { MultiMatchOptions } from './finder/multi-match-options';

export class Config {

    properties: { [key: string]: any } = {};

    static from(pathStr: string) {
        pathStr = path.resolve(pathStr);
        const configStr = fs.readFileSync(pathStr).toString();
        const obj = JSON.parse(configStr);
        const config = new Config();
        for (const prop in obj.properties) {
            config.properties[prop] = parseProperty(obj.properties[prop], path.dirname(pathStr));
        }
        return config;
    }

}
export const PropertyParsers = {
    finder(value, baseUrl) {
        const obj: MultiMatchOptions = Object.assign(value, {
            target: PropertyParsers.image(value.target, baseUrl)
        })
        if (value.region) {
            obj.region = PropertyParsers.rect(value.region);
        }
        if (value.matchMethod) {
            obj.matchMethod = cv[value.matchMethod];
        }
        if (value.alt) {
            obj.alt = value.alt.map((alt) => PropertyParsers.finder(alt, baseUrl));
        }
        return obj;
    },
    image(value, baseUrl) {
        value = path.join(baseUrl, value);
        try {
            return imread(value);
        } catch (e) {
            throw new Error('Failed to read image: ' + value);
        }
    },
    primitiveValue(value) {
        return {
            value
        };
    },
    rect(value) {
        if (value instanceof Array) {
            return new Rect(
                value[0],
                value[1],
                value[2],
                value[3]
            );
        }
        return new Rect(
            value.x,
            value.y,
            value.w || value.width,
            value.h || value.height
        );
    }
}
export function parseProperty(prop: any, baseUrl: string): any {
    const parser = PropertyParsers[prop.type];
    return parser ? parser(prop.value, baseUrl) : prop;
}