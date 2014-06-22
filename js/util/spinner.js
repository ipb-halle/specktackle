import "util";

/**
 * Helper function to create divs for the spinner animation (defined in css).
 *
 * @author Stephan Beisken <beisken@ebi.ac.uk>
 * @method st.util.spinner
 * @param {string} el - an element id to append the spinner to
 * @return the spinner element
 */
st.util.spinner = function (el) {
    if ($('.st-spinner').length) {
        console.log("SDF");
        return $('.st-spinner');
    }
    
    $(el).append('<div class="st-spinner">' +
        '<div class="st-bounce1"></div>' + 
        '<div class="st-bounce2"></div>' +
        '<div class="st-bounce3"></div>' +
        '</div>');
        
    return $('.st-spinner');
};
