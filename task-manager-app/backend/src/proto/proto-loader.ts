const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
import {protoOptions} from "./proto-options";


export function loadProto(name: string) {
    const PROTO_PATH = path.join(__dirname, name + '.proto');
    const packageDefinition = protoLoader.loadSync(PROTO_PATH, protoOptions);
    return grpc.loadPackageDefinition(packageDefinition)[name];
}