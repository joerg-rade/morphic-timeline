TimelineEvent.prototype = new Node();
TimelineEvent.prototype.constructor = TimelineEvent;
TimelineEvent.uber = Node.prototype;

function TimelineEvent(id, parent, startDateStr, endDateStr, colorStr, category) {
	this.init(id, parent, startDateStr, endDateStr, colorStr, category);
}

TimelineEvent.prototype.init = function(id, parent, startDateStr, endDateStr, colorStr, category) {
	this.id = id || "id not set"; // AKA title, name
	this.parent = parent;
	this.children = [];
	initDates(this, startDateStr, endDateStr);
	this.color = initColor(colorStr) || api_defaultColor;
	this.category = category || "NONE";

	/**
	 * Events - as passed in - may not have a start and an end date.
	 * The line drawing used here requires that both dates are set
	 * and that they differ at least by 1 day.
	 */
	function initDates(o, s, e) {
		if (s) {
			o.startDate = new Date(s);
		} else {
			o.startDate = new Date(e);
		}
		if (e) {
			o.endDate = new Date(e);
		} else {
			o.endDate = new Date(s);
		}
		addADayToCopeWithLineDrawing();

		if (isInvalid(o.startDate) || isInvalid(o.endDate)) {
			throw new Error("Invalid Date");
		}

		// @deprecated use Pen/logo style drawing instead
		function addADayToCopeWithLineDrawing() {
			var alpha = o.startDate.getTime();
			var omega = o.endDate.getTime();
			if (omega - alpha < ONE_DAY_IN_MS) {
				o.endDate = new Date(alpha + ONE_DAY_IN_MS);
			}
		}
		function isInvalid(date) {
			return isNaN(date.getTime());
		}
	}

	/**
	 * Turn hex color string into Color object.
	 */
	function initColor(colorStr) {
		if (colorStr) {
			var rgb = hexToRgb(colorStr);
			var color = new Color(rgb.r, rgb.g, rgb.b);
			return color;
		}

		function hexToRgb(hex) {
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
			return result ? {
				r : parseInt(result[1], 16),
				g : parseInt(result[2], 16),
				b : parseInt(result[3], 16)
			} : null;
		} // hexToRgb
	}
}

TimelineEvent.prototype.getIndex = function() {
	var i = this.index;
	if (!i) {
		i = this.parent.index;
	}
	return i;
}

/**
 * @deprecated line drawing should use Pen/Logo style (origin, corner) instead
 */
TimelineEvent.prototype.initLine = function() {
	this.line = [];
	var d = new Date(tls.earliestStartDate());
	this.yPos = api_timelineOffset - (this.getIndex() * api_timelineHeight * 1.5);
	// put kids in the second line
	if (this.parent) {
		this.yPos = this.yPos - (api_timelineHeight / 2);
	}
	while (d < this.endDate) {
		if (d < this.startDate) {
			this.line.push(undefined);
		} else {
			this.line.push(this.yPos);
		}
		d.setDate(d.getDate() + 1);
	}
	this.line.push(this.yPos);
}

TimelineEvent.prototype.label = function() {
	var l = this.id + "\n[ " + this.startDate.toDateString() + "..." + this.endDate.toDateString() + " ]";
	return l;
}

TimelineEvent.prototype.hasDuration = function() {
	var alpha = this.startDate.getTime();
	var omega = this.endDate.getTime();
	return ((omega - alpha) > ONE_DAY_IN_MS + 1);
}