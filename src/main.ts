import * as core from '@actions/core'
import {exec} from '@actions/exec'

async function run(): Promise<void> {
  try {
    const testPlanJson = './testplan.json'
    await exec('allurectl job-run start')
    await exec('allurectl job-run plan --output-file', [testPlanJson])
    await exec(
      'allurectl upload --job-run-child --timeout 1800 target/allure-results & echo "upload started"'
    )
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
