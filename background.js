chrome.webRequest.onBeforeSendHeaders.addListener(
  function(info) {
    localStorage["api-key"] = "<api key>";
    var key = localStorage["hmac-key"];
    var id = localStorage["hmac-id"];
    var api_key = localStorage["api-key"];
  
    var timestamp = Math.round(new Date().getTime() / 1000);
    var nonce = "" + Math.random();
    
    var p = document.createElement('a');
    p.href = info.url;
    var path = p.pathname;
    var host = p.hostname;
    var port = p.port;
    
    if (port.length == 0)
    {
      port = p.protocol == "http:" ? "80" : "443";
    }
        
    var source = [timestamp, nonce, info.method, path, host, port, "", ""].join("\n");
    var sha_obj = new jsSHA(source, "TEXT");
    var hmac = sha_obj.getHMAC(key, "TEXT", "SHA-256", "B64");
    
    var auth_hdr = 'MAC id="' + id + '",ts="' + timestamp + '",nonce="' + nonce + '",mac="' + hmac + '"';
    
    hdrs = info.requestHeaders;
    hdrs.push({"name": "X-PlayUp-Api-Key", "value": api_key});
    hdrs.push({"name": "Authorization", "value": auth_hdr});
    return {"requestHeaders": hdrs};
  },
  {
    urls: [
      "*://*.playupdev.com/*",
      "*://*.playup.com/*",
      "*://localhost/*"
    ]
  },
  // extraInfoSpec
  ["blocking", "requestHeaders"]);

chrome.webRequest.onCompleted.addListener(
  function(info) {
    if (info["statusCode"] == 401 && info["type"] == "main_frame")
    {
      cred_req = new XMLHttpRequest();
      cred_req.open("GET", info["url"], false);
      cred_req.setRequestHeader("X-PlayUp-Api-Key", localStorage["api-key"]);
      cred_req.setRequestHeader("Cache-Control", "no-cache");
      cred_url = "";
      cred_req.onreadystatechange = function() {
        if (cred_req.readyState != 4) return;
        var this_body = JSON.parse(cred_req.responseText);
        cred_url = this_body[":self"];
      };
      cred_req.send();
      
      var req = new XMLHttpRequest();
      req.open("POST", cred_url, true);
      req.setRequestHeader("X-PlayUp-Api-Key", localStorage["api-key"]);
      req.onreadystatechange = function() {
        if (req.readyState != 4) return;
        var obj = JSON.parse(req.responseText);
        localStorage["hmac-key"] = obj["secret"];
        localStorage["hmac-id"] = obj["id"];
      };
      req.send();
    } 
  }, {
      urls: [
      "*://*.playupdev.com/*",
      "*://*.playup.com/*",
      "*://localhost/*"
    ]
  });


chrome.webRequest.onHeadersReceived.addListener(
  function(info) {
    new_hdrs = []
    for (idx in info.responseHeaders)
    {
      hdr = info.responseHeaders[idx];
      if (hdr.value.indexOf("application/vnd.playup") == 0)
      {
        new_hdrs.push({"name": hdr.name, "value": "application/json;charset=utf-8"});
      }
      else
      {
      	new_hdrs.push(hdr);
      }
    }
    
    return {"responseHeaders": new_hdrs};
  },
  {
    urls: [
      "*://*/*"
    ]
  },
  // extraInfoSpec
  ["blocking", "responseHeaders"]);
