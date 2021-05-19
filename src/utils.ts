import * as qsParser from 'querystring'
import equal from 'deep-equal'
import {Method, Route} from "./types/HttpTypes";
import {IncomingMessage} from "http";

export function trimParams(url: string) {
    if (!url) return null
    try {
        return url.split('?')[0]
    } catch {
        return null
    }
}

export function trimPath(url: string) {
    if (!url) return null
    try {
        return url.split('?')[1]
    } catch {
        return null
    }
}

export function extractParams(url: string) {
    url = trimPath(url) as string
    return qsParser.parse(url)
}

export function trimExt(fileName: string) {
    return fileName.split('.').slice(0, -1).join('.')
}

export function makePathToCsvStorage(pathToJsonFile: string) {
    return trimExt(pathToJsonFile) + '.storage.csv'
}

export function toBoolean(str: string) {
    return str === 'true'
}

export function lowerCaseDeepEqual<T>(l: T, r: T): boolean {
    const lwL = JSON.parse(JSON.stringify(l).toLowerCase())
    const lwR = JSON.parse(JSON.stringify(r).toLowerCase())
    return equal(lwL, lwR)
}

export function deepEqual(l: object, r: object): boolean {
    return equal(l, r)
}

export function translateRequest<T extends Route>(req: IncomingMessage): T {
    let { method, url: path } = req as { method: Method; url: string }
    return { method, path } as T
}