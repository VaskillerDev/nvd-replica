import { IncomingMessage, ServerResponse } from 'http'
import { extractParams, translateRequest } from '../utils'
import searchInStorage from '../searchInStorage'
import { StorageType } from '../types/StorageType'
import { Stream } from 'node:stream'
import { ContentType } from '../types/HttpTypes'

type Params = {
    soft: string
}

type Result = {
    result: Array<string>
}

export default function getCve(req: IncomingMessage, res: ServerResponse) {
    const incomingRoute = translateRequest(req)
    const params = extractParams(incomingRoute.path) as Params
    const { soft } = params

    if (soft === '' || !soft) return sendEmptyResult(res)

    searchInStorage(StorageType.Csv, soft).then(searchRes => {
        const result: Result = { result: searchRes }
        if (result.result.length === 0) return sendEmptyResult(res)
        sendResult(res, result)
    })
}

function sendEmptyResult(res: ServerResponse): void {
    res.setHeader('Content-Type', ContentType.JSON)
    res.writeHead(404)
    const result: Result = { result: [] }
    res.end(JSON.stringify(result))
}

function sendResult(res: ServerResponse, result: Result): void {
    const rs = new Stream.Readable()

    res.setHeader('Content-Type', ContentType.JSON)
    res.writeHead(200)
    rs.pipe(res)
    rs.push(JSON.stringify(result))
    rs.push(null)
}
