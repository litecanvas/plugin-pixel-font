# Pixel Font for Litecanvas

A simple plugin to let you render a pixel font to emulate retro vibes in your [Litecanvas](https://github.com/litecanvas/game-engine) projects.

<!-- prettier-ignore -->
> [!TIP]
> **This plugin is automatically loaded on Litecanvas playground.**

## Install

```sh
npm i @litecanvas/plugin-pixel-font
```

or

```html
<script src="https://unpkg.com/@litecanvas/plugin-pixel-font"></script>
```

## Usage

```js
import litecanvas from 'litecanvas'
import pluginPixelFont from '@litecanvas/plugin-pixel-font'

litecanvas({
  loop: { draw },
})

use(pluginPixelFont)

function draw() {
  cls(0)

  // activate the default pixel font 8x8
  textfont(PIXEL_FONT_BASIC)

  // activate the mini pixel font 4x6
  // textfont(PIXEL_FONT_MINI)

  // set the text size
  textsize(16)

  // now render your pixelated text
  text(0, 0, 'Hello World')

  // reset the font renderer
  textfont('sans-serif')
  text(0, 50, 'Text with browser font')
}
```

[See this example on playground](https://litecanvas.js.org?c=eJxNjssKwjAQRff9itk1BUVd6F5FURAVFHQnsZ1iICQyGa0P%2FHcntQVhFhfm3Ic1jLl2dx3U%2B5MlSXlzORvvoCBdqQzeCUBug%2BpnIuR6PdAC3DUj8AXhah5oofSO5cn44CjVdnmcrU7zzXp%2Fmox3y6kE19aAXLsiCMG8sDFFqQajFnO%2BAkJXIMHT3%2BhXIo1FDTce1e%2BAXLpAaz0cPNkibQMI26Y4p8lC%2Bp%2BYBu1CNyCZMs3%2BIocxcx%2F3VYYvcCZfCVTnCPf5ApPaX2E%3D)

## API

### `text(x: number, y: number, str: string, color?: number): void`

Draw a pixelated text in the position (x, y) using color white (3) by default.

> Note: The `text()` 5th param for text style (bold, italic, etc) is disabled in the pixel font.

### `textsize(value: number): void`

Sets the text size. Prefer multiples of 8, so 8, 16, 24, 32, etc.

### PIXEL_FONT_BASIC

The constant that contains information about the pixel font. Use it as a font family to activate the plugin.
