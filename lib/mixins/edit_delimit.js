/*
Example:

widgets.mixins.editDelimit('$$', '$$')
*/
var _ = require('lodash');
var escapeRe = require('escape-regexp');

var utils = require('../utils');

function compileRe(re) {
    if (_.isRegExp(re)) return re;
    else return new RegExp(escapeRe(re));
}

module.exports = function(start, end, opts) {
    start = compileRe(start);
    end = compileRe(end);

    opts = _.defaults(opts || {}, {
        maxLines: 10
    });


    return {
        findEditRange: function(range) {
            var doc = this.doc();

            function findPos(r, re, direction, origin) {
                origin = origin || start;

                var line = doc.getLine(r.line);
                var innerCh = 0;

                if (r.ch > 0) {
                    if (direction > 0) {
                        line = line.slice(-(line.length - r.ch));
                        innerCh = r.ch;
                    } else {
                        line = line.slice(0, r.ch);
                        innerCh = 0;
                    }
                }

                var match = line.match(re);
                if (!match) {
                    return findPos(
                        utils.Pos(r.line + direction, 0),
                        re,
                        direction,
                        origin
                    );
                }

                return utils.Pos(r.line, innerCh + match.index + Math.max(direction, 0));
            }

            range.from = findPos(range.from, start, -1);
            range.to = findPos(range.to, end, 1);

            return range;
        }
    };
};
