// 定数
let COOKIE_NAME = "AccessPass";
let TIME_STEP = 30;
let TARGET_DOMAIN = "localhost";

// Local Storageを初期化する。
if (localStorage['icon'] === undefined) {
  localStorage['icon'] = 'open.png';
}
// 起動時にアイコンを設定する。
chrome.browserAction.setIcon({
  path: localStorage['icon']
});


// アイコンの表示を変更する。
function switchOnOff() {
  if (localStorage['icon'] === 'open.png') {
    localStorage['icon'] = 'close.png'
  } else {
    localStorage['icon'] = 'open.png'
  }
  chrome.browserAction.setIcon({
    path: localStorage['icon']
  });
};


// TOTPを生成するメソッド
function generateTotp(utcTime, key) {
  var timeFrame = Math.floor(utcTime / TIME_STEP);
  var hashVal = CryptoJS.HmacSHA1(String(timeFrame), key);
  return String(hashVal);
};


// 通信時に認証に用いるクッキーを設定するメソッド
chrome.webRequest.onBeforeRequest.addListener(function (details) {
  if (localStorage['icon'] === 'close.png') {
    return;
  }
  
  var utcTime = Math.floor(Date.now() / 1000); //現在の時刻(秒単位)
  console.log('UTC : ' + utcTime);
  
  // クッキーを設定する。
  chrome.cookies.set({
    "name": COOKIE_NAME,
    "url": "https://" + TARGET_DOMAIN,
    "path": "/",
    "value": generateTotp(utcTime,  localStorage['securityKey']),
    "secure": true,
    "httpOnly": true,
    "sameSite":"strict",
    "expirationDate": utcTime + 180
  }, function (cookie) {
    console.log("Cookie : " + JSON.stringify(cookie));
  });
  return {
    redirectUrl: details.url
  }
}, {
  urls: ["https://" + TARGET_DOMAIN + "/*"]
}, ["blocking"]);


// Popup画面からのリクエストを受け取る。
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  switch (request.type) {
  case 'onOff':
    switchOnOff(); //On/Offの切り替え
    break;
  case 'securityKey':
    // ストレージに保存
    localStorage['securityKey'] = request.value;
    break;
  default:
    //エラー
    console.log(request);
  }
  return true;
})
