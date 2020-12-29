webpackHotUpdate_N_E("pages/popup",{

/***/ "./components/base_popup.js":
/*!**********************************!*\
  !*** ./components/base_popup.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(module) {/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ \"./node_modules/@babel/runtime/helpers/esm/classCallCheck.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ \"./node_modules/@babel/runtime/helpers/esm/createClass.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inherits */ \"./node_modules/@babel/runtime/helpers/esm/inherits.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/possibleConstructorReturn */ \"./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/esm/getPrototypeOf */ \"./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react-bootstrap */ \"./node_modules/react-bootstrap/esm/index.js\");\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! next/head */ \"./node_modules/next/head.js\");\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(next_head__WEBPACK_IMPORTED_MODULE_8__);\n/* harmony import */ var _lib_chrome_tabs__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../lib/chrome_tabs */ \"./lib/chrome_tabs.js\");\n/* harmony import */ var _lib_notes__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../lib/notes */ \"./lib/notes.js\");\n/* harmony import */ var _lib_is_dev__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../lib/is_dev */ \"./lib/is_dev.js\");\n/* harmony import */ var _styles_common_module_scss__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../styles/common.module.scss */ \"./styles/common.module.scss\");\n/* harmony import */ var _styles_common_module_scss__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(_styles_common_module_scss__WEBPACK_IMPORTED_MODULE_12__);\n\n\n\n\n\n\nvar _jsxFileName = \"/Users/jontsai/code/chrome-extensions/notes-chrome-extension/app/components/base_popup.js\";\n\nfunction _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__[\"default\"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__[\"default\"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return Object(_babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(this, result); }; }\n\nfunction _isNativeReflectConstruct() { if (typeof Reflect === \"undefined\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \"function\") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }\n\n\n\n\n\n\n\n\n\nfunction BasePopup(WrappedComponent) {\n  return /*#__PURE__*/function (_React$Component) {\n    Object(_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_2__[\"default\"])(_class, _React$Component);\n\n    var _super = _createSuper(_class);\n\n    function _class(props) {\n      var _this;\n\n      Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(this, _class);\n\n      _this = _super.call(this, props);\n      _this.state = {\n        alert: null,\n        currentTabUrl: null,\n        currentNotes: null\n      };\n      return _this;\n    }\n\n    Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(_class, [{\n      key: \"componentDidMount\",\n      value: function componentDidMount() {\n        if (Object(_lib_chrome_tabs__WEBPACK_IMPORTED_MODULE_9__[\"canAccessChromeTabs\"])()) {\n          this.fetchCurrentTabData();\n        }\n      }\n    }, {\n      key: \"fetchCurrentTabData\",\n      value: function fetchCurrentTabData() {\n        var self = this;\n        Object(_lib_chrome_tabs__WEBPACK_IMPORTED_MODULE_9__[\"getCurrentTab\"])(function (currentTab) {\n          self.setState({\n            currentTabUrl: currentTab.url\n          });\n          var notesFallback = Object(_lib_notes__WEBPACK_IMPORTED_MODULE_10__[\"defaultNotesForTab\"])(currentTab);\n          Object(_lib_notes__WEBPACK_IMPORTED_MODULE_10__[\"getNotesForUrl\"])(url, notesFallback, function (notes) {\n            self.setState({\n              currentNotes: notes\n            });\n          });\n        });\n      }\n    }, {\n      key: \"addAlert\",\n      value: function addAlert(heading, message, alertType) {\n        this.setState({\n          alert: {\n            heading: heading,\n            message: message,\n            alertType: alertType\n          }\n        });\n      }\n    }, {\n      key: \"showSuccessAlert\",\n      value: function showSuccessAlert() {\n        this.addAlert('Winner, winner, chicken dinner!', 'Saved successfully!', 'success');\n      }\n    }, {\n      key: \"showErrorAlert\",\n      value: function showErrorAlert() {\n        this.addAlert('Oh snap! You got an error!', 'Unable to save', 'danger');\n      }\n    }, {\n      key: \"render\",\n      value: function render() {\n        var _this2 = this;\n\n        var extension = Object(_lib_is_dev__WEBPACK_IMPORTED_MODULE_11__[\"default\"])() ? '' : '.html';\n        var alertJSX = this.state.alert ? /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Alert\"], {\n          show: \"true\",\n          variant: this.state.alert.alertType,\n          onClose: function onClose() {\n            return _this2.setState({\n              alert: null\n            });\n          },\n          dismissible: true,\n          children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Alert\"].Heading, {\n            children: this.state.alert.heading\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 84,\n            columnNumber: 21\n          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(\"p\", {\n            children: this.state.alert.message\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 85,\n            columnNumber: 21\n          }, this)]\n        }, void 0, true, {\n          fileName: _jsxFileName,\n          lineNumber: 78,\n          columnNumber: 17\n        }, this) : null;\n        return /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(\"div\", {\n          className: _styles_common_module_scss__WEBPACK_IMPORTED_MODULE_12___default.a.popup,\n          children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(next_head__WEBPACK_IMPORTED_MODULE_8___default.a, {\n            children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(\"title\", {\n              children: \"Notes Chrome Plugin\"\n            }, void 0, false, {\n              fileName: _jsxFileName,\n              lineNumber: 92,\n              columnNumber: 25\n            }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(\"meta\", {\n              charSet: \"utf-8\"\n            }, void 0, false, {\n              fileName: _jsxFileName,\n              lineNumber: 94,\n              columnNumber: 25\n            }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(\"meta\", {\n              name: \"viewport\",\n              content: \"width=device-width, initial-scale=1, shrink-to-fit=no\"\n            }, void 0, false, {\n              fileName: _jsxFileName,\n              lineNumber: 95,\n              columnNumber: 25\n            }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(\"link\", {\n              rel: \"icon\",\n              href: \"/favicon.ico\"\n            }, void 0, false, {\n              fileName: _jsxFileName,\n              lineNumber: 100,\n              columnNumber: 25\n            }, this)]\n          }, void 0, true, {\n            fileName: _jsxFileName,\n            lineNumber: 91,\n            columnNumber: 21\n          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(\"main\", {\n            className: _styles_common_module_scss__WEBPACK_IMPORTED_MODULE_12___default.a.main,\n            children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Navbar\"], {\n              bg: \"dark\",\n              variant: \"dark\",\n              children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Navbar\"].Brand, {\n                children: \"Note Taker\"\n              }, void 0, false, {\n                fileName: _jsxFileName,\n                lineNumber: 104,\n                columnNumber: 29\n              }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Nav\"], {\n                children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Nav\"].Link, {\n                  href: \"popup\".concat(extension),\n                  children: \"Current Page\"\n                }, void 0, false, {\n                  fileName: _jsxFileName,\n                  lineNumber: 106,\n                  columnNumber: 33\n                }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Nav\"].Link, {\n                  href: \"allnotes\".concat(extension),\n                  children: \"All Notes\"\n                }, void 0, false, {\n                  fileName: _jsxFileName,\n                  lineNumber: 109,\n                  columnNumber: 33\n                }, this)]\n              }, void 0, true, {\n                fileName: _jsxFileName,\n                lineNumber: 105,\n                columnNumber: 29\n              }, this)]\n            }, void 0, true, {\n              fileName: _jsxFileName,\n              lineNumber: 103,\n              columnNumber: 25\n            }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(WrappedComponent, {\n              popup: this\n            }, void 0, false, {\n              fileName: _jsxFileName,\n              lineNumber: 115,\n              columnNumber: 25\n            }, this)]\n          }, void 0, true, {\n            fileName: _jsxFileName,\n            lineNumber: 102,\n            columnNumber: 21\n          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(\"div\", {\n            className: \"alerts\",\n            children: alertJSX\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 117,\n            columnNumber: 21\n          }, this)]\n        }, void 0, true, {\n          fileName: _jsxFileName,\n          lineNumber: 90,\n          columnNumber: 17\n        }, this);\n      }\n    }]);\n\n    return _class;\n  }(react__WEBPACK_IMPORTED_MODULE_6___default.a.Component);\n}\n\n_c = BasePopup;\n/* harmony default export */ __webpack_exports__[\"default\"] = (BasePopup);\n\nvar _c;\n\n$RefreshReg$(_c, \"BasePopup\");\n\n;\n    var _a, _b;\n    // Legacy CSS implementations will `eval` browser code in a Node.js context\n    // to extract CSS. For backwards compatibility, we need to check we're in a\n    // browser context before continuing.\n    if (typeof self !== 'undefined' &&\n        // AMP / No-JS mode does not inject these helpers:\n        '$RefreshHelpers$' in self) {\n        var currentExports = module.__proto__.exports;\n        var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n        // This cannot happen in MainTemplate because the exports mismatch between\n        // templating and execution.\n        self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.i);\n        // A module can be accepted automatically based on its exports, e.g. when\n        // it is a Refresh Boundary.\n        if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n            // Save the previous exports on update so we can compare the boundary\n            // signatures.\n            module.hot.dispose(function (data) {\n                data.prevExports = currentExports;\n            });\n            // Unconditionally accept an update to this module, we'll check if it's\n            // still a Refresh Boundary later.\n            module.hot.accept();\n            // This field is set when the previous version of this module was a\n            // Refresh Boundary, letting us know we need to check for invalidation or\n            // enqueue an update.\n            if (prevExports !== null) {\n                // A boundary can become ineligible if its exports are incompatible\n                // with the previous exports.\n                //\n                // For example, if you add/remove/change exports, we'll want to\n                // re-execute the importing modules, and force those components to\n                // re-render. Similarly, if you convert a class component to a\n                // function, we want to invalidate the boundary.\n                if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                    module.hot.invalidate();\n                }\n                else {\n                    self.$RefreshHelpers$.scheduleUpdate();\n                }\n            }\n        }\n        else {\n            // Since we just executed the code for the module, it's possible that the\n            // new exports made it ineligible for being a boundary.\n            // We only care about the case when we were _previously_ a boundary,\n            // because we already accepted this update (accidental side effect).\n            var isNoLongerABoundary = prevExports !== null;\n            if (isNoLongerABoundary) {\n                module.hot.invalidate();\n            }\n        }\n    }\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/harmony-module.js */ \"./node_modules/webpack/buildin/harmony-module.js\")(module)))//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vY29tcG9uZW50cy9iYXNlX3BvcHVwLmpzPzFmMDAiXSwibmFtZXMiOlsiQmFzZVBvcHVwIiwiV3JhcHBlZENvbXBvbmVudCIsInByb3BzIiwic3RhdGUiLCJhbGVydCIsImN1cnJlbnRUYWJVcmwiLCJjdXJyZW50Tm90ZXMiLCJjYW5BY2Nlc3NDaHJvbWVUYWJzIiwiZmV0Y2hDdXJyZW50VGFiRGF0YSIsInNlbGYiLCJnZXRDdXJyZW50VGFiIiwiY3VycmVudFRhYiIsInNldFN0YXRlIiwidXJsIiwibm90ZXNGYWxsYmFjayIsImRlZmF1bHROb3Rlc0ZvclRhYiIsImdldE5vdGVzRm9yVXJsIiwibm90ZXMiLCJoZWFkaW5nIiwibWVzc2FnZSIsImFsZXJ0VHlwZSIsImFkZEFsZXJ0IiwiZXh0ZW5zaW9uIiwiaXNEZXYiLCJhbGVydEpTWCIsImNzcyIsInBvcHVwIiwibWFpbiIsIlJlYWN0IiwiQ29tcG9uZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBRUE7QUFFQTtBQUNBO0FBS0E7QUFFQTs7QUFFQSxTQUFTQSxTQUFULENBQW1CQyxnQkFBbkIsRUFBcUM7QUFDakM7QUFBQTs7QUFBQTs7QUFDSSxvQkFBWUMsS0FBWixFQUFtQjtBQUFBOztBQUFBOztBQUNmLGdDQUFNQSxLQUFOO0FBRUEsWUFBS0MsS0FBTCxHQUFhO0FBQ1RDLGFBQUssRUFBRSxJQURFO0FBRVRDLHFCQUFhLEVBQUUsSUFGTjtBQUdUQyxvQkFBWSxFQUFFO0FBSEwsT0FBYjtBQUhlO0FBUWxCOztBQVRMO0FBQUE7QUFBQSwwQ0FXd0I7QUFDaEIsWUFBSUMsNEVBQW1CLEVBQXZCLEVBQTJCO0FBQ3ZCLGVBQUtDLG1CQUFMO0FBQ0g7QUFDSjtBQWZMO0FBQUE7QUFBQSw0Q0FpQjBCO0FBQ2xCLFlBQU1DLElBQUksR0FBRyxJQUFiO0FBRUFDLDhFQUFhLENBQUMsVUFBQ0MsVUFBRCxFQUFnQjtBQUMx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QUFLLElBQUw7QUFBVSxzQkFBSSxvQkFBYUEsU0FBYixDQUFkO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUpKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxzQkFGSjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsb0JBREosZUFhSSxxRUFBQyxnQkFBRDtBQUFrQixtQkFBSyxFQUFFO0FBQXpCO0FBQUE7QUFBQTtBQUFBO0FBQUEsb0JBYko7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGtCQVpKLGVBMkJJO0FBQUsscUJBQVMsRUFBQyxRQUFmO0FBQUEsc0JBQXlCRTtBQUF6QjtBQUFBO0FBQUE7QUFBQTtBQUFBLGtCQTNCSjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsZ0JBREo7QUErQkg7QUF2R0w7O0FBQUE7QUFBQSxJQUFxQkksNENBQUssQ0FBQ0MsU0FBM0I7QUF5R0g7O0tBMUdRN0IsUztBQTRHTUEsd0VBQWYiLCJmaWxlIjoiLi9jb21wb25lbnRzL2Jhc2VfcG9wdXAuanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgQWxlcnQsIE5hdiwgTmF2YmFyIH0gZnJvbSAncmVhY3QtYm9vdHN0cmFwJztcblxuaW1wb3J0IEhlYWQgZnJvbSAnbmV4dC9oZWFkJztcblxuaW1wb3J0IHsgY2FuQWNjZXNzQ2hyb21lVGFicywgZ2V0Q3VycmVudFRhYiB9IGZyb20gJy4uL2xpYi9jaHJvbWVfdGFicyc7XG5pbXBvcnQge1xuICAgIGRlZmF1bHROb3Rlc0ZvclRhYixcbiAgICBnZXRBbGxTdG9yZWROb3RlcyxcbiAgICBnZXROb3Rlc0ZvclVybCxcbn0gZnJvbSAnLi4vbGliL25vdGVzJztcbmltcG9ydCBpc0RldiBmcm9tICcuLi9saWIvaXNfZGV2JztcblxuaW1wb3J0IGNzcyBmcm9tICcuLi9zdHlsZXMvY29tbW9uLm1vZHVsZS5zY3NzJztcblxuZnVuY3Rpb24gQmFzZVBvcHVwKFdyYXBwZWRDb21wb25lbnQpIHtcbiAgICByZXR1cm4gY2xhc3MgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICAgICAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICAgICAgc3VwZXIocHJvcHMpO1xuXG4gICAgICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgICAgIGFsZXJ0OiBudWxsLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRUYWJVcmw6IG51bGwsXG4gICAgICAgICAgICAgICAgY3VycmVudE5vdGVzOiBudWxsLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICAgICAgaWYgKGNhbkFjY2Vzc0Nocm9tZVRhYnMoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZmV0Y2hDdXJyZW50VGFiRGF0YSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZmV0Y2hDdXJyZW50VGFiRGF0YSgpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICAgICBnZXRDdXJyZW50VGFiKChjdXJyZW50VGFiKSA9PiB7XG4gICAgICAgICAgICAgICAgc2VsZi5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUYWJVcmw6IGN1cnJlbnRUYWIudXJsLFxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgY29uc3Qgbm90ZXNGYWxsYmFjayA9IGRlZmF1bHROb3Rlc0ZvclRhYihjdXJyZW50VGFiKTtcblxuICAgICAgICAgICAgICAgIGdldE5vdGVzRm9yVXJsKHVybCwgbm90ZXNGYWxsYmFjaywgKG5vdGVzKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudE5vdGVzOiBub3RlcyxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFkZEFsZXJ0KGhlYWRpbmcsIG1lc3NhZ2UsIGFsZXJ0VHlwZSkge1xuICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICAgICAgYWxlcnQ6IHsgaGVhZGluZywgbWVzc2FnZSwgYWxlcnRUeXBlIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNob3dTdWNjZXNzQWxlcnQoKSB7XG4gICAgICAgICAgICB0aGlzLmFkZEFsZXJ0KFxuICAgICAgICAgICAgICAgICdXaW5uZXIsIHdpbm5lciwgY2hpY2tlbiBkaW5uZXIhJyxcbiAgICAgICAgICAgICAgICAnU2F2ZWQgc3VjY2Vzc2Z1bGx5IScsXG4gICAgICAgICAgICAgICAgJ3N1Y2Nlc3MnXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgc2hvd0Vycm9yQWxlcnQoKSB7XG4gICAgICAgICAgICB0aGlzLmFkZEFsZXJ0KFxuICAgICAgICAgICAgICAgICdPaCBzbmFwISBZb3UgZ290IGFuIGVycm9yIScsXG4gICAgICAgICAgICAgICAgJ1VuYWJsZSB0byBzYXZlJyxcbiAgICAgICAgICAgICAgICAnZGFuZ2VyJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlbmRlcigpIHtcbiAgICAgICAgICAgIGNvbnN0IGV4dGVuc2lvbiA9IGlzRGV2KCkgPyAnJyA6ICcuaHRtbCc7XG5cbiAgICAgICAgICAgIGNvbnN0IGFsZXJ0SlNYID0gdGhpcy5zdGF0ZS5hbGVydCA/IChcbiAgICAgICAgICAgICAgICA8QWxlcnRcbiAgICAgICAgICAgICAgICAgICAgc2hvdz1cInRydWVcIlxuICAgICAgICAgICAgICAgICAgICB2YXJpYW50PXt0aGlzLnN0YXRlLmFsZXJ0LmFsZXJ0VHlwZX1cbiAgICAgICAgICAgICAgICAgICAgb25DbG9zZT17KCkgPT4gdGhpcy5zZXRTdGF0ZSh7IGFsZXJ0OiBudWxsIH0pfVxuICAgICAgICAgICAgICAgICAgICBkaXNtaXNzaWJsZVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPEFsZXJ0LkhlYWRpbmc+e3RoaXMuc3RhdGUuYWxlcnQuaGVhZGluZ308L0FsZXJ0LkhlYWRpbmc+XG4gICAgICAgICAgICAgICAgICAgIDxwPnt0aGlzLnN0YXRlLmFsZXJ0Lm1lc3NhZ2V9PC9wPlxuICAgICAgICAgICAgICAgIDwvQWxlcnQ+XG4gICAgICAgICAgICApIDogbnVsbDtcblxuICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y3NzLnBvcHVwfT5cbiAgICAgICAgICAgICAgICAgICAgPEhlYWQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGl0bGU+Tm90ZXMgQ2hyb21lIFBsdWdpbjwvdGl0bGU+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxtZXRhIGNoYXJTZXQ9XCJ1dGYtOFwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8bWV0YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU9XCJ2aWV3cG9ydFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudD1cIndpZHRoPWRldmljZS13aWR0aCwgaW5pdGlhbC1zY2FsZT0xLCBzaHJpbmstdG8tZml0PW5vXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaW5rIHJlbD1cImljb25cIiBocmVmPVwiL2Zhdmljb24uaWNvXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9IZWFkPlxuICAgICAgICAgICAgICAgICAgICA8bWFpbiBjbGFzc05hbWU9e2Nzcy5tYWlufT5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxOYXZiYXIgYmc9XCJkYXJrXCIgdmFyaWFudD1cImRhcmtcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TmF2YmFyLkJyYW5kPk5vdGUgVGFrZXI8L05hdmJhci5CcmFuZD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TmF2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8TmF2LkxpbmsgaHJlZj17YHBvcHVwJHtleHRlbnNpb259YH0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBDdXJyZW50IFBhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9OYXYuTGluaz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPE5hdi5MaW5rIGhyZWY9e2BhbGxub3RlcyR7ZXh0ZW5zaW9ufWB9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQWxsIE5vdGVzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvTmF2Lkxpbms+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9OYXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L05hdmJhcj5cblxuICAgICAgICAgICAgICAgICAgICAgICAgPFdyYXBwZWRDb21wb25lbnQgcG9wdXA9e3RoaXN9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvbWFpbj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhbGVydHNcIj57YWxlcnRKU1h9PC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzZVBvcHVwO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///./components/base_popup.js\n");

/***/ })

})