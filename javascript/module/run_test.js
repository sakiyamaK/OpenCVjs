var term = new CvTermCriteria();
//term.max_iter = 100;
term.eps = 0.0001;
var test_term = new CvTermCriteria();
test_term.eps = 20;

var eigen_term = new CvTermCriteria();
eigen_term.eps = 0.001;

var maxTime = 1;
for(var time = 0 ; time < maxTime ; time++){
    var rows = 8;//Math.floor(Math.random() * 6) + 2;
    var cols = rows;//Math.floor(Math.random() * 8) + 2;
    var mat = cvCreateMat(rows, cols);
    for(var i = 0 ; i < mat.rows ; i++){
        for(var j = 0 ; j < mat.cols ; j++){
            mat.vals[j + i * mat.cols] = Math.floor(Math.random() * 254) + 1;
        }
    }
    
//    mat.rows = 3;
//    mat.cols = 3;
//    mat.vals = [159, 75, 167,
//                210, 205, 153,
//                66, 203, 209];
    
    //辞書行列を乱数生成で初期化
    var dic = cvCreateMat(mat.rows * mat.cols, mat.rows * mat.cols);
    for(var i = 0 ; i < dic.rows * dic.cols ; dic.vals[i++] = 255 * Math.random());
    
    //係数行列
    var coess = cvCreateMat(dic.cols, dic.cols);
    for(var i = 0 ; i < coess.rows * coess.cols ; coess.vals[i++] = (10 * Math.random())|0);
    
    for(var i = 0 ; i < coess.cols ; coess.vals[i++] = 0);
    coess.vals[0] = coess.vals[30] = coess.vals[coess.rows - 1] = 1;
    
    
//    var mm = cvmMul(cvmTranspose(mat), mat);
//
//    cvDWriteMatrix(mm, "mat");
//    
//    if(!test_cvmEigen(mm, false, eigen_term, test_term)){
//    
//        document.write(time + "回目<br/>");
//        document.write("eigenのエラー" + "<br/><br/>");
//        
//        break;
//    }
//    continue;


//    cvDWriteMatrix(mat, "mat");

//    if(!test_cvmSVD(mat, false, term, test_term)){
//        document.write(time + "回目<br/>");
//        document.write("svdのエラー" + "<br/>");
//        cvDWriteMatrix(mat, "mat");
//        
//        document.write("固有値のチェック" + "<br/>");
//
//        var mm = cvmMul(cvmTranspose(mat), mat);
//    
//        cvDWriteMatrix(mm, "mm");
//
//        if(!test_cvmEigen(mm, false, term, test_term)){
//            document.write("eigenのエラー" + "<br/><br/>");
//        }
//
//        break;
//    }
    
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

    if(!test_cvmKSVD(mat, dic, coess, term, test_term)){
        
        break;
    }

//    if(!test_cvmInverse(mat, false, term, test_term)){
//        document.write(time + "回目<br/>");
//        document.write("cvmInverseのエラー" + "<br/><br/>");
//        cvDWriteMatrix(mat, "mat");
//        
//        document.write("固有値のチェック" + "<br/>");
//        
//        var mm = cvmMul(cvmTranspose(mat), mat);
//        
//        cvDWriteMatrix(mm, "mm");
//        
//        if(!test_cvmEigen(mm, false, term, test_term)){
//            document.write("eigenのエラー" + "<br/><br/>");
//        }
//        
//        break;
//    }
}