
//外部jsの読み込み
document.write('<script type="text/javascript" charset="UTF-8" src="' + OPENCVJS_MODULE_PATH + 'core.js"></script>');
document.write('<script type="text/javascript" charset="UTF-8" src="' + OPENCVJS_MODULE_PATH + 'imgcodecs.js"></script>');
document.write('<script type="text/javascript" charset="UTF-8" src="' + OPENCVJS_MODULE_PATH + 'imgproc.js"></script>');
document.write('<script type="text/javascript" charset="UTF-8" src="' + OPENCVJS_MODULE_PATH + 'ml.js"></script>');
document.write('<script type="text/javascript" charset="UTF-8" src="' + OPENCVJS_MODULE_PATH + 'highgui.js"></script>');

//開発中メソッド
document.write('<script type="text/javascript" charset="UTF-8" src="' + OPENCVJS_MODULE_PATH + '00_develop.js"></script>');

//test用メソッド
document.write('<script type="text/javascript" charset="UTF-8" src="' + OPENCVJS_MODULE_PATH + 'test.js"></script>');

//メモ
//imgタグの画像から直接IplImage型へは変換できない
//ローカルの画像ファイルはクロスドメイン扱いとなりjavascriptのエラーが出る