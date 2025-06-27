#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { ServerHTMLJSONConverter } from 'html-json-converter/server'

async function main() {
  const converter = new ServerHTMLJSONConverter()
  const htmlDir = path.join(process.cwd(), 'html')
  const files = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'))
  const results = {}

  for (const file of files) {
    const htmlPath = path.join(htmlDir, file)
    const html = fs.readFileSync(htmlPath, 'utf8')
    results[file] = converter.toJSON(html)
  }

  fs.writeFileSync('output.json', JSON.stringify(results, null, 2))
  console.log('✅ output.json created with', files.length, 'files.')
}

main().catch(e => {
  console.error('❌ Error:', e)
  process.exit(1)
})
