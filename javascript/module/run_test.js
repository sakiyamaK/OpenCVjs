var term = new CvTermCriteria();
term.eps = 0.1;
var term2 = new CvTermCriteria();
//term2.max_iter = 100;
term2.eps = 1000;
var test_term = new CvTermCriteria();
test_term.eps = 20;
test_term.eps = 1000;
var eigen_term = new CvTermCriteria();
eigen_term.eps = 0.001;

var maxTime = 1;
for(var time = 0 ; time < maxTime ; time++){
    var rows = 4;//Math.floor(Math.random() * 6) + 2;
    var cols = rows;//Math.floor(Math.random() * 8) + 2;
    var mat = cvCreateMat(rows, cols);
    for(var i = 0 ; i < mat.rows ; i++){
        for(var j = 0 ; j < mat.cols ; j++){
            mat.vals[j + i * mat.cols] = Math.floor(Math.random() * 254) + 1;
        }
    }
    
    //辞書行列を乱数生成で初期化
    var dic = cvCreateMat(mat.rows, mat.cols);
    for(var i = 0 ; i < dic.rows * dic.cols ; dic.vals[i++] =  2 * Math.random() - 1);
    
    //係数行列
    var coess = cvCreateMat(dic.cols, dic.cols);
    for(var i = 0 ; i < coess.rows * coess.cols ; coess.vals[i++] = (255 * Math.random()));
    
    for(var i = 0 ; i < coess.cols ; coess.vals[i++] = 0);
    coess.vals[0] = coess.vals[30] = coess.vals[coess.rows - 1] = 1;
    
    
//    var mm = cvmMul(cvmTranspose(mat), mat);
//
//    cvDWriteMatrix(mm, "mat");
//    
    
//    if(!test_cvmOMP(mat, dic, true, term, eigen_term, test_term)){
//        document.write(time + "回目<br/>");
//        document.write("cvmOMPのエラー" + "<br/><br/>");
//        cvDWriteMatrix(mat, "mat");
//        
//        document.write("固有値のチェック" + "<br/>");
//        
//        var mm = cvmMul(cvmTranspose(mat), mat);
//        
//        cvDWriteMatrix(mm, "mm");
//        
//        if(!test_cvmEigen(mm, false, eigen_term, test_term)){
//            document.write("eigenのエラー" + "<br/><br/>");
//        }
//        
//        break;
//    }

    cvDWriteMatrix(mat, "mat");
    cvDWriteMatrix(dic, "dic");
    cvDWriteMatrix(coess, "coess");
    if(!test_cvmK_SVD(mat, dic, coess, term, term2, test_term)){
        
        break;
    }

}