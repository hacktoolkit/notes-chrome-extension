webpackHotUpdate_N_E("pages/popup",{

/***/ "./lib/notes.js":
/*!**********************!*\
  !*** ./lib/notes.js ***!
  \**********************/
/*! exports provided: defaultNotesForTab, getAllStoredNotes, saveNote, getNotesForUrl */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(module) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"defaultNotesForTab\", function() { return defaultNotesForTab; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getAllStoredNotes\", function() { return getAllStoredNotes; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"saveNote\", function() { return saveNote; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getNotesForUrl\", function() { return getNotesForUrl; });\n/* harmony import */ var _storage_chrome_storage_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./storage/chrome_storage.js */ \"./lib/storage/chrome_storage.js\");\n\n\nfunction defaultNotesForTab(tab) {\n  var defaultNotes = {\n    url: tab.url,\n    title: tab.title,\n    image: tab.favIconUrl ? tab.favIconUrl : '',\n    body: ''\n  };\n  return defaultNotes;\n}\n\nfunction saveNote(url, details, callback) {\n  Object(_storage_chrome_storage_js__WEBPACK_IMPORTED_MODULE_0__[\"saveNoteToChromeStorage\"])(url, details, callback);\n}\n\nfunction getAllStoredNotes(callback) {\n  Object(_storage_chrome_storage_js__WEBPACK_IMPORTED_MODULE_0__[\"getAllStoredNotesFromChromeStorage\"])(callback);\n}\n\nfunction getNotesForUrl(url, notesFallback, callback) {\n  Object(_storage_chrome_storage_js__WEBPACK_IMPORTED_MODULE_0__[\"getNotesForUrlFromChromeStorage\"])(url, notesFallback, callback);\n}\n\n\n\n;\n    var _a, _b;\n    // Legacy CSS implementations will `eval` browser code in a Node.js context\n    // to extract CSS. For backwards compatibility, we need to check we're in a\n    // browser context before continuing.\n    if (typeof self !== 'undefined' &&\n        // AMP / No-JS mode does not inject these helpers:\n        '$RefreshHelpers$' in self) {\n        var currentExports = module.__proto__.exports;\n        var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n        // This cannot happen in MainTemplate because the exports mismatch between\n        // templating and execution.\n        self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.i);\n        // A module can be accepted automatically based on its exports, e.g. when\n        // it is a Refresh Boundary.\n        if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n            // Save the previous exports on update so we can compare the boundary\n            // signatures.\n            module.hot.dispose(function (data) {\n                data.prevExports = currentExports;\n            });\n            // Unconditionally accept an update to this module, we'll check if it's\n            // still a Refresh Boundary later.\n            module.hot.accept();\n            // This field is set when the previous version of this module was a\n            // Refresh Boundary, letting us know we need to check for invalidation or\n            // enqueue an update.\n            if (prevExports !== null) {\n                // A boundary can become ineligible if its exports are incompatible\n                // with the previous exports.\n                //\n                // For example, if you add/remove/change exports, we'll want to\n                // re-execute the importing modules, and force those components to\n                // re-render. Similarly, if you convert a class component to a\n                // function, we want to invalidate the boundary.\n                if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                    module.hot.invalidate();\n                }\n                else {\n                    self.$RefreshHelpers$.scheduleUpdate();\n                }\n            }\n        }\n        else {\n            // Since we just executed the code for the module, it's possible that the\n            // new exports made it ineligible for being a boundary.\n            // We only care about the case when we were _previously_ a boundary,\n            // because we already accepted this update (accidental side effect).\n            var isNoLongerABoundary = prevExports !== null;\n            if (isNoLongerABoundary) {\n                module.hot.invalidate();\n            }\n        }\n    }\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/harmony-module.js */ \"./node_modules/webpack/buildin/harmony-module.js\")(module)))//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vbGliL25vdGVzLmpzP2Y4ZWUiXSwibmFtZXMiOlsiZGVmYXVsdE5vdGVzRm9yVGFiIiwidGFiIiwiZGVmYXVsdE5vdGVzIiwidXJsIiwidGl0bGUiLCJpbWFnZSIsImZhdkljb25VcmwiLCJib2R5Iiwic2F2ZU5vdGUiLCJkZXRhaWxzIiwiY2FsbGJhY2siLCJzYXZlTm90ZVRvQ2hyb21lU3RvcmFnZSIsImdldEFsbFN0b3JlZE5vdGVzIiwiZ2V0QWxsU3RvcmVkTm90ZXNGcm9tQ2hyb21lU3RvcmFnZSIsImdldE5vdGVzRm9yVXJsIiwibm90ZXNGYWxsYmFjayIsImdldE5vdGVzRm9yVXJsRnJvbUNocm9tZVN0b3JhZ2UiXSwibWFwcGluZ3MiOiJBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU1BLFNBQVNBLGtCQUFULENBQTRCQyxHQUE1QixFQUFpQztBQUM3QixNQUFNQyxZQUFZLEdBQUc7QUFDakJDLE9BQUcsRUFBRUYsR0FBRyxDQUFDRSxHQURRO0FBRWpCQyxTQUFLLEVBQUVILEdBQUcsQ0FBQ0csS0FGTTtBQUdqQkMsU0FBSyxFQUFFSixHQUFHLENBQUNLLFVBQUosR0FBaUJMLEdBQUcsQ0FBQ0ssVUFBckIsR0FBa0MsRUFIeEI7QUFJakJDLFFBQUksRUFBRTtBQUpXLEdBQXJCO0FBTUEsU0FBT0wsWUFBUDtBQUNIOztBQUVELFNBQVNNLFFBQVQsQ0FBa0JMLEdBQWxCLEVBQXVCTSxPQUF2QixFQUFnQ0MsUUFBaEMsRUFBMEM7QUFDdENDLDRGQUF1QixDQUFDUixHQUFELEVBQU1NLE9BQU4sRUFBZUMsUUFBZixDQUF2QjtBQUNIOztBQUVELFNBQVNFLGlCQUFULENBQTJCRixRQUEzQixFQUFxQztBQUNqQ0csdUdBQWtDLENBQUNILFFBQUQsQ0FBbEM7QUFDSDs7QUFFRCxTQUFTSSxjQUFULENBQXdCWCxHQUF4QixFQUE2QlksYUFBN0IsRUFBNENMLFFBQTVDLEVBQXNEO0FBQ2xETSxvR0FBK0IsQ0FBQ2IsR0FBRCxFQUFNWSxhQUFOLEVBQXFCTCxRQUFyQixDQUEvQjtBQUNIOztBQUVEIiwiZmlsZSI6Ii4vbGliL25vdGVzLmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBzYXZlTm90ZVRvQ2hyb21lU3RvcmFnZSxcbiAgICBnZXRBbGxTdG9yZWROb3Rlc0Zyb21DaHJvbWVTdG9yYWdlLFxuICAgIGdldE5vdGVzRm9yVXJsRnJvbUNocm9tZVN0b3JhZ2UsXG59IGZyb20gJy4vc3RvcmFnZS9jaHJvbWVfc3RvcmFnZS5qcyc7XG5cbmZ1bmN0aW9uIGRlZmF1bHROb3Rlc0ZvclRhYih0YWIpIHtcbiAgICBjb25zdCBkZWZhdWx0Tm90ZXMgPSB7XG4gICAgICAgIHVybDogdGFiLnVybCxcbiAgICAgICAgdGl0bGU6IHRhYi50aXRsZSxcbiAgICAgICAgaW1hZ2U6IHRhYi5mYXZJY29uVXJsID8gdGFiLmZhdkljb25VcmwgOiAnJyxcbiAgICAgICAgYm9keTogJycsXG4gICAgfTtcbiAgICByZXR1cm4gZGVmYXVsdE5vdGVzO1xufVxuXG5mdW5jdGlvbiBzYXZlTm90ZSh1cmwsIGRldGFpbHMsIGNhbGxiYWNrKSB7XG4gICAgc2F2ZU5vdGVUb0Nocm9tZVN0b3JhZ2UodXJsLCBkZXRhaWxzLCBjYWxsYmFjayk7XG59XG5cbmZ1bmN0aW9uIGdldEFsbFN0b3JlZE5vdGVzKGNhbGxiYWNrKSB7XG4gICAgZ2V0QWxsU3RvcmVkTm90ZXNGcm9tQ2hyb21lU3RvcmFnZShjYWxsYmFjayk7XG59XG5cbmZ1bmN0aW9uIGdldE5vdGVzRm9yVXJsKHVybCwgbm90ZXNGYWxsYmFjaywgY2FsbGJhY2spIHtcbiAgICBnZXROb3Rlc0ZvclVybEZyb21DaHJvbWVTdG9yYWdlKHVybCwgbm90ZXNGYWxsYmFjaywgY2FsbGJhY2spO1xufVxuXG5leHBvcnQgeyBkZWZhdWx0Tm90ZXNGb3JUYWIsIGdldEFsbFN0b3JlZE5vdGVzLCBzYXZlTm90ZSwgZ2V0Tm90ZXNGb3JVcmwgfTtcbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./lib/notes.js\n");

/***/ }),

/***/ "./lib/storage/chrome_storage.js":
/*!***************************************!*\
  !*** ./lib/storage/chrome_storage.js ***!
  \***************************************/
/*! exports provided: saveNoteToChromeStorage, getAllStoredNotesFromChromeStorage, getNotesForUrlFromChromeStorage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(module) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"saveNoteToChromeStorage\", function() { return saveNoteToChromeStorage; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getAllStoredNotesFromChromeStorage\", function() { return getAllStoredNotesFromChromeStorage; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getNotesForUrlFromChromeStorage\", function() { return getNotesForUrlFromChromeStorage; });\n/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ \"./node_modules/@babel/runtime/helpers/esm/defineProperty.js\");\n\nvar CHROME_STORAGE_ALL_NOTES_KEY = '__ALL_NOTE_DATA__';\n\nfunction saveNoteToChromeStorage(url, details, callback) {\n  getAllStoredNotesFromChromeStorage(function (allNotesObject) {\n    allNotesObject[url] = details;\n    chrome.storage.sync.set(Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({}, CHROME_STORAGE_ALL_NOTES_KEY, allNotesObject), function () {\n      callback(allNotesObject);\n    });\n  });\n}\n\nfunction getAllStoredNotesFromChromeStorage(callback) {\n  chrome.storage.sync.get([CHROME_STORAGE_ALL_NOTES_KEY], function (result) {\n    var allNotesObject = result[CHROME_STORAGE_ALL_NOTES_KEY] || {};\n    callback(allNotesObject);\n  });\n}\n\nfunction getNotesForUrlFromChromeStorage(url, notesFallback, callback) {}\n\n\n\n;\n    var _a, _b;\n    // Legacy CSS implementations will `eval` browser code in a Node.js context\n    // to extract CSS. For backwards compatibility, we need to check we're in a\n    // browser context before continuing.\n    if (typeof self !== 'undefined' &&\n        // AMP / No-JS mode does not inject these helpers:\n        '$RefreshHelpers$' in self) {\n        var currentExports = module.__proto__.exports;\n        var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n        // This cannot happen in MainTemplate because the exports mismatch between\n        // templating and execution.\n        self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.i);\n        // A module can be accepted automatically based on its exports, e.g. when\n        // it is a Refresh Boundary.\n        if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n            // Save the previous exports on update so we can compare the boundary\n            // signatures.\n            module.hot.dispose(function (data) {\n                data.prevExports = currentExports;\n            });\n            // Unconditionally accept an update to this module, we'll check if it's\n            // still a Refresh Boundary later.\n            module.hot.accept();\n            // This field is set when the previous version of this module was a\n            // Refresh Boundary, letting us know we need to check for invalidation or\n            // enqueue an update.\n            if (prevExports !== null) {\n                // A boundary can become ineligible if its exports are incompatible\n                // with the previous exports.\n                //\n                // For example, if you add/remove/change exports, we'll want to\n                // re-execute the importing modules, and force those components to\n                // re-render. Similarly, if you convert a class component to a\n                // function, we want to invalidate the boundary.\n                if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                    module.hot.invalidate();\n                }\n                else {\n                    self.$RefreshHelpers$.scheduleUpdate();\n                }\n            }\n        }\n        else {\n            // Since we just executed the code for the module, it's possible that the\n            // new exports made it ineligible for being a boundary.\n            // We only care about the case when we were _previously_ a boundary,\n            // because we already accepted this update (accidental side effect).\n            var isNoLongerABoundary = prevExports !== null;\n            if (isNoLongerABoundary) {\n                module.hot.invalidate();\n            }\n        }\n    }\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../node_modules/webpack/buildin/harmony-module.js */ \"./node_modules/webpack/buildin/harmony-module.js\")(module)))//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vbGliL3N0b3JhZ2UvY2hyb21lX3N0b3JhZ2UuanM/ZDgyOCJdLCJuYW1lcyI6WyJDSFJPTUVfU1RPUkFHRV9BTExfTk9URVNfS0VZIiwic2F2ZU5vdGVUb0Nocm9tZVN0b3JhZ2UiLCJ1cmwiLCJkZXRhaWxzIiwiY2FsbGJhY2siLCJnZXRBbGxTdG9yZWROb3Rlc0Zyb21DaHJvbWVTdG9yYWdlIiwiYWxsTm90ZXNPYmplY3QiLCJjaHJvbWUiLCJzdG9yYWdlIiwic3luYyIsInNldCIsImdldCIsInJlc3VsdCIsImdldE5vdGVzRm9yVXJsRnJvbUNocm9tZVN0b3JhZ2UiLCJub3Rlc0ZhbGxiYWNrIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxJQUFNQSw0QkFBNEIsR0FBRyxtQkFBckM7O0FBRUEsU0FBU0MsdUJBQVQsQ0FBaUNDLEdBQWpDLEVBQXNDQyxPQUF0QyxFQUErQ0MsUUFBL0MsRUFBeUQ7QUFDckRDLG9DQUFrQyxDQUFDLFVBQUNDLGNBQUQsRUFBb0I7QUFDbkRBLGtCQUFjLENBQUNKLEdBQUQsQ0FBZCxHQUFzQkMsT0FBdEI7QUFFQUksVUFBTSxDQUFDQyxPQUFQLENBQWVDLElBQWYsQ0FBb0JDLEdBQXBCLCtGQUNPViw0QkFEUCxFQUNzQ00sY0FEdEMsR0FFSSxZQUFZO0FBQ1JGLGNBQVEsQ0FBQ0UsY0FBRCxDQUFSO0FBQ0gsS0FKTDtBQU1ILEdBVGlDLENBQWxDO0FBVUg7O0FBRUQsU0FBU0Qsa0NBQVQsQ0FBNENELFFBQTVDLEVBQXNEO0FBQ2xERyxRQUFNLENBQUNDLE9BQVAsQ0FBZUMsSUFBZixDQUFvQkUsR0FBcEIsQ0FBd0IsQ0FBQ1gsNEJBQUQsQ0FBeEIsRUFBd0QsVUFBVVksTUFBVixFQUFrQjtBQUN0RSxRQUFNTixjQUFjLEdBQUdNLE1BQU0sQ0FBQ1osNEJBQUQsQ0FBTixJQUF3QyxFQUEvRDtBQUNBSSxZQUFRLENBQUNFLGNBQUQsQ0FBUjtBQUNILEdBSEQ7QUFJSDs7QUFFRCxTQUFTTywrQkFBVCxDQUF5Q1gsR0FBekMsRUFBOENZLGFBQTlDLEVBQTZEVixRQUE3RCxFQUF1RSxDQUFFOztBQUV6RSIsImZpbGUiOiIuL2xpYi9zdG9yYWdlL2Nocm9tZV9zdG9yYWdlLmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgQ0hST01FX1NUT1JBR0VfQUxMX05PVEVTX0tFWSA9ICdfX0FMTF9OT1RFX0RBVEFfXyc7XG5cbmZ1bmN0aW9uIHNhdmVOb3RlVG9DaHJvbWVTdG9yYWdlKHVybCwgZGV0YWlscywgY2FsbGJhY2spIHtcbiAgICBnZXRBbGxTdG9yZWROb3Rlc0Zyb21DaHJvbWVTdG9yYWdlKChhbGxOb3Rlc09iamVjdCkgPT4ge1xuICAgICAgICBhbGxOb3Rlc09iamVjdFt1cmxdID0gZGV0YWlscztcblxuICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldChcbiAgICAgICAgICAgIHsgW0NIUk9NRV9TVE9SQUdFX0FMTF9OT1RFU19LRVldOiBhbGxOb3Rlc09iamVjdCB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGFsbE5vdGVzT2JqZWN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gZ2V0QWxsU3RvcmVkTm90ZXNGcm9tQ2hyb21lU3RvcmFnZShjYWxsYmFjaykge1xuICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0KFtDSFJPTUVfU1RPUkFHRV9BTExfTk9URVNfS0VZXSwgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICBjb25zdCBhbGxOb3Rlc09iamVjdCA9IHJlc3VsdFtDSFJPTUVfU1RPUkFHRV9BTExfTk9URVNfS0VZXSB8fCB7fTtcbiAgICAgICAgY2FsbGJhY2soYWxsTm90ZXNPYmplY3QpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBnZXROb3Rlc0ZvclVybEZyb21DaHJvbWVTdG9yYWdlKHVybCwgbm90ZXNGYWxsYmFjaywgY2FsbGJhY2spIHt9XG5cbmV4cG9ydCB7XG4gICAgc2F2ZU5vdGVUb0Nocm9tZVN0b3JhZ2UsXG4gICAgZ2V0QWxsU3RvcmVkTm90ZXNGcm9tQ2hyb21lU3RvcmFnZSxcbiAgICBnZXROb3Rlc0ZvclVybEZyb21DaHJvbWVTdG9yYWdlLFxufTtcbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./lib/storage/chrome_storage.js\n");

/***/ })

})