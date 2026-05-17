import fs from 'fs'
import path from 'path'

const manifestPath = path.join(process.cwd(), 'public', 'manifest.json')

describe('PWA manifest', () => {
  let manifest: Record<string, unknown>

  beforeAll(() => {
    const raw = fs.readFileSync(manifestPath, 'utf-8')
    manifest = JSON.parse(raw)
  })

  it('manifest.json exists in public/', () => {
    expect(fs.existsSync(manifestPath)).toBe(true)
  })

  it('has required name field', () => {
    expect(manifest.name).toBeTruthy()
  })

  it('has short_name field', () => {
    expect(manifest.short_name).toBeTruthy()
  })

  it('has start_url field', () => {
    expect(manifest.start_url).toBeTruthy()
  })

  it('has display field set to standalone or fullscreen', () => {
    expect(['standalone', 'fullscreen']).toContain(manifest.display)
  })

  it('has background_color', () => {
    expect(manifest.background_color).toBeTruthy()
  })

  it('has theme_color', () => {
    expect(manifest.theme_color).toBeTruthy()
  })

  it('has icons array with at least one entry', () => {
    expect(Array.isArray(manifest.icons)).toBe(true)
    expect((manifest.icons as unknown[]).length).toBeGreaterThan(0)
  })

  it('icons have src and sizes fields', () => {
    const icons = manifest.icons as Array<Record<string, string>>
    icons.forEach((icon) => {
      expect(icon.src).toBeTruthy()
      expect(icon.sizes).toBeTruthy()
    })
  })
})
