var selectedDrawMode = "smooth";
var distanceVal = 100;
var sizeVal = 1;
$(document).ready(function() {
	$("#colorField").CanvasColorPicker();
	
	var drawMode = 1;
	document.getElementById("switchspan").addEventListener("click", function() {
		$("#switchspan span:nth-child(" + drawMode + ")").css({"-moz-transform" : "translate(80px, 0)"});
		if (drawMode > 2) {
			drawMode = 1;
		} else {
			drawMode++;
		}
		$("#switchspan span:nth-child(" + drawMode + ")").css({"-moz-transform" : "translate(0, 0)"});
		selectedDrawMode = $("#switchspan span:nth-child(" + drawMode + ")").html();
	});
});

var ctx;
var smoothing = false;
var lastSmooth = {x: -2, y: 0};
var points;
var texting = false;
var textPos;
var mousepos;
var textMaxDist;
var color = "green";
var currentCharacterPos = 0;
function draw() {
	var canvas = document.getElementById('canvas');
	if (canvas.getContext) {
		ctx = canvas.getContext("2d");
		fit();
		ctx.strokeStyle = color;
		canvas.addEventListener('mouseover', function(evt) {
			mousePos = getMousePos(canvas, evt);
		});
	}
	points = new Array();
	canvas.addEventListener('click', function(evt) {
		if (selectedDrawMode == "line") {
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
		} else if (selectedDrawMode == "path") {
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
		if (selectedDrawMode == "smooth" && evt.button == 0)
			smoothing = true;
		if (evt.button == 1) {
			var pixData = ctx.getImageData(mousePos.x, mousePos.y, 1, 1).data;
			color = "#" + mixColor(pixData);
			ctx.strokeStyle = color;
		}
	});
	canvas.addEventListener('mouseup', function(evt) {
		if (selectedDrawMode == "smooth") {
			smoothing = false;
			lastSmooth = {x: -2, y: 0};
		}
	});
	canvas.addEventListener('mousemove', function(evt) {
		mousePos = getMousePos(canvas, evt);
		if (selectedDrawMode == "smooth" && smoothing) {
			console.log(evt);
			// ctx.strokeStyle = color;
			ctx.strokeStyle = document.getElementById("colorField").style.backgroundColor;
			ctx.lineJoin = "round";
			ctx.lineWidth = sizeVal;
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
				case 46: // delete - clear canvas
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					points = [];
				break;
				case 83: // s - save as png
					var data = canvas.toDataURL("image/png");
					var win = window.open(data, '_blank');
					win.focus();
				break;
				case 84: // t - text mode on
					texting = true;
				break;
				case 13: // enter - text mode off
					texting = false;
				break;
				case 70: // f ?
					// fill
					fill();
				break;
			}
		} else {			
			ctx.fillStyle = color;
			ctx.font = "normal " + sizeVal + "px Arial";
			if (!textMaxDist)
				textMaxDist = ctx.measureText(String.fromCharCode(evt.keyCode)).height;
			if (!textPos)
				textPos = mousePos;
			if (calcDistance(textPos, mousePos) > textMaxDist) {
				currentCharacterPos = 0;
				textPos = mousePos;
			}
			ctx.fillText(String.fromCharCode(evt.keyCode), currentCharacterPos + mousePos.x, textPos.y);
			currentCharacterPos += ctx.measureText(String.fromCharCode(evt.keyCode)).width;
			textMaxDist = ctx.measureText(String.fromCharCode(evt.keyCode)).width;
		}
	}
}
function fit() {
	ctx.canvas.width  = window.innerWidth;
	ctx.canvas.height = window.innerHeight;
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
	// 888
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
