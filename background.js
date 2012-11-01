chrome.webRequest.onBeforeSendHeaders.addListener(
  function(info) {
    new_hdr = {"name": "X-PlayUp-Api-Key", "value": "<YOUR API KEY GOES HERE>"};
    hdrs = info.requestHeaders;
    hdrs.push(new_hdr);
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
