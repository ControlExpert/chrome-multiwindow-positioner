'use strict';

try {
  chrome.runtime.onInstalled.addListener(details => {
    console.log('previousVersion', details.previousVersion);
  });
} catch(err) {
  (console.error || console.log).call(console, err.stack || err);
}

function showOptionsPage() {
  try {
    chrome.runtime.openOptionsPage();
  } catch(err) {
    (console.error || console.log).call(console, err.stack || err);
  }
}

//chrome.browserAction.setBadgeText({text: '\'Allo'});
//chrome.browserAction.onClicked.addListener(showOptionsPage);

//console.log('\'Allo \'Allo! Event Page for Browser Action');

const OPTIONS_KEY = 'TAB_HELPER_OPTIONS';

const POSITIONS = {
  CENTER: {id: 'center', name: 'center'},
  LEFT_HALF: {id: 'left-half', name: 'left-half'},
  RIGHT_HALF: {id: 'right-half', name: 'right-half'},
  TOP_HALF: {id: 'top-half', name: 'top-half'},
  BOTTOM_HALF: {id: 'bottom-half', name: 'bottom-half'},
  FULLSCREEN: { id: 'fullscreen', name: 'fullscreen' }
};

const WINDOW_ID_NONE = -1;
const PIXEL_MONITOR_DETECTION_DELTA = 100;
const WINDOW_CHANGE_DETECTION_INTERVAL = 1000;
const MAX_MOVE_TRIES = 10;

const WINDOW_CACHE_SIZE = 20;
const windowCache = [];

const WINDOW_STATES = {
  NORMAL: 'normal',
  MINIMIZED: 'minimized',
  MAXIMIZED: 'maximized',
  FULLSCREEN: 'fullscreen',
  DOCKED: 'docked'
};

const states = {
  lastWindowInFocus: WINDOW_ID_NONE,
  currentWindowInFocus: WINDOW_ID_NONE,
  currentWindowLocationHandler: null
};

let displayInfos = [];

loadDisplayInfos();

function loadDisplayInfos() {
  try {
    chrome.system.display.getInfo(function (displayInfosResult) {
      displayInfos = displayInfosResult;
    });
  } catch(err) {
    (console.error || console.log).call(console, err.stack || err);
  }
}


// chrome.windows.onRemoved.addListener(function callback(windowId) {
//   console.log('Window removed ' + windowId);
//   const indexToRemove = findCachedWindow(windowId);
//   if (indexToRemove !== -1) {
//     const window = windowCache[indexToRemove];
//     windowCache.splice(indexToRemove, 1);
//     updateTabRules(windowId, window);
//   }
// });

function findCachedWindow(windowId) {
  let found = -1;
  try {
    for (let idx = 0; idx < windowCache.length; idx++) {
      if (windowCache[idx].id === windowId) {
        found = idx;
      }
    }
  } catch(err) {
    (console.error || console.log).call(console, err.stack || err);
  }
  return found
}

function storeWindowIntoCache(window) {
  try {
    const idx = findCachedWindow(window.id);
    if (idx >= 0) {
      windowCache.splice(idx, 1);
    }
    if (windowCache.length >= WINDOW_CACHE_SIZE) {
      windowCache.shift();
    }
    console.log('Window cached ' + window.id);
    windowCache.push(window);
  } catch(err) {
    (console.error || console.log).call(console, err.stack || err);
  }
}

try {
  chrome.windows.onFocusChanged.addListener(onFocusChangeListener);
} catch(err) {
  (console.error || console.log).call(console, err.stack || err);
}

function onFocusChangeListener(windowId) {
  try {
    console.log('Window Focused ' + windowId);
    const allIdentifiersMap = {};
    allIdentifiersMap['i' + states.lastWindowInFocus] = states.lastWindowInFocus;
    allIdentifiersMap['i' + states.currentWindowInFocus] = states.currentWindowInFocus;
    allIdentifiersMap['i' + windowId] = windowId;

    states.lastWindowInFocus = states.currentWindowInFocus;
    states.currentWindowInFocus = windowId;
    console.log('Window transition ' + states.lastWindowInFocus + ' to ' + states.currentWindowInFocus);

    for (const key in allIdentifiersMap) {
      if (allIdentifiersMap.hasOwnProperty(key)) {
        const windowId = allIdentifiersMap[key];
        if (windowId !== WINDOW_ID_NONE) {
          startUpdateTabRules(windowId);
        }
      }
    }
  } catch(err) {
    (console.error || console.log).call(console, err.stack || err);
  }

  function startUpdateTabRules(targetWindowId) {
    setTimeout(function () {
      updateTabRules(targetWindowId);
      setTimeout(function () {
        updateTabRules(targetWindowId);
      }, WINDOW_CHANGE_DETECTION_INTERVAL * 5);
    }, WINDOW_CHANGE_DETECTION_INTERVAL);
  }

}

function updateTabRules(windowId, cachedWindow) {
  try {
    if (cachedWindow) {
      doUpdateTabRules(cachedWindow);
    } else {
      chrome.windows.get(windowId, {
        populate: true
      }, function (window) {
        try {
          if (window) {
            storeWindowIntoCache(window);
            doUpdateTabRules(window);
          }
        } catch (e) {
          if (e.toString().indexOf('No window with id') >= 0) {
          }
        }
      });
    }
  } catch(err) {
    (console.error || console.log).call(console, err.stack || err);
  }

  function doUpdateTabRules(window) {
    if (window && window.tabs) {
      const tabRuleOptions = loadOptions();
      for (let idx = 0; idx < window.tabs.length; idx++) {
        const tab = window.tabs[idx];
        const tabRule = findTabRuleMatch(tabRuleOptions, tab);
        if (tabRule && tabRule.remember && !validateTabLocation(window, tab, tabRule)) {
          const monitor = findMonitorByWindow(window);
          if (monitor) {
            const position = determinePositionByCurrentLocation(monitor, window);
            if (position) {
              const changed = updateTabRuleByLocation(tabRule, monitor, position, windowId);
              if (changed) {
                saveOptions(tabRuleOptions);
              }
            }
          }
        }
      }
    }
  }
}

function determinePositionByCurrentLocation(monitor, window) {
  let position = POSITIONS.CENTER.id;
  try {
    if (window.state === WINDOW_STATES.MAXIMIZED) {
      position = POSITIONS.CENTER.id;
    } else if (window.state === WINDOW_STATES.FULLSCREEN) {
      position = POSITIONS.FULLSCREEN.id;
    } else {
      for (const key in POSITIONS) {
        if (POSITIONS.hasOwnProperty(key)) {
          const workArea = calculateWorkAreaByPosition(monitor.workArea, POSITIONS[key].id);
          if (matchesWorkArea(window, workArea, PIXEL_MONITOR_DETECTION_DELTA)) {
            position = POSITIONS[key].id;
            break;
          }
        }
      }
    }
  } catch(err) {
    (console.error || console.log).call(console, err.stack || err);
  }
  return position;
}

function matchesWorkArea(window, workArea, pixelErrorMargin) {
  let matches = false;
  try {
    const delta = pixelErrorMargin ? pixelErrorMargin : 0;
    matches = (
      window.top >= (workArea.top - delta) &&
      window.top <= (workArea.top + delta) &&
      window.top + window.height >= (workArea.top - delta) + workArea.height &&
      window.top + window.height <= (workArea.top + delta) + workArea.height &&
      window.left >= (workArea.left - delta) &&
      window.left <= (workArea.left + delta) &&
      window.left + window.width >= (workArea.left - delta) + workArea.width &&
      window.left + window.width <= (workArea.left + delta) + workArea.width
    );
  } catch(err) {
    (console.error || console.log).call(console, err.stack || err);
  }
  return matches;
}

function findMonitorByWindow(window) {
  let monitor = null;
  try {
    let highestIdx = -1;
    let highestArea = -1;
    for (let idx = 0; idx < displayInfos.length; idx++) {
      const display = displayInfos[idx];
      const displayWorkArea = display.workArea;
      const rightMostLeft = window.left > displayWorkArea.left ? window.left : displayWorkArea.left;
      const leftMostRight = window.left + window.width < displayWorkArea.left + displayWorkArea.width ?
        window.left + window.width : displayWorkArea.left + displayWorkArea.width;
      const bottomMostTop = window.top > displayWorkArea.top ? window.top : displayWorkArea.top;
      const topMostBottom = window.top + window.height < displayWorkArea.top + displayWorkArea.height ?
        window.top + window.height : displayWorkArea.top + displayWorkArea.height;

      const area = (leftMostRight - rightMostLeft) * (topMostBottom - bottomMostTop);
      if (area > highestArea) {
        highestArea = area;
        highestIdx = idx;
      }
      /*if (window.top >= displayWorkArea.top &&
       window.top <= displayWorkArea.top + displayWorkArea.height &&
       window.left >= displayWorkArea.left &&
       window.left <= displayWorkArea.left + displayWorkArea.width) {
       monitor = display;
       break;
       }*/
    }
    if (highestIdx !== -1) {
      monitor = displayInfos[highestIdx];
    }
  } catch(err) {
    (console.error || console.log).call(console, err.stack || err);
  }
  return monitor;
}

function updateTabRuleByLocation(tabRule, monitor, position, windowId) {
  let changed = false;
  try {
    if (tabRule.position !== position &&
      tabRule.monitor.id !== monitor.id) {
      console.log('TabRule Reposition Saved (triggered by window.id:' + windowId + ')');
      console.log(tabRule.position + ' -> ' + position);
      console.log(tabRule.monitor.workArea);
      console.log(monitor.workArea);
      tabRule.position = position;
      tabRule.monitor = monitor;
      changed = true;
    }
  } catch(err) {
    (console.error || console.log).call(console, err.stack || err);
  }

  return changed;
}

function validateTabLocation(window, tab, tabRule) {
  let valid = true;
  try {
    valid = (window.left === tabRule.monitor.workArea.left &&
      window.top === tabRule.monitor.workArea.top &&
      window.width === tabRule.monitor.workArea.width &&
      window.height === tabRule.monitor.workArea.height);
  } catch(err) {
    (console.error || console.log).call(console, err.stack || err);
  }
  return valid;
}

function findTabRuleMatch(tabRuleOptions, tab) {
  let match = null;
  try {
    if (tab) {
      for (let idx = 0; idx < tabRuleOptions.tabs.length; idx++) {
        const tabRule = tabRuleOptions.tabs[idx];
        if (tabRule.active && tab.url && tabRule.url && tab.url.indexOf(tabRule.url) >= 0) {
          match = tabRule;
          break;
        }
      }
    }
  } catch(err) {
    (console.error || console.log).call(console, err.stack || err);
  }
  return match;
}

function findCustomPositionMatch(tabRuleOptions, custom) {
  let match = null;
  try {
    if (custom) {
      for (let idx = 0; idx < tabRuleOptions.positions.length; idx++) {
        const customPosition = tabRuleOptions.positions[idx];
        if (customPosition.name && customPosition.name !== '' && customPosition.name === custom) {
          match = customPosition;
          break;
        }
      }
    }
  } catch(err) {
    (console.error || console.log).call(console, err.stack || err);
  }
  return match;
}

function calculateWorkAreaByPosition(monitorWorkArea, position) {
  const workarea = {
    left: monitorWorkArea.left,
    top: monitorWorkArea.top,
    width: monitorWorkArea.width,
    height: monitorWorkArea.height
  };

  if (position === POSITIONS.LEFT_HALF.id) {
    workarea.width = Math.floor(workarea.width / 2);
  }
  if (position === POSITIONS.RIGHT_HALF.id) {
    const halfWidth = Math.floor(workarea.width / 2);
    workarea.left += workarea.width - halfWidth;
    workarea.width = halfWidth;
  }
  if (position === POSITIONS.TOP_HALF.id) {
    workarea.height = Math.floor(workarea.height / 2);
  }
  if (position === POSITIONS.BOTTOM_HALF.id) {
    const halfHeight = Math.floor(workarea.height / 2);
    workarea.top += workarea.height - halfHeight;
    workarea.height = halfHeight;
  }
  return workarea;
}

function loadOptions() {
  let tabRuleOptions = localStorage[OPTIONS_KEY];
  try {
    tabRuleOptions = tabRuleOptions ? JSON.parse(tabRuleOptions) : {
      tabs: []
    };
    if (!tabRuleOptions.options) {
      tabRuleOptions.options = [];
    }
  } catch(err) {
    (console.error || console.log).call(console, err.stack || err);
  }
  return tabRuleOptions;
}

function saveOptions(tabRuleOptions) {
  localStorage[OPTIONS_KEY] = JSON.stringify(tabRuleOptions);
}

try {
  chrome.tabs.onCreated.addListener(onTabCreated);
  //chrome.tabs.onUpdated.addListener(onTabUpdate);
} catch(err) {
  (console.error || console.log).call(console, err.stack || err);
}

// function onTabUpdate(tabId, changeInfo, tab) {
//   if (changeInfo.url && changeInfo.url !== '') {
//     console.log('Tab updated id:' + tab.id + ' url:' + changeInfo.url);
//     onTabCreated(tab, true);
//   }
// }

function getInt(value) {
  let intValue = 0;
  try {
    if (typeof(value) === 'string') {   
      intValue = parseInt(value, 10);
    } else if (typeof(value) === 'number') {
      intValue = value;
    }
  } catch(err) {
    (console.error || console.log).call(console, err.stack || err);
  }
  return intValue;
}

function onTabCreated(tab, disableCreationMessage) {
  try {
    if (!disableCreationMessage) {
      console.log('Tab Created id:' + tab.id + ' url:' + tab.url);
    }
    moveTabIntoPositionedWindow(tab, 0);
  } catch(err) {
    (console.error || console.log).call(console, err.stack || err);
  }
  
  function moveTabIntoPositionedWindow(tab, count) {
    if (count > MAX_MOVE_TRIES) {
      console.log('Tab with empty url could not be resolved after ' + MAX_MOVE_TRIES + ' tries');
    }
    if (!tab.url || tab.url === '') {
      console.log('Tab with empty url, trying in 100ms');
      setTimeout(function () {
        chrome.tabs.get(tab.id, function (tab) {
          moveTabIntoPositionedWindow(tab, count + 1);
        });
      }, 100);
    } else {

      const tabRuleOptions = loadOptions();
      const tabRule = findTabRuleMatch(tabRuleOptions, tab);
      let isCustomPosition = false;
      if (tabRule) {
        console.log('Tab matched ' + tab.id + ' moving tab with url:' + tab.url);
        let createData = calculateWorkAreaByPosition(tabRule.monitor.workArea, tabRule.position);
        
        if (tabRule.custom && tabRuleOptions.positions && tabRuleOptions.positions.length > 0) {
          const customPosition = findCustomPositionMatch(tabRuleOptions, tabRule.custom);
          if (customPosition) {
            createData = {
              left: getInt(customPosition.x),
              top: getInt(customPosition.y),
              width: getInt(customPosition.width),
              height: getInt(customPosition.height)
            };
            isCustomPosition = true;
          }
        }

        createData.tabId = tab.id;
        if (tabRule.popup) {
          createData.type = 'popup';
        }
        chrome.windows.create(createData, function onCreated(window) {
          if (!isCustomPosition && tabRule.position === POSITIONS.CENTER.id) {
            console.log('Maximizing tab matched ' + tab.id + ' moving tab with url:' + tab.url);
            // maximized mode, should only be set after the tab has moved to the right monitor.
            chrome.windows.update(window.id, {state:'maximized'}, function onUpdated() {
              console.log('Maximized');
            });
          } else if (!isCustomPosition && tabRule.position === POSITIONS.FULLSCREEN.id) {
            console.log('Fullscreen tab matched ' + tab.id + ' moving tab with url:' + tab.url);
            // maximized mode, should only be set after the tab has moved to the right monitor.
            chrome.windows.update(window.id, {state:'fullscreen'}, function onUpdated() {
              console.log('Fullscreen');
            });
          }
        });
      }
    }
  }
}

