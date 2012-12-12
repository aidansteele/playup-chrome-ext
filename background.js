chrome.webRequest.onBeforeSendHeaders.addListener(
  function(info) {
    var key = "<base64 auth key>";
    var id = "<base64 auth id>";
    var api_key = "<api key>";
  
    var timestamp = Math.round(new Date().getTime() / 1000);
    var nonce = "" + Math.random();
    
    var p = document.createElement('a');
    p.href = info.url;
    var path = p.pathname;
    var host = p.hostname + p.search;
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
      "http://*.playupdev.com/*",
      "http://localhost/*"
    ]
  },
  // extraInfoSpec
  ["blocking", "requestHeaders"]);

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
      "http://*/*"
    ]
  },
  // extraInfoSpec
  ["blocking", "responseHeaders"]);
