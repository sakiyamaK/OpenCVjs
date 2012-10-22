var IplImage = function(){
	width: 0;
	height: 0;
	canvas: null;
	imageData: null;
	RGBA: null;
}

var CvHistogram = function(){
	type;
	bins;
	thres;
	thres2;
	mat;
}

var Point = function(){
	x: 0;
	y: 0;
}

var Size = function(){
	width: 0;
	height: 0;
}
var Scalar = function(){
	r: 0;
	g: 0;
	b: 0;
	a: 255;
}

var CV_HIST = {
	ARRAY: 0,
	SPARSE: 1
}

var CV_CODE = {
	RGB2GRAY: 0,
	RGB2HSV: 1,
	HSV2RGB: 2,
	RGB2HLS: 3,
	HLS2RGB: 4
}

var CV_BLEND_MODE = {
	OVER_LAY: 0, //オーバーレイ
	SCREEN: 1, //スクリーン
	HARD_LIGHT: 2, // ハードライト
	SOFT_LIGHT: 3, // ソフトライト
	VIVID_LIGHT: 4, //ビビットライト
	LINEAR_LIGHT: 5, //リニアライト
	PIN_LIGHT: 6, //ピンライト
	COLOR_DODGE: 7, //覆い焼きカラー
	LINEAR_DODGE: 8, //覆い焼き（リニア）
	COLOR_BURN: 9, //焼きこみカラー
	LINEAR_BURN: 10, //焼きこみ（リニア）
	EXCLUSION: 11, //除外
	MUL: 12 //掛け算
}

var CV_SMOOTH_TYPE = {
	BLUR_NO_SCALE: 0,
	BLUR: 1,
	GAUSSIAN: 2,
	MEDIAN: 3,
	BILATERAL: 4
}

var CV_THRESHOLD_TYPE = {
	THRESH_BINARY: 0,
	THRESH_BINARY_INV: 1,
	THRESH_TRUNC: 2,
	THRESH_TOZERO: 3,
	THRESH_TOZERO_INV: 4, 
	THRESH_OTSU: 5
}

var CV_MOP = {
	OPEN : 0,
	CLOSE : 1,
	GRADIENT : 2,
	TOPHAT : 3,
	BLACKHAT : 4
}

var FOUR_ARITHMETIC = {
	ADD : 0,
	SUB : 1,
	MULT : 2,
	DIV : 3
}

var CHANNELS = 4;

var ERROR = {
	IS_UNDEFINED_OR_NULL : "がundefinedかnullです",
	DIFFERENT_SIZE : "IplImageサイズは全て同じにして下さい",
	DIFFERENT_LENGTH: "の長さは全て同じにして下さい",
	ONLY_ADD_NUMBER : "は奇数にして下さい",
	ONLY_INTERGER_NUMBER : "は整数にして下さい",
	ONLY_POSITIVE_NUMBER : "は正の値にして下さい",
	NOT_READ_FILE : "ファイルが読み込めません",
	NOT_GET_CONTEXT : "contextが読み込めません",
	SWITCH_VALUE : "の値が正しくありません",
	APERTURE_SIZE : "aperture_sizeは1, 3, 5または7 のいずれかにしてください",
}

function cvCreateHist(dims, sizes, type, ranges, uniform){
	var hist = new CvHistgram();
	try{
		if(cvUndefinedOrNull(sizes.length) || cvUndefinedOrNull(ranges.length))
			throw "sizes or ranges" + ERROR.IS_UNDEFINED_OR_NULL;
		if(dims != sizes.length)
			throw "dims と sizes" + ERROR.DIFFERENT_LENGTH;
		if(cvUndefinedOrNull(uniform)) uniform = 1;
		
		switch(type){
			case CV_HIST.ARRAY:
			break;
			case CV_HIST.SPARSE:
			break;
			default:
				throw "type " + ERROR.SWITCH_VALUE;
			break;
		}
	}
	catch(ex){
		alert("cvLabeling : " + ex);
	}
}

function cvLabeling(src){
	var dst = null;
	try{
		var dmy = cvCloneImage(src);
		dst = cvCreateImage(src.width, src.height);
				
		for(i = 0 ; i < dst.height ; i++){
			for(j = 0 ; j < dst.width ; j++){
				dst.RGBA[(j + i * dst.width) * CHANNELS] = 0;
			}
		}
		
		var lut = new Array(dmy.width * dmy.height);
		for(i = 0 ; i < lut.length ; i++) lut[i] = i;
		
		var newNumber = 1;
		var MAX = dmy.width * dmy.height;
		var check = new Array(4);
		
		for(i = 0 ; i < dmy.height ; i++){
			for(j = 0 ; j < dmy.width ; j++){
				if(dmy.RGBA[(j + i * dmy.width) * CHANNELS] == 255){
					if(i == 0 && j == 0){
						dst.RGBA[(j + i * dst.width) * CHANNELS] = newNumber;
						newNumber++;
					}
					else{
						check[0] = (j - 1 < 0 || i - 1 < 0) ? MAX : dst.RGBA[(j - 1 + (i - 1) * dmy.width) * CHANNELS];
						check[1] = (i - 1 < 0) ? MAX : dst.RGBA[(j + (i - 1) * dmy.width) * CHANNELS];
						check[2] = (j + 1 > dmy.width - 1 || i - 1 < 0) ? MAX : dst.RGBA[(j + 1 + (i - 1) * dmy.width) * CHANNELS];
						check[3] = (j - 1 < 0) ? MAX : dst.RGBA[(j - 1 + i * dmy.width) * CHANNELS];
						check.sort( function(a,b) {return a-b;} );
						
						var m = check.length;
						for(n = 3 ; n >= 0 ; n--){
							if(check[n] != 0 && check[n] != MAX) m = n;
						}
						
						if(m == check.length){
							dst.RGBA[(j + i * dst.width) * CHANNELS] = newNumber;
							newNumber++;
						}
						else{
							
							dst.RGBA[(j + i * dst.width) * CHANNELS] = check[m];
							c = m + 1;
							for(n = c ; n < check.length ; n++){
								if(check[n] != MAX && lut[check[n]] > check[m])	lut[check[n]] = check[m];
							}
						}
					}
				}
			}
		}
		
		for(i = 0 ; i < lut.length ; i++){
			if(i != lut[i]){
				console.log(i + ", " + lut[i]);
			}
		}
		
		for(i = 0 ; i < dmy.height ; i++){
			for(j = 0 ; j < dmy.width ; j++){
				while(true){
					var v = dst.RGBA[(j + i * dst.width) * CHANNELS];
					var n = lut[v];
					if(v == n) break;
					dst.RGBA[(j + i * dst.width) * CHANNELS] = n;
				}
			}
		}
	}
	catch(ex){
		alert("cvLabeling : " + ex);
	}
	return dst;
}

function cvCircle(img, center, radius, color, thickness){
	try{
		if(cvUndefinedOrNull(img) || cvUndefinedOrNull(center) 
			|| cvUndefinedOrNull(radius) || cvUndefinedOrNull(color))
				throw "img or center or radius or color" + ERROR.IS_UNDEFINED_OR_NULL;
		if(cvUndefinedOrNull(thickness)) thickness = 1;
		else if(thickness > 0 && thickness %2 == 0) throw "thickness" + ERROR.ONLY_ADD_NUMBER;
		
		if(thickness > 0){
			var thick2 = Math.floor(thickness/2);
			var radiusMax = radius + thick2;
			var radiusMin = radius - thick2;
			
			var xS = center.x - radiusMax;
			var xE = center.x + radiusMax;
			var yS = center.y - radiusMax;
			var yE = center.y + radiusMax;
			
			if(xS < 0) xS = 0 ;
			else if(xS > img.width - 1) xS = img.width - 1;
			if(xE < 0) xE = 0 ;
			else if(xE > img.width - 1) xE = img.width - 1;
			if(yS < 0) yS = 0 ;
			else if(yS > img.height - 1) yS = img.height - 1;
			if(yE < 0) yE = 0 ;
			else if(yE > img.height - 1) yE = img.height - 1;

			for(x = xS ; x <= xE ; x++){
				for(y = yS ; y <= yE ; y++){
					var r = (x - center.x) * (x - center.x) + (y - center.y) * (y - center.y);
					if(r >= radiusMin*radiusMin && r <= radiusMax*radiusMax){
						img.RGBA[(x + y * img.width) * CHANNELS] = color.r;
						img.RGBA[1 + (x + y * img.width) * CHANNELS] = color.g;
						img.RGBA[2 + (x + y * img.width) * CHANNELS] = color.b;
					}
				}
			}
		}
		else{
			var xS = center.x - radius;
			var xE = center.x + radius;
			var yS = center.y - radius;
			var yE = center.y + radius;
			
			if(xS < 0) xS = 0 ;
			else if(xS > img.width - 1) xS = img.width - 1;
			if(xE < 0) xE = 0 ;
			else if(xE > img.width - 1) xE = img.width - 1;
			if(yS < 0) yS = 0 ;
			else if(yS > img.height - 1) yS = img.height - 1;
			if(yE < 0) yE = 0 ;
			else if(yE > img.height - 1) yE = img.height - 1;

			for(x = xS ; x <= xE ; x++){
				for(y = yS ; y <= yE ; y++){
					var r = (x - center.x) * (x - center.x) + (y - center.y) * (y - center.y);
					if(r <= radius*radius){
						img.RGBA[(x + y * img.width) * CHANNELS] = color.r;
						img.RGBA[1 + (x + y * img.width) * CHANNELS] = color.g;
						img.RGBA[2 + (x + y * img.width) * CHANNELS] = color.b;
					}
				}
			}
		}
	}
	catch(ex){
		alert("cvCircle : " + ex);
	}
}

function cvRectangle(img, pt1, pt2, color, thickness){
	try{
		if(cvUndefinedOrNull(img) || cvUndefinedOrNull(pt1) 
			|| cvUndefinedOrNull(pt2) || cvUndefinedOrNull(color))
				throw "img or pt1 or pt2 or color" + ERROR.IS_UNDEFINED_OR_NULL;
		if(cvUndefinedOrNull(thickness)) thickness = 1;
		else if(thickness > 0 && thickness %2 == 0) throw "thickness" + ERROR.ONLY_ADD_NUMBER;
		
		var xS = (pt1.x < pt2.x) ? pt1.x : pt2.x;
		var xE = (pt1.x < pt2.x) ? pt2.x : pt1.x;
		var yS = (pt1.y < pt2.y) ? pt1.y : pt2.y;
		var yE = (pt1.y < pt2.y) ? pt2.y : pt1.y;
		
		if(xS < 0) xS = 0 ;
		else if(xS > img.width - 1) xS = img.width - 1;
		if(xE < 0) xE = 0 ;
		else if(xE > img.width - 1) xE = img.width - 1;
		if(yS < 0) yS = 0 ;
		else if(yS > img.height - 1) yS = img.height - 1;
		if(yE < 0) yE = 0 ;
		else if(yE > img.height - 1) yE = img.height - 1;

		if(thickness <= 0){
			for(y = yS ; y <= yE ; y++){
				for(x = xS ; x <= xE ; x++){
					img.RGBA[(x + y * img.width) * CHANNELS] = color.r;
					img.RGBA[1 + (x + y * img.width) * CHANNELS] = color.g;
					img.RGBA[2 + (x + y * img.width) * CHANNELS] = color.b;
				}
			}
		}
		else{
			var pt3 = new Point();
			var pt4 = new Point();
			pt3.x = pt1.x; pt3.y = pt2.y;
			pt4.x = pt2.x; pt4.y = pt1.y;
			
			cvLine(img, pt1, pt3, color, thickness);
			cvLine(img, pt3, pt2, color, thickness);
			cvLine(img, pt2, pt4, color, thickness);
			cvLine(img, pt1, pt4, color, thickness);
		}
	}
	catch(ex){
		alert("cvRectangle : " + ex);
	}
}
function cvLine(img, pt1, pt2, color, thickness, isSegment){
	try{
		if(cvUndefinedOrNull(img) || cvUndefinedOrNull(pt1) 
			|| cvUndefinedOrNull(pt2) || cvUndefinedOrNull(color))
				throw "img or pt1 or pt2 or color" + ERROR.IS_UNDEFINED_OR_NULL;
				
		if(cvUndefinedOrNull(thickness)) thickness = 1;
		else if(thickness %2 == 0) throw "thickness" + ERROR.ONLY_ADD_NUMBER;
		
		if(cvUndefinedOrNull(isSegment)) isSegment = true;

		var tE = Math.floor(thickness/2);
		var tS = -1*tE;

		if(pt1.x == pt2.x){
			var x = pt1.x;
			var yS, yE;
			if(isSegment){
				yS = (pt1.y < pt2.y) ? pt1.y : pt2.y;
				yE = (pt1.y < pt2.y) ? pt2.y : pt1.y;
				if(yS < 0) yS = 0 ;
				else if(yS > img.height - 1) yS = img.height - 1;
				if(yE < 0) yE = 0 ;
				else if(yE > img.height - 1) yE = img.height - 1;
			}
			else{
				yS = 0; yE = img.height - 1;
			}
			
			
			for(y = yS ; y <= yE ; y++){
				for(tx = tS ; tx <= tE ; tx++){
					for(ty = tS ; ty <= tE ; ty++){
						var xx = x + tx;
						var yy = y + ty;
						if(xx >= 0 && xx <= img.width - 1 && yy >= 0 && yy <= img.height - 1 &&
							tx * tx + ty * ty <= tE * tE){
							img.RGBA[(xx + yy * img.width) * CHANNELS] = color.r;
							img.RGBA[1 + (xx + yy * img.width) * CHANNELS] = color.g;
							img.RGBA[2 + (xx + yy * img.width) * CHANNELS] = color.b;
						}
					}
				}
			}
		}
		else{
			var katamuki = (pt1.y - pt2.y)/(pt1.x - pt2.x);
			
			
			
			if(Math.abs(katamuki) > 1){
				var yS, yE;
				if(isSegment){
					yS = (pt1.y < pt2.y) ? pt1.y : pt2.y;
					yE = (pt1.y < pt2.y) ? pt2.y : pt1.y;
					if(yS < 0) yS = 0 ;
					else if(yS > img.height - 1) yS = img.height - 1;
					if(yE < 0) yE = 0 ;
					else if(yE > img.height - 1) yE = img.height - 1;
				}
				else{
					yS = 0; yE = img.height - 1;
				}
				
				for(y = yS ; y <= yE ; y++){
					var x = Math.floor((y - pt1.y) / katamuki) + pt1.x ;
					for(tx = tS ; tx <= tE ; tx++){
						for(ty = tS ; ty <= tE ; ty++){
							var xx = x + tx;
							var yy = y + ty;
							if(xx >= 0 && xx <= img.width - 1 && yy >= 0 && yy <= img.height - 1 &&
								tx * tx + ty * ty <= tE * tE){
								
								img.RGBA[(xx + yy * img.width) * CHANNELS] = color.r;
								img.RGBA[1 + (xx + yy * img.width) * CHANNELS] = color.g;
								img.RGBA[2 + (xx + yy * img.width) * CHANNELS] = color.b;
							}
						}
					}
				}	
			}
			else{
				var xS, xE;
				if(isSegment){
					xS = (pt1.x < pt2.x) ? pt1.x : pt2.x;
					xE = (pt1.x < pt2.x) ? pt2.x : pt1.x;
					if(xS < 0) xS = 0 ;
					else if(xS > img.width - 1) xS = img.width - 1;
					if(xE < 0) xE = 0 ;
					else if(xE > img.width - 1) xE = img.width - 1;
				}
				else{
					xS = 0; xE = img.width - 1;
				}
				
				for(x = xS ; x <= xE ; x++){
					var y = Math.floor(katamuki * (x - pt1.x)) + pt1.y;
					
					for(tx = tS ; tx <= tE ; tx++){
						for(ty = tS ; ty <= tE ; ty++){
							var xx = x + tx;
							var yy = y + ty;
							if(xx >= 0 && xx <= img.width - 1 && yy >= 0 && yy <= img.height - 1 &&
								tx * tx + ty * ty <= tE * tE){
								
								img.RGBA[(xx + yy * img.width) * CHANNELS] = color.r;
								img.RGBA[1 + (xx + yy * img.width) * CHANNELS] = color.g;
								img.RGBA[2 + (xx + yy * img.width) * CHANNELS] = color.b;
							}
						}
					}
				}
			}
			
			
			
		}
	}
	catch(ex){
		alert("cvLine : " + ex);
	}
}



function cvMorphologyEx(src, dst, element, operation, iterations){
	try{
		if(cvUndefinedOrNull(operation)) throw "operation" + ERROR.IS_UNDEFINED_OR_NULL;
		
		switch(operation){
		case CV_MOP.OPEN:
			cvErode(src, dst, element, iterations);
			cvDilate(dst, dst, element, iterations);
		break;
		case CV_MOP.CLOSE:
			cvDilate(src, dst, element, iterations);
			cvErode(dst, dst, element, iterations);
		break; 
		case CV_MOP.GRADIENT:
			var temp1 = cvCreateImage(src.width, src.height);
			var temp2 = cvCreateImage(src.width, src.height);
			cvDilate(src, temp1, element, iterations);
			cvErode(src, temp2, element, iterations);
			cvSub(temp1, temp2, dst);
		break;
		case CV_MOP.TOPHAT:
			var temp = cvCreateImage(src.width, src.height);
			cvMorphologyEx(src, temp, element, CV_MOP.OPEN, iterations);
			cvSub(src, temp, dst);
		break;
		case CV_MOP.BLACKHAT:
			var temp = cvCreateImage(src.width, src.height);
			cvMorphologyEx(src, temp, element, CV_MOP.CLOSE, iterations);
			cvSub(temp, src, dst);
		break;
		default:
			throw "operation" + ERROR.SWITCH_VALUE;
		break;
		}
	}
	catch(ex){
		alert("cvMorphologyEx : " + ex);
	}
}

function cvErode(src, dst, element, iterations){
	try{
		cvDilateOrErode(src, dst, element, iterations, true);
	}
	catch(ex){
		alert("cvErode : " + ex);
	}
}
function cvDilate(src, dst, element, iterations){
	try{
		cvDilateOrErode(src, dst, element, iterations, false);
	}
	catch(ex){
		alert("cvDilate : " + ex);
	}
}

function cvIntegral(src, dst, sqsum, tilted_sum){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst)) throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL;
		if(src.width != dst.width || src.height != dst.height) throw ERROR.DIFFERENT_SIZE;
		
		cvZero(dst);
		if(!cvUndefinedOrNull(sqsum)){
			if(src.width != sqsum.width || src.height != sqsum.height) throw ERROR.DIFFERENT_SIZE;
			cvZero(sqsum);
		}
		if(!cvUndefinedOrNull(tilted_sum)){
			if(src.width != tilted_sum.width || src.height != tilted_sum.height) throw ERROR.DIFFERENT_SIZE;
			cvZero(tilted_sum);
		}
		
		for(i = 0 ; i < dst.height ; i++){
			for(j = 0 ; j < dst.width ; j++){
				for(c = 0 ; c < CHANNELS - 1; c++){
					dst.RGBA[c + (j + i * dst.width) * CHANNELS] = 
						src.RGBA[c + (j + i * src.width) * CHANNELS] + ((j == 0) ? 0 : dst.RGBA[c + (j-1 + i * dst.width) * CHANNELS]);
					if(!cvUndefinedOrNull(sqsum))
						sqsum.RGBA[c + (j + i * sqsum.width) * CHANNELS] = 
							src.RGBA[c + (j + i * src.width) * CHANNELS] * src.RGBA[c + (j + i * src.width) * CHANNELS]
							 + ((j == 0) ? 0 : sqsum.RGBA[c + (j-1 + i * sqsum.width) * CHANNELS]);
					if(!cvUndefinedOrNull(tilted_sum))
						tilted_sum.RGBA[c + (j + i * tilted_sum.width) * CHANNELS] = src.RGBA[c + (j + i * src.width) * CHANNELS] + 
							((j == 0 || i == 0) ? 0 : tilted_sum.RGBA[c + (j-1 + (i-1) * tilted_sum.width) * CHANNELS]);
				}
			}
		}
		for(j = 0 ; j < dst.width ; j++){
			for(i = 0 ; i < dst.height ; i++){
				for(c = 0 ; c < CHANNELS - 1; c++){
					dst.RGBA[c + (j + i * dst.width) * CHANNELS] += ((i == 0) ? 0 : dst.RGBA[c + (j + (i-1) * dst.width) * CHANNELS]);
					if(!cvUndefinedOrNull(sqsum))
						sqsum.RGBA[c + (j + i * sqsum.width) * CHANNELS] += ((i == 0) ? 0 : sqsum.RGBA[c + (j + (i-1) * sqsum.width) * CHANNELS]);

					if(!cvUndefinedOrNull(tilted_sum)){
						tilted_sum.RGBA[c + (j + i * tilted_sum.width) * CHANNELS]  = src.RGBA[c + (j + i * src.width) * CHANNELS];
						for(y = 1 ; y <= i ; y++){
							var ii = i - y;
							var jl = j - y;
							var jr = j + y;
							if(jl >= 0) 
								tilted_sum.RGBA[c + (j + i * tilted_sum.width) * CHANNELS] += src.RGBA[c + (jl + ii * tilted_sum.width) * CHANNELS];
							if(jr < tilted_sum.width) 
								tilted_sum.RGBA[c + (j + i * tilted_sum.width) * CHANNELS] += src.RGBA[c + (jr + ii * tilted_sum.width) * CHANNELS];
						}
						if(i != 0)
							tilted_sum.RGBA[c + (j + i * tilted_sum.width) * CHANNELS] += tilted_sum.RGBA[c + (j + (i - 1) * tilted_sum.width) * CHANNELS];	
					}
				
				}
			}
		}
		
	
	}
	catch(ex){
		alert("cvIntegral : " + ex);
	}
}


function cvCloneImage(src){
	var dst = null;

	try{
		dst = cvCreateImage(src.width, src.height);
		cvCopy(src, dst);
	}
	catch(ex){
		alert("cvCloneImage : " + ex);
	}
	
	return dst;
}



function cvCopy(src, dst){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst)) throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL;
		
		for(i = 0 ; i < src.height ; i++){
			for(j = 0 ; j < src.width ; j++){
				for(c = 0 ; c < CHANNELS ; c++){
					dst.RGBA[c + (j + i * src.width) * CHANNELS] = 
						src.RGBA[c + (j + i * src.width) * CHANNELS];
				}
			}
		}
	}
	catch(ex){
		alert("cvCopy : " + ex);
	}
}

function cvThreshold(src, dst, threshold, max_value, threshold_type){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst)) throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL; 
		
		switch(threshold_type){
		case CV_THRESHOLD_TYPE.THRESH_BINARY:
			for(i = 0 ; i < src.height ; i++){
				for(j = 0 ; j < src.width ; j++){
					dst.RGBA[(j + i * dst.width) * CHANNELS] = 
					(src.RGBA[(j + i * dst.width) * CHANNELS] > threshold) ? max_value : 0;
					dst.RGBA[(j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
					dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
				}
			}
			break;
		case CV_THRESHOLD_TYPE.THRESH_BINARY_INV:
			for(i = 0 ; i < src.height ; i++){
				for(j = 0 ; j < src.width ; j++){
					dst.RGBA[(j + i * dst.width) * CHANNELS] = 
					(src.RGBA[(j + i * dst.width) * CHANNELS] > threshold) ? 0 : max_value;
					dst.RGBA[(j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
					dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
				}
			}
			break;
		case CV_THRESHOLD_TYPE.THRESH_TRUNC:
			for(i = 0 ; i < src.height ; i++){
				for(j = 0 ; j < src.width ; j++){
					dst.RGBA[(j + i * dst.width) * CHANNELS] = 
					(src.RGBA[(j + i * dst.width) * CHANNELS] > threshold) ? threshold : src.RGBA[(j + i * dst.width) * CHANNELS];
					dst.RGBA[(j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
					dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
				}
			}
			break;
		case CV_THRESHOLD_TYPE.THRESH_TRUNC_TOZERO:
			for(i = 0 ; i < src.height ; i++){
				for(j = 0 ; j < src.width ; j++){
					dst.RGBA[(j + i * dst.width) * CHANNELS] = 
					(src.RGBA[(j + i * dst.width) * CHANNELS] > threshold) ? threshold : 0;
					dst.RGBA[(j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
					dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
				}
			}
			break;
		case CV_THRESHOLD_TYPE.THRESH_TRUNC_TOZERO_INV:
			for(i = 0 ; i < src.height ; i++){
				for(j = 0 ; j < src.width ; j++){
					dst.RGBA[(j + i * dst.width) * CHANNELS] = 
					(src.RGBA[(j + i * dst.width) * CHANNELS] > threshold) ? 0 : threshold;
					dst.RGBA[(j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
					dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
				}
			}
			break;
		case CV_THRESHOLD_TYPE.THRESH_OTSU:
			var values = new Array(src.width * src.height);
			var num = 0;
			for(i = 0 ; i < src.height; i++){
				for(j = 0 ; j < src.width ; j++){
					values[num++] = src.RGBA[(j + i * dst.width) * CHANNELS];
				}
			}
			var hist = Histgram(values, 255);

			var varDst = 0;
			var sTh = 1;
			for(th = 1 ; th < 254 ; th++){
				bClass = new Array();
				wClass = new Array();
				for(i = 0; i < th ; i++) bClass[i] = hist[i];
				var k = 0;
				for(i = th; i < 255 ; i++) wClass[k++] = hist[i];
				var w1 = 0; var m1 = 0;
				var w2 = 0; var m2 = 0;
				w1 = Sum(bClass);
				w2 = Sum(wClass);
				for(i = 0; i < bClass.length ; i++) m1 += i * bClass[i];
				for(i = 0; i < wClass.length ; i++) m2 += (th + i) * wClass[i];
				m1 /= w1;
				m2 /= w2;
				
				var variance = w1 * w2 * (m1 - m2) * (m1 - m2);
				if(varDst < variance){
					varDst = variance;
					sTh = th;
				}
			}
			cvThreshold(src, dst, sTh, max_value, CV_THRESHOLD_TYPE.THRESH_BINARY);
			break;
		default:
			throw "threshold_type" + ERROR.SWITCH_VALUE;
			break;
		}
	}
	catch(ex){
		alert("cvThreshold : " + ex);
	}
}

function cvResize(src, dst){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst)) throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL; 
		
		var scaleWidth = src.width / dst.width;
		var scaleHeight = src.height / dst.height;
		var scale = scaleWidth > scaleHeight ? scaleHeight : scaleWidth;

		for(i = 0 ; i < dst.height ; i++){
			var h = scale * i ;
			for(j = 0 ; j < dst.width ; j++){
				var w = scale * j;
				for( c = 0 ; c < CHANNELS ; c++){
					var v = scale * src.RGBA[c + (w + h * src.width) * CHANNELS];
					dst.RGBA[c + (j + i * dst.width) * CHANNELS]  = v;
				}
			}
		}
	}
	catch(ex){
		alert("cvResize : " + ex);
	}
}

function cvLUT(src, dst, lut, color){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst)) throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL; 
		
		for(i = 0 ; i < src.height ; i++){
			for(j = 0 ; j < src.width ; j++){
				var v = src.RGBA[color + (j + i * src.width) * CHANNELS];
				dst.RGBA[color + (j + i * src.width) * CHANNELS]  = lut[v];
			}
		}
	}
	catch(e){
		alert("cvLUT : " + ex);
	}
}

function cvToneCurve(src, dst, underX, underY, overX, overY, color){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst)) throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL;
		
		if(underX != overX){
			var katamuki = (overY - underY) / (overX - underX) ;
			var yseppen = underY - katamuki * underX;

			for(i = 0 ; i < src.height ; i++){
				for(j = 0 ; j < src.width ; j++){
					var v = (katamuki * src.RGBA[color + (j + i * src.width) * CHANNELS] + yseppen);
					dst.RGBA[color + (j + i * src.width) * CHANNELS]  = v;
				}
			}
		}
	}
	catch(ex){
		alert("cvToneCurve : " + ex);
	}
}

function cvBlendImage(bg, fg, dst, blend_mode){
	try{
		if(cvUndefinedOrNull(bg) || cvUndefinedOrNull(fg)  || cvUndefinedOrNull(dst))
			throw "fg or bg or dst" + ERROR.IS_UNDEFINED_OR_NULL;
		if(bg.width != fg.width || bg.height != fg.height || 
			bg.width != dst.width || bg.height != dst.height) throw ERROR.DIFFERENT_SIZE;
		
		if(cvUndefinedOrNull(blend_mode)) blendMode = CV_BLEND_MODE.OVER_LAY;

		var percent = 1;
		for (i = 0; i < bg.height; i++) {
			for (j = 0; j < bg.width; j++) {
				var ch = CHANNELS - 1 ;
				for( c = 0 ; c < ch ; c++){
					
					var bgV = bg.RGBA[c + (j + i * bg.width) * CHANNELS] / 255;
					var fgV = fg.RGBA[c + (j + i * bg.width) * CHANNELS] / 255;

					var v;

					switch(blend_mode){
					
					case CV_BLEND_MODE.OVER_LAY://オーバーレイ
						v = bgV < 0.5 ? 2.0 * bgV * percent * fgV : 
							1.0 - 2.0 * (1.0 - bgV) * (1.0 - percent * fgV);
						break;

					case CV_BLEND_MODE.SCREEN: //スクリーン
						v = 1.0 - ( 1.0 - bgV ) * ( 1.0 - fgV );
						break;

					case CV_BLEND_MODE.HARD_LIGHT: // ハードライト
						v = fgV < 0.5 ? 2.0 * bgV * fgV : 1.0 - 2.0 * ( 1.0 - bgV ) * ( 1.0 - fgV );
						break;
						
					case CV_BLEND_MODE.SOFT_LIGHT: // ソフトライト
						v = fgV < 0.5 ? 
								bgV + ( bgV -  bgV * bgV ) * ( 2.0 * fgV - 1.0 ) : 
								bgV <= ( 32.0 / 255.0 ) ? 
								bgV + ( bgV -  bgV * bgV ) * ( 2.0 * fgV - 1.0 ) * ( 3.0 - 8.0 * bgV ) : 
								bgV + ( Math.sqrt( bgV ) - bgV ) * ( 2.0 * fgV - 1.0 );
						break;

					case CV_BLEND_MODE.VIVID_LIGHT: //ビビットライト
						v = fgV < 0.5 ? ( bgV <= 1 - fgV * 2 ? 0.0 : ( bgV - ( 1 - fgV * 2 ) ) / ( fgV * 2 ) ) : 
							( bgV < 2 - fgV * 2 ? bgV / ( 2 - fgV * 2 ) : 1.0 );
						break;
					
					case CV_BLEND_MODE.LINEAR_LIGHT: //リニアライト
						v = fgV < 0.5 ? ( bgV < 1 - fgV * 2 ? 0.0 : fgV * 2 + bgV - 1 ) : 
							( bgV < 2 - fgV * 2 ? fgV * 2 + bgV - 1 : 1.0);
						break;
				
					case CV_BLEND_MODE.PIN_LIGHT: //ピンライト
						v = fgV < 0.5 ? ( fgV * 2 < bgV ? fgV * 2 : bgV) : 
							( fgV * 2 - 1 < bgV ? bgV : fgV * 2 - 1 );
						break;

					case CV_BLEND_MODE.COLOR_DODGE: //覆い焼きカラー
						v = bgV + fgV > 1.0 ? 1.0 : ( bgV > 0.0 ? bgV / ( 1.0 - fgV ) : 0.0 );
						break;

					case CV_BLEND_MODE.LINEAR_DODGE: //覆い焼き（リニア）
						v = bgV + fgV > 1.0 ? 1.0 : ( bgV + fgV );
						break;

					case CV_BLEND_MODE.COLOR_BURN: //焼きこみカラー
						v = fgV + bgV < 1.0 ? 0.0 : fgV > 0.0 ? 1.0 - ( 1.0 - bgV ) / fgV : 1.0;
						break;
			
					case CV_BLEND_MODE.LINEAR_BURN: //焼きこみ（リニア）
						v = bgV + fgV < 1.0 ? 0.0 : ( bgV + fgV - 1.0 );
						break;
					
					case CV_BLEND_MODE.EXCLUSION: //除外
						v = (1.0 - bgV ) * fgV + ( 1.0 - fgV ) * bgV;
						break;
						
					case CV_BLEND_MODE.MUL: //掛け算
						v = bgV * fgV;
						break;
						
					default:
						throw "blend_mode" + ERROR.SWITCH_VALUE;
						break;
					}

					var iv = (255 * v);
					
					dst.RGBA[c + (j + i * dst.width) * CHANNELS] = iv;
				}
				
				dst.RGBA[ch + (j + i * dst.width) * CHANNELS] = 255;
			}
		}
	}
	catch(ex){
		alert("cvBlendImage : " + ex);
	}
}

function cvSmooth(src, dst, smooth_type, param1, param2, param3, param4){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst)) throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL; 
		if(src.width != dst.width || src.height != dst.height) throw ERROR.DIFFERENT_SIZE;
		if(cvUndefinedOrNull(smooth_type)) smooth_type = CV_SMOOTH_TYPE.GAUSSIAN;
		
		switch(smooth_type){
		case CV_SMOOTH_TYPE.BLUR_NO_SCALE:
			if(cvUndefinedOrNull(param1)) param1 = 3;
			if(cvUndefinedOrNull(param2)) param2 = param1;
			
			if(param1 < 0) throw "param1" + ERROR.ONLY_POSITIVE_NUMBER;
			if(param2 < 0) throw "param2" + ERROR.ONLY_POSITIVE_NUMBER;
			if(param1 % 2 != 1) throw "param1" + ERROR.ONLY_ADD_NUMBER;
			if(param2 % 2 != 1) throw "param2" + ERROR.ONLY_ADD_NUMBER;
			
			var startX = -1 * Math.floor(param1/2);
			var startY = -1 * Math.floor(param2/2);
			for(i = 0 ; i < src.height ; i++){
				for(j = 0 ; j < src.width ; j++){
					for(c = 0 ; c < CHANNELS - 1 ; c++){
						var newValue = 0;
						for(y = 0 ; y < param2 ; y++){
							var yy = i + y + startY;
							if(yy < 0) yy *= -1;
							yy %= src.height;
							for(x = 0 ; x < param1 ; x++){
								var xx = j + x + startX;
								if(xx < 0) xx *= -1;
								xx %= src.width;
								newValue += src.RGBA[c + (xx + yy * src.width) * CHANNELS];
							}
						}
						dst.RGBA[c + (j + i * dst.width) * CHANNELS] = newValue;
					}
					dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * src.width) * CHANNELS] ;
				}
			}
		break;
		
		case CV_SMOOTH_TYPE.BLUR:
			if(cvUndefinedOrNull(param1)) param1 = 3;
			if(cvUndefinedOrNull(param2)) param2 = param1;
			
			if(param1 < 0) throw "param1" + ERROR.ONLY_POSITIVE_NUMBER;
			if(param2 < 0) throw "param2" + ERROR.ONLY_POSITIVE_NUMBER;
			if(param1 % 2 != 1) throw "param1" + ERROR.ONLY_ADD_NUMBER;
			if(param2 % 2 != 1) throw "param2" + ERROR.ONLY_ADD_NUMBER;
			
			var startX = -1 * Math.floor(param1/2);
			var startY = -1 * Math.floor(param2/2);
			for(i = 0 ; i < src.height ; i++){
				for(j = 0 ; j < src.width ; j++){
					for(c = 0 ; c < CHANNELS - 1 ; c++){
						var newValue = 0;
						for(y = 0 ; y < param2 ; y++){
							var yy = i + y + startY;
							if(yy < 0) yy *= -1;
							yy %= src.height;
							for(x = 0 ; x < param1 ; x++){
								var xx = j + x + startX;
								if(xx < 0) xx *= -1;
								xx %= src.width;
								newValue += src.RGBA[c + (xx + yy * src.width) * CHANNELS];
							}
						}
						dst.RGBA[c + (j + i * dst.width) * CHANNELS] = newValue/(param1 * param2);
					}
					dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * src.width) * CHANNELS] ;
				}
			}
		break;
		
		case CV_SMOOTH_TYPE.GAUSSIAN:
		
			if(cvUndefinedOrNull(param1)) param1 = 3;
			if(cvUndefinedOrNull(param2)) param2 = param1;
			if(cvUndefinedOrNull(param3)) param3 = 0;
			if(cvUndefinedOrNull(param4)) param4 = 0;
			
			if(param1 < 0) throw "param1" + ERROR.ONLY_POSITIVE_NUMBER;
			if(param2 < 0) throw "param2" + ERROR.ONLY_POSITIVE_NUMBER;
			if(param3 < 0) throw "param3" + ERROR.ONLY_POSITIVE_NUMBER;
			if(param4 < 0) throw "param4" + ERROR.ONLY_POSITIVE_NUMBER;
			
			if(param1 % 2 != 1) throw "param1" + ERROR.ONLY_ADD_NUMBER;
			if(param2 % 2 != 1) throw "param2" + ERROR.ONLY_ADD_NUMBER;
			
			if(param3 == 0)
				param3 = (((param1 > param2) ? param2 : param1)/2 - 1) * 0.3 + 0.8;
			
			var array = new Array(param1 * param2);
			var alpha = 2 * param3 * param3;
			var startX = -1 * Math.floor(param1/2);
			var startY = -1 * Math.floor(param2/2);
			
			for(y = 0 ; y < param2 ; y++){
				var yy = y + startY;
				for(x = 0 ; x < param1 ; x++){
					var xx = x + startX;
					array[x + y * param1] = Math.exp(-1 * (xx * xx + yy * yy) / alpha);
				}
			}
			
			var sum = 0;
			for(i = 0 ; i < array.length ; i++) sum += array[i];
			for(i = 0 ; i < array.length ; i++) array[i] /= sum;

			sum = 0;
			for(i = 0 ; i < array.length ; i++) sum += array[i];
			
			for(i = 0 ; i < src.height ; i++){
				for(j = 0 ; j < src.width ; j++){
					for(c = 0 ; c < CHANNELS - 1 ; c++){
						var newValue = 0;
						for(y = 0 ; y < param2 ; y++){
							var yy = i + y + startY;
							if(yy < 0) yy *= -1;
							yy %= src.height;
							for(x = 0 ; x < param1 ; x++){
								var xx = j + x + startX;
								if(xx < 0) xx *= -1;
								xx %= src.width;
								newValue += array[x + y * param1] * src.RGBA[c + (xx + yy * src.width) * CHANNELS];
							}
						}
						dst.RGBA[c + (j + i * dst.width) * CHANNELS] = newValue;
					}
					dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * src.width) * CHANNELS] ;
				}
			}
		
		break; 
		
		case CV_SMOOTH_TYPE.MEDIAN:
			
			if(cvUndefinedOrNull(param1)) param1 = 3;
			if(param1 < 0) throw "param1" + ERROR.ONLY_POSITIVE_NUMBER;
			if(param1 % 2 != 1) throw "param1" + ERROR.ONLY_ADD_NUMBER;
			
			var array = new Array(param1 * param1);
			
			var start = -1 * Math.floor(param1/2);
			for(i = 0 ; i < src.height ; i++){
				for(j = 0 ; j < src.width ; j++){
					for(c = 0 ; c < CHANNELS - 1 ; c++){
						for(y = 0 ; y < param1 ; y++){
							var yy = i + y + start;
							if(yy < 0) yy *= -1;
							yy %= src.height;
							for(x = 0 ; x < param1 ; x++){
								var xx = j + x + start;
								if(xx < 0) xx *= -1;
								xx %= src.width;
								
								array[x + y * param1] = src.RGBA[c + (xx + yy * src.width) * CHANNELS];
							}
						}
						
						array.sort(function(a,b) {return a-b;});
						
						dst.RGBA[c + (j + i * dst.width) * CHANNELS] = array[Math.floor(array.length / 2)];
					}
					dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * src.width) * CHANNELS] ;
				}
			}
		break; 
		
		case CV_SMOOTH_TYPE.BILATERAL:
		
			if(cvUndefinedOrNull(param1)) param1 = 5;
			if(cvUndefinedOrNull(param2)) param2 = 0.2;
			
			var array = new Array(3 * 3);
			
			var param12 = 2*param1*param1;
			var param22 = 2*param2*param2;

			for(y = 0 ; y < 3 ; y++){
				var yy = y - 1;
				for(x = 0 ; x < 3 ; x++){
					var xx = x - 1;
					array[x + y * 3] = Math.exp(-1 * (xx * xx + yy * yy) / param12);
				}
			}
			
			for(i = 0 ; i < src.height ; i++){
				for(j = 0 ; j < src.width ; j++){
					for(c = 0 ; c < CHANNELS - 1 ; c++){
						var overValue = 0;
						var underValue = 0;
						for(y = 0 ; y < 3 ; y++){
							var yy = i + y - 1;
							if(yy < 0) yy *= -1;
							yy %= src.height;
							for(x = 0 ; x < 3 ; x++){
								var xx = j + x - 1;
								if(xx < 0) xx *= -1;
								xx %= src.width;
								
								var dist = src.RGBA[c + (j + i * src.width) * CHANNELS] - src.RGBA[c + (xx + yy * src.width) * CHANNELS];
								var v = array[x + y * 3] * Math.exp(-1 * dist * dist / param22) ;
								underValue += v
								overValue += v * src.RGBA[c + (xx + yy * src.width) * CHANNELS];
							}
						}
						dst.RGBA[c + (j + i * dst.width) * CHANNELS] = overValue/underValue;
					}
					dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * src.width) * CHANNELS] ;
				}
			}
		break; 
		
		default:
			throw "smooth_type" + ERROR.SWITCH_VALUE;
		break;
		}
	}
	catch(ex){
		alert("cvSmooth : " + ex);
	}
}

function cvSobel(src, dst, xorder, yorder, aperture_size){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst)) throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL;
		if(src.width != dst.width || src.height != dst.height) throw ERROR.DIFFERENT_SIZE;
		
		if(cvUndefinedOrNull(aperture_size)) aperture_size = 3;
		
		switch(aperture_size){
		case 1:
		break;
		
		case 3:
			
			var array = (xorder != 0) ? 
				new Array( 
					-1, 0, 1,
					-2, 0, 2,
					-1, 0, 1
				) :
				new Array(
					-1, -2, -1,
					0, 0, 0,
					1, 2, 1
				);
			var times = (xorder != 0) ? xorder : yorder ;
			
			cvCopy(src, dst);
			var dmy = cvCreateImage(src.width, src.height);
			for(time = 0 ; time < times ; time++){
				cvCopy(dst, dmy);
				for(i = 0; i < dmy.height ; i++){
					for(j =0; j < dmy.width ; j++){
						var newValue = 0;
						for(y = 0 ; y < aperture_size ; y++){
							var yy = i + y -1;
							if(yy < 0) yy *= -1;
							yy %= dmy.height;
							
							for(x = 0 ; x < aperture_size ; x++){
								var xx = j + x -1;
								if(xx < 0) xx *= -1;
								xx %= src.width;
								
								newValue += array[x + y * 3] * dmy.RGBA[(xx + yy * dmy.width) * CHANNELS];
							}
						}
						dst.RGBA[(j + i * dst.width) * CHANNELS] = newValue;
						dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = newValue;
						dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = newValue;
					}
				}
			}
			
		break;
		
		case 5:
		break;
		
		case 7:
		break;
		
		default:
			throw ERROR.APERTURE_SIZE;
		break;
		}
	}
	catch(ex){
		alert("cvSobel : " + ex);
	}
}

function cvCanny(src, dst, threshold1, threshold2, aperture_size){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst)) throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL; 
		if(src.width != dst.width || src.height != dst.height) throw ERROR.DIFFERENT_SIZE;

		if(cvUndefinedOrNull(aperture_size)) aperture_size = 3;
		
		var smooth = cvCreateImage(src.width, src.height);
		cvSmooth(src, smooth);

		var fxImage = cvCloneImage(smooth);
		var fyImage = cvCloneImage(smooth);

		cvSobel(fxImage, fxImage, 1, 0, aperture_size);
		cvSobel(fyImage, fyImage, 0, 1, aperture_size);

		var kobai = cvCreateImage(dst.width, dst.height);
		var kyodo = cvCreateImage(dst.width, dst.height);
		
		//強度と勾配
		for(i = 0 ; i < kyodo.height ; i++){
			for(j = 0 ; j < kyodo.width ; j++){
				
				kyodo.RGBA[(j + i * kyodo.width) * CHANNELS] = 
					Math.sqrt(fxImage.RGBA[(j + i * fxImage.width) * CHANNELS] * fxImage.RGBA[(j + i * fxImage.width) * CHANNELS] +
						fyImage.RGBA[(j + i * fyImage.width) * CHANNELS] * fyImage.RGBA[(j + i * fyImage.width) * CHANNELS]);

				var tanV = (fxImage.RGBA[(j + i * fxImage.width) * CHANNELS] == 0) ? 0 : 
					Math.tan(fyImage.RGBA[(j + i * fyImage.width) * CHANNELS]/fxImage.RGBA[(j + i * fxImage.width) * CHANNELS]);

				if(tanV < -2.4141 || tanV > 2.4141)	kobai.RGBA[(j + i * kobai.width) * CHANNELS] = 90;
				else if(tanV < -0.4142) kobai.RGBA[(j + i * kobai.width) * CHANNELS] = 135;
				else if(tanV < 0.4142) kobai.RGBA[(j + i * kobai.width) * CHANNELS] = 0;
				else kobai.RGBA[(j + i * kobai.width) * CHANNELS] = 45;
			}
		}
		
		//細線化
		var th = kobai.height - 1;
		var tw = kobai.width - 1;
		for(i = 1 ; i < th; i++){
			for(j = 1 ; j < tw; j++){
				var left = j - 1;
				var right = j + 1;
				var top = i - 1;
				var down = i + 1;

				switch(kobai.RGBA[(j + i * kobai.width) * CHANNELS]){
				case 0:
					dst.RGBA[(j + i * dst.width) * CHANNELS] = 
						(kyodo.RGBA[(j + i * kyodo.width) * CHANNELS] >= kyodo.RGBA[(left + i * kyodo.width) * CHANNELS] &&
						kyodo.RGBA[(j + i * kyodo.width) * CHANNELS] >= kyodo.RGBA[(right + i * kyodo.width) * CHANNELS]) ? 
							kyodo.RGBA[(j + i * dst.width) * CHANNELS] : 0;
				break;
				case 45:
					dst.RGBA[(j + i * dst.width) * CHANNELS] = 
						(kyodo.RGBA[(j + i * kyodo.width) * CHANNELS] >= kyodo.RGBA[(left + down * kyodo.width) * CHANNELS] &&
						kyodo.RGBA[(j + i * kyodo.width) * CHANNELS] >= kyodo.RGBA[(right + top * kyodo.width) * CHANNELS]) ?
							kyodo.RGBA[(j + i * dst.width) * CHANNELS] : 0;
				break;
				case 90:
					dst.RGBA[(j + i * dst.width) * CHANNELS] = 
						(kyodo.RGBA[(j + i * kyodo.width) * CHANNELS] >= kyodo.RGBA[(j + top * kyodo.width) * CHANNELS] &&
						kyodo.RGBA[(j + i * kyodo.width) * CHANNELS] >= kyodo.RGBA[(j + down * kyodo.width) * CHANNELS]) ? 
							kyodo.RGBA[(j + i * dst.width) * CHANNELS] : 0;
				break;
				default:
					dst.RGBA[(j + i * dst.width) * CHANNELS] = 
						(kyodo.RGBA[(j + i * kyodo.width) * CHANNELS] >= kyodo.RGBA[(left + top * kyodo.width) * CHANNELS] &&
						kyodo.RGBA[(j + i * kyodo.width) * CHANNELS] >= kyodo.RGBA[(right + down * kyodo.width) * CHANNELS]) ?
							kyodo.RGBA[(j + i * dst.width) * CHANNELS] : 0;
				break;
				}
			}
		}

		//閾値処理
		for(i = 0 ; i < dst.height ; i++){
			top = i - 1; if(top < 0) top *= -1;
			down = i + 1; if(top > dst.height - 1) top = dst.height - 2;
			for(j = 0 ; j < dst.width ; j++){
				if(dst.RGBA[(j + i * dst.width) * CHANNELS] > threshold1) dst.RGBA[(j + i * dst.width) * CHANNELS] = 255;
				else if(dst.RGBA[(j + i * dst.width) * CHANNELS] < threshold2) dst.RGBA[(j + i * dst.width) * CHANNELS] = 0;
				else{
					left = j - 1; if(left < 0) left *= -1;
					right = j + 1; if(right > dst.width - 1) right = dst.width - 2;
					
					if(dst.RGBA[(left + top * dst.width) * CHANNELS] == 255 ||
						dst.RGBA[(j + top * dst.width) * CHANNELS] == 255 ||
						dst.RGBA[(right + top * dst.width) * CHANNELS] == 255 ||
						dst.RGBA[(left + i * dst.width) * CHANNELS] == 255 ||
						dst.RGBA[(right + i * dst.width) * CHANNELS] == 255 ||
						dst.RGBA[(left + down * dst.width) * CHANNELS] == 255 ||
						dst.RGBA[(j + down * dst.width) * CHANNELS] == 255 ||
						dst.RGBA[(right + down * dst.width) * CHANNELS] == 255)
							dst.RGBA[(j + i * dst.width) * CHANNELS] = 255;
					else dst.RGBA[(j + i * dst.width) * CHANNELS] = 0;
				}
			}
		}
				
		for(i = 0 ; i < dst.height ; i++){
			for(j = 0 ; j < dst.width ; j++){
				dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
				dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
				dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = 255;
			}
		}
	}
	catch(ex){
		alert("cvCanny : " + ex);
	}
}

function cvCvtColor(src, dst, code){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst)) throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL; 
		if(src.width != dst.width || src.height != dst.height) throw ERROR.DIFFERENT_SIZE;
		
		switch(code){
		case CV_CODE.RGB2GRAY:
			for (i = 0; i < dst.height; i++) {
				for (j = 0; j < dst.width; j++) {
				
					var v = (src.RGBA[(j + i * dst.width) * CHANNELS] + 
							src.RGBA[1 + (j + i * dst.width) * CHANNELS] + 
							src.RGBA[2 + (j + i * dst.width) * CHANNELS]) / 3;
							
					dst.RGBA[(j + i * dst.width) * CHANNELS] = v;
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = v;
					dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = v;
					dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * dst.width) * CHANNELS];
				}
			}
		break;
		
		case CV_CODE.RGB2HSV:
			
			for (i = 0; i < dst.height; i++) {
				for (j = 0; j < dst.width; j++) {
				
					var r = src.RGBA[(j + i * dst.width) * CHANNELS];
					var g = src.RGBA[1 + (j + i * dst.width) * CHANNELS];
					var b = src.RGBA[2 + (j + i * dst.width) * CHANNELS];
					
					var max = Math.max(r, g, b);
					var min = Math.min(r, g, b);
					var h;
					if(max == min) h = 0;
			        else if(max == r) h = ((g - b) / (max - min)) * 60;
			        else if(max == g) h = ((b - r) / (max - min)) * 60 + 120;
			        else h = ((r - g) / (max - min)) * 60 + 240;
			        if(h < 0) h += 360;
			        
			        h = h * 256 / 360;
			        
			        dst.RGBA[(j + i * dst.width) * CHANNELS] = h;
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = ( max == 0 ) ? 0 : (max - min) / max * 255;
					dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = max;
					dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * dst.width) * CHANNELS];		
				}
			}
		break;
		
		case CV_CODE.HSV2RGB:
			for (i = 0; i < dst.height; i++) {
				for (j = 0; j < dst.width; j++) {
				
					var h = src.RGBA[(j + i * dst.width) * CHANNELS];
					var s = src.RGBA[1 + (j + i * dst.width) * CHANNELS];
					var v = src.RGBA[2 + (j + i * dst.width) * CHANNELS];

					var red, green, blue;
					
					if(s == 0) red = green = blue = v;
					else{
						h = h * 360 / 256;
						s /= 255;
						v /= 255;
						var hi = Math.floor(h/60)%6;
						var f = h/60 - hi;
						var p = v * (1 - s);
						var q = v * (1 - f * s);
						var t = v * (1 - (1 - f) * s);
												
						if(hi == 0){
							red = v; green = t; blue = p;
						}
						else if(hi == 1){
							red = q; green = v; blue = p;
						}
						else if(hi == 2){
							red = p; green = v; blue = t;
						}
						else if(hi == 3){
							red = p; green = q; blue = v;
						}
						else if(hi == 4){
							red = t; green = p; blue = v;
						}
						else if(hi == 5){
							red = v; green = p; blue = q;
						}
						
						red *= 255;
						green *= 255;
						blue *= 255;
					}
			
					dst.RGBA[(j + i * dst.width) * CHANNELS] = red;
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = green;
					dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = blue;
					dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * dst.width) * CHANNELS];
				}
			}
		break;
		
		case CV_CODE.RGB2HLS:
			for (i = 0; i < dst.height; i++) {
				for (j = 0; j < dst.width; j++) {
				
					var r = src.RGBA[(j + i * dst.width) * CHANNELS];
					var g = src.RGBA[1 + (j + i * dst.width) * CHANNELS];
					var b = src.RGBA[2 + (j + i * dst.width) * CHANNELS];
					
					var max = Math.max(r, g, b);
					var min = Math.min(r, g, b);
					var h;
					if(max == min) h = 0;
			        else if(max == r) h = ((g - b) / (max - min)) * 60;
			        else if(max == g) h = ((b - r) / (max - min)) * 60 + 120;
			        else h = ((r - g) / (max - min)) * 60 + 240;
			        if(h < 0) h += 360;
			        h = h * 256 / 360;
			        
			        var l = (Math.max(r, g, b) / 255 + Math.min(r, g, b) / 255) / 2;
			        var s;
			        if(l <= 0.5) {
			            s = (Math.max(r, g, b) - Math.min(r, g, b)) / (Math.max(r, g, b) + Math.min(r, g, b));
			        } else {
			            s = (Math.max(r, g, b) - Math.min(r, g, b)) / (2 * 255 - Math.max(r, g, b) - Math.min(r, g, b));
			        }
					dst.RGBA[(j + i * dst.width) * CHANNELS] = h;
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] =  255 * l;
					dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = 255 * s;

					dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * dst.width) * CHANNELS];
				}
			}
		break;
		
		case CV_CODE.HLS2RGB:
			for (i = 0; i < dst.height; i++) {
				for (j = 0; j < dst.width; j++) {	
					var h = dst.RGBA[(j + i * dst.width) * CHANNELS];
					var l = dst.RGBA[1 + (j + i * dst.width) * CHANNELS];
					var s = dst.RGBA[2 + (j + i * dst.width) * CHANNELS];
					
					h = h * 360 / 256;
					l /= 255;
					s /= 255;
					
					var max = (l <= 0.5) ? l * (1 + s) : l + s - l * s;
					var min = 2 * l - max;
					
					var r = Math.floor(calc(max, min, h + 120) * 255);
					var g = Math.floor(calc(max, min, h) * 255);
					var b = Math.floor(calc(max, min, h - 120) * 255);
					
					dst.RGBA[(j + i * dst.width) * CHANNELS] = r;
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = g;
					dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = b;
					dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * dst.width) * CHANNELS];
					
					function calc(n1, n2, hue) {
					    hue = (hue + 180) % 360;
					    if(hue < 60) return n1 + (n2 - n1) * hue / 60;
					    else if(hue < 180) return n2;
					    else if(hue < 240) return n1 + (n2 - n1) * (240 - hue) / 60;
					    else return n1;
					}
				}
			}
		break;
			
		default:
			throw "code" + ERROR.SWITCH_VALUE;
		break;
		}
	}
	catch(ex){
		alert("cvCvtColor : " + ex);
	}
}

function cvFourArithmeticOperations(src1, src2, dst, four_arithmetic){
	try{
		if(cvUndefinedOrNull(src1) || cvUndefinedOrNull(src2) || cvUndefinedOrNull(dst)) throw "src1 or src2 or dst" + ERROR.IS_UNDEFINED_OR_NULL;
		if(src1.width != src2.width || src1.height != src2.height ||
			src1.width != dst.width || src1.height != dst.height) throw ERROR.DIFFERENT_SIZE;
		
		for(i = 0 ; i < dst.height ; i++){
			for(j = 0; j < dst.width ; j++){
				for(c = 0 ; c < CHANNELS ; c++){
					var newValue;
					switch(four_arithmetic){
					case FOUR_ARITHMETIC.ADD:
						newValue = src1.RGBA[c + (j + i * dst.width) * CHANNELS] + src2.RGBA[c + (j + i * dst.width) * CHANNELS];
					break;
					case FOUR_ARITHMETIC.SUB:
						newValue = src1.RGBA[c + (j + i * dst.width) * CHANNELS] - src2.RGBA[c + (j + i * dst.width) * CHANNELS];
					break;
					case FOUR_ARITHMETIC.MUL:
						newValue = src1.RGBA[c + (j + i * dst.width) * CHANNELS] * src2.RGBA[c + (j + i * dst.width) * CHANNELS];
					break;
					case FOUR_ARITHMETIC.DIV:
						newValue = src1.RGBA[c + (j + i * dst.width) * CHANNELS] / src2.RGBA[c + (j + i * dst.width) * CHANNELS];
					break;
					default:
						throw "four_arithmetic" + ERROR.SWITCH_VALUE;
						return;
					break;
					}
					
					dst.RGBA[c + (j + i * dst.width) * CHANNELS] = newValue;
				}
			}
		}
	}
	catch(ex){
		throw ex;
	}
}
function cvAdd(src1, src2, dst){
	try{
		cvFourArithmeticOperations(src1, src2, dst, FOUR_ARITHMETIC.ADD);
	}
	catch(ex){
		alert("cvAdd : " + ex);
	}
}

function cvSub(src1, src2, dst){
	try{
		cvFourArithmeticOperations(src1, src2, dst, FOUR_ARITHMETIC.SUB);
	}
	catch(ex){
		alert("cvSub : " + ex);
	}
}

function cvMul(src1, src2, dst){
	try{
		cvFourArithmeticOperations(src1, src2, dst, FOUR_ARITHMETIC.MUL);
	}
	catch(ex){
		alert("cvMul : " + ex);
	}
}

function cvDiv(src1, src2, dst){
	try{
		cvFourArithmeticOperations(src1, src2, dst, FOUR_ARITHMETIC.DIV);
	}
	catch(ex){
		alert("cvDiv : " + ex);
	}
}

function cvConvertScaleAbs(src, dst){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst)) throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL;
		if(src.width != dst.width || src.height != dst.height) throw ERROR.DIFFERENT_SIZE;
		
		for(i = 0 ; i < dst.height ; i++){
			for(j = 0; j < dst.width ; j++){
				for(c = 0 ; c < CHANNELS ; c++){
					dst.RGBA[c + (j + i * dst.width) * CHANNELS] = Math.abs(src.RGBA[c + (j + i * dst.width) * CHANNELS]);
				}
			}
		}
	}
	catch(ex){
		alert("cvConvertScaleAbs : " + ex);
	}
}


function cvDilateOrErode(src, dst, element, iterations, isDilate){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst))
			throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL;

		if(cvUndefinedOrNull(element))
		{
			element = new Size();
			element.width = 3;
			element.height = 3;
		}
		else if(element.width % 2 == 0 || element.height % 2 == 0)
			throw "element" + ONLY_ADD_NUMBER;

		if(cvUndefinedOrNull(iterations)) iterations = 1;
		
		var ehE = Math.floor(element.height/2);
		var ehS = -1 * ehE;
		var ewE = Math.floor(element.width/2);
		var ewS = -1 * ewE;
				
		cvCopy(src, dst);
		
		var dmy = cvCreateImage(src.width, src.height);
		
		for(ite = 0 ; ite < iterations ; ite++){
			cvCopy(dst, dmy);
			for(ih = 0 ; ih < dst.height ; ih++){
				for(iw = 0 ; iw < dst.width ; iw++){
					for(c = 0 ; c < CHANNELS - 1; c++){
						var value = isDilate ? 0 : 255;
						for(eh = ehS ; eh < ehE ; eh++){
							var h = ih + eh;
							if(h >= 0 && h < src.height){
								for(ew = ewS ; ew < ewE ; ew++){
									var w = iw + ew;
									if(w >= 0 && w < src.width){
										if((isDilate && value < dmy.RGBA[c + (w + h * dst.width) * CHANNELS]) ||
											(!isDilate && value > dmy.RGBA[c + (w + h * dst.width) * CHANNELS]))
											value = dmy.RGBA[c + (w + h * dst.width) * CHANNELS];
									}
								}
							}
						}
						dst.RGBA[c + (iw + ih * dst.width) * CHANNELS] = value
					}
				}
			}
		}
	}
	catch(ex){
		throw ex;
	}
} 


function cvSetRGBA(src, r, g, b, a){
	try{
		if(cvUndefinedOrNull(r)) r = 255;
		if(cvUndefinedOrNull(g)) g = 255;
		if(cvUndefinedOrNull(b)) b = 255;
		if(cvUndefinedOrNull(a)) a = 255;

		var scalar = new Scalar();
		scalar.r = r;
		scalar.g = g;
		scalar.b = b;
		scalar.a = a;
		
		cvSet(src, scalar);
	}
	catch(ex){
		alert("cvSet : " + ex);
	}
}
function cvSet(src, value){
	try{
		for(i = 0 ; i < src.height ; i++){
			for(j = 0 ; j < src.width ; j++){
				src.RGBA[(j + i * src.width) * CHANNELS] = value.r;
				src.RGBA[1 + (j + i * src.width) * CHANNELS] = value.g;
				src.RGBA[2 + (j + i * src.width) * CHANNELS] = value.b;
				src.RGBA[3 + (j + i * src.width) * CHANNELS] = value.a;
			}
		}
	}
	catch(ex){
		alert("cvSet : " + ex);
	}
}

function cvZero(src){
	try{
		for(i = 0 ; i < src.height ; i++){
			for(j = 0 ; j < src.width ; j++){
				for(c = 0 ; c < CHANNELS - 1 ; src.RGBA[c++ + (j + i * src.width) * CHANNELS] = 0);
				src.RGBA[3 + (j + i * src.width) * CHANNELS] = 255;
			}
		}
	}
	catch(ex){
		alert("cvZero : " + ex);
	}
}

function cvUndefinedOrNull(value){
	return (value === undefined || value === null) ? true : false;
}

function cvLoadImagePre(event, inputId){
	var dialog = document.getElementById(inputId);
	dialog.value = "";
}

function cvLoadImageAtSrc(src, imgId, iplImage, maxSize){
	try{
		if(maxSize === undefined) maxSize = -1;
		var imgElement = document.getElementById(imgId);
		imgElement.src = src;
	    imgElement.onload = function(){
	    	var originalSize = cvGetOriginalSizeAtImgElement(imgElement);
	    	var scale = 1;
	    	if(maxSize != -1 && (originalSize.width > maxSize || originalSize.height > maxSize))
	    		scale = (originalSize.width > originalSize.height) ? 
		    		maxSize / originalSize.width : maxSize / originalSize.height;
	    	imgElement.width = scale * originalSize.width;
	    	imgElement.height = scale * originalSize.height;
		    iplImage.canvas = cvGetCanvasAtImgElement(imgElement);
		    iplImage.width = iplImage.canvas.width;
		    iplImage.height = iplImage.canvas.height;
		    iplImage.imageData = iplImage.canvas.getContext("2d").getImageData(0, 0, iplImage.canvas.width, iplImage.canvas.height);
		    for(i = 0 ; i < iplImage.height ; i++){
		    	for(j = 0 ; j < iplImage.width ; j++){
		    		for(c = 0 ; c < CHANNELS ; c++){
			    		iplImage.RGBA[c + (j + i * iplImage.width) * CHANNELS] = iplImage.imageData.data[c + (j + i * iplImage.width) * CHANNELS];
			    	}
		    	}
		    }
		}
	}
	catch(ex){
		alert("cvLoadImage : " + ex);
	}
}

function cvLoadImage(event, imgId, iplImage, maxSize){	
	try{
		var file = event.target.files[0];
		if (file){
			if(maxSize === undefined) maxSize = -1;
			var reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = function(event){
				var imgElement = document.getElementById(imgId);
			    imgElement.src = event.target.result;
			    imgElement.onload = function(){
			    	var originalSize = cvGetOriginalSizeAtImgElement(imgElement);
			    	var scale = 1;
			    	if(maxSize != -1 && (originalSize.width > maxSize || originalSize.height > maxSize))
			    		scale = (originalSize.width > originalSize.height) ? 
				    		maxSize / originalSize.width : maxSize / originalSize.height;
			    	imgElement.width = scale * originalSize.width;
			    	imgElement.height = scale * originalSize.height;
				    iplImage.canvas = cvGetCanvasAtImgElement(imgElement);
				    iplImage.width = iplImage.canvas.width;
				    iplImage.height = iplImage.canvas.height;
				    iplImage.RGBA = new Array(iplImage.width * iplImage.width * CHANNELS);
				    iplImage.imageData = iplImage.canvas.getContext("2d").getImageData(0, 0, iplImage.canvas.width, iplImage.canvas.height);
				    for(i = 0 ; i < iplImage.height ; i++){
				    	for(j = 0 ; j < iplImage.width ; j++){
				    		for(c = 0 ; c < CHANNELS ; c++){
					    		iplImage.RGBA[c + (j + i * iplImage.width) * CHANNELS] = 
					    			iplImage.imageData.data[c + (j + i * iplImage.width) * CHANNELS];
					    	}
				    	}
				    }				    
				};
			};
			reader.onerror = function(event){
				if (event.target.error.code == event.target.error.NOT_READABLE_ERR) {
					alert(ERROR.NOT_READ_FILE);
				}
			};
		}
		
		
	}
	catch(ex){
		alert("cvLoadImage : " + ex);
	}
}

function cvCreateImage(width, height){
	var dst = null;
	try{
		dst = new IplImage();
		dst.canvas = document.createElement('canvas');
		dst.canvas.width = width;
		dst.canvas.height = height;
		if (cvUndefinedOrNull(dst.canvas)) throw 'canvas' + ERROR.IS_UNDEFINED_OR_NULL;
		if (! dst.canvas.getContext) throw ERROR.NOT_GET_CONTEXT;
		dst.height = dst.canvas.height;
		dst.width = dst.canvas.width;
		dst.imageData = dst.canvas.getContext("2d").getImageData(0, 0, dst.canvas.width, dst.canvas.height);
		dst.RGBA = new Array(dst.width * dst.width * CHANNELS);
	    for(i = 0 ; i < dst.height ; i++){
	    	for(j = 0 ; j < dst.width ; j++){
	    		for(c = 0 ; c < CHANNELS - 1; dst.RGBA[c++ + (j + i * dst.width) * CHANNELS] = 0);
		    	dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = 255;
	    	}
	    }
	}
	catch(ex){
		alert("cvCreateImage : " + ex);
	}
	
	return dst;
}

function cvShowImage(imgId, iplImage){
	try{
		cvRGBA2ImageData(iplImage);
		if (iplImage.canvas.getContext) {
			iplImage.canvas.getContext("2d").putImageData(iplImage.imageData, 0, 0);
		    var imgElement = document.getElementById(imgId);
		    if(imgElement == null) throw imgId + ERROR.IS_UNDEFINED_OR_NULL;
		 
		    imgElement.src = DMY_IMG;
		    imgElement.onload = function(event){
			    imgElement.src = iplImage.canvas.toDataURL('image/jpeg');
			};
		}
		else throw ERROR.NOT_GET_CONTEXT;
	}
	catch(ex){
		alert("cvShowImage : " + ex);
	}
}

function cvRGBA2ImageData(iplImage){
	try{
		for(i = 0 ; i < iplImage.height ; i++){
			for(j = 0 ; j < iplImage.width ; j++){
				for(c = 0 ; c < CHANNELS; c++){
					iplImage.imageData.data[c + (j + i * iplImage.width) * CHANNELS] = 
						iplImage.RGBA[c + (j + i * iplImage.width) * CHANNELS];
				}
			}
		}
		
	}
	catch(ex){
		alert("RGBA2ImageData : " + ex);
	}
}


function cvGetCanvasAtImgElement(image){
	var canvas;
	try{
		canvas = document.createElement('canvas');	
		
		if(cvUndefinedOrNull(canvas)) throw "canvas" + ERROR.IS_UNDEFINED_OR_NULL;
	    
    	canvas.width = image.width;
    	canvas.height = image.height;
    	
    	canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
	}
	catch(ex){
		alert("cvGetCanvasAtImgElement : " + ex);
	}
	return canvas;
}

// get Image true size
function cvGetOriginalSizeAtImgElement(image){
    var w = image.width ,
        h = image.height ;
 
    if ( image.naturalWidth !== undefined ) {  // for Firefox, Safari, Chrome
        w = image.naturalWidth;
        h = image.naturalHeight;
 
    } else if ( image.runtimeStyle !== undefined ) {    // for IE
        var run = image.runtimeStyle;
        var mem = { w: run.width, h: run.height };  // keep runtimeStyle
        run.width  = "auto";
        run.height = "auto";
        w = image.width;
        h = image.height;
        run.width  = mem.w;
        run.height = mem.h;
 
    } else {         // for Opera
        var mem = { w: image.width, h: image.height };  // keep original style
        image.removeAttribute("width");
        image.removeAttribute("height");
        w = image.width;
        h = image.height;
        image.width  = mem.w;
        image.height = mem.h;
    }

    return {width:w, height:h};
}