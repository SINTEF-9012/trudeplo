import { program } from "commander";
import * as mqtt from "async-mqtt";
import prompts from 'prompts';
import { loadFromYaml } from "../model/model-handler";

program
    .name('mqtt')
    

program
    .command('start')
    .action(async (options)=>{
        const client = mqtt.connect('tcp://test.mosquitto.org:1883')
        let result = await client.subscribe('no.sintef.sct.giot.things/upstream')
        let result2 = await client.subscribe('no.sintef.sct.giot.things/request')
        client.on('message', async (topic, payload, packet)=>{
            if(topic == 'no.sintef.sct.giot.things/request'){
                let message = payload.toString()
                if(message == 'FetchAll'){
                    console.log('Sending downstream device models...');
                    let model = loadFromYaml('sample/models/sample-model.yaml')
                    Object.values(model.devices).forEach( (dev: any) =>{
                        let payload = {
                            thingId: dev.thingId,
                            attributes: {
                                host: dev.host,
                                arch: dev.arch
                            },
                            features:{
                                execEnv:{
                                    properties: dev.execEnv
                                },
                                agent:{},
                                meta:{}
                            }
                        }
                        client.publish('no.sintef.sct.giot.things/downstream', JSON.stringify(payload))
                    })
                }
            }
            if(topic == 'no.sintef.sct.giot.things/upstream'){
                let model = JSON.parse(payload.toString())
                if(model.thingId == 'no.sintef.sct.giot:tellu_gw1'){
                    console.log(JSON.stringify(model, null, ' '))
                    let input = await prompts({
                        type: 'text',
                        name: 'command',
                        message: 'What do you want?',
                        validate: value => value in ['start', 'stop'] ? 'invalid command' : true
                    });
                    if(input.command == 'start'){
                        console.log('create response...')
                        // let desired = {
                        //     localFile: "ext/trust-agent-image.tar.gz",
                        //     image: "songhui/trust-agent:latest",
                        //     status: "running",
                        //     name: "trust_agent"
                        // }
                        let desired = {
                            localFile: "ext/ta_armv7.tar.gz",
                            image: "erat/ta-sample:armv7",
                            status: "running",
                            name: "trust_agent"
                        }
                        if(!model.features.agent){
                            model.features.agent = {}
                        }
                        model.features.agent.desiredProperties = desired
                        await client.publish('no.sintef.sct.giot.things/downstream', JSON.stringify(model))
                        
                        console.log('response sent')
                    }
                    else if(input.command == 'stop'){
                        console.log('create response to stop the trust agent');
                        let desired = {...model.features.agent.properties}
                        desired.status = 'stopped'
                        model.features.agent.desiredProperties = desired;
                        await client.publish('no.sintef.sct.giot.things/downstream', JSON.stringify(model))
                        console.log('response sent')
                    }
                    
                }
            }
        })
        
    })


program.parse(process.argv)