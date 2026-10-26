import 'litecanvas'

export { font as PIXEL_FONT_BASIC } from './fonts/basic-8x8.js'
export { font as PIXEL_FONT_MINI } from './fonts/mini-4x6.js'
export { font as PIXEL_FONT_MONOGRAM } from './fonts/monogram-6x9.js'

/**
 * @typedef {object} LitecanvasPixelFont
 * @property {string} id The font name (must be unique)
 * @property {any[]}  chars The list of font glyphs
 * @property {number} first The first font glyph code
 * @property {number} w The width of each glyph
 * @property {number} h The height of each glyph
 * @property {(engine: LitecanvasInstance, bitmap: any, color?: number) => void} render The font fglyph renderer
 */

/**
 * @param {LitecanvasInstance} engine
 * @param {object} config
 * @param {boolean | number} config.cache
 */
export default plugin = (engine, { cache = true } = {}) => {
  const round = Math.round

  // litecanvas core methods
  const _core_text = engine.text
  const _core_textsize = engine.textsize
  const _core_textfont = engine.textfont
  const _core_textgap = engine.textgap

  /** @type {Map<string, ImageBitmap} */
  const cached = cache ? new Map() : null

  let fontScale = 1
  let fontLineGap = 1
  let _bg = null

  /** @type {LitecanvasPixelFont | null} */
  let currentPixelFont = null

  DEV: {
    if (cache) {
      cacheExpiration = 5
      console.log('[litecanvas/plugin-pixel-font] cache enabled!')
      console.log(
        '[litecanvas/plugin-pixel-font] cache expiration set to 5 seconds! (for test purposes)'
      )
    }
  }

  let _defaultTextColor = 3
  engine.listen('pal', (_, textColor) => {
    _defaultTextColor = textColor
  })

  /**
   * @param {number|string} color
   */
  const textbg = (color) => {
    _bg = color
  }

  /**
   * @param {number} value
   */
  const setPixelFontScale = (value) => {
    fontScale = ~~round(value)
  }

  /**
   * Sets how many pixels separates lines of text.
   * Default = `1`
   *
   * @param {number} value
   */
  const setPixelFontLineGap = (value) => {
    fontLineGap = ~~round(value)
  }

  /**
   * @param {number} posx
   * @param {number} posx
   * @param {number} posy
   * @param {(number|undefined)[]} bitmap
   * @param {number?} color
   */
  const renderChar = (posx, posy, bitmapChar, color) => {
    engine.push()
    engine.translate(posx, posy)
    engine.scale(fontScale)
    currentPixelFont.render(engine, bitmapChar, color)
    engine.pop()
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {string} str
   * @param {number?} color
   */
  const renderPixelText = (x, y, str, color = _defaultTextColor) => {
    str += ''

    if (!fontScale || !str.length) return

    const _ctx = engine.ctx()
    const fontAlign = _ctx.textAlign
    const fontBaseline = _ctx.textBaseline
    const charWidth = fontScale * currentPixelFont.w
    const charHeight = fontScale * (currentPixelFont.h || currentPixelFont.w)
    const lines = str.split('\n')
    const gap = fontLineGap * fontScale

    let startY = y

    if (fontBaseline === 'middle') {
      startY = round(y - charHeight / 2)
    } else if (fontBaseline === 'bottom') {
      startY = y - charHeight
    }

    for (let l = 0; l < lines.length; l++) {
      const line = lines[l]
      const lineY = startY + l * (gap + charHeight)
      let lineX = x

      if (fontAlign === 'center') {
        lineX = round(x - (line.length * charWidth) / 2)
      } else if (fontAlign === 'right' || fontAlign === 'end') {
        lineX = x - line.length * charWidth
      }

      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        const charCode = char.charCodeAt(0)

        if (_bg != null) {
          engine.rectfill(lineX, lineY, charWidth, charHeight, _bg)
        }

        const bitmap = currentPixelFont.chars[charCode - currentPixelFont.first]
        if (bitmap) {
          if (cache) {
            const key = [currentPixelFont.id, char, color, charWidth].join(':')

            if (!cached.has(key)) {
              cached.set(
                key,
                engine.paint(charWidth, charHeight, () => {
                  renderChar(0, 0, bitmap, color)
                })
              )
            }
            const img = cached.get(key)
            engine.image(lineX, lineY, img)
          } else {
            renderChar(lineX, lineY, bitmap, color)
          }
        }

        lineX += charWidth
      }
    }
  }

  if (cache) {
    // clear the cache every 1 minute
    let intervalTime = 60 * 1000

    // reduce this interval to 10 seconds in dev build
    DEV: intervalTime = 10 * 1000

    const intervalId = setInterval(() => {
      cached.clear()
      DEV: console.log('[litecanvas/plugin-pixel-font] cache cleared')
    }, intervalTime)

    engine.listen('quit', () => {
      clearInterval(intervalId)
      cached.clear()
    })

    engine.listen('pal', () => {
      cached.clear()
    })
  }

  /**
   * @param {string | LitecanvasPixelFont} font
   */
  const textfont = (font) => {
    if (font !== currentPixelFont) {
      if ('object' === typeof font) {
        engine.def('text', renderPixelText)
        engine.def('textsize', setPixelFontScale)
        engine.def('textgap', setPixelFontLineGap)
        currentPixelFont = font
        setPixelFontScale(fontScale || 1)
      } else {
        engine.def('text', _core_text)
        engine.def('textsize', _core_textsize)
        engine.def('textgap', _core_textgap)
        _core_textfont(font)
      }
    }
  }

  return {
    textfont,
    textbg,
  }
}
