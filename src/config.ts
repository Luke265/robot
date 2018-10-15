import { imread, Rect } from 'opencv4nodejs';
import * as cv from 'opencv4nodejs';
import * as path from 'path';
import { MultiMatchOptions } from './multi-match-options';

export class Config {

    properties = {};

    static from(obj: any, baseDir: string) {
        const config = new Config();
        for (let p in obj.properties) {
            config.properties[p] = parseProperty(obj.properties[p], baseDir);
        }
        return config;
    }

}
export const PropertyParsers = {
    Composite(value, baseUrl) {
        const obj: MultiMatchOptions = Object.assign(value, {
            target: PropertyParsers.Image(value.target, baseUrl)
        })
        if (value.region) {
            obj.region = PropertyParsers.Rect(value.region);
        }
        if (value.matchMethod) {
            obj.matchMethod = cv[value.matchMethod];
        }
        if (value.alt) {
            obj.alt = value.alt.map((alt) => PropertyParsers.Composite(alt, baseUrl));
        }
        return obj;
    },
    Image(value, baseUrl) {
        value = path.join(baseUrl, value);
        return imread(value);
    },
    PrimitiveValue(value) {
        return {
            value
        };
    },
    Rect(value) {
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
    if (!parser) {
        throw new Error('Property type "' + prop.type + '" parser not found.');
    }
    return parser(prop.value, baseUrl);
}