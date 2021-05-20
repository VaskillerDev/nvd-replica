import fs from 'fs'
import Filter from 'stream-json/filters/Filter'
import Asm from 'stream-json/Assembler'
import { CveInfo } from './types/CveInfo'
import { StorageType } from './types/StorageType'
import { makePathToCsvStorage } from './utils'
import { exec } from 'child_process'

export enum Parser {
    Jq,
    StreamJson,
}

/* 
    in json:
    configurations
    cve.CVE_data_metaproblemtype.problemtype_data[0].description[0].value
    cve.CVE_data_metadescription.description_data[0].value
    configurations.nodes[0].cpe_match[0].cpe23Uri
*/
const regexCveItems = new RegExp(
    'CVE_Items.[\\d]+.(configurations|cve.(CVE_data_meta|problemtype|description.description_data.0))'
)

function pushToStorageViaStreamJson(pathToJsonFile: string) {
    const json = fs.createReadStream(pathToJsonFile)

    const pl = json.pipe(Filter.withParser({ filter: regexCveItems }))
    const asm = Asm.connectTo(pl)

    asm.on('done', asm => {
        const cveItems = asm.current['CVE_Items']
        console.log(
            'load .json to storage ' + makePathToCsvStorage(pathToJsonFile)
        )

        cveItems.forEach((cveItem: any) => {
            // todo: typing
            try {
                const cveName = cveItem.cve.CVE_data_meta.ID
                const cweType =
                    cveItem.cve.problemtype.problemtype_data[0].description[0]
                        ?.value || 'nothing'
                const description =
                    cveItem.cve.description.description_data[0].value
                const cpe23Uri =
                    cveItem.configurations.nodes[0]?.['cpe_match']?.[0]?.[
                        'cpe23Uri'
                    ] || 'nothing'
                const cveInfo: CveInfo = {
                    cveName,
                    cweType,
                    description,
                    cpe23Uri,
                }
                const pathToCsvStorage = makePathToCsvStorage(
                    pathToJsonFile as string
                )
                pushTo(cveInfo, StorageType.Csv, pathToCsvStorage)
            } catch (e) {
                console.log(cveItem.cve)
                console.error(e)
            }
        })
    })
}

function pushTo(
    data: CveInfo,
    storageType: StorageType,
    pathToStorage: string | null = null
) {
    if (storageType === StorageType.Csv) {
        const csvLine = `"${data.cveName}";"${data.cweType}";"${data.description}";"${data.cpe23Uri}"\n`
        fs.appendFile(
            pathToStorage as string,
            csvLine,
            err => err && console.error(err)
        )
    } else if (storageType === StorageType.Mongo) {
        // todo: continue
    }
}

async function pushToStorageViaJq(pathToJsonFile: string) {
    return new Promise(async resolve => {
        const catFile = `cat ${pathToJsonFile}`
        const jqItemsAsJson = `.CVE_Items[] 
        | select(.cve.CVE_data_meta.ID) 
        | { 
            id: .cve.CVE_data_meta.ID, 
            desc: .cve.problemtype.problemtype_data[0].description[0].value,
            cpe23Uri: .configurations.nodes[0].cpe_match[0].cpe23Uri
          }`
        const jqJsonToArray = `| [.id,.desc,.cpe23Uri]`
        const jqToCsv = `| @csv`

        const outputFile = makePathToCsvStorage(pathToJsonFile)
        const toFile = `> ${outputFile}`

        const command = `${catFile} | jq '${jqItemsAsJson} ${jqJsonToArray} ${jqToCsv}' ${toFile}`

        const transformDataProcess = exec(command, (error, stdout, stderr) => {
            if (error) throw error
            if (stderr === '' || !stderr) return

            console.error(stderr)
        })

        transformDataProcess.on('exit', () => {
            console.log('load .json to storage ' + outputFile)
            resolve(true)
        })
    })
}

async function pushJsonToStorage(
    pathToJsonFile: string,
    parser: Parser = Parser.StreamJson
) {
    return new Promise(async resolve => {
        await console.log('pushJsonToStorage...')
        switch (parser) {
            case Parser.Jq:
                await pushToStorageViaJq(pathToJsonFile)
                resolve(true)
                break
            case Parser.StreamJson:
                await pushToStorageViaStreamJson(pathToJsonFile)
                resolve(true)
                break
        }
    })
}

export default pushJsonToStorage
