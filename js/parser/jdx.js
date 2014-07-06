import "parser";

st.parser.jdx = function (url, callback) {
    d3.text(url, function (jdx) {
        var LABEL = '##',
            END = 'END',
            XYDATA = 'XYDATA',
            YTABLE = '(X++(Y..Y))',
            XFACTOR = 'XFACTOR',
            YFACTOR = 'YFACTOR',
            FIRSTX = 'FIRSTX',
            LASTX = 'LASTX',
            NPOINTS = 'NPOINTS';
        
        var objs = [];
        var obj = {},
            data = false,
            points = [];
            
        var pair,
            key,
            pkey,
            value;
    
        var lines = jdx.split(/\r\n|\r|\n/g);
        for (var i in lines) {
            var line = lines[i];
            if (line.indexOf(LABEL) === 0) {
                pair = line.split(/=\s(.*)/);
                if (pair.length < 2) {
                    continue;
                }
                key = pair[0].slice(2);
                value = pair[1].split(/\$\$(.*)/)[0].trim();
                if (key === XYDATA && value === YTABLE) {
                    data = true;
                } else if (key === END) {
                    if (data) {
                        obj[pkey] = points;
                        objs.push(obj);
                        // reset
                        obj = {};
                        data = false;
                        points = [];
                    }
                    data = false;
                } else {
                    obj[key] = value;
                }
                pkey = key;
            } else if (data) {
                //var deltax = (obj[LASTX] - obj[FIRSTX]) / (obj[NPOINTS] - 1);
                var entries = line.match(/(\+|-)*\d+\.*\d*/g);
                //var x = obj[XFACTOR] * entries[0];
                for (var j = 1; j < entries.length; j++) {
                    //x += (j - 1) * deltax;
                    var y = obj[YFACTOR] * entries[j];
                    points.push(y);
                }
            }
        }
        callback(objs);
    });
};