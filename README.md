Usage example:

https://commons.wikimedia.org/wiki/User:Aavindraa/common.js

## Install type

The **rolling release** will update automatically.

Use the other option if you want a specific version.

### 🏎️ Rolling release

Set it up once, and you might just need to do a **hard reload** occasionally to download the new scripts.

Any of the below can be used as the `src` value:

* https://cdn.jsdelivr.net/gh/avindra/mikiwedia@main/index.js (CDN [jsdelivr](https://en.wikipedia.org/wiki/JSDelivr))
* https://avindra.github.io/mikiwedia/index.js ([GitHub Pages](https://en.wikipedia.org/wiki/GitHub_Pages))
* https://dra.vin/mikiwedia/index.js ([GitHub Pages](https://en.wikipedia.org/wiki/GitHub_Pages) via my domain)

### 🔢 Specific version

By using jsdelivr, you can specify a version to use. For example, you could pick the `0.2.0` release. Note: don't actually use v0.2.0 as it has known bugs.

* https://cdn.jsdelivr.net/gh/avindra/mikiwedia@0.2.0/index.js

## `common.js` code example

This is the code to use in your [`common.js`](https://commons.wikipedia.org/wiki/Special:MyPage/common.js).

In Firefox/Chrome: `ctrl`+`shift`+`i` to use developer console.

```js
const s = document.createElement("script");
s.type = "module";
s.src = '//dra.vin/mikiwedia/index.js';
document.body.appendChild(s);
```

Local testing looks more like:

```js
var l = document.createElement("script");
l.type = "module";
l.src = 'http://localhost:8000/index.js';
document.body.appendChild(l);
```

## Design

Design principles for JavaScript-related code:

* ES Modules
* No third-party libraries
* Lazy-load bigger modules with [dynamic imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports)
* Use basic `fetch` whenever possible
* Limit use of jQuery and builtins

## Features

In lieu of an actual feature list, check `releases` for now:

https://github.com/avindra/mikiwedia/releases