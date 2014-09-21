var mMuseumShipment;
var num_crates = 5;

/**************************************/
/****** MuseumShipment Prototype ******/
/**************************************/

function MuseumShipment(num_crates) {
	this.numCrates = num_crates;
	this.shipment = [];
	var crateGap = 10;
	var crateSize = (180-(crateGap*num_crates))/num_crates;
    for (var i = 0; i < this.numCrates; i++) {   
    	var xVal = i*(crateSize+crateGap);
    	this.shipment[i] = new Crate(xVal,0,crateSize);
    }
}

MuseumShipment.prototype.draw = function() {	
	for (var i = 0; i < this.numCrates; i++) {
      this.shipment[i].draw();
    }
}

MuseumShipment.prototype.removeCrate = function() {	
	this.numCrates--;
}
/*****************************/
/****** Crate Prototype ******/
/*****************************/

function Crate(x, y, c) {
	this.posX = x;
	this.posY = y;
	this.crateSize = c;
}

Crate.prototype.draw = function() {
	push();
	translate(this.posX, this.posY);
	//draw the crate image to the screen
	//image(img, 0, 0, img.width/2, img.height/2);
	Crate.prototype.drawCrate(this.crateSize);
	pop();
}

Crate.prototype.drawCrate = function(crate_size) {
	noStroke();

	// Draw the vertical wood planks
	plankWidth = crate_size/6;
	var delta = [3, 5, 10, 4, 7, 5]
	for (var i = 0; i*plankWidth < crate_size; i++) {
		//var r = random(10);
		fill(92,64+delta[i],51);
		rect(i*plankWidth,0,plankWidth,crate_size);
    }

	// Draw the horizontal wood planks
	fill(85,64,51);
	strokeWeight(0.5);
	stroke(0);
	rect(0, plankWidth, crate_size, plankWidth);
	rect(0, crate_size-plankWidth*2, crate_size, plankWidth);

	//Draw a border
	noFill();
	stroke(92,64,51);
	rect(0, 0, crate_size, crate_size);

	// Add the Fragile label on the box
	stroke(0);
	strokeWeight(1);
	text("F R A G I LE", plankWidth, plankWidth, crate_size, plankWidth);
}