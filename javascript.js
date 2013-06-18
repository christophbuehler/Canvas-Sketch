var ctx;
var timer, timer2;
var distanceVal = 100;
var thecolor = "#111111";
var sizeVal = 1;
var modeVal = 0;
var lastDetail = 1;
var settings = new Array("color", "distance", "size", "mode");
var selectedSetting = 0;
var drawMode = new Array("line", "path", "smooth");
var selectedDrawMode = 0;
var smoothing = false;
var detail;
var lastSmooth = {x: -2, y: 0};
var points;
var texting = false;
var textPos;
var mousepos;
var textMaxDist;
var currentCharacterPos = 0;
function draw() {
	var canvas = document.getElementById('canvas');
	if (canvas.getContext) {
		ctx = canvas.getContext("2d");
		fit();
		ctx.strokeStyle = thecolor;
		canvas.addEventListener('mouseover', function(evt) {
			mousePos = getMousePos(canvas, evt);
		});
	}
	ctx.fillStyle = "green";
	ctx.font = "bold 16px Arial";
	ctx.fillText("Canvas Sketch by Christoph Buehler", 10, 50);
	points = new Array();
	canvas.addEventListener('click', function(evt) {
		if (drawMode[selectedDrawMode] == "line") {
			points.push(mousePos);
			ctx.beginPath();
			for (var i=0;i<points.length;i++) {
				if (calcDistance(points[points.length-1], points[i]) < distanceVal) {
					ctx.lineWidth = sizeVal;
					ctx.moveTo(points[points.length-1].x, points[points.length-1].y);
					ctx.lineTo(points[i].x, points[i].y);
					ctx.stroke();
				}
			}
			ctx.closePath();
		} else if (drawMode[selectedDrawMode] == "path") {
			points.push(mousePos);
			if (points.length >= 2) {
				ctx.beginPath();
				ctx.lineWidth = sizeVal;
				ctx.moveTo(points[points.length-2].x, points[points.length-2].y);
				ctx.lineTo(mousePos.x, mousePos.y);
				ctx.stroke();
				ctx.closePath();
			}
		}
	});
	canvas.addEventListener('mousedown', function(evt) {
		if (drawMode[selectedDrawMode] == "smooth" && evt.button == 0)
			smoothing = true;
		if (evt.button == 1) {
			var pixData = ctx.getImageData(mousePos.x, mousePos.y, 1, 1).data;
			var newColor = pixData[0].toString(16) + pixData[1].toString(16) + pixData[2].toString(16);
			thecolor = "#"+newColor;
			ctx.strokeStyle = thecolor;
		}
	});
	canvas.addEventListener('mouseup', function(evt) {
		if (drawMode[selectedDrawMode] == "smooth") {
			smoothing = false;
			lastSmooth = {x: -2, y: 0};
		}
	});
	canvas.addEventListener('mousemove', function(evt) {
		mousePos = getMousePos(canvas, evt);
		if (drawMode[selectedDrawMode] == "smooth" && smoothing) {
			ctx.strokeStyle = thecolor;
			ctx.lineJoin = "round";
			ctx.lineWidth = sizeVal+5;
			ctx.beginPath();
			if (lastSmooth.x != -2)
				ctx.moveTo(lastSmooth.x, lastSmooth.y);
			else
				ctx.moveTo(mousePos.x-1, mousePos.y-1);
			
			ctx.lineTo(mousePos.x, mousePos.y);
			ctx.closePath();
			ctx.stroke();
			lastSmooth = mousePos;
		}
	});
	window.addEventListener('keydown',doKeyDown,true);
	function doKeyDown(evt) {
		if (!texting || evt.keyCode == 46 || evt.keyCode == 37 || evt.keyCode == 39 || evt.keyCode == 13) {
			switch (evt.keyCode) {
				case 46:
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					ctx.fillStyle = "green";
					ctx.font = "bold 16px Arial";
					ctx.fillText("Canvas Sketch by Christoph Buehler", 10, 50);
					points = [];
				break;
				case 83:
					var data = canvas.toDataURL("image/png");
					var win = window.open(data, '_blank');
					win.focus();
				break;
				case 84:
					texting = true;
				break;
				case 13:
					texting = false;
				break;
				case 70:
					// fill
					fill();
				break;
				default:
					switchSettings(evt.keyCode);
			}	
		} else {			
			ctx.fillStyle = thecolor;
			ctx.font = "normal " + (sizeVal+10) + "px Arial";
		
			if (!textMaxDist)
				textMaxDist = ctx.measureText(String.fromCharCode(evt.keyCode)).height;
			
			if (!textPos)
				textPos = mousePos;
			
			if (calcDistance(textPos, mousePos) > textMaxDist) {
				currentCharacterPos = 0;
				textPos = mousePos;
			}
			
			ctx.fillText(String.fromCharCode(evt.keyCode), currentCharacterPos+mousePos.x, textPos.y);
			currentCharacterPos += ctx.measureText(String.fromCharCode(evt.keyCode)).width;
			textMaxDist = ctx.measureText(String.fromCharCode(evt.keyCode)).width;
		}
	}
	// IE9, Chrome, Safari, Opera
	canvas.addEventListener("mousewheel", wheel, false);
	// Firefox
	canvas.addEventListener("DOMMouseScroll", wheel, false);
}
function wheel(evt) {
	clearTimeout(timer2);
	switch(settings[selectedSetting]) {
		case "color":
			color();
		break;
		case "distance":
			detail = ('wheelDelta' in evt) ? evt.wheelDelta/60 : (-40 * evt.detail)/60;
			distanceVal += ((detail > 0 && lastDetail < 0)||(detail < 0 && lastDetail > 0)) ? detail*-1 : detail+lastDetail;
			lastDetail += detail;
			timer2 = setTimeout(function(){lastDetail=1;}, 200);
			if (distanceVal < 0)
				distanceVal = 0;
			distance();
		break;
		case "size":
			detail = ('wheelDelta' in evt) ? evt.wheelDelta/120 : (-40 * evt.detail)/120;
			sizeVal += detail;
			lastDetail += detail;
			if (sizeVal < 1)
				sizeVal = 1;
			size();
		break;
		case "mode":
			detail = ('wheelDelta' in evt) ? evt.wheelDelta : (-40 * evt.detail);
			modeVal = detail;
			if (modeVal < 0)
				selectedDrawMode--;
			else
				selectedDrawMode++;
			if (selectedDrawMode <= -1)
				selectedDrawMode = drawMode.length-1;
			else if (selectedDrawMode >= drawMode.length)	
				selectedDrawMode = 0;
			mode();
		break;
	}
}
function switchSettings(code) {
	if (code == 39)
		selectedSetting++;
	else if (code == 37)
		selectedSetting--;
	if (selectedSetting <= -1)
		selectedSetting = settings.length-1;
	else if (selectedSetting >= settings.length)	
		selectedSetting = 0;
	switch(settings[selectedSetting]) {
		case "color":
		color();
		break;
		case "distance":
		distance();
		break;
		case "size":
		size();
		break;
		case "mode":
		mode();
		break;
	}
}
function distance() {
	hideSettings();
	clearTimeout(timer);
	ctx.fillStyle = "green";
	ctx.font = "normal 16px Arial";
	ctx.fillText("distance: "+distanceVal, canvas.width-120, 50);
	timer = setTimeout(hideSettings, 2000);
}
function color() {
	hideSettings();
	clearTimeout(timer);
	
	ctx.fillStyle = "green";
	ctx.font = "normal 16px Arial";
	
	thecolor = "#"+((1<<24)*Math.random()|0).toString(16);
	ctx.strokeStyle = thecolor;

	ctx.fillText("color: "+thecolor, canvas.width-120, 50);
	timer = setTimeout(hideSettings, 2000);
}
function size() {
	hideSettings();
	clearTimeout(timer);
	ctx.fillStyle = "green";
	ctx.font = "normal 16px Arial";
	ctx.fillText("size: "+sizeVal, canvas.width-120, 50);
	timer = setTimeout(hideSettings, 2000);
}
function mode() {
	hideSettings();
	clearTimeout(timer);
	ctx.fillStyle = "green";
	ctx.font = "normal 16px Arial";
	ctx.fillText("mode: "+drawMode[selectedDrawMode], canvas.width-120, 50);
	timer = setTimeout(hideSettings, 2000);
	if (drawMode[selectedDrawMode] == "path" || drawMode[selectedDrawMode] == "smooth") {
		settings = new Array("color", "effect", "size", "mode");
		console.log(drawMode[selectedDrawMode]);
	} else
		settings = new Array("color", "distance", "size", "mode");
}
function hideSettings() {
	ctx.clearRect(canvas.width-200, 0, 200, 60);
}
function fit() {
	ctx.canvas.width  = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
	ctx.fillStyle = "green";
	ctx.font = "bold 16px Arial";
	ctx.fillText("Canvas Sketch by Christoph Buehler", 10, 50);
	points=[];
}
function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}
function calcDistance(point1, point2) {
	var xs = 0;
	var ys = 0;
	xs = point2.x - point1.x;
	xs = xs * xs;
	ys = point2.y - point1.y;
	ys = ys * ys;
	return Math.sqrt( xs + ys );
}
function fill() {
	console.log("fill");
	var pixData = ctx.getImageData(mousePos.x, mousePos.y, 1, 1).data;
	var pixelSelection = new Array();
	var foundNeighbour = false;
	var finalPixels = new Array();
	
	finalPixels.push(mousePos.x, mousePos.y);
	
	var currentPixel = {x: mousePos.x, y: mousePos.y};
	ifColorTrue(currentPixel, mixColor(pixData));
	
}
function ifColorTrue(position, color) {
	console.log(color);
	if (mixColor(ctx.getImageData(position.x-1, position.y-1, 1, 1).data) == color) {
		ifColorTrue({x: position.x-1, y: position.y-1}, color);
		ctx.getImageData(position.x-1, position.y-1, 1, 1).data = color;
	}
	if (mixColor(ctx.getImageData(position.x, position.y-1, 1, 1).data) == color) {
		ifColorTrue({x: position.x, y: position.y-1}, color);
		ctx.getImageData(position.x, position.y-1, 1, 1).data = color;
	}
	if (mixColor(ctx.getImageData(position.x+1, position.y-1, 1, 1).data) == color) {
		ifColorTrue({x: position.x+1, y: position.y-1}, color);
		ctx.getImageData(position.x+1, position.y-1, 1, 1).data = color;
	}
	if (mixColor(ctx.getImageData(position.x-1, position.y, 1, 1).data) == color) {
		ifColorTrue({x: position.x-1, y: position.y}, color);
		ctx.getImageData(position.x-1, position.y, 1, 1).data = color;
	}
	if (mixColor(ctx.getImageData(position.x+1, position.y, 1, 1).data) == color) {
		ifColorTrue({x: position.x+1, y: position.y}, color);
		ctx.getImageData(position.x+1, position.y, 1, 1).data = color;
	}
	if (mixColor(ctx.getImageData(position.x-1, position.y+1, 1, 1).data) == color) {
		ifColorTrue({x: position.x-1, y: position.y+1}, color);
		ctx.getImageData(position.x-1, position.y+1, 1, 1).data = color;
	}
	if (mixColor(ctx.getImageData(position.x, position.y+1, 1, 1).data) == color) {
		ifColorTrue({x: position.x, y: position.y+1}, color);
		ctx.getImageData(position.x, position.y+1, 1, 1).data = color;
	}
	if (mixColor(ctx.getImageData(position.x+1, position.y+1, 1, 1).data) == color) {
		ifColorTrue({x: position.x+1, y: position.y+1}, color);
		ctx.getImageData(position.x+1, position.y+1, 1, 1).data = color;
	}
}
function mixColor(pixData) {
	var newColor = pixData[0].toString(16) + pixData[1].toString(16) + pixData[2].toString(16);
	return newColor;
}
