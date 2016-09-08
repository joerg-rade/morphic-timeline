/** GLOBALS */
var ONE_DAY_IN_MS = 1000 * 60 * 60 * 24; // milliseconds per day

/**
 * Turn Strings into Objects (date, color, parent).
 * Link children to their parent based on String value of filed 'parent' of the json data.
 * Type of field parent changes from string to Object!
 */
function initEvents() {
	var e, p, t, rgb, parentCnt = 0;
	var json = JSON.parse(data);
	for (var i = 0; i < json.events.length; i++) {
		e = json.events[i];
		initDates();
		initColor();
		e.children = [];
		// at this very moment parent is still a string
		t = e.parent;
		p = findParentByName(t);
		// since we have only two generations we get along this way
		if (p === null) {
			e.parent = null;
			parentCnt += 1;
		} else {
			e.parent = p;
			p.children.push(e);
		}
		e.index = parentCnt;
		eventList.push(e);
	}
	for (i = 0; i < eventList.length; i++) {
		e = eventList[i];
		e.line = line(e);
	}

	/** nested inner
	 * Events - as passed in - may have neither a start or an end date.
	 * The line drawing used here requires that both dates are set
	 * and that they differ at least by 1 day.
	 */
	function initDates() {
		e.startDate = new Date(e.startDateStr);
		if (!e.endDateStr) {
			e.endDateStr = e.startDateStr;
		}
		e.endDate = new Date(e.endDateStr);
		if (hasInvalidDates()) {
			if (!e.endDate) {
				e.endDate = new Date(e.startDate.getTime() + ONE_DAY_IN_MS);
			}
			if (!e.startDate) {
				e.startDate = new Date(e.endDate.getTime() - ONE_DAY_IN_MS);
			}
			if (e.startDate.getTime() === e.endDate.getTime()) {
				e.endDate = new Date(e.startDate.getTime() + ONE_DAY_IN_MS);
			}
		}

		/** inner nested
		 * if neither startDate nor endDate is set, or both dates are equal the event is invalid
		 */
		function hasInvalidDates() {
			return !e.startDate || !e.endDate || (e.startDate.getTime() === e.endDate.getTime())
		}
	}

	/** nested inner
	 */
	function initColor() {
		if (!e.colorStr) {
			e.color = api_defaultColor;
		} else {
			rgb = hexToRgb(e.colorStr);
			e.color = new Color(rgb.r, rgb.g, rgb.b);
		}
	}

	/** nested inner
	 *  assumes: parents are defined before children
  	 */
	function findParentByName(id) {
		for (p = 0; p < eventList.length; p++) {
			if (id === eventList[p].id) {
				// first match wins
				return eventList[p];
			}
		}
		return null;
	}
	/** nested inner */
	function hexToRgb(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
	}

	/** nested inner */
	function line(event) {
		var lineArray = [];
		var empty;
		if (event) {
			var d = new Date(alpha());
			event.yPos = api_timelineOffset - (event.index * api_timelineHeight);
			while (d < event.endDate) {
				if (d < event.startDate) {
					lineArray.push(empty);
				} else {
					lineArray.push(event.yPos);
				}
				d.setDate(d.getDate() + 1);
			}
		}
		return lineArray;
	}
}


/**
 * Initializes scale label and data,
 * starting with earliest startDate (alpha) and
 * ending at latest endDate (omega).
 */
function initScale() {
	var d = new Date(alpha());
	var label;
	while (d < omega()) {
		scaleData.push(d);
		label = d.toDateString().split(" ");
		scaleLabels.push(label[1] + "\n" + label[2]);
		d.setDate(d.getDate() + 1);
	};

	/** nested inner
	 * Sort eventList by endDate.
	 * @returns last {Date}
	 */
	function omega() {
		eventList.sort(function(a, b){return a.endDate > b.endDate});
		var omega = eventList[eventList.length - 1].endDate;
		return omega;
	}
}

function daysBetween(date1, date2) {
	var date1_ms = date1.getTime(); // as milliseconds
	var date2_ms = date2.getTime();
	var diff_ms = date2_ms - date1_ms;
	var days = Math.round(diff_ms/ONE_DAY_IN_MS);
	return days;
}

/**
 * Sort (copy of) eventList by startDate.
 * @returns first {Date}
 */
function alpha() {
	var startList = eventList.slice();
	startList.sort(function(a, b){return a.startDate > b.startDate});
	var alpha = startList[0].startDate;
	return alpha;
}

/**
 * @param lineArray data to be plotted for timeline or date
 * @returns {boolean} true for timelines, false for dates
 */
function hasDuration(lineArray) {
	var arr = lineArray.slice();
	var empty;
	arr = removeElementFromArray(empty, arr);
	var answer = (arr.length > 1);
	return answer;

	/** nested inner */
	function removeElementFromArray(e, a) {
		var answer = [];
		var i;
		for (i = 0; i < a.length; i++) {
			if (a[i] !== e) {
				answer.push(a[i]);
			}
		}
		return answer;
	}
}

/**
 * answers the label of the first match
 * assumes: parents are defined before children
 */
function findLabelByYPos(yPos) {
	for (var p = 0; p < eventList.length; p++) {
		if (yPos === eventList[p].yPos) {
			// first match wins
			return eventList[p].id;
		}
	}
}
