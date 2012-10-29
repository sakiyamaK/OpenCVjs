//データ型
var IplImage = function(){
	width: 0;
	height: 0;
	canvas: null;
	imageData: null;
	RGBA: null;
}

var CvHistogram = function(){
	type: 0;
	bins: null;
	thres: null;
	thres2: null;
	mat: null;
	ranges: null;
}

var Scalar = function(){
	this.val = new Array(0, 0, 0, 255);
}

var Point = function(){
	x: 0;
	y: 0;
}

var Size = function(){
	width: 0;
	height: 0;
}

//定数
//ヒストグラムの種類
var CV_HIST = {
	ARRAY: 0,
	SPARSE: 1
}

//表色系変換の種類
var CV_CODE = {
	RGB2GRAY: 0,
	RGB2HSV: 1,
	HSV2RGB: 2,
	RGB2HLS: 3,
	HLS2RGB: 4
}

//ブレンドの種類
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

//スムージングの種類
var CV_SMOOTH_TYPE = {
	BLUR_NO_SCALE: 0,
	BLUR: 1,
	GAUSSIAN: 2,
	MEDIAN: 3,
	BILATERAL: 4
}

//閾値処理の種類
var CV_THRESHOLD_TYPE = {
	THRESH_BINARY: 0,
	THRESH_BINARY_INV: 1,
	THRESH_TRUNC: 2,
	THRESH_TOZERO: 3,
	THRESH_TOZERO_INV: 4, 
	THRESH_OTSU: 5
}

//モルフォロジー変換の種類
var CV_MOP = {
	OPEN : 0,
	CLOSE : 1,
	GRADIENT : 2,
	TOPHAT : 3,
	BLACKHAT : 4
}

//DFTの種類
var CV_DXT = {
	FORWARD: 0, //順変換 スケーリングなし
	INVERSE: 1, //逆変換 スケーリングなし
	FORWARD_SCALE: 2, //順変換 スケーリングあり
	INVERSE_SCALE: 3, //逆変換 スケーリングあり
}


//四則演算の種類
var FOUR_ARITHMETIC = {
	ADD : 0,
	SUB : 1,
	MULT : 2,
	DIV : 3
}

//チャンネル数
var CHANNELS = 4;

//エラー文
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

//widthとheightを2のべき乗にする
//入力
//src IplImage型 原画像
//出力
//IplImage型 2のべき乗になった画像 値は鏡面置換
function cvPowerOfTwo(src){
	var dst = null;
	try{
		if(cvUndefinedOrNull(src)) throw "src" + ERROR.IS_UNDEFINED_OR_NULL;

		var newW = src.width;
		var newH = src.height;
		//横方向
		if ((src.width & (src.width - 1)) != 0){
			var newW = 1;
			while (newW < src.width) newW *= 2;
		}
		//縦方向
		if ((src.height & (src.height - 1)) != 0){
			newH = 1;
			while (newH < src.height) newH *= 2;
		}
		
		dst = cvCreateImage(newW, newH);

		for(c = 0 ; c < CHANNELS; c++){
			for(i = 0 ; i < dst.height ; i++){
				var vi = i;
				if(vi > src.height - 1) vi = src.height - 2 - i % src.height;
				for(j = 0 ; j < dst.width ; j++){					
					var vj = j;
					if(vj > src.width - 1) vj = src.width - 2 - j % src.width;
					dst.RGBA[c + (j + i * dst.width) * CHANNELS] = 
						src.RGBA[c + (vj + vi * src.width) * CHANNELS];
				}
			}
		}
	}
	catch(ex){
		alert("cvPowerOfTwo : " + ex);
	}
	
	return dst;
}

//画像をクロッピング
//入力
//src IplImage型 原画像
//xs 整数 クロッピングする左上x座標
//ys 整数 クロッピングする左上y座標
//width 整数 クロッピングする画像の横幅
//height 整数 クロッピングする画像の縦幅
//出力
//IplImage型 クロッピングされた画像
function cvCloping(src, xs, ys, width, height){
	var dst = null;
	try{
		if(cvUndefinedOrNull(src) || 
			cvUndefinedOrNull(xs) || cvUndefinedOrNull(ys) ||
			cvUndefinedOrNull(width) || cvUndefinedOrNull(height))
				throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
		if(xs + width > src.width || ys + height > src.height)
			throw "xs + width < src.width and ys + height < src.heightにしてください";
			
		dst = cvCreateImage(width, height);
		for(i = 0 ; i < dst.height ; i++){
			for(j = 0 ; j < dst.width ; j++){
				for(c = 0 ; c < CHANNELS ; c++){
					dst.RGBA[c + (j + i * dst.width) * CHANNELS] = 
							src.RGBA[c + (j + xs + (i + ys) * src.width) * CHANNELS];
				}
			}
		}
	}
	catch(ex){
		alert("cvCloping : " + ex);
	}
	
	return dst;
}

//FFT or inverse FFT を行う
//入力
//src IplImage型 GRAY表色系を想定(RGB表色系ならRがFFTされる) ※解説参照
//isForward true/false trueなら順変換 falseなら逆変換
//出力
//解説
//srcのwidthとheight共に2のべき乗である必要がある
//計算結果は実数値が最初のチャンネル、虚数値がふたつめのチャンネルに代入される 
function cvFFT(src, isForward){
	try{
		if(cvUndefinedOrNull(src)) throw "src" + ERROR.IS_UNDEFINED_OR_NULL;
		if(cvUndefinedOrNull(isForward)) isForward = true;
		if((src.width & (src.width - 1)) != 0 ||
			(src.height & (src.height - 1)) != 0) throw "srcのwidthとheightは2のべき乗にしてください";

		//1次元変換
		function oneLineFFT(ar, ai, isForward){
			var j, j1, j2;
			var dr1, dr2, di1, di2, tr, ti;
			
			var iter = 0;
			j = ar.length;
			while((j /= 2) != 0) iter++;
			
			j = 1;
			for(i = 0; i < iter; i++) j *= 2;

			var w = (isForward ? Math.PI: -Math.PI) / ar.length;
			var xp2 = ar.length;
			for(it = 0; it < iter; it++)
			{
				xp = xp2;
				xp2 = Math.floor(xp2/2);
				w *= 2;
				console.log(xp2);
				for(k = 0, i = - xp; k < xp2; i++)
				{
					var arg = w * k;
					k++;
					var wr = Math.cos(arg);
					var wi = Math.sin(arg);
					for(j = xp; j <= ar.length; j += xp)
					{
						j1 = j + i;
						j2 = j1 + xp2;
						dr1 = ar[j1];
						dr2 = ar[j2];
						di1 = ai[j1];
						di2 = ai[j2];
						tr = dr1 - dr2;
						ti = di1 - di2;
						ar[j1] = dr1 + dr2;
						ai[j1] = di1 + di2;
						ar[j2] = tr * wr - ti * wi;
						ai[j2] = ti * wr + tr * wi;
					}
				}
			}
			j = j1 = ar.length / 2;
			j2 = ar.length - 1;
			for(i = 1; i < j2; i++)
			{
				if(i < j)
				{
					w = ar[i];
					ar[i] = ar[j];
					ar[j] = w;
					w = ai[i];
					ai[i] = ai[j];
					ai[j] = w; 
				}
				k = j1;
				while(k <= j)
				{
					j -= k;
					k /= 2;
				}
				j += k;
			}
			if(!isForward) return;
			w = 1. / ar.length;
			for(i = 0; i < ar.length; i++)
			{
				ar[i] *= w;
				ai[i] *= w;
			}
			return;
		}
		
		//横方向
		var ar = new Array(src.width);
		var ai = new Array(src.width);
		for(i = 0 ; i < src.height ; i++){
			for(j = 0 ; j < src.width ; j++){
				ar[j] = src.RGBA[(j + i * src.width) * CHANNELS];
				ai[j] = src.RGBA[1 + (j + i * src.width) * CHANNELS];
			}
			oneLineFFT(ar, ai, isForward);
			for(j = 0 ; j < src.width ; j++){
				src.RGBA[(j + i * src.width) * CHANNELS] = ar[j] ;
				src.RGBA[1 + (j + i * src.width) * CHANNELS] = ai[j] ;
			}
		}
		
		//縦方向
		ar = new Array(src.height);
		ai = new Array(src.height);
		for(j = 0 ; j < src.width ; j++){
			for(i = 0 ; i < src.height ; i++){
				ar[i] = src.RGBA[(j + i * src.width) * CHANNELS];
				ai[i] = src.RGBA[1 + (j + i * src.width) * CHANNELS];
			}
			oneLineFFT(ar, ai, isForward);
			for(i = 0 ; i < src.height ; i++){
				src.RGBA[(j + i * src.width) * CHANNELS] = ar[j] ;
				src.RGBA[1 + (j + i * src.width) * CHANNELS] = ai[j] ;
			}
		}
	}
	catch(ex){
		alert("cvFFT : " + ex);
	}
}
//DFT
//入力
//src IplImage型 dftする画像 GRAY表色系を想定（RGB表色系ならRの数値だけで処理する）
//dst IplImage型 dftした結果が保存される RGB表色系ならRに実数 Gに虚数が代入される
//flags
//nonzero_rows
function cvDFT(src, dst, flags, nonzero_rows){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst) || cvUndefinedOrNull(flags))
			throw "sizes or dst or flags" + ERROR.IS_UNDEFINED_OR_NULL;
		if(cvUndefinedOrNull(nonzero_rows)) nonzero_rows = 0;
		
		var arg = (CV_DXT.FORWARD || CV_DXT.FORWARD_SCALE) ? 
			-2 * Math.PI / src.width : 2 * Math.PI / src.width;
		
		cvZero(dst);
		
		//横方向
		for(y = 0 ; y < dst.height ; y++){
			console.log(y);
			for(x = 0 ; x < dst.width ; x++){
				for(i = 0; i < src.height ; i++){
					for(j = 0 ; j < src.width ; j++){
						var freq = arg * x * j ;
						var cos = Math.cos(freq);
						var sin = Math.sin(freq);
						dst.RGBA[(x + y * dst.width) * CHANNELS] += 
							src.RGBA[(j + i * src.width) * CHANNELS] *  cos +
							src.RGBA[1 + (j + i * src.width) * CHANNELS] * sin;
							
						dst.RGBA[1 + (x + y * dst.width) * CHANNELS] += 
							src.RGBA[1 + (j + i * src.width) * CHANNELS] * cos -
							src.RGBA[(j + i * src.width) * CHANNELS] * sin;
					}
				}
			}
		}
		
		console.log("横終了");
		
		//縦方向
		for(y = 0 ; y < dst.height ; y++){
			for(x = 0 ; x < dst.width ; x++){
				for(j = 0 ; j < src.width ; j++){
					for(i = 0; i < src.height ; i++){				
						var freq = arg * y * i ;
						var cos = Math.cos(freq);
						var sin = Math.sin(freq);
						dst.RGBA[(x + y * dst.width) * CHANNELS] += 
							src.RGBA[(j + i * src.width) * CHANNELS] *  cos +
							src.RGBA[1 + (j + i * src.width) * CHANNELS] * sin;
							
						dst.RGBA[1 + (x + y * dst.width) * CHANNELS] += 
							src.RGBA[1 + (j + i * src.width) * CHANNELS] * cos -
							src.RGBA[(j + i * src.width) * CHANNELS] * sin;

					}
				}
			}
		}
		
		if(CV_DXT.FORWARD_SCALE || INVERSE_SCALE){
			var scale = Math.sqrt(1.0 / (dst.width * dst.height));
			for(i = 0 ; i < dst.height ; i++){
				for(j = 0 ; j < dst.width ; j++){
					dst.RGBA[(j + i * dst.width) * CHANNELS] /= scale;
					dst.RGBA[1 + (j + i * dst.width) * CHANNELS] /= scale;
				}
			}
		}
	}
	catch(ex){
		alert("cvDFT : " + ex);
	}
}

//CvHistogram型のインスタンスを返す
//入力
//dims 整数　ヒストグラムの次元数を表す
//sizes 整数の配列　要素数=dimsでなければならない　ヒストグラムのビン数
//type ヒストグラムの種類　CV_HISTの値のどちらかを代入
//ranges 整数の２次元配列 ヒストグラムとしてカウントする値域 [[0, 256]]とすれば0~255の画素値をカウントする
//uniform 整数 一様性に関するフラグ．非0の場合，ヒストグラムは等間隔のビンを持つ  省略可
//出力
//CvHistogramのインスタンス
//説明
//ヒストグラムのビン幅はsizesとrangesで決まる
function cvCreateHist(dims, sizes, type, ranges, uniform){
	var hist = new CvHistogram();
	try{
		if(cvUndefinedOrNull(sizes.length) || cvUndefinedOrNull(ranges.length))
			throw "sizes or ranges" + ERROR.IS_UNDEFINED_OR_NULL;
		if(dims != sizes.length)
			throw "dims と sizes" + ERROR.DIFFERENT_LENGTH;
		if(cvUndefinedOrNull(uniform)) uniform = 1;
		if(type != CV_HIST.ARRAY) throw "type は現在CV_HIST.ARRAYしかサポートされていません";
		if(dims != 1) throw "dims は現在1しかサポートされていません";
		if(uniform == 0) throw "uniform は現在0はサポートされていません";
		
		switch(type){
		case CV_HIST.ARRAY:
			hist.ranges = ranges;
			hist.type = type;
			hist.bins = new Array(new Array(sizes[0]));
			for(i = 0 ; i < hist.bins[0].length ; hist.bins[0][i++] = 0);
			hist.thres = null;
			hist.thres2 = null;
			hist.mat = null;
		break;
		case CV_HIST.SPARSE:
		break;
		default:
			throw "type " + ERROR.SWITCH_VALUE;
		break;
		}
	}
	catch(ex){
		alert("cvCreateHist : " + ex);
	}
	
	return hist;
}

//ヒストグラムを計算する
//入力
//src IplImage型 ヒストグラムを調べる対象
//hist CvHistogram型 結果が代入される
//accumulate 整数 計算フラグで0でないならヒストグラムの値が追加されていく 0でビンが0になる
//mask IplImage型 0か255のマスク画像 省略可
//出力
//なし 第２引数のhistに結果が代入される 
function cvCalcHist(src, hist, accumulate, mask){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(hist))
			throw "src or hist" + ERROR.IS_UNDEFINED_OR_NULL;
		if(cvUndefinedOrNull(accumulate)) accumulate = 0;
		if(cvUndefinedOrNull(mask)) mask = 0;
		if(mask != 0) throw "mask は現在サポートされていません";

		for(k = 0 ; k < hist.ranges.length ; k++){
			if(accumulate == 0){
				for(i = 0; i < hist.bins[k].length; i++) hist.bins[k][i] = 0;
			}
			
			var binWidth = (hist.ranges[k][1] - hist.ranges[k][0])/hist.bins[k].length;
			for(i = 0 ; i < src.height ; i++){
				for(j = 0 ; j < src.width ; j++){
					var v = src.RGBA[(j + i * src.width) * CHANNELS + k] ;
					if(hist.ranges[k][0] <= v && hist.ranges[k][1] > v){
						v = Math.floor((v - hist.ranges[k][0])/binWidth);
						if(v < hist.bins[k].length) hist.bins[k][v]++;
					}
				}
			}
		}
	}
	catch(ex){
		alert("cvCalcHist : " + ex);
	}
}

//最大値と最小値とその座標を求める
//入力
//src IplImage型 計算対象となる画像
//min_val 数値型の配列 要素数4 RGB表色系ならばr,g,b,aの最小値が入る 
//max_val 数値型の配列 要素数4 RGB表色系ならばr,g,b,aの最大値が入る 
//min_locs Point型の配列 要素数4 RGB表色系ならばr,g,b,aの最小値のピクセルの座標が入る
//max_locs Point型の配列 要素数4 RGB表色系ならばr,g,b,aの最大値のピクセルの座標が入る
//mask IplImage型 0か255のマスク画像 省略可
//出力
//なし
function cvMinMaxLoc(src, min_val, max_val, min_locs, max_locs, mask){
	
	try{
		if(cvUndefinedOrNull(src) || 
			cvUndefinedOrNull(min_val) || cvUndefinedOrNull(max_val) ||
			cvUndefinedOrNull(min_locs) || cvUndefinedOrNull(max_locs))
				throw "src or min_val or max_val or min_locs or max_locs " + ERROR.IS_UNDEFINED_OR_NULL;
		for(i = 0 ; i < min_locs.length ; i++)
			if(cvUndefinedOrNull(min_locs[i])) throw "min_locs[" + i + "]" + ERROR.IS_UNDEFINED_OR_NULL;
		for(i = 0 ; i < max_locs.length ; i++)
			if(cvUndefinedOrNull(max_locs[i])) throw "max_locs[" + i + "]" + ERROR.IS_UNDEFINED_OR_NULL;
			
		if(cvUndefinedOrNull(mask)) mask = 0;
		if(mask != 0) throw "mask は現在サポートされていません";
		
		for(c = 0 ; c < CHANNELS ; c++){
			min_val[c] = src.RGBA[c];
			max_val[c] = src.RGBA[c];
			min_locs[c].x = 0 ;
			min_locs[c].y = 0;
			max_locs[c].x = 0 ;
			max_locs[c].y = 0;
			for(i = 0 ; i < src.height ; i++){
				for(j = 0 ; j < src.width ; j++){
					if(src.RGBA[c + (j + i * src.width) * CHANNELS] < min_val[c]){
						min_val[c] = src.RGBA[c + (j + i * src.width) * CHANNELS];
						min_locs[c].x = j;
						min_locs[c].y = i;
					}
					if(src.RGBA[c + (j + i * src.width) * CHANNELS] > max_val[c]){
						max_val[c] = src.RGBA[c + (j + i * src.width) * CHANNELS];
						max_locs[c].x = j;
						max_locs[c].y = i;
					}
				}
			}
		}
	}
	catch(ex){
		alert("cvMinMaxLoc : " + ex);
	}
}

//画像のゼロでない画素数を数える
//入力
//src IplImage型 計算対象となる画像
//出力
//Scalar型 RGB表色系ならr,g,b,aの結果が代入されている
function cvCountNonZero(src){
	var rtn = null;	
	try{
		if(cvUndefinedOrNull(src)) throw "src" + ERROR.IS_UNDEFINED_OR_NULL;
		
		rtn = new Scalar();
		for(k = 0 ; k < rtn.length ; rtn.val[k++] = 0);
		
		for(i = 0 ; i < src.height ; i++){
			for(j = 0 ; j < src.width ; j++){
				for(c = 0 ; c < CHANNELS ; c++){
					if(src.RGBA[c + (j + i * src.width) * CHANNELS] != 0)
						rtn.val[c]++;
				}
			}
		}
	}
	catch(ex){
		alert("cvCountNonZero : " + ex);
	}
	
	return rtn;
}

//画像の画素の合計値
//入力
//src IplImage型 計算対象となる画像
//出力
//Scalar型 RGB表色系ならr,g,b,aの結果が代入されている
function cvSum(src){
	var rtn = null;
	try{
		if(cvUndefinedOrNull(src)) throw "src" + ERROR.IS_UNDEFINED_OR_NULL;
		
		rtn = new Scalar();
		
		for(k = 0 ; k < rtn.length ; rtn[k++] = 0);
		
		for(i = 0 ; i < src.height ; i++){
			for(j = 0 ; j < src.width ; j++){
				for(c = 0 ; c < CHANNELS ; c++)
					rtn[c] = src.RGBA[c + (j + i * src.width) * CHANNELS];
			}
		}
	}
	catch(ex){
		alert("cvSum : " + ex);
	}
	
	return rtn;
}

//画像の画素の平均値
//入力
//src IplImage型 計算対象となる画像
//mask IplImage型 0か255のマスク画像 省略可
//出力
//Scalar型 RGB表色系ならr,g,b,aの結果が代入されている
function cvAvg(src, mask){
	var rtn = null;
	try{
		if(cvUndefinedOrNull(src)) throw "src" + ERROR.IS_UNDEFINED_OR_NULL;
		if(cvUndefinedOrNull(mask)) mask = 0;
		if(mask != 0) throw "mask は現在サポートされていません";
		
		rtn = cvSum(src);
		var len = src.width * src.height;
		
		for(k = 0 ; k < rtn.length ; rtn[k++] /= len);
		
	}
	catch(ex){
		alert("cvAvg : " + ex);
	}
	
	return rtn;
}

//画像の画素の平均値と分散を求める
//入力
//src IplImage型 計算対象となる画像
//mean Scalar型 平均値が入る RGB表色系ならr,g,b,aの結果が代入されている
//vrn Scalar型 分散が入る RGB表色系ならr,g,b,aの結果が代入されている
//mask IplImage型 0か255のマスク画像 省略可
//出力
//なし
function cvAvgVrn(src, mean, vrn, mask){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(mean) || cvUndefinedOrNull(std))
			throw "src or mean or std" + ERROR.IS_UNDEFINED_OR_NULL;
		if(cvUndefinedOrNull(mask)) mask = 0;
		if(mask != 0) throw "mask は現在サポートされていません";
		
		var avg = cvAvg(src);
		for(c = 0 ; c < CHANNELS ; c++){
			mean[c] = avg[c];
			vrn[c] = 0;
			var len = src.width * src.height;
			for(i = 0 ; i < src.height ; i++){
				for(j = 0 ; j < src.width ; j++){				
					var a = src.RGBA[c + (j + i * src.width) * CHANNELS] - mean[c];
					vrn[c] += a * a;
				}
			}
			vrn[c] /= len;
		}
	}
	catch(ex){
		alert("cvAvgVrn : " + ex);
	}
}

//画像の画素の平均値と標準偏差を求める
//入力
//src IplImage型 計算対象となる画像
//mean Scalar型 平均値が入る RGB表色系ならr,g,b,aの結果が代入されている
//vrn Scalar型 標準偏差が入る RGB表色系ならr,g,b,aの結果が代入されている
//mask IplImage型 0か255のマスク画像 省略可
//出力
//なし
function cvAvgSdv(src, mean, std, mask){
	cvAvgVrn(src, mean, std, mask);
	for(k = 0 ; k < std.length ; k++)
		std[k] = Math.sqrt(std[k]);
}

//画像のラベリングをおこなう
//入力
//src IplImage型 GRAY表色系の2値画像推奨(RGB表色系ならRの数値だけで処理する 画素は0か255にしておく)
//出力
//IplImage型
//GRAY表色系の画像
//各画素に0からnまでのラベルが代入されている
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

//円を描く
//入力
//src IplImage型 図が描かれる画像
//center Point型 円の中心座標
//radius int型 半径
//color Scalar型 円の色
//thickness 奇数 円周の太さ 0以上の値 0の場合、円は塗り潰される 省略可
//出力
//なし
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
						img.RGBA[(x + y * img.width) * CHANNELS] = color.val[0];
 						img.RGBA[1 + (x + y * img.width) * CHANNELS] = color.val[1];
 						img.RGBA[2 + (x + y * img.width) * CHANNELS] = color.val[2];
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
						img.RGBA[(x + y * img.width) * CHANNELS] = color.val[0];
 						img.RGBA[1 + (x + y * img.width) * CHANNELS] = color.val[1];
 						img.RGBA[2 + (x + y * img.width) * CHANNELS] = color.val[2];
					}
				}
			}
		}
	}
	catch(ex){
		alert("cvCircle : " + ex);
	}
}

//矩形を描く
//入力
//src IplImage型 図が描かれる画像
//pt1 Point型 矩形の左上の座標
//pt2 Point型 矩形の右下の座標
//color Scalar型 矩形の色
//thickness 奇数 外周の太さ 0以上の値 0の場合、矩形は塗り潰される 省略可
//出力
//なし
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
					img.RGBA[(x + y * img.width) * CHANNELS] = color.val[0];
 					img.RGBA[1 + (x + y * img.width) * CHANNELS] = color.val[1];
 					img.RGBA[2 + (x + y * img.width) * CHANNELS] = color.val[2];
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

//線分または直線を描く
//src IplImage型 図が描かれる画像
//pt1 Point型 直線の左上の座標
//pt2 Point型 直線の右下の座標
//color Scalar型 矩形の色
//thickness 奇数 外周の太さ 1以上の値 省略可
//isSegment true/false trueなら線分 falseなら直線 省略可
//出力
//なし
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
							img.RGBA[(xx + yy * img.width) * CHANNELS] = color.val[0];
 							img.RGBA[1 + (xx + yy * img.width) * CHANNELS] = color.val[1];
 							img.RGBA[2 + (xx + yy * img.width) * CHANNELS] = color.val[2];						}
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
 								img.RGBA[(xx + yy * img.width) * CHANNELS] = color.val[0];
 								img.RGBA[1 + (xx + yy * img.width) * CHANNELS] = color.val[1];
 								img.RGBA[2 + (xx + yy * img.width) * CHANNELS] = color.val[2];
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
								img.RGBA[(xx + yy * img.width) * CHANNELS] = color.val[0];
 								img.RGBA[1 + (xx + yy * img.width) * CHANNELS] = color.val[1];
 								img.RGBA[2 + (xx + yy * img.width) * CHANNELS] = color.val[2];
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

//モルフォロジー変換
//入力
//src IplImage型 変換する前の画像
//dst IplImage型 変換した後の画像
//element Size型 変換する際に確認する中心画素からの範囲 width,heightともに 3以上の奇数
//operation CV_MOP配列 モルフォロジーの種類
//iterations 整数 変換する回数
//出力
//なし
function cvMorphologyEx(src, dst, element, operation, iterations){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst) ||
		 cvUndefinedOrNull(element) || cvUndefinedOrNull(operation) ||
		 cvUndefinedOrNull(iterations)) throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
		
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

//画像の収縮
//入力
//src IplImage型 変換する前の画像
//dst IplImage型 変換した後の画像
//iterations 整数 変換する回数 省略可
//element Size型 変換する際に確認する中心画素からの範囲 width,heightともに 3以上の奇数 省略可
//出力
//なし
function cvErode(src, dst, iterations, element){
	try{
		cvDilateOrErode(src, dst, true, iterations, element);
	}
	catch(ex){
		alert("cvErode : " + ex);
	}
}

//画像の膨張
//入力
//src IplImage型 変換する前の画像
//dst IplImage型 変換した後の画像
//iterations 整数 変換する回数 省略可
//element Size型 変換する際に確認する中心画素からの範囲 width,heightともに 3以上の奇数 省略可
//出力
//なし
function cvDilate(src, dst, iterations, element){
	try{
		cvDilateOrErode(src, dst, false, iterations, element);
	}
	catch(ex){
		alert("cvDilate : " + ex);
	}
}

//積分画像を生成
//入力
//src IplImage型 原画像
//dst IplImage型 生成される積分画像
//squm IplImage型 各ピクセルを2乗して積分画像 省略可
//tilted_sum IplImage型 45度回転させた積分画像 省略可
//出力
//なし
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

//画像の複製
//入力
//src IplImage型 複製される画像
//出力
//IplImage型 複製された画像
function cvCloneImage(src){
	var dst = null;

	try{
		if(cvUndefinedOrNull(src)) throw "src" + ERROR.IS_UNDEFINED_OR_NULL;
		dst = cvCreateImage(src.width, src.height);
		cvCopy(src, dst);
	}
	catch(ex){
		alert("cvCloneImage : " + ex);
	}
	
	return dst;
}

//画像の画素のコピー
//入力
//src IplImage型 画素を複製する画像
//dst IplImage型 複製された画素の画像
//出力
//なし
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

//閾値処理
//入力
//src IplImage型 GRAY表色系を推奨(RGB表色系ならRの数値だけで処理する)
//dst IplImage型 閾値処理された画像が代入される
//threshold 整数 解説参照
//max_value 整数 解説参照
//threshold_type CV_THRESHOLD_TYPE 閾値処理の種類
//解説
//CV_THRESHOLD_TYPE.THRESH_BINARYなら srcの画素 > thresholdでmax_value、違えば0をdstの画素に代入
//CV_THRESHOLD_TYPE.THRESH_BINARY_INVなら srcの画素 > thresholdで0、違えばmax_valueをdstの画素に代入
//CV_THRESHOLD_TYPE.THRESH_TRUNCなら srcの画素 > thresholdでthresholdをdstの画素に代入
//CV_THRESHOLD_TYPE.THRESH_TRUNC_TOZEROなら srcの画素 > thresholdでthreshold、違えば0をdstの画素に代入
//CV_THRESHOLD_TYPE.THRESH_TRUNC_TOZERO_INVなら srcの画素 > thresholdで0、違えばthresholdをdstの画素に代入
//出力
//なし
function cvThreshold(src, dst, threshold, max_value, threshold_type){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst) || 
			cvUndefinedOrNull(threshold) || cvUndefinedOrNull(max_value) ||
			cvUndefinedOrNull(threshold_type)) throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL; 
		
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

 			var histColor = cvCreateHist(1, [256], CV_HIST.ARRAY, [[0, 256]]);
 			cvCalcHist(src, histColor);
 			
 			var hist = histColor.bins[0];
 
 			function Sum(values){
 				var rtn = 0;
 				for(i = 0 ; i < values.length ; rtn += values[i++]);
 				return rtn;
 			}

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

//画像サイズの変更 現在は縮小にしか対応していない
//入力
//src IplImage型 原画像
//dst IplImage型 サイズ変換後の画像 この画像サイズに変換される
//出力
//なし
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

//ルックアップテーブルに従って画素を変換
//入力
//src IplImage型 原画像
//dst IplImage型 画素を変換された後の画像
//lut 整数の配列 長さが256の整数配列 0～255の値が1つずつ代入されている
//color 整数 画像のどの色を変換するか決める値 0～2
//出力
//なし
function cvLUT(src, dst, lut, color){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst) || cvUndefinedOrNull(color))
			throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL; 
		
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

//トーンカーブに従って画素を変換
//左下、右上の2点を指定しその2点間を結ぶ直線をトーンカーブの曲線とみなして変換する
//入力
//src IplImage型 原画像
//dst IplImage型 画素を変換された後の画像
//underX 整数 左下の点のx座標
//underY 整数 左下の点のy座標
//overX 整数 右上の点のx座標
//overY 整数 右上の点のy座標
//color 整数 画像のどの色を変換するか決める値 0～2
//出力
//なし
function cvToneCurve(src, dst, underX, underY, overX, overY, color){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst) ||
			cvUndefinedOrNull(underX) || cvUndefinedOrNull(underY) ||
			cvUndefinedOrNull(overX) || cvUndefinedOrNull(overY) || 
			cvUndefinedOrNull(color)) throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
		
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

//２つの画像を混ぜる
//入力
//bg IplImage型 後面の画像
//fg IplImage型 前面の画像
//dst IplImage型 混ぜた後の画像
//blend_mode CV_BLEND_MODE 混ぜ方の種類 省略可
//出力
//なし
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

//スムージング
//入力
//src IplImage型 原画像
//dst IplImage型 スムージング後の画像
//smooth_type CV_SMOOTH スムージングの種類
//param1 解説参照
//param2 解説参照
//param3 解説参照
//param4 解説参照
//出力
//なし
//解説
//smooth_typeによってparam1～param4の意味が変わる
//CV_SMOOTH_TYPE.BLUR_NO_SCALE、CV_SMOOTH_TYPE.BLUR、CV_SMOOTH_TYPE.MEDIANの場合
//param1 奇数 スムージング窓の横幅 1以上 省略可
//param2 奇数 スムージング窓の縦幅 1以上 省略可
//param3 未使用
//param4 未使用
//CV_SMOOTH_TYPE.GAUSSIANの場合
//param1 奇数 スムージング窓の横幅 1以上 省略可
//param2 奇数 スムージング窓の縦幅 1以上 省略可
//param3 整数 ガウス関数の横のsigmaの値 0以上 省略可
//param4 整数 ガウス関数の縦のsigmaの値 0以上 省略可
//CV_SMOOTH_TYPE.BILATERALの場合
//param1 奇数 色のsigmaの値 省略可
//param2 奇数 距離のsigmaの値 省略可
//param3 未使用
//param4 未使用
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

//ソーベルフィルタ
//入力
//src IplImage型 GRAY表色系の濃淡画像推奨(RGB表色系ならRの数値だけで処理する)
//dst IplImage型 処理後の画像
//xorder 整数 解説参照
//yorder 整数 解説参照
//aperture_size 整数(3,5,7のみ) 窓サイズ 省略可
//出力
//なし
//解説
//xorder,yorderはそれぞれ横方向縦方向のソーベルフィルタの処理回数を意味する
//xorderかyorderのどちらかは0にする
function cvSobel(src, dst, xorder, yorder, aperture_size){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst)) throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL;
		if(src.width != dst.width || src.height != dst.height) throw ERROR.DIFFERENT_SIZE;
		if(xorder != 0 && yorder != 0) throw "xorder or yorderのどちらかを0にして下さい";
		if(xorder < 0 || yorder < 0) throw "xorder or yorer " + ERROR.ONLY_POSITIVE_NUMBER;
		if(cvUndefinedOrNull(aperture_size)) aperture_size = 3;
		
		switch(aperture_size){		
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

//ケニーフィルタ
//入力
//src IplImage型 GRAY表色系の濃淡画像推奨(RGB表色系ならRの数値だけで処理する)
//dst IplImage型 処理後の画像
//threshold1 解説参照
//threshodl2 解説参照
//aperture_size 整数(3,5,7のみ) 窓サイズ 省略可
//出力
//なし
//解説
//threshold1 と threshold2 のうち
//小さいほうがエッジ同士を接続するために用いられ，大きいほうが強いエッジの初期検出に用いられる
function cvCanny(src, dst, threshold1, threshold2, aperture_size){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst) ||
		cvUndefinedOrNull(threshold1) || cvUndefinedOrNull(threshold2))
			throw "src or dst or threshold1 or threshold2" + ERROR.IS_UNDEFINED_OR_NULL; 
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

//表色系変換
//入力
//src IplImage型 原画像
//dst IplImage型 処理後の画像
//code CV_CODE この値に従って表色系を変換する "X"2"Y"となっておりX表色系からY表色系への変換を意味する
//出力
//なし
function cvCvtColor(src, dst, code){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst) || cvUndefinedOrNull(code))
			throw "src or dst or color" + ERROR.IS_UNDEFINED_OR_NULL; 
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

//画像の四則演算
//全画素に対して四則演算が行われる cvAdd cvSub cvMul cvDivで呼び出されることを想定
//入力
//src1 IplImage型 ひとつめの画像
//src2 IplImage型 ひとつめの画像
//dst IplImage型 src1とsrc2をfour_arithmeticに従って演算する
//four_arithmetic FOUR_ARITHMETIC 四則演算
//出力
//なし
function cvFourArithmeticOperations(src1, src2, dst, four_arithmetic){
	try{
		if(cvUndefinedOrNull(src1) || cvUndefinedOrNull(src2) || cvUndefinedOrNull(dst) || cvUndefinedOrNull(four_arithmetic))
			throw "src1 or src2 or dst or four_arithmetic" + ERROR.IS_UNDEFINED_OR_NULL;
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

//画像の加算
//全画素に対して加算が行われる
//入力
//src1 IplImage型 ひとつめの画像
//src2 IplImage型 ひとつめの画像
//dst IplImage型 src1とsrc2を加算した結果
//出力
//なし
function cvAdd(src1, src2, dst){
	try{
		cvFourArithmeticOperations(src1, src2, dst, FOUR_ARITHMETIC.ADD);
	}
	catch(ex){
		alert("cvAdd : " + ex);
	}
}

//画像の減算
//全画素に対して減算が行われる
//入力
//src1 IplImage型 ひとつめの画像
//src2 IplImage型 ひとつめの画像
//dst IplImage型 src1とsrc2を減算した結果
//出力
//なし
function cvSub(src1, src2, dst){
	try{
		cvFourArithmeticOperations(src1, src2, dst, FOUR_ARITHMETIC.SUB);
	}
	catch(ex){
		alert("cvSub : " + ex);
	}
}

//画像のかけ算
//全画素に対してかけ算が行われる
//入力
//src1 IplImage型 ひとつめの画像
//src2 IplImage型 ひとつめの画像
//dst IplImage型 src1とsrc2を割算した結果
//出力
//なし
function cvMul(src1, src2, dst){
	try{
		cvFourArithmeticOperations(src1, src2, dst, FOUR_ARITHMETIC.MUL);
	}
	catch(ex){
		alert("cvMul : " + ex);
	}
}

//画像の割り算
//全画素に対して割り算が行われる
//入力
//src1 IplImage型 ひとつめの画像
//src2 IplImage型 ひとつめの画像
//dst IplImage型 src1とsrc2を掛け算した結果
//出力
//なし
function cvDiv(src1, src2, dst){
	try{
		cvFourArithmeticOperations(src1, src2, dst, FOUR_ARITHMETIC.DIV);
	}
	catch(ex){
		alert("cvDiv : " + ex);
	}
}

//画素を絶対値にする
//入力
//src IplImage型 原画像 cvSobel等で画素値がマイナスのものを想定
//dst IplImage型 画素が絶対値化された画像
//出力
//なし
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

//膨張か縮小 cvDilate cvErodeで呼び出されることを想定
//入力
//src IplImage型 原画像
//dst IplImage型 膨張か収縮をした結果
//isDilate true/false trueなら膨張 falseなら収縮
//iterations 整数 繰り返し回数 省略可
//element Size型 窓関数の縦横幅 奇数 省略可
//出力
//なし
function cvDilateOrErode(src, dst, isDilate, iterations, element){
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
					var value = isDilate ? 0 : 255;
					for(eh = ehS ; eh < ehE ; eh++){
						var h = ih + eh;
						if(h >= 0 && h < src.height){
							for(ew = ewS ; ew < ewE ; ew++){
								var w = iw + ew;
								if(w >= 0 && w < src.width){
									if((isDilate && value < dmy.RGBA[(w + h * dst.width) * CHANNELS]) ||
										(!isDilate && value > dmy.RGBA[(w + h * dst.width) * CHANNELS]))
										value = dmy.RGBA[(w + h * dst.width) * CHANNELS];
								}
							}
						}
					}
					dst.RGBA[(iw + ih * dst.width) * CHANNELS] = value;
					dst.RGBA[1 + (iw + ih * dst.width) * CHANNELS] = value;
					dst.RGBA[2 + (iw + ih * dst.width) * CHANNELS] = value;
				}
			}
		}
	}
	catch(ex){
		throw ex;
	}
} 

//全座標に色を代入
//入力
//src IplImage型 色が代入される画像
//c1 整数 ひとつめの色 (RGB表色系ならR)
//c2 整数 ふたつめの色 (RGB表色系ならG)
//c3 整数 みっつめの色 (RGB表色系ならB)
//a 整数 アルファ値
//出力
//なし
function cvSetRGBA(src, c1, c2, c2, a){
	try{
		if(cvUndefinedOrNull(src)) throw "src" + ERROR.IS_UNDEFINED_OR_NULL;
		if(cvUndefinedOrNull(c1)) c1 = 255;
		if(cvUndefinedOrNull(c2)) c2 = 255;
		if(cvUndefinedOrNull(c3)) c3 = 255;
		if(cvUndefinedOrNull(a)) a = 255;

		var color = new Scalar();
 		color.val[0] = c1;
 		color.val[1] = c2;
 		color.val[2] = c3;
 		color.val[3] = a;
		
		cvSet(src, color);
	}
	catch(ex){
		alert("cvSetRGBA : " + ex);
	}
}

//全座標に色を代入
//入力
//src IplImage型 色が代入される画像
//color Scalar型 代入する色
//出力
//なし
function cvSet(src, color){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(color))
			throw "src or color" + ERROR.IS_UNDEFINED_OR_NULL;
		for(i = 0 ; i < src.height ; i++){
			for(j = 0 ; j < src.width ; j++){
 				src.RGBA[(j + i * src.width) * CHANNELS] = color.val[0];
 				src.RGBA[1 + (j + i * src.width) * CHANNELS] = color.val[1];
 				src.RGBA[2 + (j + i * src.width) * CHANNELS] = color.val[2];
 				src.RGBA[3 + (j + i * src.width) * CHANNELS] = color.val[3];
			}
		}
	}
	catch(ex){
		alert("cvSet : " + ex);
	}
}

//全座標にゼロを代入
//入力
//src IplImage型 ゼロが代入される画像
//出力
//なし
function cvZero(src){
	try{
		if(cvUndefinedOrNull(src)) throw "src" + ERROR.IS_UNDEFINED_OR_NULL;
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

//undefinedまたはnullチェック
//入力
//value チェックされる入力
//出力
//true/false
function cvUndefinedOrNull(value){
	return (value === undefined || value === null) ? true : false;
}

//cvLoadImageを呼び出す前に必要な前処理
//htmlのinputタグのonClickで呼び出すことを想定
//入力
//event event型 発生したイベント
//inputId Id型 イベントの発生元のId
//出力
//なし
function cvLoadImagePre(event, inputId){
	try{
		if(cvUndefinedOrNull(event) || cvUndefinedOrNull(inputId))
				throw "event or inputId" + ERROR.IS_UNDEFINED_OR_NULL;
		var dialog = document.getElementById(inputId);
		dialog.value = "";
	}
	catch(ex){
		alert("cvLoadImagePre : " + ex);
	}
}

//imgタグのsrcからiplImageに変換する
//入力
//src src型 imgタグのsrc画像
//imgId  Id型 イベントの発生元のId
//iplImage IplImage型 srcの値が代入される
//maxSize 整数 srcの縦or横幅がこの値以上なら、この値となるように大きさを変換して代入される -1なら処理されない 省略可
//出力
//なし
function cvLoadImageAtSrc(src, imgId, iplImage, maxSize){
	try{
		if(cvUndefinedOrNull(src) || cvUndefinedOrNull(imgId) || cvUndefinedOrNull(iplImage))
				throw "src or imgId or iplImage" + ERROR.IS_UNDEFINED_OR_NULL;
		if(cvUndefinedOrNull(maxSize)) maxSize = -1;
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
//imgタグからiplImageに変換する
//htmlのinputタグのonchangeで呼び出すことを想定
//入力
//event event型 発生したイベント
//imgId  Id型 イベントの発生元のId
//iplImage IplImage型 srcの値が代入される
//maxSize 整数 srcの縦or横幅がこの値以上なら、この値となるように大きさを変換して代入される -1なら処理されない 省略可
//出力
//なし
function cvLoadImage(event, imgId, iplImage, maxSize){	
	try{
		if(cvUndefinedOrNull(event) || cvUndefinedOrNull(imgId) || cvUndefinedOrNull(iplImage))
				throw "event or imgId or iplImage" + ERROR.IS_UNDEFINED_OR_NULL;
		var file = event.target.files[0];
		if (file){
			if(cvUndefinedOrNull(maxSize)) maxSize = -1;
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

//IplImage型を生成する
//入力
//width 整数 生成するIplImageのwidth
//height 整数 生成するIplImageのheight
//出力
//IplImage
function cvCreateImage(width, height){
	var dst = null;
	try{
		if(cvUndefinedOrNull(width) || cvUndefinedOrNull(height))
			throw "width or height" + ERROR.IS_UNDEFINED_OR_NULL;
		else if(width <= 0 || height <= 0)
			throw "width or height" + ERROR.ONLY_POSITIVE_NUMBER;

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

//IplImage型をimgタグに出力する
//入力
//imgId Id型 imgタグのId
//iplImage IplImage型 imgに転送する画像
//出力
//なし
function cvShowImage(imgId, iplImage){
	try{
		if(cvUndefinedOrNull(imgId) || cvUndefinedOrNull(iplImage))
			throw "imgId or iplImage" + ERROR.IS_UNDEFINED_OR_NULL;
		cvRGBA2ImageData(iplImage);
		if (iplImage.canvas.getContext) {

			iplImage.canvas.getContext("2d").putImageData(iplImage.imageData, 0, 0);
		    var imgElement = document.getElementById(imgId);
		    if(imgElement == null) throw imgId + ERROR.IS_UNDEFINED_OR_NULL;
		 
		 	imgElement.width = iplImage.width;
			imgElement.height = iplImage.height;
		 	
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

//IplImage型のRGBAの値をimageDataへ転送
//cvShowImageで呼び出されることを想定
//入力
//iplImage IplImage型 自身のimageDataへ自身のRGBAの値がコピーされる画像
//出力
//なし
function cvRGBA2ImageData(iplImage){
	try{
		if(cvUndefinedOrNull(iplImage)) throw "iplImage" + ERROR.IS_UNDEFINED_OR_NULL;
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

//imgタグからcanvasへ転送
//cvLoadImageで呼び出されることを想定
//入力
//image imgタグ imgタグのオブジェクト
//出力
//canvasタグ
function cvGetCanvasAtImgElement(image){
	var canvas = null;
	try{
		if(cvUndefinedOrNull(image)) throw "image" + ERROR.IS_UNDEFINED_OR_NULL;
		
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
	var w = 0 , h = 0 ;
	try{
		if(cvUndefinedOrNull(image)) throw "image" + ERROR.IS_UNDEFINED_OR_NULL;
		
	    w = image.width ;
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
	}
	catch(ex){
		alert("cvGetOriginalSizeAtImgElement : " + ex);
	}

    return {width:w, height:h};
}