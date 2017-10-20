// ==UserScript==
// @name         trimpshifter
// @version      1.0
// @description  Trimps script
// @author       timeshifter
// @include      *trimps.github.io*
// @grant        none
// ==/UserScript==



var script = document.createElement('script');
script.id = 'trimpshifter';
script.src = 'https://timeshifter.github.io/TrimpShifter/TrimpShifter.js';
document.head.appendChild(script);
