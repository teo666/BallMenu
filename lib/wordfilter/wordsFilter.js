'use strict';

const meta = ['\\','!','$','&','?','^','+','*','(',')','[',']','{','}','.','|','<','>','-'];

function WordsFilter(source) {
    this.source = source;
}

WordsFilter.prototype.search = function (val) {
    if(val === ""){
        this.reset();
        return;
    }
    let _reg_1 = '^';
    let _reg_2 = '^';
    let _reg_3 = '';
    let _reg_4 = '';
    for (let i = 0; i < val.length; i++) {
        let char = val.charAt(i);
        if(meta.includes(char)){
            char = '\\' + char;
        }
        _reg_1 += char; //quelli che matchano esattamente
        _reg_2 += char; //quelli che iniziano con quella striga
        _reg_3 += char; //quelli che contengono la sottostringa
        _reg_4 += (char + '.*'); //quelli che contengono i caratteri in sequenza
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
            item.search_weight = 1;
        } else if(text.match(reg_3)){
            item.search_weight = 1;
        } else if(text.match(reg_4)){
            item.search_weight = 1;
        } else {
            item.search_weight = 0;
        }
    });
};

WordsFilter.prototype.reset = function () {
    this.source.forEach(function (item,i) {
        item.search_weight = 1;
    });
};