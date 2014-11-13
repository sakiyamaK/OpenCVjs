
function Test(imgId, iplImage){
	try{
        var A = cvCreateMat(3, 2);
        A.vals[0] = 1; A.vals[1] = 2;
        A.vals[2] = 3; A.vals[3] = 4;
        A.vals[4] = 1; A.vals[5] = 2;
        
        //--転置行列との掛け算--
        var trA = cvCreateMat(A.cols, A.rows);
        var AA = cvCreateMat(A.rows, A.rows);
//        cvmTranspose(A, trA);
//        cvmMul(A, trA, AA);
        
        

        cvAlertMat(A);
        cvAlertMat(trA);
        cvAlertMat(AA);
        
//        console.log(A);
//        console.log(W);
//        console.log(U);
	}
	catch(ex){
		alert("Test : " + ex);
	}
}

function EmbedWatermark(imgId, iplImage, watermark, embedStrength, blockSize){
	try{
		var newIplImage = cvEmbedWatermark(iplImage, watermark, embedStrength, blockSize);
		
		cvShowImage(imgId, newIplImage);
		
		alert("埋め込みが完了しました");
	}
	catch(ex){
		alert("EmbedWatermark : " + ex);
	}
}

function ExtractWatermark(iplImage, strLen, embedStrength, blockSize){
	try{
		var watermark = cvExtractWatermark(iplImage, strLen, embedStrength, blockSize);
		
		alert("この画像に埋め込まれている透かしは「" + watermark + "」です");
	}
	catch(ex){
		alert("ExtractWatermark : " + ex);
	}
}

function SVM(imgId, iplImage){
	try{

		var newIplImage = cvCloneImage(iplImage);
		
		var trainss = new Array(); //学習データの2次元配列
		var answers = new Array(); //クラスデータ
		
		//学習
		for(var i = 0 ; i < newIplImage.height ; i++){
			for(var j = 0 ; j < newIplImage.width ; j++){
				//各座標の画素を取得し赤クラスと青クラスに分類
				var ji = (j + i * newIplImage.width) * CHANNELS;
				var r = newIplImage.RGBA[ji];
				var g = newIplImage.RGBA[1 + ji];
				var b = newIplImage.RGBA[2 + ji];
				var answer = 0;
				if(r > 200 && g < 50 && b < 50) answer = 1;
				else if(r < 50 && g < 50 && b > 200) answer = -1;
				if(answer != 0){
					//座標を学習データに代入
					var trains = new Array(j/newIplImage.width, i/newIplImage.height);
					trainss.push(trains);
					answers.push(answer);
				}
			}
		}

		//SVMクラスに読み込ませる終了条件クラスのインスタンスを生成		
		var termcriteria = new CvTermCriteria();
		termcriteria.max_iter = 100000; //最大繰り返し回数
		termcriteria.epsilon = 0.1; //C-SVMのイプシロン
		
		//SVMクラスに読み込ませるパラメータクラスのインスタンスを生成
		var cvSVMP = new CvSVMParams();
		cvSVMP.kernel_type = CV_SVM_KERNEL_TYPE.POLY; //SVMのカーネルの種類
		cvSVMP.degree = 4.0; //カーネルで使われるチューニングパラメータ1
		cvSVMP.gamma = 1.0; //カーネルで使われるチューニングパラメータ2
		cvSVMP.coef0 = 1.0; //カーネルで使われるチューニングパラメータ3
		cvSVMP.C = 5; //C-SVMで使われるC
		cvSVMP.term_crit = termcriteria; //終了条件クラスを代入
		cvSVMP.tolerance = termcriteria.epsilon; //許容する計算誤差
		cvSVMP.minLearnData = 10; //学習データの最低数
		
		//SVMクラスのインスタンスを生成
		var cvSVM = new CvSVM();
		//学習
		cvSVM.train(trainss, answers, null, null, cvSVMP);
		
		//学習データを用いて画像の座標の色を予測する
		for(var i = 0 ; i < newIplImage.height ; i++){
			for(var j = 0 ; j < newIplImage.width ; j++){
				//予測対象の座標を特徴量として配列に代入
				var inputs = new Array(j/newIplImage.width, i/ newIplImage.height);
				//予測
				var predict = cvSVM.predict(inputs);
				
				var r = 255; var g = 255; var b = 255;
				//予測結果が1なら赤、0なら青とする
				if(predict >0){
					r = 255; g = 0; b = 0;
				}
				else{
					r = 0; g = 0; b = 255;
				}
				//特徴量となった座標の色に代入
				var ji = (j + i * newIplImage.width) * CHANNELS;
				newIplImage.RGBA[ji] = r;
				newIplImage.RGBA[1 + ji] = g;
				newIplImage.RGBA[2 + ji] = b;
			}
		}
		
		//画像を出力
		cvShowImage(imgId, newIplImage);
	}
	catch(ex){
		alert("SVM : " + ex);
	}
}


function Perceptron(imgId, iplImage){
	try{
		var newIplImage = cvCloneImage(iplImage);
		
		var inputss = new Array();
		var answers = new Array();
		//特徴点抽出
		for(var i = 0 ; i < newIplImage.height ; i++){
			for(var j = 0 ; j < newIplImage.width ; j++){
				var ji = (j + i * newIplImage.width) * CHANNELS;
				var r = newIplImage.RGBA[ji];
				var g = newIplImage.RGBA[1 + ji];
				var b = newIplImage.RGBA[2 + ji];
				var answer = 0;
				if(r > 200 && g < 50 && b < 50) answer = 1;
				else if(r < 50 && g < 50 && b > 200)answer = -1;
				if(answer != 0){
					var inputs = new Array(j, i);
					inputss[inputss.length] = inputs;
					answers[answers.length] = answer;
				}
			}
		}
		
		//学習
		var termcriteria = new CvTermCriteria();
		termcriteria.max_iter = 100000;
		termcriteria.epsilon = 0;
		
		var pctP = new CvPerceptronParams();
		pctP.nu = 1;
		pctP.term_crit = termcriteria;
		
		var cvPerceptron = new CvPerceptron();

		var params = cvPerceptron.train(inputss, answers, pctP);
		
		//予測
		for(var i = 0 ; i < newIplImage.height ; i++){
			for(var j = 0 ; j < newIplImage.width ; j++){
			
				var inputs = new Array(j, i);
				var predict = cvPerceptron.predict(inputs);
				
				var r = 255; var g = 255; var b = 255;
				if(predict >0){
					r = 255; g = 0; b = 0;
				}
				else{
					r = 0; g = 0; b = 255;
				}
				var ji = (j + i * newIplImage.width) * CHANNELS;
				newIplImage.RGBA[ji] = r;
				newIplImage.RGBA[1 + ji] = g;
				newIplImage.RGBA[2 + ji] = b;
			}
		}
		
		cvShowImage(imgId, newIplImage);
	}
	catch(ex){
		alert("Perceptron : " + ex);
	}
}

function Soft_Amaro(imgId, iplImage){
	try{
		//ソフトフォーカス
		var newIplImage = cvCloneImage(iplImage);
		var bg = cvCloneImage(iplImage);

		cvSmooth(bg, bg, CV_SMOOTH_TYPE.GAUSSIAN, 7);
		cvBlendImage(bg, newIplImage, newIplImage, CV_BLEND_MODE.SCREEN);
		
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
		alert("Soft_Amaro : " + ex);
	}
}

function EqualizeHist(imgId, iplImage){
	try{
		var newIplImage = cvCloneImage(iplImage);
		cvCvtColor(iplImage, newIplImage, CV_CODE.RGB2HSV);
		cvEqualizeHist(newIplImage, newIplImage, 2);
		cvCvtColor(newIplImage, newIplImage, CV_CODE.HSV2RGB);
		cvShowImage(imgId, newIplImage);
	}
	catch(ex){
		alert("EqualizeHist : " + ex);
	}
}

function Comic(imgId, iplImage){
	try{
		var newIplImage = cvCreateImage(iplImage.width, iplImage.height);
		cvCvtColor(iplImage, newIplImage, CV_CODE.RGB2GRAY);
		
		var cannyImage = cvCreateImage(newIplImage.width, newIplImage.height);
		cvCanny(newIplImage, cannyImage, 20, 100);
		
		var UNDER = 20;
		var OVER = 200;
		
		for(var i = 0 ; i < newIplImage.height; i++){
			for(var j = 0 ; j < newIplImage.width; j++){
				var ji = (j + i * newIplImage.width) * CHANNELS;
				if(newIplImage.RGBA[ji] < UNDER){
					newIplImage.RGBA[ji] = 0;
					newIplImage.RGBA[1 + ji] = 0;
					newIplImage.RGBA[2 + ji] = 0;
				}
				else if(newIplImage.RGBA[ji] > OVER){
					newIplImage.RGBA[ji] = 255;
					newIplImage.RGBA[1 + ji] = 255;
					newIplImage.RGBA[2 + ji] = 255;
				}
				else{
					newIplImage.RGBA[ji] = cannyImage.RGBA[ji];
					newIplImage.RGBA[1 + ji] = cannyImage.RGBA[ji];
					newIplImage.RGBA[2 + ji] = cannyImage.RGBA[ji];
				}
			}
		}
		
		cvShowImage(imgId, newIplImage);
	}
	catch(ex){
		alert("Comic : " + ex);
	}
}

function HDR_Xpro(imgId, iplImage){
	try{
		//--------------------HDR処理-------------------------
		//白黒濃淡画像にする
		var gray = cvCloneImage(iplImage);
		cvCvtColor(gray, gray, CV_CODE.RGB2GRAY);
	
		//大きさを半分にする
		var miniGray = cvCreateImage(gray.width/2, gray.height/2);	
		cvResize(gray, miniGray, CV_INTER.CUBIC);
				
		//反転させる 
		for(var i = 0 ; i < miniGray.height ; i++){
			for(var j = 0 ; j < miniGray.width ; j++){
				var v = 255 - miniGray.RGBA[(j + i * miniGray.width) * CHANNELS];
				miniGray.RGBA[(j + i * miniGray.width) * CHANNELS] = v;
				miniGray.RGBA[1 + (j + i * miniGray.width) * CHANNELS] = v;
				miniGray.RGBA[2 + (j + i * miniGray.width) * CHANNELS] = v;
			}
		}
		
		//スムージング
		for(var i = 0 ; i < 3; i++)
			cvSmooth(miniGray, miniGray, CV_SMOOTH_TYPE.GAUSSIAN, 7);
		
		//大きさを元に戻す
		cvResize(miniGray, gray, CV_INTER.CUBIC);
		
		//原画像をコピー
		var newIplImage = cvCloneImage(iplImage);

		//オーバレイを３回かける
		var blendMode = CV_BLEND_MODE.OVER_LAY;
		for(var i = 0 ; i < 3 ; i++)
			cvBlendImage(newIplImage, gray, newIplImage, blendMode);
		//-----------------------------------------------------------
		
		//-----------------------クロスプロセス---------------------------
		var X_PRO_GREEN_TONE_CURVE_UNDER_X = 50;
		var X_PRO_GREEN_TONE_CURVE_UNDER_Y = 0;
		var X_PRO_GREEN_TONE_CURVE_OVER_X = 200;
		var X_PRO_GREEN_TONE_CURVE_OVER_Y = 255;
		var X_PRO_RED_TONE_CURVE_UNDER_X = 50;
		var X_PRO_RED_TONE_CURVE_UNDER_Y = 0;
		var X_PRO_RED_TONE_CURVE_OVER_X = 200;
		var X_PRO_RED_TONE_CURVE_OVER_Y = 255;

		cvToneCurve(newIplImage, newIplImage,
			X_PRO_RED_TONE_CURVE_UNDER_X, X_PRO_RED_TONE_CURVE_UNDER_Y,
			X_PRO_RED_TONE_CURVE_OVER_X, X_PRO_RED_TONE_CURVE_OVER_Y, 0);

		cvToneCurve(newIplImage, newIplImage,
			X_PRO_GREEN_TONE_CURVE_UNDER_X, X_PRO_GREEN_TONE_CURVE_UNDER_Y,
			X_PRO_GREEN_TONE_CURVE_OVER_X, X_PRO_GREEN_TONE_CURVE_OVER_Y, 1);
		//---------------------------------------------------------------
		
		//表示
		cvShowImage(imgId, newIplImage);
	}
	catch(ex){
		alert("HDR_Xpro : " + ex);
	}
}

function Reflection(imgId, iplImage){
	try{
		//新しい画像領域 縦幅を読み込んだ画像の1.3倍にする
		var newIplImage = cvCreateImage(iplImage.width, iplImage.height * 1.3);
		var s = newIplImage.height - iplImage.height; //差分
		var ys = 0.5; //y切片
		var a = -ys/s; //傾き
		
		for(var i = 0 ; i < newIplImage.height ; i++){
			for(var j = 0 ; j < newIplImage.width ; j++){
				for(var c = 0 ; c < 3 ; c++){
					//そのままの座標の画素を取得
					if(i < iplImage.height ){
						newIplImage.RGBA[c + (j + i * newIplImage.width) * CHANNELS] =
							iplImage.RGBA[c + (j + i * newIplImage.width) * CHANNELS];
					}
					//反転した座標の画素を取得
					else{
						var y = (i - iplImage.height); 
						var nv = (a * y + ys) * iplImage.RGBA[c + (j + (iplImage.height - 1 - y) * newIplImage.width) * CHANNELS];
						newIplImage.RGBA[c + (j + i * newIplImage.width) * CHANNELS] = nv;
							
					}
				}
			}
		}

		//imgIdで指定したimgタグに画像を転送
		cvShowImage(imgId, newIplImage);
	}
	catch(ex){
		alert("Test : " + ex);
	}
}

function HDR(imgId, iplImage){

	//白黒濃淡画像にする
		var gray = cvCloneImage(iplImage);
		cvCvtColor(gray, gray, CV_CODE.RGB2GRAY);
	
		//大きさを半分にする
		var miniGray = cvCreateImage(gray.width/2, gray.height/2);	
		cvResize(gray, miniGray, CV_INTER.CUBIC);
				
		//反転させる 
		for(var i = 0 ; i < miniGray.height ; i++){
			for(var j = 0 ; j < miniGray.width ; j++){
				var v = 255 - miniGray.RGBA[(j + i * miniGray.width) * CHANNELS];
				miniGray.RGBA[(j + i * miniGray.width) * CHANNELS] = v;
				miniGray.RGBA[1 + (j + i * miniGray.width) * CHANNELS] = v;
				miniGray.RGBA[2 + (j + i * miniGray.width) * CHANNELS] = v;
			}
		}
		
		//スムージング
		for(var i = 0 ; i < 3; i++)
			cvSmooth(miniGray, miniGray, CV_SMOOTH_TYPE.GAUSSIAN, 7);
		
		//大きさを元に戻す
		cvResize(miniGray, gray, CV_INTER.CUBIC);
	
		var newIplImage = cvCloneImage(iplImage);
		//オーバレイを３回かける
		var blendMode = CV_BLEND_MODE.OVER_LAY;
		for(var i = 0 ; i < 3 ; i++)
			cvBlendImage(newIplImage, gray, newIplImage, blendMode);
/*
	var sobelXImage = cvCreateImage(miniGray.width, miniGray.height);
	var sobelYImage = cvCreateImage(miniGray.width, miniGray.height);
	
	cvSobel(miniGray, sobelXImage, 1, 0);
	cvSobel(miniGray, sobelYImage, 0, 1);
	
	cvAdd(sobelXImage, sobelYImage, sobelXImage);
	
	cvConvertScaleAbs(sobelXImage, sobelXImage);
	
	for(var i = 0 ; i < sobelXImage.height ; i++){
		for(var j = 0 ; j < sobelXImage.width ; j++){
			var v = 255 - sobelXImage.RGBA[(j + i * sobelXImage.width) * CHANNELS] ;
			sobelXImage.RGBA[(j + i * sobelXImage.width) * CHANNELS] = v;
			sobelXImage.RGBA[1 + (j + i * sobelXImage.width) * CHANNELS] = v;
			sobelXImage.RGBA[2 + (j + i * sobelXImage.width) * CHANNELS] = v;
		}
	}
	
	cvSmooth(sobelXImage, sobelXImage, CV_SMOOTH_TYPE.GAUSSIAN, 7);
	
	cvResize(sobelXImage, img2);
*/	
//	cvBlendImage(newIplImage, img2, newIplImage, CV_BLEND_MODE.MUL);

	cvShowImage(imgId, newIplImage);	
}

function Labeling(imgId, iplImage){
	try{
		var iplImage1 = cvCloneImage(iplImage);
		cvCvtColor(iplImage1, iplImage1, CV_CODE.RGB2GRAY);
		
		cvThreshold(iplImage1, iplImage1, 100, 255, CV_THRESHOLD_TYPE.THRESH_BINARY_INV);

		var iplImage2 = cvLabeling(iplImage1);
		
		min_val = new Array(4);
		max_val = new Array(4);
		min_locs = new Array(4);
		max_locs = new Array(4);
		for(var i = 0 ; i < 4 ; i++){
			min_locs[i] = new CvPoint();
			max_locs[i] = new CvPoint();
		}

		cvMinMaxLoc(iplImage2, min_val, max_val, min_locs, max_locs);
		var maxV = max_val[0];
		
		for(i = 0 ; i < iplImage2.height ; i++){
			for(j = 0 ; j < iplImage2.width ; j++){
				var v = iplImage2.RGBA[(j + i * iplImage1.width) * CHANNELS] ;
				iplImage1.RGBA[(j + i * iplImage2.width) * CHANNELS] = 255 * v / maxV;
				iplImage1.RGBA[1 + (j + i * iplImage2.width) * CHANNELS] = 255;
				iplImage1.RGBA[2 + (j + i * iplImage2.width) * CHANNELS] = (v == 0) ? 0 : 255;
				iplImage1.RGBA[3 + (j + i * iplImage2.width) * CHANNELS] = 255;
			}
		}
		
		cvCvtColor(iplImage1, iplImage1, CV_CODE.HSV2RGB);

		cvShowImage(imgId, iplImage1);
	}
	catch(ex){
		alert("Labeling : " + ex);
	}
}

function Resizes(imgIds, iplImages, ratio){
	try{
		for(var i = 0 ; i < imgIds.length ; i++){
			var imgId = imgIds[i];
			var newIplImage = cvCreateImage(iplImages[i].width * ratio, iplImages[i].height * ratio);
			cvResize(iplImages[i], newIplImage, CV_INTER.CUBIC);
			cvShowImage(imgId, newIplImage);
		}
	}
	catch(ex){
		alert("Reisze : " + ex);
	}
}


function Xpro(imgId, iplImage){
	try{
		var newIplImage = cvCloneImage(iplImage);

		var X_PRO_GREEN_TONE_CURVE_UNDER_X = 50;
		var X_PRO_GREEN_TONE_CURVE_UNDER_Y = 0;
		var X_PRO_GREEN_TONE_CURVE_OVER_X = 200;
		var X_PRO_GREEN_TONE_CURVE_OVER_Y = 255;
		var X_PRO_RED_TONE_CURVE_UNDER_X = 50;
		var X_PRO_RED_TONE_CURVE_UNDER_Y = 0;
		var X_PRO_RED_TONE_CURVE_OVER_X = 200;
		var X_PRO_RED_TONE_CURVE_OVER_Y = 255;

		cvToneCurve(newIplImage, newIplImage,
			X_PRO_RED_TONE_CURVE_UNDER_X, X_PRO_RED_TONE_CURVE_UNDER_Y,
			X_PRO_RED_TONE_CURVE_OVER_X, X_PRO_RED_TONE_CURVE_OVER_Y, 0);

		cvToneCurve(newIplImage, newIplImage,
			X_PRO_GREEN_TONE_CURVE_UNDER_X, X_PRO_GREEN_TONE_CURVE_UNDER_Y,
			X_PRO_GREEN_TONE_CURVE_OVER_X, X_PRO_GREEN_TONE_CURVE_OVER_Y, 1);

		cvShowImage(imgId, newIplImage);
	}
	catch(ex){
		alert("xpro : " + ex);
	}
}

function Rainbow(imgId, iplImage){
	try{
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
		var bg = cvCloneImage(iplImage);
		
		cvSmooth(bg, bg, CV_SMOOTH_TYPE.GAUSSIAN, 7);
		cvBlendImage(bg, newIplImage, newIplImage, CV_BLEND_MODE.SCREEN);
			
		cvBlendImage(newIplImage, layer1, newIplImage, CV_BLEND_MODE.SOFT_LIGHT);
	
		cvShowImage(imgId, newIplImage);
	}
	catch(ex){
		alert("Rainbow : " + ex);
	}
}

function Gradetion(imgId, iplImage){
	try{
		var newIplImage = cvCloneImage(iplImage);
		var filter = cvCreateImage(iplImage.width, iplImage.height);

		for(i = 0 ; i < filter.height ; i++){
			for(j = 0 ; j < filter.width ; j++){
				filter.RGBA[(j + i * filter.width) * CHANNELS] = j*210/filter.width + 45;
				filter.RGBA[1 + (j + i * filter.width) * CHANNELS] = j*110/filter.width + 10;
				filter.RGBA[2 + (j + i * filter.width) * CHANNELS] = 90 - j*90/filter.width;
				filter.RGBA[3 + (j + i * filter.width) * CHANNELS] = 255;
			}
		}
		
		cvBlendImage(newIplImage, filter, newIplImage, CV_BLEND_MODE.SCREEN);
		
		cvShowImage(imgId, newIplImage);
	}
	catch(ex){
		alert("Gradetion : " + ex);
	}
}

function SoftFocus(imgId, iplImage){
	try{	
		
		var newIplImage = cvCloneImage(iplImage);
		var bg = cvCloneImage(iplImage);

		cvSmooth(bg, bg, CV_SMOOTH_TYPE.GAUSSIAN, 7);
		cvBlendImage(bg, newIplImage, newIplImage, CV_BLEND_MODE.SCREEN);
		
		cvShowImage(imgId, newIplImage);
	}
	catch(ex){
		alert("SoftFocus : " + ex);
	}
}

function Kamisama(imgId, iplImage){
	try{
		var newIplImage = cvCloneImage(iplImage);
		cvCvtColor(newIplImage, newIplImage, CV_CODE.RGB2GRAY);
		
		var pt1 = new CvPoint();
		pt1.x = Math.floor(newIplImage.width * Math.random());
		pt1.y = Math.floor(newIplImage.height * Math.random());
		var pt2 = new CvPoint();
		pt2.x = Math.floor(newIplImage.width * Math.random());
		pt2.y = Math.floor(newIplImage.height * Math.random());

		if(pt1.x == pt2.x){
		}
		else{
			var katamuki = (pt1.y - pt2.y)/(pt1.x - pt2.x);
			
			for(i = 0 ; i < newIplImage.height ; i++){
				for(j = 0 ; j < newIplImage.width ; j++){
					if(i > katamuki * (j - pt1.x) + pt1.y){
						newIplImage.RGBA[1 + (j + i * newIplImage.width) * CHANNELS] = 0;
						newIplImage.RGBA[2 + (j + i * newIplImage.width) * CHANNELS] = 0;
					}
					else{
						newIplImage.RGBA[(j + i * newIplImage.width) * CHANNELS] = 0;
						newIplImage.RGBA[1 + (j + i * newIplImage.width) * CHANNELS] = 0;
					}
				}
			}
		}

		var color = new Scalar();
		color.r = color.g = color.b = 255;

		cvLine(newIplImage, pt1, pt2, color, 11, false);

		cvShowImage(imgId, newIplImage);
	}
	catch(ex){
		alert("Kamisama : " + ex);
	}	
}


function iPod(imgId, iplImage){
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
		alert("iPod : " + ex);
	}	
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
	for(var i = 0 ; i < 10 ; i ++)
		cvSmooth(newIplImage, newIplImage, CV_SMOOTH_TYPE.BILATERAL);
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
		cvCanny(cannyImage, cannyImage, 50, 80);
		cvShowImage(imgId, cannyImage);
	}
	catch(ex){
		alert("Canny : " + ex);
	}	
}





function Vivid(imgId, iplImage){
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
		alert("Vivid : " + ex);
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

function LightFall(imgId, iplImage){
	try{
		//光源の中心の強さ
		var power = 255;
		//減光率の分子
		var bunshi = 80;
		//減光率の分母
		var bunbo = 100;
		//光源の大きさを決める倍率
		var bairitsu = 0.4;
		
		//光源の大きさを求める
		var lightWidth = iplImage.width * bairitsu;
		var lightHeight = iplImage.height * bairitsu;
		
		//光源画像の生成
		var lightImage = MakeLightImage(iplImage.width, iplImage.height, power, bunshi, bunbo, lightWidth, lightHeight);
		//画像の複製
		var newIplImage = cvCloneImage(iplImage);
		//画素同士を掛けて合成
		cvBlendImage(iplImage, lightImage, newIplImage, CV_BLEND_MODE.MUL);
		//画像を表示
		cvShowImage(imgId, newIplImage);
	}
	catch(ex){
		alert("LightFall : " + ex);
	}
}


function MakeLightImage(width, height, power, bunbo, bunshi, radiusX, radiusY){
	var iplImage = cvCreateImage(width, height);
	try{			
		for(var i = 0 ; i < height ; i++){
			//画像の中心を原点とする処理
			var y = i - height / 2;
			for(var j = 0 ; j < width ; j++){
				//画像の中心を原点とする処理
				var x = j - width / 2;
				//基本の光の強さ
				var v = power;
				//画像の中心からの距離
				var dis2 = (y * y) / (radiusY * radiusY) + (x * x) / (radiusX * radiusX);
				//距離が1より大きければ光の強さと距離の関係から明るさを求める(1以下は光の強さがそのまま明るさとなる)
				if(dis2 > 1) v /= Math.pow(dis2, bunshi / bunbo) ;
				//RGBに代入する
				iplImage.RGBA[(j + i * width) * CHANNELS] = v;
				iplImage.RGBA[1 + (j + i * width) * CHANNELS] = v;
				iplImage.RGBA[2+ (j + i * width) * CHANNELS] = v;
				iplImage.RGBA[3 + (j + i * width) * CHANNELS] = 255;
			}
		}
	}
	catch(ex){
		alert("MakeLightImage : " + ex);
	}
	
	return iplImage;
}
