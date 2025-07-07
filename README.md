# Pixel Font for Litecanvas

A simple plugin to let you render a pixel font to emulate retro vibes.

<!-- prettier-ignore -->
> [!INFO]
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

litecanvas()

use(pluginPixelFont)

function draw() {
  // activate the pixel font
  textfont(PIXEL_FONT_BASIC)

  // set the text size
  textsize(16)

  // now render your pixelated text
  text(0, 0, 'Hello World')

  // reset the font renderer
  textfont('sans-serif')
  text(0, 50, 'Text with browser font')
}
```

## API

### `text(x: number, y: number, str: string, color?: number): void`

Draw a pixelated text in the position (x, y) using color white (3) by default.

> Note: The `text()` 5th param for text style (bold, italic, etc) is disabled in the pixel font.

### `textsize(value: number): void`

Sets the text size. Prefer multiples of 8, so 8, 16, 24, 32, etc.

### PIXEL_FONT_BASIC

The constant that contains information about the pixel font. Use it as a font family to activate the plugin.
