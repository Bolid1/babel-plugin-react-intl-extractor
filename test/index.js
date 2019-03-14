import * as babel from '@babel/core'
import fs from 'fs'
import * as path from 'path'
import * as tape from 'tape'
import plugin from '../src/index'

// eslint-disable-next-line no-undef
const fixturesDir = path.join(__dirname, 'fixtures')

function trim (str) {
  return str.toString().replace(/^\s+|\s+$/, '')
}

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

tape.test('it should respect paths', (t) => {
  const fixtureDir = path.join(fixturesDir, 'main')
  const extractedFile = path.join(fixtureDir, 'actual.json')
  const langFile = path.join(fixtureDir, 'en.actual.json')

  const actual = transform(path.join(fixtureDir, 'actual.js'), {
    extractedFile: extractedFile,
    langFiles: [
      {
        path: langFile,
      },
    ],
  })
  const expected = fs.readFileSync(path.join(fixtureDir, 'expected.js'))
  t.equal(trim(actual), trim(expected), 'transform must be completed')
  t.true(fs.existsSync(extractedFile), 'The extractedFile should exist')

  const actualExtracted = fs.readFileSync(extractedFile)
  const expectedExtracted = fs.readFileSync(path.join(fixtureDir, 'expected.json'))
  t.equal(trim(actualExtracted), trim(expectedExtracted), 'The extracted file must contain messages')

  const actualLang = fs.readFileSync(langFile)
  const expectedLang = fs.readFileSync(path.join(fixtureDir, 'en.expected.json'))
  t.equal(trim(actualLang), trim(expectedLang), 'The lang file must contain messages')
  t.end()
})
