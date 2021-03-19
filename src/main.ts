import * as core from '@actions/core'
import {exec} from '@actions/exec'
import {ExecOptions} from '@actions/exec/lib/interfaces'

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

    // https://github.com/actions/toolkit/issues/461.
    await exec(
      `bin/bash -c "allurectl upload --job-run-child --timeout 1800 build/allure-results &"`,
      [],
      execOpts
    )

    core.endGroup()
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
