//-------------------定数--------------------------
//インペイントの種類
var CV_INPAINT = {
NS: 0,
TELEA: 1
}


//------------------メソッド------------------------

//[todo]
//Orthogonal Matching Pursuit
//スパースコーディングの係数選択法
//画像内から小領域のブロックをひとつのベクトルとして処理する
//入力
//mat CvMat型 スパース表現にする画像
//blockWidth int型 ブロックの横幅
//blockHeight int型 ブロックの縦幅
function cvmOMP(mat, blockWidth, blockHeight){
    try{
        //バリデーション
        if(cvUndefinedOrNull(mat))
            throw "mat" + ERROR.IS_UNDEFINED_OR_NULL;
        //デフォルト値
        if(cvUndefinedOrNull(blockWidth))
            blockWidth = 8;
        if(cvUndefinedOrNull(blockHeight))
            blockHeight = 8;
        
        var blockCols = Math.ceil(mat.cols / blockWidth);
        var blockRows = Math.ceil(mat.rows / blockHeight);
        
        var block = cvCreateMat(blockWidth, blockHeight);
        
        for(var bc = 0 ; bc < blockCols ; bc++){
            var bcbh = bc * blockHeight;
            for(var br = 0 ; br < blockRows ; br++){
                var bbw = br * blockWidth;
                
                //matからblockを取り出す
                for(var bh = 0 ; bh < blockHeight ; bh++){
                    var bhbw = bh * blockWidth;
                    for(var bw = 0 ; bw < blockWidth ; bw++){
                        block.vals[bw + bhbw] = mat.vals[bbw + bw + (bhbw + bcbh) * mat.cols];
                    }
                }
                
                
            }
        }
    }
    catch(ex){
        alert("cvmOMP : " + ex);
    }
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

