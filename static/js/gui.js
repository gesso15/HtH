var mainLine; // Only one global. Not super bad, I guess.

function setup() {
	createCanvas(windowWidth-16, windowHeight-16);

	mainLine = new Timeline(20, 100, windowWidth-60, 50, -3500, 2014);
	mainLine.addSegment(new Segment(-3500, 500, "Ancient History", 255, 150, mainLine));
	mainLine.addSegment(new Segment(501, 1500, "Middle Ages", 255, 125, mainLine));
	mainLine.addSegment(new Segment(1501, 1900, "Early Modern", 255, 100, mainLine));
	mainLine.addSegment(new Segment(1901, 2014, "Modern", 255, 75, mainLine));
	mainLine.selector = new Selector(mainLine);

	ghostSelector = new Selector(mainLine);
	ghostSelector.c = color(153);
}

function draw() {
	background(255);
	ghostSelector.draw();
	mainLine.draw();
}

function mouseMoved() {
	if ( mainLine.posOver(mouseX, mouseY) ) {
		ghostSelector.visible = true;
		ghostSelector.year = Math.round(mainLine.posToYear(mouseX));
		ghostSelector.xOffset = mouseX - mainLine.posX;
	}
	else { ghostSelector.visible = false; }
}

function mouseClicked() {
	if ( mainLine.posOver(mouseX, mouseY) ) {
		mainLine.selector.setYear(ghostSelector.year);
		mainLine.selector.visible = true;
	}
}




// Timeline GUI widget class.
function Timeline(x, y, w, h, s, e) {
	this.posX = x;
	this.posY = y;
	this.width = w;
	this.height = h;
	this.startYear = s;
	this.endYear = e;
	this.segments = [];
	this.selectors = [];
	this.selector = null;
}

Timeline.prototype.addSegment = function(seg) {
	this.segments.push(seg);
}

Timeline.prototype.draw = function() {
	push();
	this.selector.draw();
	translate(this.posX, this.posY);
	for (var i in this.segments) {
		this.segments[i].draw();
		translate(this.segments[i].width, 0);
	}
	pop();
};

Timeline.prototype.addSelector = function(year) {
	sel = new Selector(year, this);
	this.selectors.push(sel);
};

Timeline.prototype.posToYear = function(x) {
	return map(x, this.posX, this.posX + this.width, this.startYear, this.endYear);
}

Timeline.prototype.yearToPos = function(year) {
	return map(year, this.startYear, this.endYear, 0, this.width);
}

Timeline.prototype.spanToWidth = function(years) {
	return map(years, 0, this.endYear - this.startYear, 0, this.width);
}

Timeline.prototype.posOver = function(x, y) {
	if ( x < this.posX ) { return false; }
	if ( x > this.posX + this.width ) { return false; }
	if ( y < this.posY ) { return false; }
	if ( y > this.posY + this.height ) { return false; }
	return true;
}


// Segment class for Timeline GUI widget.
function Segment(start, end, name, labCol, fillCol, tl) {
	this.startYear = start;
	this.endYear = end;
	this.labelText = name;
	this.labelColor = labCol;
	this.fillColor = fillCol;
	this.timeline = tl;
	this.width = tl.spanToWidth(end - start);
}

Segment.prototype.draw = function() {
	push();
	noStroke();
	fill(this.fillColor);
	rect(0, 0, this.width, this.timeline.height);
	fill(this.labelColor);
	text(this.labelText, 5, 0, this.width-10, this.timeline.height);
	pop();
};


// Selector class for Timeline GUI widget.
function Selector(tl) {
	this.year = null;
	this.timeline = tl;
	this.xOffset = 0; // Hacky.
	this.visible = false;
	this.c = color(0, 0, 255);
}

Selector.prototype.setYear = function(year) {
	this.year = year;
	this.xOffset = this.timeline.yearToPos(year);
}

Selector.prototype.draw = function() {
	if (!this.visible) { return; }
	push();
	translate(this.timeline.posX, this.timeline.posY);
	translate(this.xOffset, -32);
	stroke(this.c);
	fill(this.c);
	
	// Show BC years as BC instead of negative.
	var s = abs(this.year).toString();
	if (this.year < 0) { s += ' BC'; }

	text(s, -8, -3);
	strokeWeight(2);
	strokeCap(ROUND);
	line(0, 0, 0, 30);
	line(-8, 20, 0, 30);
	line(8, 20, 0, 30);
	pop();
}