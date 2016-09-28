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
	var je, tle,
		p,
		t,
		parentCnt = 0;
	for (var i = 0; i < json.events.length; i++) {
		je = json.events[i];
		p = tls.findParentById(je.parent);
		tle = new TimelineEvent(je.id, p, je.startDateStr, je.endDateStr, je.colorStr, je.category);
		// since we have only two generations we get along this way
		if (p === null) {
			parentCnt += 1;
		} else {
			p.children.push(tle);
		}
		tle.index = parentCnt;
		this.list.push(tle);
	}

	this.list = this.sort();

	this.list.forEach(function(elt) {
		elt.initLine();
	})
}

TimelineEvents.prototype.listParents = function() {
	var parents = [];
	 this.list.forEach(function(elt) {
	 	if (!elt.parent) {
	 		parents.push(elt);
	 	}
	 });
	 return parents;
}

TimelineEvents.prototype.findParentById = function(parentId) {
	var eid, e;
	for (var p = 0; p < this.list.length; p++) {
		e = this.list[p];
		eid = e.id;
		if (parentId === eid) {
			return e;
		}
	};
	return null;
}

/**
 * Answers the label of the first match
 */
//TODO rename to build
TimelineEvents.prototype.findLabelByYPos = function(yPos) {
	for (var p = 0; p < this.list.length; p++) {
		if (yPos === this.list[p].yPos) {
			var e = this.list[p];
			return e.label();
		}
	}
}

/**
 * Answers the category of the first match
 */
TimelineEvents.prototype.findCategoryById = function(id) {
	for (var p = 0; p < this.list.length; p++) {
		if (id === this.list[p].id) {
			var answer = this.list[p].category;
			return answer;
		}
	}
}

/**
* Initializes scale label and data,
* starting with earliest startDate (alpha) and
* ending at latest endDate (omega).
*/
TimelineEvents.prototype.initScale = function() {
	var d = new Date(this.earliestStartDate().getTime() + 30 * ONE_DAY_IN_MS);
	var e = new Date(this.latestEndDate().getTime() + 30 * ONE_DAY_IN_MS);
	var label;
	while (d < e) {
		scaleData.push(d);
		label = d.toDateString().split(" ");
		scaleLabels.push(label[1] + "\n" + label[2]);
		d = new Date(d.getTime() + ONE_DAY_IN_MS);
	}
}

/**
 * Sort list by startDate .
 * @returns sorted Array
 */
TimelineEvents.prototype.sort = function() {
	var copy = this.list.slice();
	copy.sort(function(a, b) {
		return b.endDate > a.endDate
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
	if (!alpha) {
		console,log(copy);
	}
	return alpha;
}

/**
 * Answers the most recent endDate.
 * @returns last {Date}
 */
TimelineEvents.prototype.latestEndDate = function() {
	var copy = this.list.slice();
	copy.sort(function(a, b) {
		return a.endDate < b.endDate
	});
	var omega = copy[0].endDate;
	if (!omega) {
		console.log(copy);
	}
	return omega;
}

/**
 * @param lineArray data to be plotted
 * @returns {boolean} true for timelines, false for dates
 */
TimelineEvents.prototype.hasDuration = function(lineArray) {
	//TODO find TimelineEvent by fist non empty yPos and ask it for its duration
	// calculate based on startDate / endDate - possibly after found via TimelineEvents
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