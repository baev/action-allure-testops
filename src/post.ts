import * as core from '@actions/core'
import {exec} from '@actions/exec'
import {ExecOptions} from '@actions/exec/lib/interfaces'

async function run(): Promise<void> {
  try {
    const execOpts: ExecOptions = {
      listeners: {
        debug: data => core.setOutput('debug', data),
        errline: data => core.setOutput('errline', data),
        stdline: data => core.setOutput('stdline', data),
        stderr: data => core.setOutput('stderr', data),
        stdout: data => core.setOutput('stdout', data)
      }
    }

    core.startGroup('pkill allurectl')
    await exec('pkill allurectl', [], {...execOpts, ignoreReturnCode: true})
    core.endGroup()

    core.startGroup('allurectl job-run stop')
    await exec('allurectl job-run stop', [], execOpts)
    core.endGroup()
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
