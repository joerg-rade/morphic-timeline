function setup() {
			initData();
			initScale();
			
			/**
			 * Turn Strings into Objects (date, color, parent).
			 * Link children to their parent based on String value of filed 'parent' of the json data. 
			 * Type of field parent changes from string to Object!
			 */
			function initData() {
				var e, p, t, rgb;
				var jsonData = JSON.parse(data);
				for (i = 0; i < jsonData.events.length; i++) {
					e = jsonData.events[i];
					e.startDate = new Date(e.startDate);
					e.endDate = new Date(e.endDate);
					if (e.color !== null) {
						rgb = hexToRgb(e.color);
						e.color = new Color(rgb.r, rgb.g, rgb.b);
					}
					e.child = null;
					// at this very moment parent is still a string
					t = e.parent;
					p = findParentByName(t); 
					if (p === null) {
						e.parent = null;
					} else {
						e.parent = p;
						p.child = e;
					}
					eventList.push(e);
				}
				/** nested - only called by enclosing function */
				function findParentByName(title) {
					for (p = 0; p < eventList.length; p++) {
						if (title === eventList[p].title) {
							// first match wins
							return eventList[p];
						}
					}
					return null;
				}
				/** nested - only called by enclosing function */
				function hexToRgb(hex) {
					var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
					return result ? {
						r: parseInt(result[1], 16),
						g: parseInt(result[2], 16),
						b: parseInt(result[3], 16)
					} : null;
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

				/** 
				 * Sort eventList by endDate.
				 * @returns last {Date}
				 */
				/** nested - only called by enclosing function */
				function omega() {
					eventList.sort(function(a, b){return a.endDate > b.endDate});
					var omega = eventList[eventList.length - 1].endDate;
					return omega;
				}	
			}
						
			function daysBetween(date1, date2) {
				var msPerDay = 1000 * 60 * 60 * 24; // 1 day in milliseconds
				var date1_ms = date1.getTime(); // as milliseconds
				var date2_ms = date2.getTime();
				var diff_ms = date2_ms - date1_ms;
				var days = Math.round(diff_ms/msPerDay); 
				return days;
			}
			
}

function line(event, index) {
var lineArray = [];
	var empty, i;
	if (event) {
		var d = new Date(alpha());
		while (d < event.startDate) {
			lineArray.push(empty);
			d.setDate(d.getDate() + 1);
		}
		i = index;
		if (event.parent !== null) {
			i = parentIndex(event);
		}
		var yPos = api_timelineOffset - (i * api_timelineHeight);
		while (d < event.endDate) {
			lineArray.push(yPos);
			d.setDate(d.getDate() + 1);
		}
	}
	return lineArray;

	/** nested - find the index of the parent in list */
	function parentIndex(event) {
		var idx;
		if (event.parent !== null) {
			idx = eventList.indexOf(event.parent);
		}
		//TODO add recursive call
		return idx;
	}	
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
 * @returns {boolean} true for dates, false for timelines
 */
function hasDuration(lineArray) {
	var arr = lineArray.slice();
	var empty;
	arr = removeElementFromArray(empty, arr);
	var answer = (arr.length > 1);
	return answer;
	
	/** nested - only called by enclosing function */
	function removeElementFromArray(e, a) {
		var answer = [];
		for (var i = 1; i <= a.length; i++) {
			if (a[i] != e) {
				answer.push(a[i]);
			}
		}
		return answer;
	}
}
