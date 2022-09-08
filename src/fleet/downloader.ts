import assert from 'assert';
import download from 'download';
import fs from 'fs';

export interface BasicDownloadableArtifact{
    url?: string;
    localFile?: string;
    signature?: string;
}

export const DOWNLOAD_ROOT = './ext'

export async function downloadArtifact(model: BasicDownloadableArtifact){
    const url = model.url
    if(! url){
        throw Error('No url provided')
    }
    const fileName = url.substring(url.lastIndexOf('/')+1)
    await download(url, DOWNLOAD_ROOT)
    const localFile = `${DOWNLOAD_ROOT}/${fileName}`
    assert( fs.lstatSync(localFile).isFile() )

    const sigBuff = await download(`${url}.sig`)
    const sig = sigBuff.toString()
    console.log(sig)
    model.signature = sig

    model.localFile = localFile

}