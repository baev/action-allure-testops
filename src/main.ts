import * as core from '@actions/core'
import {exec} from '@actions/exec'
import {ExecOptions} from '@actions/exec/lib/interfaces'
import * as child from 'child_process'
import {ALLURECTL_PID} from './constants'
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

    // can't use exec https://github.com/actions/toolkit/issues/461.
    const cp = child.spawn(
      'allurectl',
      ['upload', '--job-run-child', '--timeout', '1800', '.'],
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
