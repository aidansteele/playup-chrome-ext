var nextContentType = null;

function playupHmac(method, url)
{
  var key = localStorage["hmac-key"];
  var id = localStorage["hmac-id"];
  
  var timestamp = Math.round(new Date().getTime() / 1000);
  var nonce = "" + Math.random();
    
  var p = document.createElement('a');
  p.href = url;
  var path = p.pathname;
  var host = p.hostname;
  var port = p.port;
    
  if (port.length == 0)
  {
    port = p.protocol == "http:" ? "80" : "443";
  }
        
  var source = [timestamp, nonce, method, path, host, port, "", ""].join("\n");
  var sha_obj = new jsSHA(source, "TEXT");
  var hmac = sha_obj.getHMAC(key, "TEXT", "SHA-256", "B64");
    
  var auth_hdr = 'MAC id="' + id + '",ts="' + timestamp + '",nonce="' + nonce + '",mac="' + hmac + '"';
  return auth_hdr;
}

chrome.webRequest.onBeforeSendHeaders.addListener(
  function(info) {
    localStorage["api-key"] = "<api key>";
    var api_key = localStorage["api-key"];
    
    var new_hdrs = [];
    var applied_content_type = false;

    for (idx in info.responseHeaders)
    {
      hdr = info.responseHeaders[idx];

      if (nextContentType === null || hdr.name.toLowerCase() !== "accept")
      {
        new_hdrs.push(hdr);
      }
    }

    if (nextContentType !== null)
    {
      new_hdrs.push({"name": "Accept", "value": nextContentType + ", */*"});
      nextContentType = null;
    }

    new_hdrs.push({"name": "X-PlayUp-Api-Key", "value": api_key});

    if (localStorage["hmac-key"] !== null && localStorage["hmac-key"])
    {
      new_hdrs.push({"name": "Authorization", "value": playupHmac(info.method, info.url)});
    }

    return {"requestHeaders": new_hdrs};
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

function playupRequest(method, url, async, callback) 
{
  req = new XMLHttpRequest();
  req.open(method, url, async);
  req.setRequestHeader("X-PlayUp-Api-Key", localStorage["api-key"]);
  req.setRequestHeader("Cache-Control", "no-cache");

  if (localStorage["hmac-key"] !== null && localStorage["hmac-key"])
  {
    req.setRequestHeader("Authorization", playupHmac(method, url));
  }

  req.onreadystatechange = function() {
    if (req.readyState != 4) return;
    var obj = JSON.parse(req.responseText);
    callback(obj);
  };

  req.send();
}

function getNewCreds(info)
{
  cred_url = "";
  playupRequest("GET", info["url"], false, function(obj) {
    cred_url = obj[":self"];
  });
        
  playupRequest("POST", cred_url, false, function(obj) {
    localStorage["hmac-key"] = obj["secret"];
    localStorage["hmac-id"] = obj["id"];
  });
}

chrome.webRequest.onCompleted.addListener(
  function(info) {
    if (info["statusCode"] == 401 && info["type"] == "main_frame")
    {
      getNewCreds(info);
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

chrome.webRequest.onBeforeRequest.addListener(
  function(info) {
    var customTypeCharIndex = info.url.lastIndexOf("$");

    if (customTypeCharIndex > 0)
    {
      var url = info.url.substring(0, customTypeCharIndex);
      nextContentType = info.url.substring(customTypeCharIndex + 1);

      return {"redirectUrl": url};
    }

    return {};
  },
  {
    urls: [
      "*://*.playupdev.com/*",
      "*://*.playup.com/*",
      "*://localhost/*"
    ]
  },
  ["blocking"]);
