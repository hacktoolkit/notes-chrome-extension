webpackHotUpdate_N_E("pages/popup",{

/***/ "./pages/popup.js":
/*!************************!*\
  !*** ./pages/popup.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(module) {/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ \"./node_modules/@babel/runtime/helpers/esm/defineProperty.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ \"./node_modules/@babel/runtime/helpers/esm/classCallCheck.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ \"./node_modules/@babel/runtime/helpers/esm/createClass.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inherits */ \"./node_modules/@babel/runtime/helpers/esm/inherits.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/esm/possibleConstructorReturn */ \"./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/esm/getPrototypeOf */ \"./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_7__);\n/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react-bootstrap */ \"./node_modules/react-bootstrap/esm/index.js\");\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! next/head */ \"./node_modules/next/head.js\");\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(next_head__WEBPACK_IMPORTED_MODULE_9__);\n/* harmony import */ var _lib_canAccessChromeTabs__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../lib/canAccessChromeTabs */ \"./lib/canAccessChromeTabs.js\");\n/* harmony import */ var _components_base_popup__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../components/base_popup */ \"./components/base_popup.js\");\n\n\n\n\n\n\n\nvar _jsxFileName = \"/Users/jontsai/code/chrome-extensions/notes-chrome-extension/app/pages/popup.js\";\n\nfunction _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__[\"default\"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__[\"default\"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return Object(_babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__[\"default\"])(this, result); }; }\n\nfunction _isNativeReflectConstruct() { if (typeof Reflect === \"undefined\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \"function\") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }\n\n\n\n\n\n\n\nvar Popup = /*#__PURE__*/function (_React$Component) {\n  Object(_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(Popup, _React$Component);\n\n  var _super = _createSuper(Popup);\n\n  function Popup(props) {\n    var _this;\n\n    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(this, Popup);\n\n    _this = _super.call(this, props);\n    _this.currentTabUrlInput = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_7___default.a.createRef();\n    _this.currentTabIconImg = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_7___default.a.createRef();\n    _this.currentTabTitleInput = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_7___default.a.createRef();\n    _this.currentTabNotesInput = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_7___default.a.createRef();\n    return _this;\n  }\n\n  Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_2__[\"default\"])(Popup, [{\n    key: \"saveNotesForCurrentTab\",\n    value: function saveNotesForCurrentTab() {\n      var popup = this.props.popup;\n      var self = this;\n\n      if (props.state.currentTabUrl === '') {\n        popup.showErrorAlert();\n      } else {\n        var noteUrl = this.currentTabUrl.value;\n        var noteImage = this.currentTabIconImg.attr('src');\n        var noteTitle = this.currentTabTitleInput.value;\n        var noteText = this.currentTabNotesInput.value; // TODO: Date and Time Properties\n\n        var noteMetaDataObject = {\n          noteUrl: noteUrl,\n          noteImage: noteImage,\n          noteTitle: noteTitle,\n          noteText: noteText\n        };\n        ALL_NOTES_OBJECT[CURRENT_TAB_URL] = noteMetaDataObject;\n        chrome.storage.sync.set(Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({}, CURRENT_TAB_URL, noteMetaDataObject), function () {\n          self.showSuccessAlert();\n        });\n        chrome.storage.sync.set(Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({}, CHROME_STORAGE_ALL_NOTES_KEY, ALL_NOTES_OBJECT), function () {\n          self.showSuccessAlert();\n        });\n      }\n    }\n  }, {\n    key: \"handleSaveButtonClicked\",\n    value: function handleSaveButtonClicked() {\n      var popup = this.props.popup;\n\n      if (Object(_lib_canAccessChromeTabs__WEBPACK_IMPORTED_MODULE_10__[\"default\"])()) {\n        this.saveNotesForCurrentTab();\n      } else {\n        popup.showSuccessAlert();\n      }\n    }\n  }, {\n    key: \"render\",\n    value: function render() {\n      var popup = this.props.popup;\n      return /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(\"div\", {\n        className: \"container\",\n        id: \"main__add__section\",\n        children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(\"div\", {\n          className: \"mb-2\",\n          children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__[\"Row\"], {\n            children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__[\"Col\"], {\n              sm: \"2\",\n              className: \"fill nopadding\",\n              children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(\"img\", {\n                src: popup.state.currentTabIcon,\n                id: \"currentTabIcon\",\n                className: \"img-thumbnail\",\n                alt: \"Tab Image\",\n                ref: this.currentTabIconImg\n              }, void 0, false, {\n                fileName: _jsxFileName,\n                lineNumber: 74,\n                columnNumber: 29\n              }, this)\n            }, void 0, false, {\n              fileName: _jsxFileName,\n              lineNumber: 73,\n              columnNumber: 25\n            }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__[\"Col\"], {\n              sm: \"10\",\n              children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__[\"Form\"].Group, {\n                controlId: \"currentTabUrl\",\n                children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__[\"Form\"].Label, {\n                  children: \"Current URL\"\n                }, void 0, false, {\n                  fileName: _jsxFileName,\n                  lineNumber: 85,\n                  columnNumber: 33\n                }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__[\"Form\"].Control, {\n                  type: \"text\",\n                  defaultValue: popup.state.currentTabUrl,\n                  ref: this.currentTabUrlInput\n                }, void 0, false, {\n                  fileName: _jsxFileName,\n                  lineNumber: 86,\n                  columnNumber: 33\n                }, this)]\n              }, void 0, true, {\n                fileName: _jsxFileName,\n                lineNumber: 84,\n                columnNumber: 29\n              }, this)\n            }, void 0, false, {\n              fileName: _jsxFileName,\n              lineNumber: 83,\n              columnNumber: 25\n            }, this)]\n          }, void 0, true, {\n            fileName: _jsxFileName,\n            lineNumber: 72,\n            columnNumber: 21\n          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(\"div\", {\n            className: \"mb-2\",\n            children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__[\"Form\"].Group, {\n              controlId: \"currentTabTitle\",\n              children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__[\"Form\"].Label, {\n                children: \"Title\"\n              }, void 0, false, {\n                fileName: _jsxFileName,\n                lineNumber: 96,\n                columnNumber: 29\n              }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__[\"Form\"].Control, {\n                type: \"text\",\n                defaultValue: popup.state.currentTabTitle,\n                ref: this.currentTabTitleInput\n              }, void 0, false, {\n                fileName: _jsxFileName,\n                lineNumber: 97,\n                columnNumber: 29\n              }, this)]\n            }, void 0, true, {\n              fileName: _jsxFileName,\n              lineNumber: 95,\n              columnNumber: 25\n            }, this)\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 94,\n            columnNumber: 21\n          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(\"div\", {\n            className: \"mb-2\",\n            children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__[\"Form\"].Group, {\n              controlId: \"currentTabNotes\",\n              children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__[\"Form\"].Label, {\n                children: \"Notes\"\n              }, void 0, false, {\n                fileName: _jsxFileName,\n                lineNumber: 106,\n                columnNumber: 29\n              }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__[\"Form\"].Control, {\n                as: \"textarea\",\n                rows: 5,\n                defaultValue: popup.state.currentTabNotes,\n                ref: this.currentTabNotesInput\n              }, void 0, false, {\n                fileName: _jsxFileName,\n                lineNumber: 107,\n                columnNumber: 29\n              }, this)]\n            }, void 0, true, {\n              fileName: _jsxFileName,\n              lineNumber: 105,\n              columnNumber: 25\n            }, this)\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 104,\n            columnNumber: 21\n          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__[\"Button\"], {\n            id: \"save-button\",\n            variant: \"dark\",\n            onClick: this.handleSaveButtonClicked.bind(this),\n            children: \"Save\"\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 115,\n            columnNumber: 21\n          }, this)]\n        }, void 0, true, {\n          fileName: _jsxFileName,\n          lineNumber: 71,\n          columnNumber: 17\n        }, this)\n      }, void 0, false, {\n        fileName: _jsxFileName,\n        lineNumber: 70,\n        columnNumber: 13\n      }, this);\n    }\n  }]);\n\n  return Popup;\n}(react__WEBPACK_IMPORTED_MODULE_7___default.a.Component);\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (_c = Object(_components_base_popup__WEBPACK_IMPORTED_MODULE_11__[\"default\"])(Popup));\n\nvar _c;\n\n$RefreshReg$(_c, \"%default%\");\n\n;\n    var _a, _b;\n    // Legacy CSS implementations will `eval` browser code in a Node.js context\n    // to extract CSS. For backwards compatibility, we need to check we're in a\n    // browser context before continuing.\n    if (typeof self !== 'undefined' &&\n        // AMP / No-JS mode does not inject these helpers:\n        '$RefreshHelpers$' in self) {\n        var currentExports = module.__proto__.exports;\n        var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n        // This cannot happen in MainTemplate because the exports mismatch between\n        // templating and execution.\n        self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.i);\n        // A module can be accepted automatically based on its exports, e.g. when\n        // it is a Refresh Boundary.\n        if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n            // Save the previous exports on update so we can compare the boundary\n            // signatures.\n            module.hot.dispose(function (data) {\n                data.prevExports = currentExports;\n            });\n            // Unconditionally accept an update to this module, we'll check if it's\n            // still a Refresh Boundary later.\n            module.hot.accept();\n            // This field is set when the previous version of this module was a\n            // Refresh Boundary, letting us know we need to check for invalidation or\n            // enqueue an update.\n            if (prevExports !== null) {\n                // A boundary can become ineligible if its exports are incompatible\n                // with the previous exports.\n                //\n                // For example, if you add/remove/change exports, we'll want to\n                // re-execute the importing modules, and force those components to\n                // re-render. Similarly, if you convert a class component to a\n                // function, we want to invalidate the boundary.\n                if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                    module.hot.invalidate();\n                }\n                else {\n                    self.$RefreshHelpers$.scheduleUpdate();\n                }\n            }\n        }\n        else {\n            // Since we just executed the code for the module, it's possible that the\n            // new exports made it ineligible for being a boundary.\n            // We only care about the case when we were _previously_ a boundary,\n            // because we already accepted this update (accidental side effect).\n            var isNoLongerABoundary = prevExports !== null;\n            if (isNoLongerABoundary) {\n                module.hot.invalidate();\n            }\n        }\n    }\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/harmony-module.js */ \"./node_modules/webpack/buildin/harmony-module.js\")(module)))//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vcGFnZXMvcG9wdXAuanM/NzQ0NyJdLCJuYW1lcyI6WyJQb3B1cCIsInByb3BzIiwiY3VycmVudFRhYlVybElucHV0IiwiUmVhY3QiLCJjcmVhdGVSZWYiLCJjdXJyZW50VGFiSWNvbkltZyIsImN1cnJlbnRUYWJUaXRsZUlucHV0IiwiY3VycmVudFRhYk5vdGVzSW5wdXQiLCJwb3B1cCIsInNlbGYiLCJzdGF0ZSIsImN1cnJlbnRUYWJVcmwiLCJzaG93RXJyb3JBbGVydCIsIm5vdGVVcmwiLCJ2YWx1ZSIsIm5vdGVJbWFnZSIsImF0dHIiLCJub3RlVGl0bGUiLCJub3RlVGV4dCIsIm5vdGVNZXRhRGF0YU9iamVjdCIsIkFMTF9OT1RFU19PQkpFQ1QiLCJDVVJSRU5UX1RBQl9VUkwiLCJjaHJvbWUiLCJzdG9yYWdlIiwic3luYyIsInNldCIsInNob3dTdWNjZXNzQWxlcnQiLCJDSFJPTUVfU1RPUkFHRV9BTExfTk9URVNfS0VZIiwiY2FuQWNjZXNzQ2hyb21lVGFicyIsInNhdmVOb3Rlc0ZvckN1cnJlbnRUYWIiLCJjdXJyZW50VGFiSWNvbiIsImN1cnJlbnRUYWJUaXRsZSIsImN1cnJlbnRUYWJOb3RlcyIsImhhbmRsZVNhdmVCdXR0b25DbGlja2VkIiwiYmluZCIsIkNvbXBvbmVudCIsIkJhc2VQb3B1cCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFFQTtBQUVBOztJQUVNQSxLOzs7OztBQUNGLGlCQUFZQyxLQUFaLEVBQW1CO0FBQUE7O0FBQUE7O0FBQ2YsOEJBQU1BLEtBQU47QUFFQSxVQUFLQyxrQkFBTCxnQkFBMEJDLDRDQUFLLENBQUNDLFNBQU4sRUFBMUI7QUFDQSxVQUFLQyxpQkFBTCxnQkFBeUJGLDRDQUFLLENBQUNDLFNBQU4sRUFBekI7QUFDQSxVQUFLRSxvQkFBTCxnQkFBNEJILDRDQUFLLENBQUNDLFNBQU4sRUFBNUI7QUFDQSxVQUFLRyxvQkFB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QTtBQUFBLGtCQTVDSjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFESjtBQUFBO0FBQUE7QUFBQTtBQUFBLGNBREo7QUF3REg7Ozs7RUFwSGUvQiw0Q0FBSyxDQUFDZ0MsUzs7QUF1SFgsb0VBQUFDLHVFQUFTLENBQUNwQyxLQUFELENBQXhCIiwiZmlsZSI6Ii4vcGFnZXMvcG9wdXAuanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQnV0dG9uLCBGb3JtLCBSb3csIENvbCB9IGZyb20gJ3JlYWN0LWJvb3RzdHJhcCc7XG5pbXBvcnQgSGVhZCBmcm9tICduZXh0L2hlYWQnO1xuXG5pbXBvcnQgY2FuQWNjZXNzQ2hyb21lVGFicyBmcm9tICcuLi9saWIvY2FuQWNjZXNzQ2hyb21lVGFicyc7XG5cbmltcG9ydCBCYXNlUG9wdXAgZnJvbSAnLi4vY29tcG9uZW50cy9iYXNlX3BvcHVwJztcblxuY2xhc3MgUG9wdXAgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICB0aGlzLmN1cnJlbnRUYWJVcmxJbnB1dCA9IFJlYWN0LmNyZWF0ZVJlZigpO1xuICAgICAgICB0aGlzLmN1cnJlbnRUYWJJY29uSW1nID0gUmVhY3QuY3JlYXRlUmVmKCk7XG4gICAgICAgIHRoaXMuY3VycmVudFRhYlRpdGxlSW5wdXQgPSBSZWFjdC5jcmVhdGVSZWYoKTtcbiAgICAgICAgdGhpcy5jdXJyZW50VGFiTm90ZXNJbnB1dCA9IFJlYWN0LmNyZWF0ZVJlZigpO1xuICAgIH1cblxuICAgIHNhdmVOb3Rlc0ZvckN1cnJlbnRUYWIoKSB7XG4gICAgICAgIGNvbnN0IHBvcHVwID0gdGhpcy5wcm9wcy5wb3B1cDtcbiAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHByb3BzLnN0YXRlLmN1cnJlbnRUYWJVcmwgPT09ICcnKSB7XG4gICAgICAgICAgICBwb3B1cC5zaG93RXJyb3JBbGVydCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgbm90ZVVybCA9IHRoaXMuY3VycmVudFRhYlVybC52YWx1ZTtcbiAgICAgICAgICAgIGNvbnN0IG5vdGVJbWFnZSA9IHRoaXMuY3VycmVudFRhYkljb25JbWcuYXR0cignc3JjJyk7XG4gICAgICAgICAgICBjb25zdCBub3RlVGl0bGUgPSB0aGlzLmN1cnJlbnRUYWJUaXRsZUlucHV0LnZhbHVlO1xuICAgICAgICAgICAgY29uc3Qgbm90ZVRleHQgPSB0aGlzLmN1cnJlbnRUYWJOb3Rlc0lucHV0LnZhbHVlO1xuICAgICAgICAgICAgLy8gVE9ETzogRGF0ZSBhbmQgVGltZSBQcm9wZXJ0aWVzXG5cbiAgICAgICAgICAgIGNvbnN0IG5vdGVNZXRhRGF0YU9iamVjdCA9IHtcbiAgICAgICAgICAgICAgICBub3RlVXJsOiBub3RlVXJsLFxuICAgICAgICAgICAgICAgIG5vdGVJbWFnZTogbm90ZUltYWdlLFxuICAgICAgICAgICAgICAgIG5vdGVUaXRsZTogbm90ZVRpdGxlLFxuICAgICAgICAgICAgICAgIG5vdGVUZXh0OiBub3RlVGV4dCxcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIEFMTF9OT1RFU19PQkpFQ1RbQ1VSUkVOVF9UQUJfVVJMXSA9IG5vdGVNZXRhRGF0YU9iamVjdDtcblxuICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQoXG4gICAgICAgICAgICAgICAgeyBbQ1VSUkVOVF9UQUJfVVJMXTogbm90ZU1ldGFEYXRhT2JqZWN0IH0sXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnNob3dTdWNjZXNzQWxlcnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQoXG4gICAgICAgICAgICAgICAgeyBbQ0hST01FX1NUT1JBR0VfQUxMX05PVEVTX0tFWV06IEFMTF9OT1RFU19PQkpFQ1QgfSxcbiAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2hvd1N1Y2Nlc3NBbGVydCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVTYXZlQnV0dG9uQ2xpY2tlZCgpIHtcbiAgICAgICAgY29uc3QgcG9wdXAgPSB0aGlzLnByb3BzLnBvcHVwO1xuXG4gICAgICAgIGlmIChjYW5BY2Nlc3NDaHJvbWVUYWJzKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc2F2ZU5vdGVzRm9yQ3VycmVudFRhYigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9wdXAuc2hvd1N1Y2Nlc3NBbGVydCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBwb3B1cCA9IHRoaXMucHJvcHMucG9wdXA7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29udGFpbmVyXCIgaWQ9XCJtYWluX19hZGRfX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1iLTJcIj5cbiAgICAgICAgICAgICAgICAgICAgPFJvdz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxDb2wgc209XCIyXCIgY2xhc3NOYW1lPVwiZmlsbCBub3BhZGRpbmdcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW1nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYz17cG9wdXAuc3RhdGUuY3VycmVudFRhYkljb259XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkPVwiY3VycmVudFRhYkljb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJpbWctdGh1bWJuYWlsXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0PVwiVGFiIEltYWdlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLmN1cnJlbnRUYWJJY29uSW1nfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0NvbD5cblxuICAgICAgICAgICAgICAgICAgICAgICAgPENvbCBzbT1cIjEwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZvcm0uR3JvdXAgY29udHJvbElkPVwiY3VycmVudFRhYlVybFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Rm9ybS5MYWJlbD5DdXJyZW50IFVSTDwvRm9ybS5MYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZvcm0uQ29udHJvbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlPXtwb3B1cC5zdGF0ZS5jdXJyZW50VGFiVXJsfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmPXt0aGlzLmN1cnJlbnRUYWJVcmxJbnB1dH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPjwvRm9ybS5Db250cm9sPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvRm9ybS5Hcm91cD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQ29sPlxuICAgICAgICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYi0yXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Rm9ybS5Hcm91cCBjb250cm9sSWQ9XCJjdXJyZW50VGFiVGl0bGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Rm9ybS5MYWJlbD5UaXRsZTwvRm9ybS5MYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Rm9ybS5Db250cm9sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlPXtwb3B1cC5zdGF0ZS5jdXJyZW50VGFiVGl0bGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZj17dGhpcy5jdXJyZW50VGFiVGl0bGVJbnB1dH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+PC9Gb3JtLkNvbnRyb2w+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0Zvcm0uR3JvdXA+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1iLTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxGb3JtLkdyb3VwIGNvbnRyb2xJZD1cImN1cnJlbnRUYWJOb3Rlc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGb3JtLkxhYmVsPk5vdGVzPC9Gb3JtLkxhYmVsPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGb3JtLkNvbnRyb2xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXM9XCJ0ZXh0YXJlYVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd3M9ezV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZT17cG9wdXAuc3RhdGUuY3VycmVudFRhYk5vdGVzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWY9e3RoaXMuY3VycmVudFRhYk5vdGVzSW5wdXR9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPjwvRm9ybS5Db250cm9sPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Gb3JtLkdyb3VwPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ9XCJzYXZlLWJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXJpYW50PVwiZGFya1wiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLmhhbmRsZVNhdmVCdXR0b25DbGlja2VkLmJpbmQodGhpcyl9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIFNhdmVcbiAgICAgICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2VQb3B1cChQb3B1cCk7XG4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./pages/popup.js\n");

/***/ })

})