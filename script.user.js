// ==UserScript==
// @name         BetterChat
// @description  Improved chat bubbles
// @author       SArpnt
// @version      1.0.0
// @namespace    https://boxcrittersmods.ga/authors/sarpnt/
// @homepage     https://boxcrittersmods.ga/mods/betterchat/
// @updateURL    https://github.com/SArpnt/BetterChat/raw/master/script.user.js
// @downloadURL  https://github.com/SArpnt/BetterChat/raw/master/script.user.js
// @supportURL   https://github.com/SArpnt/BetterChat/issues
// @run-at       document-start
// @match        https://boxcritters.com/play/
// @match        https://boxcritters.com/play/?*
// @match        https://boxcritters.com/play/#*
// @match        https://boxcritters.com/play/index.html
// @match        https://boxcritters.com/play/index.html?*
// @match        https://boxcritters.com/play/index.html#*
// @require      https://github.com/SArpnt/joinFunction/raw/master/script.js
// @require      https://github.com/SArpnt/EventHandler/raw/master/script.js
// @require      https://github.com/SArpnt/cardboard/raw/master/script.user.js
// ==/UserScript==
// @icon         https://github.com/SArpnt/betterchat/raw/master/icon32.png
// @icon64       https://github.com/SArpnt/betterchat/raw/master/icon64.png

(function () {
	'use strict';
	cardboard.register("betterChat");

	const
		BALLOON_STROKE_STYLE = 1,
		BALLOON_STROKE_COLOR = "#888888",
		BALLOON_FILL_COLOR = "#FFFFFF",

		BALLOON_X = 0,
		BALLOON_Y = -80,
		BALLOON_WIDTH = 100,
		BALLOON_ROUNDING = 5,

		BALLOON_POINT_X = 70,
		BALLOON_POINT_WIDTH = 10,
		BALLOON_POINT_HEIGHT = 10,
		BALLOON_POINT_ANGLE = 0,

		FONT = "12px Arial",
		TEXT_COLOR = "#000000",
		TEXT_ALIGN = "center",
		TEXT_TIMEOUT = 5e3,
		MESSAGE_SPACING = 5;

	cardboard.on('clientCreated', function (client) {
		function balloonShape(width, height, s) {
			if (s)
				s.graphics.clear();
			else
				s = new createjs.Shape;
			let
				r = BALLOON_ROUNDING,
				w = width + 20,
				h = height + 20,
				px = BALLOON_POINT_X,
				pw = BALLOON_POINT_WIDTH,
				ph = BALLOON_POINT_HEIGHT,
				pa = BALLOON_POINT_ANGLE;
			s.graphics.setStrokeStyle(BALLOON_STROKE_STYLE).beginStroke(BALLOON_STROKE_COLOR).beginFill(BALLOON_FILL_COLOR);
			s.graphics.moveTo(r, 0).arcTo(w, 0, w, r, r).arcTo(w, h, w - r, h, r) // right?
				.lineTo(px + pw, h).lineTo(px + pw * pa, h + ph).lineTo(px, h) // point
				.arcTo(0, h, 0, h - r, r).arcTo(0, 0, r, 0, r); // left?
			s.x = -w / 2;
			return s;
		}

		client.BalloonContainer = joinFunction(client.BalloonContainer, function () {
			let b = new createjs.Container;
			this.betterBalloon = b;
			this.addChild(b);
			b.visible = false;
			b.x = BALLOON_X;
			b.y = BALLOON_Y;

			b.balloonShape = new createjs.Shape;
			b.addChild(b.balloonShape);

			b.messages = new createjs.Container;
			b.addChild(b.messages);
			b.messages.textHeight = 0;
		});

		client.BalloonContainer.prototype.showMessage = function (msg) {
			if (msg) {
				let s = this.betterBalloon.balloonShape,
					m = this.betterBalloon.messages,
					t = new createjs.Text(msg, FONT, TEXT_COLOR);
				t.textAlign = TEXT_ALIGN;
				t.lineWidth = BALLOON_WIDTH;
				if (m.children.length) {
					m.children[m.children.length - 1].textHeight += MESSAGE_SPACING;
					m.textHeight += MESSAGE_SPACING;
				}
				t.textHeight = t.getBounds().height;
				t.y = m.textHeight;
				m.textHeight += t.textHeight;
				m.y = -m.textHeight;
				s.y = -m.textHeight - BALLOON_ROUNDING * 2;
				balloonShape(BALLOON_WIDTH, m.textHeight, s);
				m.addChild(t);
				this.betterBalloon.visible = true;
				t.timeout = setTimeout(_ => {
					m.removeChild(t);
					if (m.children.length) {
						m.textHeight -= t.textHeight;
						m.children.forEach(e => e.y -= t.textHeight);
						m.y = -m.textHeight;
						s.y = -m.textHeight - BALLOON_ROUNDING * 2;
						balloonShape(BALLOON_WIDTH, m.textHeight, s);
					} else {
						m.textHeight = 0;
						this.betterBalloon.visible = false;
					}
				}, TEXT_TIMEOUT);
				return this;
			}
			console.error("balloon is missing a message");
		};
	});
})();