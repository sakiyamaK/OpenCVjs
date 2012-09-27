var IplImage = function(){
	width: 0;
	height: 0;
	canvas: null;
	context: null;
	imageData: null;
	RGBA: null;
}
var Size = function(){
	width: 0;
	height: 0;
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

var CHANNELS = 4;

var ERROR = {
	IS_NULL : "がnullです",
	DIFFERENT_SIZE : "IplImageサイズは全て同じにして下さい",
	ONLY_ADD_NUMBER : "は奇数にして下さい",
	ONLY_INTERGER_NUMBER : "は整数にして下さい",
	ONLY_POSITIVE_NUMBER : "は正の値にして下さい",
	NOT_READ_FILE : "ファイルが読み込めません",
	NOT_GET_CONTEXT : "contextが読み込めません",
	DIFFERENCE_INPUT : "引数に誤りがあります"
}


function cvDilate(src, dst, element, iterations){
	try{
		if(src === undefined || dst === undefined)
			throw "src or dst" + ERROR.IS_NULL;
		if(element === undefined)
		{
			element = new Size();
			element.width = 3;
			element.height = 3;
		}
		else if(element.width % 2 == 0 || element.height % 2 == 0)
			throw "element" + ONLY_ADD_NUMBER;
		
		if(iterations === undefined) iterations = 1;
		
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
						var max = 0;
						for(eh = ehS ; eh < ehE ; eh++){
							var h = ih + eh;
							if(h >= 0 && h < src.height){
								for(ew = ewS ; ew < ewE ; ew++){
									var w = iw + ew;
									if(w >= 0 && w < src.width){
										if(max < dmy.RGBA[c + (w + h * dst.width) * CHANNELS])
											max = dmy.RGBA[c + (w + h * dst.width) * CHANNELS];
									}
								}
							}
						}
						dst.RGBA[c + (iw + ih * dst.width) * CHANNELS] = max
					}					
				}
			}
		}			
	}
	catch(ex){
		alert("cvDilate : " + ex);
	}
} 
function cvGetCanvasAtImgElement(image){
	var canvas;
	try{
		canvas = document.createElement('canvas');	
		
		if(canvas == null) throw "canvas" + ERROR.IS_NULL;
	    
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
 
    if ( typeof image.naturalWidth !== undefined ) {  // for Firefox, Safari, Chrome
        w = image.naturalWidth;
        h = image.naturalHeight;
 
    } else if ( typeof image.runtimeStyle !== undefined ) {    // for IE
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
		    var canvas = cvGetCanvasAtImgElement(imgElement);
		    iplImage.width = canvas.width;
		    iplImage.height = canvas.height;
		    iplImage.RGBA = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
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
				    var canvas = cvGetCanvasAtImgElement(imgElement);
				    iplImage.width = canvas.width;
				    iplImage.height = canvas.height;
				    iplImage.RGBA = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
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

function cvShowImage(imgId, iplImage){
	try{
		iplImage.context.putImageData(iplImage.imageData, 0, 0);
		
		if (iplImage.canvas.getContext) {
		    var imgElement = document.getElementById(imgId);
		    if(imgElement == null) throw imgId + ERROR.IS_NULL;
		 
		    imgElement.src = "javascript/dmy.jpg";
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

function cvCloneImage(src){
	var dst = null;

	try{
		dst = cvCreateImage(src.width, src.height);
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
		alert("cvCloneImage : " + ex);
	}
	
	return dst;
}

function cvCreateImage(width, height){
	var dst = null;
	try{
		dst = new IplImage();
		dst.canvas = document.createElement('canvas');
		dst.canvas.width = width;
		dst.canvas.height = height;
		
		if(dst.canvas == null) throw 'canvas' + ERROR.IS_NULL;
		
		if (! dst.canvas.getContext) throw ERROR.NOT_GET_CONTEXT;
		
		dst.height = dst.canvas.height;
		dst.width = dst.canvas.width;
		dst.context = dst.canvas.getContext("2d");
		dst.imageData = dst.context.createImageData(dst.width, dst.height);
		dst.RGBA = dst.imageData.data;
	}
	catch(ex){
		alert("cvCreateImage : " + ex);
	}
	
	return dst;
}

function cvCopy(src, dst){
	try{
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
			break;
		}
	}
	catch(ex){
		alert("cvThreshold : " + ex);
	}
}

function cvResize(src, dst){
	try{
		var scaleWidth = src.width / dst.width;
		var scaleHeight = src.height / dst.height;
		var scale = scaleWidth > scaleHeight ? scaleHeight : scaleWidth;
	
		for(i = 0 ; i < dst.height ; i++){
			var h = scale * i ;

			for(j = 0 ; j < dst.width ; j++){
				var w = scale * j;
				
				for( c = 0 ; c < CHANNELS ; c++){
					var v = scale * src.RGBA[c + (w + h * src.width) * CHANNELS];

					v = cvChangePixelValue(v);

					dst.RGBA[c + (j + i * dst.width) * CHANNELS]  = 255;
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
		for(i = 0 ; i < src.height ; i++){
			for(j = 0 ; j < src.width ; j++){
				var v = src.RGBA[color + (j + i * src.width) * CHANNELS];
				v = cvChangePixelValue(lut[v]);
				dst.RGBA[color + (j + i * src.width) * CHANNELS]  = v;
			}
		}
	}
	catch(e){
		alert("cvLUT : " + ex);
	}
}

function cvToneCurve(src, dst, underX, underY, overX, overY, color){
	try{
		if(underX != overX){
			var katamuki = (overY - underY) / (overX - underX) ;
			var yseppen = underY - katamuki * underX;

			for(i = 0 ; i < src.height ; i++){
				for(j = 0 ; j < src.width ; j++){
					var v = src.RGBA[color + (j + i * src.width) * CHANNELS];
					var v = (katamuki * v + yseppen);

					v = cvChangePixelValue(v);

					dst.RGBA[color + (j + i * src.width) * CHANNELS]  = v;
				}
			}
		}
	}
	catch(ex){
		alert("cvToneCurve : " + ex);
	}
}

function cvBlendImage(bg, fg, dst, blendMode){
	try{
		if(bg.width != fg.width || bg.height != fg.height || 
			bg.width != dst.width || bg.height != dst.height) throw ERROR.DIFFERENT_SIZE;
		
		if(typeof blendMode === undefined) blendMode = CV_BLEND_MODE.OVER_LAY;

		var percent = 1;
		for (i = 0; i < bg.height; i++) {
			for (j = 0; j < bg.width; j++) {
				var ch = CHANNELS - 1 ;
				for( c = 0 ; c < ch ; c++){
					
					var bgV = bg.RGBA[c + (j + i * bg.width) * CHANNELS] / 255;
					var fgV = fg.RGBA[c + (j + i * bg.width) * CHANNELS] / 255;

					var v;

					switch(blendMode){
					
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
								bgV + ( sqrt( bgV ) - bgV ) * ( 2.0 * fgV - 1.0 );
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
						throw ERROR.DIFFERENCE_INPUT;
						break;
					}

					var iv = (255 * v);
					
					dst.RGBA[c + (j + i * dst.width) * CHANNELS] = 
						cvChangePixelValue(iv);
				}
				
				dst.RGBA[ch + (j + i * dst.width) * CHANNELS] = 255;
			}
		}
	}
	catch(ex){
		alert("cvBlendImage : " + ex);
	}
}

function cvSmooth(src, dst, smoothType, param1, param2, param3, param4){
	try{
		if(src.width != dst.width || src.height != dst.height) throw ERROR.DIFFERENT_SIZE;
		if(typeof smoothType === undefined) smoothType = CV_SMOOTH_TYPE.GAUSSIAN;
		
		switch(smoothType){
			case CV_SMOOTH_TYPE.BLUR_NO_SCALE:
			break;
			
			case CV_SMOOTH_TYPE.BLUR:
			break;
			
			case CV_SMOOTH_TYPE.GAUSSIAN:
			
				if(typeof param1 === undefined) param1 = 3;
				if(typeof param2 === undefined) param2 = param1;
				if(typeof param3 === undefined) param3 = 0;
				if(typeof param4 === undefined) param4 = 0;
				
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
							for(y = 0 ; y < param1 ; y++){
								for(x = 0 ; x < param2 ; x++){
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
							}
							dst.RGBA[c + (j + i * src.width) * CHANNELS] = newValue;
						}
					}
				}
			
			break; 
			
			case CV_SMOOTH_TYPE.MEDIAN:
				
				if(typeof param1 === undefined) param1 = 3;
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
							
							dst.RGBA[c + (j + i * src.width) * CHANNELS] = array[Math.floor(array.length / 2)];
						}
					}
				}
				for(i = 0 ; i < src.height ; i++){
					for(j = 0 ; j < src.width ; j++){
						dst.RGBA[3 + (j + i * src.width) * CHANNELS] = src.RGBA[3 + (j + i * src.width) * CHANNELS] ;
					}
				}
			break; 
			
			case CV_SMOOTH_TYPE.BILATERAL:
			break; 
		}
	}
	catch(ex){
		alert("cvSmooth : " + ex);
	}
}

function cvSobel(src, dst, xorder, yorder, aperture_size){
	try{
		if(src.width != dst.width || src.height != dst.height) throw ERROR.DIFFERENT_SIZE;
		if(aperture_size === undefined) aperture_size = 3;
		
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
				throw "aperture_sizeは1, 3, 5または7 のいずれかにしてください";
			break;
		}
	}
	catch(ex){
		alert("cvSobel : " + ex);
	}
}

function cvCanny(src, dst, threshold1, threshold2, aperture_size){
	try{
		if(src.width != dst.width || src.height != dst.height) throw ERROR.DIFFERENT_SIZE;
		if(aperture_size === undefined) aperture_size = 3;
		
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
		if(src.width != dst.width || src.height != dst.height) throw ERROR.DIFFERENT_SIZE;
		
		switch(code){
			case CV_CODE.RGB2GRAY:
				for (i = 0; i < dst.height; i++) {
					for (j = 0; j < dst.width; j++) {
					
						var v = (src.RGBA[(j + i * dst.width) * CHANNELS] + 
								src.RGBA[1 + (j + i * dst.width) * CHANNELS] + 
								src.RGBA[2 + (j + i * dst.width) * CHANNELS]) / 3;
								
						var iv = cvChangePixelValue(v);
						
						dst.RGBA[(j + i * dst.width) * CHANNELS] = iv;
						dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = iv;
						dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = iv;
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
						
						var max, mid, min;
						if(r == g && g == b){
							max = r; mid = r; min = r;
							dst.RGBA[(j + i * dst.width) * CHANNELS] = 0;
						}
						else if(r >= g && g >= b){ //0~60
							max = r; mid = g; min = b; 
							dst.RGBA[(j + i * dst.width) * CHANNELS] = 
								cvChangePixelValue((max == min) ? max : (mid - min) / (max - min) * 60);
						}
						else if(g >= r && r >= b){//60~120
							max = g; mid = r; min = b; 
							dst.RGBA[(j + i * dst.width) * CHANNELS] = 
								cvChangePixelValue((max == min) ? max : (max - mid) / (max - min) * 60 + 60); 
						}
						else if(g >= b && b >= r){//120~180
							max = g; mid = b; min = r;
							dst.RGBA[(j + i * dst.width) * CHANNELS] = 
								cvChangePixelValue((max == min) ? max : (mid - min) / (max - min) * 60 + 120);
						}
						else if(b >= g && g >= r){//180~240
							max = b; mid = g; min = r; 
							dst.RGBA[(j + i * dst.width) * CHANNELS] = 
								cvChangePixelValue((max == min) ? max : (max - mid) / (max - min) * 60 + 180); 
						}
						else if(b >= r && r >= g){//240~300
							max = b; mid = r; min = g;
							dst.RGBA[(j + i * dst.width) * CHANNELS] = 
								cvChangePixelValue((max == min) ? max : (mid - min) / (max - min) * 60 + 240);
						}
						else if(r >= b && b >= g){//300~360
							max = r; mid = b; min = g;
							dst.RGBA[(j + i * dst.width) * CHANNELS] = 
								cvChangePixelValue((max == min) ? max : (max - mid) / (max - min) * 60 + 300); 
						}

						dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = 
							cvChangePixelValue(( max == 0 ) ? 0 : (max - min) / max * 255) ;
						dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = cvChangePixelValue(max);
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
						if(0 <= h && h < 60){
							red = v;
							blue = v - s * v / 255;
							green = h * (red - blue) / 60 + blue;
						}
						else if(60 <= h && h < 120){
							green = v;
							blue = v - s * v / 255;
							red = green - (h - 60) * (green - blue) / 60;
						}
						else if(120 <= h && h < 180){
							green = v;
							red =  v - s * v / 255;
							blue = (h - 120) * (green - red) / 60 + red;
						}
						else if(180 <= h && h < 240){
							blue = v;
							red = v - s * v / 255;
							green = blue - (h - 180)*(blue - red)/60;
						}
						else if(240 <= h && h < 300){
							blue = v;
							green = v - s * v / 255;
							red = (h - 240) * (blue - green) / 60 + green;
						}
						else if(300 <= h && h < 360){
							red = v;
							green = v - s * v / 255;
							blue = red - (h - 300) * (red - green) / 60;
						}
						
						dst.RGBA[(j + i * dst.width) * CHANNELS] = cvChangePixelValue(red);
						dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = cvChangePixelValue(green);
						dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = cvChangePixelValue(blue);
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
						
						var h;
				        if(Math.max(r, g, b) == r) {
				            h = ((g - b) / (Math.max(r, g, b) - Math.min(r, g, b))) * 60;
				        } else if(Math.max(r, g, b) == g) {
				            h = ((b - r) / (Math.max(r, g, b) - Math.min(r, g, b))) * 60 + 120;
				        } else {
				            h = ((r - g) / (Math.max(r, g, b) - Math.min(r, g, b))) * 60 + 240;
				        }
				        
				        var l = (Math.max(r, g, b) / 255 + Math.min(r, g, b) / 255) / 2;
				        var s;
				        if(l <= 0.5) {
				            s = (Math.max(r, g, b) - Math.min(r, g, b)) / (Math.max(r, g, b) + Math.min(r, g, b));
				        } else {
				            s = (Math.max(r, g, b) - Math.min(r, g, b)) / (2 * 255 - Math.max(r, g, b) - Math.min(r, g, b));
				        }
						dst.RGBA[(j + i * dst.width) * CHANNELS] = cvChangePixelValue(h);
						dst.RGBA[1 + (j + i * dst.width) * CHANNELS] =  cvChangePixelValue(255 * l);
						dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = cvChangePixelValue(255 * s);

						dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * dst.width) * CHANNELS];
					}
				}
			break;
			
			case CV_CODE.HLS2RGB:
				for (i = 0; i < dst.height; i++) {
					for (j = 0; j < dst.width; j++) {	
						var max;
						var h = dst.RGBA[(j + i * dst.width) * CHANNELS];
						var l = dst.RGBA[1 + (j + i * dst.width) * CHANNELS];
						var s = dst.RGBA[2 + (j + i * dst.width) * CHANNELS];
						
						l /= 255;
						s /= 255;
						if(l <= 0.5) {
						    max = l * (1 + s);
						} else {
						    max = l + s - l * s;
						}
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
						    if(hue < 60) {
						        return n1 + (n2 - n1) * hue / 60;
						    } else if(hue < 180) {
						        return n2;
						    } else if(hue < 240) {
						        return n1 + (n2 - n1) * (240 - hue) / 60;
						    } else {
						        return n1;
						    }
						}						
					}
				}
			break;
				
			default:
				throw "codeの値が正しくありません";
			break;
		}
	}
	catch(ex){
		alert("cvCvtColor : " + ex);
	}
}

function cvAdd(src1, src2, dst){
	try{
		if(src1.width != src2.width || src1.height != src2.height ||
			src1.width != dst.width || src1.height != dst.height) throw ERROR.DIFFERENT_SIZE;
			
		for(i = 0 ; i < dst.height ; i++){
			for(j = 0; j < dst.width ; j++){
				for(c = 0 ; c < CHANNELS ; c++){
					var newValue = src1.RGBA[c + (j + i * dst.width) * CHANNELS] + src2.RGBA[c + (j + i * dst.width) * CHANNELS];
					dst.RGBA[c + (j + i * dst.width) * CHANNELS] = newValue;
				}
			}
		}
	}
	catch(ex){
		alert("cvAdd : " + ex);
	}
}

function cvConvertScaleAbs(src, dst){
	try{
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

function cvChangePixelValue(v){
	if(v > 255) return 255;
	else if(v < 0) return 0;
	else return Math.floor(v);
}