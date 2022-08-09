import { parse } from 'yaml'
import { readFileSync } from 'fs'

const PARENT_KEYWORD = '_from'

export function resolveInherit(child: {}, parent: {} | undefined){
    if(parent){
        return {...parent, ...child}
    }
    else{
        return child
    }
}

export function clean(element: any){
    delete element[PARENT_KEYWORD]
    Object.keys(element).forEach( key =>{
        if(element[key].toString().startsWith('__')){
            element[key] = undefined
        }
    })
    return element
}

function getParent(child: any, raw: any){
    let parentId = child[PARENT_KEYWORD]
    if(parentId){
        let id = parentId as string
        if(id in raw['devices']){
            return raw['devices'][id]
        }
        else if(id in raw['agents'])
            return raw['agents'][id]
        else 
            return raw['types'][id]
    }
}

export function resolveInheritSingle(child: {} | undefined, raw: {}): {}{
    if(child)
        return resolveInherit(
            child!, 
            resolveInheritSingle(getParent(child, raw), raw)
        )
    else
        return {}
}

export function loadFromYaml(filePath: string){
    const text = readFileSync(filePath, 'utf-8');
    const raw = parse(text);
    let my_device = raw['agents']['ta_docker_amd64'];
    console.log(clean(resolveInheritSingle(my_device, raw)));
    let result:any = { devices:{}, agents:{} };
    ['devices', 'agents'].forEach(key =>{
        Object.keys(raw[key]).forEach(elemKey =>{
            result[key][elemKey] = clean(resolveInheritSingle(raw[key][elemKey], raw))
        })
    });
    return result
}

