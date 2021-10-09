# EthBlock.art BlockStyle Template

Get started writing styles for [https://ethblock.art] using this template!

```bash
$ git clone
$ yarn
$ yarn start

```

Or with `npm`

```bash
$ git clone
$ npm install
#(You might need to run `npm install --force` since some dependencies might be incompatible)
$ npm start
```

Your custom code should live on `src/CustomStyle.js` and follow a few basic guidelines described within the file, the block data comes from `src/blocks.js` and is passed to your custom style on `src/index.js`

For more info check [the guide](https://www.notion.so/blockart/How-to-mint-a-BlockStyle-0b8ce85431fb4500a8e5d57e2c769d67)

For any questions, join the [discord!](https://discord.gg/H7HYqcdWWK)

You can build your `commonjs` bundle by running `yarn bundle`, and upload the `dist/main.js` file to EthBlock.art.
