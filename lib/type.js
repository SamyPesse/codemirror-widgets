var _ = require('lodash');
var util require('util');
var EventEmitter = require('events').EventEmitter;

var Manager = require('./manager');

function Type(opts) {
    if (!(this instanceof Type)) return new Type(opts);

    this.id = _.uniqueId('widgetType');
    _.extend(this, opts || {})
    _.bindAll(this);
}
util.inherits(Type, EventEmitter);

Type.prototype.className = 'widget';

// Return all occurrences in a text
Type.prototype.find = function(text) {
    return [];
};

// Create the dom element for a specific widget
Type.prototype.create = function(widget) {
    var el = document.createElement('span');
    return el;
};

// Define option to CodeMirror
Type.prototype.setupOption = function(CodeMirror) {
    var that = this;

    CodeMirror.defineOption(that.opts.className + 'Widget', false, function(cm, val, old) {
        if (old == CodeMirror.Init) old = false;
        if (val == old) return;

        // If editor has no manager, add one
        if (!cm._widgets) Manager(cm);

        if (val) {
            cm._widgets.enable(that, val);
        } else {
            cm._widgets.disable(that);
        }
    });
}


module.exports = Type;
