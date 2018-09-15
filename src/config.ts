import { imread, Rect } from 'opencv4nodejs';
import * as cv from 'opencv4nodejs';
import * as path from 'path';

export const PropertyParsers = {
    Composite(value, baseUrl) {
        const obj: MultiMatchOptions = Object.assign(value, {
            targetImage: PropertyParsers.Image(value.targetImage, baseUrl)
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
    Image(value, baseUrl): Image {
        value = path.join(baseUrl, value);
        try {
            let mat = imread(value);
            //const channels = mat.splitChannels();
            //const alphaChannel = new Mat(mat.rows, mat.cols, 0);
            //channels.push(alphaChannel);
            //console.log(alphaChannel, channels[0].type);
            // mat = new Mat(channels);
            //mat = mat.cvtColor(0, cv.COLOR_RGB2RGBA);
            //mat.push_back(alphaChannel);
            // console.log(mat, 'b');
            //console.log('After: ' + mat.type + ' channels: ' + mat.splitChannels().length);
            return {
                path: value,
                mat
            };
        } catch (e) {
            console.error(value, e);
            throw new Error('Image not found');
        }
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
export function parse(obj: any, baseUrl: string) {
    const config: Config = {
        properties: {}
    };
    for (let p in obj.properties) {
        config.properties[p] = parseProperty(obj.properties[p], baseUrl);
    }
    return config;
}
export function parseProperty(prop: any, baseUrl: string): PropertyValue {
    const parser = PropertyParsers[prop.type];
    if (!parser) {
        throw new Error('Property type "' + prop.type + '" parser not found.');
    }
    return parser(prop.value, baseUrl);
}