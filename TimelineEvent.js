TimelineEvent.prototype = new Node();
TimelineEvent.prototype.constructor = TimelineEvent;
TimelineEvent.uber = Node.prototype;

function TimelineEvent(id, parent, startDateStr, endDateStr, colorStr, category) {
	this.init(id, parent, startDateStr, endDateStr, colorStr, category);
}

TimelineEvent.prototype.init = function(id, parent, startDateStr, endDateStr, colorStr, category) {
	this.id = id || "id not set"; // aka title, name
	initDates(this, startDateStr, endDateStr);
	this.color = initColor(colorStr) || api_defaultColor;
	this.category = category || "NONE";

	/**
	 * Events - as passed in - may not have a start and an end date.
	 * The line drawing used here requires that both dates are set
	 * and that they differ at least by 1 day.
	 */
	function initDates(o, s, e) {
		var ONE_DAY_IN_MS = 1000 * 60 * 60 * 24; // milliseconds per day
		o.startDate = new Date(s);
		if (!e) {
			e = s;
		}
		o.endDate = new Date(e);
		if (hasInvalidDates(o)) {
			if (!o.endDate) {
				o.endDate = new Date(o.startDate.getTime() + ONE_DAY_IN_MS);
			}
			if (!o.startDate) {
				o.startDate = new Date(o.endDate.getTime() - ONE_DAY_IN_MS);
			}
			if (o.startDate.getTime() === o.endDate.getTime()) {
				o.endDate = new Date(o.startDate.getTime() + ONE_DAY_IN_MS);
			}
		}

		/** inner nested
		 * if neither startDate nor endDate is set, or both dates are equal the event is invalid
		 */
		function hasInvalidDates(o) {
			return !o.startDate || !o.endDate || (o.startDate.getTime() === o.endDate.getTime())
		}
	}

	/**
	 * Turn hex color string into js Color object.
	 */
	function initColor(colorStr) {
		if (colorStr) {
			rgb = hexToRgb(colorStr);
			color = new Color(rgb.r, rgb.g, rgb.b);
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

TimelineEvent.prototype.initLine = function() {
	this.line = [];
	var empty;
	var d = new Date(tls.earliestStartDate());
	this.yPos = api_timelineOffset - (this.index * api_timelineHeight);
	while (d < this.endDate) {
		if (d < this.startDate) {
			this.line.push(empty);
		} else {
			this.line.push(this.yPos);
		}
		d.setDate(d.getDate() + 1);
	}
}

TimelineEvent.prototype.label = function() {
	var l = this.id + "\n[ " + this.startDate + "..." + this.endDate + " ]";
	return l;
}
