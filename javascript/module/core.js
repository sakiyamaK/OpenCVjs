//------------------データ型------------------------
//canvasのRGBA値は0から255の値しかもてないため専用の画像データ型を用意
var IplImage = function(){
this.width = 0;
this.height = 0;
this.canvas = null;
this.imageData = null;
this.RGBA = null;
}

//行列だがrowsかcolsを1にすることでベクトルとしても扱う
var CvMat = function(){
this.rows = 0;
this.cols = 0;
this.vals = null;
}

//スパース行列
//本家のデータ構造とは大きく違う
var CvSparseMat = function(){
    this.rows = 0;
    this.cols = 0;
    this.vals = null;
}

var CvHistogram = function(){
this.type = 0;
this.bins = null;
this.thres = null;
this.thres2 = null;
this.mat = null;
this.ranges = null;
}

var CvScalar = function(){
    this.val = new Array(0, 0, 0, 255);
}

var CvPoint = function(){
this.x = 0;
this.y = 0;
}

var CvSize = function(){
this.width = 0;
this.height = 0;
}


//反復アルゴリズムの終了条件
var CvTermCriteria = function(){
type: 0; //CV_TERMCRIT定数の組み合わせ
max_iter: 0; //反復数の最大値
epsilon: 0; //目標精度
}

//------------------定数------------------------

//画像読み込み時に利用される変数
//任意のダミー画像のパスを指定
//1*1の画像を推奨
const DMY_IMG = "/module/dmy.jpg";
//チャンネル数
const CHANNELS = 4;


const CV_DEF_EPS = 0.00001;


//-----------------構造体------------------------

//反復アルゴリズムのための終了条件
//CvTermCriteria型の変数に利用する
var CV_TERMCRIT = {
ITER: 0,
NUMBER: 0,
EPS: 2
}

//ヒストグラムの種類
var CV_HIST = {
ARRAY: 0,
SPARSE: 1
}

//DFTの種類
var CV_DXT = {
FORWARD: 0, //順変換 スケーリングなし
INVERSE: 1, //逆変換 スケーリングなし
FORWARD_SCALE: 2, //順変換 スケーリングあり
INVERSE_SCALE: 3, //逆変換 スケーリングあり
}

//特異値分解のアルゴリズム
var CV_SVD = {
    ZERO : 0,
    MODIFY_A : 1,
    U_T : 2,
    V_T : 3
}

//ノルムの種類
var CV_NORM = {
    C : 0,
    L1 : 1,
    L2 : 2,
    L2Square : 3
}

//四則演算の種類
var FOUR_ARITHMETIC = {
    ADD : 0,
    SUB : 1,
    MULT : 2,
    DIV : 3
}

//逆行列の演算の種類
var CV_INV = {
LU: 0,
SVD: 1,
SVD_SYM: 2
}

//エラー文
var ERROR = {
    IS_UNDEFINED_OR_NULL : "がundefinedかnullです"
    ,DIFFERENT_SIZE : "IplImageサイズは全て同じにして下さい"
    ,DIFFERENT_ROWS_OR_COLS: "行と列が正しくありません"
    ,DIFFERENT_LENGTH: "の長さは全て同じにして下さい"
    ,INVALID_SIZE : "の長さが不正です"
    ,ONLY_ADD_NUMBER : "は奇数にして下さい"
    ,ONLY_INTERGER_NUMBER : "は整数にして下さい"
    ,ONLY_POSITIVE_NUMBER : "は正の値にして下さい"
    ,NOT_READ_FILE : "ファイルが読み込めません"
    ,NOT_GET_CONTEXT : "contextが読み込めません"
    ,PLEASE_SQUARE_MAT : "は正方行列にしてください"
    ,SWITCH_VALUE : "の値が正しくありません"
    ,APERTURE_SIZE : "aperture_sizeは1, 3, 5または7 のいずれかにしてください"
    ,ONLY_NUMBER : "は0から3にして下さい"
}




//--------------------------メソッド-------------------------

//rows行cols列の行列を作る
//C言語でいう a[rows][cols]
//入力
//rows 整数 (y座標)
//cols 整数 (x座標)
//出力
//CvMat型
function cvCreateMat(rows, cols){
    var rtn = null;
    try{
        if(cvUndefinedOrNull(rows) || cvUndefinedOrNull(cols))
            throw "rows or cols" + ERROR.IS_UNDEFINED_OR_NULL;
        //		if(!cvIsInt(rows) || !cvIsInt(cols) || rows < 1 || cols < 1)
        //			throw "rows or cols" + ERROR.ONLY_NORMAL_NUMBER;
        
        rtn = new CvMat();
        rtn.rows = rows;
        rtn.cols = cols;
        rtn.vals = new Array(rows * cols);
    }
    catch(ex){
        alert("cvCreateMat : " + ex);
    }
    
    return rtn;
}

//rows行cols列の単位行列を作る
//C言語でいう a[rows][cols]
//入力
//rows 整数 (y座標)
//cols 整数 (x座標)
//出力
//CvMat型
function cvCreateIdentityMat(rows, cols){
    var rtn = null;
    try{
        rtn = cvCreateMat(rows, cols);
        for(var i = 0 ; i < rows ; i++){
            var ir = i * rows;
            for(var j = 0 ; j < cols ; j++){
                rtn.vals[j + ir] = i == j ? 1 : 0;
            }
        }
    }
    catch(ex){
        alert("cvCreateIdentityMat : " + ex);
    }
    
    return rtn;
    
}

//CvMatのコピー
//入力
//mat CvMat型
//出力
//CvMat型
function cvmCopy(mat){
    var rtn = cvCreateMat(mat.rows, mat.cols);
    for(var i = 0 ; i < rtn.rows * rtn.cols ; i++){
        rtn.vals[i] = mat.vals[i];
    }
    return rtn;
}


//行列に値を代入
//入力
//mat CvMat型 代入される行列
//row 整数 代入する行番号(y座標)
//col 整数 代入する列番号(x座標)
//val 数値 代入される値
//出力
//なし
function cvmSet(mat, row, col, value){
    try{
        if(cvUndefinedOrNull(mat) || cvUndefinedOrNull(value)||
           cvUndefinedOrNull(row) || cvUndefinedOrNull(col))
            throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
        
        mat.vals[col + row * mat.cols] = value;
    }
    catch(ex){
        alert("cvmSet : " + ex);
    }
}

//行列から値を取得
//入力
//mat CvMat型 取得される行列
//row 整数 取得する行番号(y座標)
//col 整数 取得する列番号(x座標)
//出力
//数値
function cvmGet(mat, row, col){
    var rtn = null;
    try{
        if(cvUndefinedOrNull(mat) || cvUndefinedOrNull(row) || cvUndefinedOrNull(col))
            throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
        
        rtn = mat.vals[col + row * mat.cols];
    }
    catch(ex){
        alert("cvmGet : " + ex);
    }
    return rtn;
}

//行列の足し算
//入力
//matA CvMat型 足す行列
//matB CvMat型 足される行列
//出力
//CvMat型 結果が代入される行列
function cvmAdd(matA, matB){
    var matX = null;
    try{
        if(cvUndefinedOrNull(matA) || cvUndefinedOrNull(matB))
            throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
        if(matA.rows != matB.rows || matA.cols != matB.cols)
            throw "引数の" + ERROR.DIFFERENT_SIZE;
        
        matX = cvCreateMat(matA.rows, matA.cols);
        
        for(var i = 0 ; i < matX.rows ; i++){
            var im = i * matX.cols;
            for(var j = 0 ; j < matX.cols ; j++){
                var ji = j + im;
                matX.vals[ji] = matA.vals[ji] + matB.vals[ji];
            }
        }
    }
    catch(ex){
        alert("cvmAdd : " + ex);
    }
    
    return matX;
}

//行列の引き算
//入力
//matA CvMat型 引く行列
//matB CvMat型 引かれる行列
//出力
//CvMat型 結果が代入される行列
function cvmSub(matA, matB){
    
    var matX = null;
    try{
        if(cvUndefinedOrNull(matA) || cvUndefinedOrNull(matB))
            throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
        if(matA.rows != matB.rows || matA.cols != matB.cols)
            throw "引数の" + ERROR.DIFFERENT_SIZE;
        
        matX = cvCreateMat(matA.rows, matA.cols);
        
        for(var i = 0 ; i < matX.rows ; i++){
            var im = i * matX.cols;
            for(var j = 0 ; j < matX.cols ; j++){
                var ji = j + im;
                matX.vals[ji] = matA.vals[ji] - matB.vals[ji];
            }
        }
    }
    catch(ex){
        alert("cvmSub : " + ex);
    }
    
    return matX;
}

//行列の掛け算
//入力
//matA CvMat型 掛ける行列
//matB CvMat型 掛けられる行列
//出力
//CvMat型 結果が代入される行列
function cvmMul(matA, matB){
    
    var matX = null;
    
    try{
        if(cvUndefinedOrNull(matA) || cvUndefinedOrNull(matB))
            throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
        if(matA.cols != matB.rows)
            throw "引数" + ERROR.DIFFERENT_ROWS_OR_COLS;
        
        matX = cvCreateMat(matA.rows, matB.cols);
        
        for(var i = 0 ; i < matX.rows ; i++){
            var im = i * matX.cols;
            var imA = i * matA.cols;
            for(var j = 0 ; j < matX.cols ; j++){
                var v = 0;
                for(var l = 0 ; l < matA.cols ; l++)
                    v += matA.vals[l + imA] * matB.vals[j + l * matB.cols];
                matX.vals[j + im] = v;
            }
        }
    }
    catch(ex){
        alert("cvmMul : " + ex);
    }
    
    return matX;
}

//行列の転置
//入力
//matA CvMat型 転置される行列
//出力
//CvMat型 結果が代入される行列
function cvmTranspose(matA){
    var matX = null;
    try{
        if(cvUndefinedOrNull(matA))
            throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
        
        matX = cvCreateMat(matA.cols, matA.rows);
        
        for(var i = 0 ; i < matX.rows ; i++){
            var im = i * matX.cols;
            var jm = i;
            for(var j = 0 ; j < matX.cols ; j++){
                matX.vals[j + im] = matA.vals[jm];
                jm += matA.cols;
            }
        }
    }
    catch(ex){
        alert("cvmTranspose : " + ex);
    }
    return matX;
}

//mat1 - mat2の行列のノルムを計算する
//入力
//mat1 CvMat型　1番目の行列
//mat2 CvMat型 2番目の行列 nullならmat1だけでノルム計算
//normType CV_NORM型 ノルムのタイプ
//mask CvMat型 マスクの行列(現在は利用不可)
//出力
//ノルムの計算結果
function cvmNorm(mat1, mat2, normType, mask){
    var rtn = 0;
    try{
        if(cvUndefinedOrNull(mat1))
            throw "mat1" + ERROR.IS_UNDEFINED_OR_NULL;
        if(!cvUndefinedOrNull(mat2) && (mat1.rows != mat2.rows || mat1.cols != mat2.cols))
            throw "mat1 と mat2" + ERROR.DIFFERENT_ROWS_OR_COLS;
        
        switch(normType){
            case CV_NORM.C:
                if(cvUndefinedOrNull(mat2)){
                    rtn = Math.abs(mat1.vals[0]);
                    for(var i = 0 ; i < mat1.rows ; i++){
                        var ir = i * mat1.rows;
                        for(var j = 0 ; j < mat1.cols ; j++){
                            if(rtn < Math.abs(mat1.vals[j + ir])){
                                rtn = Math.abs(mat1.vals[j + ir]);
                            }
                        }
                    }
                }
                else{
                    rtn = Math.abs(mat1.vals[0] - mat2.vals[0]);
                    for(var i = 0 ; i < mat1.rows ; i++){
                        var ir = i * mat1.rows;
                        for(var j = 0 ; j < mat1.cols ; j++){
                            if(rtn < Math.abs(mat1.vals[j + ir] - mat2.vals[j + ir])){
                                rtn = Math.abs(mat1.vals[j + ir] - mat2.vals[j + ir]);
                            }
                        }
                    }
                    
                }
                break;
            case CV_NORM.L1:
                if(cvUndefinedOrNull(mat2)){
                    var length = mat1.rows * mat1.cols;
                    for(var i = 0 ; i < length ; i++){
                        rtn += mat1.vals[i];
                    }
                }
                else{
                    var length = mat1.rows * mat1.cols;
                    for(var i = 0 ; i < length ; i++){
                        rtn += Math.abs(mat1.vals[i] - mat2.vals[i]);
                    }
                }
                break;
            case CV_NORM.L2:
            case CV_NORM.L2Square:
                if(cvUndefinedOrNull(mat2)){
                    var length = mat1.rows * mat1.cols;
                    for(var i = 0; i < length ; i++){
                        rtn += mat1.vals[i] * mat1.vals[i];
                    }
                    if(normType == CV_NORM.L2){
                        rtn = Math.sqrt(rtn);
                    }
                }
                else{
                    var length = mat1.rows * mat1.cols;
                    for(var i = 0; i < length ; i++){
                        var v = mat1.vals[i] - mat2.vals[i];
                        rtn += v * v;
                    }
                    if(normType == CV_NORM.L2){
                        rtn = Math.sqrt(rtn);
                    }
                }
                break;
            default:
                throw "normTypeがサポートされていない値を設定しています";
                break;
        }
    }
    catch(ex){
        alert("cvmNorm : " + ex);
    }
    
    return rtn;
}

//ベクトルの内積を求める
//ひとつめのCvMatのrows行を横ベクトル、ふたつめのCvMatのcols列を縦ベクトルと見立てて内積を求める
//入力
//mat1 CvMat型 横ベクトルに見立てるひとつめの行列
//rows int型 mat1の行番号
//mat2 CvMat型 縦ベクトルに見立てるふたつめの行列
//cols int型 mat2の列番号
//出力
//内積の計算結果
function cvmDot(mat1, rows, mat2, cols){
    
    var rtn = -1;
    
    try{
        if(cvUndefinedOrNull(mat1) || cvUndefinedOrNull(mat2))
            throw "mat1またはmat2" + ERROR.IS_UNDEFINED_OR_NULL;
        if(rows < 0 || cols < 0 || mat1.rows - 1 < rows || mat2.cols - 1 < cols)
            throw "mat1かmat2の指定された行か列が範囲外です";
        
        if(mat1.cols != mat2.rows)
            throw "mat1とmat2の長さが違います";
        
        rtn = 0;
        for(var i = 0 ; i < mat1.cols ; i++)
            rtn += mat1.vals[i + rows * mat1.cols] * mat2.vals[cols + i * mat2.cols];
    }
    catch(ex){
        alert("cvmDot : " + ex);
    }
    
    return rtn;
}

//逆行列の演算
//入力
//mat CvMat型 逆行列を求める行列
//method CV_INV配列 アルゴリズムの種類
//出力
//CvMat型　求まった行列が代入される行列
function cvmInverse(mat, method){
    var invMat = null;
    try{
        if(cvUndefinedOrNull(mat))
            throw "mat" + ERROR.IS_UNDEFINED_OR_NULL;
        if(cvUndefinedOrNull(method)) method = CV_INV.LU;
        if(method == CV_INV.SVD_SYM)
            throw "CV_INV.SVD_SYM は現在サポートされていません";
        
        invMat = cvCreateMat(mat.rows, mat.cols);
        
        switch(method){
            case CV_INV.LU:
                if(mat.cols != mat.rows)
                    throw "CV_INV.LUの場合、mat" + PLEASE_SQUARE_MAT;
                
                //前進代入
                function Lforwardsubs(L, b, y){
                    for(var i = 0 ; i < L.rows ; i++)
                        y.vals[i * y.cols] = b.vals[i * b.cols];
                    
                    for(var i = 0 ; i < L.rows ; i++){
                        y.vals[i * y.cols] /= L.vals[i + i * L.cols];
                        for(var j = i + 1 ; j < L.cols ; j++){
                            y.vals[j * y.cols] -= y.vals[i * y.cols] * L.vals[ i + j * L.cols];
                        }
                    }
                }
                //後退代入
                function Ubackwardsubs(U, y, x){
                    for(var i = 0 ; i < U.rows; i++)
                        x.vals[i * x.cols] = y.vals[i * y.cols];
                    
                    for(var i = U.rows-1 ; i >= 0; i--){
                        x.vals[i * x.cols] /= U.vals[i + i * U.cols];
                        for(var j = i-1 ; j >= 0 ; j--){
                            x.vals[j * x.cols] -= x.vals[i * x.cols] * U.vals[i + j * U.cols];
                        }
                    }
                }
                
                // -- matのLU分解 --
                var L = cvCreateMat(mat.rows, mat.cols);
                var U = cvCreateMat(mat.rows, mat.cols);
                cvLU(mat, L, U);
                
                for(var i = 0 ; i < mat.cols ; i++)
                {
                    var initVec = cvCreateMat(mat.rows, 1);
                    for(var v = 0 ;  v < mat.rows ; v++)
                        initVec.vals[v] = (v == i) ? 1 : 0 ;
                    
                    var dmyVec = cvCreateMat(mat.rows, 1);
                    var inverseVec = cvCreateMat(mat.rows, 1);
                    
                    Lforwardsubs(L, initVec, dmyVec);
                    Ubackwardsubs(U, dmyVec, inverseVec);
                    
                    for(var v = 0 ; v < mat.rows ; v++){
                        invMat.vals[i + v * invMat.cols] = inverseVec.vals[v * inverseVec.cols];
                    }
                }
                
                break;
            case CV_INV.SVD:
                
                break;
            case CV_INV.SVD_SYM: break;
        }
    }
    catch(ex){
        alert("cvmInverse : " + ex);
    }
    
    return invMat;
}

//特異値分解の演算
//入力
//A CvMat型 特異値分解される行列(M*N)
//flags
//出力
//[W, U, V]
//W CvMat型 特異値行列の結果(M*NまたはN*N)
//U CvMat型 左直交行列(M*MまたはM*N)
//V CvMat型 右直交行列(N*N)
function cvmSVD(A, flags){
    
    var rtn = null;
    try{
        if(cvUndefinedOrNull(A))
            throw "第一引数" + ERROR.IS_UNDEFINED_OR_NULL;
        if(cvUndefinedOrNull(flags)) flags = CV_SVD.ZERO;
        
        switch(flags){
            case CV_SVD.ZERO:
            {
                var trA = cvmTranspose(A);
                
                var AtA = cvmMul(trA, A);
                var AAt = cvmMul(A, trA);
                
                var ee1 = cvmEigen(AtA);
                var ee2 = cvmEigen(AtA);
                
                //A^tAの固有ベクトルが左特異ベクトル
                var U = cvmCopy(ee1[1]);
                
                //AA^tの固有ベクトルの転置が右特異ベクトル
                var V = cvmCopy(cvmTranspose(ee2[1]));
                
                
                //A^tAの0以上の固有値の平方根が特異値になる
                var eValues = ee1[0];
                var t = eValues.rows;
                for(var i = 0 ; i < eValues.rows ; i++){
                    if(eValues.vals[i] < 0){
                        t = i;
                        break;
                    }
                }
                
                var W = cvCreateMat(t, 1);
                
                for(var i = 0 ; i < W.rows ; i++){
                    W.vals[i] = Math.sqrt(eValues.vals[i]);
                }
                
                rtn = [W, U, V];
                
            }
                break;
                
            default:
                throw "flagsはCV_SVD.ZEROしか現在サポートされていません";
                break;
        }
    }
    catch(ex){
        alert("cvmSVD : " + ex);
    }
    
    return rtn;
}

//LU分解の演算
//入力
//mat CvMat型 LU分解される行列
//L CvMat型 Lの結果が代入される行列
//U CvMat型 Uの結果が代入される行列
//出力
//なし
function cvmLU(mat, L, U){
    try{
        if(cvUndefinedOrNull(mat) || cvUndefinedOrNull(L)  || cvUndefinedOrNull(U) )
            throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
        if(mat.rows != mat.cols || mat.rows == 0 || mat.cols == 0 ||
           L.rows != L.cols || L.rows == 0 || L.cols == 0 ||
           U.rows != U.cols || U.rows == 0 || U.cols == 0 ||
           mat.rows != L.rows || mat.rows != U.rows ||
           mat.cols != L.cols || mat.cols != U.cols)
            throw "全ての引数" + ERROR.PLEASE_SQUARE_MAT + " かつ 行列数は同じにして下さい";
        
        //初期化
        for(var i=0; i < mat.rows; i++){
            for(var j=0; j < mat.cols; j++){
                L.vals[j + i * L.cols] = 0;
                U.vals[j + i * U.cols] = 0;
                if(i==j) L.vals[j + i * L.cols]=1.0;
            }
        }
        
        var sum;
        for(var i=0; i < mat.rows; i++){
            for(var j=0; j < mat.cols; j++){
                if( i > j ){
                    //-- L成分を求める --
                    sum=0.0;
                    for(var k=0; k < j; k++){
                        sum+=L.vals[k + i * L.cols] * U.vals[j + k * U.cols];
                    }
                    L.vals[j + i * L.cols] = (mat.vals[j + i * mat.cols] - sum) / U.vals[j + j * U.cols];
                }else{
                    // --U成分を求める--
                    sum=0.0;
                    for(var k=0;k<i;k++){
                        sum+=L.vals[k + i * L.cols] * U.vals[j + k * U.cols];
                    }
                    U.vals[j + i * U.cols]=mat.vals[j + i * mat.cols] - sum;
                }
            }
        }
    }
    catch(ex){
        alert("cvmLU : " + ex);
    }
}

//行列式の演算
//入力
//mat CvMat型　行列式を求める行列
//出力
//演算結果
function cvmDet(mat){
    var rtn = null;
    try{
        if(cvUndefinedOrNull(mat))
            throw "mat" + ERROR.IS_UNDEFINED_OR_NULL;
        if(mat.rows != mat.cols || mat.rows == 0 || mat.cols == 0)
            throw "mat" + ERROR.PLEASE_SQUARE_MAT;
        
        if(mat.cols == 1) rtn = cvmGet(mat, 0, 0);
        if(mat.cols == 2){
            rtn = mat.vals[0] * mat.vals[1 + 1 * mat.cols];
            rtn -= mat.vals[1] * mat.vals[1 * mat.cols];
        }
        else if(mat.cols == 3){
            rtn = mat.vals[0] * mat.vals[1 + 1 * mat.cols] * mat.vals[2 + 2 * mat.cols];
            rtn += mat.vals[1 * mat.cols] * mat.vals[1 + 2 * mat.cols] * mat.vals[2];
            rtn += mat.vals[2 * mat.cols] * mat.vals[1] * mat.vals[2 + 1 * mat.cols];
            rtn -= mat.vals[2 * mat.cols] * mat.vals[1 + 1 * mat.cols] * mat.vals[2];
            rtn -= mat.vals[1 * mat.cols] * mat.vals[1] * mat.vals[2 + 2 * mat.cols];
            rtn -= mat.vals[0] * mat.vals[1 + 2 * mat.cols] * mat.vals[2 + 1 * mat.cols];
        }
        else{
            rtn = 1;
            var buf;
            //三角行列作成
            for(var i = 0 ; i < mat.rows ; i++){
                for(var j = 0; j < mat.cols ; j++){
                    if(i < j){
                        buf = mat.vals[ i + j * mat.cols ] / mat.vals[ i + i * mat.cols ];
                        for(var k = 0 ; k < mat.cols ; k++)
                            mat.vals[k + j * mat.cols] -= mat.vals[k + i * mat.cols] * buf;
                    }
                }
            }
            //対角部分の積
            for(var i = 0 ; i < mat.rows ; i++){
                rtn *= mat.vals[i + i * mat.cols];
            }
        }
    }
    catch(ex){
        alert("cvmDet : " + ex);
    }
    
    return rtn;
}

//householder法
//入力
//vec1 CvMat型 rowsかcolsが1の行列 = ベクトル
//vec2 CvMat型 vec1と同じ大きさの行列 = ベクトル
//出力
//householder行列
//備考
//householder行列をhhとする
//hh * vec1 = vec2
//hh * vec2 = vec1
//hh = hh^t = hh^-1
//hh * hh = I
function cvmHouseHolder(vec1, vec2){
    var rtn = null;
    try{
        if(cvUndefinedOrNull(vec1) || cvUndefinedOrNull(vec2)){
            throw "vec1 or vec2" + ERROR.IS_UNDEFINED_OR_NULL;
        }
        if(vec1.rows != vec2.rows || vec1.cols != vec2.cols){
            throw "vec1とvec2" + ERROR.DIFFERENT_ROWS_OR_COLS;
        }
        //横ベクトル同士か縦ベクトル同士か判断
        var isRowVec = true;
        var length = vec1.rows;
        if(vec1.rows == 1){
            isRowVec = false;
            length = vec1.cols;
        }
        else if(vec1.cols != 1){
            throw "vec1 and vec2 はベクトルではありません";
        }
        
        //単位行列
        var im = cvCreateIdentityMat(length, length);
        
        //差分のノルムの２乗
        var dstV = cvmSub(vec1, vec2);
        var dstNrm2 = cvmNorm(dstV, null, CV_NORM.L2Square);
        
        if(dstNrm2 == 0){
            return im;
        }
        
        //dstVとdstV^tの掛け算をし、その結果をノルムの２乗で割り、２倍する
        var dstMat = cvCreateMat(length, length);
        for(var i = 0 ; i < length ; i++){
            for(var j = 0 ; j < length ; j++){
                dstMat.vals[j + i * length] = dstV.vals[i] * dstV.vals[j] / dstNrm2 * 2;
            }
        }
        //単位行列からひく
        rtn = cvmSub(im, dstMat);
    }
    catch(ex){
        alert("cvmHouseHolder : " + ex);
    }
    
    return rtn;
}


//QR分解
//入力
//mat CvMat型 QR分解する行列
//出力
//[Q, R] 配列内のデータはそれぞれCvMat型
function cvmQR(mat){
    var rt = null;
    try{
        if(cvUndefinedOrNull(mat))
            throw "mat" + ERROR.IS_UNDEFINED_OR_NULL;
        
        var rank = cvmRank(mat);
        if(rank != mat.cols)
            throw "matの列数とrankが合いません";
        
        var Q = cvCreateIdentityMat(mat.rows, mat.rows);
        var R = cvCreateMat(mat.rows, mat.cols);
        for(var i = 0 ; i < mat.rows * mat.cols ; i++)
            R.vals[i] = mat.vals[i];
        
        //rank回のループによりQR分館
        for(var r = 0 ; r < rank - 1 ; r++){
            //r列目のr行目からmat.rowsまでのノルム
            var norm = 0;
            for(var i = r ; i < mat.rows ; i++)
                norm += R.vals[r + i * mat.cols] * R.vals[r + i * mat.cols];
            norm = Math.sqrt(norm);
            
            //ハウスホルダー変換を行う列ベクトルを取り出す
            var vec1 = cvCreateMat(mat.rows - r, 1);
            for(var i = 0 ; i < vec1.rows ; i++)
                vec1.vals[i] = R.vals[r + (r + i) * R.cols];
            //ハウスホルダー変換に使うvec2を準備
            var vec2 = cvCreateMat(vec1.rows, 1);
            vec2.vals[0] = norm;
            for(var i = 1 ; i < vec2.rows ; vec2.vals[i++] = 0);
            
            //ハウスホルダー変換
            var hh = cvmHouseHolder(vec1, vec2);
            
            //QR分解する位置にhhを代入
            var H = cvCreateIdentityMat(R.rows, R.rows);
            var p = H.rows - hh.rows;
            for(var i = 0 ; i < hh.rows ; i++){
                for(var j = 0 ; j < hh.cols ; j++){
                    H.vals[p + j + (p + i) * H.cols] = hh.vals[j + i * hh.cols];
                }
            }
            
            R = cvmMul(H, R);
            Q = cvmMul(H, Q);
        }
        
        rtn = [cvmTranspose(Q), R];
        
    }
    catch(ex){
        alert("cvmQR : " + ex);
    }
    
    return rtn;
}

//正則行列の固有値及び固有ベクトルを求める
//入力
//mat CvMat型 固有値と固有ベクトルを求める正則行列
//eps double型 対角化の精度 デフォルト CV_DEF_EPS
//maxLoop int型 対角化の精度を出すための無限ループの最大回数 デフォルト = mat.rows * 2;
//出力
//[eValues, eVects]
//eValues CvMat型 固有値が大きい順に並ぶ1列(行)の行列(つまりベクトル)
//eVects CvMat型 固有ベクトル
function cvmEigen(mat, eps, maxLoop){
    var rtn = null;
    try{
        if(cvUndefinedOrNull(mat))
            throw "mat" + ERROR.IS_UNDEFINED_OR_NULL;
        if(mat.rows != mat.cols || mat.rows == 0 || mat.cols == 0)
            throw "mat" + ERROR.PLEASE_SQUARE_MAT;
        
        //正則化のチェック
        for(var i = 0 ; i < mat.rows ; i++){
            for(var j = i + 1 ; j < mat.cols ; j++){
                if(mat.vals[j + i * mat.cols] != mat.vals[i + j *mat.cols]){
                    throw "matは正則行列ではありません";
                }
            }
        }
        
        //精度の値を確認
        if(cvUndefinedOrNull(eps))
            eps = CV_DEF_EPS;
        
        //最大ループの値を確認
        if(cvUndefinedOrNull(maxLoop))
            maxLoop = mat.rows * 2;
        
        //オリジナルの配列をコピー
        var rq = cvCreateMat(mat.rows, mat.cols);
        for(var i = 0 ; i < mat.rows * mat.cols ; i++)
            rq.vals[i] = mat.vals[i];
        
        
        //固有ベクトル
        var eVects = cvCreateIdentityMat(mat.rows, mat.rows);
        
        //---QR法による三重対角化---
        var loop = 0;
        while(true){
            var qr = cvmQR(rq);
            eVects = cvmMul(eVects, qr[0]);
            rq = cvmMul(qr[1],qr[0]);
            
            //精度のチェック
            var isOK = true;
            for(var i = 0 ; i < rq.rows ; i++){
                for(var j = 0; j < rq.cols ; j++){
                    //三重対角化の値のある部分なら次へ
                    if(i - 1 == j || i == j || i + 1 == j)
                        continue;
                    //閾値より大きければチェックの終わり
                    if(Math.abs(rq.vals[j + i * rq.cols]) > eps){
                        isOK = false;
                        break;
                    }
                }
                //閾値より大きい値があった場合はfor文を抜ける
                if(!isOK)
                    break;
            }
            
            loop++;
            if(isOK || loop > maxLoop) break;
        }
        
        //固有値を代入
        var eValues = cvCreateMat(rq.rows, 1);
        for(var i = 0 ; i < eValues.rows; i++){
            eValues.vals[i] = rq.vals[i + i * rq.cols];
        }
        
        //降順に並び替え
        for(var i = 0 ; i < eValues.rows ; i++){
            //最大値のindexを探索
            var maxV = eValues.vals[i];
            var maxIndex = i;
            for(var j = i + 1 ; j < eValues.rows; j++){
                if(maxV < eValues.vals[j]){
                    maxV = eValues.vals[j];
                    maxIndex = j;
                }
            }
            
            //固有値を入れ替える
            var tmp = eValues.vals[i];
            eValues.vals[i] = eValues.vals[maxIndex];
            eValues.vals[maxIndex] = tmp;
            
            //固有ベクトルを入れ替える
            for(var y = 0 ; y < eVects.rows ; y++){
                tmp = eVects.vals[i + y * eVects.cols];
                eVects.vals[i + y * eVects.cols] = eVects.vals[maxIndex + y * eVects.cols];
                eVects.vals[maxIndex + y * eVects.cols] = tmp;
            }
            
        }
        
        rtn = [eValues, eVects];
    }
    catch(ex){
        alert("cvmEigen : " + ex);
    }
    
    return rtn;
}

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

//行列のrankを求める
function cvmRank(org, eps){
    
    var rtn = -1;
    try{
        if(cvUndefinedOrNull(eps))
            eps = CV_DEF_EPS;
        
        var mat = cvmCopy(org);
        for(var k = 0; k < mat.rows; k++){
            var p = mat.vals[k + k * mat.cols];//ピボット係数
            if(p == 0){
                //入れ替える
                for(var kk = k + 1 ; kk < mat.rows ; kk++){
                    if(Math.abs(mat.vals[k + kk * mat.cols]) > eps){
                        p = mat.vals[k + kk * mat.cols];
                        for(var i = 0 ; i < mat.cols ; i++){
                            var tmp = mat.vals[i + k * mat.cols];
                            mat.vals[i + k * mat.cols] = mat.vals[i + kk * mat.cols];
                            mat.vals[i + kk * mat.cols] = tmp;
                        }
                        break;
                    }
                }
                //入れ替える要素がない場合は次へ
                if(p == 0){
                    break;
                }
            }
            
            for (var i = k; i <  mat.cols; i++)
                mat.vals[i + k * mat.cols] /= p;  // ピボット係数を１にするためピボット行を割り算
            
            for (var i = 0; i < mat.rows; i++){// ピボット列の掃き出し
                if(i != k){
                    var d = mat.vals[k + i * mat.cols];
                    for(var j = k; j < mat.cols; j++)
                        mat.vals[j + i * mat.cols] -= d * mat.vals[j + k * mat.cols];
                }
            }
        }
        
        rtn = -1;
        for(var i = 0 ; i < mat.rows; i++){
            for(var j = 0 ; j < mat.cols; j++){
                if(Math.abs(mat.vals[j + i * mat.cols]) > eps){
                    break;
                }
                if(j == mat.cols - 1){
                    rtn = i;
                    break;
                }
            }
            if(rtn != -1){
                break;
            }
            else if(i == mat.rows - 1){
                rtn = mat.rows;
                break;
            }
        }
        
    }
    catch(ex){
        alert("cvmRank : " + ex);
    }
    
    return rtn;
}

//row行cols列の疎行列を作る
//入力
//rows 整数 (y座標)
//cols 整数 (x座標)
//出力
//CvMat型
//備考
//内部のvalssは{row:row, col:col, value:value}オブジェクトの配列
//valssの座標以外は全て0を意味する
function cvCreateSparseMat(rows, cols){
    var rtn = new CvSparseMat();
    rtn.rows = rows;
    rtn.cols = cols;
    rtn.vals = new Array();
    
    return rtn;
}

//スパース行列に値を代入(基本的にスパース行列へ値を代入するにはこのメソッドを使う)
//入力
//smat CvSparseMat型 値が追加/変更されるスパース行列
//row int型  値を追加/変更するrow座標
//col int型  値を追加/変更するcol座標
//value double 型 追加/変更する値
function cvSparseMatSet(smat, row, col, value){
    try{
        if(cvUndefinedOrNull(smat) || cvUndefinedOrNull(value)||
           cvUndefinedOrNull(row) || cvUndefinedOrNull(col))
            throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
        
        if(smat.rows - 1 < row || smat.cols - 1 < col ||
           row < 0 || col < 0)
            throw "引数の値が不正です";
        //変更
        for(var i = 0 ; i < smat.vals.length ; i++){
            if(smat.vals[i].row == row && smat.vals[i].col == col){
                smat.vals[i].value = value;
                return;
            }
        }
        
        //追記
        smat.vals.push({row:row, col:col, value:value});
    }
    catch(ex){
        alert("cvSparseMatset : " + ex);
    }
}

//チャンネルを合成する
//入力
//src0 IplImage型 dstの0チャンネルに合成される
//src1 IplImage型 dstの1チャンネルに合成される
//src2 IplImage型 dstの2チャンネルに合成される
//src3 IplImage型 dstの3チャンネルに合成される
//dst IplImage型 合成した画像
//出力
//なし
//解説
//各srcの0チャンネルの値が合成される
function cvMerge(src0, src1, src2, src3, dst){
    try{
        if(cvUndefinedOrNull(src0) || cvUndefinedOrNull(src1) ||
           cvUndefinedOrNull(src2) ||	cvUndefinedOrNull(src3) || 	cvUndefinedOrNull(dst) )
            throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
        if(dst.width != src0.width || dst.width != src1.width ||
           dst.width != src2.width || dst.width != src3.width ||
           dst.height != src0.height || dst.height != src1.height ||
           dst.height != src2.height || dst.height != src3.height)
            throw "IplImageの大きさを統一してください";
        
        for(var c = 0 ; c < CHANNELS ; c++){
            var src;
            switch(c){
                case 0 : src = src0; break;
                case 1 : src = src1; break;
                case 2 : src = src2; break;
                case 3 : src = src3; break;
            }
            
            for(var i = 0 ; i < src.height ; i++){
                var is = i * src.width * CHANNELS;
                var js = 0;
                for(var j = 0 ; j < src.width ; j++){
                    dst.RGBA[c + js + is] = src.RGBA[js + is];
                    js += CHANNELS;
                }
            }
        }
    }
    catch(ex){
        alert("cvMerge : " + ex);
    }
}

//チャンネルを分割する
//入力
//src IplImage型 原画像
//dst0 IplImage型 srcのチャンネル0が代入される
//dst1 IplImage型 srcのチャンネル1が代入される
//dst2 IplImage型 srcのチャンネル2が代入される
//dst3 IplImage型 srcのチャンネル3が代入される
//出力
//なし
//解説
//分割されたチャンネルは各dstの0～3チャンネル全てに代入される
function cvSplit(src, dst0, dst1, dst2, dst3){
    try{
        if(cvUndefinedOrNull(src) || cvUndefinedOrNull(dst0) ||
           cvUndefinedOrNull(dst1) ||	cvUndefinedOrNull(dst2) || 	cvUndefinedOrNull(dst3) )
            throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
        if(src.width != dst0.width || src.width != dst1.width ||
           src.width != dst2.width || src.width != dst3.width ||
           src.height != dst0.height || src.height != dst1.height ||
           src.height != dst2.height || src.height != dst3.height)
            throw "IplImageの大きさを統一してください";
        
        for(var c = 0 ; c < CHANNELS ; c++){
            var dst;
            switch(c){
                case 0 : dst = dst0; break;
                case 1 : dst = dst1; break;
                case 2 : dst = dst2; break;
                case 3 : dst = dst3; break;
            }
            
            for(var i = 0 ; i < src.height ; i++){
                var is = i * src.width * CHANNELS;
                var js = 0;
                for(var j = 0 ; j < src.width ; j++){
                    dst.RGBA[js + is] = src.RGBA[c + js + is];
                    dst.RGBA[1 + js + is] = src.RGBA[c + js + is];
                    dst.RGBA[2 + js + is] = src.RGBA[c + js + is];
                    dst.RGBA[3 + js + is] = 255;
                    js += CHANNELS;
                }
            }
        }
    }
    catch(ex){
        alert("cvSplit : " + ex);
    }
}


//最大値と最小値とその座標を求める
//入力
//src IplImage型 計算対象となる画像
//min_val 数値型の配列 要素数4 RGB表色系ならばr,g,b,aの最小値が入る
//max_val 数値型の配列 要素数4 RGB表色系ならばr,g,b,aの最大値が入る
//min_locs CvPoint型の配列 要素数4 RGB表色系ならばr,g,b,aの最小値のピクセルの座標が入る
//max_locs CvPoint型の配列 要素数4 RGB表色系ならばr,g,b,aの最大値のピクセルの座標が入る
//mask IplImage型 0か255のマスク画像 省略可
//出力
//なし
function cvMinMaxLoc(src, min_val, max_val, min_locs, max_locs, mask){
    
    try{
        if(cvUndefinedOrNull(src) ||
           cvUndefinedOrNull(min_val) || cvUndefinedOrNull(max_val) ||
           cvUndefinedOrNull(min_locs) || cvUndefinedOrNull(max_locs))
            throw "src or min_val or max_val or min_locs or max_locs " + ERROR.IS_UNDEFINED_OR_NULL;
        for(var i = 0 ; i < min_locs.length ; i++)
            if(cvUndefinedOrNull(min_locs[i])) throw "min_locs[" + i + "]" + ERROR.IS_UNDEFINED_OR_NULL;
        for(var i = 0 ; i < max_locs.length ; i++)
            if(cvUndefinedOrNull(max_locs[i])) throw "max_locs[" + i + "]" + ERROR.IS_UNDEFINED_OR_NULL;
        
        if(cvUndefinedOrNull(mask)) mask = 0;
        if(mask != 0) throw "mask は現在サポートされていません";
        
        for(var c = 0 ; c < CHANNELS ; c++){
            min_val[c] = src.RGBA[c];
            max_val[c] = src.RGBA[c];
            min_locs[c].x = 0 ;
            min_locs[c].y = 0;
            max_locs[c].x = 0 ;
            max_locs[c].y = 0;
            for(var i = 0 ; i < src.height ; i++){
                for(var j = 0 ; j < src.width ; j++){
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

//画像の画素の合計値
//入力
//src IplImage型 計算対象となる画像
//出力
//CvScalar型 RGB表色系ならr,g,b,aの結果が代入されている
function cvSum(src){
    var rtn = null;
    try{
        if(cvUndefinedOrNull(src)) throw "src" + ERROR.IS_UNDEFINED_OR_NULL;
        
        rtn = new CvScalar();
        
        for(var k = 0 ; k < rtn.length ; rtn[k++] = 0);
        
        for(var i = 0 ; i < src.height ; i++){
            for(var j = 0 ; j < src.width ; j++){
                for(var c = 0 ; c < CHANNELS ; c++)
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
//CvScalar型 RGB表色系ならr,g,b,aの結果が代入されている
function cvAvg(src, mask){
    var rtn = null;
    try{
        if(cvUndefinedOrNull(src)) throw "src" + ERROR.IS_UNDEFINED_OR_NULL;
        if(cvUndefinedOrNull(mask)) mask = 0;
        if(mask != 0) throw "mask は現在サポートされていません";
        
        rtn = cvSum(src);
        var len = src.width * src.height;
        
        for(var k = 0 ; k < rtn.length ; rtn[k++] /= len);
        
    }
    catch(ex){
        alert("cvAvg : " + ex);
    }
    
    return rtn;
}

//画像の画素の平均値と分散を求める
//入力
//src IplImage型 計算対象となる画像
//mean CvScalar型 平均値が入る RGB表色系ならr,g,b,aの結果が代入されている
//vrn CvScalar型 分散が入る RGB表色系ならr,g,b,aの結果が代入されている
//mask IplImage型 0か255のマスク画像 省略可
//出力
//なし
function cvAvgVrn(src, mean, vrn, mask){
    try{
        if(cvUndefinedOrNull(src) || cvUndefinedOrNull(mean) || cvUndefinedOrNull(vrn))
            throw "src or mean or vrn" + ERROR.IS_UNDEFINED_OR_NULL;
        if(cvUndefinedOrNull(mask)) mask = 0;
        if(mask != 0) throw "mask は現在サポートされていません";
        
        var avg = cvAvg(src);
        for(var c = 0 ; c < CHANNELS ; c++){
            mean[c] = avg[c];
            vrn[c] = 0;
            var len = src.width * src.height;
            for(var i = 0 ; i < src.height ; i++){
                for(var j = 0 ; j < src.width ; j++){
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
//mean CvScalar型 平均値が入る RGB表色系ならr,g,b,aの結果が代入されている
//vrn CvScalar型 標準偏差が入る RGB表色系ならr,g,b,aの結果が代入されている
//mask IplImage型 0か255のマスク画像 省略可
//出力
//なし
function cvAvgSdv(src, mean, std, mask){
    cvAvgVrn(src, mean, std, mask);
    for(var k = 0 ; k < std.length ; k++)
        std[k] = Math.sqrt(std[k]);
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
        
        for(var i = 0 ; i < src.height ; i++){
            var is =  i * src.width * CHANNELS;
            var js = 0;
            for(var j = 0 ; j < src.width ; j++){
                for(var c = 0 ; c < CHANNELS ; c++)
                    dst.RGBA[c + js + is] = src.RGBA[c + js + is];
                js += CHANNELS;
            }
        }
    }
    catch(ex){
        alert("cvCopy : " + ex);
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
        
        for(var i = 0 ; i < src.height ; i++){
            for(var j = 0 ; j < src.width ; j++){
                var v = src.RGBA[color + (j + i * src.width) * CHANNELS];
                dst.RGBA[color + (j + i * src.width) * CHANNELS]  = lut[v];
            }
        }
    }
    catch(e){
        alert("cvLUT : " + ex);
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
        
        for(var i = 0 ; i < dst.height ; i++){
            for(var j = 0; j < dst.width ; j++){
                for(var c = 0 ; c < CHANNELS ; c++){
                    dst.RGBA[c + (j + i * dst.width) * CHANNELS] = Math.abs(src.RGBA[c + (j + i * dst.width) * CHANNELS]);
                }
            }
        }
    }
    catch(ex){
        alert("cvConvertScaleAbs : " + ex);
    }
}

//全座標に色を代入
//入力
//src IplImage型 色が代入される画像
//color CvScalar型 代入する色
//出力
//なし
function cvSet(src, color){
    try{
        if(cvUndefinedOrNull(src) || cvUndefinedOrNull(color))
            throw "src or color" + ERROR.IS_UNDEFINED_OR_NULL;
        for(var i = 0 ; i < src.height ; i++){
            for(var j = 0 ; j < src.width ; j++){
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
        for(var i = 0 ; i < src.height ; i++){
            var is = i * src.width * CHANNELS;
            var js = 0;
            for(var j = 0 ; j < src.width ; j++){
                for(var c = 0 ; c < CHANNELS - 1 ; src.RGBA[c++ + js + is] = 0);
                src.RGBA[3 + js + is] = 255;
                js+= CHANNELS;
            }
        }
    }
    catch(ex){
        alert("cvZero : " + ex);
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
function cvSetRGBA(src, c1, c2, c3, a){
    try{
        if(cvUndefinedOrNull(src)) throw "src" + ERROR.IS_UNDEFINED_OR_NULL;
        if(cvUndefinedOrNull(c1)) c1 = 255;
        if(cvUndefinedOrNull(c2)) c2 = 255;
        if(cvUndefinedOrNull(c3)) c3 = 255;
        if(cvUndefinedOrNull(a)) a = 255;
        
        var color = new CvScalar();
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

//画像の四則演算
//全画素に対して四則演算が行われる for(var  cvSub cvMul cvDivで呼び出されることを想定
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
        
        for(var i = 0 ; i < dst.height ; i++){
            for(var j = 0; j < dst.width ; j++){
                for(var c = 0 ; c < CHANNELS ; c++){
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

//画像のゼロでない画素数を数える
//入力
//src IplImage型 計算対象となる画像
//出力
//CvScalar型 RGB表色系ならr,g,b,aの結果が代入されている
function cvCountNonZero(src){
    var rtn = null;
    try{
        if(cvUndefinedOrNull(src)) throw "src" + ERROR.IS_UNDEFINED_OR_NULL;
        
        rtn = new CvScalar();
        for(var k = 0 ; k < rtn.length ; rtn.val[k++] = 0);
        
        for(var i = 0 ; i < src.height ; i++){
            for(var j = 0 ; j < src.width ; j++){
                for(var c = 0 ; c < CHANNELS ; c++){
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


//FFT or inverse FFT を行う
//入力
//src IplImage型 GRAY表色系を想定(RGB表色系ならRがFFTされる) ※解説参照
//isForward true/false trueなら順変換 falseなら逆変換
//出力
//なし
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
            for(var i = 0; i < iter; i++) j *= 2;
            
            var w = (isForward ? Math.PI: -Math.PI) / ar.length;
            var xp2 = ar.length;
            for(var it = 0; it < iter; it++)
            {
                xp = xp2;
                xp2 = Math.floor(xp2/2);
                w *= 2;
                for(var k = 0, i = - xp; k < xp2; i++)
                {
                    var arg = w * k;
                    k++;
                    var wr = Math.cos(arg);
                    var wi = Math.sin(arg);
                    for(var j = xp; j <= ar.length; j += xp)
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
            for(var i = 1; i < j2; i++)
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
            for(var i = 0; i < ar.length; i++)
            {
                ar[i] *= w;
                ai[i] *= w;
            }
            return;
        }
        
        //横方向
        var ar = new Array(src.width);
        var ai = new Array(src.width);
        for(var i = 0 ; i < src.height ; i++){
            var is =  i * src.width * CHANNELS;
            var js = 0;
            for(var j = 0 ; j < src.width ; j++){
                ar[j] = src.RGBA[js + is];
                ai[j] = src.RGBA[1 + js + is];
                js += CHANNELS;
            }
            oneLineFFT(ar, ai, isForward);
            js = 0;
            for(var j = 0 ; j < src.width ; j++){
                src.RGBA[js + is] = ar[j] ;
                src.RGBA[1 + js + is] = ai[j] ;
                js += CHANNELS;
            }
        }
        
        //縦方向
        ar = new Array(src.height);
        ai = new Array(src.height);
        var schan = src.width * CHANNELS;
        for(var j = 0 ; j < src.width ; j++){
            var js = j * CHANNELS;
            var is = 0;
            for(var i = 0 ; i < src.height ; i++){
                ar[i] = src.RGBA[js + is];
                ai[i] = src.RGBA[1 + js + is];
                is += schan;
            }
            oneLineFFT(ar, ai, isForward);
            is = 0;
            for(var i = 0 ; i < src.height ; i++){
                src.RGBA[js + is] = ar[j] ;
                src.RGBA[1 + js + is] = ai[j] ;
                is += schan;
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
        for(var y = 0 ; y < dst.height ; y++){
            console.log(y);
            for(var x = 0 ; x < dst.width ; x++){
                for(var i = 0; i < src.height ; i++){
                    for(var j = 0 ; j < src.width ; j++){
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
        for(var y = 0 ; y < dst.height ; y++){
            for(var x = 0 ; x < dst.width ; x++){
                for(var j = 0 ; j < src.width ; j++){
                    for(var i = 0; i < src.height ; i++){
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
            for(var i = 0 ; i < dst.height ; i++){
                for(var j = 0 ; j < dst.width ; j++){
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

//undefinedまたはnullチェック
//入力
//value チェックされる入力
//出力
//true/false
function cvUndefinedOrNull(value){
    return (value === undefined || value === null) ? true : false;
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
        for(var i = 0 ; i < dst.height ; i++){
            var is = i * dst.width * CHANNELS;
            var js = 0;
            for(var j = 0 ; j < dst.width ; j++){
                for(var c = 0 ; c < CHANNELS - 1; dst.RGBA[c++ + js + is] = 0);
                dst.RGBA[3 + js + is] = 255;
                js += CHANNELS;
            }
        }
    }
    catch(ex){
        alert("cvCreateImage : " + ex);
    }
    
    return dst;
}

//CvMatの内容をdocumentに表示
function cvDWriteMatrix(ar, title){
    
    //デフォルト値
    if(typeof title !== 'undefined'){
        document.write(title + "</br>");
    }
    
    for(var i = 0; i < ar.rows ; i++){
        for(var j = 0; j < ar.cols ; j++){
            document.write(ar.vals[j + i * ar.cols] + ", ");
        }
        document.write("</br>");
    }
    document.write("</br>");
}

//CvMatの内容をalertで表示
function cvAlertMat(src){
    try{
        var str = "";
        for(var i = 0 ; i < src.rows ; i++){
            for(var j = 0 ; j < src.cols; j++){
                str += src.vals[j + i * src.cols] + ", ";
            }
            str += "\n";
        }
        alert(str);
    }
    catch(ex){
        alert("cvAlertMat : " + ex);
    }
}

//2次元ベクトルの角度と大きさを求めます
//入力
// xImage IplImage型 x座標の値(x方向の微分画像)
// yImage IplImage型 y座標の値(y方向の微分画像)
// magImage IplImage型 大きさの出力 xImageと同じサイズ
//angImage IplImage型 角度の出力 xImageと同じサイズ角度はラジアン (-PI から PI) あるいは度 (-180 から 180) で表される
//angleInDegrees bool型 角度の表記にラジアン（デフォルト），または度のどちらを用いるかを指定するフラグ trueでラジアン
//出力
//なし
function cvCartToPolar(xImage, yImage, magImage, angImage, angleInDegrees){
    try{
        if(cvUndefinedOrNull(xImage) || cvUndefinedOrNull(yImage) ||
           cvUndefinedOrNull(magImage) || cvUndefinedOrNull(angImage))
            throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;
        else if(xImage.width != yImage.width || yImage.width != magImage.width ||  magImage.width != angImage.width ||
                xImage.height != yImage.height || yImage.height != magImage.height ||  magImage.height != angImage.height)
            throw ERROR.DIFFERENT_SIZE;
        
        if(cvUndefinedOrNull(angleInDegrees))
            angleInDegrees = false;
        
        for(var i = 0 ; i < xImage.height;  i++){
            var p = i * magImage.width * CHANNELS ;
            for(var j = 0 ; j < xImage.width; j++){
                var xI = xImage.RGBA[p];
                var yI = yImage.RGBA[p]
                magImage.RGBA[p] = Math.sqrt(xI * xI + yI * yI);
                angImage.RGBA[p] = Math.atan2(yI, xI);
                if(angleInDegrees) angImage.RGBA[p] *= 180 / Math.PI;
                p += CHANNELS ;
            }
        }
        
        
    }
    catch(ex){
        alert("cvCartToPolar : " + ex);
    }
}

