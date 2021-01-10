webpackHotUpdate_N_E("pages/allnotes",{

/***/ "./pages/allnotes.js":
/*!***************************!*\
  !*** ./pages/allnotes.js ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(module) {/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ \"./node_modules/@babel/runtime/helpers/esm/defineProperty.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var react_bootstrap_Table__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-bootstrap/Table */ \"./node_modules/react-bootstrap/esm/Table.js\");\n/* harmony import */ var _components_base_popup__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/base_popup */ \"./components/base_popup.js\");\n/* harmony import */ var _components_NoteTableIem__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../components/NoteTableIem */ \"./components/NoteTableIem.js\");\n/* harmony import */ var _styles_common_module_scss__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../styles/common.module.scss */ \"./styles/common.module.scss\");\n/* harmony import */ var _styles_common_module_scss__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_styles_common_module_scss__WEBPACK_IMPORTED_MODULE_6__);\n\n\n\nvar _jsxFileName = \"/Users/jontsai/code/chrome-extensions/notes-chrome-extension/app/pages/allnotes.js\",\n    _this = undefined,\n    _s = $RefreshSig$();\n\n\n\n\n\n\n\nvar AllNotes = function AllNotes() {\n  _s();\n\n  var _useState = Object(react__WEBPACK_IMPORTED_MODULE_2__[\"useState\"])(null),\n      allNotesObject = _useState[0],\n      setAllNotesObject = _useState[1];\n\n  Object(react__WEBPACK_IMPORTED_MODULE_2__[\"useEffect\"])(function () {\n    chrome.storage.sync.get(['__ALL_NOTE_DATA__'], function (result) {\n      var allNoteDataObject = result['__ALL_NOTE_DATA__'];\n      setAllNotesObject(allNoteDataObject);\n    });\n  }, []);\n\n  var deleteRowFromTable = function deleteRowFromTable(noteURL) {\n    delete allNotesObject[noteURL];\n    chrome.storage.sync.remove(noteURL);\n    chrome.storage.sync.set(Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({}, '__ALL_NOTE_DATA__', allNotesObject), function () {\n      chrome.storage.sync.get(['__ALL_NOTE_DATA__'], function (result) {\n        var allNoteDataObject = result['__ALL_NOTE_DATA__'];\n        setAllNotesObject(allNoteDataObject);\n      });\n    });\n  };\n\n  return /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__[\"jsxDEV\"])(\"div\", {\n    className: \"all__notes\",\n    children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__[\"jsxDEV\"])(react_bootstrap_Table__WEBPACK_IMPORTED_MODULE_3__[\"default\"], {\n      className: _styles_common_module_scss__WEBPACK_IMPORTED_MODULE_6___default.a.all__notes__table,\n      responsive: true,\n      striped: true,\n      hover: true,\n      size: \"sm\",\n      children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__[\"jsxDEV\"])(\"thead\", {\n        className: \"all-notes-table-header\",\n        children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__[\"jsxDEV\"])(\"tr\", {\n          className: \"row\",\n          children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__[\"jsxDEV\"])(\"th\", {\n            className: \"col-sm-2\",\n            children: \"Title\"\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 49,\n            columnNumber: 25\n          }, _this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__[\"jsxDEV\"])(\"th\", {\n            className: \"col-sm-2\",\n            children: \"URL\"\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 50,\n            columnNumber: 25\n          }, _this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__[\"jsxDEV\"])(\"th\", {\n            className: \"col-sm-6\",\n            children: \"Notes\"\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 51,\n            columnNumber: 25\n          }, _this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__[\"jsxDEV\"])(\"th\", {\n            className: \"col-sm-1\",\n            children: \"Delete\"\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 52,\n            columnNumber: 25\n          }, _this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__[\"jsxDEV\"])(\"th\", {\n            className: \"col-sm-1\",\n            children: \"Edit\"\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 53,\n            columnNumber: 25\n          }, _this)]\n        }, void 0, true, {\n          fileName: _jsxFileName,\n          lineNumber: 48,\n          columnNumber: 21\n        }, _this)\n      }, void 0, false, {\n        fileName: _jsxFileName,\n        lineNumber: 47,\n        columnNumber: 17\n      }, _this), allNotesObject ? /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__[\"jsxDEV\"])(\"tbody\", {\n        className: \"all-notes-table-body\",\n        children: Object.keys(allNotesObject).map(function (urlKey) {\n          return /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__[\"jsxDEV\"])(_components_NoteTableIem__WEBPACK_IMPORTED_MODULE_5__[\"default\"], {\n            noteData: allNotesObject[urlKey],\n            deleteRowFromTable: deleteRowFromTable\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 59,\n            columnNumber: 29\n          }, _this);\n        })\n      }, void 0, false, {\n        fileName: _jsxFileName,\n        lineNumber: 57,\n        columnNumber: 21\n      }, _this) : /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_1__[\"jsxDEV\"])(\"h1\", {\n        children: \"Loading...\"\n      }, void 0, false, {\n        fileName: _jsxFileName,\n        lineNumber: 66,\n        columnNumber: 21\n      }, _this)]\n    }, void 0, true, {\n      fileName: _jsxFileName,\n      lineNumber: 40,\n      columnNumber: 13\n    }, _this)\n  }, void 0, false, {\n    fileName: _jsxFileName,\n    lineNumber: 39,\n    columnNumber: 9\n  }, _this);\n};\n\n_s(AllNotes, \"+HRtb/Vdy8jbyyojrHBvtwfrQsc=\");\n\n_c = AllNotes;\n/* harmony default export */ __webpack_exports__[\"default\"] = (_c2 = Object(_components_base_popup__WEBPACK_IMPORTED_MODULE_4__[\"default\"])(AllNotes));\n\nvar _c, _c2;\n\n$RefreshReg$(_c, \"AllNotes\");\n$RefreshReg$(_c2, \"%default%\");\n\n;\n    var _a, _b;\n    // Legacy CSS implementations will `eval` browser code in a Node.js context\n    // to extract CSS. For backwards compatibility, we need to check we're in a\n    // browser context before continuing.\n    if (typeof self !== 'undefined' &&\n        // AMP / No-JS mode does not inject these helpers:\n        '$RefreshHelpers$' in self) {\n        var currentExports = module.__proto__.exports;\n        var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n        // This cannot happen in MainTemplate because the exports mismatch between\n        // templating and execution.\n        self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.i);\n        // A module can be accepted automatically based on its exports, e.g. when\n        // it is a Refresh Boundary.\n        if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n            // Save the previous exports on update so we can compare the boundary\n            // signatures.\n            module.hot.dispose(function (data) {\n                data.prevExports = currentExports;\n            });\n            // Unconditionally accept an update to this module, we'll check if it's\n            // still a Refresh Boundary later.\n            module.hot.accept();\n            // This field is set when the previous version of this module was a\n            // Refresh Boundary, letting us know we need to check for invalidation or\n            // enqueue an update.\n            if (prevExports !== null) {\n                // A boundary can become ineligible if its exports are incompatible\n                // with the previous exports.\n                //\n                // For example, if you add/remove/change exports, we'll want to\n                // re-execute the importing modules, and force those components to\n                // re-render. Similarly, if you convert a class component to a\n                // function, we want to invalidate the boundary.\n                if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                    module.hot.invalidate();\n                }\n                else {\n                    self.$RefreshHelpers$.scheduleUpdate();\n                }\n            }\n        }\n        else {\n            // Since we just executed the code for the module, it's possible that the\n            // new exports made it ineligible for being a boundary.\n            // We only care about the case when we were _previously_ a boundary,\n            // because we already accepted this update (accidental side effect).\n            var isNoLongerABoundary = prevExports !== null;\n            if (isNoLongerABoundary) {\n                module.hot.invalidate();\n            }\n        }\n    }\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/harmony-module.js */ \"./node_modules/webpack/buildin/harmony-module.js\")(module)))//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vcGFnZXMvYWxsbm90ZXMuanM/MjE2MSJdLCJuYW1lcyI6WyJBbGxOb3RlcyIsInVzZVN0YXRlIiwiYWxsTm90ZXNPYmplY3QiLCJzZXRBbGxOb3Rlc09iamVjdCIsInVzZUVmZmVjdCIsImNocm9tZSIsInN0b3JhZ2UiLCJzeW5jIiwiZ2V0IiwicmVzdWx0IiwiYWxsTm90ZURhdGFPYmplY3QiLCJkZWxldGVSb3dGcm9tVGFibGUiLCJub3RlVVJMIiwicmVtb3ZlIiwic2V0IiwiY3NzIiwiYWxsX19ub3Rlc19fdGFibGUiLCJPYmplY3QiLCJrZXlzIiwibWFwIiwidXJsS2V5IiwiQmFzZVBvcHVwIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBRUE7QUFFQTtBQUVBOztBQUVBLElBQU1BLFFBQVEsR0FBRyxTQUFYQSxRQUFXLEdBQU07QUFBQTs7QUFBQSxrQkFDeUJDLHNEQUFRLENBQUMsSUFBRCxDQURqQztBQUFBLE1BQ1pDLGNBRFk7QUFBQSxNQUNJQyxpQkFESjs7QUFHbkJDLHlEQUFTLENBQUMsWUFBTTtBQUNaQyxVQUFNLENBQUNDLE9BQVAsQ0FBZUMsSUFBZixDQUFvQkMsR0FBcEIsQ0FBd0IsQ0FBQyxtQkFBRCxDQUF4QixFQUErQyxVQUFVQyxNQUFWLEVBQWtCO0FBQzdELFVBQU1DLGlCQUFpQixHQUFHRCxNQUFNLENBQUMsbUJBQUQsQ0FBaEM7QUFDQU4sdUJBQWlCLENBQUNPLGlCQUFELENBQWpCO0FBQ0gsS0FIRDtBQUlILEdBTFEsRUFLTixFQUxNLENBQVQ7O0FBT0EsTUFBTUMsa0JBQWtCLEdBQUcsU0FBckJBLGtCQUFxQixDQUFDQyxPQUFELEVBQWE7QUFDcEMsV0FBT1YsY0FBYyxDQUFDVSxPQUFELENBQXJCO0FBQ0FQLFVBQU0sQ0FBQ0MsT0FBUCxDQUFlQyxJQUFmLENBQW9CTSxNQUFwQixDQUEyQkQsT0FBM0I7QUFFQVAsVUFBTSxDQUFDQyxPQUFQLENBQWVDLElBQWYsQ0FBb0JPLEdBQXBCLCtGQUNPLG1CQURQLEVBQzZCWixjQUQ3QixHQUVJLFlBQVk7QUFDUkcsWUFBTSxDQUFDQyxPQUFQLENBQWVDLElBQWYsQ0FBb0JDLEdBQXBCLENBQ0ksQ0FBQyxtQkFBRCxDQURKLEVBRUksVUFBVUMsTUFBVixFQUFrQjtBQUNkLFlBQU1DLGlCQUFpQixHQUFHRCxNQUFNLENBQUMsbUJBQUQsQ0FBaEM7QUFDQU4seUJBQWlCLENBQUNPLGlCQUFELENBQWpCO0FBQ0gsT0FMTDtBQU9ILEtBVkw7QUFZSCxHQWhCRDs7QUFrQkEsc0JBQ0k7QUFBSyxhQUFTLEVBQUMsWUFBZjtBQUFBLDJCQUNJLHFFQUFDLDZEQUFEO0FBQ0ksZUFBUyxFQUFFSyxpRUFBRyxDQUFDQyxpQkFEbkI7QUFFSSxnQkFBVSxNQUZkO0FBR0ksYUFBTyxNQUhYO0FBSUksV0FBSyxNQUpUO0FBS0ksVUFBSSxFQUFDLElBTFQ7QUFBQSw4QkFPSTtBQUFPLGlCQUFTLEVBQUMsd0JBQWpCO0FBQUEsK0JBQ0k7QUFBSSxtQkFBUyxFQUFDLEtBQWQ7QUFBQSxrQ0FDSTtBQUFJLHFCQUFTLEVBQUMsVUFBZDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxtQkFESixlQUVJO0FBQUkscUJBQVMsRUFBQyxVQUFkO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQUZKLGVBR0k7QUFBSSxxQkFBUyxFQUFDLFVBQWQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsbUJBSEosZUFJSTtBQUFJLHFCQUFTLEVBQUMsVUFBZDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxtQkFKSixlQUtJO0FBQUkscUJBQVMsRUFBQyxVQUFkO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQUxKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQURKO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFQSixFQWdCS2QsY0FBYyxnQkFDWDtBQUFPLGlCQUFTLEVBQUMsc0JBQWpCO0FBQUEsa0JBQ0tlLE1BQU0sQ0FBQ0MsSUFBUCxDQUFZaEIsY0FBWixFQUE0QmlCLEdBQTVCLENBQWdDLFVBQUNDLE1BQUQ7QUFBQSw4QkFDN0IscUVBQUMsZ0VBQUQ7QUFDSSxvQkFBUSxFQUFFbEIsY0FBYyxDQUFDa0IsTUFBRCxDQUQ1QjtBQUVJLDhCQUFrQixFQUFFVDtBQUZ4QjtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQUQ2QjtBQUFBLFNBQWhDO0FBREw7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQURXLGdCQVVYO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGVBMUJSO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQURKO0FBQUE7QUFBQTtBQUFBO0FBQUEsV0FESjtBQWlDSCxDQTdERDs7R0FBTVgsUTs7S0FBQUEsUTtBQStEUyxxRUFBQXFCLHNFQUFTLENBQUNyQixRQUFELENBQXhCIiwiZmlsZSI6Ii4vcGFnZXMvYWxsbm90ZXMuanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBUYWJsZSBmcm9tICdyZWFjdC1ib290c3RyYXAvVGFibGUnO1xuXG5pbXBvcnQgQmFzZVBvcHVwIGZyb20gJy4uL2NvbXBvbmVudHMvYmFzZV9wb3B1cCc7XG5cbmltcG9ydCBOb3RlVGFibGVJdGVtIGZyb20gJy4uL2NvbXBvbmVudHMvTm90ZVRhYmxlSWVtJztcblxuaW1wb3J0IGNzcyBmcm9tICcuLi9zdHlsZXMvY29tbW9uLm1vZHVsZS5zY3NzJztcblxuY29uc3QgQWxsTm90ZXMgPSAoKSA9PiB7XG4gICAgY29uc3QgW2FsbE5vdGVzT2JqZWN0LCBzZXRBbGxOb3Rlc09iamVjdF0gPSB1c2VTdGF0ZShudWxsKTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0KFsnX19BTExfTk9URV9EQVRBX18nXSwgZnVuY3Rpb24gKHJlc3VsdCkge1xuICAgICAgICAgICAgY29uc3QgYWxsTm90ZURhdGFPYmplY3QgPSByZXN1bHRbJ19fQUxMX05PVEVfREFUQV9fJ107XG4gICAgICAgICAgICBzZXRBbGxOb3Rlc09iamVjdChhbGxOb3RlRGF0YU9iamVjdCk7XG4gICAgICAgIH0pO1xuICAgIH0sIFtdKTtcblxuICAgIGNvbnN0IGRlbGV0ZVJvd0Zyb21UYWJsZSA9IChub3RlVVJMKSA9PiB7XG4gICAgICAgIGRlbGV0ZSBhbGxOb3Rlc09iamVjdFtub3RlVVJMXTtcbiAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5yZW1vdmUobm90ZVVSTCk7XG5cbiAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQoXG4gICAgICAgICAgICB7IFsnX19BTExfTk9URV9EQVRBX18nXTogYWxsTm90ZXNPYmplY3QgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLmdldChcbiAgICAgICAgICAgICAgICAgICAgWydfX0FMTF9OT1RFX0RBVEFfXyddLFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBhbGxOb3RlRGF0YU9iamVjdCA9IHJlc3VsdFsnX19BTExfTk9URV9EQVRBX18nXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldEFsbE5vdGVzT2JqZWN0KGFsbE5vdGVEYXRhT2JqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfTtcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWxsX19ub3Rlc1wiPlxuICAgICAgICAgICAgPFRhYmxlXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjc3MuYWxsX19ub3Rlc19fdGFibGV9XG4gICAgICAgICAgICAgICAgcmVzcG9uc2l2ZVxuICAgICAgICAgICAgICAgIHN0cmlwZWRcbiAgICAgICAgICAgICAgICBob3ZlclxuICAgICAgICAgICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPHRoZWFkIGNsYXNzTmFtZT1cImFsbC1ub3Rlcy10YWJsZS1oZWFkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPHRyIGNsYXNzTmFtZT1cInJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cImNvbC1zbS0yXCI+VGl0bGU8L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cImNvbC1zbS0yXCI+VVJMPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJjb2wtc20tNlwiPk5vdGVzPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJjb2wtc20tMVwiPkRlbGV0ZTwvdGg+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwiY29sLXNtLTFcIj5FZGl0PC90aD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgICAgIHthbGxOb3Rlc09iamVjdCA/IChcbiAgICAgICAgICAgICAgICAgICAgPHRib2R5IGNsYXNzTmFtZT1cImFsbC1ub3Rlcy10YWJsZS1ib2R5XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7T2JqZWN0LmtleXMoYWxsTm90ZXNPYmplY3QpLm1hcCgodXJsS2V5KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPE5vdGVUYWJsZUl0ZW1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm90ZURhdGE9e2FsbE5vdGVzT2JqZWN0W3VybEtleV19XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZVJvd0Zyb21UYWJsZT17ZGVsZXRlUm93RnJvbVRhYmxlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICA8aDE+TG9hZGluZy4uLjwvaDE+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvVGFibGU+XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBCYXNlUG9wdXAoQWxsTm90ZXMpO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./pages/allnotes.js\n");

/***/ })

})