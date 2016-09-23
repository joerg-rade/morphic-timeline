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

	this.findParentByName = function(id) {
		for (p = 0; p < list.length; p++) {
			if (id === list[p].id) {
				// first match wins
				return list[p];
			}
		}
		return null;
	}
}

TimelineEvents.prototype.init = function(json) {
	var e,
		p,
		t,
		parentCnt = 0;
	for (var i = 0; i < json.events.length; i++) {
		e = json.events[i];
		e = new TimelineEvent(e.id, e.parent, e.startDateStr, e.endDateStr, e.colorStr, e.category);
		e.children = [];
		// at this very moment parent is still a string
		parentId = e.parent;
		p = tls.findParentById(parentId);
		// since we have only two generations we get along this way
		if (p === null) {
			e.parent = null;
			parentCnt += 1;
		} else {
			e.parent = p;
			p.children.push(e);
		}
		e.index = parentCnt;
		this.list.push(e);
	}

	this.list.forEach(function(elt) {
		elt.initLine();
	})
}

TimelineEvents.prototype.listParents = function() {
	return list;
}

TimelineEvents.prototype.findParentById = function(id) {
	for (var p = 0; p < this.list.length; p++) {
		if (id === this.list[p].id) {
			// first match wins
			return this.list[p];
		}
	}
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
	var d = new Date(this.earliestStartDate().getTime());
	var e = this.latestEndDate();
	var label;
	while (d < e) {
		scaleData.push(d);
		label = d.toDateString().split(" ");
		scaleLabels.push(label[1] + "\n" + label[2]);
		d.setDate(d.getDate() + 1);
	}
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