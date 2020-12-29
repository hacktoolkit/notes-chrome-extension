webpackHotUpdate_N_E("pages/popup",{

/***/ "./pages/popup.js":
/*!************************!*\
  !*** ./pages/popup.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* WEBPACK VAR INJECTION */(function(module) {/* harmony import */ var _babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @babel/runtime/helpers/esm/classCallCheck */ \"./node_modules/@babel/runtime/helpers/esm/classCallCheck.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @babel/runtime/helpers/esm/createClass */ \"./node_modules/@babel/runtime/helpers/esm/createClass.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @babel/runtime/helpers/esm/inherits */ \"./node_modules/@babel/runtime/helpers/esm/inherits.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @babel/runtime/helpers/esm/possibleConstructorReturn */ \"./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js\");\n/* harmony import */ var _babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @babel/runtime/helpers/esm/getPrototypeOf */ \"./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-dev-runtime */ \"./node_modules/react/jsx-dev-runtime.js\");\n/* harmony import */ var react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react */ \"./node_modules/react/index.js\");\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_6__);\n/* harmony import */ var react_bootstrap__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react-bootstrap */ \"./node_modules/react-bootstrap/esm/index.js\");\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! next/head */ \"./node_modules/next/head.js\");\n/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(next_head__WEBPACK_IMPORTED_MODULE_8__);\n/* harmony import */ var _lib_canAccessChromeTabs__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../lib/canAccessChromeTabs */ \"./lib/canAccessChromeTabs.js\");\n/* harmony import */ var _components_base_popup__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../components/base_popup */ \"./components/base_popup.js\");\n\n\n\n\n\n\nvar _jsxFileName = \"/Users/jontsai/code/chrome-extensions/notes-chrome-extension/app/pages/popup.js\";\n\nfunction _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__[\"default\"])(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = Object(_babel_runtime_helpers_esm_getPrototypeOf__WEBPACK_IMPORTED_MODULE_4__[\"default\"])(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return Object(_babel_runtime_helpers_esm_possibleConstructorReturn__WEBPACK_IMPORTED_MODULE_3__[\"default\"])(this, result); }; }\n\nfunction _isNativeReflectConstruct() { if (typeof Reflect === \"undefined\" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === \"function\") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }\n\n\n\n\n\n\n\nvar Popup = /*#__PURE__*/function (_React$Component) {\n  Object(_babel_runtime_helpers_esm_inherits__WEBPACK_IMPORTED_MODULE_2__[\"default\"])(Popup, _React$Component);\n\n  var _super = _createSuper(Popup);\n\n  function Popup(props) {\n    var _this;\n\n    Object(_babel_runtime_helpers_esm_classCallCheck__WEBPACK_IMPORTED_MODULE_0__[\"default\"])(this, Popup);\n\n    _this = _super.call(this, props); //this.state = Object.assign({}, props.model.attributes);\n\n    _this.state = {}; //this.handleChange = this.handleChange.bind(this);\n\n    return _this;\n  }\n\n  Object(_babel_runtime_helpers_esm_createClass__WEBPACK_IMPORTED_MODULE_1__[\"default\"])(Popup, [{\n    key: \"handleSaveButtonClicked\",\n    value: function handleSaveButtonClicked() {\n      var popup = this.props.popup;\n\n      if (Object(_lib_canAccessChromeTabs__WEBPACK_IMPORTED_MODULE_9__[\"default\"])()) {\n        popup.saveNotesForCurrentTab();\n      } else {\n        popup.showSuccessAlert();\n      }\n    }\n  }, {\n    key: \"render\",\n    value: function render() {\n      var popup = this.props.popup;\n      return /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(\"div\", {\n        className: \"container\",\n        id: \"main__add__section\",\n        children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(\"div\", {\n          className: \"mb-2\",\n          children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Row\"], {\n            children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Col\"], {\n              sm: \"2\",\n              className: \"fill nopadding\",\n              children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(\"img\", {\n                src: popup.state.currentTabIcon,\n                id: \"currentTabIcon\",\n                className: \"img-thumbnail\",\n                alt: \"Tab Image\"\n              }, void 0, false, {\n                fileName: _jsxFileName,\n                lineNumber: 36,\n                columnNumber: 29\n              }, this)\n            }, void 0, false, {\n              fileName: _jsxFileName,\n              lineNumber: 35,\n              columnNumber: 25\n            }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Col\"], {\n              sm: \"10\",\n              children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Form\"].Group, {\n                controlId: \"currentTabUrl\",\n                children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Form\"].Label, {\n                  children: \"Current URL\"\n                }, void 0, false, {\n                  fileName: _jsxFileName,\n                  lineNumber: 46,\n                  columnNumber: 33\n                }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Form\"].Control, {\n                  type: \"text\",\n                  defaultValue: popup.state.currentTabUrl\n                }, void 0, false, {\n                  fileName: _jsxFileName,\n                  lineNumber: 47,\n                  columnNumber: 33\n                }, this)]\n              }, void 0, true, {\n                fileName: _jsxFileName,\n                lineNumber: 45,\n                columnNumber: 29\n              }, this)\n            }, void 0, false, {\n              fileName: _jsxFileName,\n              lineNumber: 44,\n              columnNumber: 25\n            }, this)]\n          }, void 0, true, {\n            fileName: _jsxFileName,\n            lineNumber: 34,\n            columnNumber: 21\n          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(\"div\", {\n            className: \"mb-2\",\n            children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Form\"].Group, {\n              controlId: \"currentTabTitle\",\n              children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Form\"].Label, {\n                children: \"Title\"\n              }, void 0, false, {\n                fileName: _jsxFileName,\n                lineNumber: 56,\n                columnNumber: 29\n              }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Form\"].Control, {\n                type: \"text\",\n                defaultValue: popup.state.currentTabTitle\n              }, void 0, false, {\n                fileName: _jsxFileName,\n                lineNumber: 57,\n                columnNumber: 29\n              }, this)]\n            }, void 0, true, {\n              fileName: _jsxFileName,\n              lineNumber: 55,\n              columnNumber: 25\n            }, this)\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 54,\n            columnNumber: 21\n          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(\"div\", {\n            className: \"mb-2\",\n            children: /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Form\"].Group, {\n              controlId: \"currentTabNotes\",\n              children: [/*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Form\"].Label, {\n                children: \"Notes\"\n              }, void 0, false, {\n                fileName: _jsxFileName,\n                lineNumber: 65,\n                columnNumber: 29\n              }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Form\"].Control, {\n                as: \"textarea\",\n                rows: 5,\n                defaultValue: popup.state.currentTabNotes\n              }, void 0, false, {\n                fileName: _jsxFileName,\n                lineNumber: 66,\n                columnNumber: 29\n              }, this)]\n            }, void 0, true, {\n              fileName: _jsxFileName,\n              lineNumber: 64,\n              columnNumber: 25\n            }, this)\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 63,\n            columnNumber: 21\n          }, this), /*#__PURE__*/Object(react_jsx_dev_runtime__WEBPACK_IMPORTED_MODULE_5__[\"jsxDEV\"])(react_bootstrap__WEBPACK_IMPORTED_MODULE_7__[\"Button\"], {\n            id: \"save-button\",\n            variant: \"dark\",\n            onClick: this.handleSaveButtonClicked.bind(this),\n            children: \"Save\"\n          }, void 0, false, {\n            fileName: _jsxFileName,\n            lineNumber: 73,\n            columnNumber: 21\n          }, this)]\n        }, void 0, true, {\n          fileName: _jsxFileName,\n          lineNumber: 33,\n          columnNumber: 17\n        }, this)\n      }, void 0, false, {\n        fileName: _jsxFileName,\n        lineNumber: 32,\n        columnNumber: 13\n      }, this);\n    }\n  }]);\n\n  return Popup;\n}(react__WEBPACK_IMPORTED_MODULE_6___default.a.Component);\n\n/* harmony default export */ __webpack_exports__[\"default\"] = (_c = Object(_components_base_popup__WEBPACK_IMPORTED_MODULE_10__[\"default\"])(Popup));\n\nvar _c;\n\n$RefreshReg$(_c, \"%default%\");\n\n;\n    var _a, _b;\n    // Legacy CSS implementations will `eval` browser code in a Node.js context\n    // to extract CSS. For backwards compatibility, we need to check we're in a\n    // browser context before continuing.\n    if (typeof self !== 'undefined' &&\n        // AMP / No-JS mode does not inject these helpers:\n        '$RefreshHelpers$' in self) {\n        var currentExports = module.__proto__.exports;\n        var prevExports = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevExports) !== null && _b !== void 0 ? _b : null;\n        // This cannot happen in MainTemplate because the exports mismatch between\n        // templating and execution.\n        self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.i);\n        // A module can be accepted automatically based on its exports, e.g. when\n        // it is a Refresh Boundary.\n        if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n            // Save the previous exports on update so we can compare the boundary\n            // signatures.\n            module.hot.dispose(function (data) {\n                data.prevExports = currentExports;\n            });\n            // Unconditionally accept an update to this module, we'll check if it's\n            // still a Refresh Boundary later.\n            module.hot.accept();\n            // This field is set when the previous version of this module was a\n            // Refresh Boundary, letting us know we need to check for invalidation or\n            // enqueue an update.\n            if (prevExports !== null) {\n                // A boundary can become ineligible if its exports are incompatible\n                // with the previous exports.\n                //\n                // For example, if you add/remove/change exports, we'll want to\n                // re-execute the importing modules, and force those components to\n                // re-render. Similarly, if you convert a class component to a\n                // function, we want to invalidate the boundary.\n                if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevExports, currentExports)) {\n                    module.hot.invalidate();\n                }\n                else {\n                    self.$RefreshHelpers$.scheduleUpdate();\n                }\n            }\n        }\n        else {\n            // Since we just executed the code for the module, it's possible that the\n            // new exports made it ineligible for being a boundary.\n            // We only care about the case when we were _previously_ a boundary,\n            // because we already accepted this update (accidental side effect).\n            var isNoLongerABoundary = prevExports !== null;\n            if (isNoLongerABoundary) {\n                module.hot.invalidate();\n            }\n        }\n    }\n\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../node_modules/webpack/buildin/harmony-module.js */ \"./node_modules/webpack/buildin/harmony-module.js\")(module)))//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9fTl9FLy4vcGFnZXMvcG9wdXAuanM/NzQ0NyJdLCJuYW1lcyI6WyJQb3B1cCIsInByb3BzIiwic3RhdGUiLCJwb3B1cCIsImNhbkFjY2Vzc0Nocm9tZVRhYnMiLCJzYXZlTm90ZXNGb3JDdXJyZW50VGFiIiwic2hvd1N1Y2Nlc3NBbGVydCIsImN1cnJlbnRUYWJJY29uIiwiY3VycmVudFRhYlVybCIsImN1cnJlbnRUYWJUaXRsZSIsImN1cnJlbnRUYWJOb3RlcyIsImhhbmRsZVNhdmVCdXR0b25DbGlja2VkIiwiYmluZCIsIlJlYWN0IiwiQ29tcG9uZW50IiwiQmFzZVBvcHVwIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFFQTtBQUVBOztJQUVNQSxLOzs7OztBQUNGLGlCQUFZQyxLQUFaLEVBQW1CO0FBQUE7O0FBQUE7O0FBQ2YsOEJBQU1BLEtBQU4sRUFEZSxDQUVmOztBQUNBLFVBQUtDLEtBQUwsR0FBYSxFQUFiLENBSGUsQ0FLZjs7QUFMZTtBQU1sQjs7Ozs4Q0FFeUI7QUFDdEIsVUFBTUMsS0FBSyxHQUFHLEtBQUtGLEtBQUwsQ0FBV0UsS0FBekI7O0FBRUEsVUFBSUMsd0VBQW1CLEVBQXZCLEVBQTJCO0FBQ3ZCRCxhQUFLLENBQUNFLHNCQUFOO0FBQ0gsT0FGRCxNQUVPO0FBQ0hGLGFBQUssQ0FBQ0csZ0JBQU47QUFDSDtBQUNKOzs7NkJBRVE7QUFDTCxVQUFNSCxLQUFLLEdBQUcsS0FBS0YsS0FBTCxDQUFXRSxLQUF6QjtBQUVBLDBCQUNJO0FBQUssaUJBQVMsRUFBQyxXQUFmO0FBQTJCLFVBQUUsRUFBQyxvQkFBOUI7QUFBQSwrQkFDSTtBQUFLLG1CQUFTLEVBQUMsTUFBZjtBQUFBLGtDQUNJLHFFQUFDLG1EQUFEO0FBQUEsb0NBQ0kscUVBQUMsbURBQUQ7QUFBSyxnQkFBRSxFQUFDLEdBQVI7QUFBWSx1QkFBUyxFQUFDLGdCQUF0QjtBQUFBLHFDQUNJO0FBQ0ksbUJBQUcsRUFBRUEsS0FBSyxDQUFDRCxLQUFOLENBQVlLLGNBRHJCO0FBRUksa0JBQUUsRUFBQyxnQkFGUDtBQUdJLHlCQUFTLEVBQUMsZUFIZDtBQUlJLG1CQUFHLEVBQUM7QUFKUjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBREo7QUFBQTtBQUFBO0FBQUE7QUFBQSxvQkFESixlQVVJLHFFQUFDLG1EQUFEO0FBQUssZ0JBQUUsRUFBQyxJQUFSO0FBQUEscUNBQ0kscUVBQUMsb0RBQUQsQ0FBTSxLQUFOO0FBQVkseUJBQVMsRUFBQyxlQUF0QjtBQUFBLHdDQUNJLHFFQUFDLG9EQUFELENBQU0sS0FBTjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSx3QkFESixlQUVJLHFFQUFDLG9EQUFELENBQU0sT0FBTjtBQUNJLHNCQUFJLEVBQUMsTUFEVDtBQUVJLDhCQUFZLEVBQUVKLEtBQUssQ0FBQ0QsS0FBTixDQUFZTTtBQUY5QjtBQUFBO0FBQUE7QUFBQTtBQUFBLHdCQUZKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQURKO0FBQUE7QUFBQTtBQUFBO0FBQUEsb0JBVko7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLGtCQURKLGVBcUJJO0FBQUsscUJBQVMsRUFBQyxNQUFmO0FBQUEsbUNBQ0kscUVBQUMsb0RBQUQsQ0FBTSxLQUFOO0FBQVksdUJBQVMsRUFBQyxpQkFBdEI7QUFBQSxzQ0FDSSxxRUFBQyxvREFBRCxDQUFNLEtBQU47QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsc0JBREosZUFFSSxxRUFBQyxvREFBRCxDQUFNLE9BQU47QUFDSSxvQkFBSSxFQUFDLE1BRFQ7QUFFSSw0QkFBWSxFQUFFTCxLQUFLLENBQUNELEtBQU4sQ0FBWU87QUFGOUI7QUFBQTtBQUFBO0FBQUE7QUFBQSxzQkFGSjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFESjtBQUFBO0FBQUE7QUFBQTtBQUFBLGtCQXJCSixlQThCSTtBQUFLLHFCQUFTLEVBQUMsTUFBZjtBQUFBLG1DQUNJLHFFQUFDLG9EQUFELENBQU0sS0FBTjtBQUFZLHVCQUFTLEVBQUMsaUJBQXRCO0FBQUEsc0NBQ0kscUVBQUMsb0RBQUQsQ0FBTSxLQUFOO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLHNCQURKLGVBRUkscUVBQUMsb0RBQUQsQ0FBTSxPQUFOO0FBQ0ksa0JBQUUsRUFBQyxVQURQO0FBRUksb0JBQUksRUFBRSxDQUZWO0FBR0ksNEJBQVksRUFBRU4sS0FBSyxDQUFDRCxLQUFOLENBQVlRO0FBSDlCO0FBQUE7QUFBQTtBQUFBO0FBQUEsc0JBRko7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBREo7QUFBQTtBQUFBO0FBQUE7QUFBQSxrQkE5QkosZUF3Q0kscUVBQUMsc0RBQUQ7QUFDSSxjQUFFLEVBQUMsYUFEUDtBQUVJLG1CQUFPLEVBQUMsTUFGWjtBQUdJLG1CQUFPLEVBQUUsS0FBS0MsdUJBQUwsQ0FBNkJDLElBQTdCLENBQWtDLElBQWxDLENBSGI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsa0JBeENKO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQURKO0FBQUE7QUFBQTtBQUFBO0FBQUEsY0FESjtBQW9ESDs7OztFQTFFZUMsNENBQUssQ0FBQ0MsUzs7QUE2RVgsb0VBQUFDLHVFQUFTLENBQUNmLEtBQUQsQ0FBeEIiLCJmaWxlIjoiLi9wYWdlcy9wb3B1cC5qcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBCdXR0b24sIEZvcm0sIFJvdywgQ29sIH0gZnJvbSAncmVhY3QtYm9vdHN0cmFwJztcbmltcG9ydCBIZWFkIGZyb20gJ25leHQvaGVhZCc7XG5cbmltcG9ydCBjYW5BY2Nlc3NDaHJvbWVUYWJzIGZyb20gJy4uL2xpYi9jYW5BY2Nlc3NDaHJvbWVUYWJzJztcblxuaW1wb3J0IEJhc2VQb3B1cCBmcm9tICcuLi9jb21wb25lbnRzL2Jhc2VfcG9wdXAnO1xuXG5jbGFzcyBQb3B1cCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICAvL3RoaXMuc3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCBwcm9wcy5tb2RlbC5hdHRyaWJ1dGVzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHt9O1xuXG4gICAgICAgIC8vdGhpcy5oYW5kbGVDaGFuZ2UgPSB0aGlzLmhhbmRsZUNoYW5nZS5iaW5kKHRoaXMpO1xuICAgIH1cblxuICAgIGhhbmRsZVNhdmVCdXR0b25DbGlja2VkKCkge1xuICAgICAgICBjb25zdCBwb3B1cCA9IHRoaXMucHJvcHMucG9wdXA7XG5cbiAgICAgICAgaWYgKGNhbkFjY2Vzc0Nocm9tZVRhYnMoKSkge1xuICAgICAgICAgICAgcG9wdXAuc2F2ZU5vdGVzRm9yQ3VycmVudFRhYigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcG9wdXAuc2hvd1N1Y2Nlc3NBbGVydCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBwb3B1cCA9IHRoaXMucHJvcHMucG9wdXA7XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29udGFpbmVyXCIgaWQ9XCJtYWluX19hZGRfX3NlY3Rpb25cIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm1iLTJcIj5cbiAgICAgICAgICAgICAgICAgICAgPFJvdz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxDb2wgc209XCIyXCIgY2xhc3NOYW1lPVwiZmlsbCBub3BhZGRpbmdcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW1nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYz17cG9wdXAuc3RhdGUuY3VycmVudFRhYkljb259XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkPVwiY3VycmVudFRhYkljb25cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJpbWctdGh1bWJuYWlsXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWx0PVwiVGFiIEltYWdlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Db2w+XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxDb2wgc209XCIxMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGb3JtLkdyb3VwIGNvbnRyb2xJZD1cImN1cnJlbnRUYWJVcmxcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPEZvcm0uTGFiZWw+Q3VycmVudCBVUkw8L0Zvcm0uTGFiZWw+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxGb3JtLkNvbnRyb2xcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmF1bHRWYWx1ZT17cG9wdXAuc3RhdGUuY3VycmVudFRhYlVybH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPjwvRm9ybS5Db250cm9sPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvRm9ybS5Hcm91cD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvQ29sPlxuICAgICAgICAgICAgICAgICAgICA8L1Jvdz5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYi0yXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Rm9ybS5Hcm91cCBjb250cm9sSWQ9XCJjdXJyZW50VGFiVGl0bGVcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Rm9ybS5MYWJlbD5UaXRsZTwvRm9ybS5MYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Rm9ybS5Db250cm9sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdFZhbHVlPXtwb3B1cC5zdGF0ZS5jdXJyZW50VGFiVGl0bGV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPjwvRm9ybS5Db250cm9sPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Gb3JtLkdyb3VwPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtYi0yXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8Rm9ybS5Hcm91cCBjb250cm9sSWQ9XCJjdXJyZW50VGFiTm90ZXNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Rm9ybS5MYWJlbD5Ob3RlczwvRm9ybS5MYWJlbD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Rm9ybS5Db250cm9sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzPVwidGV4dGFyZWFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dzPXs1fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZhdWx0VmFsdWU9e3BvcHVwLnN0YXRlLmN1cnJlbnRUYWJOb3Rlc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA+PC9Gb3JtLkNvbnRyb2w+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L0Zvcm0uR3JvdXA+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICBpZD1cInNhdmUtYnV0dG9uXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhcmlhbnQ9XCJkYXJrXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuaGFuZGxlU2F2ZUJ1dHRvbkNsaWNrZWQuYmluZCh0aGlzKX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgU2F2ZVxuICAgICAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzZVBvcHVwKFBvcHVwKTtcbiJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./pages/popup.js\n");

/***/ })

})