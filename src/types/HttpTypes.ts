import { IncomingMessage, ServerResponse } from 'http'

export enum Method {
    POST = 'post',
    GET = 'get',
    PUT = 'put',
    DELETE = 'delete',
}

export enum ContentType {
    HTML = 'text/html;charset=utf-8',
    TEXT = 'text/plain;charset=utf-8',
    JSON = 'application/json;charset=utf-8',
}

export type Route = { path: string; method: Method }
export type RouteResolve = Route & { resolve: ResolveFuncSignature }
export type ResolveFuncSignature = (
    req: IncomingMessage,
    res: ServerResponse
) => void
