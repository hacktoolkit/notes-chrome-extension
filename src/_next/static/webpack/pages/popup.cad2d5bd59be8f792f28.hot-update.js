webpackHotUpdate_N_E("pages/popup",{

/***/ "./components/base_popup.js":
/*!**********************************!*\
  !*** ./components/base_popup.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(module) {/* harmony import */ var _babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/defineProperty */ \"./node_modules/@babel/runtime/helpers/esm/defineProperty.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ \"./node_modules/@babel/runtime/helpers/esm/classCallCheck.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ \"./node_modules/@babel/runtime/helpers/esm/createClass.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inherits */ \"./node_modules/@babel/runtime/helpers/esm/inherits.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/esm/possibleConstructorReturn */ \"./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @babel/runtime/helpers/esm/getPrototypeOf */ \"./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_7__);\n/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! react-bootstrap */ \"./node_modules/react-bootstrap/esm/index.js\");\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! next/head */ \"./node_modules/next/head.js\");\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(next_head__WEBPACK_IMPORTED_MODULE_9__);\n/* harmony import */ var _lib_canAccessChromeTabs__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../lib/canAccessChromeTabs */ \"./lib/canAccessChromeTabs.js\");\n/* harmony import */ var _lib_is_dev__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../lib/is_dev */ \"./lib/is_dev.js\");\n/* harmony import */ var _styles_common_module_scss__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../styles/common.module.scss */ \"./styles/common.module.scss\");\n/* harmony import */ var _styles_common_module_scss__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(_styles_common_module_scss__WEBPACK_IMPORTED_MODULE_12__);\n\n\n\n\n\n\n\nvar _jsxFileName = \"/Users/jontsai/code/chrome-extensions/notes-chrome-extension/app/components/base_popup.js\";\n\nfunction _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__[\"default\"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_5__[\"default\"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return Object(_babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_4__[\"default\"])(this, result); }; }\n\nfunction _isNativeReflectConstruct() { if (typeof Reflect === \"undefined\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \"function\") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }\n\n\n\n\n\n\n\nvar CHROME_STORAGE_ALL_NOTES_KEY = '__ALL_NOTE_DATA__';\n\nfunction BasePopup(WrappedComponent) {\n  return /*#__PURE__*/function (_React$Component) {\n    Object(_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(_class, _React$Component);\n\n    var _super = _createSuper(_class);\n\n    function _class(props) {\n      var _this;\n\n      Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(this, _class);\n\n      _this = _super.call(this, props);\n      _this.state = {\n        alert: null,\n        ALL_NOTES_OBJECT: {},\n        currentTabUrl: '',\n        currentTabTitle: '',\n        currentTabIcon: '',\n        currentTabNotes: ''\n      };\n      return _this;\n    }\n\n    Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_2__[\"default\"])(_class, [{\n      key: \"componentDidMount\",\n      value: function componentDidMount() {\n        if (Object(_lib_canAccessChromeTabs__WEBPACK_IMPORTED_MODULE_10__[\"default\"])()) {\n          this.fetchCurrentTabData();\n        }\n      }\n    }, {\n      key: \"fetchCurrentTabData\",\n      value: function fetchCurrentTabData() {\n        var self = this;\n        chrome.tabs.query({\n          active: true,\n          lastFocusedWindow: true\n        }, function (tabs) {\n          self.setState({\n            currentTabUrl: tabs[0].url,\n            currentTabTitle: tabs[0].title,\n            currentTabIcon: tabs[0].favIconUrl ? tabs[0].favIconUrl : ''\n          });\n        });\n        chrome.storage.sync.get([CHROME_STORAGE_ALL_NOTES_KEY], function (result) {\n          var ALL_NOTES_OBJECT = result[CHROME_STORAGE_ALL_NOTES_KEY] || {};\n\n          if (typeof ALL_NOTES_OBJECT[self.state.currentTabUrl] !== 'undefined') {\n            self.setState({\n              currentTabUrl: ALL_NOTES_OBJECT[self.state.currentTabUrl].noteUrl,\n              currentTabTitle: ALL_NOTES_OBJECT[self.state.currentTabUrl].noteTitle,\n              currentTabNotes: ALL_NOTES_OBJECT[self.state.currentTabUrl].noteText\n            });\n          }\n        });\n      }\n    }, {\n      key: \"saveNotesForCurrentTab\",\n      value: function saveNotesForCurrentTab() {\n        var self = this;\n\n        if (CURRENT_TAB_URL === '') {\n          self.showErrorAlert();\n        } else {\n          var noteUrl = $('#currentTabURL').val();\n          var noteImage = $('#currentTabImage').attr('src');\n          var noteTitle = $('#currentTabTitle').val();\n          var noteText = $('#notes-content').val(); // TODO: Date and Time Properties\n\n          var noteMetaDataObject = {\n            noteUrl: noteUrl,\n            noteImage: noteImage,\n            noteTitle: noteTitle,\n            noteText: noteText\n          };\n          ALL_NOTES_OBJECT[CURRENT_TAB_URL] = noteMetaDataObject;\n          chrome.storage.sync.set(Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({}, CURRENT_TAB_URL, noteMetaDataObject), function () {\n            self.showSuccessAlert();\n          });\n          chrome.storage.sync.set(Object(_babel_runtime_helpers_esm_defineProperty__WEBPACK_IMPORTED_MODULE_0__[\"default\"])({}, CHROME_STORAGE_ALL_NOTES_KEY, ALL_NOTES_OBJECT), function () {\n            self.showSuccessAlert();\n          });\n        }\n      }\n    }, {\n      key: \"addAlert\",\n      value: function addAlert(heading, message, alertType) {\n        this.setState({\n          alert: {\n            heading: heading,\n            message: message,\n            alertType: alertType\n          }\n        });\n      }\n    }, {\n      key: \"showSuccessAlert\",\n      value: function showSuccessAlert() {\n        this.addAlert('Winner, winner, chicken dinner!', 'Saved successfully!', 'success');\n      }\n    }, {\n      key: \"showErrorAlert\",\n      value: function showErrorAlert() {\n        this.addAlert('Oh snap! You got an error!', 'Unable to save', 'danger');\n      }\n    }, {\n      key: \"render\",\n      value: function render() {\n        var _this2 = this;\n\n        var extension = Object(_lib_is_dev__WEBPACK_IMPORTED_MODULE_11__[\"default\"])() ? '' : '.html';\n        var alertJSX = this.state.alert ? /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__[\"Alert\"], {\n          show: \"true\",\n          variant: this.state.alert.alertType,\n          onClose: function onClose() {\n            return _this2.setState({\n              alert: null\n            });\n          },\n          dismissible: true,\n          children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__[\"Alert\"].Heading, {\n            children: this.state.alert.heading\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 143,\n            columnNumber: 21\n          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(\"p\", {\n            children: this.state.alert.message\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 144,\n            columnNumber: 21\n          }, this)]\n        }, void 0, true, {\n          fileName: _jsxFileName,\n          lineNumber: 137,\n          columnNumber: 17\n        }, this) : null;\n        return /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(\"div\", {\n          className: _styles_common_module_scss__WEBPACK_IMPORTED_MODULE_12___default.a.popup,\n          children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(next_head__WEBPACK_IMPORTED_MODULE_9___default.a, {\n            children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(\"title\", {\n              children: \"Notes Chrome Plugin\"\n            }, void 0, false, {\n              fileName: _jsxFileName,\n              lineNumber: 151,\n              columnNumber: 25\n            }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(\"meta\", {\n              charSet: \"utf-8\"\n            }, void 0, false, {\n              fileName: _jsxFileName,\n              lineNumber: 153,\n              columnNumber: 25\n            }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(\"meta\", {\n              name: \"viewport\",\n              content: \"width=device-width, initial-scale=1, shrink-to-fit=no\"\n            }, void 0, false, {\n              fileName: _jsxFileName,\n              lineNumber: 154,\n              columnNumber: 25\n            }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(\"link\", {\n              rel: \"icon\",\n              href: \"/favicon.ico\"\n            }, void 0, false, {\n              fileName: _jsxFileName,\n              lineNumber: 159,\n              columnNumber: 25\n            }, this)]\n          }, void 0, true, {\n            fileName: _jsxFileName,\n            lineNumber: 150,\n            columnNumber: 21\n          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(\"main\", {\n            className: _styles_common_module_scss__WEBPACK_IMPORTED_MODULE_12___default.a.main,\n            children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__[\"Navbar\"], {\n              bg: \"dark\",\n              variant: \"dark\",\n              children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__[\"Navbar\"].Brand, {\n                children: \"Note Taker\"\n              }, void 0, false, {\n                fileName: _jsxFileName,\n                lineNumber: 163,\n                columnNumber: 29\n              }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__[\"Nav\"], {\n                children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__[\"Nav\"].Link, {\n                  href: \"popup\".concat(extension),\n                  children: \"Current Page\"\n                }, void 0, false, {\n                  fileName: _jsxFileName,\n                  lineNumber: 165,\n                  columnNumber: 33\n                }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_8__[\"Nav\"].Link, {\n                  href: \"allnotes\".concat(extension),\n                  children: \"All Notes\"\n                }, void 0, false, {\n                  fileName: _jsxFileName,\n                  lineNumber: 168,\n                  columnNumber: 33\n                }, this)]\n              }, void 0, true, {\n                fileName: _jsxFileName,\n                lineNumber: 164,\n                columnNumber: 29\n              }, this)]\n            }, void 0, true, {\n              fileName: _jsxFileName,\n              lineNumber: 162,\n              columnNumber: 25\n            }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(WrappedComponent, {\n              popup: this\n            }, void 0, false, {\n              fileName: _jsxFileName,\n              lineNumber: 174,\n              columnNumber: 25\n            }, this)]\n          }, void 0, true, {\n            fileName: _jsxFileName,\n            lineNumber: 161,\n            columnNumber: 21\n          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_6__[\"jsxDEV\"])(\"div\", {\n            className: \"alerts\",\n            children: alertJSX\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 176,\n            columnNumber: 21\n          }, this)]\n        }, void 0, true, {\n          fileName: _jsxFileName,\n          lineNumber: 149,\n          columnNumber: 17\n        }, this);\n      }\n    }]);\n\n    return _class;\n  }(react__WEBPACK_IMPORTED_MODULE_7___default.a.Component);\n}\n\n_c = BasePopup;\n/* harmony default export */ __webpack_exports__[\"default\"] = (BasePopup);\n\nvar _c;\n\n$RefreshReg$(_c, \"BasePopup\");\n\n;\n    var _a, _b;\n    // Legacy CSS implementations will `eval` browser code in a Node.js context\n    // to extract CSS. For backwards compatibility, we need to check we're in a\n    // browser context before continuing.\n    if (typeof self !== 'undefined' &&\n        // AMP / No-JS mode does not inject these helpers:\n        '$RefreshHelpers$' in self) {\n        var currentExports = module.__proto__.exports;\n        var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n        // This cannot happen in MainTemplate because the exports mismatch between\n        // templating and execution.\n        self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.i);\n        // A module can be accepted automatically based on its exports, e.g. when\n        // it is a Refresh Boundary.\n        if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n            // Save the previous exports on update so we can compare the boundary\n            // signatures.\n            module.hot.dispose(function (data) {\n                data.prevExports = currentExports;\n            });\n            // Unconditionally accept an update to this module, we'll check if it's\n            // still a Refresh Boundary later.\n            module.hot.accept();\n            // This field is set when the previous version of this module was a\n            // Refresh Boundary, letting us know we need to check for invalidation or\n            // enqueue an update.\n            if (prevExports !== null) {\n                // A boundary can become ineligible if its exports are incompatible\n                // with the previous exports.\n                //\n                // For example, if you add/remove/change exports, we'll want to\n                // re-execute the importing modules, and force those components to\n                // re-render. Similarly, if you convert a class component to a\n                // function, we want to invalidate the boundary.\n                if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                    module.hot.invalidate();\n                }\n                else {\n                    self.$RefreshHelpers$.scheduleUpdate();\n                }\n            }\n        }\n        else {\n            // Since we just executed the code for the module, it's possible that the\n            // new exports made it ineligible for being a boundary.\n            // We only care about the case when we were _previously_ a boundary,\n            // because we already accepted this update (accidental side effect).\n            var isNoLongerABoundary = prevExports !== null;\n            if (isNoLongerABoundary) {\n                module.hot.invalidate();\n            }\n        }\n    }\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/harmony-module.js */ \"./node_modules/webpack/buildin/harmony-module.js\")(module)))//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vY29tcG9uZW50cy9iYXNlX3BvcHVwLmpzPzFmMDAiXSwibmFtZXMiOlsiQ0hST01FX1NUT1JBR0VfQUxMX05PVEVTX0tFWSIsIkJhc2VQb3B1cCIsIldyYXBwZWRDb21wb25lbnQiLCJwcm9wcyIsInN0YXRlIiwiYWxlcnQiLCJBTExfTk9URVNfT0JKRUNUIiwiY3VycmVudFRhYlVybCIsImN1cnJlbnRUYWJUaXRsZSIsImN1cnJlbnRUYWJJY29uIiwiY3VycmVudFRhYk5vdGVzIiwiY2FuQWNjZXNzQ2hyb21lVGFicyIsImZldGNoQ3VycmVudFRhYkRhdGEiLCJzZWxmIiwiY2hyb21lIiwidGFicyIsInF1ZXJ5IiwiYWN0aXZlIiwibGFzdEZvY3VzZWRXaW5kb3ciLCJzZXRTdGF0ZSIsInVybCIsInRpdGxlIiwiZmF2SWNvblVybCIsInN0b3JhZ2UiLCJzeW5jIiwiZ2V0IiwicmVzdWx0Iiwibm90ZVVybCIsIm5vdGVUaXRsZSIsIm5vdGVUZXh0IiwiQ1VSUkVOVF9UQUJfVVJMIiwic2hvd0Vycm9yQWxlcnQiLCIkIiwidmFsIiwibm90ZUltYWdlIiwiYXR0ciIsIm5vdGVNZXRhRGF0YU9iamVjdCIsInNldCIsInNob3dTdWNjZXNzQWxlcnQiLCJoZWFkaW5nIiwibWVzc2FnZSIsImFsZXJ0VHlwZSIsImFkZEFsZXJ0IiwiZXh0ZW5zaW9uIiwiaXNEZXYiLCJhbGVydEpTWCIsImNzcyIsInBvcHVwIiwibWFpbiIsIlJlYWN0IiwiQ29tcG9uZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUVBO0FBRUE7QUFDQTtBQUVBO0FBRUEsSUFBTUEsNEJBQTRCLEdBQUcsbUJBQXJDOztBQUVBLFNBQVNDLFNBQVQsQ0FBbUJDLGdCQUFuQixFQUFxQztBQUNqQztBQUFBOztBQUFBOztBQUNJLG9CQUFZQyxLQUFaLEVBQW1CO0FBQUE7O0FBQUE7O0FBQ2YsZ0NBQU1BLEtBQU47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LHdCQUpKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxzQkFGSjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsb0JBREosZUFhSSxxRUFBQyxnQkFBRDtBQUFrQixtQkFBSyxFQUFFO0FBQXpCO0FBQUE7QUFBQTtBQUFBO0FBQUEsb0JBYko7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGtCQVpKLGVBMkJJO0FBQUsscUJBQVMsRUFBQyxRQUFmO0FBQUEsc0JBQXlCRTtBQUF6QjtBQUFBO0FBQUE7QUFBQTtBQUFBLGtCQTNCSjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsZ0JBREo7QUErQkg7QUFyS0w7O0FBQUE7QUFBQSxJQUFxQkksNENBQUssQ0FBQ0MsU0FBM0I7QUF1S0g7O0tBeEtRakQsUztBQTBLTUEsd0VBQWYiLCJmaWxlIjoiLi9jb21wb25lbnRzL2Jhc2VfcG9wdXAuanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQWxlcnQsIE5hdiwgTmF2YmFyIH0gZnJvbSAncmVhY3QtYm9vdHN0cmFwJztcblxuaW1wb3J0IEhlYWQgZnJvbSAnbmV4dC9oZWFkJztcblxuaW1wb3J0IGNhbkFjY2Vzc0Nocm9tZVRhYnMgZnJvbSAnLi4vbGliL2NhbkFjY2Vzc0Nocm9tZVRhYnMnO1xuaW1wb3J0IGlzRGV2IGZyb20gJy4uL2xpYi9pc19kZXYnO1xuXG5pbXBvcnQgY3NzIGZyb20gJy4uL3N0eWxlcy9jb21tb24ubW9kdWxlLnNjc3MnO1xuXG5jb25zdCBDSFJPTUVfU1RPUkFHRV9BTExfTk9URVNfS0VZID0gJ19fQUxMX05PVEVfREFUQV9fJztcblxuZnVuY3Rpb24gQmFzZVBvcHVwKFdyYXBwZWRDb21wb25lbnQpIHtcbiAgICByZXR1cm4gY2xhc3MgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgICAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgICAgIGFsZXJ0OiBudWxsLFxuICAgICAgICAgICAgICAgIEFMTF9OT1RFU19PQkpFQ1Q6IHt9LFxuICAgICAgICAgICAgICAgIGN1cnJlbnRUYWJVcmw6ICcnLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRUYWJUaXRsZTogJycsXG4gICAgICAgICAgICAgICAgY3VycmVudFRhYkljb246ICcnLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRUYWJOb3RlczogJycsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICBpZiAoY2FuQWNjZXNzQ2hyb21lVGFicygpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mZXRjaEN1cnJlbnRUYWJEYXRhKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmZXRjaEN1cnJlbnRUYWJEYXRhKCkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBjaHJvbWUudGFicy5xdWVyeShcbiAgICAgICAgICAgICAgICB7IGFjdGl2ZTogdHJ1ZSwgbGFzdEZvY3VzZWRXaW5kb3c6IHRydWUgfSxcbiAgICAgICAgICAgICAgICAodGFicykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUYWJVcmw6IHRhYnNbMF0udXJsLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFRhYlRpdGxlOiB0YWJzWzBdLnRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFRhYkljb246IHRhYnNbMF0uZmF2SWNvblVybFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gdGFic1swXS5mYXZJY29uVXJsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoXG4gICAgICAgICAgICAgICAgW0NIUk9NRV9TVE9SQUdFX0FMTF9OT1RFU19LRVldLFxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgQUxMX05PVEVTX09CSkVDVCA9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRbQ0hST01FX1NUT1JBR0VfQUxMX05PVEVTX0tFWV0gfHwge307XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZW9mIEFMTF9OT1RFU19PQkpFQ1Rbc2VsZi5zdGF0ZS5jdXJyZW50VGFiVXJsXSAhPT1cbiAgICAgICAgICAgICAgICAgICAgICAgICd1bmRlZmluZWQnXG4gICAgICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFRhYlVybDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQUxMX05PVEVTX09CSkVDVFtzZWxmLnN0YXRlLmN1cnJlbnRUYWJVcmxdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubm90ZVVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50VGFiVGl0bGU6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFMTF9OT1RFU19PQkpFQ1Rbc2VsZi5zdGF0ZS5jdXJyZW50VGFiVXJsXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm5vdGVUaXRsZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50VGFiTm90ZXM6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFMTF9OT1RFU19PQkpFQ1Rbc2VsZi5zdGF0ZS5jdXJyZW50VGFiVXJsXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm5vdGVUZXh0LFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgc2F2ZU5vdGVzRm9yQ3VycmVudFRhYigpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAoQ1VSUkVOVF9UQUJfVVJMID09PSAnJykge1xuICAgICAgICAgICAgICAgIHNlbGYuc2hvd0Vycm9yQWxlcnQoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm90ZVVybCA9ICQoJyNjdXJyZW50VGFiVVJMJykudmFsKCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm90ZUltYWdlID0gJCgnI2N1cnJlbnRUYWJJbWFnZScpLmF0dHIoJ3NyYycpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vdGVUaXRsZSA9ICQoJyNjdXJyZW50VGFiVGl0bGUnKS52YWwoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBub3RlVGV4dCA9ICQoJyNub3Rlcy1jb250ZW50JykudmFsKCk7XG4gICAgICAgICAgICAgICAgLy8gVE9ETzogRGF0ZSBhbmQgVGltZSBQcm9wZXJ0aWVzXG5cbiAgICAgICAgICAgICAgICBjb25zdCBub3RlTWV0YURhdGFPYmplY3QgPSB7XG4gICAgICAgICAgICAgICAgICAgIG5vdGVVcmw6IG5vdGVVcmwsXG4gICAgICAgICAgICAgICAgICAgIG5vdGVJbWFnZTogbm90ZUltYWdlLFxuICAgICAgICAgICAgICAgICAgICBub3RlVGl0bGU6IG5vdGVUaXRsZSxcbiAgICAgICAgICAgICAgICAgICAgbm90ZVRleHQ6IG5vdGVUZXh0LFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBBTExfTk9URVNfT0JKRUNUW0NVUlJFTlRfVEFCX1VSTF0gPSBub3RlTWV0YURhdGFPYmplY3Q7XG5cbiAgICAgICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldChcbiAgICAgICAgICAgICAgICAgICAgeyBbQ1VSUkVOVF9UQUJfVVJMXTogbm90ZU1ldGFEYXRhT2JqZWN0IH0sXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuc2hvd1N1Y2Nlc3NBbGVydCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldChcbiAgICAgICAgICAgICAgICAgICAgeyBbQ0hST01FX1NUT1JBR0VfQUxMX05PVEVTX0tFWV06IEFMTF9OT1RFU19PQkpFQ1QgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zaG93U3VjY2Vzc0FsZXJ0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYWRkQWxlcnQoaGVhZGluZywgbWVzc2FnZSwgYWxlcnRUeXBlKSB7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICBhbGVydDogeyBoZWFkaW5nLCBtZXNzYWdlLCBhbGVydFR5cGUgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgc2hvd1N1Y2Nlc3NBbGVydCgpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQWxlcnQoXG4gICAgICAgICAgICAgICAgJ1dpbm5lciwgd2lubmVyLCBjaGlja2VuIGRpbm5lciEnLFxuICAgICAgICAgICAgICAgICdTYXZlZCBzdWNjZXNzZnVsbHkhJyxcbiAgICAgICAgICAgICAgICAnc3VjY2VzcydcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBzaG93RXJyb3JBbGVydCgpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkQWxlcnQoXG4gICAgICAgICAgICAgICAgJ09oIHNuYXAhIFlvdSBnb3QgYW4gZXJyb3IhJyxcbiAgICAgICAgICAgICAgICAnVW5hYmxlIHRvIHNhdmUnLFxuICAgICAgICAgICAgICAgICdkYW5nZXInXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVuZGVyKCkge1xuICAgICAgICAgICAgY29uc3QgZXh0ZW5zaW9uID0gaXNEZXYoKSA/ICcnIDogJy5odG1sJztcblxuICAgICAgICAgICAgY29uc3QgYWxlcnRKU1ggPSB0aGlzLnN0YXRlLmFsZXJ0ID8gKFxuICAgICAgICAgICAgICAgIDxBbGVydFxuICAgICAgICAgICAgICAgICAgICBzaG93PVwidHJ1ZVwiXG4gICAgICAgICAgICAgICAgICAgIHZhcmlhbnQ9e3RoaXMuc3RhdGUuYWxlcnQuYWxlcnRUeXBlfVxuICAgICAgICAgICAgICAgICAgICBvbkNsb3NlPXsoKSA9PiB0aGlzLnNldFN0YXRlKHsgYWxlcnQ6IG51bGwgfSl9XG4gICAgICAgICAgICAgICAgICAgIGRpc21pc3NpYmxlXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8QWxlcnQuSGVhZGluZz57dGhpcy5zdGF0ZS5hbGVydC5oZWFkaW5nfTwvQWxlcnQuSGVhZGluZz5cbiAgICAgICAgICAgICAgICAgICAgPHA+e3RoaXMuc3RhdGUuYWxlcnQubWVzc2FnZX08L3A+XG4gICAgICAgICAgICAgICAgPC9BbGVydD5cbiAgICAgICAgICAgICkgOiBudWxsO1xuXG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjc3MucG9wdXB9PlxuICAgICAgICAgICAgICAgICAgICA8SGVhZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0aXRsZT5Ob3RlcyBDaHJvbWUgUGx1Z2luPC90aXRsZT5cblxuICAgICAgICAgICAgICAgICAgICAgICAgPG1ldGEgY2hhclNldD1cInV0Zi04XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxtZXRhXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT1cInZpZXdwb3J0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50PVwid2lkdGg9ZGV2aWNlLXdpZHRoLCBpbml0aWFsLXNjYWxlPTEsIHNocmluay10by1maXQ9bm9cIlxuICAgICAgICAgICAgICAgICAgICAgICAgLz5cblxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpbmsgcmVsPVwiaWNvblwiIGhyZWY9XCIvZmF2aWNvbi5pY29cIiAvPlxuICAgICAgICAgICAgICAgICAgICA8L0hlYWQ+XG4gICAgICAgICAgICAgICAgICAgIDxtYWluIGNsYXNzTmFtZT17Y3NzLm1haW59PlxuICAgICAgICAgICAgICAgICAgICAgICAgPE5hdmJhciBiZz1cImRhcmtcIiB2YXJpYW50PVwiZGFya1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxOYXZiYXIuQnJhbmQ+Tm90ZSBUYWtlcjwvTmF2YmFyLkJyYW5kPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxOYXY+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxOYXYuTGluayBocmVmPXtgcG9wdXAke2V4dGVuc2lvbn1gfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEN1cnJlbnQgUGFnZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L05hdi5MaW5rPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TmF2LkxpbmsgaHJlZj17YGFsbG5vdGVzJHtleHRlbnNpb259YH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBbGwgTm90ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9OYXYuTGluaz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L05hdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvTmF2YmFyPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICA8V3JhcHBlZENvbXBvbmVudCBwb3B1cD17dGhpc30gLz5cbiAgICAgICAgICAgICAgICAgICAgPC9tYWluPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFsZXJ0c1wiPnthbGVydEpTWH08L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBCYXNlUG9wdXA7XG4iXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///./components/base_popup.js\n");

/***/ })

})