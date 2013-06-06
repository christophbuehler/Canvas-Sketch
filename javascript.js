var ctx;
var timer, timer2;
var distanceVal = 100;
var thecolor = "#111111";
var thicknessVal = 1;
var modeVal = 0;
var lastDetail = 1;
var settings = new Array("color", "distance", "thickness", "mode");
var selectedSetting = 0;
var drawMode = new Array("linear", "smooth");
var selectedDrawMode = 0;
var smoothing = false;
var detail;
var lastSmooth = {x: -2, y: 0};
var points;
function draw() {
	var canvas = document.getElementById('canvas');
	if (canvas.getContext) {
		ctx = canvas.getContext("2d");
		fit();
		ctx.strokeStyle = thecolor;
	}
	ctx.fillStyle = "green";
	ctx.font = "bold 16px Arial";
	ctx.fillText("Canvas Sketch by Christoph Buehler", 10, 30);
	points = new Array();
	canvas.addEventListener('click', function(evt) {
		if (drawMode[selectedDrawMode] == "linear") {
			var mousePos = getMousePos(canvas, evt);
			points.push(mousePos);
			ctx.beginPath();
			for (var i=0;i<points.length;i++) {
				if (calcDistance(points[points.length-1], points[i]) < distanceVal) {
					ctx.lineWidth = thicknessVal;
					ctx.moveTo(points[points.length-1].x, points[points.length-1].y);
					ctx.lineTo(points[i].x, points[i].y);
					ctx.stroke();
				}
			}
			ctx.closePath();
		}
	});
	canvas.addEventListener('mousedown', function(evt) {
		if (drawMode[selectedDrawMode] == "smooth")
			smoothing = true;
	});
	canvas.addEventListener('mouseup', function(evt) {
		if (drawMode[selectedDrawMode] == "smooth") {
			smoothing = false;
			lastSmooth = {x: -2, y: 0};
		}
	});
	canvas.addEventListener('mousemove', function(evt) {
		if (drawMode[selectedDrawMode] == "smooth" && smoothing) {
			var mousePos = getMousePos(canvas, evt);
			ctx.strokeStyle = thecolor;
			ctx.lineJoin = "round";
			ctx.lineWidth = thicknessVal+5;
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
		if (evt.keyCode == 46) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = "green";
			ctx.font = "bold 16px Arial";
			ctx.fillText("Canvas Sketch by Christoph Buehler", 10, 30);
			points = [];
		} else if (evt.keyCode == 83) {
			var data = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
		}
		else
			switchSettings(evt.keyCode);
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
		case "thickness":
			detail = ('wheelDelta' in evt) ? evt.wheelDelta/120 : (-40 * evt.detail)/120;
			thicknessVal += detail;
			lastDetail += detail;
			if (thicknessVal < 1)
				thicknessVal = 1;
			thickness();
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
		case "thickness":
		thickness();
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
	ctx.fillText("distance: "+distanceVal, canvas.width-120, 30);
	timer = setTimeout(hideSettings, 2000);
}
function color() {
	hideSettings();
	clearTimeout(timer);
	
	ctx.fillStyle = "green";
	ctx.font = "normal 16px Arial";
	
	thecolor = "#"+((1<<24)*Math.random()|0).toString(16);
	ctx.strokeStyle = thecolor;
	
	ctx.fillText("color: "+thecolor, canvas.width-120, 30);
	timer = setTimeout(hideSettings, 2000);
}
function thickness() {
	hideSettings();
	clearTimeout(timer);
	ctx.fillStyle = "green";
	ctx.font = "normal 16px Arial";
	ctx.fillText("thickness: "+thicknessVal, canvas.width-120, 30);
	timer = setTimeout(hideSettings, 2000);
}
function mode() {
	hideSettings();
	clearTimeout(timer);
	ctx.fillStyle = "green";
	ctx.font = "normal 16px Arial";
	ctx.fillText("mode: "+drawMode[selectedDrawMode], canvas.width-120, 30);
	timer = setTimeout(hideSettings, 2000);
}
function hideSettings() {
	ctx.clearRect(canvas.width-200, 0, 200, 50);
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
