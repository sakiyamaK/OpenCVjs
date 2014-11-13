//------------------構造体------------------------
//ハフ変換の種類
var CV_HOUGH = {
    STANDARD : 0,
    PROBABILISTIC : 1,
    MULTI_SCALE : 2
}

//表色系変換の種類
var CV_CODE = {
RGB2GRAY: 0,
RGB2HSV: 1,
HSV2RGB: 2,
RGB2HLS: 3,
HLS2RGB: 4,
RGB2YCbCr: 5,
YCbCr2RGB: 6
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

//リサイズの種類
var CV_INTER = {
    NN : 0,
    LINEAR : 1,
    AREA : 2,
    CUBIC : 3
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

//------------------------メソッド----------------------------

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
                for(var i = 0 ; i < hist.bins[0].length ; hist.bins[0][i++] = 0);
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
        
        for(var k = 0 ; k < hist.ranges.length ; k++){
            if(accumulate == 0){
                for(var i = 0; i < hist.bins[k].length; i++) hist.bins[k][i] = 0;
            }
            
            var binWidth = (hist.ranges[k][1] - hist.ranges[k][0])/hist.bins[k].length;
            for(var i = 0 ; i < src.height ; i++){
                for(var j = 0 ; j < src.width ; j++){
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

//ヒストグラムを均一化する
//入力
//src IplImage型 ヒストグラムを均一化する画像
//dst IplImage型 ヒストグラムが均一化された画像画像
//color int型 0縲鰀3のみ どの色情報を均一化するか
function cvEqualizeHist(src, dst, color){
    try{
        if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst))
            throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL;
        else if(src.width != dst.width || src.height != dst.height)
            throw ERROR.DIFFERENT_SIZE;
        if(cvUndefinedOrNull(color) || color < 0 || color > 2)
            throw "color" + ERROR.ONLY_NUMBER;
        
        function getMinMax(histBins, mins, maxs, pix_mins, pix_maxs, ave){
            var rest = 0;
            var now = 0;
            var pixels;
            var a, b;
            for(var i = 0 ; i < 256 ; i++){
                pixels = rest + histBins[i];
                mins[i] = now;
                if(rest > 0) pix_mins[i] = ave -rest;
                else pix_mins[i] = ave + 100;
                a = pixels / ave;
                rest = pixels % ave;
                maxs[i] = now + a;
                if(rest > 0) pix_maxs[i] = rest;
                else pix_maxs[i] = ave + 100;
                now += a;
            }
            for(var i = 0 ; i < 255 ; i++){
                if(mins[i] > 255) mins[i] = 255;
                if(maxs[i] > 255) maxs[i] = 255;
            }
        }
        
        function getHistEqu(x, nows, mins, maxs, pixs_min, pixs_max){
            var res;
            if(nows[x] == maxs[x]){
                if(pixs_max[x] <= 0) nows[x] = mins[x];
                else pixs_max[x]--;
            }
            if(nows[x] == mins[x]){
                if(pixs_min[x] <= 0) nows[x] = mins[x]+1;
                else pixs_min[x]--;
            }
            if(nows[x] > maxs[x]) nows[x] = mins[x];
            res = nows[x];
            nows[x]++;
            return res;
        }
        
        //--ヒストグラム作成--
        var hist = new Array(256);
        for(var i = 0 ; i < 256; i++) hist[i] = 0;
        for(var i =0 ; i < src.height ; i++){
            for(var j = 0 ; j < src.width ; j++){
                var v = src.RGBA[color + (j + i * src.width) * CHANNELS];
                hist[v]++;
            }
        }
        
        var omax = new Array(256);
        var omin = new Array(256);
        var pix_max = new Array(256);
        var pix_min = new Array(256);
        var onow = new Array(256);
        
        var ave = Math.floor(src.width * src.height / 256);
        
        getMinMax(hist, omin, omax, pix_min, pix_max, ave);
        for(var i = 0 ; i < 256; i++) onow[i] = omin[i];
        //--ヒストグラムの均等化--
        for(var i = 0 ; i < src.height ; i++){
            for(var j = 0 ; j < src.width ; j++){
                var v = src.RGBA[color + (j + i * src.width) * CHANNELS];
                var vv = getHistEqu(v, onow, omin, omax, pix_min, pix_max);
                dst.RGBA[color + (j + i * dst.width) * CHANNELS] = Math.floor(vv);
            }
        }
    }
    catch(ex){
        alert("cvEqualizeHist : " + ex);
    }
}

//円を描く
//入力
//src IplImage型 図が描かれる画像
//center CvPoint型 円の中心座標
//radius int型 半径
//color CvScalar型 円の色
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
            
            for(var x = xS ; x <= xE ; x++){
                for(var y = yS ; y <= yE ; y++){
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
            
            for(var x = xS ; x <= xE ; x++){
                for(var y = yS ; y <= yE ; y++){
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
//pt1 CvPoint型 矩形の左上の座標
//pt2 CvPoint型 矩形の右下の座標
//color CvScalar型 矩形の色
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
            for(var y = yS ; y <= yE ; y++){
                for(var x = xS ; x <= xE ; x++){
                    img.RGBA[(x + y * img.width) * CHANNELS] = color.val[0];
                    img.RGBA[1 + (x + y * img.width) * CHANNELS] = color.val[1];
                    img.RGBA[2 + (x + y * img.width) * CHANNELS] = color.val[2];
                }
            }
        }
        else{
            var pt3 = new CvPoint();
            var pt4 = new CvPoint();
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
//pt1 CvPoint型 直線の左上の座標
//pt2 CvPoint型 直線の右下の座標
//color CvScalar型 矩形の色
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
            
            
            for(var y = yS ; y <= yE ; y++){
                for(var tx = tS ; tx <= tE ; tx++){
                    for(var ty = tS ; ty <= tE ; ty++){
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
                
                for(var y = yS ; y <= yE ; y++){
                    var x = Math.floor((y - pt1.y) / katamuki) + pt1.x ;
                    for(var tx = tS ; tx <= tE ; tx++){
                        for(var ty = tS ; ty <= tE ; ty++){
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
                
                for(var x = xS ; x <= xE ; x++){
                    var y = Math.floor(katamuki * (x - pt1.x)) + pt1.y;
                    
                    for(var tx = tS ; tx <= tE ; tx++){
                        for(var ty = tS ; ty <= tE ; ty++){
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
//element CvSize型 変換する際に確認する中心画素からの範囲 width,heightともに 3以上の奇数
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
//element CvSize型 変換する際に確認する中心画素からの範囲 width,heightともに 3以上の奇数 省略可
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
//element CvSize型 変換する際に確認する中心画素からの範囲 width,heightともに 3以上の奇数 省略可
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
//sum IplImage型 生成される積分画像
//sqsum IplImage型 各ピクセルを2乗して積分画像 省略可
//tilted_sum IplImage型 45度回転させた積分画像 省略可
//出力
//なし
function cvIntegral(src, sum, sqsum, tilted_sum){
    try{
        if(cvUndefinedOrNull(src) || cvUndefinedOrNull(sum)) throw "src or sum" + ERROR.IS_UNDEFINED_OR_NULL;
        
        if(src.width + 1 != sum.width || src.height + 1 != sum.height) throw "sum" + ERROR.INVALID_SIZE;
        cvZero(sum);
        
        if(!cvUndefinedOrNull(sqsum)){
            if(src.width + 1 != sqsum.width || src.height + 1 != sqsum.height) throw "sqSum" + ERROR.INVALID_SIZE;
            cvZero(sqsum);
        }
        if(!cvUndefinedOrNull(tilted_sum)){
            if(src.width + 1 != tilted_sum.width || src.height + 1 != tilted_sum.height) throw "tilted_sum" + ERROR.INVALID_SIZE;
            cvZero(tilted_sum);
        }
        
        for (var yy = 0; yy < sum.height; yy++){
            for (var xx = 0; xx < sum.width; xx++){
                for (var y = 0; y < yy; y++){
                    for (var x = 0; x < xx; x++){
                        for(var c = 0; c < CHANNELS - 1; c++){
                            var v = src.RGBA[c + (x + y * src.width) * CHANNELS];
                            sum.RGBA[c + (xx + yy * sum.width) * CHANNELS] += v;
                            sqsum.RGBA[c + (xx + yy * sqsum.width) * CHANNELS] += v * v;
                        }
                    }
                    for (var x = 0; x < src.width; x++){
                        if(Math.abs(x - xx + 1) <= yy - y - 1){
                            for(var c = 0; c < CHANNELS - 1; c++){
                                var v = src.RGBA[c + (x + y * src.width) * CHANNELS];
                                tilted_sum.RGBA[c + (xx + yy * tilted_sum.width) * CHANNELS] += v;
                            }
                        }
                    }
                }
            }
        }
    }
    catch(ex){
        alert("cvIntegral : " + ex);
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
//CV_THRESHOLD_TYPE.THRESH_OTSUなら srcの画素 > thresholdでthreshold、違えば0をdstの画素に代入
//出力
//なし
function cvThreshold(src, dst, threshold, max_value, threshold_type){
    try{
        if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst) ||
           cvUndefinedOrNull(threshold) || cvUndefinedOrNull(max_value) ||
           cvUndefinedOrNull(threshold_type)) throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
        
        switch(threshold_type){
            case CV_THRESHOLD_TYPE.THRESH_BINARY:
                for(var i = 0 ; i < src.height ; i++){
                    for(var j = 0 ; j < src.width ; j++){
                        dst.RGBA[(j + i * dst.width) * CHANNELS] =
                        (src.RGBA[(j + i * dst.width) * CHANNELS] > threshold) ? max_value : 0;
                        dst.RGBA[(j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
                        dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
                        dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
                    }
                }
                break;
            case CV_THRESHOLD_TYPE.THRESH_BINARY_INV:
                for(var i = 0 ; i < src.height ; i++){
                    for(var j = 0 ; j < src.width ; j++){
                        dst.RGBA[(j + i * dst.width) * CHANNELS] =
                        (src.RGBA[(j + i * dst.width) * CHANNELS] > threshold) ? 0 : max_value;
                        dst.RGBA[(j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
                        dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
                        dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
                    }
                }
                break;
            case CV_THRESHOLD_TYPE.THRESH_TRUNC:
                for(var i = 0 ; i < src.height ; i++){
                    for(var j = 0 ; j < src.width ; j++){
                        dst.RGBA[(j + i * dst.width) * CHANNELS] =
                        (src.RGBA[(j + i * dst.width) * CHANNELS] > threshold) ? threshold : src.RGBA[(j + i * dst.width) * CHANNELS];
                        dst.RGBA[(j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
                        dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
                        dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
                    }
                }
                break;
            case CV_THRESHOLD_TYPE.THRESH_TRUNC_TOZERO:
                for(var i = 0 ; i < src.height ; i++){
                    for(var j = 0 ; j < src.width ; j++){
                        dst.RGBA[(j + i * dst.width) * CHANNELS] =
                        (src.RGBA[(j + i * dst.width) * CHANNELS] > threshold) ? threshold : 0;
                        dst.RGBA[(j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
                        dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
                        dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = dst.RGBA[(j + i * dst.width) * CHANNELS];
                    }
                }
                break;
            case CV_THRESHOLD_TYPE.THRESH_TRUNC_TOZERO_INV:
                for(var i = 0 ; i < src.height ; i++){
                    for(var j = 0 ; j < src.width ; j++){
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
                    for(var i = 0 ; i < values.length ; rtn += values[i++]);
                    return rtn;
                }
                
                var varDst = 0;
                var sTh = 1;
                for(var th = 1 ; th < 254 ; th++){
                    bClass = new Array();
                    wClass = new Array();
                    for(var i = 0; i < th ; i++) bClass[i] = hist[i];
                    var k = 0;
                    for(var i = th; i < 255 ; i++) wClass[k++] = hist[i];
                    var w1 = 0; var m1 = 0;
                    var w2 = 0; var m2 = 0;
                    w1 = Sum(bClass);
                    w2 = Sum(wClass);
                    for(var i = 0; i < bClass.length ; i++) m1 += i * bClass[i];
                    for(var i = 0; i < wClass.length ; i++) m2 += (th + i) * wClass[i];
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

//画像サイズの変更
//入力
//src IplImage型 原画像
//dst IplImage型 サイズ変換後の画像 この画像サイズに変換される
//interpolation CV_INTER構造体 補完の種類　省略可
//出力
//なし
function cvResize(src, dst, interpolation){
    try{
        if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst)) throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL;
        if(cvUndefinedOrNull(interpolation)) interpolation = CV_INTER.NN;
        if(interpolation == CV_INTER.AREA)
            throw "interpolation は現在CV_INTER.AREAをサポートしていません";
        
        var scaleWidth = src.width / dst.width;
        var scaleHeight = src.height / dst.height;
        
        for(var i = 0 ; i < dst.height ; i++){
            var h = scaleHeight * i ;
            for(var j = 0 ; j < dst.width ; j++){
                var w = scaleWidth * j;
                for(var  c = 0 ; c < CHANNELS ; c++){
                    var v = 0;
                    switch(interpolation){
                        case CV_INTER.NN:
                            w = Math.floor(w + 0.5);
                            h = Math.floor(h + 0.5);
                            v = src.RGBA[c + (w + h * src.width) * CHANNELS];
                            break;
                        case CV_INTER.LINEAR:
                            var intW = Math.floor(w);
                            var intH = Math.floor(h);
                            var nextW = intW + 1; if(nextW > src.width - 1) nextW = src.width - 2;
                            var nextH = intH + 1; if(nextH > src.height - 1) nextH = src.height - 2;
                            var w1 = nextW - w;
                            var h1 = nextH - h;
                            var w2 = w - intW;
                            var h2 = h - intH;
                            v = w1 * h1 * src.RGBA[c + (intW + intH * src.width) * CHANNELS] +
                            w1 * h2 * src.RGBA[c + (nextW + intH * src.width) * CHANNELS] +
                            w2 * h1 * src.RGBA[c + (intW + nextH * src.width) * CHANNELS] +
                            w2 * h2 * src.RGBA[c + (nextW + nextH * src.width) * CHANNELS] ;
                            break;
                        case CV_INTER.AREA: break;
                        case CV_INTER.CUBIC:
                            var ha = -2;
                            var hym = cvCreateMat(1, 4);
                            var hxm = cvCreateMat(4, 1);
                            var srcm = cvCreateMat(4, 4);
                            var intW = Math.floor(w);
                            var intH = Math.floor(h);
                            var x2 = w - intW
                            var x1 = x2 + 1;
                            var x3 = intW + 1 - w;
                            var x4 = x3 + 1;
                            var y2 = h - intH;
                            var y1 = y2 + 1;
                            var y3 = intH + 1 - h;
                            var y4 = y3 + 1;
                            
                            function sinc(t, a){
                                var absT = Math.abs(t);
                                var absT2 = absT * absT;
                                var absT3 = absT2 * absT;
                                return (absT > 2) ? 0 :
                                (absT <= 1) ?
                                (a + 2) * absT3  - (a + 3) * absT2 + 1 :
                                a * absT3 - 5 * a * absT2 + 8 * a * absT - 4 * a;
                            }
                            
                            hym.vals[0] = sinc(y1, ha);
                            hym.vals[1] = sinc(y2, ha);
                            hym.vals[2] = sinc(y3, ha);
                            hym.vals[3] = sinc(y4, ha);
                            
                            hxm.vals[0] = sinc(x1, ha);
                            hxm.vals[1] = sinc(x2, ha);
                            hxm.vals[2] = sinc(x3, ha);
                            hxm.vals[3] = sinc(x4, ha);
                            
                            var ip = intH - 1;
                            var in1 = intH + 1;
                            var in2 = intH + 2;
                            
                            if(intH == 0) ip = 1;
                            else if(intH == src.height - 2){
                                in2 = src.height - 2;
                            }
                            else if(intH == src.height - 1){
                                in1 = src.height - 2;
                                in2 = src.height - 3;
                            }
                            
                            var jp = intW - 1;
                            var jn1 = intW + 1;
                            var jn2 = intW + 2;
                            
                            if(intW == 0) jp = 1;
                            else if(intW == src.width - 2){
                                jn2 = src.width - 2;
                            }
                            else if(intW == src.width - 1){
                                jn1 = src.width - 2;
                                jn2 = src.width - 3;
                            }
                            
                            srcm.vals[0] = src.RGBA[c + (jp + ip * src.width) * CHANNELS];
                            srcm.vals[1] = src.RGBA[c + (intW + ip * src.width) * CHANNELS];
                            srcm.vals[2] = src.RGBA[c + (jn1 + ip * src.width) * CHANNELS];
                            srcm.vals[3] = src.RGBA[c + (jn2 + ip * src.width) * CHANNELS];
                            var len = srcm.cols;
                            srcm.vals[len] = src.RGBA[c + (jp + intH * src.width) * CHANNELS];
                            srcm.vals[1 + len] = src.RGBA[c + (intW + intH * src.width) * CHANNELS];
                            srcm.vals[2 + len] = src.RGBA[c + (jn1 + intH * src.width) * CHANNELS];
                            srcm.vals[3 + len] = src.RGBA[c + (jn2 + intH * src.width) * CHANNELS];
                            len = 2 * srcm.cols;
                            srcm.vals[len] = src.RGBA[c + (jp + in1 * src.width) * CHANNELS];
                            srcm.vals[1 + len] = src.RGBA[c + (intW + in1 * src.width) * CHANNELS];
                            srcm.vals[2 + len] = src.RGBA[c + (jn1 + in1 * src.width) * CHANNELS];
                            srcm.vals[3 + len] = src.RGBA[c + (jn2 + in1 * src.width) * CHANNELS];
                            len = 3 * srcm.cols;
                            srcm.vals[len] = src.RGBA[c + (jp + in2 * src.width) * CHANNELS];
                            srcm.vals[1 + len] = src.RGBA[c + (intW + in2 * src.width) * CHANNELS];
                            srcm.vals[2 + len] = src.RGBA[c + (jn1 + in2 * src.width) * CHANNELS];
                            srcm.vals[3 + len] = src.RGBA[c + (jn2 + in2 * src.width) * CHANNELS];
                            
                            var dstm1 = cvmMul(hym, srcm);
                            var dstm2 = cvmMul(dstm1, hxm);
                            
                            v = dstm2.vals[0];
                            
                            break;
                        default :
                            throw "interpolation" + ERROR.SWITCH_VALUE;
                            break;
                    }
                    
                    dst.RGBA[c + (j + i * dst.width) * CHANNELS]  = v;
                }
            }
        }
    }
    catch(ex){
        alert("cvResize : " + ex);
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
                for(var i = 0 ; i < src.height ; i++){
                    for(var j = 0 ; j < src.width ; j++){
                        for(var c = 0 ; c < CHANNELS - 1 ; c++){
                            var newValue = 0;
                            for(var y = 0 ; y < param2 ; y++){
                                var yy = i + y + startY;
                                if(yy < 0) yy *= -1;
                                yy %= src.height;
                                for(var x = 0 ; x < param1 ; x++){
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
                for(var i = 0 ; i < src.height ; i++){
                    for(var j = 0 ; j < src.width ; j++){
                        for(var c = 0 ; c < CHANNELS - 1 ; c++){
                            var newValue = 0;
                            for(var y = 0 ; y < param2 ; y++){
                                var yy = i + y + startY;
                                if(yy < 0) yy *= -1;
                                yy %= src.height;
                                for(var x = 0 ; x < param1 ; x++){
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
                
                for(var y = 0 ; y < param2 ; y++){
                    var yy = y + startY;
                    for(var x = 0 ; x < param1 ; x++){
                        var xx = x + startX;
                        array[x + y * param1] = Math.exp(-1 * (xx * xx + yy * yy) / alpha);
                    }
                }
                
                var sum = 0;
                for(var i = 0 ; i < array.length ; i++) sum += array[i];
                for(var i = 0 ; i < array.length ; i++) array[i] /= sum;
                
                sum = 0;
                for(var i = 0 ; i < array.length ; i++) sum += array[i];
                
                for(var i = 0 ; i < src.height ; i++){
                    for(var j = 0 ; j < src.width ; j++){
                        for(var c = 0 ; c < CHANNELS - 1 ; c++){
                            var newValue = 0;
                            for(var y = 0 ; y < param2 ; y++){
                                var yy = i + y + startY;
                                if(yy < 0) yy *= -1;
                                yy %= src.height;
                                for(var x = 0 ; x < param1 ; x++){
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
                for(var i = 0 ; i < src.height ; i++){
                    for(var j = 0 ; j < src.width ; j++){
                        for(var c = 0 ; c < CHANNELS - 1 ; c++){
                            for(var y = 0 ; y < param1 ; y++){
                                var yy = i + y + start;
                                if(yy < 0) yy *= -1;
                                yy %= src.height;
                                for(var x = 0 ; x < param1 ; x++){
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
                
                for(var y = 0 ; y < 3 ; y++){
                    var yy = y - 1;
                    for(var x = 0 ; x < 3 ; x++){
                        var xx = x - 1;
                        array[x + y * 3] = Math.exp(-1 * (xx * xx + yy * yy) / param12);
                    }
                }
                
                for(var i = 0 ; i < src.height ; i++){
                    for(var j = 0 ; j < src.width ; j++){
                        for(var c = 0 ; c < CHANNELS - 1 ; c++){
                            var overValue = 0;
                            var underValue = 0;
                            for(var y = 0 ; y < 3 ; y++){
                                var yy = i + y - 1;
                                if(yy < 0) yy *= -1;
                                yy %= src.height;
                                for(var x = 0 ; x < 3 ; x++){
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
                for(var time = 0 ; time < times ; time++){
                    cvCopy(dst, dmy);
                    for(var i = 0; i < dmy.height ; i++){
                        for(var j =0; j < dmy.width ; j++){
                            var newValue = 0;
                            for(var y = 0 ; y < aperture_size ; y++){
                                var yy = i + y -1;
                                if(yy < 0) yy *= -1;
                                yy %= dmy.height;
                                
                                for(var x = 0 ; x < aperture_size ; x++){
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
        for(var i = 0 ; i < kyodo.height ; i++){
            for(var j = 0 ; j < kyodo.width ; j++){
                
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
        for(var i = 1 ; i < th; i++){
            for(var j = 1 ; j < tw; j++){
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
        
        //◆◆閾値処理◆◆
        var bigT = threshold1;
        var smallT = threshold2;
        if(threshold1 < threshold2){
            bigT = threshold2;
            smallT = threshold1;
        }
        
        var m = aperture_size/2;
        
        for(var i = 0 ; i < dst.height ; i++){
            for(var j = 0 ; j < dst.width ; j++){
                if(dst.RGBA[(j + i * dst.width) * CHANNELS] > bigT) dst.RGBA[(j + i * dst.width) * CHANNELS] = 255;
                else if(dst.RGBA[(j + i * dst.width) * CHANNELS] <= bigT &&
                        dst.RGBA[(j + i * dst.width) * CHANNELS] > smallT)
                {
                    var isEdge = false;
                    
                    for(var y = -m ; y <= m ; y++){
                        top = i - y; if(top < 0) top *= -1;
                        down = i + y; if(top > dst.height - 1) top = dst.height - 2;
                        for(var x = -m ; x <= m ; x++){
                            left = j - x; if(left < 0) left *= -1;
                            right = j + x; if(right > dst.width - 1) right = dst.width - 2;
                            
                            
                            if( (x != 0 || y != 0) && dst.RGBA[(left + top * dst.width) * CHANNELS] == 255 ||
                               dst.RGBA[(j + top * dst.width) * CHANNELS] == 255 ||
                               dst.RGBA[(right + top * dst.width) * CHANNELS] == 255 ||
                               dst.RGBA[(left + i * dst.width) * CHANNELS] == 255 ||
                               dst.RGBA[(right + i * dst.width) * CHANNELS] == 255 ||
                               dst.RGBA[(left + down * dst.width) * CHANNELS] == 255 ||
                               dst.RGBA[(j + down * dst.width) * CHANNELS] == 255 ||
                               dst.RGBA[(right + down * dst.width) * CHANNELS] == 255){
                                
                                isEdge = true;
                                break;
                            }
                        }
                        if(isEdge) break;
                    }
                    dst.RGBA[(j + i * dst.width) * CHANNELS] = (isEdge) ? 255 : 0;
                }
                else dst.RGBA[(j + i * dst.width) * CHANNELS] = 0;
            }
        }
        
        for(var i = 0 ; i < dst.height ; i++){
            for(var j = 0 ; j < dst.width ; j++){
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
                for (var i = 0; i < dst.height; i++) {
                    for (var j = 0; j < dst.width; j++) {
                        
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
                
                for (var i = 0; i < dst.height; i++) {
                    for (var j = 0; j < dst.width; j++) {
                        
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
                for (var i = 0; i < dst.height; i++) {
                    for (var j = 0; j < dst.width; j++) {
                        
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
                for (var i = 0; i < dst.height; i++) {
                    for (var j = 0; j < dst.width; j++) {
                        
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
                function calc(n1, n2, hue) {
                    hue = (hue + 180) % 360;
                    if(hue < 60) return n1 + (n2 - n1) * hue / 60;
                    else if(hue < 180) return n2;
                    else if(hue < 240) return n1 + (n2 - n1) * (240 - hue) / 60;
                    else return n1;
                }
                
                for (var i = 0; i < dst.height; i++) {
                    for (var j = 0; j < dst.width; j++) {
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
                    }
                }
                break;
                
            case CV_CODE.RGB2YCbCr:
                for (var i = 0; i < src.height; i++) {
                    for (var j = 0; j < src.width; j++) {
                        var r = src.RGBA[(j + i * src.width) * CHANNELS];
                        var g = src.RGBA[1 + (j + i * src.width) * CHANNELS];
                        var b = src.RGBA[2 + (j + i * src.width) * CHANNELS];
                        
                        var Y = (r + g + b) / 3;
                        var Cb = -0.168777 * r - 0.331223 * g + 0.5 * b;
                        var Cr = 0.5 * r - 0.418358 * g - 0.081642 * b;
                        
                        dst.RGBA[(j + i * dst.width) * CHANNELS] = Y;
                        dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = Cb;
                        dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = Cr;
                        dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * dst.width) * CHANNELS];
                        
                    }
                }
                break;
                
            case CV_CODE.YCbCr2RGB:
                for (var i = 0; i < src.height; i++) {
                    for (var j = 0; j < src.width; j++) {
                        var Y = src.RGBA[(j + i * src.width) * CHANNELS];
                        var Cb = src.RGBA[1 + (j + i * src.width) * CHANNELS];
                        var Cr = src.RGBA[2 + (j + i * src.width) * CHANNELS];
                        
                        var r = Y + 1.402176 * Cr;
                        var g = Y - 0.714489 * Cr - 0.345619 * Cb;
                        var b = Y + 1.771046 * Cb;
                        
                        dst.RGBA[(j + i * dst.width) * CHANNELS] = r;
                        dst.RGBA[1 + (j + i * dst.width) * CHANNELS] = g;
                        dst.RGBA[2 + (j + i * dst.width) * CHANNELS] = b;
                        dst.RGBA[3 + (j + i * dst.width) * CHANNELS] = src.RGBA[3 + (j + i * src.width) * CHANNELS];
                        
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

//膨張か縮小 cvDilate cvErodeで呼び出されることを想定
//入力
//src IplImage型 原画像
//dst IplImage型 膨張か収縮をした結果
//isDilate true/false trueなら膨張 falseなら収縮
//iterations 整数 繰り返し回数 省略可
//element CvSize型 窓関数の縦横幅 奇数 省略可
//出力
//なし
function cvDilateOrErode(src, dst, isDilate, iterations, element){
    try{
        if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst))
            throw "src or dst" + ERROR.IS_UNDEFINED_OR_NULL;
        
        if(cvUndefinedOrNull(element))
        {
            element = new CvSize();
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
        
        for(var ite = 0 ; ite < iterations ; ite++){
            cvCopy(dst, dmy);
            for(var ih = 0 ; ih < dst.height ; ih++){
                for(var iw = 0 ; iw < dst.width ; iw++){
                    var value = isDilate ? 0 : 255;
                    for(var eh = ehS ; eh < ehE ; eh++){
                        var h = ih + eh;
                        if(h >= 0 && h < src.height){
                            for(var ew = ewS ; ew < ewE ; ew++){
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
                for(var  c = 0 ; c < ch ; c++){
                    
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
        
        for(var i = 0 ; i < dst.height ; i++){
            for(var j = 0 ; j < dst.width ; j++){
                dst.RGBA[(j + i * dst.width) * CHANNELS] = 0;
            }
        }
        
        var lut = new Array(dmy.width * dmy.height);
        for(var i = 0 ; i < lut.length ; i++) lut[i] = i;
        
        var newNumber = 1;
        var MAX = dmy.width * dmy.height;
        var check = new Array(4);
        
        for(var i = 0 ; i < dmy.height ; i++){
            for(var j = 0 ; j < dmy.width ; j++){
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
                        for(var n = 3 ; n >= 0 ; n--){
                            if(check[n] != 0 && check[n] != MAX) m = n;
                        }
                        
                        if(m == check.length){
                            dst.RGBA[(j + i * dst.width) * CHANNELS] = newNumber;
                            newNumber++;
                        }
                        else{
                            dst.RGBA[(j + i * dst.width) * CHANNELS] = check[m];
                            c = m + 1;
                            for(var n = c ; n < check.length ; n++){
                                if(check[n] != MAX && lut[check[n]] > check[m])	lut[check[n]] = check[m];
                            }
                        }
                    }
                }
            }
        }
        
        for(var i = 0 ; i < dmy.height ; i++){
            for(var j = 0 ; j < dmy.width ; j++){
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
        alert("Labeling : " + ex);
    }
    return dst;
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
            
            for(var i = 0 ; i < src.height ; i++){
                for(var j = 0 ; j < src.width ; j++){
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
        
        for(var c = 0 ; c < CHANNELS; c++){
            for(var i = 0 ; i < dst.height ; i++){
                var is =  i * dst.width * CHANNELS;
                var js = 0;
                var vi = i;
                if(vi > src.height - 1) vi = src.height - 2 - i % src.height;
                vi *= src.width;
                for(var j = 0 ; j < dst.width ; j++){
                    var vj = j;
                    if(vj > src.width - 1) vj = src.width - 2 - j % src.width;
                    dst.RGBA[c + js + is] =
                    src.RGBA[c + (vj + vi) * CHANNELS];
                    js += CHANNELS;
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
        for(var i = 0 ; i < dst.height ; i++){
            var is = i * dst.width * CHANNELS;
            var js = 0;
            for(var j = 0 ; j < dst.width ; j++){
                for(var c = 0 ; c < CHANNELS ; c++){
                    dst.RGBA[c + js + is] =
                    src.RGBA[c + (j + xs + (i + ys) * src.width) * CHANNELS];
                }
                js += CHANNELS;
            }
        }
    }
    catch(ex){
        alert("cvCloping : " + ex);
    }
    
    return dst;
}


