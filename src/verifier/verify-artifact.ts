import { exec } from "child_process";
import { promisify } from "util"
import assert from 'assert';
import download from 'download';
import fs from 'fs';

const execAsync = promisify(exec)
const ROOT_FOLDER = './ext'

export interface VerifiableArtifact{
    developer?: string
    signature?: string
    localFile?: string
}

export function getPublicKey(developer: string){
    const pubkey = `${ROOT_FOLDER}/pubkeys/${developer}.pub`
    assert( fs.lstatSync(pubkey).isFile() )
    return pubkey
}

export async function verifyArtifact(model: VerifiableArtifact){
    
    let pubkey = getPublicKey(model.developer!);

    let cwd = process.cwd();
    console.log(cwd)

    let result = await execAsync(
        `cosign verify-blob --key ${pubkey} --signature ${model.signature?.trim()} ${model.localFile}`,
        {cwd: process.cwd()}
    )
    // let result = await execAsync('cat ./ext/download-images.sh')
    console.log(result.stderr)
    console.log(result.stdout)
    
}