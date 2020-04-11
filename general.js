const fs = require('fs')

const ALPHABET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
const MIN_LENGTH = 3
const MAX_LENGTH = 6

const B_IN_KB = 1024
const KB_IN_MB = 1024
const MB_IN_GB = 1024

const SIZE_BYTE = 100 * KB_IN_MB * MB_IN_GB
const HEAP_LIMIT = 1 * B_IN_KB * KB_IN_MB * MB_IN_GB
const GARBAGE_TIMEOUT = 30000
const SIZE_BATCH = 64 * B_IN_KB
const CHUNK_SIZE = B_IN_KB * KB_IN_MB
const MAX_PROCESS = 4

const DIST_DIR = './dist/words_example_1'
const CHUNKS_DIR = DIST_DIR + '/chunks'
const CHUNKS_MAP_DIR = DIST_DIR + '/chunks_map'
const SRC_FILE = 'words.txt'
const CHUNK_STATS_FILE = './chunkStats.js'
const RESULT_FILE = 'result.txt'

function printSize(sizeByte) {
  if (sizeByte < B_IN_KB) {
    return sizeByte + ' b'
  } else if (sizeByte < B_IN_KB * KB_IN_MB) {
    return Math.floor(sizeByte / B_IN_KB * 1000) / 1000 + ' kb'
  } else if (sizeByte < B_IN_KB * KB_IN_MB * MB_IN_GB) {
    return Math.floor(sizeByte / B_IN_KB / KB_IN_MB * 1000) / 1000 + ' Mb'
  } else {
    return Math.floor(sizeByte / B_IN_KB / KB_IN_MB / MB_IN_GB * 1000) / 1000 + ' Gb'
  }
}

function printTime(time) {
  if (time < 60) {
    return time + ' s'
  } else if (time < 60 * 60) {
    return Math.floor(time / 60) + ' m '
      + Math.floor((time - Math.floor(time / 60) * 60) * 1000) / 1000  + ' s'
  } else {
    return Math.floor(time / 60 / 60) + ' h '
      + Math.floor((time / 60 - Math.floor(time / 60)) * 1000) / 1000 * 60 + ' m '
      + Math.floor((time - Math.floor(time / 60 / 60) * 60 * 60 - Math.floor(time / 60) * 60) * 1000) / 1000 + ' s '
  }
}

function createDir(dir) {
  fs.mkdirSync(dir, { recursive: true })
}

function checkDir(dir) {
  return fs.existsSync(dir)
}

module.exports = {
  ALPHABET,
  MIN_LENGTH,
  MAX_LENGTH,
  B_IN_KB,
  KB_IN_MB,
  MB_IN_GB,
  SIZE_BYTE,
  HEAP_LIMIT,
  GARBAGE_TIMEOUT,
  SIZE_BATCH,
  CHUNK_SIZE,
  DIST_DIR,
  CHUNKS_DIR,
  SRC_FILE,
  CHUNK_STATS_FILE,
  CHUNKS_MAP_DIR,
  RESULT_FILE,
  MAX_PROCESS,
  printSize,
  printTime,
  createDir,
  checkDir,
}
