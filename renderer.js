/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/application.coffee");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/mithril/stream.js":
/*!****************************************!*\
  !*** ./node_modules/mithril/stream.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(/*! ./stream/stream */ "./node_modules/mithril/stream/stream.js")


/***/ }),

/***/ "./node_modules/mithril/stream/stream.js":
/*!***********************************************!*\
  !*** ./node_modules/mithril/stream/stream.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/* eslint-disable */
;(function() {
"use strict"
/* eslint-enable */
Stream.SKIP = {}
Stream.lift = lift
Stream.scan = scan
Stream.merge = merge
Stream.combine = combine
Stream.scanMerge = scanMerge
Stream["fantasy-land/of"] = Stream

var warnedHalt = false
Object.defineProperty(Stream, "HALT", {
	get: function() {
		warnedHalt || console.log("HALT is deprecated and has been renamed to SKIP");
		warnedHalt = true
		return Stream.SKIP
	}
})

function Stream(value) {
	var dependentStreams = []
	var dependentFns = []

	function stream(v) {
		if (arguments.length && v !== Stream.SKIP) {
			value = v
			if (open(stream)) {
				stream._changing()
				stream._state = "active"
				dependentStreams.forEach(function(s, i) { s(dependentFns[i](value)) })
			}
		}

		return value
	}

	stream.constructor = Stream
	stream._state = arguments.length && value !== Stream.SKIP ? "active" : "pending"
	stream._parents = []

	stream._changing = function() {
		if (open(stream)) stream._state = "changing"
		dependentStreams.forEach(function(s) {
			s._changing()
		})
	}

	stream._map = function(fn, ignoreInitial) {
		var target = ignoreInitial ? Stream() : Stream(fn(value))
		target._parents.push(stream)
		dependentStreams.push(target)
		dependentFns.push(fn)
		return target
	}

	stream.map = function(fn) {
		return stream._map(fn, stream._state !== "active")
	}

	var end
	function createEnd() {
		end = Stream()
		end.map(function(value) {
			if (value === true) {
				stream._parents.forEach(function (p) {p._unregisterChild(stream)})
				stream._state = "ended"
				stream._parents.length = dependentStreams.length = dependentFns.length = 0
			}
			return value
		})
		return end
	}

	stream.toJSON = function() { return value != null && typeof value.toJSON === "function" ? value.toJSON() : value }

	stream["fantasy-land/map"] = stream.map
	stream["fantasy-land/ap"] = function(x) { return combine(function(s1, s2) { return s1()(s2()) }, [x, stream]) }

	stream._unregisterChild = function(child) {
		var childIndex = dependentStreams.indexOf(child)
		if (childIndex !== -1) {
			dependentStreams.splice(childIndex, 1)
			dependentFns.splice(childIndex, 1)
		}
	}

	Object.defineProperty(stream, "end", {
		get: function() { return end || createEnd() }
	})

	return stream
}

function combine(fn, streams) {
	var ready = streams.every(function(s) {
		if (s.constructor !== Stream)
			throw new Error("Ensure that each item passed to stream.combine/stream.merge/lift is a stream")
		return s._state === "active"
	})
	var stream = ready
		? Stream(fn.apply(null, streams.concat([streams])))
		: Stream()

	var changed = []

	var mappers = streams.map(function(s) {
		return s._map(function(value) {
			changed.push(s)
			if (ready || streams.every(function(s) { return s._state !== "pending" })) {
				ready = true
				stream(fn.apply(null, streams.concat([changed])))
				changed = []
			}
			return value
		}, true)
	})

	var endStream = stream.end.map(function(value) {
		if (value === true) {
			mappers.forEach(function(mapper) { mapper.end(true) })
			endStream.end(true)
		}
		return undefined
	})

	return stream
}

function merge(streams) {
	return combine(function() { return streams.map(function(s) { return s() }) }, streams)
}

function scan(fn, acc, origin) {
	var stream = origin.map(function(v) {
		var next = fn(acc, v)
		if (next !== Stream.SKIP) acc = next
		return next
	})
	stream(acc)
	return stream
}

function scanMerge(tuples, seed) {
	var streams = tuples.map(function(tuple) { return tuple[0] })

	var stream = combine(function() {
		var changed = arguments[arguments.length - 1]
		streams.forEach(function(stream, i) {
			if (changed.indexOf(stream) > -1)
				seed = tuples[i][1](seed, stream())
		})

		return seed
	}, streams)

	stream(seed)

	return stream
}

function lift() {
	var fn = arguments[0]
	var streams = Array.prototype.slice.call(arguments, 1)
	return merge(streams).map(function(streams) {
		return fn.apply(undefined, streams)
	})
}

function open(s) {
	return s._state === "pending" || s._state === "active" || s._state === "changing"
}

if (true) module["exports"] = Stream
else {}

}());


/***/ }),

/***/ "./src/application.coffee":
/*!********************************!*\
  !*** ./src/application.coffee ***!
  \********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var mithril__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mithril */ "mithril");
/* harmony import */ var mithril__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mithril__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var views_article__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! views/article */ "./src/views/article.coffee");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var common_data__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! common/data */ "./src/common/data.coffee");
/* harmony import */ var common_save__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! common/save */ "./src/common/save.coffee");
var routes;











routes = {
  '/': views_article__WEBPACK_IMPORTED_MODULE_1__["default"]
};

mithril__WEBPACK_IMPORTED_MODULE_0__["route"].prefix = '';

mithril__WEBPACK_IMPORTED_MODULE_0__["route"](document.body, '/', routes);

common_save__WEBPACK_IMPORTED_MODULE_4__["default"].auto();

electron__WEBPACK_IMPORTED_MODULE_2__["ipcRenderer"].send('request-markdown-files');

electron__WEBPACK_IMPORTED_MODULE_2__["ipcRenderer"].on('response-markdown-files', (e, data) => {
  common_data__WEBPACK_IMPORTED_MODULE_3__["default"].home(data.home);
  common_data__WEBPACK_IMPORTED_MODULE_3__["default"].files(data.files);
  common_data__WEBPACK_IMPORTED_MODULE_3__["default"].active_file(common_data__WEBPACK_IMPORTED_MODULE_3__["default"].files()[0].path);
  return mithril__WEBPACK_IMPORTED_MODULE_0__["redraw"](true);
});

electron__WEBPACK_IMPORTED_MODULE_2__["ipcRenderer"].on('response-assets', (e, data) => {
  common_data__WEBPACK_IMPORTED_MODULE_3__["default"].assets(data.files);
  return mithril__WEBPACK_IMPORTED_MODULE_0__["redraw"](true);
});


/***/ }),

/***/ "./src/common/data.coffee":
/*!********************************!*\
  !*** ./src/common/data.coffee ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var mithril_stream__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mithril/stream */ "./node_modules/mithril/stream.js");
/* harmony import */ var mithril_stream__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mithril_stream__WEBPACK_IMPORTED_MODULE_0__);
var Data;



Data = class Data {
  constructor() {
    this.markdown_path = this.markdown_path.bind(this);
    // select can be loss after certain updates to textarea.
    // This ensures our old selection remains
    this.keep_selection = this.keep_selection.bind(this);
    // The root directory where all the markdown files are stored
    // eg. ~/fast-author/
    this.home = mithril_stream__WEBPACK_IMPORTED_MODULE_0___default()('');
    // When the current file was last saved
    this.last_saved = mithril_stream__WEBPACK_IMPORTED_MODULE_0___default()('');
    // the file that shows selecte in the right hand column
    this.active_file = mithril_stream__WEBPACK_IMPORTED_MODULE_0___default()(null);
    // files that appear in the right hand column
    this.files = mithril_stream__WEBPACK_IMPORTED_MODULE_0___default()([]);
    // assets that appear in the right hand column
    // assets only for the current markdown file that is active
    this.assets = mithril_stream__WEBPACK_IMPORTED_MODULE_0___default()([]);
    // The currently selected image in the markdown to apply editing
    this.active_asset = mithril_stream__WEBPACK_IMPORTED_MODULE_0___default()(null);
    // the contents of the markdown file
    this.document = mithril_stream__WEBPACK_IMPORTED_MODULE_0___default()('');
    // whether the meta key is being held eg. Command on Mac
    this.meta = mithril_stream__WEBPACK_IMPORTED_MODULE_0___default()(false);
    // whether the shift key is behind held
    this.shift = mithril_stream__WEBPACK_IMPORTED_MODULE_0___default()(false);
    // when true will hide editor and center preview.
    this.publisher_preview = mithril_stream__WEBPACK_IMPORTED_MODULE_0___default()(false);
    // the start and end select for markdown textarea
    this.selectionStart = mithril_stream__WEBPACK_IMPORTED_MODULE_0___default()(false);
    this.selectionEnd = mithril_stream__WEBPACK_IMPORTED_MODULE_0___default()(false);
    // current selections for infobar
    this._selectionStart = mithril_stream__WEBPACK_IMPORTED_MODULE_0___default()(0);
    this._selectionEnd = mithril_stream__WEBPACK_IMPORTED_MODULE_0___default()(0);
  }

  markdown_path(name) {
    var path;
    path = `${this.home()}/${name}/index.md`;
    console.log(path);
    return path;
  }

  keep_selection() {
    Data.selectionStart(Data._selectionStart());
    return Data.selectionEnd(Data._selectionEnd());
  }

};

/* harmony default export */ __webpack_exports__["default"] = (new Data());


/***/ }),

/***/ "./src/common/save.coffee":
/*!********************************!*\
  !*** ./src/common/save.coffee ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var common_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! common/data */ "./src/common/data.coffee");
/* harmony import */ var mithril__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! mithril */ "mithril");
/* harmony import */ var mithril__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(mithril__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! moment */ "moment");
/* harmony import */ var moment__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(moment__WEBPACK_IMPORTED_MODULE_3__);
var Save;









Save = class Save {
  constructor() {
    this.auto = this.auto.bind(this);
    this.save = this.save.bind(this);
  }

  auto() {
    return setInterval(() => {
      console.log('saving');
      if (!common_data__WEBPACK_IMPORTED_MODULE_0__["default"].active_file()) {
        return;
      }
      console.log('saving-proceed');
      return this.save();
    // save every 5 minutes
    }, (1000 * 60) * 5);
  }

  save() {
    var backup_path, current_path, date, epoch;
    date = new Date().getTime();
    epoch = Math.round(date / 1000);
    current_path = `${common_data__WEBPACK_IMPORTED_MODULE_0__["default"].home()}/${common_data__WEBPACK_IMPORTED_MODULE_0__["default"].active_file()}/index.md`;
    backup_path = `${common_data__WEBPACK_IMPORTED_MODULE_0__["default"].home()}/${common_data__WEBPACK_IMPORTED_MODULE_0__["default"].active_file()}/.backups/${epoch}.md`;
    fs__WEBPACK_IMPORTED_MODULE_2___default.a.copyFile(current_path, backup_path, (err) => {
      if (err) {
        console.log('copyFile', err);
      }
      return fs__WEBPACK_IMPORTED_MODULE_2___default.a.writeFile(current_path, common_data__WEBPACK_IMPORTED_MODULE_0__["default"].document(), function(err) {
        if (err) {
          return console.log('writeFile', err);
        }
      });
    });
    common_data__WEBPACK_IMPORTED_MODULE_0__["default"].last_saved(moment__WEBPACK_IMPORTED_MODULE_3___default()(date).format('MMM D YYYY hh:mm:ss a'));
    return mithril__WEBPACK_IMPORTED_MODULE_1__["redraw"](true);
  }

};

/* harmony default export */ __webpack_exports__["default"] = (new Save());


/***/ }),

/***/ "./src/components/article.coffee":
/*!***************************************!*\
  !*** ./src/components/article.coffee ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var mithril__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mithril */ "mithril");
/* harmony import */ var mithril__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mithril__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var components_textarea__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! components/textarea */ "./src/components/textarea.coffee");
/* harmony import */ var remarkable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! remarkable */ "remarkable");
/* harmony import */ var remarkable__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(remarkable__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var components_preview__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! components/preview */ "./src/components/preview.coffee");
/* harmony import */ var common_data__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! common/data */ "./src/common/data.coffee");
/* harmony import */ var common_save__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! common/save */ "./src/common/save.coffee");
/* harmony import */ var lib_hotkey_heading__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! lib/hotkey_heading */ "./src/lib/hotkey_heading.coffee");
/* harmony import */ var lib_hotkey_wrap__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! lib/hotkey_wrap */ "./src/lib/hotkey_wrap.coffee");
var Article;

















//import sharp from 'sharp'
/* harmony default export */ __webpack_exports__["default"] = (Article = class Article {
  constructor() {
    this.bold = this.bold.bind(this);
    this.red = this.red.bind(this);
    this.underline = this.underline.bind(this);
    this.highlight = this.highlight.bind(this);
    this.image_resize = this.image_resize.bind(this);
    //sharp(Data.active_asset())
    //.resize(width:726, {
    //fit: 'contain',
    //})
    //.toFile(Data.active_asset())
    this.image_border = this.image_border.bind(this);
    this.image_dropshadow = this.image_dropshadow.bind(this);
    this.image_drop = this.image_drop.bind(this);
    this.image_paint = this.image_paint.bind(this);
    this.publisher_preview = this.publisher_preview.bind(this);
    this.save = this.save.bind(this);
    this.subheader = this.subheader.bind(this);
    this.header = this.header.bind(this);
    this.panes = this.panes.bind(this);
    this.md = new remarkable__WEBPACK_IMPORTED_MODULE_2__["Remarkable"]({
      html: true
    });
  }

  bold() {
    var data, end_at, start_at, target;
    target = document.getElementById('editor');
    start_at = target.selectionStart;
    end_at = target.selectionEnd;
    data = lib_hotkey_wrap__WEBPACK_IMPORTED_MODULE_7__["default"].insert(common_data__WEBPACK_IMPORTED_MODULE_4__["default"].document(), start_at, end_at, "**", "**");
    common_data__WEBPACK_IMPORTED_MODULE_4__["default"].document(data.value);
    common_data__WEBPACK_IMPORTED_MODULE_4__["default"].selectionStart(data.selectionStart);
    return common_data__WEBPACK_IMPORTED_MODULE_4__["default"].selectionEnd(data.selectionEnd);
  }

  red() {
    var data, end_at, start_at, target;
    target = document.getElementById('editor');
    start_at = target.selectionStart;
    end_at = target.selectionEnd;
    data = lib_hotkey_wrap__WEBPACK_IMPORTED_MODULE_7__["default"].insert(common_data__WEBPACK_IMPORTED_MODULE_4__["default"].document(), start_at, end_at, "<strong class='r'>", "</strong>");
    common_data__WEBPACK_IMPORTED_MODULE_4__["default"].document(data.value);
    common_data__WEBPACK_IMPORTED_MODULE_4__["default"].selectionStart(data.selectionStart);
    return common_data__WEBPACK_IMPORTED_MODULE_4__["default"].selectionEnd(data.selectionEnd);
  }

  underline() {}

  highlight() {
    var data, end_at, start_at, target;
    target = document.getElementById('editor');
    start_at = target.selectionStart;
    end_at = target.selectionEnd;
    data = lib_hotkey_wrap__WEBPACK_IMPORTED_MODULE_7__["default"].insert(common_data__WEBPACK_IMPORTED_MODULE_4__["default"].document(), start_at, end_at, "<strong class='h'>", "</strong>");
    common_data__WEBPACK_IMPORTED_MODULE_4__["default"].document(data.value);
    common_data__WEBPACK_IMPORTED_MODULE_4__["default"].selectionStart(data.selectionStart);
    return common_data__WEBPACK_IMPORTED_MODULE_4__["default"].selectionEnd(data.selectionEnd);
  }

  image_resize() {
    return console.log('resizing');
  }

  image_border() {}

  image_dropshadow() {}

  image_drop() {}

  image_paint() {}

  publisher_preview() {
    return common_data__WEBPACK_IMPORTED_MODULE_4__["default"].publisher_preview(!common_data__WEBPACK_IMPORTED_MODULE_4__["default"].publisher_preview());
  }

  save() {
    return common_save__WEBPACK_IMPORTED_MODULE_5__["default"].save();
  }

  subheader() {
    return mithril__WEBPACK_IMPORTED_MODULE_0__('section.sub', mithril__WEBPACK_IMPORTED_MODULE_0__('.editor', mithril__WEBPACK_IMPORTED_MODULE_0__('span.lbl', 'Editor'), mithril__WEBPACK_IMPORTED_MODULE_0__('span.btn.save', {
      onclick: this.save
    }, mithril__WEBPACK_IMPORTED_MODULE_0__('span.far.fa-save')), mithril__WEBPACK_IMPORTED_MODULE_0__('span.btn.bold', {
      onclick: this.bold
    }, mithril__WEBPACK_IMPORTED_MODULE_0__('span', 'bold')), mithril__WEBPACK_IMPORTED_MODULE_0__('span.btn.red', {
      onclick: this.red
    }, mithril__WEBPACK_IMPORTED_MODULE_0__('span', 'red')), mithril__WEBPACK_IMPORTED_MODULE_0__('span.btn.underline', {
      onclick: this.underline
    }, mithril__WEBPACK_IMPORTED_MODULE_0__('span', 'underline')), mithril__WEBPACK_IMPORTED_MODULE_0__('span.btn.highlight', {
      onclick: this.highlight
    }, mithril__WEBPACK_IMPORTED_MODULE_0__('span', 'highlight')), mithril__WEBPACK_IMPORTED_MODULE_0__('em')), mithril__WEBPACK_IMPORTED_MODULE_0__('.preview', mithril__WEBPACK_IMPORTED_MODULE_0__('span.lbl', 'Preview'), common_data__WEBPACK_IMPORTED_MODULE_4__["default"].active_asset() ? [
      mithril__WEBPACK_IMPORTED_MODULE_0__('span.btn.crop',
      {
        onclick: this.image_crop
      },
      mithril__WEBPACK_IMPORTED_MODULE_0__('span.fas.fa-crop-alt')),
      mithril__WEBPACK_IMPORTED_MODULE_0__('span.btn.crop',
      {
        onclick: this.image_resize
      },
      mithril__WEBPACK_IMPORTED_MODULE_0__('span.fas.fa-compress')),
      mithril__WEBPACK_IMPORTED_MODULE_0__('span.btn.border',
      {
        onclick: this.image_border
      },
      mithril__WEBPACK_IMPORTED_MODULE_0__('span.fas.fa-border-style')),
      mithril__WEBPACK_IMPORTED_MODULE_0__('span.btn.paint',
      {
        onclick: this.image_paint
      },
      mithril__WEBPACK_IMPORTED_MODULE_0__('span.fas.fa-paint-brush'))
    ] : void 0), mithril__WEBPACK_IMPORTED_MODULE_0__('em'));
  }

  header() {
    return mithril__WEBPACK_IMPORTED_MODULE_0__('header', mithril__WEBPACK_IMPORTED_MODULE_0__('section.main', mithril__WEBPACK_IMPORTED_MODULE_0__('.title', {
      contenteditable: true
    }, mithril__WEBPACK_IMPORTED_MODULE_0__["trust"](common_data__WEBPACK_IMPORTED_MODULE_4__["default"].active_file())), mithril__WEBPACK_IMPORTED_MODULE_0__('span.btn.save', {
      onclick: this.publisher_preview
    }, mithril__WEBPACK_IMPORTED_MODULE_0__('span.far.fa-eye')), mithril__WEBPACK_IMPORTED_MODULE_0__('em')), !common_data__WEBPACK_IMPORTED_MODULE_4__["default"].publisher_preview() ? this.subheader() : void 0);
  }

  panes() {
    return mithril__WEBPACK_IMPORTED_MODULE_0__('.panes', mithril__WEBPACK_IMPORTED_MODULE_0__(components_textarea__WEBPACK_IMPORTED_MODULE_1__["default"]), mithril__WEBPACK_IMPORTED_MODULE_0__(components_preview__WEBPACK_IMPORTED_MODULE_3__["default"]), mithril__WEBPACK_IMPORTED_MODULE_0__('em'));
  }

  view() {
    return mithril__WEBPACK_IMPORTED_MODULE_0__('article', this.header(), common_data__WEBPACK_IMPORTED_MODULE_4__["default"].publisher_preview() ? mithril__WEBPACK_IMPORTED_MODULE_0__('.publisher_preview.markdown', mithril__WEBPACK_IMPORTED_MODULE_0__["trust"](this.md.render(common_data__WEBPACK_IMPORTED_MODULE_4__["default"].document()))) : this.panes());
  }

});


/***/ }),

/***/ "./src/components/infobar.coffee":
/*!***************************************!*\
  !*** ./src/components/infobar.coffee ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var mithril__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mithril */ "mithril");
/* harmony import */ var mithril__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mithril__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var common_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! common/data */ "./src/common/data.coffee");
var Infobar;





/* harmony default export */ __webpack_exports__["default"] = (Infobar = class Infobar {
  constructor() {
    this.view = this.view.bind(this);
  }

  view() {
    return mithril__WEBPACK_IMPORTED_MODULE_0__('.infobar', common_data__WEBPACK_IMPORTED_MODULE_1__["default"]._selectionStart() ? mithril__WEBPACK_IMPORTED_MODULE_0__('span', common_data__WEBPACK_IMPORTED_MODULE_1__["default"]._selectionStart()) : void 0, mithril__WEBPACK_IMPORTED_MODULE_0__('span', ':'), common_data__WEBPACK_IMPORTED_MODULE_1__["default"]._selectionEnd() ? mithril__WEBPACK_IMPORTED_MODULE_0__('span', common_data__WEBPACK_IMPORTED_MODULE_1__["default"]._selectionEnd()) : void 0, mithril__WEBPACK_IMPORTED_MODULE_0__('span.b', "Saved "), common_data__WEBPACK_IMPORTED_MODULE_1__["default"].last_saved() ? mithril__WEBPACK_IMPORTED_MODULE_0__('span.date', common_data__WEBPACK_IMPORTED_MODULE_1__["default"].last_saved()) : void 0);
  }

});


/***/ }),

/***/ "./src/components/preview.coffee":
/*!***************************************!*\
  !*** ./src/components/preview.coffee ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var mithril__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mithril */ "mithril");
/* harmony import */ var mithril__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mithril__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var remarkable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! remarkable */ "remarkable");
/* harmony import */ var remarkable__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(remarkable__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var common_data__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! common/data */ "./src/common/data.coffee");
var Preview;







// TODO - Maybe include this?
//  https://github.com/jonschlinkert/pretty-remarkable

  //HighlightPlugin = (md,options)->
//md.ruler.push 'highlight', ()->
//console.log 'highlight_args', arguments
//,{}
//console.log md

  // TODO - maybe add marching ants for selected images 
// https://css-tricks.com/svg-marching-ants/
/* harmony default export */ __webpack_exports__["default"] = (Preview = class Preview {
  constructor() {
    //@md.use HighlightPlugin
    this.select_image = this.select_image.bind(this);
    this.onupdate = this.onupdate.bind(this);
    this.view = this.view.bind(this);
    this.md = new remarkable__WEBPACK_IMPORTED_MODULE_1__["Remarkable"]({
      html: true
    });
  }

  select_image(ev) {
    var el, els, i, len;
    // first remove existing selected
    els = document.querySelectorAll('.preview img');
    for (i = 0, len = els.length; i < len; i++) {
      el = els[i];
      el.classList.remove('selected');
    }
    common_data__WEBPACK_IMPORTED_MODULE_2__["default"].active_asset(ev.target.src);
    ev.target.classList.add('selected');
    return mithril__WEBPACK_IMPORTED_MODULE_0__["redraw"](true);
  }

  onupdate(vnode) {
    var el, els, i, len, results;
    els = document.querySelectorAll('.preview img');
    results = [];
    for (i = 0, len = els.length; i < len; i++) {
      el = els[i];
      results.push(el.addEventListener("click", this.select_image));
    }
    return results;
  }

  view() {
    return mithril__WEBPACK_IMPORTED_MODULE_0__('.pane.preview.markdown', mithril__WEBPACK_IMPORTED_MODULE_0__["trust"](this.md.render(common_data__WEBPACK_IMPORTED_MODULE_2__["default"].document())));
  }

});


/***/ }),

/***/ "./src/components/sidebar.coffee":
/*!***************************************!*\
  !*** ./src/components/sidebar.coffee ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var mithril__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mithril */ "mithril");
/* harmony import */ var mithril__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mithril__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var common_data__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! common/data */ "./src/common/data.coffee");
/* harmony import */ var lib_text_insert__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lib/text_insert */ "./src/lib/text_insert.coffee");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_4__);
var Sidebar;











/* harmony default export */ __webpack_exports__["default"] = (Sidebar = class Sidebar {
  constructor() {
    this.classes = this.classes.bind(this);
    this.click = this.click.bind(this);
    //add an asset where current cursor is located
    this.add = this.add.bind(this);
  }

  oninit(vnode) {
    return this.value = vnode.attrs.value;
  }

  classes(file) {
    if (file.name === common_data__WEBPACK_IMPORTED_MODULE_2__["default"].active_file()) {
      return 'active';
    } else {
      return '';
    }
  }

  click(file) {
    return () => {
      var data;
      data = fs__WEBPACK_IMPORTED_MODULE_1___default.a.readFileSync(common_data__WEBPACK_IMPORTED_MODULE_2__["default"].markdown_path(file.name));
      common_data__WEBPACK_IMPORTED_MODULE_2__["default"].active_file(file.name);
      common_data__WEBPACK_IMPORTED_MODULE_2__["default"].document(data.toString());
      return electron__WEBPACK_IMPORTED_MODULE_4__["ipcRenderer"].send('request-assets', {
        project: common_data__WEBPACK_IMPORTED_MODULE_2__["default"].active_file()
      });
    };
  }

  add(file) {
    return () => {
      return lib_text_insert__WEBPACK_IMPORTED_MODULE_3__["default"].at(`![](${file.path})`);
    };
  }

  view() {
    var file;
    return mithril__WEBPACK_IMPORTED_MODULE_0__('nav', mithril__WEBPACK_IMPORTED_MODULE_0__('.title', 'Recent Projects'), (function() {
      var i, len, ref, results;
      ref = common_data__WEBPACK_IMPORTED_MODULE_2__["default"].files();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        file = ref[i];
        results.push(mithril__WEBPACK_IMPORTED_MODULE_0__('a', {
          href: '#',
          class: this.classes(file),
          onclick: this.click(file)
        }, file.name));
      }
      return results;
    }).call(this), common_data__WEBPACK_IMPORTED_MODULE_2__["default"].active_file() ? mithril__WEBPACK_IMPORTED_MODULE_0__('.title', 'Assets') : void 0, (function() {
      var i, len, ref, results;
      ref = common_data__WEBPACK_IMPORTED_MODULE_2__["default"].assets();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        file = ref[i];
        results.push(mithril__WEBPACK_IMPORTED_MODULE_0__('a.asset', {
          href: '#',
          onclick: this.add(file)
        }, mithril__WEBPACK_IMPORTED_MODULE_0__('span.icon.far fa-file-image'), mithril__WEBPACK_IMPORTED_MODULE_0__('span', file.name), mithril__WEBPACK_IMPORTED_MODULE_0__('.img', {
          style: {
            right: `-${Math.min(file.width, 200)}px`
          }
        }, mithril__WEBPACK_IMPORTED_MODULE_0__('img', {
          src: file.path
        }), mithril__WEBPACK_IMPORTED_MODULE_0__('.size', `${file.width}x${file.height}`))));
      }
      return results;
    }).call(this));
  }

});


/***/ }),

/***/ "./src/components/textarea.coffee":
/*!****************************************!*\
  !*** ./src/components/textarea.coffee ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var mithril__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mithril */ "mithril");
/* harmony import */ var mithril__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mithril__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lib_hotkey_heading__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lib/hotkey_heading */ "./src/lib/hotkey_heading.coffee");
/* harmony import */ var lib_hotkey_wrap__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lib/hotkey_wrap */ "./src/lib/hotkey_wrap.coffee");
/* harmony import */ var common_data__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! common/data */ "./src/common/data.coffee");
/* harmony import */ var lib_text_insert__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! lib/text_insert */ "./src/lib/text_insert.coffee");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! electron */ "electron");
/* harmony import */ var electron__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(electron__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! fs */ "fs");
/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! path */ "path");
/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_7__);
var Textarea;

















/* harmony default export */ __webpack_exports__["default"] = (Textarea = class Textarea {
  constructor() {
    this.attrs = this.attrs.bind(this);
    this.view = this.view.bind(this);
  }

  onupdate(vnode) {
    //if Data.selectionStart() != false ||
    //Data.selectionEnd() != false
    //vnode.dom.focus()
    if (common_data__WEBPACK_IMPORTED_MODULE_3__["default"].selectionStart() !== false) {
      vnode.dom.selectionStart = common_data__WEBPACK_IMPORTED_MODULE_3__["default"].selectionStart();
      common_data__WEBPACK_IMPORTED_MODULE_3__["default"].selectionStart(false);
    }
    if (common_data__WEBPACK_IMPORTED_MODULE_3__["default"].selectionEnd() !== false) {
      vnode.dom.selectionEnd = common_data__WEBPACK_IMPORTED_MODULE_3__["default"].selectionEnd();
      return common_data__WEBPACK_IMPORTED_MODULE_3__["default"].selectionEnd(false);
    }
  }

  attrs() {
    var attrs;
    return attrs = {
      ondrop: (ev) => {
        var basename, date, epoch, ext, file, i, len, modified_asset_path, original_asset_path, ref, results;
        ev.preventDefault();
        ref = ev.dataTransfer.files;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          file = ref[i];
          date = new Date().getTime();
          epoch = Math.round(date / 1000);
          ext = path__WEBPACK_IMPORTED_MODULE_7___default.a.extname(file.path);
          basename = path__WEBPACK_IMPORTED_MODULE_7___default.a.basename(file.path);
          modified_asset_path = `${common_data__WEBPACK_IMPORTED_MODULE_3__["default"].home()}/${common_data__WEBPACK_IMPORTED_MODULE_3__["default"].active_file()}/assets/modified/${epoch}${ext}`;
          original_asset_path = `${common_data__WEBPACK_IMPORTED_MODULE_3__["default"].home()}/${common_data__WEBPACK_IMPORTED_MODULE_3__["default"].active_file()}/assets/original/${basename}`;
          // save modified
          fs__WEBPACK_IMPORTED_MODULE_6___default.a.copyFile(file.path, modified_asset_path, (err) => {
            if (err) {
              console.log('copyFile', err);
            }
            lib_text_insert__WEBPACK_IMPORTED_MODULE_4__["default"].at(`\n![](${modified_asset_path})`);
            return mithril__WEBPACK_IMPORTED_MODULE_0__["redraw"](true);
          });
          //save orginal
          fs__WEBPACK_IMPORTED_MODULE_6___default.a.copyFile(file.path, original_asset_path, (err) => {
            if (err) {
              return console.log('copyFile', err);
            }
          });
          common_data__WEBPACK_IMPORTED_MODULE_3__["default"].keep_selection();
          results.push(electron__WEBPACK_IMPORTED_MODULE_5__["ipcRenderer"].send('request-assets', {
            project: common_data__WEBPACK_IMPORTED_MODULE_3__["default"].active_file()
          }));
        }
        return results;
      },
      ondragover: (ev) => {
        return ev.preventDefault();
      },
      onclick: (e) => {
        var el, els, i, len, results;
        // TODO - Make selection detection more robust
        // https://stackoverflow.com/questions/46651479/textarea-selection-change
        common_data__WEBPACK_IMPORTED_MODULE_3__["default"]._selectionStart(e.target.selectionStart || 0);
        common_data__WEBPACK_IMPORTED_MODULE_3__["default"]._selectionEnd(e.target.selectionEnd || 0);
        common_data__WEBPACK_IMPORTED_MODULE_3__["default"].active_asset(null);
        // deselect images in markdown preview
        els = document.querySelectorAll('.preview img');
        results = [];
        for (i = 0, len = els.length; i < len; i++) {
          el = els[i];
          results.push(el.classList.remove('selected'));
        }
        return results;
      },
      onkeydown: (e) => {
        var data, end_at, start_at;
        if (e.key === 'Meta') {
          common_data__WEBPACK_IMPORTED_MODULE_3__["default"].meta(true);
        }
        if (e.key === 'Shift') {
          common_data__WEBPACK_IMPORTED_MODULE_3__["default"].shift(true);
        }
        if (common_data__WEBPACK_IMPORTED_MODULE_3__["default"].meta()) {
          start_at = e.target.selectionStart;
          end_at = e.target.selectionEnd;
          if (['1', '2', '3', '4', '5'].indexOf(e.key) !== -1) {
            data = lib_hotkey_heading__WEBPACK_IMPORTED_MODULE_1__["default"].insert(common_data__WEBPACK_IMPORTED_MODULE_3__["default"].document(), parseInt(e.key), start_at);
            common_data__WEBPACK_IMPORTED_MODULE_3__["default"].document(data.value);
            common_data__WEBPACK_IMPORTED_MODULE_3__["default"].selectionStart(data.selectionStart);
            return common_data__WEBPACK_IMPORTED_MODULE_3__["default"].selectionEnd(data.selectionEnd);
          } else if (e.key === 'b') {
            data = lib_hotkey_wrap__WEBPACK_IMPORTED_MODULE_2__["default"].insert(common_data__WEBPACK_IMPORTED_MODULE_3__["default"].document(), start_at, end_at, '**', '**');
            common_data__WEBPACK_IMPORTED_MODULE_3__["default"].document(data.value);
            common_data__WEBPACK_IMPORTED_MODULE_3__["default"].selectionStart(data.selectionStart);
            return common_data__WEBPACK_IMPORTED_MODULE_3__["default"].selectionEnd(data.selectionEnd);
          } else if (e.key === 'f') {
            data = lib_hotkey_wrap__WEBPACK_IMPORTED_MODULE_2__["default"].insert(common_data__WEBPACK_IMPORTED_MODULE_3__["default"].document(), start_at, end_at, "<strong class='r'>", "</strong>");
            common_data__WEBPACK_IMPORTED_MODULE_3__["default"].document(data.value);
            common_data__WEBPACK_IMPORTED_MODULE_3__["default"].selectionStart(data.selectionStart);
            return common_data__WEBPACK_IMPORTED_MODULE_3__["default"].selectionEnd(data.selectionEnd);
          } else if (e.key === 'd') {
            data = lib_hotkey_wrap__WEBPACK_IMPORTED_MODULE_2__["default"].insert(common_data__WEBPACK_IMPORTED_MODULE_3__["default"].document(), start_at, end_at, "<strong class='h'>", "</strong>");
            common_data__WEBPACK_IMPORTED_MODULE_3__["default"].document(data.value);
            common_data__WEBPACK_IMPORTED_MODULE_3__["default"].selectionStart(data.selectionStart);
            return common_data__WEBPACK_IMPORTED_MODULE_3__["default"].selectionEnd(data.selectionEnd);
          }
        }
      },
      onkeyup: (e) => {
        if (e.key === 'Meta') {
          common_data__WEBPACK_IMPORTED_MODULE_3__["default"].meta(false);
        }
        if (e.key === 'Shift') {
          return common_data__WEBPACK_IMPORTED_MODULE_3__["default"].shift(false);
        }
      },
      oninput: (e) => {
        return common_data__WEBPACK_IMPORTED_MODULE_3__["default"].document(e.target.value);
      },
      value: common_data__WEBPACK_IMPORTED_MODULE_3__["default"].document()
    };
  }

  view() {
    return mithril__WEBPACK_IMPORTED_MODULE_0__('textarea.pane.editor#editor', this.attrs());
  }

});


/***/ }),

/***/ "./src/lib/hotkey_heading.coffee":
/*!***************************************!*\
  !*** ./src/lib/hotkey_heading.coffee ***!
  \***************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var lib_hotkey_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lib/hotkey_util */ "./src/lib/hotkey_util.coffee");
var HotkeyHeading;



/* harmony default export */ __webpack_exports__["default"] = (HotkeyHeading = class HotkeyHeading {
  static prepend_str(level) {
    var i, j, ref, str;
    str = '';
    for (i = j = 1, ref = level; (1 <= ref ? j <= ref : j >= ref); i = 1 <= ref ? ++j : --j) {
      str += '#';
    }
    str += ' ';
    return str;
  }

  static insert(value, level, start_at) {
    var char, data, index, lines, new_start_at, regex, result, str;
    lines = value.split("\n");
    str = HotkeyHeading.prepend_str(level);
    [index, char] = Object(lib_hotkey_util__WEBPACK_IMPORTED_MODULE_0__["find_line"])(lines, start_at);
    console.log(index, char);
    if (lines[index].match(/^#+/)) { // heading already exists
      result = lines[index].match(/^#+/);
      if (result[0].length === level) { // same heading so lets remove it
        result = lines[index].match(/^#+\s*/);
        regex = new RegExp(`^${result[0]}`);
        lines[index] = lines[index].replace(regex, '');
        new_start_at = start_at - result[0].length; // different heading so lets replace it
      } else {
        // we need to include the spaces
        result = lines[index].match(/^#+\s*/);
        regex = new RegExp(`^${result[0]}`);
        lines[index] = lines[index].replace(regex, str);
        new_start_at = start_at + (str.length - result[0].length); // add a new heading
      }
    } else {
      lines[index] = `${str}${lines[index]}`;
      new_start_at = start_at + str.length;
    }
    return data = {
      value: lines.join("\n"),
      selectionStart: new_start_at,
      selectionEnd: new_start_at
    };
  }

});


/***/ }),

/***/ "./src/lib/hotkey_util.coffee":
/*!************************************!*\
  !*** ./src/lib/hotkey_util.coffee ***!
  \************************************/
/*! exports provided: find_line */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "find_line", function() { return find_line; });
// returns [index,char]
//  - index is the position in the array
//  - char is the is the accumlative character count to the start of the line.
//    so we can calulate offset
var find_line = function(lines, value) {
  var count, i, index, j, len, line, prev_count;
  index = false;
  prev_count = 0;
  count = 0;
  for (i = j = 0, len = lines.length; j < len; i = ++j) {
    line = lines[i];
    prev_count = count;
    count += line.length + 1;
    if (value <= count) {
      index = i;
      break;
    }
  }
  return [index, prev_count];
};


/***/ }),

/***/ "./src/lib/hotkey_wrap.coffee":
/*!************************************!*\
  !*** ./src/lib/hotkey_wrap.coffee ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var lib_hotkey_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lib/hotkey_util */ "./src/lib/hotkey_util.coffee");
var HotkeyWrap;



// TODO - Edge Cases
// - spanning multiple lines
// - no selection
/* harmony default export */ __webpack_exports__["default"] = (HotkeyWrap = class HotkeyWrap {
  static insert(value, start_at, end_at, str_start, str_end) {
    var data, end_char, end_index, end_sub_0, end_sub_1, lines, local_end, local_start, new_end_at, new_start_at, start_char, start_index, start_sub_0, start_sub_1;
    lines = value.split("\n");
    [start_index, start_char] = Object(lib_hotkey_util__WEBPACK_IMPORTED_MODULE_0__["find_line"])(lines, start_at);
    [end_index, end_char] = Object(lib_hotkey_util__WEBPACK_IMPORTED_MODULE_0__["find_line"])(lines, end_at);
    // The brown fox XjumpsY over the fence.
    local_start = start_at - start_char;
    console.log({
      start_len: lines[start_index].length,
      end_len: lines[end_index].length
    });
    console.log({
      start_index: start_index,
      end_index: end_index
    });
    console.log({
      start_char: start_char,
      end_char: end_char
    });
    console.log({
      start_at: start_at,
      end_at: end_at
    });
    console.log({
      local_start: local_start
    });
    // The brown fox X
    start_sub_0 = lines[start_index].substring(0, local_start);
    console.log(['The brown fox X', lines[start_index].substring(0, local_start)]);
    // jumpsY over the fence.
    start_sub_1 = lines[start_index].substring(local_start, lines[start_index].length);
    console.log(['jumpsY over the fence.', start_at, lines[start_index].substring(start_at, lines[start_index].length)]);
    // The brown fox **
    start_sub_0 += str_start;
    console.log(['The brown fox **', start_sub_0]);
    // The brown fox **jumYps over the fence.
    lines[start_index] = [start_sub_0, start_sub_1].join('');
    console.log(['The brown fox **jumYps over the fence.', [start_sub_0, start_sub_1].join('')]);
    console.log('end_at:prev', end_at);
    if (start_index === end_index) {
      // The endSelection shifted 2
      end_at += str_start.length;
    }
    console.log('end_at:shifted', end_at);
    local_end = end_at - end_char;
    console.log({
      local_end: local_end
    });
    // The brown fox **jumpsY
    end_sub_0 = lines[end_index].substring(0, local_end);
    console.log(['The brown fox **jumpsY', lines[end_index].substring(0, local_end)]);
    // over the fence.
    end_sub_1 = lines[end_index].substring(local_end, lines[end_index].length);
    console.log(['over the fence.', lines[end_index].substring(local_end, lines[end_index].length)]);
    // The brown fox **jumps**
    end_sub_0 += str_end;
    console.log(['The brown fox **jumps**', end_sub_0]);
    // The brown fox **jumps** over the fence.
    lines[end_index] = [end_sub_0, end_sub_1].join('');
    console.log(['The brown fox **jumps** over the fence.', [end_sub_0, end_sub_1].join('')]);
    console.log("<><><><><><><><><><>");
    new_start_at = start_at + str_start.length;
    new_end_at = end_at + str_end.length;
    return data = {
      value: lines.join("\n"),
      selectionStart: new_start_at,
      selectionEnd: new_end_at
    };
  }

});


/***/ }),

/***/ "./src/lib/text_insert.coffee":
/*!************************************!*\
  !*** ./src/lib/text_insert.coffee ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var common_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! common/data */ "./src/common/data.coffee");
/* harmony import */ var lib_hotkey_util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lib/hotkey_util */ "./src/lib/hotkey_util.coffee");
var TextInsert;





// Insert text at in document
/* harmony default export */ __webpack_exports__["default"] = (TextInsert = class TextInsert {
  static at(text) {
    var char, index, lines, local, start_at, sub_0, sub_1, target;
    target = document.getElementById('editor');
    start_at = target.selectionStart;
    lines = common_data__WEBPACK_IMPORTED_MODULE_0__["default"].document().split("\n");
    [index, char] = Object(lib_hotkey_util__WEBPACK_IMPORTED_MODULE_1__["find_line"])(lines, start_at);
    local = start_at - char;
    sub_0 = lines[index].substring(0, local);
    sub_0 += text;
    sub_1 = lines[index].substring(local, lines[index].length);
    lines[index] = [sub_0, sub_1].join('');
    return common_data__WEBPACK_IMPORTED_MODULE_0__["default"].document(lines.join('\n'));
  }

});


/***/ }),

/***/ "./src/views/article.coffee":
/*!**********************************!*\
  !*** ./src/views/article.coffee ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var mithril__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mithril */ "mithril");
/* harmony import */ var mithril__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(mithril__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var components_sidebar__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! components/sidebar */ "./src/components/sidebar.coffee");
/* harmony import */ var components_article__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! components/article */ "./src/components/article.coffee");
/* harmony import */ var components_infobar__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! components/infobar */ "./src/components/infobar.coffee");
/* harmony import */ var common_data__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! common/data */ "./src/common/data.coffee");
var ArticleView;











/* harmony default export */ __webpack_exports__["default"] = (ArticleView = class ArticleView {
  constructor() {
    this.classes = this.classes.bind(this);
  }

  classes() {
    if (common_data__WEBPACK_IMPORTED_MODULE_4__["default"].publisher_preview()) {
      return 'ppreview';
    } else {
      return '';
    }
  }

  view() {
    return mithril__WEBPACK_IMPORTED_MODULE_0__('main', {
      class: this.classes()
    }, !common_data__WEBPACK_IMPORTED_MODULE_4__["default"].publisher_preview() ? mithril__WEBPACK_IMPORTED_MODULE_0__(components_sidebar__WEBPACK_IMPORTED_MODULE_1__["default"]) : void 0, common_data__WEBPACK_IMPORTED_MODULE_4__["default"].active_file() ? [mithril__WEBPACK_IMPORTED_MODULE_0__(components_article__WEBPACK_IMPORTED_MODULE_2__["default"]), !common_data__WEBPACK_IMPORTED_MODULE_4__["default"].publisher_preview() ? mithril__WEBPACK_IMPORTED_MODULE_0__(components_infobar__WEBPACK_IMPORTED_MODULE_3__["default"]) : void 0] : void 0);
  }

});


/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("electron");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),

/***/ "mithril":
/*!**************************!*\
  !*** external "mithril" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("mithril");

/***/ }),

/***/ "moment":
/*!*************************!*\
  !*** external "moment" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("moment");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),

/***/ "remarkable":
/*!*****************************!*\
  !*** external "remarkable" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("remarkable");

/***/ })

/******/ });