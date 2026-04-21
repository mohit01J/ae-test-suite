import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'

const PR_TITLE = process.env.PR_TITLE ?? ''
const PR_BODY = process.env.PR_BODY ?? ''
const CHANGED_FILES = process.env.CHANGED_FILES ?? ''

function getAllSpecs(dir: string): string[] {
    const results: string[] = []
    if (!fs.existsSync(dir)) return results
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) results.push(...getAllSpecs(full))
        else if (entry.name.endsWith('.spec.ts')) {
            results.push(full.replace(/\\/g, '/'))
        }
    }
    return results
}

async function main() {
    const allSpecs = getAllSpecs('tests')
    console.log('All specs found:')
    allSpecs.forEach(s => console.log(`  ${s}`))

    if (allSpecs.length === 0) {
        console.log('No spec files found — check tests/ folder exists')
        fs.writeFileSync('selected-tests.json', '[]')
        return
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [{
            role: 'user',
            content: `You are a QA smart regression engine.

A developer opened a PR. Decide which Playwright tests to run.

PR TITLE: ${PR_TITLE}
PR DESCRIPTION: ${PR_BODY}
CHANGED FILES IN DEV REPO: ${CHANGED_FILES}

AVAILABLE TEST FILES:
${allSpecs.join('\n')}

MAPPING RULES:
- "auth" or "login" in PR or changed files → select all tests/auth/ specs
- "checkout" or "cart" or "discount" in PR or changed files → select all tests/checkout/ specs
- "payment" in PR or changed files → select all tests/payment/ specs
- If changed file contains "loginController" → run auth tests
- If changed file contains "checkoutController" → run checkout tests
- Never select ALL tests unless every area is mentioned
- Respond ONLY with a valid JSON array of file paths, nothing else
- Example: ["tests/auth/login-valid.spec.ts"]`
        }]
    })

    const raw = response.content[0].type === 'text'
        ? response.content[0].text.trim()
        : '[]'

    console.log('\nClaude raw response:', raw)

    let selected: string[] = []
    try {
        // strip any markdown code fences Claude might add
        const clean = raw.replace(/```json|```/g, '').trim()
        selected = JSON.parse(clean)
    } catch (e) {
        console.log('Parse error — falling back to all specs')
        selected = allSpecs
    }

    console.log(`\nClaude selected ${selected.length} tests:`)
    selected.forEach(t => console.log(`  → ${t}`))

    fs.writeFileSync('selected-tests.json', JSON.stringify(selected, null, 2))
    console.log('\nWritten to selected-tests.json')
}

main().catch(err => {
    console.error('Filter script error:', err)
    process.exit(1)
})