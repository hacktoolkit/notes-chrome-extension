webpackHotUpdate_N_E("pages/allnotes",{

/***/ "./pages/allnotes.js":
/*!***************************!*\
  !*** ./pages/allnotes.js ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(module) {/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var react_bootstrap_Table__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-bootstrap/Table */ \"./node_modules/react-bootstrap/esm/Table.js\");\n/* harmony import */ var _components_base_popup__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../components/base_popup */ \"./components/base_popup.js\");\n/* harmony import */ var _components_NoteTableItem__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../components/NoteTableItem */ \"./components/NoteTableItem.js\");\n/* harmony import */ var _lib_notes__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../lib/notes */ \"./lib/notes.js\");\n/* harmony import */ var _styles_common_module_scss__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../styles/common.module.scss */ \"./styles/common.module.scss\");\n/* harmony import */ var _styles_common_module_scss__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_styles_common_module_scss__WEBPACK_IMPORTED_MODULE_6__);\n\n\nvar _jsxFileName = \"/Users/jontsai/code/chrome-extensions/notes-chrome-extension/app/pages/allnotes.js\",\n    _this = undefined,\n    _s = $RefreshSig$();\n\n\n\n\n\n\n\n\nvar AllNotes = function AllNotes() {\n  _s();\n\n  var _useState = Object(react__WEBPACK_IMPORTED_MODULE_1__[\"useState\"])(null),\n      allNotesObject = _useState[0],\n      setAllNotesObject = _useState[1];\n\n  Object(react__WEBPACK_IMPORTED_MODULE_1__[\"useEffect\"])(function () {\n    Object(_lib_notes__WEBPACK_IMPORTED_MODULE_5__[\"getAllStoredNotes\"])(function (allNotesObj) {\n      setAllNotesObject(allNotesObj);\n    });\n  }, []);\n\n  var deleteRowFromTable = function deleteRowFromTable(noteUrl) {\n    Object(_lib_notes__WEBPACK_IMPORTED_MODULE_5__[\"deleteNotesForUrl\"])(noteUrl, function (allNotesObj) {\n      setAllNotesObject(allNotesObj);\n    });\n  };\n\n  return /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"div\", {\n    className: \"all__notes\",\n    children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(react_bootstrap_Table__WEBPACK_IMPORTED_MODULE_2__[\"default\"], {\n      className: _styles_common_module_scss__WEBPACK_IMPORTED_MODULE_6___default.a.all__notes__table,\n      responsive: true,\n      striped: true,\n      hover: true,\n      size: \"sm\",\n      children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"thead\", {\n        className: \"all-notes-table-header\",\n        children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"tr\", {\n          className: \"row\",\n          children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"th\", {\n            className: \"col-sm-2\",\n            children: \"Title\"\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 37,\n            columnNumber: 25\n          }, _this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"th\", {\n            className: \"col-sm-2\",\n            children: \"URL\"\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 38,\n            columnNumber: 25\n          }, _this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"th\", {\n            className: \"col-sm-6\",\n            children: \"Notes\"\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 39,\n            columnNumber: 25\n          }, _this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"th\", {\n            className: \"col-sm-1\",\n            children: \"Actions\"\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 40,\n            columnNumber: 25\n          }, _this)]\n        }, void 0, true, {\n          fileName: _jsxFileName,\n          lineNumber: 36,\n          columnNumber: 21\n        }, _this)\n      }, void 0, false, {\n        fileName: _jsxFileName,\n        lineNumber: 35,\n        columnNumber: 17\n      }, _this), allNotesObject ? /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"tbody\", {\n        className: \"all-notes-table-body\",\n        children: Object.keys(allNotesObject).map(function (urlKey) {\n          return /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(_components_NoteTableItem__WEBPACK_IMPORTED_MODULE_4__[\"default\"], {\n            noteData: allNotesObject[urlKey],\n            deleteRowFromTable: deleteRowFromTable\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 46,\n            columnNumber: 29\n          }, _this);\n        })\n      }, void 0, false, {\n        fileName: _jsxFileName,\n        lineNumber: 44,\n        columnNumber: 21\n      }, _this) : /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_0__[\"jsxDEV\"])(\"h1\", {\n        children: \"Loading...\"\n      }, void 0, false, {\n        fileName: _jsxFileName,\n        lineNumber: 53,\n        columnNumber: 21\n      }, _this)]\n    }, void 0, true, {\n      fileName: _jsxFileName,\n      lineNumber: 28,\n      columnNumber: 13\n    }, _this)\n  }, void 0, false, {\n    fileName: _jsxFileName,\n    lineNumber: 27,\n    columnNumber: 9\n  }, _this);\n};\n\n_s(AllNotes, \"+HRtb/Vdy8jbyyojrHBvtwfrQsc=\");\n\n_c = AllNotes;\n/* harmony default export */ __webpack_exports__[\"default\"] = (_c2 = Object(_components_base_popup__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(AllNotes));\n\nvar _c, _c2;\n\n$RefreshReg$(_c, \"AllNotes\");\n$RefreshReg$(_c2, \"%default%\");\n\n;\n    var _a, _b;\n    // Legacy CSS implementations will `eval` browser code in a Node.js context\n    // to extract CSS. For backwards compatibility, we need to check we're in a\n    // browser context before continuing.\n    if (typeof self !== 'undefined' &&\n        // AMP / No-JS mode does not inject these helpers:\n        '$RefreshHelpers$' in self) {\n        var currentExports = module.__proto__.exports;\n        var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n        // This cannot happen in MainTemplate because the exports mismatch between\n        // templating and execution.\n        self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.i);\n        // A module can be accepted automatically based on its exports, e.g. when\n        // it is a Refresh Boundary.\n        if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n            // Save the previous exports on update so we can compare the boundary\n            // signatures.\n            module.hot.dispose(function (data) {\n                data.prevExports = currentExports;\n            });\n            // Unconditionally accept an update to this module, we'll check if it's\n            // still a Refresh Boundary later.\n            module.hot.accept();\n            // This field is set when the previous version of this module was a\n            // Refresh Boundary, letting us know we need to check for invalidation or\n            // enqueue an update.\n            if (prevExports !== null) {\n                // A boundary can become ineligible if its exports are incompatible\n                // with the previous exports.\n                //\n                // For example, if you add/remove/change exports, we'll want to\n                // re-execute the importing modules, and force those components to\n                // re-render. Similarly, if you convert a class component to a\n                // function, we want to invalidate the boundary.\n                if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                    module.hot.invalidate();\n                }\n                else {\n                    self.$RefreshHelpers$.scheduleUpdate();\n                }\n            }\n        }\n        else {\n            // Since we just executed the code for the module, it's possible that the\n            // new exports made it ineligible for being a boundary.\n            // We only care about the case when we were _previously_ a boundary,\n            // because we already accepted this update (accidental side effect).\n            var isNoLongerABoundary = prevExports !== null;\n            if (isNoLongerABoundary) {\n                module.hot.invalidate();\n            }\n        }\n    }\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/harmony-module.js */ \"./node_modules/webpack/buildin/harmony-module.js\")(module)))//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vcGFnZXMvYWxsbm90ZXMuanM/MjE2MSJdLCJuYW1lcyI6WyJBbGxOb3RlcyIsInVzZVN0YXRlIiwiYWxsTm90ZXNPYmplY3QiLCJzZXRBbGxOb3Rlc09iamVjdCIsInVzZUVmZmVjdCIsImdldEFsbFN0b3JlZE5vdGVzIiwiYWxsTm90ZXNPYmoiLCJkZWxldGVSb3dGcm9tVGFibGUiLCJub3RlVXJsIiwiZGVsZXRlTm90ZXNGb3JVcmwiLCJjc3MiLCJhbGxfX25vdGVzX190YWJsZSIsIk9iamVjdCIsImtleXMiLCJtYXAiLCJ1cmxLZXkiLCJCYXNlUG9wdXAiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUVBO0FBQ0E7QUFFQTtBQUVBOztBQUVBLElBQU1BLFFBQVEsR0FBRyxTQUFYQSxRQUFXLEdBQU07QUFBQTs7QUFBQSxrQkFDeUJDLHNEQUFRLENBQUMsSUFBRCxDQURqQztBQUFBLE1BQ1pDLGNBRFk7QUFBQSxNQUNJQyxpQkFESjs7QUFHbkJDLHlEQUFTLENBQUMsWUFBTTtBQUNaQyx3RUFBaUIsQ0FBQyxVQUFVQyxXQUFWLEVBQXVCO0FBQ3JDSCx1QkFBaUIsQ0FBQ0csV0FBRCxDQUFqQjtBQUNILEtBRmdCLENBQWpCO0FBR0gsR0FKUSxFQUlOLEVBSk0sQ0FBVDs7QUFNQSxNQUFNQyxrQkFBa0IsR0FBRyxTQUFyQkEsa0JBQXFCLENBQUNDLE9BQUQsRUFBYTtBQUNwQ0Msd0VBQWlCLENBQUNELE9BQUQsRUFBVSxVQUFDRixXQUFELEVBQWlCO0FBQ3hDSCx1QkFBaUIsQ0FBQ0csV0FBRCxDQUFqQjtBQUNILEtBRmdCLENBQWpCO0FBR0gsR0FKRDs7QUFNQSxzQkFDSTtBQUFLLGFBQVMsRUFBQyxZQUFmO0FBQUEsMkJBQ0kscUVBQUMsNkRBQUQ7QUFDSSxlQUFTLEVBQUVJLGlFQUFHLENBQUNDLGlCQURuQjtBQUVJLGdCQUFVLE1BRmQ7QUFHSSxhQUFPLE1BSFg7QUFJSSxXQUFLLE1BSlQ7QUFLSSxVQUFJLEVBQUMsSUFMVDtBQUFBLDhCQU9JO0FBQU8saUJBQVMsRUFBQyx3QkFBakI7QUFBQSwrQkFDSTtBQUFJLG1CQUFTLEVBQUMsS0FBZDtBQUFBLGtDQUNJO0FBQUkscUJBQVMsRUFBQyxVQUFkO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQURKLGVBRUk7QUFBSSxxQkFBUyxFQUFDLFVBQWQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsbUJBRkosZUFHSTtBQUFJLHFCQUFTLEVBQUMsVUFBZDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxtQkFISixlQUlJO0FBQUkscUJBQVMsRUFBQyxVQUFkO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLG1CQUpKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQURKO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFQSixFQWVLVCxjQUFjLGdCQUNYO0FBQU8saUJBQVMsRUFBQyxzQkFBakI7QUFBQSxrQkFDS1UsTUFBTSxDQUFDQyxJQUFQLENBQVlYLGNBQVosRUFBNEJZLEdBQTVCLENBQWdDLFVBQUNDLE1BQUQ7QUFBQSw4QkFDN0IscUVBQUMsaUVBQUQ7QUFDSSxvQkFBUSxFQUFFYixjQUFjLENBQUNhLE1BQUQsQ0FENUI7QUFFSSw4QkFBa0IsRUFBRVI7QUFGeEI7QUFBQTtBQUFBO0FBQUE7QUFBQSxtQkFENkI7QUFBQSxTQUFoQztBQURMO0FBQUE7QUFBQTtBQUFBO0FBQUEsZUFEVyxnQkFVWDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxlQXpCUjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFESjtBQUFBO0FBQUE7QUFBQTtBQUFBLFdBREo7QUFnQ0gsQ0EvQ0Q7O0dBQU1QLFE7O0tBQUFBLFE7QUFpRFMscUVBQUFnQixzRUFBUyxDQUFDaEIsUUFBRCxDQUF4QiIsImZpbGUiOiIuL3BhZ2VzL2FsbG5vdGVzLmpzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IHVzZVN0YXRlLCB1c2VFZmZlY3QgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgVGFibGUgZnJvbSAncmVhY3QtYm9vdHN0cmFwL1RhYmxlJztcblxuaW1wb3J0IEJhc2VQb3B1cCBmcm9tICcuLi9jb21wb25lbnRzL2Jhc2VfcG9wdXAnO1xuaW1wb3J0IE5vdGVUYWJsZUl0ZW0gZnJvbSAnLi4vY29tcG9uZW50cy9Ob3RlVGFibGVJdGVtJztcblxuaW1wb3J0IHsgZGVsZXRlTm90ZXNGb3JVcmwsIGdldEFsbFN0b3JlZE5vdGVzIH0gZnJvbSAnLi4vbGliL25vdGVzJztcblxuaW1wb3J0IGNzcyBmcm9tICcuLi9zdHlsZXMvY29tbW9uLm1vZHVsZS5zY3NzJztcblxuY29uc3QgQWxsTm90ZXMgPSAoKSA9PiB7XG4gICAgY29uc3QgW2FsbE5vdGVzT2JqZWN0LCBzZXRBbGxOb3Rlc09iamVjdF0gPSB1c2VTdGF0ZShudWxsKTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGdldEFsbFN0b3JlZE5vdGVzKGZ1bmN0aW9uIChhbGxOb3Rlc09iaikge1xuICAgICAgICAgICAgc2V0QWxsTm90ZXNPYmplY3QoYWxsTm90ZXNPYmopO1xuICAgICAgICB9KTtcbiAgICB9LCBbXSk7XG5cbiAgICBjb25zdCBkZWxldGVSb3dGcm9tVGFibGUgPSAobm90ZVVybCkgPT4ge1xuICAgICAgICBkZWxldGVOb3Rlc0ZvclVybChub3RlVXJsLCAoYWxsTm90ZXNPYmopID0+IHtcbiAgICAgICAgICAgIHNldEFsbE5vdGVzT2JqZWN0KGFsbE5vdGVzT2JqKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWxsX19ub3Rlc1wiPlxuICAgICAgICAgICAgPFRhYmxlXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjc3MuYWxsX19ub3Rlc19fdGFibGV9XG4gICAgICAgICAgICAgICAgcmVzcG9uc2l2ZVxuICAgICAgICAgICAgICAgIHN0cmlwZWRcbiAgICAgICAgICAgICAgICBob3ZlclxuICAgICAgICAgICAgICAgIHNpemU9XCJzbVwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPHRoZWFkIGNsYXNzTmFtZT1cImFsbC1ub3Rlcy10YWJsZS1oZWFkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPHRyIGNsYXNzTmFtZT1cInJvd1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cImNvbC1zbS0yXCI+VGl0bGU8L3RoPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cImNvbC1zbS0yXCI+VVJMPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJjb2wtc20tNlwiPk5vdGVzPC90aD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJjb2wtc20tMVwiPkFjdGlvbnM8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICAgICAge2FsbE5vdGVzT2JqZWN0ID8gKFxuICAgICAgICAgICAgICAgICAgICA8dGJvZHkgY2xhc3NOYW1lPVwiYWxsLW5vdGVzLXRhYmxlLWJvZHlcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtPYmplY3Qua2V5cyhhbGxOb3Rlc09iamVjdCkubWFwKCh1cmxLZXkpID0+IChcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Tm90ZVRhYmxlSXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3RlRGF0YT17YWxsTm90ZXNPYmplY3RbdXJsS2V5XX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlUm93RnJvbVRhYmxlPXtkZWxldGVSb3dGcm9tVGFibGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgIDxoMT5Mb2FkaW5nLi4uPC9oMT5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9UYWJsZT5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2VQb3B1cChBbGxOb3Rlcyk7XG4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./pages/allnotes.js\n");

/***/ })

})