function Sum(values){
	var rtn = 0;
	for(i = 0 ; i < values.length ; rtn += values[i++]);
	return rtn;
}

function Average(values){
	return Sum(values)/values.length;
}

function Variance(values){
	var rtn = 0;
	try{
		var ave = Average(values);
		for(i = 0 ; i < values.length ; i++){
			var a = (values[i] - ave);
			rtn = a * a;
		}
		rtn /= values.length;
	}
	catch(ex){
		console.log(ex);
	}
	return rtn;
}

function Max(values){
	var rtn = values[0];
	for(i = 1; i < values.length ; i++){
		if(values[i] > rtn) rtn = values[i];
	}
	return rtn;
}

function Min(values){
	var rtn = values[0];
	for(i = 1; i < values.length ; i++){
		if(values[i] < rtn) rtn = values[i];
	}
	return rtn;
}

function Histgram(values, maxV){
	var rtn = new Array(maxV);
	try{
		for(i = 0 ; i < values.length ; rtn[i++] = 0);
		for(i = 0 ; i < values.length ; rtn[values[i++]]++);
	}
	catch(ex){
		console.log(ex);
	}
	return rtn;
}