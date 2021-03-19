import * as core from '@actions/core'
import {exec} from '@actions/exec'
import {ExecOptions} from '@actions/exec/lib/interfaces'
import {ALLURECTL_PID} from './constants'

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

    const state = core.getState(ALLURECTL_PID)

    core.startGroup('check allurectl upload')
    core.info(`allurectl upload pid ${state}`)
    await exec('ps', ['-p', state], {...execOpts, ignoreReturnCode: true})
    core.endGroup()

    core.startGroup('shut down allurectl upload')
    await exec('kill', ['-3', state], {...execOpts, ignoreReturnCode: true})
    core.endGroup()

    core.startGroup('allurectl upload')
    await exec('allurectl upload --job-run-child build/allure-results')
    core.endGroup()

    core.startGroup('allurectl job-run stop')
    await exec('allurectl job-run stop', [], execOpts)
    core.endGroup()
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
