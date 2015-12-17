var _ = require('lodash');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var utils = require('./utils');
var Manager = require('./manager');
var Widget = require('./widget');

function WidgetType(manager, opts) {
    this.id = _.uniqueId('widgetsType');

    this.manager = manager;
    this.editor = this.manager.editor;
    this.opts = opts || {};
    this.enabled = false;

    this.onChange = _.throttle(this._onChange, this.debounceWait);

    _.bindAll(this);
}
util.inherits(WidgetType, EventEmitter);

WidgetType.prototype.className = 'widget';
WidgetType.prototype.debounceWait = 600;

// Return all occurrences in a text
WidgetType.prototype.find = function(text) {
    return [];
};

// Compare props of markers
WidgetType.prototype.compareProps = function(p1, p2) {
    return _.isEqual(p1, p2);
};

// If edition is not inside a marker, detect section to process
// For example if the widget is inline, we can limit this to a single line
// Should return a range
WidgetType.prototype.findEditRange = function(range) {
    return range;
};

// Create the dom element for a specific widget
WidgetType.prototype.createElement = function(widget) {
    var el = document.createElement('span');
    return el;
};

// Create a new widget
WidgetType.prototype.createWidget = function(range, props) {
    var that = this;
    var markers, cursor, doc, exists;

    doc = this.doc();

    // Check if the marker already exists
    markers = doc.findMarksAt(range.from);
    exists = _.find(markers, function(marker) {
        return (!marker.unrendered &&
            marker.xType == that.id &&
            that.compareProps(marker.xProps, props));
    });
    if (exists) return;

    // Is cursor inside?
    cursor = doc.getCursor();
    if (utils.posInsideRange(cursor, range)) {
        this.unrenderRange(range, props);
    } else {
        var widget = new Widget(this, range, props);

        widget.marker.on('clear', function(_from, _to) {
            if (!that.enabled) return;

            that.unrenderRange(utils.Range(_from, _to), props);
        });

        that.prepareWidget(widget);
    }
};

// Prepare a widget
// Can be extend by mixin (see "menu")
WidgetType.prototype.prepareWidget = function(widget) {

}

// Render as text a marker
WidgetType.prototype.unrenderRange = function(range, props) {
    var doc = this.doc();
    var marker = this.bindMarker(doc.markText(range.from, range.to), props);
    this.manager.setUnrendered(marker);
}

// Bind a marker to be identifiable
WidgetType.prototype.bindMarker = function(marker, props) {
    marker.xProps = props;
    marker.xType = this.id;
    return marker;
};

// Create a marker for a widget
WidgetType.prototype.createWidgetMarker = function(from, to, props, opts) {
    var marker = this.doc().markText(from, to, _.extend(opts || {}, {
        clearOnEnter: true,
        atomic: true
    }));
    return this.bindMarker(marker, props);
};


// Convert a list of matches in widgets
WidgetType.prototype.processMatches = function(from, matches) {
    if (matches.length == 0) return;

    var that = this;

    that.editor.operation(function() {

        var fromIndex = from? that.editor.indexFromPos(from) : 0;
        var doc = that.doc();

        _.each(matches, function(match) {
            var range = utils.Range(
                doc.posFromIndex(fromIndex + match.start),
                doc.posFromIndex(fromIndex + match.end)
            );

            that.createWidget(range, match.props);
        });
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
    var that = this;

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
    var that = this;
    var range = { from: origin.from, to: origin.to };

    _.each(this.doc().getAllMarks(), function(mark) {
        if (mark.xType != that.id) return;

        var markRange = mark.find();
        if (!markRange) return;

        var isInRange = markRange.line? posInsideRange(markRange, origin) : utils.rangesOverlap(markRange, origin);
        if (!isInRange) return;

        if (utils.posIsBefore(markRange.from, range.from)) {
            range.from = markRange.from;
        }
        if (utils.posIsBefore(range.to, markRange.to)) {
            range.to = markRange.to;
        }

        mark.clear();
    });

    return range;
};

// Process change from the editor
WidgetType.prototype.processChange = function(change) {
    if (change.origin == 'setValue') {
        return this.renderAll();
    }

    // Calcul range of change (change is pre-operation)
    var changeRange = {
        from: utils.Pos(change.from.line, change.from.ch),
        to: utils.Pos(change.to.line + (change.text.length - 1), change.to.ch + _.last(change.text).length)
    };

    // Determine large range and cleanup markers in it
    var range = this.cleanupMarkers(changeRange);

    // If nothing found, find larger section to process
    if (utils.posEqual(changeRange, range)) {
        range = this.findEditRange(changeRange);
        this.cleanupMarkers(changeRange);
    }

    // Update markers in this range
    this.processRange(range);
};

// Editor content changed
// Debounce processing
WidgetType.prototype._onChange = function(inst, change) {
    this.processChange(change);
};


WidgetType.prototype.enable = function() {
    if (this.enabled) return;

    this.enabled = true;
    this.manager.editor.on('change', this.onChange);
    this.renderAll();
};

WidgetType.prototype.disable = function() {
    if (!this.enabled) return;

    this.enabled = false;
    this.manager.editor.off('change', this.onChange);
    this.unrenderAll();
};

// Return the concerned document
WidgetType.prototype.doc = function() {
    return this.manager.doc();
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
            composables: ['enable', 'disable', 'prepareWidget']
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
