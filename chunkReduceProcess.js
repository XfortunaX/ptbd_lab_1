const fs = require('fs')
const redis = require('redis')

const { CHUNKS_MAP_DIR } = require('./general')

const client = redis.createClient()

let processNum = null

function chunkReduce(filePath, numChunk) {
  const readStream = fs.createReadStream(filePath)
  let buf
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
    readStream.destroy()

    totalWords = buf.toString().split('\n')

    const redisReq = totalWords.map((wordNum) => {
      return ['incrby', ...wordNum.split('=')]
    })

    client
      .batch(redisReq)
      .exec((_err, _replies) => {
        if (process && process.send) {
          process.send({
            process: processNum,
            chunk: numChunk,
          })
        }
      })
  })

  readStream.once('error', (err) => {
    console.log('error', err)
  })
}

process.on('message', (numChunk) => {
  chunkReduce(CHUNKS_MAP_DIR + `/chunk_${numChunk}_stat.txt`, numChunk)
})

if (process.argv.length > 2) {
  const firstArg = process.argv.pop()
  processNum = firstArg
  console.log(`This process is pid ${process.pid}, process ${processNum}`)

  client.on("connect", function() {
    console.log('Connect to redis')
  })

  client.on("error", function(error) {
    console.error(error)
  })
}
