// background.jsにON/OFF切り替えの情報を送る。
document.getElementById("onOff").onclick  = function() {
  chrome.runtime.sendMessage( {
        type: "onOff",
        value: null
    })
};

// background.jsにSecurityKeyの情報を送る。
document.getElementById("securityKeySubmit").onclick  = function() {
  var securityKey = document.getElementById("securityKey").value
  chrome.runtime.sendMessage({
        type: "securityKey",
        value: securityKey
    })
};