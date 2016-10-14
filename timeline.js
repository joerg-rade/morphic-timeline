/**
 *
 * timeline.js
 *
 * timeline for morphic.js
 *
 * written by Jörg Rade joerg.rade@kuehne-nagel.com
 *
 * Copyright (C) 2016 by Jörg Rade derived from charts.js by Jens Möning
 *
 * timeline.js is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, either version 3 of the License, or (at your option) any
 * later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 *
 * prerequisites: -------------- needs morphic.js and widgets.js
 *
 *
 * I. hierarchy ------------- the following tree lists all constructors
 * hierarchically, indentation indicating inheritance. Refer to this list to get
 * a contextual overview:
 *
 * Morph* BoxMorph* TimelineMorph GridMorph LineMorph
 *
 * from Morphic.js
 *
 *
 * II. toc ------- the following list shows the order in which all constructors
 * are defined. Use this list to locate code in this document:
 *
 * GridMorph LineMorph TimelineMorph
 *
 */

// Global settings /////////////////////////////////////////////////////
/*
 * global modules, newCanvas, Point, Morph, WorldMorph, Color, BoxMorph,
 * StringMorph, ScrollFrameMorph, MorphicPreferences, SliderMorph, ToggleMorph,
 * HandleMorph
 */

var GridMorph;
var LineMorph;
var TimelineMorph;

WorldMorph.prototype.customMorphs = function() {
	// add to the world's demo menu
	return [
		new GridMorph(),
		new TimelineMorph()
	];
};

// GridMorph ///////////////////////////////////////////////////////////
// I am a chart's coordinate system
// GridMorph inherits from Morph:
GridMorph.prototype = new Morph();
GridMorph.prototype.constructor = GridMorph;
GridMorph.uber = Morph.prototype;

function GridMorph() {
	this.init();
}

GridMorph.prototype.init = function(x, y, xLines, yLines) {
	// additional attributes:
	this.backgroundColor = api_backColor;

	// API xUnits determines how many days etc. are displayed
	this.xUnits = x || (x === 0 ? 0 : tls.span());
	this.yUnits = y || (y === 0 ? 0 : 200);
	this.xInterval = xLines || api_xInterval;
	this.yInterval = yLines || 25;

	this.axesWidth = 1;
	this.lineWidth = 0.5; // 0.2 eg. leads to a fading effect like in gradient
	this.fontSize = api_fontSize;

	this.isFilled = true;
	// API x-axis labels
	this.columns = scaleLabels;
	this.columnInterval = 1;

	// initialize inherited attributes:
	GridMorph.uber.init.call(this);

	// override inherited attributes:
	this.noticesTransparentClick = true;
	this.color = api_textColor;

	this.createLabels();
	this.createLines();
	this.fixLayout();
};

GridMorph.prototype.fixLayout = function() {
	var myself = this,
		colNo = 0,
		xunit = this.width() / this.xUnits;
	this.columnInterval = Math.max(
		Math.round(this.visibleBounds().width() / xunit / 5),
		1
	);
	this.children.forEach(function(m) {
		if (m instanceof LineMorph) {
			m.bounds = myself.bounds.copy();
			m.isFilled = myself.isFilled;
			m.drawNew();
		} else if (m.isXLabel) {
			if (colNo % myself.columnInterval === 0) {
				m.show();
				m.setCenter(new Point(
					myself.left() + colNo * xunit,
					// move time labels above x axis: - instead of +
					myself.bottom() + myself.fontSize
				));
			} else {
				m.hide();
			}
			colNo += 1;
		}
	});
	this.changed();
};

GridMorph.prototype.drawNew = function() {
	// initialize my surface property
	var context,
		i,
		x,
		temp;

	temp = this.color;
	this.color = this.backgroundColor;
	GridMorph.uber.drawNew.call(this);
	this.color = temp;

	context = this.image.getContext('2d');
	context.lineWidth = this.axesWidth;

	// axes:
	context.beginPath();
	context.moveTo(this.axesWidth / 2, 0);
	context.lineTo(
		this.axesWidth / 2,
		this.height() - this.axesWidth / 2
	);
	context.lineTo(
		this.width(),
		this.height() - this.axesWidth / 2
	);
	context.stroke();

	context.lineWidth = this.lineWidth;

	// vertical lines:
	if (this.xInterval) {
		for (i = 0; i <= this.xUnits; i += this.xInterval) {
			x = i * (this.width() / this.xUnits)
				- this.lineWidth / 2;
			context.moveTo(x, 0);
			context.lineTo(x, this.height());
			context.stroke();
		}
	}
	this.fixLayout();
};

GridMorph.prototype.createLines = function() {
	var myself = this,
		lm,
		i,
		e;
	for (i = 0; i < eventList.length; i++) {
		e = eventList[i];
		lm = new LineMorph(
			e.id, // tl data array
			myself.xUnits,
			myself.yUnits,
			e.line,
			e.color,
			this.isFilled
		);
		lm.setPosition(myself.position().copy());
		myself.add(lm);
	}
	;
};

GridMorph.prototype.createLabels = function() {
	var myself = this,
		lm;

	this.columns.forEach(function(col) {
		lm = new TextMorph(
			col,
			myself.api_fontSize,
			myself.api_fontStyle,
			false,
			false,
			'center'
		);
		lm.isXLabel = true;
		lm.setColor(api_textColor);
		myself.add(lm);
	});
};

GridMorph.prototype.mouseEnter = function() {
	this.children.forEach(function(child) {
		if (child instanceof LineMorph) {
			child.startStepping();
		}
	});
};

GridMorph.prototype.mouseLeave = function() {
	this.children.forEach(function(child) {
		if (child instanceof LineMorph) {
			child.stopStepping();
		}
	});
};

// LineMorph ///////////////////////////////////////////////////////////
// I am a timeline's horizontal bar and am responsible for checkboxes as well as
// value hoovers
// LineMorph inherits from Morph:
LineMorph.prototype = new Morph();
LineMorph.prototype.constructor = LineMorph;
LineMorph.uber = Morph.prototype;

// LineMorph instance creation:
function LineMorph(label, x, y, values, color, isFilled) {
	this.init(label, x, y, values, color, isFilled);
}

LineMorph.prototype.init = function(label, x, y, values, color, isFilled) {
	// additional attributes:
	// checkBox label
	this.label = label || 'not set in data';
	this.xUnits = x || (x === 0 ? 0 : 5);
	this.yUnits = y || (y === 0 ? 0 : 200);
	this.values = values || [];
	this.isFilled = isFilled || false;

	// initialize inherited attributes:
	LineMorph.uber.init.call(this);

	// override inherited attributes:
	this.color = color || api_backColor;
};

LineMorph.prototype.lineY = function(value) {
	// Whats this? no change if commented out
	var yunit = this.height() / this.yUnits;
	return (this.height() - value * yunit) + this.top();
};

LineMorph.prototype.valueAt = function(x) {
	var xunit = this.width() / this.xUnits,
		idx = Math.floor(x / xunit),
		left = idx * xunit,
		right = (idx + 1) * xunit;

	return this.values[idx] +
		((x - left) / (right - left)
		* (this.values[idx + 1] - this.values[idx]));
};

LineMorph.prototype.rider = function() {
	// Rider = value hoover
	var rider,
		lbl;
	if (this.children[0]) {
		return this.children[0];
	}
	lbl = new TextMorph(
		null,
		this.api_fontSize,
		this.api_fontStyle,
		false,
		false,
		null, //alignment,
		0, // width,
		this.api_fontName,
		new Point(-1, -1),
		this.api_textColor //
	);

	rider = new BoxMorph(lbl.height() / 2);
	rider.border = 0;
	//	rider.setExtent(lbl.extent().add(rider.border + 4));
	rider.drawNew = TimelineMorph.prototype.drawGradient;
	rider.label = function() {
		return lbl;
	};
	rider.add(lbl);
	this.add(rider);
	return rider;
};

LineMorph.prototype.drawNew = function() {
	// initialize my surface property
	var context,
		rider;

	this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');
	context.strokeStyle = this.color.toString();
	context.lineWidth = api_timelineHeight;

	this.linePath(context);
	context.stroke();

	rider = this.rider();
	rider.drawNew();
	rider.hide();
};

LineMorph.prototype.linePath = function(context) {
	var i,
		x,
		y;

	var drawLine = tls.hasDuration(this.values);
	for (i = 0; i < this.values.length; i += 1) {
		if (this.values[0] !== null) {
			x = i * (this.width() / this.xUnits);
			y = this.height()
				- (this.values[i] * (this.height() / this.yUnits));
			if (i === 0) {
				context.moveTo(x, y);
			} else {
				context.lineTo(x, y);
			}
			if (!drawLine && !isNaN(y)) {
				drawMilestone();
			}
		}
	}

	/** nested inner
	 * draw a 'salino' for events without duration
	 */
	function drawMilestone() {
		var r = api_dateHeight;
		context.lineWidth = api_dateLineWidth;
		context.moveTo(x - r, y);
		context.lineTo(x, y + r);
		context.lineTo(x + r, y);
		context.lineTo(x, y - r);
		context.lineTo(x - r, y);
		context.stroke();
	}
};

LineMorph.prototype.fill = function() {
	// Fills area below the lines with halftones, 0.2
	//TODO usable for border?
};

LineMorph.prototype.startStepping = function() {
	var myself = this;
	this.rider().show();
	this.step = function() {
		//TODO this is how CursorPos can be computed - use to pop rider only for x/y match
		var pos = myself.world().hand.position(),
			value = this.valueAt(pos.x - this.left()),
			rider = this.rider(),
			label = tls.findByLine(this.values).label();
		if (label) {
			rider.label().setText(label);
		}
		rider.label().setCenter(rider.center());
		rider.setCenter(new Point(
			pos.x,
			myself.lineY(value)
		));
		rider.show();
	};
};

LineMorph.prototype.stopStepping = function() {
	this.step = null;
	this.rider().hide();
};

LineMorph.prototype.isShowing = function() {
	return this.isVisible;
};

LineMorph.prototype.toggleFading = function() {
	if (this.isShowing()) {
		this.hide();
		this.toggleCategory(this, false)
	} else {
		this.show();
		this.toggleCategory(this, true)
	}
	this.rider().hide();
};

LineMorph.prototype.toggleCategory = function(lm, show) {
	var cat = lm.label;
	var sibblings = lm.parent.children;
	sibblings.forEach(function(c) {
		if (c.label === cat) {
			if (show) {
				c.show();
			} else {
				c.hide();
			}
		}
	});
};

// TimelineMorph //////////////////////////////////////////////////////////
// TimelineMorph inherits from BoxMorph: // AlignmentMorph
TimelineMorph.prototype = new BoxMorph();
TimelineMorph.prototype.constructor = BoxMorph;
TimelineMorph.uber = BoxMorph.prototype;

// TimelineMorph instance creation:

function TimelineMorph() {
	this.init();
}

TimelineMorph.prototype.init = function() {
	this.padding = api_padding;

	TimelineMorph.uber.init.call(
		this,
		0, // rounding
		1, // 1.000001, // shadow bug in Chrome,
		new Color(20, 20, 20)
	);
	this.color = api_backColor;
	// API? edge=10 does some rounding
	this.edge = 0;
	this.contents = new GridMorph();
	this.header = null;
	this.zoomer = null;
	this.frame = null;
	this.legend = null;
	this.isDraggable = false;
	this.buildParts();
	this.setExtent(new Point(api_width, api_height));
	if (api_enableResize) {
		this.handle = new HandleMorph(this, 275, 225, 4, 4);
	}
};

TimelineMorph.prototype.buildParts = function() {
	var tm,
		last,
		myself = this;

	// Part 1 / checkboxes at the top
	this.header = new Morph();
	this.header.setColor("white"); //TODO how can Color object be used?
	this.header.setTop(10);
	this.header.setLeft(10);
	this.header.drawNew();
	this.add(this.header);

	// Part 5 / bottom
	this.legend = new Morph();
	this.add(this.legend);

	// Part 2 / center/data - changes legend
	this.contents.children.forEach(function(c) {
		if (c instanceof LineMorph) {
			tm = new ToggleMorph(
				'checkbox',
				c,
				'toggleFading',
				c.label,
				'isShowing',
				null,
				null
			);
			tm.color = c.color;
			tm.drawNew();
			// for more tm.attributes see widgets.js:98:PushButtonMorph preferences settings
			//myself.addToggleToHeader(tm, myself.header);
			//TODO advance only the position if a new unique category is added
			if (!isIncluded(tm, myself.header)) {
				myself.header.add(tm);
				if (last) {
					tm.setPosition(last.fullBounds().topRight().add(
						new Point(myself.padding, 0)
					));
				} else {
					tm.setPosition(
						myself.header.position().add(myself.padding)
					);
				}
				last = tm;
			}
		}

		function isIncluded(newToggleMorph, header) {
			var newLabel = newToggleMorph.label.text; // ^= event.id
			var isIncluded = false;
			header.children.forEach(function(t) {
				if (t.label.text === newLabel) {
					isIncluded = true;
				}
			});
			return isIncluded;
		}
	});

	// Part 3 H-Scrollbar
	this.frame = new ScrollFrameMorph(this.contents, api_scrollBarHeight);
	this.frame.hBar.alpha = 0.1;
	this.frame.hBar.color = api_defaultColor;
	this.frame.hBar.button.color = api_defaultColor;
	this.frame.hBar.button.alpha = 0.3;
	this.frame.isDraggable = false;
	this.frame.acceptsDrops = false;
	this.frame.scrollY = function() {};
	this.frame.mouseScroll = function(amount) {
		this.scrollX(amount * MorphicPreferences.mouseScrollAmount);
		this.adjustScrollBars();
	};
	this.add(this.frame);

	this.zoomer = new SliderMorph();
	this.zoomer.orientation = 'vertical';
	this.zoomer.target = this;
	this.zoomer.action = 'zoom';
	this.add(this.zoomer);
// XXX how can the v scrollbar pos be set?
// this.zoomer.value = 60 has no effect
};

TimelineMorph.prototype.addToggleToHeader = function(newToggleMorph, header) {
	if (!this.isIncluded(newToggleMorph, header)) {
		header.add(newToggleMorph);
	}
}

TimelineMorph.prototype.fixLayout = function() {
	var grid = this.contents,
		inset,
		i,
		y,
		myself = this;

	if (this.legend) {
		this.legend.setExtent(new Point(
			this.width() - this.border,
			this.padding * 2 + 15
		));
		this.legend.setBottom(
			this.bottom() - this.border - this.edge - this.padding
		);
	}
	if (this.frame) {
		inset = new StringMorph(
			grid.yUnits,
			grid.fontSize,
			null,
			false,
			false
		).width() + this.border + 3 + this.padding;
		this.frame.silentSetPosition(new Point(
			this.left() /* + inset */ ,
			this.header.bottom() + this.border + this.padding
		));
		this.frame.bounds.corner = this.legend.topRight().subtract(new Point(
			18 + this.padding,
			this.padding
		));
		this.frame.drawNew();
		this.contents.setExtent(new Point(
			this.frame.width(),
			this.frame.height() - 40 // distance h-Scroll to graph
		));
		this.frame.adjustScrollBars();

		// position y-axis labels:
		this.children.forEach(function(m) {
			if (m.isYLabel) {
				i = parseFloat(m.text);
				y = grid.height() - (i * (grid.height() / grid.yUnits))
				+ grid.top();
				m.setCenter(new Point(0, y));
				m.setRight(myself.frame.left() - 2);
			}
		});
	}
	if (this.zoomer) {
		this.zoomer.silentSetPosition(this.frame.topRight().add(
			new Point(5, 0)
		));
		this.zoomer.bounds.corner = new Point(
			this.right() - this.border - this.padding,
			this.contents.bottom()
		);
		this.zoomer.start = this.frame.width();
		this.zoomer.stop = this.contents.xUnits / 3 * this.width();
		this.zoomer.value = this.zoomer.start;
		this.zoomer.updateTarget();
		this.zoomer.size = (this.zoomer.stop - this.zoomer.start) / 5;
		this.zoomer.drawNew();
		this.zoomer.changed();
	}
};

TimelineMorph.prototype.zoom = function(w) {
	var xunit = this.contents.width() / this.contents.xUnits,
		offsetRatio = (this.frame.left() - this.contents.left()) / xunit;
	this.contents.setWidth(w);
	xunit = this.contents.width() / this.contents.xUnits;
	this.contents.setLeft(this.frame.left() - (xunit * offsetRatio));
	this.frame.scrollX(0);
	this.frame.adjustScrollBars();
};

TimelineMorph.prototype.drawGradient = function() {
	var context;
	this.image = newCanvas(this.extent());
	context = this.image.getContext('2d');
	if ((this.edge === 0) && (this.border === 0)) {
		BoxMorph.uber.drawNew.call(this);
		return null;
	}
	context.fillStyle = api_defaultColor.toString();
	context.strokeStyle = api_defaultColor.toString();
	context.beginPath();
	this.outlinePath(
		context,
		Math.max(this.edge - this.border, 0),
		this.border
	);
	context.closePath();
	if (this.border > 0) {
		context.lineWidth = this.border;
		context.strokeStyle = api_defaultColor.toString();
		context.fillStyle = api_defaultColor.toString();
		context.beginPath();
		this.outlinePath(context, this.edge, this.border / 2);
		context.closePath();
		context.stroke();
	}
};

TimelineMorph.prototype.drawNew = function() {
	this.drawGradient();
	this.fixLayout();
};