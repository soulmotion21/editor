/**
 * Title : gbcEditor v0.9 beta
 * Author : David Kim
 * date : 2018.10.02
 * description : A simple rich-text editor
 */

// Define module
(function (global, factory) {
  if (typeof define === 'function' && define.amd) { // AMD
    define(factory);
  } else if (typeof exports === 'object' && module.exports) { // CommonJS
    module.exports = factory;
  } else {
    global.gbcEditor = factory(); // Browser globals (global is window)
  }

}(this, function () {
  'use strict';

  // Global object
  var gbcEditor = {};

  // Default merge with options
  var _extends = function (defaults, options) {
    var extended = {};
    var prop;
    for (prop in defaults) {
      if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
        extended[prop] = defaults[prop];
      }
    }
    for (prop in options) {
      if (Object.prototype.hasOwnProperty.call(options, prop)) {
        extended[prop] = options[prop];
      }
    }
    return extended;
  };

  var defaultParagraphSeparatorString = 'defaultParagraphSeparator';
  var formatBlock = 'formatBlock';
  var bCodeviewActive = false;

  // Default elements classList
  var defaultClasses = {
    toolBar: 'gbc-editor-toolbar',
    button: 'gbc-editor-button',
    content: 'gbc-editor-content',
    selected: 'gbc-editor-button-selected',
    select: 'gbc-editor-select'
  };

  // Default editor button functional settings
  var defaultActions = {
    bold: {
      icon: '<strong>B</strong>',
      title: 'Bold',
      state: function state() {
        return queryCommandState('bold');
      },
      result: function result() {
        return exec('bold');
      }
    },
    italic: {
      icon: '<i>I</i>',
      title: 'Italic',
      state: function state() {
        return queryCommandState('italic');
      },
      result: function result() {
        return exec('italic');
      }
    },
    underline: {
      icon: '<u>U</u>',
      title: 'Underline',
      state: function state() {
        return queryCommandState('underline');
      },
      result: function result() {
        return exec('underline');
      }
    },
    strikethrough: {
      icon: '<strike>S</strike>',
      title: 'Strike-through',
      state: function state() {
        return queryCommandState('strikeThrough');
      },
      result: function result() {
        return exec('strikeThrough');
      }
    },
    heading1: {
      icon: '<b>H<sub>1</sub></b>',
      title: 'Heading 1',
      result: function result() {
        return exec(formatBlock, '<h1>');
      }
    },
    heading2: {
      icon: '<b>H<sub>2</sub></b>',
      title: 'Heading 2',
      result: function result() {
        return exec(formatBlock, '<h2>');
      }
    },
    fontsize: {
      element: '<select>fontSize</select>',
      icon: null,
      title: 'fontSize',
      result: function result() {
        return fnFontSize();
      }
    },
    fontcolor: {
      element: '<div></div>',
      title: 'ForeColor',
      result: function result() {
        return fnFontColor();
      }
    },
    fontbgcolor:{
      element: '<div></div>',
      title: 'backColor',
      result: function result() {
        return fnBackColor();
      }
    },
    justifyleft: {
      icon: '<i class="fas fa-align-left"></i>',
      title: 'Justify left',
      result: function result() {
        return exec('justifyleft');
      }
    },
    justifycenter: {
      icon: '<i class="fas fa-align-center"></i>',
      title: 'Justify center',
      result: function result() {
        return exec('justifycenter');
      }
    },
    justifyright: {
      icon: '<i class="fas fa-align-right"></i>',
      title: 'Justify right',
      result: function result() {
        return exec('justifyright');
      }
    },
    olist: {
      icon: '<i class="fas fa-list-ol"></i>',
      title: 'Ordered List',
      result: function result() {
        return exec('insertOrderedList');
      }
    },
    ulist: {
      icon: '<i class="fas fa-list-ul"></i>',
      title: 'Unordered List',
      result: function result() {
        return exec('insertUnorderedList');
      }
    },
    code: {
      icon: '<i class="fas fa-code"></i>',
      title: 'Code',
      result: function result() {
        return false;
      }
    },
    link: {
      icon: '<i class="fas fa-link"></i>',
      title: 'Link',
      result: function result() {
        var url = window.prompt('Enter the link URL');
        if (url) exec('createLink', url);
      }
    },
  };

  // Default event handler
  var addEventListenerHandler = function addEventListenerHandler(parent, type, listener) {
    return parent.addEventListener(type, listener);
  };
  var removeEventListenerHandler = function removeEventListenerHandler(parent, type, listener) {
    return parent.removeEventListener(type, listener);
  };

  var appendChild = function appendChild(parent, child) {
    return parent.appendChild(child);
  };
  var createElement = function createElement(tag) {
    return document.createElement(tag);
  };

  /**
   * document.queryCommandState : Get text style around cursor
   * @param command
   * @returns {boolean}
   */
  var queryCommandState = function queryCommandState(command) {
    return document.queryCommandState(command);
  };

  /**
   * document.queryCommandValue
   * @param command
   * @returns {string}
   */
  var queryCommandValue = function queryCommandValue(command) {
    return document.queryCommandValue(command);
  };

  // Excute entered command
  var exec = function exec(command) {
    var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    return document.execCommand(command, false, value);
  };

  var content = null;
  var contentCode = null;

  /**
   * Toggle codeview mode : View codes in textarea
   */
  var toggleCodeView = function () {
    // Entered codes save
    var code_html = null;

    if (bCodeviewActive === false) { // normal mode

      content.style.display = 'block';
      content.classList.add('active');
      contentCode.style.display = 'none';
      contentCode.classList.remove('active');

      code_html = contentCode.value.trim().replace(/<\/p>(?=[^\n])/gi, '<\/p>\n');
      content.innerHTML = code_html;
      bCodeviewActive = true;

    } else { // codeview mode
      content.style.display = 'none';
      content.classList.remove('active');
      contentCode.style.display = 'block';
      contentCode.classList.add('active');

      var ec = {'&amp;': '&', '&nbsp;': '\u00A0', "&quot;": "'", '&lt;': '<', '&gt;': '>'};
      code_html = content.innerHTML.replace(/&[a-z]+;/g, function (m) {
        return (typeof ec[m] === 'string') ? ec[m] : m;
      });

      contentCode.value = code_html.trim().length > 0 ? code_html : '<p></p>';
      bCodeviewActive = false;
    }

  };

  var fnFontColor = function () {
    var btnSelectColor = document.createElement('div');
    btnSelectColor.textContent = 'C';
    btnSelectColor.className = 'btnSelectColor';

    var selectColor = document.createElement('div');
    selectColor.className = 'box-inner-layer';

    var colorList = ['#ff0000', '#ff5e00', '#ffe400', '#abf200', '#00d8ff', '#0055ff', '#6600ff', '#ff00dd', '#4e555b', '#000000', '#ffffff'];

    var list = '<div class="font-color-list">' + '<ul>';

    for (var j = 0; j < colorList.length; j++) {
      var color = colorList[j];
      list += '<li>' +
        '   <button type="button" class="' + (/ffffff/.test(color) ? ' color_white' : '') + '" data-value="' + color + '" title="' + color + '" style="background-color:' + color + ';"></button>' +
        '</li>';
    }

    list += '</ul>' + '</div>';
    selectColor.innerHTML = list;

    appendChild(document.querySelector('.gbc-editor-toolbar'), btnSelectColor);
    appendChild(document.querySelector('.btnSelectColor'), selectColor);
    return selectColor;

  };

  var fnFontSize = function () {
    var selectFont = document.createElement('select');
    selectFont.classList.add('gbc-editor-select');

    var sizeList = [1, 2, 3, 4, 5, 6, 7];

    var list = '<option selected="selected">Size</option>';
    list = list + '<option value="' + sizeList[0] + '">' + (sizeList[0] + 11) + 'px' + '</option>';
    list = list + '<option value="' + sizeList[1] + '">' + (sizeList[1] + 11) + 'px' + '</option>';
    list = list + '<option value="' + sizeList[2] + '">' + (sizeList[2] + 14) + 'px' + '</option>';
    list = list + '<option value="' + sizeList[3] + '">' + (sizeList[3] + 14) + 'px' + '</option>';
    list = list + '<option value="' + sizeList[4] + '">' + (sizeList[4] + 19) + 'px' + '</option>';
    list = list + '<option value="' + sizeList[5] + '">' + (sizeList[5] + 26) + 'px' + '</option>';
    list = list + '<option value="' + sizeList[6] + '">' + (sizeList[6] + 31) + 'px' + '</option>';

    selectFont.innerHTML = list;
    appendChild(document.querySelector('.gbc-editor-toolbar'), selectFont);
    return selectFont;

  };

  var fnBackColor = function() {
    var btnSelectColor = document.createElement('div');
    btnSelectColor.textContent = 'BG';
    btnSelectColor.className = 'btnSelectBackColor';

    var selectBackColor = document.createElement('div');
    selectBackColor.className = 'box-inner-layer';

    var colorList = ['#ff0000', '#ff5e00', '#ffe400', '#abf200', '#00d8ff', '#0055ff', '#6600ff', '#ff00dd', '#4e555b', '#000000', '#ffffff'];

    var list = '<div class="font-back-color-list">' + '<ul>';

    for (var j = 0; j < colorList.length; j++) {
      var color = colorList[j];
      list += '<li>' +
        '   <button type="button" class="' + (/ffffff/.test(color) ? ' color_white' : '') + '" data-value="' + color + '" title="' + color + '" style="background:' + color + ';">A</button>' +
        '</li>';
    }

    list += '</ul>' + '</div>';
    selectBackColor.innerHTML = list;


    appendChild(document.querySelector('.gbc-editor-toolbar'), btnSelectColor);
    appendChild(document.querySelector('.btnSelectBackColor'), selectBackColor);
    return btnSelectColor;

  };

  /**
   * Editor initialize function
   * @param settings
   */
  gbcEditor.init = function (settings) {
    console.log('* initialized gbcEditor ');

    // Toolbar button action
    var actions = settings.actions ? settings.actions.map(function (action) {
      if (typeof action === 'string') {
        return defaultActions[action];
      } else if (defaultActions[action.name]) {
        return _extends({}, defaultActions[action.name], action);
      } else {
        return action;
      }

    }) : Object.keys(defaultActions).map(function (action) {
      return defaultActions[action];
    });

    var classes = _extends({}, defaultClasses, settings.classes);
    var defaultParagraphSeparator = settings[defaultParagraphSeparatorString] || 'p'; // 1row paragraph

    // Create toolbar element
    var toolBar = createElement('div');
    var element = document.getElementById(settings.element);
    toolBar.className = classes.toolBar;
    appendChild(element, toolBar);

    // Create editor contents
    content = element.content = createElement('div'); // 1row paragraph
    content.contentEditable = true;
    content.className = classes.content;

    // Append editor element
    appendChild(element, content);

    contentCode = element.content = createElement('textarea');
    contentCode.className = classes.content;

    // Append textarea for codeview
    appendChild(element, contentCode);

    // Text input on editor
    content.oninput = function (_ref) {
      var firstChild = _ref.target.firstChild;

      /**
       * nodeType
       * type1 : Node.ELEMENT_NODE
       * type3 : Node.TEXT_NODE
       */
      if (firstChild && firstChild.nodeType === 3) { // Node.TEXT_NODE
        exec(formatBlock, '<' + defaultParagraphSeparator + '>');
      } else if (content.innerHTML === '<br>') {
        content.innerHTML = '';
      }
    };

    // Keyboard input on editor
    content.onkeydown = function (event) {
      if (event.key === 'Tab') {
        event.preventDefault();
      } else if (event.key === 'Enter' && queryCommandValue(formatBlock) === 'blockquote') {
        setTimeout(function () {
          return exec(formatBlock, '<' + defaultParagraphSeparator + '>');
        }, 0);
      }
    };

    // Hide layer when clicking content
    content.onclick = function () {
      fnHideAllLayer();
    };

    toggleCodeView();

    // Create editor button settings from defaultActions
    actions.forEach(function (action) {
      var button = null;

      if (action.element) {
        return action.result();

      } else {
        button = createElement('button');
        button.className = classes.button;
        button.innerHTML = action.icon;
        button.title = action.title;
        button.setAttribute('type', 'button');

        // Return defaultActions.result when click buttons
        button.onclick = function () {
          if (button.title === 'Code') {
            toggleCodeView();
          }

          return action.result() && content.focus();
        };

      }

      // Button event handlers
      var handler = null;

      if (action.state) {
        handler = function handler() {

          if (action.state()) {
            return button.classList['add'](classes.selected);
          } else {
            return button.classList['remove'](classes.selected);
          }

        };
        addEventListenerHandler(content, 'keyup', handler);
        addEventListenerHandler(content, 'mouseup', handler);
        addEventListenerHandler(button, 'click', handler);

      } else {
        if (bCodeviewActive === false) {
          addEventListenerHandler(content, 'keyup', handler);
          addEventListenerHandler(content, 'mouseup', handler);
          addEventListenerHandler(button, 'click', handler);
        } else {
          //todo : Improve ux for prevent click while code view mode
          removeEventListenerHandler(button, 'click', handler)
        }
      }

      // Append buttons in toolbar
      appendChild(toolBar, button);

      return handler;

    });

    if (settings.styleWithCSS) exec('styleWithCSS');

    // Change font size
    document.querySelector('.gbc-editor-select').addEventListener('change', function (e) {
      var size = e.currentTarget[e.currentTarget.selectedIndex].value;

      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range); // Restore previous mouse cursor

      document.execCommand('FontSize', false, size);

    });

    var range = null;

    // Change color handler
    function fnColorPickup(e) {
      e.preventDefault();
      e.stopPropagation();

      var value = e.currentTarget.dataset.value;
      document.querySelector('.gbc-editor-content').focus(); // Focus editor content
      document.querySelector('.box-inner-layer').classList.remove('active');

      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range); // Restore previous mouse cursor

      document.execCommand('foreColor',false, value);

      return value;
    }

    // Change color handler
    function fnColorBackPickup(e) {
      e.preventDefault();
      e.stopPropagation();

      var value = e.currentTarget.dataset.value;
      document.querySelector('.gbc-editor-content').focus(); // Focus editor content
      document.querySelector('.box-inner-layer').classList.remove('active');

      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range); // Restore previous mouse cursor

      document.execCommand('backColor',false, value);

      return value;

    }

    // Get selection, range
    function fnSelection() {
      var selection = window.getSelection();

      // Get mouse drag selection
      if (selection.rangeCount > 0) {
        range = selection.getRangeAt(0);
      }

    }

    function fnHideAllLayer() {
      document.querySelectorAll('.box-inner-layer').forEach(function (arr) {
        arr.classList.remove('active');
      });
    }

    // Range extract when editor area looses focus
    document.querySelector('.gbc-editor-content.active').addEventListener('blur', function () {
      fnSelection();
    });

    document.querySelectorAll('.font-color-list li button').forEach(function (a, i) {
      a.addEventListener('click', fnColorPickup);
    });

    document.querySelectorAll('.font-back-color-list li button').forEach(function (a, i) {
      a.addEventListener('click', fnColorBackPickup);
    });

    // Handler for font color layer
    document.querySelector('.btnSelectColor').addEventListener('click', function (e) {
      if (e.currentTarget.children[0].classList.contains('active')) {
        fnHideAllLayer();
        this.children[0].classList.remove('active');
      } else {
        fnHideAllLayer();
        this.children[0].classList.add('active');
      }

    });

    // Handler for font back color layer
    document.querySelector('.btnSelectBackColor').addEventListener('click', function (e) {
      if (e.currentTarget.children[0].classList.contains('active')) {
        fnHideAllLayer();
        this.children[0].classList.remove('active');
      } else {
        fnHideAllLayer();
        this.children[0].classList.add('active');
      }

    });

  };

  // return editor object
  return gbcEditor;

}));
