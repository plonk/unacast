import log from 'electron-log';
import { spawn, ChildProcess } from 'child_process';
const player = require('node-wav-player')

class MoeGoe {
  constructor() {
  }

  private process : ChildProcess | null = null;
  private queue : string[] = [];

  initialize() {
    log.debug('spawning moegoe')
    this.process = spawn("C:\\Users\\plonk\\Desktop\\MoeGoe\\MoeGoe.exe", [], { env: { PYTHONUTF8: '1' } })
    this.process.stdout?.on('data', (data) => {
      log.debug(data?.toString())
    });
    this.process.stderr?.on('data', (data) => {
      log.error(data?.toString())
    });
    const instructions = "C:\\Users\\plonk\\Downloads\\1158_epochs.pth\r\n" + 
      "C:\\Users\\plonk\\Downloads\\config.json\r\n"
    this.process.stdin?.write(instructions)
  }

  async speakAsync(message: string) {
    if (this.process === null)
      throw new Error("process uninitialized");

    message = message.replace(/<br\/>/g, ' ')

    if (this.queue.length > 0) {
      this.queue.push(message)
    } else {
      this.queue.push(message)
log.debug(`speakAsync: ${message}`)
      while (this.queue.length > 0) {
        const message = this.queue.pop()
log.debug(`popped : ${message }`)
        this.process.stdin?.write(
          "t\r\n" +
          `${message}\r\n` + 
            "0\r\n" + 
            "out.wav\r\n" +
            "y\r\n"
        )
        await new Promise<void>((resolve) => {
          const callback = (data: Buffer) => {
            if (data.toString().match(/Successfully saved!/)) {
              player.play({ path: './out.wav', sync: true })
              this.process?.stdout?.removeListener('data', callback)
              resolve()
            }
          }
          this.process?.stdout?.on('data', callback)
        })
      }
    }
  }
}

export default MoeGoe;
