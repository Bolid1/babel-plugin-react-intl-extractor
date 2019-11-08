import fs from 'fs'
import path from 'path'

export default function (...args) {
  const [, pluginOptions] = args
  const options = Object.assign(
    {
      extractedFile: './src/translations/aggregated.json',
      cleanUpUnusedMessages: false,
      langFiles: [
        {path: './src/translations/ru.json', cleanUpNewMessages: false},
        {path: './src/translations/en.json', cleanUpNewMessages: true},
      ],
    },
    pluginOptions,
  )

  /**
   * @param {{id: string}} list
   * @param {string} id
   * @returns {Object.<string, string>}
   */
  function findById (list, id) {
    return list.find((el) => el.id === id)
  }

  /**
   * @param {{id: string}} a
   * @param {{id: string}} b
   * @returns {{id: string}[]}
   */
  function sortById (a, b) {
    return (a.id < b.id) ? -1 : (a.id > b.id ? 1 : 0)
  }

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
   * @param {string} filename
   * @param {boolean} cleanUpUnusedMessages
   *
   * @returns {{id: string}[]}
   */
  function mergeDescriptors(cleanUpUnusedMessages, existing, descriptors, filename) {
    if (!cleanUpUnusedMessages) {
      return existing
        // Remove from existing all messages with id, that used in descriptors
        .filter((descriptor) => !findById(descriptors, descriptor.id))
        // Merge with new descriptors array
        .concat(descriptors)
        .sort(sortById)
    }

    return existing
      .map((descriptor) => {
        return Object.assign(descriptor, {
          files: descriptor.files
            // Removed incoming filename from existing descriptors
            .filter((file) => file !== filename)
            // Add incoming filename to existing descriptors
            .concat(findById(descriptors, descriptor.id) ? [filename] : []),
        })
      })
      // Remove unused descriptors
      .filter((descriptor) => descriptor.files.length > 0)
      // Add new descriptors
      .concat(descriptors.filter((descriptor) => !findById(existing, descriptor.id)))
      // Sort descriptors
      .sort(sortById)
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
      const filename = path.relative(process.cwd(), file.opts.filename)

      if (!file.metadata['react-intl']?.messages?.length) {
        return
      }

      const descriptors = file.metadata['react-intl'].messages
      if (!Array.isArray(descriptors)) {
        return
      }

      const existingDescriptors = getTargetFileContent()
      const descriptorsWithFiles = descriptors.map((descriptor) => Object.assign(descriptor, { files: [filename] }))
      const resultDescriptors = mergeDescriptors(options.cleanUpUnusedMessages, existingDescriptors, descriptorsWithFiles, filename)

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
        const usedMessages = {}

        if (options.cleanUpUnusedMessages) {
          const usedKeys = Object.keys(resultMessages).filter((message) => findById(resultDescriptors, message))
          usedKeys.forEach((key) => {
            usedMessages[key] = resultMessages[key]
          })
        }

        fs.writeFileSync(path, JSON.stringify(options.cleanUpUnusedMessages ? usedMessages : resultMessages, null, 2))
      })
    },
  }
}
