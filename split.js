const fs = require('fs')
const {
  DIST_DIR, SRC_FILE, CHUNK_SIZE, CHUNKS_DIR,
  printTime, checkDir, createDir
} = require('./general')

let startTime = Date.now()

function splitWords() {
  if (!checkDir(CHUNKS_DIR)) {
    createDir(CHUNKS_DIR)
  }

  console.log('Split START!')

  let chunkNum = 1
  let chunkFile = 0

  const readStream = fs.createReadStream(DIST_DIR + '/' + SRC_FILE)
  let writeStream = fs.createWriteStream(CHUNKS_DIR + `/chunk_${chunkNum}.txt`)

  readStream.on('readable', () => {
    let chunk
    while (null !== (chunk = readStream.read())) {}
  });

  readStream.on('data', (chunk) => {
    if (chunkFile === 0) {
      chunkFile = chunk
    } else {
      chunkFile += chunk
    }

    if (chunkFile.length >= CHUNK_SIZE) {
      const words = chunk.toString().split('\n')
      const rest = words.pop()
      chunkFile = Buffer.from(rest)
      chunkNum += 1

      writeStream.end(words.join('\n'), 'utf8')
      writeStream = fs.createWriteStream(CHUNKS_DIR + `/chunk_${chunkNum}.txt`)
      writeStream.write(rest, 'utf8')

      console.log(
        `Chunk ${chunkNum} was created`,
        '  Time spent:', printTime((Date.now() - startTime) / 1000),
      )
    } else {
      writeStream.write(chunk, 'utf8')
    }
  })

  readStream.once('end', () => {
    console.log('Split FINISHED!', ' Total time spent:', printTime((Date.now() - startTime) / 1000))
  })

  readStream.once('error', (err) => {
    console.log('error', err)
  })
}

splitWords()
