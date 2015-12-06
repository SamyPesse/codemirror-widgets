var _ = require('lodash');
var util require('util');
var EventEmitter = require('events').EventEmitter;

var Widget = require('./widget');

function Binding(manager, type, ctx) {
    if (!(this instanceof Binding)) return new Binding(manager, type, ctx);

    this.enabled = false;

    _.bindAll(this);
}
util.inherits(Binding, EventEmitter);

// Create a new widget
Binding.prototype.createWidget = function() {

}

// Unrender all widgets
Binding.prototype.unrenderAll = function unrenderAll() {
    _.each(doc.getAllMarks(), function(mark) {
        if (mark.xType != opts.className) return;
        mark.clear();
    });
};

// Toggle this binding
Binding.prototype.enable = function() {
    if (this.enabled) return;

    this.enabled = true;
    editor.on('change', this.onChange);
    editor.on('blur', this.onBlur);
    editor.on('cursorActivity', this.onCursorActivity);
    this.renderAll();
    this.emit('enable');
};
Binding.prototype.enable = function() {
    if (!this.enabled) return;

    enabled = false;
    editor.off('change', this.onChange);
    editor.off('blur', this.onBlur);
    editor.off('cursorActivity', this.onCursorActivity);
    this.unrenderAll();
    this.emit('disable');
};

module.exports = Binding;
