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
  // check if stat(12) exists
  if (null == engine.stat(12)) {
    throw `Plugin Pixel Font requires Litecanvas v0.99 or later`
  }

  // litecanvas core methods
  const _core_text = engine.text
  const _core_textsize = engine.textsize
  const _core_textalign = engine.textalign
  const _core_textfont = engine.textfont

  /** @type {Map<string, ImageBitmap} */
  const cached = cache ? new Map() : null
  let fontScale = 1

  /** @type {LitecanvasPixelFont | null} */
  let currentFont = null

  DEV: {
    if (cache) {
      cacheExpiration = 5
      console.log('[litecanvas/plugin-pixel-font] cache enabled!')
      console.log(
        '[litecanvas/plugin-pixel-font] cache expiration set to 5 seconds! (for test purposes)'
      )
    }
  }

  /**
   * @param {number} value
   */
  const setPixelFontScale = (value) => {
    fontScale = ~~Math.round(value)
  }

  const setPixelFontAlign = () => {
    return console.warn(
      '[litecanvas/plugin-pixel-font] textalign() has not yet been implemented for pixel fonts'
    )
  }

  /**
   * @param {number} posx
   * @param {number} posx
   * @param {number} posy
   * @param {(number|undefined)[]} bitmap
   * @param {number?} color
   */
  const renderChar = (posx, posy, bitmapChar, color = 3) => {
    engine.push()
    engine.translate(posx, posy)
    engine.scale(fontScale)
    currentFont.render(engine, bitmapChar, color)
    engine.pop()
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {string} str
   * @param {number?} color
   */
  const renderPixelText = (x, y, str, color = 3) => {
    str += ''

    if (!fontScale || !str.length) return

    const charWidth = fontScale * currentFont.w
    const charHeight = fontScale * (currentFont.h || currentFont.w)
    const offsetX = x

    for (let i = 0; i < str.length; i++) {
      const char = str[i]
      const charCode = char.charCodeAt()

      if (10 === charCode) {
        const gap = engine.stat(13) || 1.2
        y = y + gap * currentFont.h * fontScale
        x = offsetX
        continue
      }

      const bitmap = currentFont.chars[charCode - currentFont.first]

      if (bitmap) {
        if (cache) {
          const key = [
            currentFont.id,
            char,
            ~~color,
            charWidth,
            engine.stat(12).join(','),
          ].join(':')

          // check the cache
          if (!cached.has(key)) {
            // create an char image and cache it
            cached.set(
              key,
              engine.paint(charWidth, charHeight, () => {
                renderChar(0, 0, bitmap, ~~color)
              })
            )
          }
          // get the cached char image
          const img = cached.get(key)

          // draw the char as image (better performance)
          engine.image(x, y, img)
        } else {
          // with cached disabled, draw the char pixel by pixel
          renderChar(x, y, bitmap, color)
        }
      }

      x += charWidth
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

    // also clear the cache when pal() is called
    const _core_pal = engine.pal
    engine.def('pal', (colors) => {
      cached.clear()
      return _core_pal(colors)
    })
  }

  /**
   * @param {string | typeof defaultFont} font
   */
  const textfont = (font) => {
    if ('object' === typeof font) {
      engine.def('text', renderPixelText)
      engine.def('textsize', setPixelFontScale)
      engine.def('textalign', setPixelFontAlign)
      currentFont = font
      setPixelFontScale(fontScale || 1)
    } else {
      engine.def('text', _core_text)
      engine.def('textsize', _core_textsize)
      engine.def('textalign', _core_textalign)
      _core_textfont(font)
    }
  }

  return {
    textfont,
  }
}
