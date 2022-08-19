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

program.parse(process.argv)