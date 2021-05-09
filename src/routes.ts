import { IncomingMessage, ServerResponse } from 'http'
import { eqStr, extractParams, trimParams } from './utils'
import searchInStorage from './searchInStorage'
import { StorageType } from './types/StorageType'
import { Stream } from 'node:stream'

type Method = 'post' | 'get' | 'put' | 'delete'
type ResolveFuncSignature = (req: IncomingMessage, res: ServerResponse) => void
type Route = { path: string; method: Method; resolve: ResolveFuncSignature }

const routes: Array<Route> = [
    { path: '/cve', method: 'get', resolve: getCve }, // ?soft=nginx
]

function getCve(req: IncomingMessage, res: ServerResponse) {
    let { url } = req
    const { soft } = extractParams(url as string) as { soft: string }

    if (soft === '' || !soft) {
        res.setHeader('Content-Type', 'application/json;charset=utf-8')
        res.writeHead(404)
        const result = { result: [] }
        res.end(JSON.stringify(result))
        return
    }

    searchInStorage(StorageType.Csv, soft).then(searchRes => {
        const rs = new Stream.Readable()
        const result = { result: searchRes }
        res.setHeader('Content-Type', 'application/json;charset=utf-8')
        res.writeHead(200)
        rs.pipe(res)
        rs.push(JSON.stringify(result))
        rs.push(null)
    })
}

export function resolve(req: IncomingMessage, res: ServerResponse) {
    let { method, url } = req as { method: string; url: string }
    url = trimParams(url) as string
    const maybeRoute = routes.find(
        route => eqStr(route.path, url) && eqStr(route.method, method)
    )

    if (!maybeRoute) {
        console.error(`route ${url} on method ${method} not found`)
        return // end
    }
    maybeRoute.resolve(req, res)
}
