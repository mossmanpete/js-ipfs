'use strict'

const multibase = require('multibase')
const { print, rightpad } = require('../utils')
const { cidToString } = require('../../utils/cid')

module.exports = {
  command: 'ls <key>',

  describe: 'List files for the given directory',

  builder: {
    v: {
      alias: 'headers',
      desc: 'Print table headers (Hash, Size, Name).',
      type: 'boolean',
      default: false
    },
    r: {
      alias: 'recursive',
      desc: 'List subdirectories recursively',
      type: 'boolean',
      default: false
    },
    'resolve-type': {
      desc: 'Resolve linked objects to find out their types. (not implemented yet)',
      type: 'boolean',
      default: false // should be true when implemented
    },
    'cid-base': {
      describe: 'Number base to display CIDs in.',
      type: 'string',
      choices: multibase.names
    }
  },

  handler ({ ipfs, key, recursive, headers, cidBase }) {
    ipfs.ls(key, { recursive }, (err, links) => {
      if (err) {
        throw err
      }

      links = links.map(file => Object.assign(file, { hash: cidToString(file.hash, { base: cidBase }) }))

      if (headers) {
        links = [{ hash: 'Hash', size: 'Size', name: 'Name' }].concat(links)
      }

      const multihashWidth = Math.max.apply(null, links.map((file) => file.hash.length))
      const sizeWidth = Math.max.apply(null, links.map((file) => String(file.size).length))

      let pathParts = key.split('/')

      if (key.startsWith('/ipfs/')) {
        pathParts = pathParts.slice(2)
      }

      links.forEach(link => {
        const fileName = link.type === 'dir' ? `${link.name || ''}/` : link.name
        const padding = link.depth - pathParts.length
        print(
          rightpad(link.hash, multihashWidth + 1) +
          rightpad(link.size || '', sizeWidth + 1) +
          '  '.repeat(padding) + fileName
        )
      })
    })
  }
}
