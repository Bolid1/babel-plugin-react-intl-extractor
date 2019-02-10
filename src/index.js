import fs from 'fs'

export default function (pluginOptions) {
  const options = Object.assign(
    {
      extractedFile: './src/translations/aggregated.json',
      langFiles: [
        {path: './src/translations/ru.json', cleanUpNewMessages: false},
        {path: './src/translations/en.json', cleanUpNewMessages: true},
      ],
    },
    pluginOptions,
  )

  /**
   * @returns {Array}
   */
  function getTargetFileContent () {
    const doesFileExists = fs.existsSync(options.extractedFile)

    if (!doesFileExists) {
      return []
    }

    const result = JSON.parse(fs.readFileSync(options.extractedFile))

    return Array.isArray(result) ? result : []
  }

  /**
   * @returns {Object.<string, string>}
   */
  function getTargetLangFileContent (path) {
    const doesFileExists = fs.existsSync(path)

    if (!doesFileExists) {
      return {}
    }

    return Object.assign({}, JSON.parse(fs.readFileSync(path)))
  }

  /**
   * @param {{id: string}[]} existing
   * @param {{id: string}[]} descriptors
   *
   * @returns {{id: string}[]}
   */
  function mergeDescriptors (existing, descriptors) {
    return existing
      .concat(descriptors)
      .filter((descriptor, i, a) => a.findIndex(({id}) => id === descriptor.id) === i)
      .sort((a, b) => {
        return (a.id < b.id) ? -1 : (a.id > b.id ? 1 : 0)
      })
  }

  function mergeMessages (cleanUpNewMessages, oldMessages, newMessages) {
    if (!cleanUpNewMessages) {
      return Object.assign(oldMessages, newMessages)
    }

    const result = Object.assign({}, oldMessages)

    Object
      .keys(newMessages)
      .forEach(
        (id) => {
          if (!result[id]) {
            result[id] = ''
          }
        },
      )

    return result
  }

  return {
    post: function (file) {
      if (!file.metadata['react-intl']?.messages?.length) {
        return
      }

      const descriptors = file.metadata['react-intl'].messages
      if (!Array.isArray(descriptors)) {
        return
      }

      const existingDescriptors = getTargetFileContent()
      const resultDescriptors = mergeDescriptors(existingDescriptors, descriptors)

      if (!resultDescriptors?.length) {
        return
      }

      fs.writeFileSync(options.extractedFile, JSON.stringify(resultDescriptors, null, 2))

      const messages = {}
      resultDescriptors.forEach(({id, defaultMessage}) => {
        messages[id] = defaultMessage || ''
      })

      options.langFiles.forEach(({path, cleanUpNewMessages}) => {
        const resultMessages = mergeMessages(cleanUpNewMessages, getTargetLangFileContent(path), messages)

        fs.writeFileSync(path, JSON.stringify(resultMessages, null, 2))
      })
    },
  }
}
