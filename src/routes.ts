'use strict'

import { IncomingMessage, ServerResponse } from 'http'
import { trimParams, eqStr, extractParams } from './utils'

type Method = 'post' | 'get' | 'put' | 'delete'
type ResolveFuncSignature = (req: IncomingMessage, res: ServerResponse) => void
type Route = { path: string; method: Method; resolve: ResolveFuncSignature }

const routes: Array<Route> = [
    { path: '/cve', method: 'get', resolve: getCve }, // ?soft=nginx
]

function getCve(req: IncomingMessage, res: ServerResponse) {
    let { url } = req
    const { soft } = extractParams(url as string)
    
    res.writeHead(200)
    res.end('ok.')
}

export function resolve(req: IncomingMessage, res: ServerResponse) {
    let { method, url } = req as {method: string, url: string}
    url = trimParams(url) as string
    const maybeRoute = routes.find(
        route =>
            eqStr(route.path, url) &&
            eqStr(route.method, method)
    )

    if (!maybeRoute) {
        console.error(`route ${url} on method ${method} not found`)
        return // end
    }
    maybeRoute.resolve(req, res)
}
