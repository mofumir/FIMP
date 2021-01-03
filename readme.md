# Fricking Irrelevant Measuring-converter Prototype

![fimp](https://user-images.githubusercontent.com/52525474/103474432-19c42080-4de7-11eb-9bfd-56f36ad260b5.gif)

## Description

Calculate selected number with template expession through right click context menu.

## How does it work?

Math.js calculates given number with pre-defined expression from preset you choose in context menu, then return the result to you using `alert()`.
You can add more presets from option menu.

## Why was this made?

[AutoConvert](https://chrome.google.com/webstore/detail/autoconvert-you-select-it/einokpbfcmmopbfbpiofaeohhkmcbbcg) does pretty good job at doing select-convert, however it can't convert if selection was only numbers.
Sometimes number is given in a way of table, and I needed a convenient way to calculate them easily. (mostly, for certain toy site)
Also, this is my first attempt at making extension, so thought might as well make something useful for myself.

## Licensing

The content of this project itself is licensed under MIT.

This extension includes [math.js](https://github.com/josdejong/mathjs) that is distributed in the Apache License V2.0.

This extension also includes [browser-polyfill](https://github.com/mozilla/webextension-polyfill) which is licensed under Mozilla Public License.
