const fs = require('fs')
const {
  DIST_DIR, SIZE_BYTE, MIN_LENGTH, MAX_LENGTH, ALPHABET, SIZE_BATCH, HEAP_LIMIT, SRC_FILE, GARBAGE_TIMEOUT,
  printTime, printSize, checkDir, createDir
} = require('./general')

let size = 0
let progress = 0
let progressDiffLog = 1
let startTime = Date.now()
let length = 0
let word = ''
let wordBatch = ''
let garbageActive = false

function wordLength(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function generateWord(alphabet, length) {
  let word = ''

  for (let i = 0; i < length; i += 1) {
    word += alphabet[Math.floor(Math.random() * alphabet.length)]
  }

  return word
}

function generateWords() {
  if (!checkDir(DIST_DIR)) {
    createDir(DIST_DIR)
  }

  const writeStream = fs.createWriteStream(DIST_DIR + '/' + SRC_FILE)

  console.log('Words generated START!')

  writeStream.once('close', () => {
    console.log('Words generated FINISHED!', ' Total time spent:', printTime((Date.now() - startTime) / 1000))
  })

  writeStream.once('drain', () => write(writeStream))

  write(writeStream)
}

function write(writeStream) {
  while(size < SIZE_BYTE) {
    length = wordLength(MIN_LENGTH, MAX_LENGTH)
    word = generateWord(ALPHABET, length) + '\n'
    size += length + 1
    wordBatch += word

    if (size >= SIZE_BYTE) {
      wordBatch = wordBatch.slice(0, wordBatch.length - 1)
      writeStream.end(wordBatch)
    } else if (wordBatch.length >= SIZE_BATCH) {
      writeStream.write(wordBatch, 'utf8')
      wordBatch = ''

      if (progress + progressDiffLog <= Math.floor(size / SIZE_BYTE * 1000) / 10) {
        const memoryUsage = process.memoryUsage().rss
        progress = Math.floor(size / SIZE_BYTE * 1000) / 10

        console.log(
          'Progress:', progress + ' %, ',
          '  Time spent:', printTime((Date.now() - startTime) / 1000),
          '  Memory usage:', printSize(memoryUsage)
        )

        if (memoryUsage > HEAP_LIMIT) {
          break
        }
      }
    }
  }

  if (size < SIZE_BYTE) {
    if (!garbageActive) {
      garbageActive = true

      if (global && global.gc) {
        global.gc()
        setTimeout(() => {
          write(writeStream)
        }, 1000)
      } else {
        setTimeout(() => {
          write(writeStream)
        }, 5000)
      }

      setTimeout(() => {
        garbageActive = false
      }, GARBAGE_TIMEOUT)
    } else {
      write(writeStream)
    }
  }
}

generateWords()
