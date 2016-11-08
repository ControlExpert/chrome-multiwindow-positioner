'use strict';

angular.module('tabHelper', ['ngFileUpload']).controller('TabHelperOptionsController',
  ['$scope', '$timeout', 'Upload', function ($scope, $timeout, Upload) {
    var vm = $scope;

    var OPTIONS_KEY = 'TAB_HELPER_OPTIONS';

    var POSITIONS = {
      CENTER: {id: 'center', name: 'center'},
      LEFT_HALF: {id: 'left-half', name: 'left-half'},
      RIGHT_HALF: {id: 'right-half', name: 'right-half'},
      TOP_HALF: {id: 'top-half', name: 'top-half'},
      BOTTOM_HALF: {id: 'bottom-half', name: 'bottom-half'}
    };

    var MONITORS = {};

    vm.POSITIONS = POSITIONS;
    vm.MONITORS = MONITORS;

    vm.options = null;
    vm.showNewTabOption = false;
    vm.showEditTabOption = false;
    vm.inconsistentOptions = false;
    vm.dirty = false;
    vm.showExtraOptions = false;
    vm.isopen = true;

    vm.markAsDirty = markAsDirk;
    vm.saveOptions = saveOptions;
    vm.loadOptions = loadOptions;
    vm.reloadOptions = reloadOptions;
    vm.detectMonitors = detectMonitors;
    vm.showAdvancedOptions = showAdvancedOptions;
    vm.addTabOption = addTabOption;
    vm.saveTabOption = saveTabOption;
    vm.updateTabOption = updateTabOption;
    vm.editTabOption = editTabOption;
    vm.useTemplateAsOption = useTemplateAsOption;

    vm.autofixOptions = autofixOptions;
    vm.validateOptions = validateOptions;

    vm.moveOptionUp = moveOptionUp;
    vm.moveOptionDown = moveOptionDown;

    vm.importTemplate = importTemplate;
    vm.exportTemplate = exportTemplate;

    vm.cancelTabOption = cancelTabOption;

    vm.deleteTabOption = deleteTabOption;

    activate();

    //////////////////////////////////////////////////////////////////

    function activate() {
      loadOptions();
      chrome.system.display.getInfo(function (displayInfos) {
        vm.displayInfos = angular.copy(displayInfos);
        console.table(displayInfos);
        _.forEach(vm.displayInfos, function (display, idx) {
          display.idx = idx + 1;
          var monitor = {
            id: display.id,
            idx: display.idx,
            name: display.idx + ' ' + display.name,
            workArea: display.workArea
          };
          MONITORS[monitor.id] = monitor;
        });
        $timeout(function () {
          validateOptions();
        });
      });
    }

    function showAdvancedOptions() {
      vm.showExtraOptions = !vm.showExtraOptions;
    }

    function detectMonitors() {
      _.forEach(vm.displayInfos, function (display, idx) {
        var delay = 3; //3 seconds
        var createData = {
          url: 'https://igorlino.github.io/page-generator/?title=Monitor%20' + (idx + 1) + '&type=monitor&id=' + (idx + 1) + '&delay=' + delay,
          left: display.workArea.left,
          top: display.workArea.top,
          width: display.workArea.width,
          height: display.workArea.height,
          type: 'popup'
        };
        chrome.windows.create(createData, function onWindowsCreated(window) {
          console.log('Window ' + window.id + ' created.');
          setTimeout(function () {
            console.log('Removing window ' + window.id);
            chrome.windows.remove(window.id, function () {
              console.log('Removed window ' + window.id);
            });
          }, (delay * 1000) + 1100); //+800ms to offset detect page loading
        });
      });
    }

    function getPrimaryDisplay() {
      var found = null;
      _.forEach(vm.displayInfos, function (display, idx) {
        if (display.isPrimary) {
          found = display;
        }
      });
      return found;
    }

    function getDisplayById(id) {
      var found = null;
      _.forEach(vm.displayInfos, function (display, idx) {
        //MONITORS[monitor.id] = monitor;
        if (display.id === id) {
          found = display;
        }
      });
      return found;
    }

    function deleteTabOption(tabOption) {
      _.remove(vm.options.tabs, function (option) {
        return option.timestamp === tabOption.timestamp;
      });
      markAsDirk();
    }

    function addTabOption() {
      vm.showNewTabOption = true;
      vm.newTabOption = createNewOption();
      vm.newTabOption.template = null;
    }

    function editTabOption(tabOption) {
      vm.showEditTabOption = true;
      vm.newTabOption = angular.copy(tabOption);
      vm.newTabOption.position = findPositionById(tabOption.position);
      vm.newTabOption.monitor = getDisplayById(tabOption.monitor.id);
      vm.editTabOptionIdx = _.findIndex(vm.options.tabs, tabOption);
      vm.newTabOption.template = null;
    }

    function useTemplateAsOption() {
      if (vm.newTabOption.template) {
        vm.newTabOption.name = vm.newTabOption.template.name;
        vm.newTabOption.url = vm.newTabOption.template.url;
        vm.newTabOption.active = vm.newTabOption.template.active;
      }
    }

    function findPositionById(positionId) {
      var POSS = POSITIONS;
      var positionKey = _.findKey(POSITIONS, function (position) {
        return position.id === positionId;
      });
      return positionKey ? POSITIONS[positionKey] : null;
    }

    function cancelTabOption() {
      vm.showNewTabOption = false;
      vm.showEditTabOption = false;
    }

    function updateTabOption() {
      vm.showEditTabOption = false;
      vm.options.tabs[vm.editTabOptionIdx] = {
        active: vm.newTabOption.active,
        url: vm.newTabOption.url,
        name: vm.newTabOption.name,
        monitor: vm.newTabOption.monitor,
        fullScreen: vm.newTabOption.fullScreen,
        popup: vm.newTabOption.popup,
        position: vm.newTabOption.position ? vm.newTabOption.position.id : 'center',
        timestamp: new Date().toISOString()
      };
      vm.editTabOptionIdx = -1;
      validateOptions();
      markAsDirk();
    }

    function saveTabOption() {
      vm.options.tabs.push({
        active: vm.newTabOption.active,
        url: vm.newTabOption.url,
        name: vm.newTabOption.name,
        monitor: vm.newTabOption.monitor,
        fullScreen: vm.newTabOption.fullScreen,
        popup: vm.newTabOption.popup,
        position: vm.newTabOption.position ? vm.newTabOption.position.id : 'center',
        timestamp: new Date().toISOString()
      });
      vm.showNewTabOption = false;
      validateOptions();
      markAsDirk();
    }

    function saveOptions() {
      localStorage[OPTIONS_KEY] = JSON.stringify(vm.options);
      markAsPristine();
      chrome.tabs.getCurrent(function (tab) {
        chrome.tabs.remove(tab.id, function () {
        });
      });
    }

    function markAsDirk() {
      vm.dirty = true;
    }

    function markAsPristine() {
      vm.dirty = false;
    }

    function loadOptions() {
      var options = localStorage[OPTIONS_KEY];
      if (options) {
        vm.options = JSON.parse(options);
        markAsPristine();
      } else {
        vm.options = {
          tabs: []
        };
        markAsDirk();
      }
      vm.options.templates = getDefaultTemplates();
      return vm.options;
    }

    function reloadOptions() {
      loadOptions();
      validateOptions();
    }

    function validateOptions() {
      var missing = false;
      _.forEach(vm.options.tabs, function (tab, idx) {
        var found = false;
        _.forEach(vm.displayInfos, function (display, idx) {
          if (display.isEnabled && tab.monitor.id === display.id) {
            found = true;
            return false;
          }
        });
        if (!found) {
          tab.inconsistentMonitor = true;
          missing = true;
        } else {
          tab.inconsistentMonitor = false;
        }
      });
      vm.inconsistentOptions = missing;
    }

    function autofixOptions() {
      var primaryDisplay = getPrimaryDisplay();
      _.forEach(vm.options.tabs, function (tab, idx) {
        var found = false;
        var closestMatch = null;
        _.forEach(vm.displayInfos, function (display, idx) {
          if (display.isEnabled && display.workArea &&
            display.workArea.height === tab.monitor.workArea.height &&
            display.workArea.width === tab.monitor.workArea.width) {
            closestMatch = display;
          }
          if (tab.monitor.id === display.id) {
            found = true;
            return false;
          }
        });
        if (!found) {
          if (closestMatch) {
            replaceMonitor(tab.monitor, closestMatch);
          } else if (primaryDisplay) {
            replaceMonitor(tab.monitor, primaryDisplay);
          }
          //monitor: vm.newTabOption.monitor,
          //position: vm.newTabOption.position.id,
        }
      });

      validateOptions();

      function replaceMonitor(target, sourceDisplay) {
        target.workArea = angular.copy(sourceDisplay.workArea);
        target.id = sourceDisplay.id;
        var idx = _.findIndex(vm.displayInfos, sourceDisplay);
        target.name = (idx + 1) + ' ' + sourceDisplay.name;
      }
    }

    function createNewOption() {
      return {
        active: true,
        name: 'Option Name Here',
        url: 'http://any.url/',
        monitor: getPrimaryDisplay(),
        fullScreen: false,
        popup: true,
        position: POSITIONS.CENTER
      };
    }

    function importTemplate(file) {
      Upload.upload({
        url: 'upload/url',
        data: {file: file, 'username': $scope.username}
      }).then(function (resp) {
        console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
      }, function (resp) {
        console.log('Error status: ' + resp.status);
      }, function (evt) {
        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        if (evt.config.data.file.name) {
          console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
        } else {
          console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file);
        }
      });
    }

    function exportTemplate() {
      var optionsAsJson = angular.toJson(vm.options, 3);
      var blob = new Blob([optionsAsJson], {type: 'application/json'});
      var saveAs = window.saveAs;
      saveAs(blob, 'tab-helper-options-export.json');
    }

    function getDefaultTemplates() {
      return [
        {
          active: true,
          name: 'C€2.0 Pruefberichte',
          url: '/reportviewer/'
        },
        {
          active: true,
          name: 'C€2.0 Dokumente',
          url: '/multimediaviewer/?type=pdf'
        },
        {
          active: true,
          name: 'C€2.0 Bilder',
          url: '/multimediaviewer/?type=image'
        },
        {
          active: true,
          name: 'C€2.0 Archive',
          url: '/Common.ArchiveDocumentViewer'
        }
      ]
    }

    function moveOptionUp(first, index) {
      if (!first) {
        swap(vm.options.tabs, index, index - 1);
        markAsDirk();

      }
    }

    function moveOptionDown(last, index) {
      if (!last) {
        swap(vm.options.tabs, index, index + 1);
        markAsDirk();
      }
    }

    function swap(list, idx1, idx2) {
      var tmp = list[idx1];
      list[idx1] = list[idx2];
      list[idx2] = tmp;
    }
  }]);