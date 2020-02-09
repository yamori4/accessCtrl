<?php

const COOKIE_NAME = "AccessPass"; 
const SECRET_KEY = 'hoge'; //アルファベット・記号・数字を含んだ上で、10文字以上は欲しい
const TIME_STEP = 30; 

/**
 * TOTPを生成する。
 */
function generateTotp(String $key): String {
	$crypto =  "sha1";
	$timeFrame = floor(time() / TIME_STEP); //あまりは切り捨てる
	return hash_hmac($crypto, (string)$timeFrame,  $key);
}

/******************/

echo '* Current UTC time';
$utc = time();
echo ('<br/>');
echo $utc;
echo ('<br/>');
echo date('Y/m/d H:i:s', $utc);
echo ('<br /><hr>');

/******************/

echo '* Client Pass';
echo ('<br/>');

$clientPass = $_COOKIE[COOKIE_NAME];
echo($clientPass);
echo ('<br /><hr>');

/******************/

echo '* Server Pass';
echo ('<br/>');

$serverPass = generateTotp(SECRET_KEY);
echo $serverPass;
echo ('<br /><hr>');

/******************/
/*
【備考】
できれば「https://tools.ietf.org/html/rfc6238#section-6」の対応や、
リプレイアタック対策のため、一度使用したPassは使えないようにする(データを保存する処理が必要)
といった機能も実装したほうがいいけれど、今回はやらない。
*/

$respCode;
$comment;
if($clientPass === $serverPass){ //Verify
	$respCode = ( 200 ); // OK
	$comment = "Match !";
}else{
	$respCode = ( 403 ); // Forbidden
	$comment = "Mismatch !!";
}

echo '* Result : ' . $comment;
echo ('<br />');
echo ('Status Code : ' . $respCode);
echo ('<br />');

http_response_code( $respCode);