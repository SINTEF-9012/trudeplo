import { program } from "commander";
import * as mqtt from "async-mqtt";
import prompts from 'prompts';

program
    .name('mqtt')
    

program
    .command('start')
    .action(async (options)=>{
        const client = mqtt.connect('tcp://test.mosquitto.org:1883')
        let result = client.subscribe('trudeplo/device')
        client.on('message', async (topic, payload, packet)=>{
            if(topic == 'trudeplo/device'){
                let model = JSON.parse(payload.toString())
                if(model.thingId == 'no.sintef.sct.giot:SINTEF9977'){
                    console.log(JSON.stringify(model, null, ' '))
                    let input = await prompts({
                        type: 'text',
                        name: 'command',
                        message: 'What do you want?',
                        validate: value => value in ['start', 'stop'] ? 'invalid command' : true
                    });
                    if(input.command == 'start'){
                        console.log('create response...')
                        let desired = {
                            localFile: "ext/trust-agent-image.tar.gz",
                            image: "songhui/trust-agent:latest",
                            status: "running",
                            name: "trust_agent"
                        }
                        if(!model.features.agent){
                            model.features.agent = {}
                        }
                        model.features.agent.desiredProperties = desired
                        await client.publish('trudeplo/downstream', JSON.stringify(model))
                        
                        console.log('response sent')
                    }
                    else if(input.command == 'stop'){
                        console.log('create response to stop the trust agent');
                        let desired = {...model.features.agent.properties}
                        desired.status = 'stopped'
                        model.features.agent.desiredProperties = desired;
                        await client.publish('trudeplo/downstream', JSON.stringify(model))
                        console.log('response sent')
                    }
                    
                }
            }
        })
        
    })


program.parse(process.argv)