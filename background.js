chrome.browserAction.onClicked.addListener(function(tab) {
  var maxwidth = 800;
  var maxheight = 715;

  chrome.windows.create({
    url:chrome.extension.getURL("index.html"),
      "height": maxheight,
      "width": maxwidth,
    });
  });

// chrome.browserAction.onClicked.addListener(function(tab) {
//     chrome.windows.create({
//       url: chrome.runtime.getURL("index.html"),
//       type: "popup"
//     }, function(win) {
//       // win represents the Window object from windows API
//       // Do something after opening
//     });
//   });
