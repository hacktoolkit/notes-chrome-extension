_N_E=(window.webpackJsonp_N_E=window.webpackJsonp_N_E||[]).push([[10],{dEeE:function(e,a,t){"use strict";t.r(a);var r=t("1OyB"),s=t("vuIU"),l=t("Ji7U"),i=t("md7G"),c=t("foSv"),n=t("nKUr"),o=t("q1tI"),d=t.n(o),u=t("wx14"),b=t("zLVn"),m=t("TSYQ"),f=t.n(m),v=t("vUet"),p=["xl","lg","md","sm","xs"],j=d.a.forwardRef((function(e,a){var t=e.bsPrefix,r=e.className,s=e.noGutters,l=e.as,i=void 0===l?"div":l,c=Object(b.a)(e,["bsPrefix","className","noGutters","as"]),n=Object(v.a)(t,"row"),o=n+"-cols",m=[];return p.forEach((function(e){var a,t=c[e];delete c[e];var r="xs"!==e?"-"+e:"";null!=(a=null!=t&&"object"===typeof t?t.cols:t)&&m.push(""+o+r+"-"+a)})),d.a.createElement(i,Object(u.a)({ref:a},c,{className:f.a.apply(void 0,[r,n,s&&"no-gutters"].concat(m))}))}));j.displayName="Row",j.defaultProps={noGutters:!1};var O=j,x=["xl","lg","md","sm","xs"],h=d.a.forwardRef((function(e,a){var t=e.bsPrefix,r=e.className,s=e.as,l=void 0===s?"div":s,i=Object(b.a)(e,["bsPrefix","className","as"]),c=Object(v.a)(t,"col"),n=[],o=[];return x.forEach((function(e){var a,t,r,s=i[e];if(delete i[e],"object"===typeof s&&null!=s){var l=s.span;a=void 0===l||l,t=s.offset,r=s.order}else a=s;var d="xs"!==e?"-"+e:"";a&&n.push(!0===a?""+c+d:""+c+d+"-"+a),null!=r&&o.push("order"+d+"-"+r),null!=t&&o.push("offset"+d+"-"+t)})),n.length||n.push(c),d.a.createElement(l,Object(u.a)({},i,{ref:a,className:f.a.apply(void 0,[r].concat(n,o))}))}));h.displayName="Col";var N=h,y=(t("K9S6"),t("17x9")),I=t.n(y),P={type:I.a.string,tooltip:I.a.bool,as:I.a.elementType},w=d.a.forwardRef((function(e,a){var t=e.as,r=void 0===t?"div":t,s=e.className,l=e.type,i=void 0===l?"valid":l,c=e.tooltip,n=void 0!==c&&c,o=Object(b.a)(e,["as","className","type","tooltip"]);return d.a.createElement(r,Object(u.a)({},o,{ref:a,className:f()(s,i+"-"+(n?"tooltip":"feedback"))}))}));w.displayName="Feedback",w.propTypes=P;var E=w,C=d.a.createContext({controlId:void 0}),T=d.a.forwardRef((function(e,a){var t=e.id,r=e.bsPrefix,s=e.bsCustomPrefix,l=e.className,i=e.type,c=void 0===i?"checkbox":i,n=e.isValid,m=void 0!==n&&n,p=e.isInvalid,j=void 0!==p&&p,O=e.isStatic,x=e.as,h=void 0===x?"input":x,N=Object(b.a)(e,["id","bsPrefix","bsCustomPrefix","className","type","isValid","isInvalid","isStatic","as"]),y=Object(o.useContext)(C),I=y.controlId,P=y.custom?[s,"custom-control-input"]:[r,"form-check-input"],w=P[0],E=P[1];return r=Object(v.a)(w,E),d.a.createElement(h,Object(u.a)({},N,{ref:a,type:c,id:t||I,className:f()(l,r,m&&"is-valid",j&&"is-invalid",O&&"position-static")}))}));T.displayName="FormCheckInput";var k=T,F=d.a.forwardRef((function(e,a){var t=e.bsPrefix,r=e.bsCustomPrefix,s=e.className,l=e.htmlFor,i=Object(b.a)(e,["bsPrefix","bsCustomPrefix","className","htmlFor"]),c=Object(o.useContext)(C),n=c.controlId,m=c.custom?[r,"custom-control-label"]:[t,"form-check-label"],p=m[0],j=m[1];return t=Object(v.a)(p,j),d.a.createElement("label",Object(u.a)({},i,{ref:a,htmlFor:l||n,className:f()(s,t)}))}));F.displayName="FormCheckLabel";var g=F,R=d.a.forwardRef((function(e,a){var t=e.id,r=e.bsPrefix,s=e.bsCustomPrefix,l=e.inline,i=void 0!==l&&l,c=e.disabled,n=void 0!==c&&c,m=e.isValid,p=void 0!==m&&m,j=e.isInvalid,O=void 0!==j&&j,x=e.feedbackTooltip,h=void 0!==x&&x,N=e.feedback,y=e.className,I=e.style,P=e.title,w=void 0===P?"":P,T=e.type,F=void 0===T?"checkbox":T,R=e.label,S=e.children,V=e.custom,_=e.as,L=void 0===_?"input":_,U=Object(b.a)(e,["id","bsPrefix","bsCustomPrefix","inline","disabled","isValid","isInvalid","feedbackTooltip","feedback","className","style","title","type","label","children","custom","as"]),z="switch"===F||V,G=z?[s,"custom-control"]:[r,"form-check"],A=G[0],B=G[1];r=Object(v.a)(A,B);var J=Object(o.useContext)(C).controlId,M=Object(o.useMemo)((function(){return{controlId:t||J,custom:z}}),[J,z,t]),Y=z||null!=R&&!1!==R&&!S,D=d.a.createElement(k,Object(u.a)({},U,{type:"switch"===F?"checkbox":F,ref:a,isValid:p,isInvalid:O,isStatic:!Y,disabled:n,as:L}));return d.a.createElement(C.Provider,{value:M},d.a.createElement("div",{style:I,className:f()(y,r,z&&"custom-"+F,i&&r+"-inline")},S||d.a.createElement(d.a.Fragment,null,D,Y&&d.a.createElement(g,{title:w},R),(p||O)&&d.a.createElement(E,{type:p?"valid":"invalid",tooltip:h},N))))}));R.displayName="FormCheck",R.Input=k,R.Label=g;var S=R,V=d.a.forwardRef((function(e,a){var t=e.id,r=e.bsPrefix,s=e.bsCustomPrefix,l=e.className,i=e.isValid,c=e.isInvalid,n=e.lang,m=e.as,p=void 0===m?"input":m,j=Object(b.a)(e,["id","bsPrefix","bsCustomPrefix","className","isValid","isInvalid","lang","as"]),O=Object(o.useContext)(C),x=O.controlId,h=O.custom?[s,"custom-file-input"]:[r,"form-control-file"],N=h[0],y=h[1];return r=Object(v.a)(N,y),d.a.createElement(p,Object(u.a)({},j,{ref:a,id:t||x,type:"file",lang:n,className:f()(l,r,i&&"is-valid",c&&"is-invalid")}))}));V.displayName="FormFileInput";var _=V,L=d.a.forwardRef((function(e,a){var t=e.bsPrefix,r=e.bsCustomPrefix,s=e.className,l=e.htmlFor,i=Object(b.a)(e,["bsPrefix","bsCustomPrefix","className","htmlFor"]),c=Object(o.useContext)(C),n=c.controlId,m=c.custom?[r,"custom-file-label"]:[t,"form-file-label"],p=m[0],j=m[1];return t=Object(v.a)(p,j),d.a.createElement("label",Object(u.a)({},i,{ref:a,htmlFor:l||n,className:f()(s,t),"data-browse":i["data-browse"]}))}));L.displayName="FormFileLabel";var U=L,z=d.a.forwardRef((function(e,a){var t=e.id,r=e.bsPrefix,s=e.bsCustomPrefix,l=e.disabled,i=void 0!==l&&l,c=e.isValid,n=void 0!==c&&c,m=e.isInvalid,p=void 0!==m&&m,j=e.feedbackTooltip,O=void 0!==j&&j,x=e.feedback,h=e.className,N=e.style,y=e.label,I=e.children,P=e.custom,w=e.lang,T=e["data-browse"],k=e.as,F=void 0===k?"div":k,g=e.inputAs,R=void 0===g?"input":g,S=Object(b.a)(e,["id","bsPrefix","bsCustomPrefix","disabled","isValid","isInvalid","feedbackTooltip","feedback","className","style","label","children","custom","lang","data-browse","as","inputAs"]),V=P?[s,"custom"]:[r,"form-file"],L=V[0],z=V[1];r=Object(v.a)(L,z);var G=Object(o.useContext)(C).controlId,A=Object(o.useMemo)((function(){return{controlId:t||G,custom:P}}),[G,P,t]),B=null!=y&&!1!==y&&!I,J=d.a.createElement(_,Object(u.a)({},S,{ref:a,isValid:n,isInvalid:p,disabled:i,as:R,lang:w}));return d.a.createElement(C.Provider,{value:A},d.a.createElement(F,{style:N,className:f()(h,r,P&&"custom-file")},I||d.a.createElement(d.a.Fragment,null,P?d.a.createElement(d.a.Fragment,null,J,B&&d.a.createElement(U,{"data-browse":T},y)):d.a.createElement(d.a.Fragment,null,B&&d.a.createElement(U,null,y),J),(n||p)&&d.a.createElement(E,{type:n?"valid":"invalid",tooltip:O},x))))}));z.displayName="FormFile",z.Input=_,z.Label=U;var G=z,A=(t("2W6z"),d.a.forwardRef((function(e,a){var t,r,s=e.bsPrefix,l=e.bsCustomPrefix,i=e.type,c=e.size,n=e.htmlSize,m=e.id,p=e.className,j=e.isValid,O=void 0!==j&&j,x=e.isInvalid,h=void 0!==x&&x,N=e.plaintext,y=e.readOnly,I=e.custom,P=e.as,w=void 0===P?"input":P,E=Object(b.a)(e,["bsPrefix","bsCustomPrefix","type","size","htmlSize","id","className","isValid","isInvalid","plaintext","readOnly","custom","as"]),T=Object(o.useContext)(C).controlId,k=I?[l,"custom"]:[s,"form-control"],F=k[0],g=k[1];if(s=Object(v.a)(F,g),N)(r={})[s+"-plaintext"]=!0,t=r;else if("file"===i){var R;(R={})[s+"-file"]=!0,t=R}else if("range"===i){var S;(S={})[s+"-range"]=!0,t=S}else if("select"===w&&I){var V;(V={})[s+"-select"]=!0,V[s+"-select-"+c]=c,t=V}else{var _;(_={})[s]=!0,_[s+"-"+c]=c,t=_}return d.a.createElement(w,Object(u.a)({},E,{type:i,size:n,ref:a,readOnly:y,id:m||T,className:f()(p,t,O&&"is-valid",h&&"is-invalid")}))})));A.displayName="FormControl";var B=Object.assign(A,{Feedback:E}),J=d.a.forwardRef((function(e,a){var t=e.bsPrefix,r=e.className,s=e.children,l=e.controlId,i=e.as,c=void 0===i?"div":i,n=Object(b.a)(e,["bsPrefix","className","children","controlId","as"]);t=Object(v.a)(t,"form-group");var m=Object(o.useMemo)((function(){return{controlId:l}}),[l]);return d.a.createElement(C.Provider,{value:m},d.a.createElement(c,Object(u.a)({},n,{ref:a,className:f()(r,t)}),s))}));J.displayName="FormGroup";var M=J,Y=d.a.forwardRef((function(e,a){var t=e.as,r=void 0===t?"label":t,s=e.bsPrefix,l=e.column,i=e.srOnly,c=e.className,n=e.htmlFor,m=Object(b.a)(e,["as","bsPrefix","column","srOnly","className","htmlFor"]),p=Object(o.useContext)(C).controlId;s=Object(v.a)(s,"form-label");var j="col-form-label";"string"===typeof l&&(j=j+" "+j+"-"+l);var O=f()(c,s,i&&"sr-only",l&&j);return n=n||p,l?d.a.createElement(N,Object(u.a)({as:"label",className:O,htmlFor:n},m)):d.a.createElement(r,Object(u.a)({ref:a,className:O,htmlFor:n},m))}));Y.displayName="FormLabel",Y.defaultProps={column:!1,srOnly:!1};var D=Y,K=d.a.forwardRef((function(e,a){var t=e.bsPrefix,r=e.className,s=e.as,l=void 0===s?"small":s,i=e.muted,c=Object(b.a)(e,["bsPrefix","className","as","muted"]);return t=Object(v.a)(t,"form-text"),d.a.createElement(l,Object(u.a)({},c,{ref:a,className:f()(r,t,i&&"text-muted")}))}));K.displayName="FormText";var X=K,q=d.a.forwardRef((function(e,a){return d.a.createElement(S,Object(u.a)({},e,{ref:a,type:"switch"}))}));q.displayName="Switch",q.Input=S.Input,q.Label=S.Label;var H=q,Q=t("YdCC"),W=Object(Q.a)("form-row"),Z=d.a.forwardRef((function(e,a){var t=e.bsPrefix,r=e.inline,s=e.className,l=e.validated,i=e.as,c=void 0===i?"form":i,n=Object(b.a)(e,["bsPrefix","inline","className","validated","as"]);return t=Object(v.a)(t,"form"),d.a.createElement(c,Object(u.a)({},n,{ref:a,className:f()(s,l&&"was-validated",r&&t+"-inline")}))}));Z.displayName="Form",Z.defaultProps={inline:!1},Z.Row=W,Z.Group=M,Z.Control=B,Z.Check=S,Z.File=G,Z.Switch=H,Z.Label=D,Z.Text=X;var $=Z,ee=t("dbZe"),ae=d.a.forwardRef((function(e,a){var t=e.bsPrefix,r=e.variant,s=e.size,l=e.active,i=e.className,c=e.block,n=e.type,o=e.as,m=Object(b.a)(e,["bsPrefix","variant","size","active","className","block","type","as"]),p=Object(v.a)(t,"btn"),j=f()(i,p,l&&"active",r&&p+"-"+r,c&&p+"-block",s&&p+"-"+s);if(m.href)return d.a.createElement(ee.a,Object(u.a)({},m,{as:o,ref:a,className:f()(j,m.disabled&&"disabled")}));a&&(m.ref=a),n?m.type=n:o||(m.type="button");var O=o||"button";return d.a.createElement(O,Object(u.a)({},m,{className:j}))}));ae.displayName="Button",ae.defaultProps={variant:"primary",active:!1,disabled:!1};var te=ae,re=(t("g4pe"),t("mYzJ")),se=t("+O5N"),le=t("HwC9");function ie(e){var a=function(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}();return function(){var t,r=Object(c.a)(e);if(a){var s=Object(c.a)(this).constructor;t=Reflect.construct(r,arguments,s)}else t=r.apply(this,arguments);return Object(i.a)(this,t)}}var ce=function(e){Object(l.a)(t,e);var a=ie(t);function t(e){var s;return Object(r.a)(this,t),(s=a.call(this,e)).currentTabUrlInput=d.a.createRef(),s.currentTabIconImg=d.a.createRef(),s.currentTabTitleInput=d.a.createRef(),s.currentTabNotesInput=d.a.createRef(),s}return Object(s.a)(t,[{key:"saveNotesForCurrentTab",value:function(){var e=this.props.popup;if(""===e.state.currentTabUrl)e.showErrorAlert();else{this.showSuccessAlert();var a=this.currentTabUrl.value,t={noteUrl:a,noteImage:e.state.currentTabIcon,noteTitle:this.currentTabTitleInput.value,noteText:this.currentTabNotesInput.value};Object(se.b)(a,t,(function(a){e.setState({allNotesObject:a}),e.showSuccessAlert()}))}}},{key:"handleSaveButtonClicked",value:function(){var e=this.props.popup;Object(re.a)()?this.saveNotesForCurrentTab():e.showSuccessAlert()}},{key:"render",value:function(){var e=this.props.popup;return Object(n.jsx)("div",{className:"container",id:"main__add__section",children:Object(n.jsxs)("div",{className:"mb-2",children:[Object(n.jsxs)(O,{children:[Object(n.jsx)(N,{sm:"2",className:"fill nopadding",children:Object(n.jsx)("img",{src:e.state.currentTabIcon,id:"currentTabIcon",className:"img-thumbnail",alt:"Tab Image",ref:this.currentTabIconImg})}),Object(n.jsx)(N,{sm:"10",children:Object(n.jsxs)($.Group,{controlId:"currentTabUrl",children:[Object(n.jsx)($.Label,{children:"Current URL"}),Object(n.jsx)($.Control,{type:"text",defaultValue:e.state.currentTabUrl,ref:this.currentTabUrlInput})]})})]}),Object(n.jsx)("div",{className:"mb-2",children:Object(n.jsxs)($.Group,{controlId:"currentTabTitle",children:[Object(n.jsx)($.Label,{children:"Title"}),Object(n.jsx)($.Control,{type:"text",defaultValue:e.state.currentTabTitle,ref:this.currentTabTitleInput})]})}),Object(n.jsx)("div",{className:"mb-2",children:Object(n.jsxs)($.Group,{controlId:"currentTabNotes",children:[Object(n.jsx)($.Label,{children:"Notes"}),Object(n.jsx)($.Control,{as:"textarea",rows:5,defaultValue:e.state.currentTabNotes,ref:this.currentTabNotesInput})]})}),Object(n.jsx)(te,{id:"save-button",variant:"dark",onClick:this.handleSaveButtonClicked.bind(this),children:"Save"})]})})}}]),t}(d.a.Component);a.default=Object(le.a)(ce)},owrA:function(e,a,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/popup",function(){return t("dEeE")}])}},[["owrA",0,1,2]]]);