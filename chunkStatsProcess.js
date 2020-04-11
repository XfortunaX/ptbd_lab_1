const fs = require('fs')

const { CHUNKS_DIR, CHUNKS_MAP_DIR, SIZE_BATCH, checkDir, createDir } = require('./general')

let processNum = null

function chunkStat(filePath, numChunk) {
  const readStream = fs.createReadStream(filePath)
  let buf = ''
  const fileStat = new Map()
  let totalWords = []

  readStream.on('readable', () => {
    let chunk
    while (null !== (chunk = readStream.read())) {}
  });

  readStream.on('data', (chunk) => {
    if (buf) {
      buf += chunk
    } else {
      buf = chunk
    }
  })

  readStream.once('end', () => {
    if (buf) {
      totalWords = buf.toString().split('\n')
    }
    readStream.destroy()

    if (totalWords.length > 0) {
      if (!checkDir(CHUNKS_MAP_DIR)) {
        createDir(CHUNKS_MAP_DIR)
      }

      totalWords.forEach((word) => {
        if (fileStat.has(word)) {
          fileStat.set(word, fileStat.get(word) + 1)
        } else {
          fileStat.set(word, 1)
        }
      })

      createChunkFileStat(
        CHUNKS_MAP_DIR + `/chunk_${numChunk}_stat.txt`,
        fileStat,
        numChunk,
      )
    }
  })

  readStream.once('error', (err) => {
    console.log('error', err)
  })
}

function createChunkFileStat(fileName, data, numChunk) {
  const writeStream = fs.createWriteStream(fileName)
  let batch = ''

  writeStream.once('close', () => {
    if (process && process.send) {
      process.send({
        process: processNum,
        chunk: numChunk,
      })
    }
  })

  for (const [key, value] of data) {
    batch += `${key}=${value}\n`

    if (batch.length > SIZE_BATCH) {
      writeStream.write(batch, 'utf8')
      batch = ''
    }
  }

  writeStream.end(batch, 'utf8')
}

process.on('message', (numChunk) => {
  chunkStat(CHUNKS_DIR + `/chunk_${numChunk}.txt`, numChunk)
})

if (process.argv.length > 2) {
  processNum = process.argv.pop()
  console.log(`This process is pid ${process.pid}, process ${processNum}`)
}
