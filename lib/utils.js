var _ = require('lodash');

// Compose a prototype and a mixin
function composeMixin(proto, mixin, opts) {
    opts = _.defaults(opts || {}, {
        // List of methods that are composables
        composables: []
    });

    _.each(mixin, function(method, key) {
        var isComposable = _.contains(opts.composables, key);

        if (!isComposable || !proto[key]) {
            proto[key] = method;
        } else {
            var precedent = proto[key];
            proto[key] = function() {
                precedent.apply(this, arguments);
                method.apply(this, arguments);
            };
        }
    });

    return proto;
}
function composeMixins(proto, mixins, opts) {
    return _.reduce(mixins, function(p, mixin) {
        return composeMixin(p, mixin, opts);
    }, proto);
}

/*** Utility for DOM API ***/

function domAddClass(el, className) {
    if (el.classList) {
        el.classList.add(className);
    } else {
        el.className += ' ' + className;
    }
}
function domRemoveClass(el, className) {
    if (el.classList) {
        el.classList.remove(className);
    } else {
        el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
}


/*** Utility for ranges and positions ***/

function Pos(line, ch) {
    return {
        line: line,
        ch: ch
    };
}

function Range(from, to) {
    return {
        from: from,
        to: to
    };
}

// Return true if object is a position
function isPos(pos) {
    return _.isUndefined(pos.line);
}

// Return true if object is a range
function isRange(pos) {
    return _.isUndefined(pos.from);
}

// Return negative / 0 / positive.  a < b iff posCmp(a, b) < 0 etc.
function posCmp(a, b) {
    return (a.line - b.line) || (a.ch - b.ch);
}
function posIsBefore(a, b) {
    return (posCmp(a, b) < 0);
}

// True if inside, false if on edge.
function posInsideRange(pos, range) {
    return posCmp(range.from, pos) < 0 && posCmp(pos, range.to) < 0;
}

// True if outside, true if on edge
function posOutsideRange(pos, range) {
    return posCmp(range.from, pos) > 0 || posCmp(pos, range.to) > 0;
}

// True if there is at least one character in common, false if just touching.
function rangesOverlap(fromTo1, fromTo2) {
    return (posCmp(fromTo1.from, fromTo2.to) < 0 &&
            posCmp(fromTo2.from, fromTo1.to) < 0);
}

// True if position are equal
function posEqual(r1, r2) {
    return (r1.line == r2.line && r2.ch == r1.ch);
}

// Process fn in next tick
function nextTick(fn) {
    setTimeout(function() {
        fn();
    }, 1);
}

module.exports = {
    Pos: Pos,
    Range: Range,

    composeMixin: composeMixin,
    composeMixins: composeMixins,

    domAddClass: domAddClass,
    domRemoveClass: domRemoveClass,
    posCmp: posCmp,
    posInsideRange: posInsideRange,
    posOutsideRange: posOutsideRange,
    posIsBefore: posIsBefore,
    rangesOverlap: rangesOverlap,
    posEqual: posEqual,
    isRange: isRange,
    isPos: isPos,

    nextTick: nextTick
};
