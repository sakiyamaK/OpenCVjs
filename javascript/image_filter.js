function Test(imgId, iplImage){
	try{
		var newIplImage = cvCloneImage(iplImage);
	cvThreshold(iplImage, newIplImage, 128, 255, CV_THRESHOLD_TYPE.THRESH_OTSU);
		
		var layer1 = cvCreateImage(iplImage.width, iplImage.height);
		var layer2 = cvCreateImage(iplImage.width, iplImage.height);
		
		var max = layer1.width*layer1.width + layer1.height*layer1.height;
		
		for(i = 0 ; i < layer1.height ; i++){
			for(j = 0 ; j < layer1.width ; j++){
				layer1.RGBA[(j + i * layer1.width) * CHANNELS] = 255*i/(2*layer1.height);
				layer1.RGBA[1 + (j + i * layer1.width) * CHANNELS] = 255;
				layer1.RGBA[2 + (j + i * layer1.width) * CHANNELS] = 255;
				layer1.RGBA[3 + (j + i * layer1.width) * CHANNELS] = 255;
			}
		}
		
		for(i = 0 ; i < layer2.height ; i++){
			for(j = 0 ; j < layer2.width ; j++){
				layer2.RGBA[(j + i * layer2.width) * CHANNELS] = 255 - 255*i/(2*layer2.height);
				layer2.RGBA[1 + (j + i * layer2.width) * CHANNELS] = 255;
				layer2.RGBA[2 + (j + i * layer2.width) * CHANNELS] = 255;
				layer2.RGBA[3 + (j + i * layer2.width) * CHANNELS] = 255;
			}
		}
		
		cvCvtColor(layer1, layer1, CV_CODE.HSV2RGB);
		cvCvtColor(layer2, layer2, CV_CODE.HSV2RGB);
		
		for(i = 0 ; i < newIplImage.height ; i++){
			for(j = 0 ; j < newIplImage.width ; j++){
				if(newIplImage.RGBA[(j + i * layer1.width) * CHANNELS] == 255){
					newIplImage.RGBA[(j + i * layer1.width) * CHANNELS] = layer1.RGBA[(j + i * layer1.width) * CHANNELS];
					newIplImage.RGBA[1 + (j + i * layer1.width) * CHANNELS] = layer1.RGBA[1 + (j + i * layer1.width) * CHANNELS];
					newIplImage.RGBA[2 + (j + i * layer1.width) * CHANNELS] = layer1.RGBA[2 + (j + i * layer1.width) * CHANNELS];
				}
				else{
					newIplImage.RGBA[(j + i * layer1.width) * CHANNELS] = layer2.RGBA[(j + i * layer1.width) * CHANNELS];
					newIplImage.RGBA[1 + (j + i * layer1.width) * CHANNELS] = layer2.RGBA[1 + (j + i * layer1.width) * CHANNELS];
					newIplImage.RGBA[2 + (j + i * layer1.width) * CHANNELS] = layer2.RGBA[2 + (j + i * layer1.width) * CHANNELS];
				}
			}
		}
		
		cvShowImage(imgId, newIplImage);
	}
	catch(ex){
		alert("Sobel : " + ex);
	}	
}

function Rainbow(imgId, iplImage){
	var layer1 = cvCreateImage(iplImage.width, iplImage.height);
	
	var max = layer1.width*layer1.width + layer1.height*layer1.height;
	
	for(i = 0 ; i < layer1.height ; i++){
		for(j = 0 ; j < layer1.width ; j++){
			var v = j*j + i*i;
			layer1.RGBA[(j + i * layer1.width) * CHANNELS] = 255*v/max;
			layer1.RGBA[1 + (j + i * layer1.width) * CHANNELS] = 255;
			layer1.RGBA[2 + (j + i * layer1.width) * CHANNELS] = 255;
			layer1.RGBA[3 + (j + i * layer1.width) * CHANNELS] = 255;
		}
	}
	
	cvCvtColor(layer1, layer1, CV_CODE.HSV2RGB);
	
	var newIplImage = cvCloneImage(iplImage);
	
	cvBlendImage(newIplImage, layer1, newIplImage, CV_BLEND_MODE.SOFT_LIGHT);

	cvShowImage(imgId, newIplImage);

}

function Bilateral(imgId, iplImage){
	var newIplImage = cvCloneImage(iplImage);
	cvSmooth(iplImage, newIplImage, CV_SMOOTH_TYPE.BILATERAL);
	cvShowImage(imgId, newIplImage);
}

function Dilate(imgId, iplImage){
	var newIplImage = cvCloneImage(iplImage);
	cvCvtColor(iplImage, newIplImage, CV_CODE.RGB2GRAY);
	cvThreshold(newIplImage, newIplImage, 128, 255, CV_THRESHOLD_TYPE.THRESH_OTSU);
	cvDilate(newIplImage, newIplImage);
	cvShowImage(imgId, newIplImage);
}

function Erode(imgId, iplImage){
	var newIplImage = cvCloneImage(iplImage);
	cvCvtColor(iplImage, newIplImage, CV_CODE.RGB2GRAY);
	cvThreshold(newIplImage, newIplImage, 128, 255, CV_THRESHOLD_TYPE.THRESH_OTSU);
	cvErode(newIplImage, newIplImage);
	cvShowImage(imgId, newIplImage);
}

function Open(imgId, iplImage){
	var newIplImage = cvCloneImage(iplImage);
	cvCvtColor(iplImage, newIplImage, CV_CODE.RGB2GRAY);
	cvThreshold(newIplImage, newIplImage, 128, 255, CV_THRESHOLD_TYPE.THRESH_OTSU);
	var dstIplImage = cvCloneImage(newIplImage);
	cvMorphologyEx(newIplImage, dstIplImage, null, CV_MOP.OPEN);
	cvShowImage(imgId, dstIplImage);
}

function Close(imgId, iplImage){
	var newIplImage = cvCloneImage(iplImage);
	cvCvtColor(iplImage, newIplImage, CV_CODE.RGB2GRAY);
	cvThreshold(newIplImage, newIplImage, 128, 255, CV_THRESHOLD_TYPE.THRESH_OTSU);
	var dstIplImage = cvCloneImage(newIplImage);
	cvMorphologyEx(newIplImage, newIplImage, null, CV_MOP.CLOSE);
	cvShowImage(imgId, dstIplImage);
}

function Gradient(imgId, iplImage){
	var newIplImage = cvCloneImage(iplImage);
	cvCvtColor(iplImage, newIplImage, CV_CODE.RGB2GRAY);
	cvThreshold(newIplImage, newIplImage, 128, 255, CV_THRESHOLD_TYPE.THRESH_OTSU);
	var dstIplImage = cvCloneImage(newIplImage);
	cvMorphologyEx(newIplImage, newIplImage, null, CV_MOP.GRADIENT);
	cvShowImage(imgId, dstIplImage);
}

function Tophat(imgId, iplImage){
	var newIplImage = cvCloneImage(iplImage);
	cvCvtColor(iplImage, newIplImage, CV_CODE.RGB2GRAY);
	cvThreshold(newIplImage, newIplImage, 128, 255, CV_THRESHOLD_TYPE.THRESH_OTSU);
	var dstIplImage = cvCloneImage(newIplImage);
	cvMorphologyEx(newIplImage, newIplImage, null, CV_MOP.TOPHAT);
	cvShowImage(imgId, dstIplImage);
}

function Blackhat(imgId, iplImage){
	var newIplImage = cvCloneImage(iplImage);
	cvCvtColor(iplImage, newIplImage, CV_CODE.RGB2GRAY);
	cvThreshold(newIplImage, newIplImage, 128, 255, CV_THRESHOLD_TYPE.THRESH_OTSU);
	var dstIplImage = cvCloneImage(newIplImage);
	cvMorphologyEx(newIplImage, newIplImage, null, CV_MOP.BLACKHAT);
	cvShowImage(imgId, dstIplImage);
}


function Smooth(imgId, iplImage){
	var newIplImage = cvCloneImage(iplImage);
	cvSmooth(iplImage, newIplImage);
	cvShowImage(imgId, newIplImage);
}

function Original(imgId, iplImage){
	var newIplImage = cvCloneImage(iplImage);
	cvShowImage(imgId, newIplImage);
}

function Threshold(imgId, iplImage){
	var newIplImage = cvCloneImage(iplImage);
	cvThreshold(iplImage, newIplImage, 128, 255, CV_THRESHOLD_TYPE.THRESH_OTSU);
	cvShowImage(imgId, newIplImage); 
}

function Sobel(imgId, iplImage){
	try{
		var dmyImage = cvCreateImage(iplImage.width, iplImage.height);
		var sobelXImage = cvCreateImage(iplImage.width, iplImage.height);
		var sobelYImage = cvCreateImage(iplImage.width, iplImage.height);
		
		cvCvtColor(iplImage, dmyImage, CV_CODE.RGB2GRAY);
		cvSobel(dmyImage, sobelXImage, 1, 0);
		cvSobel(dmyImage, sobelYImage, 0, 1);
		
		cvAdd(sobelXImage, sobelYImage, sobelXImage);
		
		cvConvertScaleAbs(sobelXImage, sobelXImage);
		
		cvShowImage(imgId, sobelXImage);
	}
	catch(ex){
		alert("Sobel : " + ex);
	}	
}

function Canny(imgId, iplImage){
	try{
		var cannyImage = cvCreateImage(iplImage.width, iplImage.height);
		cvCvtColor(iplImage, cannyImage, CV_CODE.RGB2GRAY);
		cvCanny(cannyImage, cannyImage, 50, 200);
		cvShowImage(imgId, cannyImage);
	}
	catch(ex){
		alert("Canny : " + ex);
	}	
}





function Vivit(imgId, iplImage){
	try{
		var newIplImage = cvCloneImage(iplImage);
		cvCvtColor(iplImage, newIplImage, CV_CODE.RGB2HLS);
		
		for(i = 0 ; i < newIplImage.height ; i++){
			for(j = 0 ; j < newIplImage.width ; j++){
				newIplImage.RGBA[2 + (j + i * newIplImage.width) * CHANNELS] = 255;
			}
		}
		cvCvtColor(newIplImage, newIplImage, CV_CODE.HLS2RGB);
		cvShowImage(imgId, newIplImage);
	}
	catch(ex){
		alert("Vivit : " + ex);
	}
}

function Sepia(imgId, iplImage){
	var HUE=22;
	var SATURATION=90;
	
	var newIplImage = cvCloneImage(iplImage);
	
	cvCvtColor(newIplImage, newIplImage,  CV_CODE.RGB2HSV);
	
	for(i = 0 ; i < newIplImage.height ; i++){
		for(j = 0 ; j < newIplImage.width ; j++){
			newIplImage.RGBA[(j + i * newIplImage.width) * CHANNELS] = HUE;
			newIplImage.RGBA[1 + (j + i * newIplImage.width) * CHANNELS] = SATURATION;
		}
	}
	
	cvCvtColor(newIplImage, newIplImage,  CV_CODE.HSV2RGB);
	
	cvShowImage(imgId, newIplImage);

}

function Amaro(imgId, iplImage){
	try{
		var newIplImage = cvCloneImage(iplImage);

		var AMARO_RED_TONE_CURVE_UNDER_X = 0;
		var AMARO_RED_TONE_CURVE_UNDER_Y = 20;
		var AMARO_RED_TONE_CURVE_OVER_X = 255;
		var AMARO_RED_TONE_CURVE_OVER_Y = 255;
		
		var AMARO_GREEN_TONE_CURVE_UNDER_X = 10;
		var AMARO_GREEN_TONE_CURVE_UNDER_Y = 0;
		var AMARO_GREEN_TONE_CURVE_OVER_X = 255;
		var AMARO_GREEN_TONE_CURVE_OVER_Y = 255;

		var AMARO_BLUE_TONE_CURVE_UNDER_X = 0;
		var AMARO_BLUE_TONE_CURVE_UNDER_Y = 20;
		var AMARO_BLUE_TONE_CURVE_OVER_X = 255;
		var AMARO_BLUE_TONE_CURVE_OVER_Y = 255;
		
		cvToneCurve(newIplImage, newIplImage,
			AMARO_RED_TONE_CURVE_UNDER_X, AMARO_RED_TONE_CURVE_UNDER_Y,
			AMARO_RED_TONE_CURVE_OVER_X, AMARO_RED_TONE_CURVE_OVER_Y, 0);

		cvToneCurve(newIplImage, newIplImage,
			AMARO_GREEN_TONE_CURVE_UNDER_X, AMARO_GREEN_TONE_CURVE_UNDER_Y,
			AMARO_GREEN_TONE_CURVE_OVER_X, AMARO_GREEN_TONE_CURVE_OVER_Y, 1);
			
		cvToneCurve(newIplImage, newIplImage,
			AMARO_BLUE_TONE_CURVE_UNDER_X, AMARO_BLUE_TONE_CURVE_UNDER_Y,
			AMARO_BLUE_TONE_CURVE_OVER_X, AMARO_BLUE_TONE_CURVE_OVER_Y, 2);
		
		cvShowImage(imgId, newIplImage);
	}
	catch(ex){
		alert("Amaro : " + ex);
	}
}


function WhiteBlack(imgId, iplImage){
	try{
		var UNDER = 50;
		var OVER = 150;
		
		var newIplImage = cvCloneImage(iplImage);

		cvCvtColor(iplImage, newIplImage, CV_CODE.RGB2GRAY);
		
		cvToneCurve(newIplImage, newIplImage, UNDER, 0, OVER, 255, 0);
		cvToneCurve(newIplImage, newIplImage, UNDER, 0, OVER, 255, 1);
		cvToneCurve(newIplImage, newIplImage, UNDER, 0, OVER, 255, 2);

		cvShowImage(imgId, newIplImage);
	}
	catch(ex){
		alert("WhiteBlack : " + ex);
	}	
}

function Light(imgId, iplImage){
	try{
		var lightImage = MakeLightImage(iplImage.width, iplImage.height, 255, 1, 2, iplImage.width/2, iplImage.height/2);
		var newIplImage = cvCloneImage(iplImage);
		cvBlendImage(iplImage, lightImage, newIplImage, CV_BLEND_MODE.OVER_LAY);
		cvShowImage(imgId, newIplImage);
	}
	catch(ex){
		alert("Light : " + ex);
	}
}


function MakeLightImage(width, height, power, bunbo, bunshi, radiusX, radiusY){
	var iplImage = cvCreateImage(width, height);
	try{			
		for(i = 0 ; i < height ; i++){
			
			var y = i - height / 2;

			for(j = 0 ; j < width ; j++){
			
				var x = j - width / 2;
				
				var v = power;
				var dis2 = (y * y) / (radiusY * radiusY) + (x * x) / (radiusX * radiusX);
				if(dis2 > 1) v /= Math.pow(dis2, bunshi / bunbo) ;

				for( c = 0 ; c < CHANNELS ; c++){
					iplImage.RGBA[c + (j + i * width) * CHANNELS] = v;
				}
			}
		}
	}
	catch(ex){
		alert("MakeLightImage : " + ex);
	}
	
	return iplImage;
}
