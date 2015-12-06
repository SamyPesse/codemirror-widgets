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
                method();
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

// Return negative / 0 / positive.  a < b iff posCmp(a, b) < 0 etc.
function posCmp(a, b) {
    return (a.line - b.line) || (a.ch - b.ch);
}
function posIsBefore(a, b) {
    return (posCmp(a, b) < 0);
}

// True if inside, false if on edge.
function posInsideRange(pos, fromTo) {
    return posCmp(fromTo.from, pos) < 0 && posCmp(pos, fromTo.to) < 0;
}

// True if outside, true if on edge
function posOutsideRange(pos, fromTo) {
    return posCmp(fromTo.from, pos) > 0 || posCmp(pos, fromTo.to) > 0;
}

// True if there is at least one character in common, false if just touching.
function rangesOverlap(fromTo1, fromTo2) {
    return (posCmp(fromTo1.from, fromTo2.to) < 0 &&
            posCmp(fromTo2.from, fromTo1.to) < 0);
}

// True if range are equal
function rangesEqual(r1, r2) {
    return (r1.line == r2.line && r2.ch == r1.ch);
}


module.exports = {
    Pos: Pos,

    composeMixin: composeMixin,
    composeMixins: composeMixins,

    domAddClass: domAddClass,
    domRemoveClass: domRemoveClass,
    posCmp: posCmp,
    posInsideRange: posInsideRange,
    posOutsideRange: posOutsideRange,
    posIsBefore: posIsBefore,
    rangesOverlap: rangesOverlap,
    rangesEqual: rangesEqual
};
