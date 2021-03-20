import * as core from '@actions/core'
import {exec} from '@actions/exec'
import {ExecOptions} from '@actions/exec/lib/interfaces'
import * as child from 'child_process'
import {ALLURECTL_PID, INPUT_RESULTS, INPUT_TIMEOUT} from './constants'
import * as fs from 'fs'

async function run(): Promise<void> {
  try {
    const testPlanJson = './testplan.json'
    const execOpts: ExecOptions = {
      listeners: {
        debug: data => core.setOutput('debug', data),
        errline: data => core.setOutput('errline', data),
        stdline: data => core.setOutput('stdline', data),
        stderr: data => core.setOutput('stderr', data),
        stdout: data => core.setOutput('stdout', data)
      }
    }

    core.startGroup('allurectl job-run start')
    await exec('allurectl job-run start', [], execOpts)
    core.endGroup()

    core.startGroup('allurectl job-run plan')
    await exec('allurectl job-run plan --output-file', [testPlanJson], execOpts)
    core.endGroup()

    core.startGroup('allurectl upload')

    const sout = fs.openSync('./out.log', 'a')
    const serr = fs.openSync('./out.log', 'a')

    const allureResults = core.getInput(INPUT_RESULTS, {required: true})
    const timeout = core.getInput(INPUT_TIMEOUT, {required: true})
    // can't use exec https://github.com/actions/toolkit/issues/461.
    const cp = child.spawn(
      'allurectl',
      ['upload', '--job-run-child', '--timeout', timeout, allureResults],
      {
        stdio: ['ignore', sout, serr],
        detached: true
      }
    )

    core.saveState(ALLURECTL_PID, cp.pid)
    cp.unref()

    core.endGroup()
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
