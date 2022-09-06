import { program } from "commander";
import { DittoConnector } from "../ditto/ditto-conn";
import { loadFromYaml } from "../model/model-handler";

program
    .name('dt')

program
    .command('load')
    .description('load model from local yaml file, create adapters, and publish them to ditto')
    .option('-m, --model <string>', 'initial model in yaml file', 'sample/models/sample-model.yaml')
    .action(async (options)=>{
        let model = loadFromYaml(options.model)
        let dtConn = new DittoConnector({
            host: 'tcp://test.mosquitto.org:1883',
            rootTopic: 'trudeplo'
        });
        dtConn.loadLocalModels(model.devices)
        await dtConn.updateAllDeviceInfo()
    })

program
    .command('heartbeat')
    .description('load model from local yaml file, create adapters, and publish them to ditto')
    .option('-m, --model <string>', 'initial model in yaml file', 'sample/models/sample-model.yaml')
    .action(async (options)=>{
        let model = loadFromYaml(options.model)
        let dtConn = new DittoConnector({
            host: 'tcp://test.mosquitto.org:1883',
            rootTopic: 'trudeplo'
        });
        dtConn.loadLocalModels(model.devices)
        await dtConn.startHeartBeatForAll()
    })

program
    .command('sub')
    .action(async ()=>{
        let dtConn = new DittoConnector({
            host: 'tcp://test.mosquitto.org:1883',
            rootTopic: 'trudeplo'
        });
        await dtConn.startSubDownstream()
    })

program
    .command('all')
    .description('load model from local yaml file, start heart beat and listen to downstream')
    .option('-m, --model <string>', 'initial model in yaml file', 'sample/models/sample-model.yaml')
    .action(async (options)=>{
        let model = loadFromYaml(options.model)
        let dtConn = new DittoConnector({
            host: 'tcp://test.mosquitto.org:1883',
            rootTopic: 'no.sintef.sct.giot.things'
        });
        dtConn.loadLocalModels(model.devices)
        dtConn.startSubDownstream()
        await dtConn.startHeartBeatForAll()
    })

program
    .command('start')
    .description('start from scratch')
    .action(async (cmd)=>{
        let dtConn = new DittoConnector({
            host: 'tcp://test.mosquitto.org:1883',
            rootTopic: 'no.sintef.sct.giot.things'
        });
        dtConn.requestTwins()
        dtConn.startSubDownstream()
    })
program.parse(process.argv)