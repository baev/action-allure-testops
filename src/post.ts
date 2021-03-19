import * as core from '@actions/core'
import {exec} from '@actions/exec'

async function run(): Promise<void> {
  try {
    await exec('pkill allurectl')
    await exec('allurectl job-run stop')
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
