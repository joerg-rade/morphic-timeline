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

// listAll()
QUnit.test("test number of events", function(assert) {
	tls = new TimelineEvents();
	tls.init(JSON.parse(data));
	var eventList = tls.listAll();
	assert.ok(8 == eventList.length, "Passed!");
	var parentList = tls.listParents();
	var expected = 4;
	var observed = parentList.length
	assert.ok(expected == observed, "parents expected: " + expected + " observed: " + observed);
});

// tls.findParentById(id);
// tls.findLabelByYPos(yPos);
// tls.findCategoryById(id);
// tls.initScale();
// tls.earliestStartDate();
// tls.latestEndDate();
// tls.hasDuration()