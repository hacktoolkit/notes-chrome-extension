webpackHotUpdate_N_E("pages/popup",{

/***/ "./lib/chrome_tabs.js":
/*!****************************!*\
  !*** ./lib/chrome_tabs.js ***!
  \****************************/
/*! exports provided: canAccessChromeTabs, getCurrentTab */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(module) {/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"canAccessChromeTabs\", function() { return canAccessChromeTabs; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"getCurrentTab\", function() { return getCurrentTab; });\nfunction canAccessChromeTabs() {\n  var canAccess = typeof chrome !== 'undefined' && typeof chrome.tabs !== 'undefined';\n  return canAccess;\n}\n\nfunction getCurrentTab(callback) {\n  chrome.tabs.query({\n    active: true,\n    lastFocusedWindow: true\n  }, function (tabs) {\n    self.setState({\n      currentTabUrl: tabs[0].url,\n      currentTabTitle: tabs[0].title,\n      currentTabIcon: tabs[0].favIconUrl ? tabs[0].favIconUrl : ''\n    });\n  });\n}\n\n\n\n;\n    var _a, _b;\n    // Legacy CSS implementations will `eval` browser code in a Node.js context\n    // to extract CSS. For backwards compatibility, we need to check we're in a\n    // browser context before continuing.\n    if (typeof self !== 'undefined' &&\n        // AMP / No-JS mode does not inject these helpers:\n        '$RefreshHelpers$' in self) {\n        var currentExports = module.__proto__.exports;\n        var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n        // This cannot happen in MainTemplate because the exports mismatch between\n        // templating and execution.\n        self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.i);\n        // A module can be accepted automatically based on its exports, e.g. when\n        // it is a Refresh Boundary.\n        if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n            // Save the previous exports on update so we can compare the boundary\n            // signatures.\n            module.hot.dispose(function (data) {\n                data.prevExports = currentExports;\n            });\n            // Unconditionally accept an update to this module, we'll check if it's\n            // still a Refresh Boundary later.\n            module.hot.accept();\n            // This field is set when the previous version of this module was a\n            // Refresh Boundary, letting us know we need to check for invalidation or\n            // enqueue an update.\n            if (prevExports !== null) {\n                // A boundary can become ineligible if its exports are incompatible\n                // with the previous exports.\n                //\n                // For example, if you add/remove/change exports, we'll want to\n                // re-execute the importing modules, and force those components to\n                // re-render. Similarly, if you convert a class component to a\n                // function, we want to invalidate the boundary.\n                if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                    module.hot.invalidate();\n                }\n                else {\n                    self.$RefreshHelpers$.scheduleUpdate();\n                }\n            }\n        }\n        else {\n            // Since we just executed the code for the module, it's possible that the\n            // new exports made it ineligible for being a boundary.\n            // We only care about the case when we were _previously_ a boundary,\n            // because we already accepted this update (accidental side effect).\n            var isNoLongerABoundary = prevExports !== null;\n            if (isNoLongerABoundary) {\n                module.hot.invalidate();\n            }\n        }\n    }\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/harmony-module.js */ \"./node_modules/webpack/buildin/harmony-module.js\")(module)))//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vbGliL2Nocm9tZV90YWJzLmpzPzk5OGMiXSwibmFtZXMiOlsiY2FuQWNjZXNzQ2hyb21lVGFicyIsImNhbkFjY2VzcyIsImNocm9tZSIsInRhYnMiLCJnZXRDdXJyZW50VGFiIiwiY2FsbGJhY2siLCJxdWVyeSIsImFjdGl2ZSIsImxhc3RGb2N1c2VkV2luZG93Iiwic2VsZiIsInNldFN0YXRlIiwiY3VycmVudFRhYlVybCIsInVybCIsImN1cnJlbnRUYWJUaXRsZSIsInRpdGxlIiwiY3VycmVudFRhYkljb24iLCJmYXZJY29uVXJsIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUFBO0FBQUE7QUFBQSxTQUFTQSxtQkFBVCxHQUErQjtBQUMzQixNQUFNQyxTQUFTLEdBQ1gsT0FBT0MsTUFBUCxLQUFrQixXQUFsQixJQUFpQyxPQUFPQSxNQUFNLENBQUNDLElBQWQsS0FBdUIsV0FENUQ7QUFFQSxTQUFPRixTQUFQO0FBQ0g7O0FBRUQsU0FBU0csYUFBVCxDQUF1QkMsUUFBdkIsRUFBaUM7QUFDN0JILFFBQU0sQ0FBQ0MsSUFBUCxDQUFZRyxLQUFaLENBQWtCO0FBQUVDLFVBQU0sRUFBRSxJQUFWO0FBQWdCQyxxQkFBaUIsRUFBRTtBQUFuQyxHQUFsQixFQUE2RCxVQUFDTCxJQUFELEVBQVU7QUFDbkVNLFFBQUksQ0FBQ0MsUUFBTCxDQUFjO0FBQ1ZDLG1CQUFhLEVBQUVSLElBQUksQ0FBQyxDQUFELENBQUosQ0FBUVMsR0FEYjtBQUVWQyxxQkFBZSxFQUFFVixJQUFJLENBQUMsQ0FBRCxDQUFKLENBQVFXLEtBRmY7QUFHVkMsb0JBQWMsRUFBRVosSUFBSSxDQUFDLENBQUQsQ0FBSixDQUFRYSxVQUFSLEdBQXFCYixJQUFJLENBQUMsQ0FBRCxDQUFKLENBQVFhLFVBQTdCLEdBQTBDO0FBSGhELEtBQWQ7QUFLSCxHQU5EO0FBT0g7O0FBRUQiLCJmaWxlIjoiLi9saWIvY2hyb21lX3RhYnMuanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBjYW5BY2Nlc3NDaHJvbWVUYWJzKCkge1xuICAgIGNvbnN0IGNhbkFjY2VzcyA9XG4gICAgICAgIHR5cGVvZiBjaHJvbWUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjaHJvbWUudGFicyAhPT0gJ3VuZGVmaW5lZCc7XG4gICAgcmV0dXJuIGNhbkFjY2Vzcztcbn1cblxuZnVuY3Rpb24gZ2V0Q3VycmVudFRhYihjYWxsYmFjaykge1xuICAgIGNocm9tZS50YWJzLnF1ZXJ5KHsgYWN0aXZlOiB0cnVlLCBsYXN0Rm9jdXNlZFdpbmRvdzogdHJ1ZSB9LCAodGFicykgPT4ge1xuICAgICAgICBzZWxmLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGN1cnJlbnRUYWJVcmw6IHRhYnNbMF0udXJsLFxuICAgICAgICAgICAgY3VycmVudFRhYlRpdGxlOiB0YWJzWzBdLnRpdGxlLFxuICAgICAgICAgICAgY3VycmVudFRhYkljb246IHRhYnNbMF0uZmF2SWNvblVybCA/IHRhYnNbMF0uZmF2SWNvblVybCA6ICcnLFxuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IHsgY2FuQWNjZXNzQ2hyb21lVGFicywgZ2V0Q3VycmVudFRhYiB9O1xuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./lib/chrome_tabs.js\n");

/***/ })

})