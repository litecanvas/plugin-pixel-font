import 'litecanvas'
import { font as defaultFont } from './fonts/basic-8x8.js'

/**
 *
 * @param {LitecanvasInstance} engine
 * @param {*} config
 */
export default plugin = (engine) => {
  const _core_text = engine.text
  const _core_textsize = engine.textsize
  const _core_textalign = engine.textalign
  const _core_textfont = engine.textfont

  // constants
  const PIXEL_FONT_BASIC = defaultFont

  let fontScale = 1

  /** @type {typeof defaultFont | null} */
  let pixelFont = null

  /**
   * @param {number} value
   */
  const setPixelFontScale = (value) => {
    fontScale = Math.round(value / pixelFont.w)
  }

  const setPixelFontAlign = () => {
    return console.warn(
      'textalign() has not yet been implemented for pixel font'
    )
  }

  /**
   * @param {number} px
   * @param {number} py
   * @param {string} char
   * @param {number?} color
   */
  const printPixelChar = (px, py, char, color = 3) => {
    const charCode = char.charCodeAt()
    const bitmap = pixelFont.chars[charCode - pixelFont.first]

    if (!bitmap) return

    for (let y = 0; y < pixelFont.w; y++) {
      for (let x = 0; x < pixelFont.w; x++) {
        if ((bitmap[y] | 0) & (1 << x)) {
          engine.rectfill(
            px + x * fontScale,
            py + y * fontScale,
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
  const renderPixelFont = (x, y, str, color = 3) => {
    str += ''
    const charSize = fontScale * pixelFont.w
    for (let i = 0; i < str.length; i++) {
      printPixelChar(x, y, str[i], color)
      x += charSize
    }
  }

  /**
   * @param {string | typeof defaultFont} font
   */
  const textfont = (font) => {
    if ('object' === typeof font) {
      engine.def('text', renderPixelFont)
      engine.def('textsize', setPixelFontScale)
      engine.def('textalign', setPixelFontAlign)
      pixelFont = font
      setPixelFontScale(pixelFont.w)
    } else {
      engine.def('text', _core_text)
      engine.def('textsize', _core_textsize)
      engine.def('textalign', _core_textalign)
      pixelFont = null
      _core_textfont(font)
    }
  }

  return {
    PIXEL_FONT_BASIC,
    textfont,
  }
}
