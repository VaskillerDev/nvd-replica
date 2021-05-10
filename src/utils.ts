import * as qsParser from 'querystring'

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

export function eqStr(str0: string, str1: string) {
    return str0.toLowerCase() === str1.toLowerCase()
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
