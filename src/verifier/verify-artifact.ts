import { exec } from "child_process";
import { promisify } from "util"

const execAsync = promisify(exec)

export interface VerifiableArtifact{
    developer?: string
    signature?: string
    localFile?: string
}

export async function verifyArtifact(model: VerifiableArtifact){
    
}