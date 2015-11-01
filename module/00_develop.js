//-------------------定数--------------------------
//インペイントの種類
var CV_INPAINT = {
NS: 0,
TELEA: 1
}


//------------------メソッド------------------------

//行列の二重対角化
//入力
//mat CvMat型 対角化する行列
//eps double型 計算精度 デフォルト CV_DEF_EPS
function cvmDoubleDiagonalization(mat, eps){
    var rtn = null;
    try{
        //バリデーション
        if(cvUndefinedOrNull(mat))
            throw "mat" + ERROR.IS_UNDEFINED_OR_NULL;
        
        //デフォルト値
        if(cvUndefinedOrNull(eps)) eps = CV_DEF_EPS;
        
        //--内部で使う処理を関数化--
        //行列から指定した範囲の行列を抜き出す
        function partMatrix(mat, sx, sy, ex, ey){
            
            var mcols = ex - sx;
            var mrows = ey - sy;
            
            var mar = cvCreateMat(mrows, mcols);
            for(var i = 0 ; i < mar.rows ; i++){
                for(var j = 0 ; j < mar.cols ; j++){
                    mar.vals[j + i * mar.cols] = mat.vals[sx + j + (sy + i) * mat.cols];
                }
            }
            
            return mar;
        }
        //行列の指定された範囲内のうちの要素の最大値とその座標を返す
        function maxAbsAndXY(ar, sx, sy, ex, ey){
            //デフォルト値
            if(cvUndefinedOrNull(sx)) sx = 0;
            if(cvUndefinedOrNull(sy)) sy = 0;
            if(cvUndefinedOrNull(ex)) ex = ar.cols;
            if(cvUndefinedOrNull(ey)) ey = ar.rows;
            
            var max = Math.abs(ar.vals[sx + sy * ar.cols]);
            var mx = sx;
            var my = sy;
            for(var y = sy ; y < ey ; y++){
                for(var x = sx ; x < ex ; x++){
                    var tmp = Math.abs(ar.vals[x + y * ar.cols]);
                    if(max < tmp){
                        max = tmp;
                        mx = x;
                        my = y;
                    }
                }
            }
            
            return [max, mx, my];
        }
        
        //行列の指定した列ベクトルのノルムの二乗
        function norm2MatrixCol(mat, col, start, end){
            //デフォルト値
            if(cvUndefinedOrNull(start)) start = 0;
            if(cvUndefinedOrNull(end)) end = mat.rows;
            
            var vec = cvCreateMat(end - start, 1);
            for(var i = 0 ; i < vec.rows ; i++){
                vec.vals[i] = mat.vals[col + (i + start) * mat.cols];
            }
            
            return cvmNorm(vec, null, CV_NORM.L2Square);
        }
        
        //行列の指定した行ベクトルのノルムの二乗
        function norm2MatrixRow(mat, row, start, end){
            
            //デフォルト値
            if(cvUndefinedOrNull(start)) start = 0;
            if(cvUndefinedOrNull(end)) end = mat.rows;
            
            var vec = cvCreateMat(end - start, 1);
            for(var i = 0 ; i < vec.rows ; i++){
                vec.vals[i] = mat.vals[i + start + row * mat.cols];
            }
            
            return cvmNorm(vec, null, CV_NORM.L2Square);
        }
        
        //行列の列ベクトルと縦ベクトルのhouseholder変換行列
        function householderMatColVec(mat, col, vec){
            var rtn = null;
            try{
                if(mat.rows != vec.rows)
                    throw "matとvec" + ERROR.DIFFERENT_LENGTH;
                
                var matV = cvCreateMat(mat.rows, 1);
                for(var i = 0 ; i < matV.rows ; i++){
                    matV.vals[i] = mat.vals[col + i * mat.cols];
                }
                
                rtn = cvmHouseHolder(matV, vec);
            }
            catch(ex){
                alert("householderMatColVec : " + ex);
            }
            return rtn;
        }
        
        //行列の行ベクトルと横ベクトルのhouseholder変換行列(ただし１次元配列として返す)
        function householderMatRowVec(mat, row, vec){
            var rtn = null;
            try{
                if(mat.cols != vec.cols)
                    throw "matとvec" + ERROR.DIFFERENT_LENGTH;
                
                var matV = cvCreateMat(1, mat.cols);
                var rw = row * mat.cols;
                for(var i = 0 ; i < matV.cols ; i++){
                    matV.vals[i] = mat.vals[i + rw];
                }
                
                rtn = cvmHouseHolder(matV, vec);
            }
            catch(ex){
                alert("householderMatRowVec : " + ex);
            }
            
            return rtn;
        }
        //----------------------
        
        //matのコピー
        var rtn = cvmCopy(mat);
        
        var sx = sy = 0;
        while(true){
            
            //ar^(times)段階目の対角化を行う小行列を取得
            var mar = partMatrix(rtn, sx, sy, rtn.cols, rtn.rows);
            var mwidth = rtn.cols - sx;
            var mheight = rtn.rows - sy;
            
            var maxVXY;
            var vec;
            var hhMat;
            
            //step6に到達するまでループ 基本はstep1 ~ 6と進む
            var step = 1;
            while(step != -1){
                switch(step){
                    case 1://ar^(times)の要素で絶対値が最大とるなる要素を探す。その値がeps以下なら二重対角化終了
                        
                        maxVXY = maxAbsAndXY(mar, mwidth);
                        if(maxVXY[0] < eps){
                            dWrite(0, "finish");
                            step = -1; //二重対角化終了
                            break;
                        }
                        
                        step = 2;
                        
                        break;
                        
                    case 2://絶対値最大の要素を含む行とar^(times)の第１行を入れ替える
                        for(var i = 0 ; i < mar.cols ; i++){
                            var tmp = mar.vals[i];
                            mar.vals[i] = mar.vals[i + maxVXY[2] * mar.cols];
                            mar.vals[i + maxVXY[2] * mar.cols] = tmp;
                        }
                        
                        step = 3;
                        
                        break;
                        
                    case 3://ar^(times)の第１列において、絶対値が最大となる要素を探す。その値がeps以下ならd_times=0とおきstep6へ
                        maxVXY = maxAbsAndXY(mar, 0, 0, 1, mheight);
                        
                        if(maxVXY[0] > eps){
                            step = 4;
                        }
                        else{
                            mar[0] = 0;
                            step = 6;
                        }
                        
                        break;
                        
                    case 4://ar^(times)の第１列の第２項以下を0とするようなハウスホルダー変換を左からar^(times)に行う
                        vec = cvCreateMat(mheight, 1);
                        vec.vals[0] = Math.sqrt(norm2MatrixCol(mar, 0));
                        for(var i = 1 ; i < vec.rows ; vec.vals[i++] = 0);
                        
                        hhMat = householderMatColVec(mar, 0, vec);
                        
                        mar = cvmMul(hhMat, mar);
                        
                        //最後の２行２列の場合は列方向だけハウスホルダー変換し、対角化が終了となる
                        step = sx == mat.cols - 2 ? -1 : 5;
                        
                        break;
                        
                    case 5://ar^(times)の第１行において第２項以降で絶対値が最大となる要素を探す。その値がeps以下なら第１行第２項を0とおきstep7へ
                        
                        maxVXY = maxAbsAndXY(mar, 1, 0, mwidth, 1);
                        
                        if(maxVXY[0] > eps) step = 6;
                        else{
                            mar.vals[1] = 0;
                            step = -1;
                        }
                        
                        break;
                        
                    case 6://ar^(times)の第１行の第３項以降を０とするようなハウスホルダー変換を右から行う
                        vec = cvCreateMat(1, mwidth);
                        vec.vals[0] = mar.vals[0];
                        vec.vals[1] = Math.sqrt(norm2MatrixRow(mar, 0, 1, mwidth));
                        for(var i = 2 ; i < vec.cols ; vec.vals[i++] = 0);
                        
                        hhMat = householderMatRowVec(mar, 0, vec);
                        
                        mar = cvmMul(mar, hhMat);
                        
                        step = -1;
                        
                        break;
                    default://ループ用パラメータ更新
                        throw "ありえないstepが実行されました";
                        break;
                }
            }
            
            //コピー
            for(var i = 0 ; i < mheight ; i++){
                for(var j = 0 ; j < mwidth ; j++){
                    rtn.vals[sx + j + (sy + i) * rtn.cols] = mar.vals[j + i * mwidth];
                }
            }
            
            sx++;
            sy++;
            if(sx == mat.cols - 1 || sy == mat.rows - 1){ //終了条件
                break;
            }
        }
    }
    catch(ex){
        alert("cvmDoubleDiagonalization : " + ex);
    }
    
    return rtn;
}






function cvKMeans2(samples, cluster_count, labels, termcrit){
    try{
        if(cvUndefinedOrNull(samples) || cvUndefinedOrNull(cluster_count) || cvUndefinedOrNull(labels)
           || cvUndefinedOrNull(termcrit))
            throw "samples or cluster_count or labels or termcrit " + ERROR.IS_UNDEFINED_OR_NULL;
        
        function clustering(samples, clusters, labels)
        {
            for(var i = 0 ; i < samples.height ; i++){
                for(var j = 0 ; j < samples.width; j++){
                    var ji = (j + i * samples.width) * CHANNELS;
                    var c1 = samples.RGBA[ji];
                    var c2 = samples.RGBA[1 + ji];
                    var c3 = samples.RGBA[2 + ji];
                    
                    var disC1 = c1 - clusters.RGBA[0];
                    var disC2 = c2 - clusters.RGBA[1];
                    var disC3 = c3 - clusters.RGBA[2];
                    
                    var dis = disC1 * disC1 + disC2 * disC2 + disC3 * disC3;
                    
                    for(var cnum = 1 ; cnum < clusters.width; cnum++){
                        
                    }
                }
            }
        }
    }
    catch(ex){
        alert("cvKMeans2 : " + ex);
    }
}

function cvInPaint(src, mask, dst, inpaintRadius, flags){
    try{
        if(cvUndefinedOrNull(src) || cvUndefinedOrNull(mask) || cvUndefinedOrNull(dst)
           || cvUndefinedOrNull(inpaintRadius))
            throw "src or mask or dst or inpaintRadius " + ERROR.IS_UNDEFINED_OR_NULL;
        if(src.width != dst.width || src.height != dst.height ||
           mask.width != dst.width || mask.height != dst.height)
            throw "src or mask or dst " + ERROR.DIFFERENT_SIZE;
        
        if(flags != CV_INPAINT.TELEA)
            throw "flagsは現在CV_INPAINT.TELENAしかサポートしていません";
        
        function cvInPaintOneLoop(src, mask, dst, inpaintRadius, flags){
            
            // -- maskのエッジ探索 --
            var edge = new cvCreateImage(src.width, src.height);
            cvZero(edge);
            for(var i = 0 ; i < edge.height ; i++){
                if(i != 0 && i != edge.height - 1){
                    for(var j = 0 ; j < edge.width ; j++){
                        var v = 0;
                        if(j != 0 && j != edge.width - 1){
                            //8近傍チェック
                            for(var y = -1 ; y <= 1 ; y++){
                                for(var x = -1 ; x <= 1 ; x++){
                                    if(mask.RGBA[(j + x + (i + y) * mask.width) * CHANNELS] == 0){
                                        v = 255;
                                        break;
                                    }
                                }
                                if(v != 0) break;
                            }
                        }
                        edge.RGBA[(j + i * edge.width) * CHANNELS] = v;
                    }
                }
                else{
                    for(var j = 0 ; j < edge.width ; j++){
                        edge.RGBA[(j + i * edge.width) * CHANNELS] = 255;
                    }
                }
            }
            
            // -- 輝度勾配 --
            gImage = cvCreateImage(src.width, src.height);
            cvZero(gImage);
            for(var i = 0 ; i < gImage.height ; i++){
                for(var j = 0 ; j < gImage.width ; j++){
                    if(edge.RGBA[(j + i * edge.width) * CHANNNELS] != 0){
                        for(var c = 0 ; c < 3 ; c++){
                            var dx = src.RGBA[(j + 1 + i * src.width) * CHANNNELS] - src.RGBA[(j - 1 + i * src.width) * CHANNNELS];
                            var dx = src.RGBA[(j + (i + 1) * src.width) * CHANNNELS] - src.RGBA[(j + (i - 1) * src.width) * CHANNNELS];
                        }
                    }
                }
            }
            
            switch(flags){
                case CV_INPAINT.NS:
                    break;
                default:
                    break;
            }
        }
    }
    catch(ex){
        alert("cvInPaint : " + ex);
    }
}

//ハフ変換
//入力
//src IplImage型 GRAY表色系を想定(RGB表色系ならRで実行される)
//method CV_HOUGH型 ハフ変換の種類
//rho 少数 距離解像度 1ピクセルあたりの単位
//theta 少数 角度解像度 ラジアン単位
//threshold 整数 対応する投票数がこの値より大きい場合のみ抽出された直線が返される
//param1 少数 各手法に応じたパラメータ 解説参照
//param2 少数 各手法に応じたパラメータ 解説参照
//出力
//[ラインの数][ラインの情報]の二次元配列が返る
//[X][0]にrhoの値
//[X][1]にthetaの値
//解説
//CV_HOUGH.STANDARDの場合
//  param1,param2共に使用しない(0)
//CV_HOUGH.PROBABILISTICの場合
//  param1は最小の線の長さ使用しない(0)
//  param2は同一線として扱う線分の最大間隔
//CV_HOUGH.MULTI_SCALEの場合
//  param1はrhoの序数（荒い距離はrho,詳細な距離ではrho/param1）
//  param2はthetaの序数 （荒い角度はtheta,詳細な角度ではtheta/param2）
//http://codezine.jp/article/detail/153
function cvHoughLines2(src, method, rho, theta, threshold, param1, param2){
    var rtn = null;
    try{
        if(cvUndefinedOrNull(src) || cvUndefinedOrNull(method) ||
           cvUndefinedOrNull(rho) || cvUndefinedOrNull(theta) || cvUndefinedOrNull(threshold))
            throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
        
        if(method != CV_HOUGH.STANDARD)
            throw "methodは現在CV_HOUGH.STANDARDしかサポートしていません";
        
        if(cvUndefinedOrNull(param1)) param1 = 0;
        if(cvUndefinedOrNull(param2)) param2 = 0;
        
        //---------------------------------------
        //-- 初期化 --
        //---------------------------------------
        var rtn = new Array();
        var thetaMax = Math.floor(Math.PI/theta);
        var sn = new Array(thetaMax); //サインカーブ配列
        var cs = new Array(thetaMax);//コサインカーブ配列
        var diagonal = new Array(src.height);//半径計算用斜線長テーブル
        
        var counter = new Array(thetaMax);//直線検出用頻度カウンタ
        var rhoMax = Math.floor(Math.sqrt(src.width * src.width + src.height * src.height) + 0.5);
        for(var i = 0 ; i < counter.length ; i++){
            counter[i] = new Array(2 * rhoMax);
            for(var j = 0 ; j < counter[i].length ; j++){
                counter[i][j] = 0;
            }
        }
        
        //三角関数テーブルを作成
        for(var i = 0 ; i < sn.length ; i++){
            sn[i] = Math.sin(i * theta);
            cs[i] = Math.cos(i * theta);
        }
        
        
        switch(method){
                
            case CV_HOUGH.STANDARD:
                
                for(var i = 0 ; i < src.height ; i++){
                    var is = i * src.width * CHANNELS;
                    var js = 0;
                    for(var j = 0 ; j < src.width ; j++){
                        if(src.RGBA[js + is] == 255){
                            for(var t = 0 ; t < thetaMax; t++){
                                r = Math.floor(j * cs[t] + i * sn[t] + 0.5);
                                counter[t][r + rhoMax]++;
                            }
                        }
                        js += CHANNELS;
                    }
                }
                
                break;
                
            case CV_HOUGH.PROBABILISTIC:
                break;
            case CV_HOUGH.MULTI_SCALE:
                break;
        }
        
        var num = 0;
        for(var t = 0 ; t < counter.length ; t++){
            for(var r = 0 ; r < counter[t].length ; r++){
                if(counter[t][r] > threshold){
                    rtn[num] = new Array(2);
                    rtn[num][0] = r - rhoMax;
                    rtn[num][1] = t;
                    num++;
                }
            }
        }
    }
    catch(ex){
        alert("cvHoughLines2 : " + ex);
    }
    
    return rtn;
}

