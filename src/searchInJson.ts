import fs from "fs";
import Pick from 'stream-json/filters/Pick';

type CveInfo = {cveName: string, cweType: string, description: string}
type JsonToken = {name: string, value: string}

export default function searchInJson (pathToJsonFile : string) {
    const json = fs.createReadStream(pathToJsonFile);
    //const ws = fs.createWriteStream(pathToJsonFile+".b")
    
    const pl = json.pipe(Pick.withParser({filter: 'CVE_Items'}));
    
    let captureValue = false
    let storage: Array<string> = [];

    let captureValueForDesc = false
    let storageA: Array<string> = [];
    
    /* in json:
    cve.CVE_data_meta
    problemtype.problemtype_data[0].description[0].value
    description.description_data[0].value
     */
    pl.on('data', (token: JsonToken) => 
        (captureValue = captureJsonLine(storage, captureValue,token, 'ID'))
    );
    pl.on('data', (token: JsonToken) => 
        (captureValueForDesc = captureJsonLine(storageA, captureValueForDesc,token, 'value'))
    );
    
    pl.on('end', ()=> {
        console.log(mergeArrays(storage, storageA));
    });
}

function captureJsonLine(accumulator: Array<string>, isCapture: boolean = false, token: JsonToken, key: string) {
    if (isCapture && token.name === "endKey") isCapture = false; // disable value capture
    const isRequiredKey = token.name === "keyValue" && token.value === key;
    if (isRequiredKey) isCapture = true; // enable capture via required key entrypoint
    if (isCapture && token.name === 'stringValue') accumulator.push(token.value)
    
    return isCapture;
}

function mergeArrays(storageWithId: Array<string>, storageWithValue: Array<string>) {
    const resultStorage : Array<CveInfo> = [];
    for (let i = 0, len = storageWithId.length; i < len; i++) {
        const cveName = storageWithId[i];
        const cweType = storageWithValue[i];
        const description = storageWithValue[i + 1];

        resultStorage.push({cveName, cweType, description} as CveInfo); // todo: cweType and description - they can change positions
    }
    
    return resultStorage
}


// test:
/*const __dirname = path.resolve()
const dirForData = path.resolve(__dirname, './cve')
searchInJson(dirForData+"/nvdcve-1.1-2008.json")*/
