# serverless-plugin-kms
This serverless plugin is used when you need to store your sensitive environment variables in your codebase. You can simply

## Why this approach
We prefer saving all config into repos so that we never have to handle git-ignored `.env` files that live on someone's machine. Checking sensitive data (such as API keys and OAuth tokens) into github is obviously not safe; that's why we encrypt everything first. Then we just add it to config a check it into upstream repo so that the data is never lost.

## How to use it
First, encrypt a variable with your `us-east-1` KMS key. Then add the value to your serverless environment; the plugin does the rest.

You can define both encrypted and normal values, just make sure an encrypted value is an object with `encrypted: true`:

```json
{
  "ENCRYPTED_TOKEN": {
    "encrypted": "true",
    "value": "encrypted-value"
  },
  "NORMAL_VARIABLE": "old-fashioned-value"
}
```

The plugin will translate this before deployment to:

```js
{
  ENCRYPTED_TOKEN: "decrypted-value",
  NORMAL_VARIABLE: "old-fashioned-value"
}
```

##Roadmap
- try it out with yaml defined environment variables
- allow specifying KMS key and its region
- add CLI tool to encrypt and decrypt keys on the fly
