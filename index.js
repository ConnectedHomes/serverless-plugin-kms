'use strict';
const AWS = require('aws-sdk');
const kms = new AWS.KMS({ apiVersion: '2014-11-01', region: 'us-east-1' });

const decrypt = (value, stage, region) =>
    kms
        .decrypt({ CiphertextBlob: new Buffer(value, 'base64') })
        .promise()
        .then(data => data.Plaintext.toString('ascii'));

const decryptVariables = (variables, stage, region) =>
    Object.keys(variables)
        .filter(key => key.charAt(0) !== '_' && typeof variables[key] === 'object')
        .reduce((promises, key) => {
            if (variables[key].encrypted === 'true' && variables[key].value) {
                promises.push(
                    decrypt(variables[key].value, stage, region).then(decryptedValue => {
                        variables[key] = decryptedValue;
                        return decryptedValue;
                    })
                );
            }
            return promises;
        }, []);

const replaceVariables = (serverless, { stage, region }) => {
    const { environment } = serverless.service.provider;

    if (!stage) {
        return Promise.reject(new Error('Missing stage'));
    }

    return Promise.all(decryptVariables(environment, stage, region));
};

module.exports = class VariablesKMSPlugin {
    constructor(serverless, options) {
        this.hooks = {
            'before:deploy:functions': replaceVariables.bind(null, serverless, options),
            'package:createDeploymentArtifacts': replaceVariables.bind(null, serverless, options),
            'before:deploy:function:packageFunction': replaceVariables.bind(null, serverless, options),
            'before:invoke:local:invoke': replaceVariables.bind(null, serverless, options),
            'before:invoke:local:loadEnvVars': replaceVariables.bind(null, serverless, options)
        };
    }
};
