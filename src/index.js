import 'litecanvas'
import { font as defaultFont } from './fonts/basic-8x8.js'
import { font as miniFont } from './fonts/mini-3x5.js'

/**
 * @param {LitecanvasInstance} engine
 * @param {object} config
 * @param {boolean | number} config.cache
 */
export default plugin = (engine, { cache = true } = {}) => {
  // litecanvas core methods
  const _core_text = engine.text
  const _core_textsize = engine.textsize
  const _core_textalign = engine.textalign
  const _core_textfont = engine.textfont

  // constants
  const PIXEL_FONT_BASIC = defaultFont
  const PIXEL_FONT_MINI = miniFont

  /** @type {Map<string, ImageBitmap} */
  const cached = cache ? new Map() : null
  let cacheExpiration = 5 * 60 // seconds
  let fontScale = 1

  /** @type {typeof defaultFont | null} */
  let currentFont = null

  if (DEBUG) {
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
    fontScale = Math.round(value / currentFont.w)
  }

  const setPixelFontAlign = () => {
    return console.warn(
      '[litecanvas/plugin-pixel-font] textalign() has not yet been implemented for pixel fonts'
    )
  }

  /**
   * @param {number} posx
   * @param {number} posy
   * @param {(number|undefined)[]} bitmap
   * @param {number?} color
   */
  const renderChar = (posx, posy, bitmap, color = 3) => {
    const h = currentFont.h || currentFont.w
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < currentFont.w; x++) {
        if ((bitmap[y] | 0) & (1 << x)) {
          engine.rectfill(
            posx + x * fontScale,
            posy + y * fontScale,
            fontScale,
            fontScale,
            color
          )
        }
      }
    }
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

    for (let i = 0; i < str.length; i++) {
      const char = str[i]
      const charCode = char.charCodeAt()
      const bitmap = currentFont.chars[charCode - currentFont.first]

      if (bitmap) {
        if (cache) {
          const key = `${currentFont.id}:${char}:${~~color}:${charWidth}`

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

          // update the cache expiration time for this char
          img._ = engine.T + cacheExpiration

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

  // check expired cached images
  if (cache) {
    const intervalId = setInterval(
      () => {
        if (DEBUG) {
          console.log(
            '[litecanvas/plugin-pixel-font] checking expired cache entries'
          )
        }
        const t = performance.now()
        for (const [key, bitmap] of cached) {
          if (engine.T > bitmap._) {
            cached.delete(key)
            if (DEBUG) {
              const [fontId, char, color, size] = key.split(':')
              console.log(
                '[litecanvas/plugin-pixel-font] cache cleared for',
                JSON.stringify({ char, color, size, fontId })
              )
            }
          }
        }
        if (DEBUG) {
          console.log(
            '[litecanvas/plugin-pixel-font] All entries checked in',
            (performance.now() - t) / 1000,
            'seconds'
          )
        }
      },
      // set the interval to 10 seconds in debug mode
      // default = 1 minute
      1000 * (DEBUG ? 10 : cacheExpiration / 5)
    )

    engine.listen('quit', () => {
      clearInterval(intervalId)
      cached.clear()
    })
  }

  if (DEBUG) window._FONT_CACHE = cached

  /**
   * @param {string | typeof defaultFont} font
   */
  const textfont = (font) => {
    if ('object' === typeof font) {
      engine.def('text', renderPixelText)
      engine.def('textsize', setPixelFontScale)
      engine.def('textalign', setPixelFontAlign)
      currentFont = font
      setPixelFontScale(currentFont.w)
    } else {
      engine.def('text', _core_text)
      engine.def('textsize', _core_textsize)
      engine.def('textalign', _core_textalign)
      _core_textfont(font)
    }
  }

  return {
    PIXEL_FONT_BASIC,
    PIXEL_FONT_MINI,
    textfont,
  }
}
