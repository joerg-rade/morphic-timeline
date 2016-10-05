// given
var data = '{"events" : [' +
	'{ "id":"Release 2.12", "startDateStr":"2016-06-15", "endDateStr":"2016-11-23", "colorStr":"#6A5ACD","category":"" }' +
	',{ "id":"Test", "startDateStr":"2016-10-01", "endDateStr":"2016-11-15", "colorStr":"#00FF00", "parent":"Release 2.12", "category":"1" }' +
	',{ "id":"GoLive", "startDateStr":"2016-11-23", "parent":"Release 2.12","category":"2" }' +
	',{ "id":"Release 3.3", "startDateStr":"2016-04-11", "endDateStr":"2016-09-05", "colorStr":"#87CEEB","category":"" }' +
	',{ "id":"Release 3.4", "startDateStr":"2016-07-01", "endDateStr":"2016-12-31", "colorStr":"#87CEEB","category":"" }' +
	',{ "id":"Release 3.5", "startDateStr":"2016-10-01", "endDateStr":"2017-05-06", "colorStr":"#87CEEB","category":"" }' +
	',{ "id":"Test", "startDateStr":"2017-01-10", "endDateStr":"2017-04-15", "colorStr":"#00FF00", "parent":"Release 3.5", "category":"1" }' +
	',{ "id":"GoLive", "startDateStr":"2017-05-06", "parent":"Release 3.5", "category":"2" }' +
	']}';

QUnit.test("test number of events", function(assert) {
	setup();
	var expected = 8;
	var observed = tls.listAll().length;
	assert.ok(expected == observed, msg(expected, observed));
});

QUnit.test("test number of parents", function(assert) {
	setup();
	var expected = 4;
	var observed = tls.listParents().length
	assert.ok(expected == observed, msg(expected, observed));
});

QUnit.test("test earliestStartDate", function(assert) {
	setup();
	var expected = new Date("2016-04-11").getTime();
	var observed = tls.earliestStartDate().getTime();
	assert.ok(expected === observed, msgDate(expected, observed));
});

QUnit.test("test latestEndDate", function(assert) {
	setup();
	var expected = new Date("2017-05-06").getTime();
	var observed = tls.latestEndDate().getTime();
	assert.ok(expected === observed, msgDate(expected, observed));
});

// endDate[i] <= [endDate[i+1]
QUnit.test("test parent sorting", function(assert) {
	setup();
	var l = tls.listParents();
	var lastDT = 0;
	var currentDT;
	var e;
	for (var p = 0; p < l.length; p++) {
		e = l[p];
		currentDT = e.endDate.getTime();
		assert.ok(lastDT < currentDT, "last endDate < current endDate: " + e.id + " " + timeToString(lastDT) + "/" + timeToString(currentDT));
		lastDT = currentDT;
	}
});

QUnit.test("test event sorting", function(assert) {
	setup();
	var l = tls.listAll();
	var lastDT = 0;
	var currentDT;
	var e;
	for (var p = 0; p < l.length; p++) {
		e = l[p];
		currentDT = e.endDate.getTime();
		assert.ok(lastDT <= currentDT, "last endDate <= current endDate: " + e.id + " " + timeToString(lastDT) + "/" + timeToString(currentDT));
		lastDT = currentDT;
	}
});

QUnit.test("test event index", function(assert) {
	setup();
	var l = tls.listAll();
	var lastIdx = 0;
	var currentIdx;
	var e;
	for (var p = 0; p < l.length; p++) {
		e = l[p];
		currentIdx = e.getIndex();
		assert.ok(lastIdx <= currentIdx, "last index <= current index: " + e.id + " " + lastIdx + "/" + currentIdx);
		lastIdx = currentIdx;
	}
});


QUnit.test("test number of children", function(assert) {
	setup();
	var l = tls.listAll();
	var parent,
		expected,
		observed;
	//
	parent = tls.findById("Release 2.12");
	expected = 2;
	observed = parent.children.length;
	assert.ok(expected == observed, msg(expected, observed));
	//
	parent = tls.findById("Release 3.3");
	expected = 0;
	observed = parent.children.length;
	assert.ok(expected == observed, msg(expected, observed));
	//
	parent = tls.findById("Release 3.4");
	expected = 0;
	observed = parent.children.length;
	assert.ok(expected == observed, msg(expected, observed));
	//
	parent = tls.findById("Release 3.5");
	expected = 2;
	observed = parent.children.length;
	assert.ok(expected == observed, msg(expected, observed));
});

QUnit.test("test yPos", function(assert) {
	// children must have the same yPos as their parent
	setup();
	var l = tls.listAll();
	var e,
		c,
		kids;
	for (var p = 0; p < l.length; p++) {
		e = l[p];
		if (!e.parent) {
			kids = e.children;
			for (c = 0; c < kids.length; c++) {
				assert.ok(e.yPos === kids[c].yPos, "parent: " + e.id + " child: " + kids[c].id);
			}
		}
	}
});

QUnit.test("test hasDuration", function(assert) {
	setup();
	var l = tls.listAll();
	var e;
	for (var p = 0; p < l.length; p++) {
		e = l[p];
		if (!e) {
			alert();
		}
		if (e.id === "GoLive") {
			assert.ok(e.hasDuration() === false, "startDate: " + e.startDate.toDateString() + " endDate: " + e.endDate.toDateString());
		} else {
			assert.ok(e.hasDuration() === true, "startDate: " + e.startDate.toDateString() + " endDate: " + e.endDate.toDateString());
		}
	}
});

QUnit.test("test invalid dates", function(assert) {
	var invalidData = '{"events" : [' +
		'{ "id":"Invalid", "startDateStr":"", "endDateStr":"", "colorStr":"","category":"" }' +
		']}';
	tls = new TimelineEvents();
	try {
		tls.init(JSON.parse(invalidData));
	} catch (err) {
		assert.ok(err.message === "Invalid Date", invalidData);
	} finally {
		var l = tls.listAll();
		assert.ok(l.length === 0, "no valid events");
	}
});
// tls.findLabelByYPos(yPos);
// tls.findCategoryById(id);
// tls.initScale();

function setup() {
	// the global var tls is referenced in the implementation
	tls = new TimelineEvents();
	tls.init(JSON.parse(data));
}
function msg(expected, observed) {
	return ("expected: " + expected + " observed: " + observed);
}
function msgDate(expected, observed) {
	return msg(timeToString(expected), timeToString(observed));
}
function timeToString(time) {
	return new Date(time).toDateString();
}