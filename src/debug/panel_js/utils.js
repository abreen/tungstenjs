'use strict';

var _ = require('underscore');
var logger = require('../../utils/logger');

var debugWindow;

function setDebugWindow(panel) {
  debugWindow = panel;
}

function render() {
  if (debugWindow) {
    debugWindow.render();
  }
}

function gotoTab(tabName) {
  var appData = require('./app_data');
  appData.scrollFlag = true;
  appData.tabs.selected = {};
  appData.tabs.selected[tabName] = true;
  _.each(appData.tabs.tabs, function(data) {
    data.isActive = data.activeTabName === tabName;
  });
  render();
}

function confirm(message) {
  if (debugWindow) {
    return debugWindow.confirm(message);
  }
  return false;
}

function alert(message) {
  if (debugWindow) {
    debugWindow.alert(message);
  }
}

function selectElements(className, docToSearch) {
  if (typeof docToSearch === 'undefined' && debugWindow) {
    docToSearch = debugWindow.document;
  }
  if (typeof docToSearch === 'undefined') {
    return [];
  }

  if (docToSearch.querySelectorAll) {
    return docToSearch.querySelectorAll('.' + className);
  } else if (docToSearch.getElementsByClassName) {
    return docToSearch.getElementsByClassName(className);
  } else {
    var elements = docToSearch.getElementsByTagName('*');
    var pattern = new RegExp('(^|\\s)' + className + '(\\s|$)');
    var results = [];
    for (var i = 0; i < elements.length; i++) {
      if (pattern.test(elements[i].className)) {
        results.push(elements[i]);
      }
    }
    return results;
  }
}

function addEventListener(elem, eventName, handler) {
  if (elem.addEventListener) {
    elem.addEventListener(eventName, handler);
  } else {
    elem.attachEvent('on' + eventName.toLowerCase(), handler);
  }
}

function addEvent(className, eventName, handler, docToSearch) {
  var elems = selectElements(className, docToSearch);
  if (elems && elems.length) {
    for (var i = 0; i < elems.length; i++) {
      addEventListener(elems[i], eventName, handler);
    }
  }
}

function hasClass(elem, className) {
  if (!elem) {
    return false;
  }
  if (elem.classList) {
    return elem.classList.contains(className);
  }
  var elemClass = (' ' + elem.className + ' ').replace(/\s*/g, '');
  return elemClass.indexOf(className) > -1;
}

function closest(elem, className) {
  var target = elem;
  while (target && !hasClass(target, className)) {
    target = target.parentNode;
  }
  return hasClass(target, className) ? target : null;
}

function getListener(objName, eventName) {
  return function(...args) {
    logger.log(objName + ':' + eventName, args);
  };
}

function addListener(obj, eventName) {
  var listener = getListener(obj.getDebugName(), eventName);
  obj.on(eventName, listener);
  return listener;
}

function removeListener(obj, name, listener) {
  obj.off(name, listener);
}

module.exports = {
  selectElements: selectElements,
  addEventListener: addEventListener,
  addEvent: addEvent,
  hasClass: hasClass,
  closest: closest,
  setDebugWindow: setDebugWindow,
  confirm: confirm,
  alert: alert,
  gotoTab: gotoTab,
  render: render,
  addListener: addListener,
  removeListener: removeListener
};
