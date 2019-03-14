import * as babel from '@babel/core'
import * as path from 'path'
import * as tape from 'tape'
import plugin from '../src/index'

// eslint-disable-next-line no-undef
const fixturesDir = path.join(__dirname, 'fixtures')

function transform (filePath, options = {}) {
  function getPluginConfig () {
    return [plugin, {
      ...options,
    }]
  }

  return babel.transformFileSync(filePath, {
    plugins: [
      'react-intl',
      getPluginConfig(),
    ],
  }).code
}

tape.test('it should accept extractedFile path', (t) => {
  const fixtureDir = path.join(fixturesDir, 'main')

  transform(path.join(fixtureDir, 'actual.js'), {
    extractedFile: path.join(fixtureDir, 'aggregated.json'),
    langFiles: [
      {
        path: path.join(fixtureDir, 'en.json'),
      },
      {
        path: path.join(fixtureDir, 'it.json'),
      },
    ],
  })
})
