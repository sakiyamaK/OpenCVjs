//////////////メモ/////////////////////////
//
// svmはC-SVMのSMOのみ利用可能
// opencv.jsが必要
//
///////////////////////////////////////////


//------------------データ型------------------------
//SVMの学習パラメータ
var CvSVMParams = function(){
	svm_type: 0; //未使用
	kernel_type: 0; //CV_SVM_KERNEL_TYPE型
	degree: 1; // CV_SVM_KERNEL_TYPE.POLY 用
    gamma: 1;  // CV_SVM_KERNEL_TYPE.POLY/CV_SVM_KERNEL_TYPE.RBF/CV_SVM_KERNEL_TYPE.SIGMOID 用
    coef0: 0;  // CV_SVM_KERNEL_TYPE.POLY/CV_SVM_KERNEL_TYPE.SIGMOID 用

    C: 0;  //C-SVMのC
    nu: 0; // 未使用
    p: 0;  // 未使用
    term_crit: null;  // 終了条件
    tolerance: 0; // ラグランジュ乗数評価時の余裕値
    minLearnData: 0; //学習データの最低個数
}

//SVMクラス
var CvSVM = function(){
    this.class_weights = null; // 学習した重み
    this.b = 0;	//バイアス初期化

    this.svmP = null;    
    this.svmIndexes = null; //サポートベクターになるindex

    //-------Trainメソッドの引数trainss変数で初期化される----------
    //学習データ
    this.transs = null;
    // ラグランジュの未定乗数
    this.lambda = null;
     // ラグランジュ係数の値を保存するキャッシュ
    this.eCache = null;
    
}

//2層パーセプトロンの学習パラメータ
var CvPerceptronParams = function(){
	nu: 1; //学習効率
	term_crit: null;  // 終了条件
}

//2層パーセプトロンクラス
var CvPerceptron = function(){
	this.class_weights = null; //学習した重み
	this.bias = 0; //バイアス
	this.pctP = null;
}


//------------------定数------------------------
//SVMのカーネルタイプ
var CV_SVM_KERNEL_TYPE = {
	LINEAR: 0, //マッピングは行われない
	POLY: 1, //多項式カーネル
	RBF: 2, //動径基底関数カーネル
	SIGMOID: 3 //シグモイド関数カーネル
}

//------------------メソッド------------------------

CvSVM.prototype._save = function(fileNameFullPath){
	try{
	}
	catch(ex){
		alert("CvSVM.prototype._save : " + ex);
	}
}

CvSVM.prototype._kernel = function(trains2, trains1){
	var r = 0.0;
	try{
		switch(this.svmP.kernel_type){
		case CV_SVM_KERNEL_TYPE.POLY: // 多項式カーネル
			var p = this.svmP.degree;     // Tuning Parameter
			r = this.svmP.coef0;              // Tuning Parameter
			var g = this.svmP.gamma; // Tuning Parameter
			for(var i = 0; i < trains2.length; i++ )
				r += g * trains2[i] * trains1[i];
			r = Math.pow( r, p );
		break;
		case CV_SVM_KERNEL_TYPE.RBF: // ガウシアン(動径基底関数?)カーネル
			var g = this.svmP.gamma;    // Tuning Parameter
			for( var i = 0; i < trains2.length; i++ )
				r += (trains2[i] - trains1[i]) *  (trains2[i] - trains1[i]);
			r = Math.exp(-r / (2*g*g));
		break;
		default: //CV_SVM_KERNEL_TYPE.LINEAR
			for(var i = 0; i < trains2.length; i++ )
				r += trains2[i] * trains1[i];
		break;
		}
	}
	catch(ex){
		alert("CvSVM.prototype._kernel : " + ex);
	}
	return r;
}

CvSVM.prototype._f = function(idx1, trainss, responses){
	var F = 0.0;
	try{
		for(var idx2 = 0; idx2 < trainss.length;  idx2++ ){
			if( this.lambda[idx2] == 0.0 ) continue;
			F += this.lambda[idx2] * responses[idx2] * this._kernel(trainss[idx2], trainss[idx1]);
		}
		F -= this.b;
	}
	catch(ex){
		alert("CvSVM.prototype._f : " + ex);
	}
	return F;
}

//SMOメソッド
CvSVM.prototype._stepSMO = function(idx1, idx2, e1, trainss, responses){
	try{
		if(idx1 == idx2) return 0;
		var lambda1Old = this.lambda[idx1], lambda1New;
		var lambda2Old = this.lambda[idx2], lambda2New;
		var U, V, e2;
		if( responses[idx1] != responses[idx2] ){
			U = Math.max(0.0, lambda1Old - lambda2Old);
			V = Math.min(this.svmP.C, this.svmP.C+lambda1Old - lambda2Old);
		}
		else{
			U = Math.max(0.0, lambda1Old + lambda2Old - this.svmP.C);
			V = Math.min(this.svmP.C,   lambda1Old + lambda2Old);
		}
		if( U == V ) return 0;

		var k11 = this._kernel(trainss[idx1], trainss[idx1]);
		var k22 = this._kernel(trainss[idx1], trainss[idx2]);
		var k12 = this._kernel(trainss[idx1], trainss[idx2]);
		var k =  k11 + k22 - 2.0*k12;
		if( this.lambda[idx2] > this.svmP.term_crit.epsilon && this.lambda[idx2] < (this.svmP.C - this.svmP.term_crit.epsilon) )
			e2 = this.eCache[idx2];
		else
			e2 = this._f(idx2, trainss, responses) - responses[idx2];
		
		var bClip = false;
		if( k <= 0.0 ){
			// this.lambda[idx1] = U のときの目的関数の値
			lambda1New = U;
			lambda2New = lambda2Old + responses[idx1] * responses[idx2] * (lambda1Old - lambda1New);
			this.lambda[idx1] = lambda1New; // 仮置き
			this.lambda[idx2] = lambda2New;
			var v1 = this._f(idx2, trainss, responses) + this.b - responses[idx2] * lambda2Old * k22 - responses[idx1] * lambda1Old * k12;
			var v2 = this._f(idx1, trainss, responses) + this.b - responses[idx2] * lambda2Old * k12 - responses[idx1] * lambda1Old * k11;
			var Lobj = lambda2New + lambda1New - k22 * lambda2New * lambda2New / 2.0 - k11 * lambda1New * lambda1New / 2.0
				- responses[idx2] * responses[idx1] * k12 * lambda2New * lambda1New 
				- responses[idx2] * lambda2New * v1 - responses[idx1] * lambda1New * v2;
							
			// this.lambda[idx1] = V のときの目的関数の値
			lambda1New = V;
			lambda2New = lambda2Old + responses[idx1] * responses[idx2] * (lambda1Old - lambda1New);
			this.lambda[idx1] = lambda1New; // 仮置き
			this.lambda[idx2] = lambda2New;
			v1 = this._f(idx2, trainss, responses) + this.b - responses[idx2] * lambda2Old * k22 - responses[idx1] * lambda1Old * k12;
			v2 = this._f(idx1, trainss, responses) + this.b - responses[idx2] * lambda2Old * k12 - responses[idx1] * lambda1Old * k11;
			var Hobj = lambda2New + lambda1New - k22 * lambda2New * lambda2New / 2.0 - k11 * lambda1New * lambda1New / 2.0 
				- responses[idx2] * responses[idx1] * k12 * lambda2New * lambda1New 
				- responses[idx2] * lambda2New * v1 - responses[idx1] * lambda1New * v2;
			 
			if( Lobj > Hobj + this.svmP.term_crit.epsilon ){
				bClip = true;
				lambda1New = U;
			}
			else if( Lobj < Hobj - this.svmP.term_crit.epsilon ){
				bClip = true;
				lambda1New = V;
			}
			else{
				bClip = true;
				lambda1New = lambda1Old;
			}
			this.lambda[idx1] = lambda1Old; // 元に戻す
			this.lambda[idx2] = lambda2Old;
		}
		else{
			lambda1New = lambda1Old + (responses[idx1] * (e2-e1) / k);
			if( lambda1New > V ){
				bClip = true;
				lambda1New = V;
			}
			else if( lambda1New < U ){
				bClip = true;
				lambda1New = U;
			}
		}

//		if(lambda1New > 100) console.log("lambda1New =" + lambda1New + " : lambda1Old = " + lambda1Old);
//		console.log("Math.abs(lambda1New - lambda1Old) = " + Math.abs(lambda1New - lambda1Old));
//		console.log("this.svmP.term_crit.epsilon * (lambda1New+lambda1Old+this.svmP.term_crit.epsilon) = " + 
//		(this.svmP.term_crit.epsilon * (lambda1New+lambda1Old+this.svmP.term_crit.epsilon)) );

		if( Math.abs(lambda1New - lambda1Old) < this.svmP.term_crit.epsilon * (lambda1New + lambda1Old + this.svmP.term_crit.epsilon) )
			return 0;
		 
		// this.lambda[idx2]更新
		lambda2New = lambda2Old + responses[idx1] * responses[idx2] * (lambda1Old - lambda1New);
		// b更新
		var old_b = this.b;
		if( this.lambda[idx1] > this.svmP.term_crit.epsilon && this.lambda[idx1] < (this.svmP.C-this.svmP.term_crit.epsilon) )
			this.b += e1 + (lambda1New - lambda1Old) * responses[idx1] * k11 + (lambda2New - lambda2Old) * responses[idx2] * k12;
		else if( this.lambda[idx2] > this.svmP.term_crit.epsilon && this.lambda[idx2] < (this.svmP.C-this.svmP.term_crit.epsilon) )
			this.b += e2 + (lambda1New - lambda1Old) * responses[idx1] * k12 + (lambda2New - lambda2Old) * responses[idx2] * k22;
		else
			this.b += (e1 + (lambda1New - lambda1Old) * responses[idx1] * k11 +
			(lambda2New - lambda2Old) * responses[idx2] * k12 + e2 + (lambda1New - lambda1Old) * responses[idx1] * k12 +
			(lambda2New - lambda2Old) * responses[idx2] * k22 ) / 2.0;
	
		// err更新
		for( var m = 0; m < trainss.length; m++ ){
			if( m == idx1 || m == idx2 ) continue;
			else if( this.lambda[m] > this.svmP.term_crit.epsilon && this.lambda[m] < (this.svmP.C-this.svmP.term_crit.epsilon) )
				this.eCache[m] = this.eCache[m] + responses[idx2] * (lambda2New - lambda2Old) * this._kernel( trainss[idx2], trainss[m] )
				+ responses[idx1] * (lambda1New - lambda1Old) * this._kernel( trainss[idx1], trainss[m] ) + old_b - this.b;
		}
		 
		this.lambda[idx1] = lambda1New;
		this.lambda[idx2] = lambda2New;
		if( bClip  ){
			if( lambda1New > this.svmP.term_crit.epsilon && lambda1New < (this.svmP.C-this.svmP.term_crit.epsilon) )
				this.eCache[idx1] = this._f(idx1, trainss, responses) - responses[idx1];
		}
		else this.eCache[idx1] = 0.0;
	
		this.eCache[idx2] =  this._f(idx2, trainss, responses) - responses[idx2];
	}
	catch(ex){
		alert("CvSVM.prototype._stepSMO : " + ex);
	}
		 
	return 1;
}

//引数からふたつめの更新データを探索し_stepSMOメソッドで更新
CvSVM.prototype._update = function(idx1, e1, trainss, responses){
	try{
		var maxE2 = 0.0;
		var e2;
		var maxE2Idx = -1;
		var offset;
		//探索条件1
		offset = parseInt(Math.random() * trainss.length);
		for(var idx2 = 0 ; idx2 < trainss.length ; idx2++){
			var pos = (idx2 + offset) % trainss.length;
			if(this.lambda[pos] > this.svmP.term_crit.epsilon && this.lambda[pos] < (this.svmP.C - this.svmP.term_crit.epsilon)){
				e2 = this.eCache[pos];
				var dmy = Math.abs(e2 - e1);
				if(dmy > maxE2){
					maxE2 = dmy;
					maxE2Idx = pos;
				}
			}
		}
		if(maxE2Idx >= 0 && this._stepSMO(idx1, maxE2Idx, e1, trainss, responses) == 1)
			return 1;
			
		//探索条件2
		offset = parseInt(Math.random() * trainss.length);
		for(var idx2 = 0 ; idx2 < trainss.length ; idx2++){
			var pos = (idx2 + offset) % trainss.length;
			if(this.lambda[pos] > this.svmP.term_crit.epsilon && this.lambda[pos] < (this.svmP.C - this.svmP.term_crit.epsilon) &&
				this._stepSMO(idx1, idx2, e1, trainss, responses) == 1)
				return 1;
		}
		
		//探索条件3
		offset = parseInt(Math.random() * trainss.length);
		for(var idx2 = 0 ; idx2 < trainss.length ; idx2++){
			var pos = (idx2 + offset) % trainss.length;
			if( ! (this.lambda[pos] > this.svmP.term_crit.epsilon && this.lambda[pos] < (this.svmP.C - this.svmP.term_crit.epsilon)) &&
				this._stepSMO(idx1, idx2, e1, trainss, responses) == 1)
				return 1;
		}
	}
	catch(ex){
		alert("CvSVM.prototype._update : " + ex);
	}
	
	return 0;
}

//ひとつめの引数の選択するか検証
CvSVM.prototype._examinUpdate = function(idx1, trainss, responses){
	try{
		var yF1;
		var e1;
		var response = responses[idx1];
		if(this.lambda[idx1] > this.svmP.term_crit.epsilon  && this.lambda[idx1] < (this.svmP.C - this.svmP.term_crit.epsilon))
			e1 = this.eCache[idx1];
		else e1 = this._f(idx1, trainss, responses) - response;
		
		yF1 = e1 * response;
		
		//KKT条件のチェック
		if( (this.lambda[idx1] < (this.svmP.C - this.svmP.term_crit.epsilon) && yF1 < -this.svmP.tolerance) || 
			(this.lambda[idx1] > this.svmP.term_crit.epsilon && yF1 > this.svmP.torelance) )
				return this._update(idx1, e1, trainss, responses);
	}
	catch(ex){
		alert("CvSVM.prototype._examinUpdate : " + ex);
	}
	return 0;
}



//２層サポートベクターマシンによる学習
//入力
// inputss 二次元array 学習データの二次元配列．inputss[学習ナンバー][次元]
// answers array inputssの正解値配列(1 or -1) answers[学習ナンバー]
// nyu 少数型 学習倍率 低くするとと正確だが収束が遅い
// termcriteria CvTermCriteria型 type以外の値を指定する
//出力
//CvPerceptromParams型
CvSVM.prototype.train = function(trainss, responses, varIndex, sampleIndex, cvSVMParams) {
	try{
		if(cvUndefinedOrNull(cvSVMParams))
	    	throw "cvSVMParams" + ERROR.IS_UNDEFINED_OR_NULL;
	    if(cvUndefinedOrNull(trainss) || trainss.length < cvSVMParams.minLearnData ||
	    	cvUndefinedOrNull(responses) || responses.length < cvSVMParams.minLearnData)
	    	throw "trainssかresponses、もしくはその両方がundefinedかnull、または学習データの数が足りていません<br/>" + 
	    		cvSVMParams.minLearnData + "個以上の学習データを読み込ませて下さい";
	    else if(trainss.length != responses.length)
	    	throw "trainss.length != responses.lengthです<br/>" + 
	    			"データ長を等しくして下さい";
	 
	    /////////////////変数の初期化///////////////////////
	    //学習データのコピー
	    this.trainss = new Array(trainss.length);
	    for(var i = 0 ; i < this.trainss.length ; i++){
	    	this.trainss[i] = new Array(trainss[i].length);
	    	for(var j = 0 ; j < this.trainss[i].length ; j++){
	    		this.trainss[i][j] = trainss[i][j];
	    	}
	    }
	    
	    // ラグランジュの未定乗数
	    this.lambda = new Array(trainss.length);
	    for(var i = 0; i < this.lambda.length; this.lambda[i++] = 0);
	     // ラグランジュ係数の値を保存するキャッシュ
	    this.eCache = new Array(this.trainss.length);
		//重み
	    this.class_weights = new Array(trainss.length);    
	    for(var i = 0; i < this.class_weights.length; this.class_weights[i++] = 0);
	
	    this.svmP = cvSVMParams;
	    
	    this.svmIndexes = new Array();
	    
	    /////////////////////////////////////////////////////////////
	    
	    var alldata = true;//すべてのデータを処理する場合
	    var changed;//変更があった
	  
	    // ループ変数
	    var loop = 0;
	    while(loop < this.svmP.term_crit.max_iter){
	    	changed = 0;
	    	for(var i = 0 ; i < trainss.length; i++){
	    		if( alldata || (this.lambda[i] > this.svmP.term_crit.epsilon && this.lambda[i] < (this.svmP.C-this.svmP.term_crit.epsilon)) )
	    		changed += this._examinUpdate(i, trainss, responses);
	    	}
			if( alldata ){
				alldata = false;
				if(changed == 0) break;
			}
			else if(changed == 0) alldata = false;
			loop++;
			if(changed != 0) console.log("loop = " + loop + " : changed = " + changed); 
		}
		for( var i = 0; i < trainss.length; i++ ){
			if( this.lambda[i] != 0.0 ) this.svmIndexes.push(i);
		}
		
		//重み計算
		for(var i = 0; i < this.svmIndexes.length ; i++) {
			var svmIdx = this.svmIndexes[i];
			this.class_weights[svmIdx] = responses[svmIdx] * this.lambda[svmIdx];
	    }
	}
	catch(ex){
		alert("CvSVM.prototype.Train : " + ex);
	}
    return 1;
}

//２層パーセプトロンによる予測
//入力
//predicts array 予測データ
//trains 2次元array 重みの学習に使った学習データ
//出力
//1 or -1
CvSVM.prototype.predict = function(predicts){
	var ans = 0.0;
	try{
		if(cvUndefinedOrNull(predicts))
				throw "predicts" + ERROR.IS_UNDEFINED_OR_NULL;

		for(var i = 0; i < this.svmIndexes.length; i++ ){
			var idx = this.svmIndexes[i];
			ans += this.class_weights[idx] * this._kernel(this.trainss[idx], predicts);
		}
		ans -= this.b;
		
		ans = ans > 0.0 ? 1 : -1;
	}
	catch(ex){
		alert("CvSVM.prototype.Predict : " + ex);
	}
	 
	return ans;
}

CvSVM.prototype.get_support_vector = function(idx){
	try{
		if(this.class_weights.length < idx || idx < 0)
			throw "idxが境界外です";
			
		return this.class_weights[this.svmIndexes[idx]];
	}
	catch(ex){
		alert("CvSVM.prototype.get_support_vector : " +ex);
	}
}

CvSVM.prototype.get_support_vector_count = function(){
	return this.class_weights.length;
}

CvSVM.prototype.get_support_vector_index = function(){
	return this.svmIndexes;
}

//２層パーセプトロンによる学習
//入力
// inputss 二次元array 学習データの二次元配列．inputss[学習ナンバー][次元]
// answers array inputssの正解値配列(1 or -1) answers[学習ナンバー]
// cvPerceptronParams CvPerceptronParam型
//出力
//なし
CvPerceptron.prototype.train = function(trainss, responses, cvPerceptronParams){
	try{
		if(cvUndefinedOrNull(trainss) || cvUndefinedOrNull(responses) ||
			cvUndefinedOrNull(cvPerceptronParams))
			throw "引数のどれか" + ERROR.IS_UNDEFINED_OR_NULL;

		this.class_weights = new Array(trainss[0].length);
		for(var i = 0 ; i < this.class_weights.length ; i++) this.class_weights[i] = 0;
		this.bias = 0;
		
		this.pctP = cvPerceptronParams;
	
		var max = -1;
		for(var i = 0 ; i < trainss.length; i++){
			var dmy = 0;
			for(var j = 0 ; j < trainss[i].length ; j++)
				dmy += trainss[i][j] * trainss[i][j];
			if(max < dmy) max = dmy;
		}
		max = Math.sqrt(max);

		var nowLoop = 0;
		while(true){
			var isMiss = false;
			for(var i = 0 ; i < responses.length; i++){
				var sum = 0;
				for(var j = 0 ; j < trainss[i].length ; j++)
					sum += this.class_weights[j] * trainss[i][j];
				if(responses[i] *(sum + this.bias) <= this.pctP.term_crit.epsilon){
					isMiss = true;
					var na = this.pctP.nu * responses[i];
					for(var j = 0 ; j < trainss[i].length; j++)
						this.class_weights[j] += na * trainss[i][j];
					this.bias += na * max * max;
				}
			}
			nowLoop++;
			if(this.pctP.term_crit.max_iter < nowLoop) break;
			else if(! isMiss) break;
		}
	}
	catch(ex){
		alert("cvPerceptron.prototype.Train : " + ex);
	}
	
	return 1;
}


//２層パーセプトロンによる予測
//入力
//inputs array 予測データ
//出力
//1 or -1
CvPerceptron.prototype.predict = function(inputs){
	var ans = 0;
	try{
		if(cvUndefinedOrNull(inputs))
			throw "inputs" + ERROR.IS_UNDEFINED_OR_NULL;
			
		var sum = 0;
		for(var i = 0 ; i < inputs.length ; i++)
			sum += this.class_weights[i] * inputs[i];
		sum += this.bias;
		
		ans = (sum >= 0) ? 1 : -1;
	}
	catch(ex){
		alert("cvPerceptron.prototype.Predict : " + ex);
	}
	return ans;
}

