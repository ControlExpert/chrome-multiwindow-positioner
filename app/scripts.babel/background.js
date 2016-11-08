'use strict';

chrome.runtime.onInstalled.addListener(details => {
  console.log('previousVersion', details.previousVersion);
});

function showOptionsPage() {
  chrome.runtime.openOptionsPage();
}

//chrome.browserAction.setBadgeText({text: '\'Allo'});
chrome.browserAction.onClicked.addListener(showOptionsPage);

//console.log('\'Allo \'Allo! Event Page for Browser Action');

var OPTIONS_KEY = 'TAB_HELPER_OPTIONS';

var POSITIONS = {
  CENTER: {id: 'center', name: 'center'},
  LEFT_HALF: {id: 'left-half', name: 'left-half'},
  RIGHT_HALF: {id: 'right-half', name: 'right-half'},
  TOP_HALF: {id: 'top-half', name: 'top-half'},
  BOTTOM_HALF: {id: 'bottom-half', name: 'bottom-half'}
};

chrome.tabs.onCreated.addListener(function callback(tab) {
  var options = loadOptions();
  console.log('Tab Created ' + tab.id);
  if (tab.url && tab.url !== '') {
    moveTabIntoPositionedWindow(tab);
  } else {
    setTimeout(function () {
      chrome.tabs.get(tab.id, moveTabIntoPositionedWindow);
    }, 100);
    /*chrome.tabs.query({windowId:tab.id}, function (matchedTabs){
     if (matchedTabs && matchedTabs.length > 0) {
     for (var tab in matchedTabs) {
     moveTabIntoPositionedWindow(tab);
     }
     }
     })*/
  }

  function moveTabIntoPositionedWindow(tab) {
    if (!tab) {
      return;
    }
    for (var idx = 0; idx < options.tabs.length; idx++) {
      var displayOptionTab = options.tabs[idx];
      if (displayOptionTab.active && tab.url && displayOptionTab.url && tab.url.indexOf(displayOptionTab.url) >= 0) {
        console.log('Tab matched ' + tab.id);
        var createData = {
          tabId: tab.id,
          left: displayOptionTab.monitor.workArea.left,
          top: displayOptionTab.monitor.workArea.top,
          width: displayOptionTab.monitor.workArea.width,
          height: displayOptionTab.monitor.workArea.height
        };

        if (displayOptionTab.position === POSITIONS.LEFT_HALF.id) {
          createData.width = Math.floor(createData.width / 2);
        }
        if (displayOptionTab.position === POSITIONS.RIGHT_HALF.id) {
          var halfWidth = Math.floor(createData.width / 2);
          createData.left += createData.width - halfWidth;
          createData.width = halfWidth;
        }
        if (displayOptionTab.position === POSITIONS.TOP_HALF.id) {
          createData.height = Math.floor(createData.height / 2);
        }
        if (displayOptionTab.position === POSITIONS.BOTTOM_HALF.id) {
          var halfHeight = Math.floor(createData.height / 2);
          createData.top += createData.height - halfHeight;
          createData.height = halfHeight;
        }

        if (displayOptionTab.popup) {
          createData.type = 'popup';
        }
        chrome.windows.create(createData, function onCreated() {
        });
        break;
      }
    }
  }

  function loadOptions() {
    var options = localStorage[OPTIONS_KEY];
    options = options ? JSON.parse(options) : {
      tabs: []
    };
    return options;
  }
});

