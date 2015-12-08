/*
Example:

widgets.mixins.editDelimit('$$', '$$')
*/
var _ = require('lodash');
var escapeRe = require('escape-regexp');

var utils = require('../utils');

function compileRe(re) {
    return new RegExp(escapeRe(re));
}

function regexIndexOf(str, regex, startpos) {
    var indexOf = str.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}

function regexLastIndexOf(str, regex, startpos) {
    regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
    if(typeof (startpos) == "undefined") {
        startpos = str.length;
    } else if(startpos < 0) {
        startpos = 0;
    }
    var stringToWorkWith = str.substring(0, startpos + 1);
    var lastIndexOf = -1;
    var nextStop = 0;
    while((result = regex.exec(stringToWorkWith)) != null) {
        lastIndexOf = result.index;
        regex.lastIndex = ++nextStop;
    }
    return lastIndexOf;
}

function positiveInt(n) {
    return Math.max(n, 0);
}

module.exports = function(start, end, opts) {
    var diffStart = start.length;
    var diffEnd = start.length;

    start = compileRe(start);
    end = compileRe(end);

    opts = _.defaults(opts || {}, {
        maxLines: 10,
        stopOnEmptyLine: true
    });


    return {
        findEditRange: function(range) {
            var doc = this.doc();
            var nLines = doc.lineCount();

            function findPos(find) {
                find = _.defaults(find, {
                    include: false,
                    fullLine: false,
                    origin: find.pos
                });

                //console.log('findPos from line=' + find.pos.line +' ch=' + find.pos.ch +' direction=' + find.direction);

                var line = doc.getLine(find.pos.line);
                var innerCh = 0;
                var matchIndex = -1;
                var startPos = 0;
                var limitPos = line.length;

                function stopFind() {
                    return {
                        line: find.pos.line,
                        ch: find.pos.ch,
                        notFound: true
                    };
                }

                function continueFind() {
                    var newLine = find.pos.line + find.direction;

                    if (newLine < 0 || newLine >= nLines ||  Math.abs(newLine - find.origin.line) > opts.maxLines) {
                        //console.log('     -> returnPosLimit  direction='+find.direction, find.pos);
                        return stopFind();
                    }

                    return findPos(_.extend({}, find, {
                        pos: utils.Pos(newLine, 0),
                        include: false,
                        fullLine: true
                    }));
                }

                if (line.length == 0 && opts.stopOnEmptyLine) {
                    //console.log('      ->stop on empty line', find.pos);
                    return stopFind();
                }

                if (find.direction < 0) {
                    startPos = 0;
                    limitPos = find.pos.ch;

                    if (find.include)  limitPos = limitPos + diffStart;
                    if (find.fullLine) limitPos = line.length;

                    if (limitPos < diffStart) return continueFind();
                    matchIndex = regexLastIndexOf(line, find.re, limitPos - 1);
                } else {
                    startPos = find.pos.ch;
                    limitPos = line.length;

                    if (find.include) startPos = positiveInt(startPos - diffEnd);
                    if (find.fullLine) limitPos = startPos = 0;;

                    if (limitPos == startPos) return continueFind();
                    matchIndex = regexIndexOf(line, find.re, startPos);
                }

                //console.log('findPos line='+find.pos.line+'  ch='+startPos+'  limit='+limitPos+'  direction='+find.direction+'  match='+matchIndex);

                if (matchIndex < 0) {
                    return continueFind();
                }

                // End range should finish after the match
                if (find.direction > 0) matchIndex = matchIndex + diffEnd;

                var pos = utils.Pos(find.pos.line, matchIndex);
                //console.log('     -> returnPos  direction='+find.direction, pos);

                return pos;
            }

            var searchFullLine = range.to.line != range.from.line

            function findFrom(include) {
                var r = _.clone(range.from);
                //console.log('-------- findFrom '+ include, r);
                return findPos({
                    pos: r,
                    re: start,
                    direction: -1,
                    include: include
                });
            }
            function findTo(include) {
                var r = _.clone(range.to);
                //console.log('-------- findTo '+ include, r);
                return findPos({
                    pos: r,
                    re: end,
                    direction: 1,
                    include: include
                });
            }


            var from = findFrom(true);
            var to = findTo(true);

            if (!from.notFound && !to.notFound && utils.posEqual(from, { line: to.line, ch: to.ch - diffEnd })) {
                //console.log('======= search withotu include ======');

                var fromNotIncluded = findFrom(false);
                //console.log('====>', fromNotIncluded.notFound)
                if (!fromNotIncluded.notFound) {
                    from = fromNotIncluded;
                } else {
                    to = findTo(false);
                }
            }

            range.from = from;
            range.to = to;
            return range;
        }
    };
};
