var term = new CvTermCriteria();
//term.max_iter = 200000;
term.eps = 0.01;
var test_term = new CvTermCriteria();
test_term.eps = 1;

var maxTime = 10000;
for(var time = 0 ; time < maxTime ; time++){
    var rows = Math.floor(Math.random() * 4) + 8;
    var cols = rows; //Math.floor(Math.random() * 4) + 2;
    var mat = cvCreateMat(rows, cols);
    for(var i = 0 ; i < mat.rows ; i++){
        for(var j = 0 ; j < mat.cols ; j++){
            mat.vals[j + i * mat.cols] = Math.floor(Math.random() * 10) + 1;
        }
    }
    
    var mm = cvmMul(mat, cvmTranspose(mat));
    
//    mm = cvCreateMat(2, 2);
//    mm.vals = [1,1,1,1];

//    var shortV = Math.floor(Math.random() * 4) + 2;
//    var longV = shortV + Math.floor(Math.random() * 4);
//    ////
//    ////shortV = 1;
//    ////longV = 2;
//    ////
//    var rowMat = cvCreateMat(longV, shortV);
//    for(var i = 0 ; i < rowMat.rows ; i++){
//        for(var j = 0 ; j < rowMat.cols ; j++){
//            rowMat.vals[j + i * rowMat.cols] = Math.floor(Math.random() * 10) + 1;
//        }
//    }
    
    
//    if(!test_cvmQR(mm, false))
//        document.write("QRのエラー" + "<br/><br/>");
    
//    if(!test_cvmTridiagonalization(mm, true, term, test_term)){
//        
//        document.write(time + "回目<br/>");
//        cvDWriteMatrix(mm, "mat");
//        var rank = cvmRank(mat);
//        document.write("ランク = " + rank + "<br/>");
//
//        document.write("対角化のエラー" + "<br/><br/>");
//        break;
//    }
    
//    cvDWriteMatrix(mm, "mat");
    
    if(!test_cvmEigen(mm, false, term, test_term)){
        document.write(time + "回目<br/>");
        cvDWriteMatrix(mm, "mat");
        document.write("eigenのエラー" + "<br/><br/>");
        break;
    }

//if(!test_cvmSVD(mat, true, term, test_term))
//    document.write("SVDのエラー" + "<br/><br/>");

//if(!test_cvmInverse(mm, true, term, test_term))
//    document.write("cvmInverseのエラー" + "<br/><br/>");
}



function test_cvmInverse(mat, isDraw, cvTermCriteria, test_cvTermCriteria){
    try{
        //デフォルト
        if(cvUndefinedOrNull(cvTermCriteria))
            cvTermCriteria = new CvTermCriteria();
        
        if(cvUndefinedOrNull(test_cvTermCriteria))
            test_cvTermCriteria = new CvTermCriteria();
        
        if(isDraw) cvDWriteMatrix(mat, "逆行列を求める行列");
        
        var invM = cvmInverse(mat, cvTermCriteria);
        
        if(isDraw) cvDWriteMatrix(invM, "逆行列");
        
        var mm = cvmMul(invM, mat);
        
        if(isDraw) cvDWriteMatrix(mm, "逆行列*行列");

        
        for(var i = 0 ; i < mm.rows ; i++){
            for(var j = 0 ; j < mm.cols ; j++){
                if(i == j){
                    if(Math.abs(mm.vals[j + i * mm.cols]) > test_cvTermCriteria.eps &&
                       Math.abs(mm.vals[j + i * mm.cols] -1) > test_cvTermCriteria.eps)
                        return false;
                }
                else{
                    if(Math.abs(mm.vals[j + i * mm.cols]) > test_cvTermCriteria.eps)
                        return false;
                }
            }
        }
    }
    catch(ex){
        alert("test_cvmInverse : " + ex);
    }
    
    return true;
}

//cvmQRのテスト
//入力
//mat CvMat型 調べる行列
//isDraw bool型 計算途中の配列を描画するか
//cvTermCriteria CvTermCriteria型 計算精度
//test_cvTermCriteria CvTermCriteria型 計算が合っているかを確認する精度
//出力
//bool型 問題なければtrue
function test_cvmQR(mat, isDraw, cvTermCriteria, test_cvTermCriteria){
    var rtn = false;
    try{
        //デフォルト
        if(cvUndefinedOrNull(cvTermCriteria))
            cvTermCriteria = new CvTermCriteria();
        
        if(cvUndefinedOrNull(test_cvTermCriteria))
            test_cvTermCriteria = new CvTermCriteria();
        
        var qr = cvmQR(mat, cvTermCriteria);
        
        var Q = qr[0];
        var R = qr[1];
        
        for(var i = 0 ; i < R.cols * R.rows ; i++){
            if(Math.abs(R.vals[i]) < test_cvTermCriteria.eps) R.vals[i] = 0;
        }
        
        if(isDraw) cvDWriteMatrix(Q, "Q");
        if(isDraw) cvDWriteMatrix(R, "R");
        
        
        //----- Qの直交性のチェック [start]-------//
        var Qt = cvmTranspose(qr[0]);
        var QQt = cvmMul(Qt, Q);
        //閾値以下を0にする
        for(var i = 0 ; i < QQt.cols * QQt.rows ; i++){
            if(Math.abs(QQt.vals[i]) < test_cvTermCriteria.eps) QQt.vals[i] = 0;
        }
        
        if(isDraw) cvDWriteMatrix(QQt, "QQt");
        
        for(var i = 0 ; i < QQt.rows ; i++){
            for(var j = 0 ; j < QQt.cols ; j++){
                if(cvUndefinedOrNull(QQt.vals[j + i * QQt.cols])){
                    throw "Qの値がnullかundefined";
                }
                if(i == j){
                    if(Math.abs(QQt.vals[j + i * QQt.cols] - 1) > test_cvTermCriteria.eps){
                        throw "Qの直交性のチェック";
                    }
                }
                else{
                    if(Math.abs(QQt.vals[j + i * QQt.cols]) > test_cvTermCriteria.eps){
                        throw "Qの直交性のチェック";
                    }
                }
            }
        }
        //----- Qの直交性のチェック [end]-------//

        
        //Rの三角化チェック
        for(var i = 1 ; i < R.rows ; i++){
            for(var j = 0 ; j < i - 1 ; j++){
                if(R.vals[j + i * R.cols] > test_cvTermCriteria.eps){
                    throw "Rの三角化のチェック";
                }
            }
        }
        
        //元に戻るか
        var reverse = cvmMul(Qt, R);
        for(var i = 0 ; i < reverse.rows ; i++){
            for(var j = 0 ; j < reverse.cols ; j++){
                if(Math.abs(reverse.vals[j + i * reverse.cols] - mat.vals[j + i * mat.cols]) > test_cvTermCriteria.eps){
                    throw "M = QtRのチェック";
                }
            }
        }
        
        rtn = true;
    }
    catch(ex){
        alert("test_cvmQRでエラー : " + ex);
    }
    
    return rtn;
}

//cvmEigenの結果をテスト
//入力
//mat CvMat型 調べる行列
//isDraw bool型 計算途中の配列を描画するか
//cvTermCriteria CvTermCriteria型 計算精度
//test_cvTermCriteria CvTermCriteria型 計算が合っているかを確認する精度
//出力
//bool型 問題なければtrue
function test_cvmEigen(mat, isDraw, cvTermCriteria, test_cvTermCriteria){
    try{
        //デフォルト
        if(cvUndefinedOrNull(cvTermCriteria))
            cvTermCriteria = new CvTermCriteria();
        
        if(cvUndefinedOrNull(test_cvTermCriteria))
            test_cvTermCriteria = new CvTermCriteria();

        
        var ee = cvmEigen(mat, cvTermCriteria);
        if(!ee) return false;
        
        var eValues = ee[0];
        var eVects = ee[1];
        
        if(isDraw){
            cvDWriteMatrix(eValues, "固有値");
            cvDWriteMatrix(eVects, "固有ベクトル");
        }
        
        if(isDraw) document.write("固有値と固有ベクトルのチェック<br/>");
        
        for(var v = 0 ; v < eValues.rows ; v++){

            var eVect = cvCreateMat(eVects.rows, 1);
            for(var i = 0 ; i < eVect.rows ; i++){
                eVect.vals[i] = eVects.vals[v + i * eVects.cols];
            }
            
            if(isDraw){
                document.write("固有値<br/>");
                document.write(eValues.vals[v] + "<br/><br/>");
                cvDWriteMatrix(cvmTranspose(eVect), "固有ベクトル");
            }

            var a = cvmMul(mat, eVect);
            
            for(var i = 0 ; i < eVect.rows ; i++){
                eVect.vals[i] = eValues.vals[v] * eVect.vals[i];
            }
            
            if(isDraw) cvDWriteMatrix(a, "mat * 固有ベクトル");
            if(isDraw) cvDWriteMatrix(eVect, "固有値 * 固有ベクトル");

            for(var i = 0 ; i < eVect.rows ; i++){
                if(Math.abs(a.vals[i] - eVect.vals[i]) > test_cvTermCriteria.eps){
                    document.write(i +"列目<br/>");
                    document.write("mat * 固有ベクトル - 固有値 * 固有ベクトル<br/>");
                    document.write(Math.abs(a.vals[i] - eVect.vals[i]) + "<br/>");
                    document.write("精度 = " + test_cvTermCriteria.eps + "<br/><br/>");
                    return false;
                }
            }
        }
        
    }
    catch(ex){
        alert("test_cvmEigen : " + ex);
    }
    
    return true;
}

//QR分解を利用した実対称行列の三重対角化
//入力
//mat CvMat型 調べる行列
//isDraw bool型 計算途中の配列を描画するか
//cvTermCriteria CvTermCriteria型 計算精度
//test_cvTermCriteria CvTermCriteria型 計算が合っているかを確認する精度
//出力
//bool型 問題なければtrue

function test_cvmTridiagonalization (mat, isDraw, cvTermCriteria, test_cvTermCriteria){
    
    try{
        //対称化のチェック
        for(var i = 0 ; i < mat.rows ; i++){
            for(var j = i + 1 ; j < mat.cols ; j++){
                if(mat.vals[j + i * mat.cols] != mat.vals[i + j *mat.cols]){
                    throw "matは対称行列ではありません";
                }
            }
        }


        //バリデーション
        if(cvUndefinedOrNull(cvTermCriteria))
            cvTermCriteria = new CvTermCriteria();
        
        if(cvUndefinedOrNull(test_cvTermCriteria))
            test_cvTermCriteria = new CvTermCriteria();

        var rq = cvmCopy(mat);
        
        //---QR法による三重対角化---
        var isOK = false;
        for(var loop = 0 ; loop < cvTermCriteria.max_iter ; loop++){
            
            qr = cvmQR(rq);
            if(qr == null) return rtn;
            
            rq = cvmMul(qr[1],cvmTranspose(qr[0]));
            
            //精度のチェック(rqが三重対角行列か)
            isOK = true;
            for(var i = 0 ; i < rq.rows; i++){
                for(var j = 0 ; j < rq.cols; j++){
                    if(i != j && i - 1 != j && i + 1 != j && Math.abs(rq.vals[j + i * rq.cols]) > cvTermCriteria.eps){
                        isOK = false;
                        break;
                    }
                }
                //精度のチェックでひっかかっているならループをぬける
                if(!isOK) break;
            }
            
            if(isDraw){
                cvDWriteMatrix(qr[0], "Q");
                cvDWriteMatrix(qr[1], "R");
                cvDWriteMatrix(rq, "変換mat");
            }
            
            //精度が問題なければfor文を抜ける
            if(isOK) break;
        }
        
        //精度が問題ないか
        if(!isOK){
            throw "最大ループ回数(" + cvTermCriteria.max_iter + ")を超えましたが精度" + cvTermCriteria.eps + "が足りていません";
        }
    }
    catch(ex){
        alert("test_cvmTridiagonalization : " + ex);
        cvDWriteMatrix(rq, "変換mat");
        return false;
    }
    return true;
}

//cvmSVDの結果をテスト
//入力
//mat CvMat型 調べる行列
//isDraw bool型 計算途中の配列を描画するか
//cvTermCriteria CvTermCriteria型 計算精度
//test_cvTermCriteria CvTermCriteria型 計算が合っているかを確認する精度
//出力
//bool型 問題なければtrue
function test_cvmSVD(mat, isDraw, cvTermCriteria, test_cvTermCriteria){
	try{
		//バリデーション
        if(cvUndefinedOrNull(cvTermCriteria))
            cvTermCriteria = new CvTermCriteria();

        if(cvUndefinedOrNull(test_cvTermCriteria))
            test_cvTermCriteria = new CvTermCriteria();
        
        var WLR = cvmSVD(mat, cvTermCriteria);
        var W = WLR[0];
        var L = WLR[1];
        var R = WLR[2];
        
		//L,Rがユニタリー行列か
		if(isDraw) document.write("Lの大きさチェック<br/>");

		//列ベクトルの大きさチェック		
		for(var j = 0 ; j < L.cols ; j++){
		    var norm = 0;
		    for(var i = 0 ; i < L.rows ; i++){
		        norm += L.vals[j + i * L.cols] * L.vals[j + i * L.cols];
		    }
		    if(isDraw) document.write(norm + ", ");
		    
		    if(Math.abs(norm - 1) > test_cvTermCriteria.eps)
		    	return false;
		}
		if(isDraw) document.write("<br/><br/>");

		if(isDraw) document.write("Rの列の大きさ<br/>");
		for(var j = 0 ; j < R.cols ; j++){
		    var norm = 0;
		    for(var i = 0 ; i < R.rows ; i++){
		        norm += R.vals[j + i * R.cols] * R.vals[j + i * R.cols];
		    }
		    if(isDraw) document.write(norm + ", ");
		    
		    if(Math.abs(norm - 1) > test_cvTermCriteria.eps)
		    	return false;
		}
		if(isDraw) document.write("<br/><br/>");

		//直交性のチェック
		var ll = cvmMul(cvmTranspose(L), L);
		for(var i = 0 ; i < ll.rows*ll.cols ; i++){
		    if(ll.vals[i] < term.eps) ll.vals[i] = 0;
		}
		if(isDraw)cvDWriteMatrix(ll, "Lの直交性");
		
		for(var i = 0 ; i < ll.rows ; i++){
			for(var j = 0 ; j < ll.cols ; j++){
				if(Math.abs(ll.vals[j + i * ll.cols] - (i == j ? 1 : 0)) > test_cvTermCriteria.eps)
					return false;
			}
		}

		var rr = cvmMul(cvmTranspose(R), R);
		for(var i = 0 ; i < rr.rows*rr.cols ; i++){
		    if(rr.vals[i] < term.eps) rr.vals[i] = 0;
		}
		if(isDraw) cvDWriteMatrix(rr, "Rの直交性");
		
		for(var i = 0 ; i < rr.rows ; i++){
			for(var j = 0 ; j < rr.cols ; j++){
				if(Math.abs(rr.vals[j + i * rr.cols] - (i == j ? 1 : 0)) > test_cvTermCriteria.eps)
					return false;
			}
		}

        //元に戻るか
        if(isDraw) document.write("元に戻るか<br/>");
        var ai = cvmMul(cvmMul(L, W), cvmTranspose(R));
        
        if(isDraw) cvDWriteMatrix(ai, "LWRt");
        
        var sabun = cvmSub(mat, ai);
        for(var i = 0 ; i < sabun.rows*sabun.cols ; i++){
            if(sabun.vals[i] > test_cvTermCriteria.eps)
                return false;
        }

	}catch(ex){
		alert("testcvmSVD  " + ex);
	}
    
    return true;
}

//cvmLUの結果をテスト
//入力
//mat CvMat型 調べる行列
//isDraw bool型 計算途中の配列を描画するか
//test_cvTermCriteria CvTermCriteria型 計算が合っているかを確認する精度
//出力
//bool型 問題なければtrue
function test_cvmLU(mat, isDraw, test_cvTermCriteria){
    //バリデーション
    if(cvUndefinedOrNull(test_cvTermCriteria))
        test_cvTermCriteria = new CvTermCriteria();
    
    var LU = cvmLU(mat);
    var L = LU[0];
    var U = LU[1];
    
    if(isDraw) cvDWriteMatrix(L, "下三角行列");
    if(isDraw) cvDWriteMatrix(U, "上三角行列");

    for(var j = 0 ; j < L.cols - 1 ; j++){
        //下三角か
        for(var i = 0 ; i < j ; i++){
            if(Math.abs(L.vals[j + i * L.cols]) > test_cvTermCriteria.eps){
                return false;
            }
        }
        //上三角か
        for(var i = j + 1 ; i < U.rows ; i++){
            if(Math.abs(U.vals[j + i * U.cols]) > test_cvTermCriteria.eps){
                return false;
            }
        }
    }
    
    //元に戻るか
    if(isDraw) document.write("元に戻るか<br/>");
    var ai = cvmMul(L, U);
    
    if(isDraw) cvDWriteMatrix(ai, "LU");
    
    var sabun = cvmSub(mat, ai);
    
    for(var i = 0 ; i < sabun.rows*sabun.cols ; i++){
        if(sabun.vals[i] > test_cvTermCriteria.eps)
            return false;
    }
    
    return true;
}

//cvmLUの結果をテスト
//入力
//vec1 CvMat型 調べる行列
//vec2 CvMat型 調べる行列
//isDraw bool型 計算途中の配列を描画するか
//test_cvTermCriteria CvTermCriteria型 計算が合っているかを確認する精度
//出力
//bool型 問題なければtrue
function test_cvmHouseHolder(vec1, vec2, isDraw, test_cvTermCriteria){
    //バリデーション
    if(cvUndefinedOrNull(test_cvTermCriteria))
        test_cvTermCriteria = new CvTermCriteria();
    
    
    var hh = cvmHouseHolder(vec1, vec2);
    
    if(isDraw) cvDWriteMatrix(hh, "householder");
    
    //直交行列か
    var imat = cvmMul(hh, cvmTranspose(hh));
    
    if(isDraw){
        document.write("直交性のチェック<br/>");
        cvDWriteMatrix(imat, "h*ht");
    }
    
    for(var i = 0 ; i < imat.rows ; i++){
        for(var j = 0 ; j < imat.cols ; j++){
            if((i == j && Math.abs(imat.vals[j + i * imat.cols] - 1) > test_cvTermCriteria.eps)
               ||(i != j && Math.abs(imat.vals[j + i * imat.cols]) > test_cvTermCriteria.eps)){
                return false;
            }
        }
    }
    
    //差がないか
    if(isDraw) document.write("差がないか<br/>");
    
    var a = cvmMul(hh, vec1);
    var b = cvmMul(hh, vec2);
    
    if(isDraw) cvDWriteMatrix(a, "hh * vec1");
    if(isDraw) cvDWriteMatrix(b, "hh * vec2");
    
    var sabun = cvmSub(a, vec2);
    
    for(var i = 0 ; i < sabun.rows*sabun.cols ; i++){
        if(Math.abs(sabun.vals[i]) > test_cvTermCriteria.eps)
            return false;
    }
    
    sabun = cvmSub(b, vec1);
    
    for(var i = 0 ; i < sabun.rows*sabun.cols ; i++){
        if(Math.abs(sabun.vals[i]) > test_cvTermCriteria.eps)
            return false;
    }

    return true;
}

