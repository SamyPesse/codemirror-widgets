var _ = require('lodash');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var utils = require('./utils');
var Manager = require('./manager');

function WidgetType(manager, opts) {
    this.id = _.uniqueId('widgetsType');

    this.manager = manager;
    this.opts = opts || {};
    this.enabled = false;

    _.bindAll(this);
}
util.inherits(WidgetType, EventEmitter);

WidgetType.prototype.className = 'widget';

// Return all occurrences in a text
WidgetType.prototype.find = function(text) {
    return [];
};

// Create the dom element for a specific widget
WidgetType.prototype.createElement = function(widget) {
    var el = document.createElement('span');
    return el;
};


// Return document
WidgetType.prototype.doc = function() {
    return this.manager.doc();
};

// Create a new widget
WidgetType.prototype.createWidget = function(range, props) {
    console.log('createWidget', this.className, range, props);
};

// Convert a list of matches in widgets
WidgetType.prototype.processMatches = function(from, matches) {
    var that = this;
    var fromIndex = from? editor.indexFromPos(from) : 0;
    var doc = this.doc();

    _.each(matches, function(match) {
        var range = {
            start: doc.posFromIndex(fromIndex + match.start),
            end: doc.posFromIndex(fromIndex + match.end)
        };

        that.createWidget(range, match.props);
    });
};

// Apply widgets in a specific sections
WidgetType.prototype.processRange = function(range) {
    // Extract text
    var text = this.doc().getRange(range.from, range.to);

    // Extract matches
    var matches = this.find(text, range);

    // Process matches
    this.processMatches(range.from, matches);
};

// Render all widgets
WidgetType.prototype.renderAll = function() {
    // Extract text
    var text = this.doc().getValue();

    // Extract matches
    var matches = this.find(text);

    this.processMatches({
        line: 0,
        ch: 0
    }, matches);
};

// Unrender all widgets
WidgetType.prototype.unrenderAll = function() {
    var that = this;

    _.each(this.doc().getAllMarks(), function(mark) {
        if (mark.xType != that.id) return;
        mark.clear();
    });
};

// Cleanup all markers in a specified range
// Return the largest range that contain markers
WidgetType.prototype.cleanupMarkers = function(origin) {
    var range = { from: origin.from, to: origin.to };

    _.each(this.doc().getAllMarks(), function(mark) {
        if (mark.xType != opts.className) return;

        var markRange = mark.find();
        if (!markRange) return;

        var isInRange = markRange.line? posInsideRange(markRange, origin) : rangesOverlap(markRange, origin);
        if (!isInRange) return;

        if (posIsBefore(markRange.from, range.from)) {
            range.from = markRange.from;
        }
        if (posIsBefore(range.to, markRange.to)) {
            range.to = markRange.to;
        }

        mark.clear();
    });

    // If nothing found, process the line itself
    if (rangesEqual(origin, range)) {
        // todo
    }

    return range;
};

// Blur from editor
WidgetType.prototype.onBlur = function() {

};

// Editor content changed
WidgetType.prototype.onChange = function(inst, change) {
    // Calcul range of change (change is pre-operation)
    var changeRange = {
        from: utils.Pos(change.from.line, change.from.ch),
        to: utils.Pos(change.to.line + (change.text.length - 1), change.to.ch + _.last(change.text).length)
    };

    // Determine large range and cleanup markers in it
    var range = this.cleanupMarkers(changeRange);
    this.processRange(range);
};


WidgetType.prototype.enable = function() {
    if (this.enabled) return;

    console.log('enable', this.className);
    this.enabled = true;
    this.manager.editor.on('change', this.onChange);
    this.manager.editor.on('blur', this.onBlur);
    this.renderAll();
};

WidgetType.prototype.disable = function() {
    if (!this.enabled) return;

    enabled = false;
    this.manager.editor.off('change', this.onChange);
    this.manager.editor.off('blur', this.onBlur);
    this.unrenderAll();
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
    var CustomType = function() {
        WidgetType.apply(this, arguments);
    };
    util.inherits(CustomType, WidgetType);

    CustomType.prototype = utils.composeMixins(
        CustomType.prototype,
        (type.mixins || []).concat([type]),
        {
            composables: ['enable', 'disable', 'onCursorActivity']
        }
    );

    CustomType.id = _.uniqueId('WidgetType');
    CustomType.setupOption = _.partial(setupOption, CustomType);

    return CustomType;
}


module.exports = {
    WidgetType: WidgetType,
    create: createType
};
