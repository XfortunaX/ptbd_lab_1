const fs = require('fs')
const { fork } = require('child_process')

const { CHUNKS_DIR, MAX_PROCESS, printTime } = require('./general')

let analysedChunk = []
let completeChunkAnalyse = 0
let numChunks = 0
let startTime = Date.now()
const processes = {}
const processState = {}

async function chunksMap () {
  console.log('Chunks map START!')

  const files = fs.readdirSync(CHUNKS_DIR)
  numChunks = files.length

  for (let i = 1; i < numChunks + 1; i += 1) {
    analysedChunk.push(i)
  }

  console.log(numChunks, analysedChunk[analysedChunk.length - 1])

  for (let i = 0; i < MAX_PROCESS; i += 1) {
    const subprocess = fork('./chunkStatsProcess.js', [i.toString()])

    subprocess.on('message', (data) => {
      console.log('Chunk:', data.chunk, 'Time spent:', printTime((Date.now() - startTime) / 1000))

      completeChunkAnalyse += 1
      processState[`${data.process}`] = false

      if (completeChunkAnalyse === numChunks) {
        console.log('Chunks map FINISHED', '   Total time spent:', printTime((Date.now() - startTime) / 1000))
        for (let proc in processes) {
          processes[proc].kill()
        }
        process.exit()
      } else {
        chunkProcess(analysedChunk.shift())
      }
    })

    subprocess.on('error', () => {
      console.log('error')
    })

    processes[i.toString()] = subprocess
    processState[i.toString()] = false
  }

  chunkProcess(analysedChunk.shift())
}

function getNotBusy() {
  for (const proc in processState) {
    if (processState[proc] === false) {
      return proc
    }
  }

  return null
}

function chunkProcess(numChunk) {
  if (numChunk) {
    setTimeout(() => {
      chunkAnalyse(numChunk)

      if (getNotBusy()) {
        chunkProcess(analysedChunk.shift())
      }
    }, 10)
  }
}

function chunkAnalyse(numChunk) {
  if (!numChunk || numChunk > numChunks) {
    return
  }

  const freeProcess = getNotBusy()

  if (freeProcess && numChunk) {
    processState[freeProcess] = true
    processes[freeProcess].send(numChunk.toString())
  } else if (numChunk) {
    setTimeout(() => {
      chunkAnalyse(numChunk)
    }, 100)
  }
}

chunksMap()
