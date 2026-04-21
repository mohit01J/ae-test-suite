import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter'
import fs from 'fs'

const TC_MAP = JSON.parse(fs.readFileSync('tc-map.json', 'utf8'))
const PROJECT = process.env.BSTACK_PROJECT_ID
const TEST_RUN = process.env.BSTACK_TEST_RUN_ID
const USER = process.env.BROWSERSTACK_USERNAME
const KEY = process.env.BROWSERSTACK_ACCESS_KEY
const AUTH = Buffer.from(`${USER}:${KEY}`).toString('base64')

class BStackReporter implements Reporter {
    async onTestEnd(test: TestCase, result: TestResult) {
        const specFile = test.location.file
            .replace(process.cwd(), '').replace(/\\/g, '/').replace(/^\//, '')
        const tcId = TC_MAP[specFile]
        if (!tcId || !PROJECT || !TEST_RUN) return

        const status = result.status === 'passed' ? 'passed'
            : result.status === 'failed' ? 'failed' : 'skipped'

        await fetch(
            `https://test-management.browserstack.com/api/v2/projects/${PROJECT}/test-runs/${TEST_RUN}/results`,
            {
                method: 'POST',
                headers: { 'Authorization': `Basic ${AUTH}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    test_results: [{
                        test_case_id: tcId,
                        status,
                        remarks: result.error?.message?.slice(0, 200) ?? 'Automated run'
                    }]
                })
            }
        )
        console.log(`BStack TM → ${tcId}: ${status}`)
    }
}
export default BStackReporter