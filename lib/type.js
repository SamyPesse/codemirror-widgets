var _ = require('lodash');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var utils = require('./utils');
var Manager = require('./manager');

var COMPOSITION_MODEL = {
    composables: ['init', 'enable', 'disable']
};


function WidgetType(manager, opts) {
    if (!(this instanceof WidgetType)) return new WidgetType(manager, opts);

    this.manager = manager;
    this.opts = opts || {};
    this.enabled = false;

    _.bindAll(this);
}
util.inherits(WidgetType, EventEmitter);

WidgetType.prototype.className = 'widget';

// Initialize type
WidgetType.prototype.init = function() {

};

// Return all occurrences in a text
WidgetType.prototype.find = function(text) {
    return [];
};

// Create the dom element for a specific widget
WidgetType.prototype.createElement = function(widget) {
    var el = document.createElement('span');
    return el;
};


// Create a new widget
WidgetType.prototype.createWidget = function() {

}

// Unrender all widgets
WidgetType.prototype.unrenderAll = function unrenderAll() {
    _.each(doc.getAllMarks(), function(mark) {
        if (mark.xType != this.className) return;
        mark.clear();
    }, this);
};

// Toggle this binding
WidgetType.prototype.enable = function() {
    if (this.enabled) return;

    this.enabled = true;
    editor.on('change', this.onChange);
    editor.on('blur', this.onBlur);
    editor.on('cursorActivity', this.onCursorActivity);
    this.renderAll();
    this.emit('enable');
};
WidgetType.prototype.enable = function() {
    if (!this.enabled) return;

    enabled = false;
    editor.off('change', this.onChange);
    editor.off('blur', this.onBlur);
    editor.off('cursorActivity', this.onCursorActivity);
    this.unrenderAll();
    this.emit('disable');
};


// Define option to CodeMirror
function setupOption(Type, CodeMirror) {
    CodeMirror.defineOption(Type.prototype.className + 'Widget', false, function(cm, val, old) {
        if (old == CodeMirror.Init) old = false;
        if (val == old) return;

        // If editor has no manager, add one
        if (!cm._widgets) Manager(cm);

        if (val) {
            cm._widgets.enable(Type, val);
        } else {
            cm._widgets.disable(Type);
        }
    });
}

// Create an new type
function createType(type) {
    var mixins = (type.mixins || []).concat([type]);
    var CustomType = function() {
        CustomType.apply(this, arguments);
    };
    util.inherits(CustomType, WidgetType);

    CustomType.id = _.uniqueId('WidgetType');
    CustomType.setupOption = _.partial(setupOption, CustomType);

    return _.reduce(mixins, function(proto, mixin) {
        return utils.composeMixin(proto, mixin, COMPOSITION_MODEL);
    }, CustomType);

    return CustomType;
}


module.exports = {
    WidgetType: WidgetType,
    create: createType
};
