import {
  detectInAppBrowser,
  detectOS,
} from '@/utils/detectInAppBrowser'

describe('detectInAppBrowser', () => {
  it('retorna null pra UA vazio ou nulo', () => {
    expect(detectInAppBrowser('')).toBeNull()
    expect(detectInAppBrowser(null)).toBeNull()
    expect(detectInAppBrowser(undefined)).toBeNull()
  })

  it('detecta WhatsApp', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WhatsApp/24.6.81'
    expect(detectInAppBrowser(ua)).toEqual({
      app: 'whatsapp',
      label: 'WhatsApp',
    })
  })

  it('detecta Instagram', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 14; SM-S918B Build/UP1A.231005.007) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/126.0.6478.71 Mobile Safari/537.36 Instagram 335.0.0.36.105 Android'
    expect(detectInAppBrowser(ua)).toEqual({
      app: 'instagram',
      label: 'Instagram',
    })
  })

  it('detecta Facebook (iOS)', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/463.0.0.45.116;...]'
    const result = detectInAppBrowser(ua)
    expect(result?.app).toBe('facebook')
    expect(result?.label).toBe('Facebook')
  })

  it('detecta Facebook (Android, FB_IAB sem messenger)', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 ... [FB_IAB/FB4A;FBAV/463.0.0.41.116;]'
    expect(detectInAppBrowser(ua)?.app).toBe('facebook')
  })

  it('detecta Messenger antes do Facebook (regex priority)', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 [FB_IAB/MESSENGER;FBAV/463.0.0.41.116;]'
    expect(detectInAppBrowser(ua)?.app).toBe('messenger')
  })

  it('detecta TikTok', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 ... TikTok 32.0.0'
    expect(detectInAppBrowser(ua)?.app).toBe('tiktok')

    const ua2 =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit ... musical_ly_32.0.0'
    expect(detectInAppBrowser(ua2)?.app).toBe('tiktok')
  })

  it('retorna null pra Safari normal', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
    expect(detectInAppBrowser(ua)).toBeNull()
  })

  it('retorna null pra Chrome desktop', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
    expect(detectInAppBrowser(ua)).toBeNull()
  })

  it('case-insensitive (UA com maiúsculas)', () => {
    expect(detectInAppBrowser('Mozilla/5.0 WHATSAPP/2.0')?.app).toBe('whatsapp')
  })
})

describe('detectOS', () => {
  it('detecta iOS', () => {
    expect(detectOS('Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)')).toBe('ios')
    expect(detectOS('Mozilla/5.0 (iPad; CPU OS 17_4)')).toBe('ios')
  })

  it('detecta Android', () => {
    expect(detectOS('Mozilla/5.0 (Linux; Android 14; SM-S918B)')).toBe('android')
  })

  it('retorna other pra desktop', () => {
    expect(detectOS('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('other')
    expect(detectOS('')).toBe('other')
    expect(detectOS(null)).toBe('other')
  })
})
