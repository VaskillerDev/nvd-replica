import { IncomingMessage, ServerResponse } from 'http'
import { extractParams } from '../utils'
import searchInStorage from '../searchInStorage'
import { StorageType } from '../types/StorageType'
import { Stream } from 'node:stream'
import { ContentType } from '../types/HttpTypes'

export default function getCve(req: IncomingMessage, res: ServerResponse) {
    let { url } = req
    const { soft } = extractParams(url as string) as { soft: string }

    if (soft === '' || !soft) {
        res.setHeader('Content-Type', ContentType.JSON)
        res.writeHead(404)
        const result = { result: [] }
        res.end(JSON.stringify(result))
        return
    }

    searchInStorage(StorageType.Csv, soft).then(searchRes => {
        const rs = new Stream.Readable()
        const result = { result: searchRes }
        res.setHeader('Content-Type', ContentType.JSON)
        res.writeHead(200)
        rs.pipe(res)
        rs.push(JSON.stringify(result))
        rs.push(null)
    })
}
