// ==UserScript==
// @name         trimpshifter
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @include        *trimps.github.io*
// @grant        none
// ==/UserScript==



var script = document.createElement('script');
script.id = 'trimpshifter';
script.src = 'https://timeshifter.github.io/TrimpShifter/TrimpShifter.js';
document.head.appendChild(script);
