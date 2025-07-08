import 'litecanvas'
import { characters } from './default-font.js'

/**
 *
 * @param {LitecanvasInstance} engine
 * @param {*} config
 */
export default function plugin(engine, config = {}) {
  const _core_text = engine.text
  const _core_textsize = engine.textsize
  const _core_textalign = engine.textalign

  // constants
  const PIXEL_FONT_BASIC = { chars: characters, first: 33, size: 8 }

  let fontScale = 1
  let pixelFont = null

  const setPixelFontScale = (value) => {
    fontScale = Math.round(value / pixelFont.size)
  }

  const setPixelFontAlign = () => {
    return console.warn(
      'textalign() has not yet been implemented for pixel font'
    )
  }

  const printPixelChar = (px, py, char, color = 3) => {
    const charCode = char.charCodeAt(0)
    const bitmap = pixelFont.chars[charCode - pixelFont.first]

    if (!bitmap) return

    for (let y = 0; y < pixelFont.size; y++) {
      for (let x = 0; x < pixelFont.size; x++) {
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

  const renderPixelFont = (x, y, str, color = 3) => {
    str += ''
    const charSize = fontScale * pixelFont.size
    for (let i = 0; i < str.length; i++) {
      printPixelChar(x, y, str[i], color)
      x += charSize
    }
  }

  const textfont = (font) => {
    if ('object' === typeof font) {
      engine.def('text', renderPixelFont)
      engine.def('textsize', setPixelFontScale)
      engine.def('textalign', setPixelFontAlign)
      pixelFont = font
    } else {
      engine.def('text', _core_text)
      engine.def('textsize', _core_textsize)
      engine.def('textalign', _core_textalign)
      pixelFont = null
    }
  }

  return {
    PIXEL_FONT_BASIC,
    textfont,
  }
}
