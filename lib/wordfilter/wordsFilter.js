'use strict';

function WordsFilter(source) {
    this.source = source;
}

WordsFilter.prototype.search = function (val) {
    let _reg_1 = '^';
    let _reg_2 = '^';
    let _reg_3 = '';
    let _reg_4 = '';
    for (let i = 0; i < val.length; i++) {
        _reg_1 += val.charAt(i); //quelli che matchano esattamente
        _reg_2 += val.charAt(i); //quelli che iniziano con quella striga
        _reg_3 += val.charAt(i); //quelli che contengono la sottostringa
        _reg_4 += (val.charAt(i) + '.*'); //quelli che contengono i caratteri in sequenza
    }
    let reg_1 = new RegExp(_reg_1 + '$','ig');
    let reg_2 = new RegExp(_reg_2,'ig');
    let reg_3 = new RegExp(_reg_3,'ig');
    let reg_4 = new RegExp(_reg_4,'ig');
    this.source.forEach(function (item,i) {
        let text = item.description;
        if(text.match(reg_1)){
            item.search_weight = 1;
        } else if(text.match(reg_2)){
            item.search_weight = .75;
        } else if(text.match(reg_3)){
            item.search_weight = .50;
        } else if(text.match(reg_4)){
            item.search_weight = .25;
        } else {
            item.search_weight = 0;
        }
    });
};