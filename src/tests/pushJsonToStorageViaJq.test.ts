import pushJsonToStorage, { Parser } from '../pushJsonToStorage'
import path from 'path'

;(() => {
    const __dirname = path.resolve()
    const pathToFile = path.resolve(__dirname, './cve/nvdcve-1.1-2003.json')

    pushJsonToStorage(pathToFile, Parser.Jq)
})()
