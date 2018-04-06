'use strict';

const _state = {
    "DRAWABLE" : 0,
    "STOPPED": 1,
    "ENDED" : 2
};

let jsAnimator;

(function () {
    let queue = [];
    let cancel = true;
    let started = false;
    let frame_render_end = null;
    let frame_render_start = null;

    let last_animation = null;
    let next = false;
    let n_next = 0;
    
    let add = function(obj) {
        if (!obj) return;
        if(!obj.prop) obj.prop = {};
        /*available options:
        - keepOnEnd : pause instead remove on end animation
        -
        */
        let prop = {
            keepDraw: false,
            keepOnEnd : false,
            state : _state.DRAWABLE
        };

        if(!obj.fn_stop || typeof obj.fn_stop !== 'function'){
            obj.fn_stop = function(){};
        }
        if(!obj.fn_update || typeof obj.fn_update !== 'function'){
            obj.fn_update = function(){};
        }
        if(!obj.fn_draw || typeof obj.fn_draw !== 'function'){
            obj.fn_draw = function(){};
        }

        Object.assign(prop, obj.prop);
        obj.prop = prop;
        queue.push(obj);
    };

    let animationToggle = function () {
        if(started) {
            animationStop()
        } else {
            animationStart()
        }
    };
    
    let animationStart = function(){
        if(started) return;
        started = true;
        cancel = false;
        last_animation = requestAnimationFrame(loop.bind(this));
    };
    
    let animationStop = function() {
        cancel = true;
        cancelAnimationFrame(last_animation);
        started = false;
    };

    let renderNext = function (n) {
        if(started || n <= 0) return;
        n_next = n;
        next = true;
        animationStart();
    };
    
    let loop = function() {
        if(frame_render_start) frame_render_start();
        let cont = false;
        let ql = queue.length;
        for (let i = ql - 1; i >= 0; i--) {
            let e = queue[i];
            let prop = queue[i].prop;
            if(prop.state === _state.DRAWABLE){
                e.fn_update.apply(e);
                e.fn_draw.apply(e);
                if(e.fn_stop.apply(e)){
                    if (!prop.keepOnEnd) {
                        prop.state = _state.ENDED;
                        queue.splice(i, 1);
                    } else {
                        prop.state = _state.STOPPED;
                    }
                }
                cont = true;
            } else if(prop.keepDraw){
                e.fn_draw.apply(e);
            }
        }
        if(frame_render_end) frame_render_end();
        if(ql !== queue.length) cont = true;
        if(next){
            animationStop();
            next = false;
            n_next -= 1;
            renderNext(n_next);
        } else if (!cont || cancel) {
            animationStop();
        } else {
            last_animation = requestAnimationFrame(loop.bind(this));
        }
    };
    
    let setGlobalOnFrameRenderStart = function(f) {
        if(typeof f === 'function'){
            frame_render_start = f;
            return true;
        }
        return false;
    };
    
    let setGlobalOnFrameRenderEnd = function(f) {
        if(typeof f === 'function'){
            frame_render_end = f;
            return true;
        }
        return false;
    };

    let length = function () {
        return queue.length;
    };

    jsAnimator = {
        add: add,
        setGlobalOnFrameRenderEnd: setGlobalOnFrameRenderEnd,
        setGlobalOnFrameRenderStart: setGlobalOnFrameRenderStart,
        animationStart: animationStart,
        animationStop: animationStop,
        animationToggle : animationToggle,
        renderNext:renderNext,
        length : length,

    };

     return jsAnimator;
})();