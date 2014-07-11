import "util";

/**
 * Color object that consistently returns one of six different colors 
 * for a given identifier.
 * 
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 * @method st.util.colors
 */
st.util.colors = function () {
    var colors = {
        0: "red",
        1: "blue",
        2: "green",
        3: "orange",
        4: "yellow",
        5: "black"
    },

    mapping = {};    // stores the id - color mappings
    mapping.size = function() {
        var size = -1, key;
        for (key in this) {
            if (this.hasOwnProperty(key)) {
                size++;
            }
        }
        return size;
    };

    /**
     * Gets the color for the identifier or - if id is unassigned - returns
     * a new color from the color hash.
     * 
     * @method get
     * @param {int} id - the identifier
     * @returns the color string for the identifier
     */
    var get = function (id) {
        if (mapping[id]) {
            return mapping[id];
        }
        var col = next();
        mapping[id] = col;
        return mapping[id];
    },
    
    /**
     * Removes the color for the identifier from the mapping.
     * 
     * @method remove
     * @param {int} id - the identifier
     */
    remove = function (id) {
        if (mapping[id]) {
            delete mapping[id];
        }
    },

    /**
     * Returns the color string based on the running index. Resets the
     * index if it exceeds the color hash.
     * 
     * @method next
     * @returns the color string
     */
    next = function () {
        var ncolors = Object.keys(colors).length;
        var nmappings = mapping.size();
        var index = nmappings % ncolors;
        return colors[index];
    };

    // reference visible (public) functions as properties
    return {
        get: get,
        remove: remove
    };
};