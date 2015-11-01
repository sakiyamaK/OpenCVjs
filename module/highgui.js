//IplImage型をimgタグに出力する
//入力
//imgId Id型 imgタグのId
//iplImage IplImage型 imgに転送する画像
//出力
//なし
function cvShowImage(imgId, iplImage){
    try{
        if(cvUndefinedOrNull(imgId) || cvUndefinedOrNull(iplImage))
            throw "imgId or iplImage" + ERROR.IS_UNDEFINED_OR_NULL;
        cvRGBA2ImageData(iplImage);
        if (iplImage.canvas.getContext) {
            
            iplImage.canvas.getContext("2d").putImageData(iplImage.imageData, 0, 0);
            var imgElement = document.getElementById(imgId);
            if(imgElement == null) throw imgId + ERROR.IS_UNDEFINED_OR_NULL;
            
            imgElement.width = iplImage.width;
            imgElement.height = iplImage.height;
            
            imgElement.src = "data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEHAAEALAAAAAABAAEAAAICTAEAOw==";
            imgElement.onload = function(event){
                imgElement.src = iplImage.canvas.toDataURL('image/jpeg');
            };
        }
        else throw ERROR.NOT_GET_CONTEXT;
    }
    catch(ex){
        alert("cvShowImage : " + ex);
    }
}

//IplImage型をcanvasタグに出力する
//入力
//canvasId Id型 canvasタグのId
//iplImage IplImage型 canvasに転送する画像
//出力
//なし
function cvShowImageToCanvas(canvasId, iplImage){
    try{
        if(cvUndefinedOrNull(canvasId) || cvUndefinedOrNull(iplImage))
            throw "canvasId or iplImage" + ERROR.IS_UNDEFINED_OR_NULL;
        var canvasElement = document.getElementById(canvasId);
        cvShowImageToCanvasElement	(canvasElement, iplImage);
    }
    catch(ex){
        alert("cvShowImageToCanvas : " + ex);
    }
}

//IplImage型をcanvasエレメントに出力する
//入力
//canvasElement element型 canvasのエレメント
//iplImage IplImage型 canvasに転送する画像
//出力
//なし
function cvShowImageToCanvasElement(canvasElement, iplImage){
    try{
        if(cvUndefinedOrNull(canvasElement) || cvUndefinedOrNull(iplImage))
            throw "canvasElement or iplImage" + ERROR.IS_UNDEFINED_OR_NULL;
        
        cvRGBA2ImageData(iplImage);
        canvasElement.getContext("2d").putImageData(iplImage.imageData, 0, 0);
    }
    catch(ex){
        alert("cvShowImageToCanvas : " + ex);
    }
}