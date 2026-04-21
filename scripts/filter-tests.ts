import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'

const PR_TITLE = process.env.PR_TITLE ?? ''
const PR_BODY = process.env.PR_BODY ?? ''
const CHANGED_FILES = process.env.CHANGED_FILES ?? ''

// Discover all spec files automatically from your tests/ folder
function getAllSpecs(dir: string): string[] {
    const results: string[] = []
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) results.push(...getAllSpecs(full))
        else if (entry.name.endsWith('.spec.ts')) results.push(full.replace(/\\/g, '/'))
    }
    return results
}
const allSpecs = getAllSpecs('tests')
console.log('All specs found:', allSpecs)

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
- "auth" or "login" in PR or changed files → include tests/auth/login-valid.spec.ts AND tests/auth/login-invalid.spec.ts
- "checkout" or "cart" in PR or changed files → include tests/cart/ specs when they exist
- "payment" in PR or changed files → include payment specs when they exist
- If changed file is "loginController.js" → run auth tests
- If changed file is "checkoutController.js" → run checkout + payment tests

Respond ONLY with a valid JSON array of file paths. No explanation.
Example: ["tests/auth/login-valid.spec.ts","tests/auth/login-invalid.spec.ts"]`
    }]
})

const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : '[]'
const selected: string[] = JSON.parse(raw)

console.log(`\nClaude selected ${selected.length} tests:`)
selected.forEach(t => console.log(`  → ${t}`))

fs.mkdirSync('scripts', { recursive: true })
fs.writeFileSync('selected-tests.json', JSON.stringify(selected, null, 2))
console.log('\nWritten to selected-tests.json')