# babel-plugin-react-intl-extractor

Merge descriptors of messages from 
[babel-plugin-react-intl](https://github.com/yahoo/babel-plugin-react-intl) into single file.

Also creates lang files, prepared for usage as messages
in [IntlProvider](https://github.com/yahoo/react-intl/wiki/Components#intlprovider). 

## Dependencies

### Babel Plugin React Intl
This Babel plugin works with Babel Plugin React Intl v3.x
  
### Babel
This plugin works with Babel 7

## Installation

```sh
$ npm install --save-dev babel-plugin-react-intl-extractor
```
or
```sh
$ yarn add --dev babel-plugin-react-intl-extractor
```

## Usage

**This Babel plugin only visits ES6 modules which `import` React Intl.**

The default message descriptors for the app's default language will 
be extracted from: `defineMessages()`, `<FormattedMessage>`, and `<FormattedHTMLMessage>`; all of which are named exports of the React Intl package.

If a message descriptor has a `description`, it'll be removed 
from the source after it's extracted to save bytes since it isn't used at runtime.

### Via `customize-cra` or `react-app-rewired` (Recommended)

**config-overrides.js**

```javascript
const {addBabelPlugin, override} = require('customize-cra')

module.exports = override(
  ...
  addBabelPlugin(['react-intl', {enforceDescriptions: false}]),
  addBabelPlugin(['react-intl-extractor', {extractedFile: './src/translations/aggregated.json'}]),
  ...
)
```

### Via `.babelrc`

**.babelrc**

```json
{
  "plugins": [
    [
      "react-intl", {
        "messagesDir": ""
      }
    ],
    [
      "react-intl-extractor",
      {
        "cleanUpUnusedMessages": false,
        "extractedFile": "./src/translations/aggregated.json",
        "langFiles": [{
          "path": "./src/translations/ru.json",
          "cleanUpNewMessages": false
        }, {
          "path": "./src/translations/en.json",
          "cleanUpNewMessages": true
        }]
      }
    ]
  ]
}
```

### Notice
You can provide any parameter to react-intl plugin, except `moduleSourceName`,
because this plugin expects only "react-intl" value for param `moduleSourceName`

#### Options

- **`cleanUpUnusedMessages`**: When active, unused message descriptors will be removed from extracted and lang files. Note: extracted file should be removed before enabling this option

- **`extractedFile`**: The target location where the plugin will output a descriptors for each component from which React Intl messages were extracted. Default: "./src/translations/aggregated.json"

- **`langFiles`**: The target location where the plugin will output a messages (Object.<id, string>) for each component from which React Intl messages were extracted. Default: [{ path: "./src/translations/en.json", cleanUpNewMessages: true }, { path: "./src/translations/ru.json", cleanUpNewMessages: false }]

### If you use [babel-plugin-react-intl-auto](https://github.com/akameco/babel-plugin-react-intl-auto)
You must use plugins in that order:
1. babel-plugin-react-intl-auto
2. babel-plugin-react-intl
3. babel-plugin-react-intl-extractor
