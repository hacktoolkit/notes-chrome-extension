webpackHotUpdate_N_E("pages/popup",{

/***/ "./components/base_popup.js":
/*!**********************************!*\
  !*** ./components/base_popup.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(module) {/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ \"./node_modules/@babel/runtime/helpers/esm/classCallCheck.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ \"./node_modules/@babel/runtime/helpers/esm/createClass.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inherits */ \"./node_modules/@babel/runtime/helpers/esm/inherits.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/possibleConstructorReturn */ \"./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/esm/getPrototypeOf */ \"./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react-bootstrap */ \"./node_modules/react-bootstrap/esm/index.js\");\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! next/head */ \"./node_modules/next/head.js\");\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(next_head__WEBPACK_IMPORTED_MODULE_8__);\n/* harmony import */ var _lib_chrome_tabs__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../lib/chrome_tabs */ \"./lib/chrome_tabs.js\");\n/* harmony import */ var _lib_notes__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../lib/notes */ \"./lib/notes.js\");\n/* harmony import */ var _lib_is_dev__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../lib/is_dev */ \"./lib/is_dev.js\");\n/* harmony import */ var _styles_common_module_scss__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../styles/common.module.scss */ \"./styles/common.module.scss\");\n/* harmony import */ var _styles_common_module_scss__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(_styles_common_module_scss__WEBPACK_IMPORTED_MODULE_12__);\n\n\n\n\n\n\nvar _jsxFileName = \"/Users/jontsai/code/chrome-extensions/notes-chrome-extension/app/components/base_popup.js\";\n\nfunction _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__[\"default\"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__[\"default\"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return Object(_babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(this, result); }; }\n\nfunction _isNativeReflectConstruct() { if (typeof Reflect === \"undefined\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \"function\") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }\n\n\n\n\n\n\n\n\n\nfunction BasePopup(WrappedComponent) {\n  return /*#__PURE__*/function (_React$Component) {\n    Object(_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_2__[\"default\"])(_class, _React$Component);\n\n    var _super = _createSuper(_class);\n\n    function _class(props) {\n      var _this;\n\n      Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(this, _class);\n\n      _this = _super.call(this, props);\n      _this.state = {\n        alert: null,\n        allNotesObject: {},\n        currentTabUrl: null,\n        currentNotes: null\n      };\n      return _this;\n    }\n\n    Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(_class, [{\n      key: \"componentDidMount\",\n      value: function componentDidMount() {\n        if (Object(_lib_chrome_tabs__WEBPACK_IMPORTED_MODULE_9__[\"canAccessChromeTabs\"])()) {\n          this.fetchCurrentTabData();\n        }\n      }\n    }, {\n      key: \"fetchCurrentTabData\",\n      value: function fetchCurrentTabData() {\n        var self = this;\n        Object(_lib_chrome_tabs__WEBPACK_IMPORTED_MODULE_9__[\"getCurrentTab\"])(function (currentTab) {\n          self.setState({\n            currentTabUrl: currentTab.url,\n            currentNotes: {\n              url: currentTab.url,\n              title: currentTab.title,\n              image: currentTab.favIconUrl ? currentTab.favIconUrl : '',\n              body: ''\n            }\n          });\n        });\n        Object(_lib_notes__WEBPACK_IMPORTED_MODULE_10__[\"getAllStoredNotes\"])(function (allNotesObject) {\n          self.setState({\n            allNotesObject: allNotesObject\n          });\n\n          if (typeof allNotesObject[self.state.currentTabUrl] !== 'undefined') {\n            self.setState({\n              currentNotes: allNotesObject[self.state.currentTabUrl]\n            });\n          }\n        });\n      }\n    }, {\n      key: \"addAlert\",\n      value: function addAlert(heading, message, alertType) {\n        this.setState({\n          alert: {\n            heading: heading,\n            message: message,\n            alertType: alertType\n          }\n        });\n      }\n    }, {\n      key: \"showSuccessAlert\",\n      value: function showSuccessAlert() {\n        this.addAlert('Winner, winner, chicken dinner!', 'Saved successfully!', 'success');\n      }\n    }, {\n      key: \"showErrorAlert\",\n      value: function showErrorAlert() {\n        this.addAlert('Oh snap! You got an error!', 'Unable to save', 'danger');\n      }\n    }, {\n      key: \"render\",\n      value: function render() {\n        var _this2 = this;\n\n        var extension = Object(_lib_is_dev__WEBPACK_IMPORTED_MODULE_11__[\"default\"])() ? '' : '.html';\n        var alertJSX = this.state.alert ? /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Alert\"], {\n          show: \"true\",\n          variant: this.state.alert.alertType,\n          onClose: function onClose() {\n            return _this2.setState({\n              alert: null\n            });\n          },\n          dismissible: true,\n          children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Alert\"].Heading, {\n            children: this.state.alert.heading\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 95,\n            columnNumber: 21\n          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(\"p\", {\n            children: this.state.alert.message\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 96,\n            columnNumber: 21\n          }, this)]\n        }, void 0, true, {\n          fileName: _jsxFileName,\n          lineNumber: 89,\n          columnNumber: 17\n        }, this) : null;\n        return /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(\"div\", {\n          className: _styles_common_module_scss__WEBPACK_IMPORTED_MODULE_12___default.a.popup,\n          children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(next_head__WEBPACK_IMPORTED_MODULE_8___default.a, {\n            children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(\"title\", {\n              children: \"Notes Chrome Plugin\"\n            }, void 0, false, {\n              fileName: _jsxFileName,\n              lineNumber: 103,\n              columnNumber: 25\n            }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(\"meta\", {\n              charSet: \"utf-8\"\n            }, void 0, false, {\n              fileName: _jsxFileName,\n              lineNumber: 105,\n              columnNumber: 25\n            }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(\"meta\", {\n              name: \"viewport\",\n              content: \"width=device-width, initial-scale=1, shrink-to-fit=no\"\n            }, void 0, false, {\n              fileName: _jsxFileName,\n              lineNumber: 106,\n              columnNumber: 25\n            }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(\"link\", {\n              rel: \"icon\",\n              href: \"/favicon.ico\"\n            }, void 0, false, {\n              fileName: _jsxFileName,\n              lineNumber: 111,\n              columnNumber: 25\n            }, this)]\n          }, void 0, true, {\n            fileName: _jsxFileName,\n            lineNumber: 102,\n            columnNumber: 21\n          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(\"main\", {\n            className: _styles_common_module_scss__WEBPACK_IMPORTED_MODULE_12___default.a.main,\n            children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Navbar\"], {\n              bg: \"dark\",\n              variant: \"dark\",\n              children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Navbar\"].Brand, {\n                children: \"Note Taker\"\n              }, void 0, false, {\n                fileName: _jsxFileName,\n                lineNumber: 115,\n                columnNumber: 29\n              }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Nav\"], {\n                children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Nav\"].Link, {\n                  href: \"popup\".concat(extension),\n                  children: \"Current Page\"\n                }, void 0, false, {\n                  fileName: _jsxFileName,\n                  lineNumber: 117,\n                  columnNumber: 33\n                }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Nav\"].Link, {\n                  href: \"allnotes\".concat(extension),\n                  children: \"All Notes\"\n                }, void 0, false, {\n                  fileName: _jsxFileName,\n                  lineNumber: 120,\n                  columnNumber: 33\n                }, this)]\n              }, void 0, true, {\n                fileName: _jsxFileName,\n                lineNumber: 116,\n                columnNumber: 29\n              }, this)]\n            }, void 0, true, {\n              fileName: _jsxFileName,\n              lineNumber: 114,\n              columnNumber: 25\n            }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(WrappedComponent, {\n              popup: this\n            }, void 0, false, {\n              fileName: _jsxFileName,\n              lineNumber: 126,\n              columnNumber: 25\n            }, this)]\n          }, void 0, true, {\n            fileName: _jsxFileName,\n            lineNumber: 113,\n            columnNumber: 21\n          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(\"div\", {\n            className: \"alerts\",\n            children: alertJSX\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 128,\n            columnNumber: 21\n          }, this)]\n        }, void 0, true, {\n          fileName: _jsxFileName,\n          lineNumber: 101,\n          columnNumber: 17\n        }, this);\n      }\n    }]);\n\n    return _class;\n  }(react__WEBPACK_IMPORTED_MODULE_6___default.a.Component);\n}\n\n_c = BasePopup;\n/* harmony default export */ __webpack_exports__[\"default\"] = (BasePopup);\n\nvar _c;\n\n$RefreshReg$(_c, \"BasePopup\");\n\n;\n    var _a, _b;\n    // Legacy CSS implementations will `eval` browser code in a Node.js context\n    // to extract CSS. For backwards compatibility, we need to check we're in a\n    // browser context before continuing.\n    if (typeof self !== 'undefined' &&\n        // AMP / No-JS mode does not inject these helpers:\n        '$RefreshHelpers$' in self) {\n        var currentExports = module.__proto__.exports;\n        var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n        // This cannot happen in MainTemplate because the exports mismatch between\n        // templating and execution.\n        self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.i);\n        // A module can be accepted automatically based on its exports, e.g. when\n        // it is a Refresh Boundary.\n        if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n            // Save the previous exports on update so we can compare the boundary\n            // signatures.\n            module.hot.dispose(function (data) {\n                data.prevExports = currentExports;\n            });\n            // Unconditionally accept an update to this module, we'll check if it's\n            // still a Refresh Boundary later.\n            module.hot.accept();\n            // This field is set when the previous version of this module was a\n            // Refresh Boundary, letting us know we need to check for invalidation or\n            // enqueue an update.\n            if (prevExports !== null) {\n                // A boundary can become ineligible if its exports are incompatible\n                // with the previous exports.\n                //\n                // For example, if you add/remove/change exports, we'll want to\n                // re-execute the importing modules, and force those components to\n                // re-render. Similarly, if you convert a class component to a\n                // function, we want to invalidate the boundary.\n                if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                    module.hot.invalidate();\n                }\n                else {\n                    self.$RefreshHelpers$.scheduleUpdate();\n                }\n            }\n        }\n        else {\n            // Since we just executed the code for the module, it's possible that the\n            // new exports made it ineligible for being a boundary.\n            // We only care about the case when we were _previously_ a boundary,\n            // because we already accepted this update (accidental side effect).\n            var isNoLongerABoundary = prevExports !== null;\n            if (isNoLongerABoundary) {\n                module.hot.invalidate();\n            }\n        }\n    }\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/harmony-module.js */ \"./node_modules/webpack/buildin/harmony-module.js\")(module)))//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vY29tcG9uZW50cy9iYXNlX3BvcHVwLmpzPzFmMDAiXSwibmFtZXMiOlsiQmFzZVBvcHVwIiwiV3JhcHBlZENvbXBvbmVudCIsInByb3BzIiwic3RhdGUiLCJhbGVydCIsImFsbE5vdGVzT2JqZWN0IiwiY3VycmVudFRhYlVybCIsImN1cnJlbnROb3RlcyIsImNhbkFjY2Vzc0Nocm9tZVRhYnMiLCJmZXRjaEN1cnJlbnRUYWJEYXRhIiwic2VsZiIsImdldEN1cnJlbnRUYWIiLCJjdXJyZW50VGFiIiwic2V0U3RhdGUiLCJ1cmwiLCJ0aXRsZSIsImltYWdlIiwiZmF2SWNvblVybCIsImJvZHkiLCJnZXRBbGxTdG9yZWROb3RlcyIsImhlYWRpbmciLCJtZXNzYWdlIiwiYWxlcnRUeXBlIiwiYWRkQWxlcnQiLCJleHRlbnNpb24iLCJpc0RldiIsImFsZXJ0SlNYIiwiY3NzIiwicG9wdXAiLCJtYWluIiwiUmVhY3QiLCJDb21wb25lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFFQTtBQUVBO0FBQ0E7QUFDQTtBQUVBOztBQUVBLFNBQVNBLFNBQVQsQ0FBbUJDLGdCQUFuQixFQUFxQztBQUNqQztBQUFBOztBQUFBOztBQUNJLG9CQUFZQyxLQUFaLEVBQW1CO0FBQUE7O0FBQUE7O0FBQ2YsZ0NBQU1BLEtBQU47QUFFQSxZQUFLQyxLQUFMLEdBQWE7QUFDVEMsYUFBSyxFQUFFLElBREU7QUFFVEMsc0JBQWMsRUFBRSxFQUZQO0FBR1RDLHFCQUFhLEVBQUUsSUFITjtBQUlUQyxvQkFBWSxFQUFFO0FBSkwsT0FBYjtBQUhlO0FBU2xCOztBQVZMO0FBQUE7QUFBQSwwQ0FZd0I7QUFDaEIsWUFBSUMsNEVBQW1CLEVBQXZCLEVBQTJCO0FBQ3ZCLGVBQUtDLG1CQUFMO0FBQ0g7QUFDSjtBQWhCTDtBQUFBO0FBQUEsNENBa0IwQjtBQUNsQixZQUFNQyxJQUFJLEdBQUcsSUFBYjtBQUVB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QTtBQUFBO0FBQUEsa0JBREosZUFZSTtBQUFNLHFCQUFTLEVBQUVELGtFQUFHLENBQUNFLElBQXJCO0FBQUEsb0NBQ0kscUVBQUMsc0RBQUQ7QUFBUSxnQkFBRSxFQUFDLE1BQVg7QUFBa0IscUJBQU8sRUFBQyxNQUExQjtBQUFBLHNDQUNJLHFFQUFDLHNEQUFELENBQVEsS0FBUjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxzQkFESixlQUVJLHFFQUFDLG1EQUFEO0FBQUEsd0NBQ0kscUVBQUMsbURBQUQsQ0FBSyxJQUFMO0FBQVUsc0JBQUksaUJBQVVMLFNBQVYsQ0FBZDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSx3QkFESixlQUlJLHFFQUFDLG1EQUFELENBQUssSUFBTDtBQUFVLHNCQUFJLG9CQUFhQSxTQUFiLENBQWQ7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsd0JBSko7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHNCQUZKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxvQkFESixlQWFJLHFFQUFDLGdCQUFEO0FBQWtCLG1CQUFLLEVBQUU7QUFBekI7QUFBQTtBQUFBO0FBQUE7QUFBQSxvQkFiSjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0JBWkosZUEyQkk7QUFBSyxxQkFBUyxFQUFDLFFBQWY7QUFBQSxzQkFBeUJFO0FBQXpCO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0JBM0JKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxnQkFESjtBQStCSDtBQXRITDs7QUFBQTtBQUFBLElBQXFCSSw0Q0FBSyxDQUFDQyxTQUEzQjtBQXdISDs7S0F6SFEvQixTO0FBMkhNQSx3RUFBZiIsImZpbGUiOiIuL2NvbXBvbmVudHMvYmFzZV9wb3B1cC5qcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBBbGVydCwgTmF2LCBOYXZiYXIgfSBmcm9tICdyZWFjdC1ib290c3RyYXAnO1xuXG5pbXBvcnQgSGVhZCBmcm9tICduZXh0L2hlYWQnO1xuXG5pbXBvcnQgeyBjYW5BY2Nlc3NDaHJvbWVUYWJzLCBnZXRDdXJyZW50VGFiIH0gZnJvbSAnLi4vbGliL2Nocm9tZV90YWJzJztcbmltcG9ydCB7IGdldEFsbFN0b3JlZE5vdGVzLCBnZXROb3Rlc0ZvclVybCB9IGZyb20gJy4uL2xpYi9ub3Rlcyc7XG5pbXBvcnQgaXNEZXYgZnJvbSAnLi4vbGliL2lzX2Rldic7XG5cbmltcG9ydCBjc3MgZnJvbSAnLi4vc3R5bGVzL2NvbW1vbi5tb2R1bGUuc2Nzcyc7XG5cbmZ1bmN0aW9uIEJhc2VQb3B1cChXcmFwcGVkQ29tcG9uZW50KSB7XG4gICAgcmV0dXJuIGNsYXNzIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICAgICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgICAgIHN1cGVyKHByb3BzKTtcblxuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgICAgICBhbGVydDogbnVsbCxcbiAgICAgICAgICAgICAgICBhbGxOb3Rlc09iamVjdDoge30sXG4gICAgICAgICAgICAgICAgY3VycmVudFRhYlVybDogbnVsbCxcbiAgICAgICAgICAgICAgICBjdXJyZW50Tm90ZXM6IG51bGwsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgICAgICBpZiAoY2FuQWNjZXNzQ2hyb21lVGFicygpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mZXRjaEN1cnJlbnRUYWJEYXRhKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmZXRjaEN1cnJlbnRUYWJEYXRhKCkge1xuICAgICAgICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgICAgIGdldEN1cnJlbnRUYWIoKGN1cnJlbnRUYWIpID0+IHtcbiAgICAgICAgICAgICAgICBzZWxmLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFRhYlVybDogY3VycmVudFRhYi51cmwsXG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnROb3Rlczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBjdXJyZW50VGFiLnVybCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiBjdXJyZW50VGFiLnRpdGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2U6IGN1cnJlbnRUYWIuZmF2SWNvblVybFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gY3VycmVudFRhYi5mYXZJY29uVXJsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6ICcnLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGdldEFsbFN0b3JlZE5vdGVzKChhbGxOb3Rlc09iamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIHNlbGYuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgICAgICBhbGxOb3Rlc09iamVjdCxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoXG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiBhbGxOb3Rlc09iamVjdFtzZWxmLnN0YXRlLmN1cnJlbnRUYWJVcmxdICE9PVxuICAgICAgICAgICAgICAgICAgICAndW5kZWZpbmVkJ1xuICAgICAgICAgICAgICAgICkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnNldFN0YXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnROb3RlczogYWxsTm90ZXNPYmplY3Rbc2VsZi5zdGF0ZS5jdXJyZW50VGFiVXJsXSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBhZGRBbGVydChoZWFkaW5nLCBtZXNzYWdlLCBhbGVydFR5cGUpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgICAgIGFsZXJ0OiB7IGhlYWRpbmcsIG1lc3NhZ2UsIGFsZXJ0VHlwZSB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBzaG93U3VjY2Vzc0FsZXJ0KCkge1xuICAgICAgICAgICAgdGhpcy5hZGRBbGVydChcbiAgICAgICAgICAgICAgICAnV2lubmVyLCB3aW5uZXIsIGNoaWNrZW4gZGlubmVyIScsXG4gICAgICAgICAgICAgICAgJ1NhdmVkIHN1Y2Nlc3NmdWxseSEnLFxuICAgICAgICAgICAgICAgICdzdWNjZXNzJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNob3dFcnJvckFsZXJ0KCkge1xuICAgICAgICAgICAgdGhpcy5hZGRBbGVydChcbiAgICAgICAgICAgICAgICAnT2ggc25hcCEgWW91IGdvdCBhbiBlcnJvciEnLFxuICAgICAgICAgICAgICAgICdVbmFibGUgdG8gc2F2ZScsXG4gICAgICAgICAgICAgICAgJ2RhbmdlcidcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZW5kZXIoKSB7XG4gICAgICAgICAgICBjb25zdCBleHRlbnNpb24gPSBpc0RldigpID8gJycgOiAnLmh0bWwnO1xuXG4gICAgICAgICAgICBjb25zdCBhbGVydEpTWCA9IHRoaXMuc3RhdGUuYWxlcnQgPyAoXG4gICAgICAgICAgICAgICAgPEFsZXJ0XG4gICAgICAgICAgICAgICAgICAgIHNob3c9XCJ0cnVlXCJcbiAgICAgICAgICAgICAgICAgICAgdmFyaWFudD17dGhpcy5zdGF0ZS5hbGVydC5hbGVydFR5cGV9XG4gICAgICAgICAgICAgICAgICAgIG9uQ2xvc2U9eygpID0+IHRoaXMuc2V0U3RhdGUoeyBhbGVydDogbnVsbCB9KX1cbiAgICAgICAgICAgICAgICAgICAgZGlzbWlzc2libGVcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxBbGVydC5IZWFkaW5nPnt0aGlzLnN0YXRlLmFsZXJ0LmhlYWRpbmd9PC9BbGVydC5IZWFkaW5nPlxuICAgICAgICAgICAgICAgICAgICA8cD57dGhpcy5zdGF0ZS5hbGVydC5tZXNzYWdlfTwvcD5cbiAgICAgICAgICAgICAgICA8L0FsZXJ0PlxuICAgICAgICAgICAgKSA6IG51bGw7XG5cbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2Nzcy5wb3B1cH0+XG4gICAgICAgICAgICAgICAgICAgIDxIZWFkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRpdGxlPk5vdGVzIENocm9tZSBQbHVnaW48L3RpdGxlPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICA8bWV0YSBjaGFyU2V0PVwidXRmLThcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPG1ldGFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lPVwidmlld3BvcnRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnQ9XCJ3aWR0aD1kZXZpY2Utd2lkdGgsIGluaXRpYWwtc2NhbGU9MSwgc2hyaW5rLXRvLWZpdD1ub1wiXG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGluayByZWw9XCJpY29uXCIgaHJlZj1cIi9mYXZpY29uLmljb1wiIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvSGVhZD5cbiAgICAgICAgICAgICAgICAgICAgPG1haW4gY2xhc3NOYW1lPXtjc3MubWFpbn0+XG4gICAgICAgICAgICAgICAgICAgICAgICA8TmF2YmFyIGJnPVwiZGFya1wiIHZhcmlhbnQ9XCJkYXJrXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPE5hdmJhci5CcmFuZD5Ob3RlIFRha2VyPC9OYXZiYXIuQnJhbmQ+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPE5hdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPE5hdi5MaW5rIGhyZWY9e2Bwb3B1cCR7ZXh0ZW5zaW9ufWB9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ3VycmVudCBQYWdlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvTmF2Lkxpbms+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxOYXYuTGluayBocmVmPXtgYWxsbm90ZXMke2V4dGVuc2lvbn1gfT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFsbCBOb3Rlc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L05hdi5MaW5rPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvTmF2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9OYXZiYXI+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxXcmFwcGVkQ29tcG9uZW50IHBvcHVwPXt0aGlzfSAvPlxuICAgICAgICAgICAgICAgICAgICA8L21haW4+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWxlcnRzXCI+e2FsZXJ0SlNYfTwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2VQb3B1cDtcbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./components/base_popup.js\n");

/***/ })

})