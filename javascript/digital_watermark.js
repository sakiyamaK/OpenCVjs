//未完成 ほとんどの画像で機能しない

var BLOCK_SIZE = 8;
var COUNT_CHAR_BIT = 7;

function String2Binary(str){
	var binaryss = new Array();
	for(var i = 0 ; i < str.length ; binaryss.push(str.charCodeAt(i++).toString(2)));
	return binaryss;
}

function Binary2String(binaryss){
	var str = "";
	for(var i = 0 ; i < binaryss.length ; i++)
	str += String.fromCharCode(parseInt(binaryss[i],2));
	return str;
}

function getBlock(src, x, y, blockSize){
	block = cvCreateImage(blockSize, blockSize);
	for(var i = 0 ; i < blockSize; i++){
		for(var j = 0 ; j < blockSize;  j++){
			var ji = (j + i * block.width) * CHANNELS;
			var ji2 = ((j + x * blockSize) + (i + y * blockSize) * src.width) * CHANNELS;
			block.RGBA[ji] = src.RGBA[ji2];
			block.RGBA[1 + ji] = src.RGBA[1 + ji2];
			block.RGBA[2 + ji] = src.RGBA[2 + ji2];
			block.RGBA[3 + ji] = 255;
		}
	}
	return block;
}

function setBlock(src, block, x, y){
	for(var i = 0 ; i < block.height; i++){
		for(var j = 0 ; j < block.width; j++){
			var ji = (j + i * block.width) * CHANNELS;
			var ji2 = ((j + x * block.width) + (i + y * block.height) * src.width) * CHANNELS;
			src.RGBA[ji2] = block.RGBA[ji];
			src.RGBA[1 + ji2] = block.RGBA[1 + ji];
			src.RGBA[2 + ji2] = block.RGBA[2 + ji];
		}
	}
}


function cvEmbedWatermark(src, watermark, embedStrength, blockSize, isEmbedUnderOver){
	try{
		if(!src || !watermark) throw "src または watermarkがnull または undefinedです";
		if(!embedStrength) embedStrength = 1;
		if(!blockSize) blockSize = BLOCK_SIZE;
		if(!isEmbedUnderOver) isEmbedUnderOver = false;
		
		var dst = cvCloneImage(src);
		
		var mean = new CvScalar();
		var vrn = new CvScalar();
		
		var blockCountHeight = src.height / blockSize;
		var blockCountWidth = src.width / blockSize;
		
		cvCvtColor(dst, dst, CV_CODE.RGB2YCbCr);

		var watermarkBinaryss = String2Binary(watermark);

		for(var i = 0 ; i < blockCountHeight ; i++){
			for(var j = 0 ; j < blockCountWidth; j++){
				
				var block = getBlock(dst, j, i, blockSize);
				
				cvAvgVrn(block, mean, vrn, null);
				
				if(!isEmbedUnderOver && (vrn[0] < embedStrength || vrn[0] > 255 - embedStrength))
					continue;
				
				
				var watermarkIndex = j + i * blockCountWidth;
				var watermarkIndex1 = Math.floor(watermarkIndex / COUNT_CHAR_BIT) % watermarkBinaryss.length;
				var watermarkIndex2 = watermarkIndex % COUNT_CHAR_BIT;
				
				var bit = watermarkBinaryss[watermarkIndex1][watermarkIndex2];
				
				var highV, lowV;
				var highBai, lowBai;
				var highC = -1, lowC = -1;
				if(bit == 1 && vrn[1] - embedStrength < vrn[2]){
					highC = 1;
					lowC = 2;
				}
				else if(bit == 0 && vrn[2] - embedStrength < vrn[1]){
					highC = 2;
					lowC = 1;
				}
				
				if(highC != -1){
					highV = (vrn[highC] + vrn[lowC] + embedStrength) / 2 ;
					lowV = (vrn[highC] + vrn[lowC] - embedStrength) / 2 ;
					
					if(lowV < 0){
						highV -= lowV;
						lowV = 0;
					}
					
					highBai = vrn[highC] != 0 ? Math.sqrt(highV / vrn[highC]) : Math.sqrt(highV);
					lowBai = vrn[lowC] != 0 ? Math.sqrt(lowV / vrn[lowC]) : Math.sqrt(lowV);
					for(var y = 0 ; y < block.height ; y++){
						for(var x = 0; x < block.width ; x++){
							var xy = (x + y * block.width) * CHANNELS;
							if(isEmbedUnderOver && block.RGBA[xy] > 255 - embedStrength) block.RGBA[xy] = 255 - embedStrength;
							else if(isEmbedUnderOver && block.RGBA[xy] < embedStrength) block.RGBA[xy] = embedStrength;
							
							block.RGBA[highC + xy] = vrn[highC] != 0 ? 
								highBai * (block.RGBA[highC + xy] - mean[highC]) + mean[highC] :
								Math.pow(-1, x + y) * highBai * block.RGBA[highC + xy];
							block.RGBA[lowC + xy] = vrn[lowC] != 0 ? 
								lowBai * (block.RGBA[lowC + xy] - mean[lowC]) + mean[lowC] :
								Math.pow(-1, x + y) * lowBai * block.RGBA[lowC + xy];
						}
					}
				}
				
				setBlock(dst, block, j, i);
			}
		}
		cvCvtColor(dst, dst, CV_CODE.YCbCr2RGB);
	}
	catch(ex){
		alert("cvEmbedWatermark : " + ex);
	}
	
	return dst;
}

function cvExtractWatermark(src, wmLength, embedStrength, blockSize){
	try{
		if(!src || !wmLength) throw "srcがnull または undefinedです";
		if(wmLength == null || wmLength <= 0) "wmLengthは1以上の整数にして下さい";
		if(!embedStrength) embedStrength = 0;
		if(!blockSize) blockSize = BLOCK_SIZE;

		var watermark = null;
		var cpy = cvCloneImage(src);
		
		var mean = new CvScalar();
		var vrn = new CvScalar();
				
		var blockCountHeight = src.height / blockSize;
		var blockCountWidth = src.width / blockSize;
		
		cvCvtColor(cpy, cpy, CV_CODE.RGB2YCbCr);
		
		var wmBinaryss = new Array(wmLength);
		for(var i = 0 ; i < wmBinaryss.length; i++){
			wmBinaryss[i] = new Array(COUNT_CHAR_BIT);
			for(var j = 0 ; j < COUNT_CHAR_BIT ; j++){
				wmBinaryss[i][j] = 0;
			}
		}
		
		for(var i = 0 ; i < blockCountHeight ; i++){
			for(var j = 0 ; j < blockCountWidth; j++){
			
				var wmIndex = j + i * blockCountWidth;
				var wmIndex1 = Math.floor(wmIndex / COUNT_CHAR_BIT) % wmBinaryss.length;
				var wmIndex2 = wmIndex % COUNT_CHAR_BIT;
				
				var block = getBlock(cpy, j, i, blockSize);
				
				cvAvgVrn(block, mean, vrn, null);
				
				if(vrn[0] <= 255 - embedStrength && vrn[0] >= embedStrength && vrn[1] > vrn[2]) wmBinaryss[wmIndex1][wmIndex2] += 1;
				else if(vrn[0] <= 255 - embedStrength && vrn[0] >= embedStrength && vrn[1] < vrn[2]) wmBinaryss[wmIndex1][wmIndex2] -= 1;
			}
		}
		
		for(var i = 0 ; i < wmBinaryss.length; i++){
			var str = "";
			for(var j = 0 ; j < COUNT_CHAR_BIT ; j++){
				str += wmBinaryss[i][j] > 0 ? "1" : "0";
			}
			wmBinaryss[i] = str;
		}
		
		watermark = Binary2String(wmBinaryss);
	}
	catch(ex){
		alert("cvExtractWatermark : " + ex);
	}
	
	
	return watermark;

}