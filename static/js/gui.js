var mainLine; // Only one global. Not super bad, I guess.

function setup() {
	createCanvas(windowWidth-16, windowHeight-16);

	mainLine = new Timeline(120, 20, windowWidth-200, 50, 501, 2014);
	//mainLine.addSegment(new Segment(-3500, 500, "Ancient History", 255, 150, mainLine));
	mainLine.addSegment(new Segment(501, 1500, "Middle Ages", 255, 125, mainLine));
	mainLine.addSegment(new Segment(1501, 1900, "Early Modern", 255, 100, mainLine));
	mainLine.addSegment(new Segment(1901, 2014, "Modern", 255, 75, mainLine));

	pin = new Pin(null, mainLine, color(0, 153, 153), color(220, 240, 240), 30);
	mainLine.setActivePin(pin);
}

function draw() {
	background(255);
	mainLine.draw();
}

function mouseMoved() {
	mainLine.mouseMoved();
}

function mouseClicked() {
	mainLine.mouseClicked();
}

// Helper Functions
function yearToString(year) {
	// Show BC years as BC instead of negative.
	var s = abs(year).toString();
	if (this.year < 0) { s += ' BC'; }
	return s;
}

function mouseOver(box) {
// The 'box' must have posX, posY, width, and height.
	if ( mouseX < box.posX ) { return false; }
	if ( mouseX > box.posX + box.width ) { return false; }
	if ( mouseY < box.posY ) { return false; }
	if ( mouseY > box.posY + box.height ) { return false; }
	return true;
}




// Timeline GUI widget class.
function Timeline(x, y, width, height, start, end) {
	this.posX = x;
	this.posY = y;
	this.width = width;
	this.height = height;
	this.startYear = start;
	this.endYear = end;
	this.segments = [];
	this.pins = [];		// Let's call the objects on the timeline 'pins'.
	this.activePin = null;
	this.plusButton = new Button("+", 0, 0, 20, 20, false);
	this.minusButton = new Button("-", 0, 0, 20, 20, false);
	this.doneButton = new Button ("CONFIRM", 0, 0, 50, 15, false);
}

Timeline.prototype.draw = function() {
	push();
	translate(this.posX, this.posY);
	
	push();
	for (var i in this.segments) {
		this.segments[i].draw();
		translate(this.segments[i].width, 0);
	}
	pop();

	push();
	translate(-this.posX, -this.posY);
	this.plusButton.draw();
	this.minusButton.draw();
	this.doneButton.draw();
	pop();
	
	for (var i in this.pins) { this.pins[i].draw(); }
	this.activePin.draw();
	
	pop();
};

Timeline.prototype.mouseMoved = function() {
	if ( mouseOver(this) && this.activePin != null ) {
		this.moveActivePinTo(this.posToYear(mouseX));
	}
};

Timeline.prototype.mouseClicked = function() {
	if ( mouseOver(this.plusButton) && this.activePin != null ) {
		this.moveActivePinTo(this.activePin.year + 1);
	}
	if ( mouseOver(this.minusButton) && this.activePin != null ) {
		this.moveActivePinTo(this.activePin.year - 1);
	}
	if ( mouseOver(this.doneButton) && this.activePin != null ) {
		// TODO(jettisonjoe): Make a done button and stuff for it to do.
	}
};

Timeline.prototype.addSegment = function(seg) {
	this.segments.push(seg);
};

Timeline.prototype.addPin = function(pin) {
	this.pins.push(pin);
};

Timeline.prototype.setActivePin = function(pin) {
	this.activePin = pin;
	this.updateButtonPos();
	this.plusButton.visible = true;
	this.minusButton.visible = true;
	this.doneButton.visible = true;
};

Timeline.prototype.moveActivePinTo = function(year) {
	this.activePin.setYear(year);
	this.updateButtonPos();
};

Timeline.prototype.updateButtonPos = function() {
	var pin = this.activePin;
	this.plusButton.moveTo(
		this.posX + pin.xOffset + pin.width/2 + 6,
		this.posY + this.height + pin.yOffset - this.plusButton.height/2);
	this.minusButton.moveTo(
		this.posX + pin.xOffset - pin.width/2 - 6 - this.minusButton.width,
		this.posY + this.height + pin.yOffset - this.minusButton.height/2);
	this.doneButton.moveTo(
		this.posX + pin.xOffset - this.doneButton.width/2,
		this.posY + this.height + pin.yOffset + this.doneButton.height + 20);
};

Timeline.prototype.posToYear = function(x) {
	var r = map(x, this.posX, this.posX + this.width, this.startYear, this.endYear);
	return Math.round(r);
};

Timeline.prototype.yearToPos = function(year) {
	return map(year, this.startYear, this.endYear, 0, this.width);
};

Timeline.prototype.spanToWidth = function(years) {
	return map(years, 0, this.endYear - this.startYear, 0, this.width);
};

Timeline.prototype.posOver = function(x, y) {
	if ( x < this.posX ) { return false; }
	if ( x > this.posX + this.width ) { return false; }
	if ( y < this.posY ) { return false; }
	if ( y > this.posY + this.height ) { return false; }
	return true;
};

Timeline.prototype.midYear = function() {
	return this.posToYear(this.width/2);
};


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


// "Pin" GUI element for objects on the timeline.
function Pin(img, timeline, stroke, fill, yOffset) {
	this.image = img;
	this.timeline = timeline;
	this.strokeColor = stroke;
	this.fillColor = fill;
	this.yOffset = yOffset;
	this.year = timeline.midYear();
	this.xOffset = timeline.yearToPos(this.year);
	this.solution = null;
	this.width = 40;
	this.height = 40;
}

Pin.prototype.draw = function() {
	push();
	
	// Styling.
	stroke(this.strokeColor);
	fill(this.fillColor);
	strokeWeight(2);
	strokeCap(ROUND);	
	translate(this.xOffset, this.timeline.height/2);
	fill(this.strokeColor);
	ellipse(0, 0, 10, 10);
	fill(this.fillColor);
	line(0, 0, 0, this.yOffset);
	translate(-this.width/2, this.yOffset);
	rect(0, 0, this.width, this.height);
	strokeWeight(1);
	text(yearToString(this.year), 0, this.height+10);
	pop();
};

Pin.prototype.setYear = function(year) {
	this.year = year;
	this.xOffset = this.timeline.yearToPos(year);
};


function Button(label, x, y, width, height, visible) {
	this.posX = x;
	this.posY = y;
	this.label = label;
	this.width = width;
	this.height = height;
	this.visible = visible;
}

Button.prototype.draw = function() {
	if ( !this.visible ) { return; }
	push();
	translate(this.posX, this.posY);
	noFill();
	rect(0, 0, this.width, this.height);
	text(this.label, 2, this.height-5);
	pop();
};

Button.prototype.moveTo = function(x, y) {
	this.posX = x;
	this.posY = y;
};