//-------------------メソッド------------------

//cvLoadImageを呼び出す前に必要な前処理
//htmlのinputタグのonClickで呼び出すことを想定
//入力
//event event型 発生したイベント
//inputId Id型 イベントの発生元のId
//出力
//なし
function cvLoadImagePre(event, inputId){
    try{
        if(cvUndefinedOrNull(event) || cvUndefinedOrNull(inputId))
            throw "event or inputId" + ERROR.IS_UNDEFINED_OR_NULL;
        var dialog = document.getElementById(inputId);
        dialog.value = "";
    }
    catch(ex){
        alert("cvLoadImagePre : " + ex);
    }
}

//inputタグからiplImageに変換し、imgタグに出力する
//htmlのinputタグのonchangeで呼び出すことを想定
//入力
//event event型 発生したイベント
//imgId  Id型 読み込んだ画像を表示させるimgタグのid
//iplImage IplImage型 srcの値が代入される
//maxSize 整数 srcの縦or横幅がこの値以上なら、この値となるように大きさを変換して代入される -1なら処理されない 省略可
//出力
//なし
function cvLoadImage(event, imgId, iplImage, maxSize){
    try{
        if(cvUndefinedOrNull(event) || cvUndefinedOrNull(imgId) || cvUndefinedOrNull(iplImage))
            throw "event or imgId or iplImage" + ERROR.IS_UNDEFINED_OR_NULL;
        var file = event.target.files[0];
        if (file){
            cvLoadImageAtEventFile(file, imgId, iplImage, maxSize);
            event = null;
        }
    }
    catch(ex){
        alert("cvLoadImage : " + ex);
    }
}

//inputタグから複数のiplImageに変換し、複数のimgタグに出力する
//htmlのinputタグのonchangeで呼び出すことを想定
//入力
//event event型 発生したイベント
//imgIds  Id型の配列 読み込んだ画像を表示させるimgタグのid
//iplImages IplImage型の配列 srcの値が代入される
//maxSize 整数 srcの縦or横幅がこの値以上なら、この値となるように大きさを変換して代入される -1なら処理されない 省略可
//出力
//なし
function cvLoadImages(event, imgIds, iplImages, maxSize)
{
    try{
        for(var i = 0 ; i < event.target.files.length ; i++){
            var file = event.target.files[i];
            if (file){
                var imgId = imgIds[i];
                var iplImage = iplImages[i];
                cvLoadImageAtEventFile(file, imgId, iplImage, maxSize);
            }
        }
    }
    catch(ex){
        alert("cvLoadImages : " + ex);
    }
}

//event.target.files配列の要素からiplImageに変換する
//cvLoadImageかcvLoadImagesで呼び出すことを想定
//入力
//file file型 event.target.files配列の要素
//imgId  Id型 読み込んだ画像を表示させるimgタグのid
//iplImage IplImage型 srcの値が代入される
//maxSize 整数 srcの縦or横幅がこの値以上なら、この値となるように大きさを変換して代入される -1なら処理されない 省略可
//出力
//なし
function cvLoadImageAtEventFile(file, imgId, iplImage, maxSize)
{
    try{
        if(cvUndefinedOrNull(maxSize)) maxSize = -1;
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event){
            var imgElement = document.getElementById(imgId);
            imgElement.src = "data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEHAAEALAAAAAABAAEAAAICTAEAOw==";
            imgElement.onload = function(){
                imgElement.src = event.target.result;
                imgElement.onload = function(){
                    var originalSize = cvGetOriginalSizeAtImgElement(imgElement);
                    var scale = 1;
                    if(maxSize != -1 && (originalSize.width > maxSize || originalSize.height > maxSize))
                        scale = (originalSize.width > originalSize.height) ?
                        maxSize / originalSize.width : maxSize / originalSize.height;
                    imgElement.width = scale * originalSize.width;
                    imgElement.height = scale * originalSize.height;
                    iplImage.canvas = cvGetCanvasAtImgElement(imgElement);
                    iplImage.width = iplImage.canvas.width;
                    iplImage.height = iplImage.canvas.height;
                    iplImage.RGBA = new Array(iplImage.width * iplImage.width * CHANNELS);
                    iplImage.imageData = iplImage.canvas.getContext("2d").getImageData(0, 0, iplImage.canvas.width, iplImage.canvas.height);
                    cvImageData2RGBA(iplImage);
                    event = null;
                };
            };
        };
        reader.onerror = function(event){
            console.log(ERROR.NOT_READ_FILE);
            alert(ERROR.NOT_READ_FILE);
            //			if (event.target.error.code == event.target.error.NOT_READABLE_ERR) {
            //				alert(ERROR.NOT_READ_FILE);
            //			}
        };
    }
    catch(ex){
        alert("cvLoadImageAtEventFile : " + ex);
    }
}


//inputタグからIplImage型に変換し、canvasタグに出力する
//htmlのinputタグのonchangeで呼び出すことを想定
//入力
//event event型 発生したイベント
//canvasId  Id型 読み込んだ画像を表示させるcanvasタグのid
//iplImage IplImage型 srcの値が代入される
//maxSize 整数 srcの縦or横幅がこの値以上なら、この値となるように大きさを変換して代入される -1なら処理されない 省略可
//出力
//なし
function cvLoadImageToCanvas(event, canvasId, iplImage, maxSize){
    try{
        if(cvUndefinedOrNull(event) || cvUndefinedOrNull(canvasId) || cvUndefinedOrNull(iplImage))
            throw "event or canvasId or iplImage" + ERROR.IS_UNDEFINED_OR_NULL;
        var file = event.target.files[0];
        if (file){
            cvLoadImageToCanvasAtEventFile(file, canvasId, iplImage, maxSize);
        }
    }
    catch(ex){
        alert("cvLoadImageToCanvas : " + ex);
    }
}

//event.target.files配列の要素からiplImageに変換しcanvasタグに出力する
//cvLoadImageToCanvasで呼び出すことを想定
//入力
//file file型 event.target.files配列の要素
//canvasId  Id型 読み込んだ画像を表示させるcanvasタグのid
//iplImage IplImage型 srcの値が代入される
//maxSize 整数 srcの縦or横幅がこの値以上なら、この値となるように大きさを変換して代入される -1なら処理されない 省略可
//出力
//なし
function cvLoadImageToCanvasAtEventFile(file, canvasId, iplImage, maxSize)
{
    try{
        if(cvUndefinedOrNull(maxSize)) maxSize = -1;
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event){
            var img = document.createElement('img');
            img.src = event.target.result;
            var originalSize = cvGetOriginalSizeAtImgElement(img);
            var scale = 1;
            if(maxSize != -1 && (originalSize.width > maxSize || originalSize.height > maxSize))
                scale = (originalSize.width > originalSize.height) ?
                maxSize / originalSize.width : maxSize / originalSize.height;
            img.width = scale * originalSize.width;
            img.height = scale * originalSize.height;
            iplImage.canvas = document.getElementById(canvasId);
            iplImage.canvas.width = img.width;
            iplImage.canvas.height = img.height;
            iplImage.canvas.getContext("2d").drawImage(img, 0, 0);
            iplImage.width = iplImage.canvas.width;
            iplImage.height = iplImage.canvas.height;
            iplImage.RGBA = new Array(iplImage.width * iplImage.width * CHANNELS);
            iplImage.imageData = iplImage.canvas.getContext("2d").getImageData(0, 0, iplImage.canvas.width, iplImage.canvas.height);
            cvImageData2RGBA(iplImage);
            cvShowImageToCanvas(canvasId, iplImage);
            event = null;
        };
        reader.onerror = function(event){
            if (event.target.error.code == event.target.error.NOT_READABLE_ERR) {
                alert(ERROR.NOT_READ_FILE);
            }
        };
    }
    catch(ex){
        alert("cvLoadImageToCanvasAtEventFile : " + ex);
    }
}

//IplImage型のRGBAの値をimageDataへ転送
//cvShowImageで呼び出されることを想定
//入力
//iplImage IplImage型 自身のimageDataへ自身のRGBAの値がコピーされる画像
//出力
//なし
function cvRGBA2ImageData(iplImage){
    try{
        if(cvUndefinedOrNull(iplImage)) throw "iplImage" + ERROR.IS_UNDEFINED_OR_NULL;
        for(var i = 0 ; i < iplImage.height ; i++){
            var is = i * iplImage.width * CHANNELS;
            var js = 0;
            for(var j = 0 ; j < iplImage.width ; j++){
                for(var c = 0 ; c < CHANNELS; c++){
                    iplImage.imageData.data[c + js + is] = iplImage.RGBA[c + js + is];
                }
                js += CHANNELS;
            }
        }
    }
    catch(ex){
        alert("RGBA2ImageData : " + ex);
    }
}
//IplImage型のimageDataの値をRGBAへ転送
//cvLoad**で呼び出されることを想定
//入力
//iplImage IplImage型 自身のRGBAへ自身のimageDataの値がコピーされる画像
//出力
//なし
function cvImageData2RGBA(iplImage){
    try{
        if(cvUndefinedOrNull(iplImage)) throw "iplImage" + ERROR.IS_UNDEFINED_OR_NULL;
        for(var i = 0 ; i < iplImage.height ; i++){
            var is = i * iplImage.width * CHANNELS;
            var js = 0;
            for(var j = 0 ; j < iplImage.width ; j++){
                for(var c = 0 ; c < CHANNELS; c++){
                    iplImage.RGBA[c + js + is] = iplImage.imageData.data[c + js + is] ;
                }
                js += CHANNELS;
            }
        }
    }
    catch(ex){
        alert("RGBA2ImageData : " + ex);
    }
}

//canvasタグからIplImageへ転送
//入力
//canvasId canvasタグ canvasタグのオブジェクト
//出力
//IplImage型
function cvGetIplImageAtCanvas(canvasId){
    var iplImage = null;
    try{
        var canvasElement = document.getElementById(canvasId);
        iplImage = cvGetIplImageAtCanvasElement(canvasElement);
    }
    catch(ex){
        alert("cvGetIplImageAtCanvas : " + ex);
    }
    return iplImage;
}

//canvasエレメントからIplImageへ転送
//入力
//canvasElement canvasエレメント canvasのオブジェクト
//出力
//IplImage型
function cvGetIplImageAtCanvasElement(canvasElement){
    var iplImage = null;
    try{
        if(cvUndefinedOrNull(canvasElement))
            throw "canvas" + ERROR.IS_UNDEFINED_OR_NULL;
        
        iplImage = cvCreateImage(canvasElement.width, canvasElement.height);
        iplImage.imageData =
        canvasElement.getContext("2d").getImageData(0, 0, canvasElement.width, canvasElement.height);
        cvImageData2RGBA(iplImage);
    }
    catch(ex){
        alert("cvGetIplImageAtCanvasElement : " + ex);
    }
    return iplImage;
}

//imgタグのsrcからiplImageに変換する
//入力
//imgId  Id型 変換されるimgタグ
//出力
//iplImage型
//備考
//ローカル環境では動かない
function cvGetIplImageAtImg(imgId){
    var iplImage = null;
    try{
        if(cvUndefinedOrNull(imgId)) throw "imgId" + ERROR.IS_UNDEFINED_OR_NULL;
        var imgElement = document.getElementById(imgId);
        iplImage = new IplImage();
        iplImage.canvas = cvGetCanvasAtImgElement(imgElement);
        iplImage.width = iplImage.canvas.width;
        iplImage.height = iplImage.canvas.height;
        iplImage.RGBA = new Array(iplImage.width * iplImage.width * CHANNELS);
        var context = iplImage.canvas.getContext("2d");
        iplImage.imageData = context.getImageData(0, 0, iplImage.canvas.width, iplImage.canvas.height);
        for(var i = 0 ; i < iplImage.height ; i++){
            var is = i * iplImage.width * CHANNELS;
            var js = 0;
            for(var j = 0 ; j < iplImage.width ; j++){
                for(var c = 0 ; c < CHANNELS ; c++){
                    iplImage.RGBA[c + js + is] = iplImage.imageData.data[c + js + is];
                }
                js += CHANNELS;
            }
        }
    }
    catch(ex){
        alert("cvGetIplImageAtImg : " + ex);
    }
    
    return iplImage;
}


//imgタグからcanvasへ転送
//cvLoadImageで呼び出されることを想定
//入力
//image imgタグ imgタグのオブジェクト
//出力
//canvasタグ
function cvGetCanvasAtImgElement(image){
    var canvas = null;
    try{
        if(cvUndefinedOrNull(image)) throw "image" + ERROR.IS_UNDEFINED_OR_NULL;
        
        canvas = document.createElement('canvas');
        
        if(cvUndefinedOrNull(canvas)) throw "canvas" + ERROR.IS_UNDEFINED_OR_NULL;
        
        canvas.width = image.width;
        canvas.height = image.height;
        
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    }
    catch(ex){
        alert("cvGetCanvasAtImgElement : " + ex);
    }
    return canvas;
}

// get Image true size
function cvGetOriginalSizeAtImgElement(image){
    var w = 0 , h = 0 ;
    try{
        if(cvUndefinedOrNull(image)) throw "image" + ERROR.IS_UNDEFINED_OR_NULL;
        
        w = image.width ;
        h = image.height ;
        
        if ( image.naturalWidth !== undefined ) {  // for Firefox, Safari, Chrome
            w = image.naturalWidth;
            h = image.naturalHeight;
            
        } else if ( image.runtimeStyle !== undefined ) {    // for IE
            var run = image.runtimeStyle;
            var mem = { w: run.width, h: run.height };  // keep runtimeStyle
            run.width  = "auto";
            run.height = "auto";
            w = image.width;
            h = image.height;
            run.width  = mem.w;
            run.height = mem.h;
            
        } else {         // for Opera
            var mem = { w: image.width, h: image.height };  // keep original style
            image.removeAttribute("width");
            image.removeAttribute("height");
            w = image.width;
            h = image.height;
            image.width  = mem.w;
            image.height = mem.h;
        }
    }
    catch(ex){
        alert("cvGetOriginalSizeAtImgElement : " + ex);
    }
    
    return {width:w, height:h};
}