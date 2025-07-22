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

  // or activate the mini pixel font 4x6
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

[See this example on playground](https://litecanvas.js.org?c=eJxtj8FqwzAMhu95Ct3iQEdb6Eqv29hYYGsHLWy34sUKNXh2kZUmW%2Bm7z3YayGCggwSfvl8ymrGS9iS9OF%2BKLKsbW7F2FhTJVhRwzgAq48WsCE2o6RRkAE6SEfiAoLCWjWE46g4N1M4yrLpVABk7jqN4Kz8eX%2FZPm%2FVuf3%2B3LR9CSNI4%2Bmv60laPNYtu2YP%2FmV7LdTmIPHISRA68%2FsFremzFfDlg1rVAaBUSfLuG%2BqgQrhJ83RGzCYTKn9EYB%2B%2BOjMoHAeGQlO7rXUjjX3Mvrb%2FxSLrOi5HyNjp38b5W8wE%2BybUBSp7AXX4B2w56FA%3D%3D)

## API

### `function text(x: number, y: number, str: string, color?: number): void`

Draw a pixelated text in the position (x, y) using color white (3) by default.

> Note: The `text()` 5th param for text style (bold, italic, etc) is disabled in the pixel font.

### `function textsize(value: number): void`

Sets the text **scale** (not the size). E.g.: `textsize(3)` scales the pixel font in 3x or 300%.

### `const PIXEL_FONT_BASIC`

The variable that contains information about the pixel font 8x8. Use it as a font family to activate the plugin.

![](images/font8x8.png)

### `const PIXEL_FONT_MINI`

The variable that contains information about the pixel font 4x6. Use it as a font family to activate the plugin.

![](images/font4x6.png)
