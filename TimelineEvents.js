/* Globals */
var ONE_DAY_IN_MS = 1000 * 60 * 60 * 24; // milliseconds per day
/**
 * Repository/Factory for TimelineEvent.
 */
TimelineEvents.prototype = new Object();
TimelineEvents.prototype.constructor = TimelineEvents;
TimelineEvents.uber = Object.prototype;

function TimelineEvents() {
	this.list = [];

	this.listAll = function() {
		return this.list;
	}
}

TimelineEvents.prototype.init = function(json) {
	var je,
		tle,
		parent;
	for (var i = 0; i < json.events.length; i++) {
		je = json.events[i];
		parent = tls.findById(je.parent);
		tle = new TimelineEvent(je.id, parent, je.startDateStr, je.endDateStr, je.colorStr, je.category);
		// since we have only two generations we get along this way
		if (parent) {
			parent.children.push(tle);
		}
		this.list.push(tle);
	}

	this.list = this.sort(this.list);

	var parentCnt = 0;
	this.listParents().forEach(function(tle) {
		parentCnt++;
		tle.index = parentCnt;
	})

	this.listAll().forEach(function(tle) {
		tle.initLine();
	})
}

TimelineEvents.prototype.listParents = function() {
	var parents = [];
	this.list.forEach(function(elt) {
		if (!elt.parent) {
			parents.push(elt);
		}
	});
	return this.sort(parents);
}

TimelineEvents.prototype.findById = function(id) {
	var e;
	for (var p = 0; p < this.list.length; p++) {
		e = this.list[p];
		if (id === e.id) {
			return e;
		}
	}
	return null;
}

/**
* Initializes scale label and data,
* starting with earliest startDate (alpha) and
* ending at latest endDate (omega).
*/
TimelineEvents.prototype.initScale = function() {
	var d = new Date(this.earliestStartDate().getTime() - 30 * ONE_DAY_IN_MS);
	var e = new Date(this.latestEndDate().getTime() + 30 * ONE_DAY_IN_MS);
	var label;
	while (d < e) {
		scaleData.push(d);
		label = d.toDateString().split(" ");
		scaleLabels.push(label[1] + "\n" + label[2] + "\n" + label[3]);
		d = new Date(d.getTime() + ONE_DAY_IN_MS);
	}
}

/**
 * Sort list by startDate.
 * @returns sorted Array
 */
TimelineEvents.prototype.sort = function(list) {
	var copy = list.slice();
	copy.sort(function(a, b) {
		return a.endDate.getTime() > b.endDate.getTime()
	});
	return copy;
}

/**
 * Answers the the startDate with the lowest TS.
 * @returns first {Date}
 */
TimelineEvents.prototype.earliestStartDate = function() {
	var copy = this.list.slice();
	copy.sort(function(a, b) {
		return a.startDate > b.startDate
	});
	var alpha = copy[0].startDate;
	return alpha;
}
/**
 * Answers the difference between latest endDate and earliest startDate plus some offset.
 * @returns span {int}
 */
TimelineEvents.prototype.span = function() {
	var a = this.earliestStartDate().getTime();
	var o = this.latestEndDate().getTime();
	return ((o - a) / ONE_DAY_IN_MS) + (2 * api_xInterval);
}
/**
 * Answers the most recent endDate.
 * @returns last {Date}
 */
TimelineEvents.prototype.latestEndDate = function() {
	var l = this.listAll();
	var omega = l[l.length - 1].endDate;
	return omega;
}

/**
 * @param lineArray data to be plotted
 * @returns {boolean} true for timelines, false for dates
 */
TimelineEvents.prototype.hasDuration = function(lineArray) {
	//find TimelineEvent with the identical lineArray
	var tle = this.findByLine(lineArray);
	return tle.hasDuration();
}

/**
 * Answers the first matching event.
 */
TimelineEvents.prototype.findByLine = function(lineArray) {
	for (var p = 0; p < this.list.length; p++) {
		if (lineArray === this.list[p].line) {
			return this.list[p];
		}
	}
}

TimelineEvents.prototype.isNewCategory = function(event) {
	var cat = event.category,
		pos = event.index;
	for (var p = 0; p < pos; p++) {
		if (cat === this.list[p].category) {
			return false;
		}
	}
	return true;
}