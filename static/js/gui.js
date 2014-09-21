var mainLine;
var canvas;
var spacer;
var boxes;
var PIN_INDEX = 0;
var PIN_STROKE;
var PIN_FILL;
var PIN_HEX;
var SPACER_SIZE = 165;

function setup() {

	PIN_STROKE = [ color(0, 153, 153),
                   color(153, 0, 153),
                   color(153, 153, 0),
                   color(0, 0, 153),
                   color(0, 153, 0) ];
	PIN_FILL = [ color(220, 240, 240),
	             color(240, 220, 240),
	             color(240, 240, 220),
	             color(220, 220, 240),
	             color(220, 240, 220) ];
	PIN_HEX = [ '#009999',
	            '#990099',
	            '#999900',
	            '#000099',
	            '#009900' ];
	
	canvas = createCanvas(windowWidth, SPACER_SIZE);
	canvas.position(0, 0);

	mMuseumShipment = new MuseumShipment(num_crates);

	spacer = getElement('timeline');
	spacer.size(0, SPACER_SIZE);

	mainLine = new Timeline(50, 32, windowWidth-100, 50, 501, 2014);
	//mainLine.addSegment(new Segment(-3500, 500, "Ancient History", 255, 150, mainLine));
	mainLine.addSegment(new Segment(501, 1500, "Middle Ages", 255, 125, mainLine));
	mainLine.addSegment(new Segment(1501, 1900, "Early Modern", 255, 100, mainLine));
	mainLine.addSegment(new Segment(1901, 2014, "Modern", 255, 75, mainLine));

	setFirstPin();
}

function draw() {
	push()
	fill(255);
	noStroke();
	rect(0, 0, width, SPACER_SIZE);
	pop();
	mainLine.draw();

	if ( mMuseumShipment.numCrates > 0 ) {
		drawBoxes();
	}
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

function setFirstPin() {
	var pin = new Pin(null, mainLine, PIN_STROKE[0], PIN_FILL[0], 28);
	mainLine.setActivePin(pin);
	getElement('artifact-image').style('border', 'thick solid ' + PIN_HEX[PIN_INDEX]);
}

function growSpacer() {
	SPACER_SIZE += mainLine.pins[mainLine.pins.length-1].height + 14;
	spacer.size(0, SPACER_SIZE);
	canvas.size(windowWidth, SPACER_SIZE);
	canvas.position(0, 0);
}

function drawBoxes() {
	push();
	fill(0);
	translate(50, 19);
	text("REMAINING ARTIFACTS:", 0, 0);
	translate(120, -14);
    mMuseumShipment.draw();
    pop();
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
	
	if (this.activePin != null) { this.activePin.draw(); }
	for (var i in this.pins) { this.pins[i].draw(); }
	
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
		this.addPin(this.activePin);
		submitGuess();
		clear();
		PIN_INDEX++;
		this.plusButton.visible = false;
		this.minusButton.visible = false;
		this.doneButton.visible = false;
		this.activePin = null;
	}
};

Timeline.prototype.nextPin = function() {
	growSpacer();
	var newY = this.pins[this.pins.length-1].yOffset + this.pins[this.pins.length-1].height + 14;
	var pin = new Pin(null, this, PIN_STROKE[PIN_INDEX],
	  				  PIN_FILL[PIN_INDEX], newY);
	this.setActivePin(pin);
	getElement('artifact-image').style('border', 'thick solid ' + PIN_HEX[PIN_INDEX]);
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
	displayGuess(year);
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
	textAlign(CENTER);
	text(this.label, this.width/2, this.height/2+4);
	pop();
};

Button.prototype.moveTo = function(x, y) {
	this.posX = x;
	this.posY = y;
};