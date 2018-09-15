import { Token, Container } from 'typedi';

export const BINDS: Map<any, Set<string>> = new Map();
export const BIND_TOKEN = new Token<any>();

export function Bind() {
    return function (object, propertyName?) {
        if(!propertyName) {
            Container.set({
                type: object
            });
            return;
        }
        let list = BINDS.get(object.constructor);
        if (!list) {
            list = new Set();
            BINDS.set(object.constructor, list);
        }
        list.add(propertyName);
    }
}