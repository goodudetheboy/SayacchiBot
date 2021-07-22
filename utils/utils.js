module.exports = {
    checkImageUrl: function(url) {
        return(url.match(/\.(jpeg|jpg|gif|png)/) != null);
    },
    // max exclusive, min inclusive
    getRandomFromRange: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min);
    },
    removeElement: function(array, elem) {
        var index = array.indexOf(elem);
        if (index > -1) {
            array.splice(index, 1);
        }
    }, 
    randomInteger(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}