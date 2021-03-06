function BallMenu(){
    this.balls = [];
    this.canvas = null;
    this.context = null;
    this.positions = {
        center:{ //coordinate del centro del canvas
            x: 0,
            y: 0
        },
        to_reach : { //coordinate da raggiungere nel drag and drop
            x: 0,
            y: 0
        },
        accumulated :{ //posizione accumulata delle palle
            x: 0,
            y:0
        },
        handle :{ //coordinate del punto di drag
            x: 0,
            y: 0
        },
        stop: false,
        canvas_size : {
            w: 0,
            h: 0
        }
    };
    this.radius = 75;
    this.default_ball_size = 75;
    this.sqrt3d2 = 0.86602540378;
    this.selected = -1;
    this.minRadius = null;
    this.minRadius = null;
    this.dragging = false;
    this.probably_dragging = false;
    this.drag_delay = null;
}

BallMenu.prototype.setMaxRadius = function (n) {
    this.maxRadius = n;
};

BallMenu.prototype.setMinRadius = function (n) {
    this.minRadius = n;
};

BallMenu.prototype.setCanvasSize = function () {
    this.positions.canvas_size.w = this.canvas.width;
    this.positions.canvas_size.h = this.canvas.height;
};

BallMenu.prototype.setRadius = function (n) {
    if(n < 0 ) return false;
    //limita la dimensione del raggio
    if(n >= this.maxRadius || n <= this.minRadius){
        n = Math.min(Math.max(this.minRadius,n),this.maxRadius);
    }
    this.radius = n;
    //console.log(this.radius);
    this.balls.forEach(function (item) {
        item.setRadius(n);
    });
    return true;
};

BallMenu.prototype.setRealRadius = function (n) {
    if(n < 0 ) return false;
    this.balls.forEach(function (item) {
        item.setRealRadius(n);
    });
};

BallMenu.prototype.setPadding = function (n) {
    if(n > 1 || n < 0 ) return false;
    this.balls.forEach(function (item) {
        item.setPadding(n);
    });
    return true;
};

BallMenu.prototype.resize = function () {
    if (!this.canvas) return;
    this.canvas.height = window.innerHeight;
    this.canvas.width = window.innerWidth;
    this.setCanvasSize();
};

BallMenu.prototype.init = function (menu_conf) {
    if(!menu_conf || !menu_conf.canvas_id ){
        throw "Parameter canvas_id is not specified";
    }
    this.canvas = document.getElementById(menu_conf.canvas_id);
    if(this.canvas && this.canvas.tagName.toLowerCase() === "canvas"){
        this.resize();
        this.context = this.canvas.getContext("2d");
    } else {
        throw "Parameter canvas_id is not a valid id";
    }

    let self = this;
    /*window.onresize = function () {
        self.resize();
        self.center();
        //self.drawOrigin();
        self.drawBalls();
    };*/
    //this.setMouseMoveHandler();
    //this.setMouseWheelHandler();
    //this.setMouseDownHandler();
    //this.setMouseUpHandler();
    this.center();
    this.loadConf(conf);
    this.loadForAnimation();
    if(!menu_conf.hasOwnProperty('ball_size')){
        menu_conf.ball_size = 75;
    }
    this.setRadius(menu_conf.ball_size);
    this.default_ball_size = menu_conf.ball_size;
    this.setRealRadius(menu_conf.ball_size);

    if(menu_conf.hasOwnProperty('ball_max_size')){
        this.setMaxRadius(menu_conf.ball_max_size);
        this.setRealRadius(500);
    }
    if(menu_conf.hasOwnProperty('ball_min_size')){
        this.setMinRadius(menu_conf.ball_min_size);
    }
    if(!menu_conf.hasOwnProperty('ball_padding')){
        menu_conf.ball_padding = 0.15;
    }
    this.setPadding(menu_conf.ball_padding);
    this.dispose();
    this.setContext();
};

BallMenu.prototype.drawOrigin = function(){
    if (!this.context) return;
    this.context.beginPath();
    this.context.arc(0, 0, 10, 0, 2 * Math.PI, false);
    this.context.fillStyle = 'red';
    this.context.fill();
    this.context.lineWidth = 5;
    this.context.strokeStyle = '#ff1200';
    this.context.stroke();
};

BallMenu.prototype.center = function(){
    this.positions.center.x = this.canvas.width/2;
    this.positions.center.y = this.canvas.height/2;
    this.context.translate(this.positions.center.x, this.positions.center.y)
};

BallMenu.prototype.loadForAnimation = function () {
    this.balls.forEach(function (item) {
        jsAnimator.add(item,{removeOnStop : false});
    })
};

BallMenu.prototype.loadConf = function (config) {
    let self = this;
    try{
        let c = JSON.parse(JSON.stringify(config));
        c.forEach(function(item, i){
            if(!item.hasOwnProperty("srcImg") || ! item.hasOwnProperty("dstUrl")){
                console.warn("Element at position " + i + " in bad formatted");
            } else {
                if(!item.hasOwnProperty("desc")){
                    item["desc"] = item.dstUrl;
                }
                self.balls.push(new Ball(item.srcImg,item.dstUrl, item.desc, self.positions,{keepOnEnd: true,keepDraw: true}));
            }
        })
    }catch(e){
        console.error("invalid configuration structure");
    }
};

BallMenu.prototype.setContext = function () {
    let self = this;
    this.balls.forEach(function (item) {
        item.setContext(self.context);
    })
};

BallMenu.prototype.moveLeft = function(n){
    this.positions.to_reach.x -= n
};
BallMenu.prototype.moveRight = function(n){
    this.positions.to_reach.x += n
};
BallMenu.prototype.moveUp = function(n){
    this.positions.to_reach.y -= n
};
BallMenu.prototype.moveDown = function(n){
    this.positions.to_reach.y += n
};

BallMenu.prototype.resetTransformation = function(){
    this.positions.to_reach.x = this.positions.to_reach.y = 0;
    this.setRadius(menu.default_ball_size);
};

BallMenu.prototype.dispose = function(){
    let n = this.balls.length;
    let l = this.findLevel(n);
    if(n > 0){
        this.balls[0].setPosition({x:0,y:0});
        /*interpretazione direction
        u = up; d = down; l = left; r = right
        0 = u
        1 = ul
        2 = dl
        3 = d
        4 = dr
        5 = ur
        */
        let direction = 1;
        let count = 1;
        let csmezzi = 0.5;
        let x = this.sqrt3d2;
        let y = -csmezzi;
        end:
            while(count < n){
                for(let i = 1; i <= l;){
                    for(let j = 0; j < 6; j++){
                        for(let k = 0; k < i;k++){
                            switch(direction){
                                case 0:
                                    y = y - 1;
                                    break;
                                case 1:
                                    y = y - csmezzi;
                                    x = x - this.sqrt3d2;
                                    break;
                                case 2:
                                    y = y + csmezzi;
                                    x = x - this.sqrt3d2;
                                    break;
                                case 3:
                                    y = y + 1;
                                    break;
                                case 4:
                                    y = y + csmezzi;
                                    x = x + this.sqrt3d2;
                                    break;
                                case 5:
                                    y = y - csmezzi;
                                    x = x + this.sqrt3d2;
                                    break;

                            }
                            let d = this.balls[count];
                            d.setPosition({x : x,y : y});
                            count++;
                            if (count === n) break end;
                        }
                        direction =(++direction) % 6;
                    }
                    i++;
                    x = i*this.sqrt3d2;
                    y = -i*csmezzi;
                    direction = 1;
                }
            }
    }
};

BallMenu.prototype.findLevel = function(n){
    if (n <= 1) return 0;
    let i = 0;
    let tot = 1;
    while(tot < n){
        i++;
        tot = tot + i*6
    }
    return i;
};

BallMenu.prototype.loadBall = function(){
    let a = [];
    this.balls.forEach(function (item) {
        a.push(item.loadImage());
    });
    return Promise.all(a);
};

BallMenu.prototype.getBall = function (n) {
    if(n < 0 || n > this.balls.length) return false;
    return this.balls[n];
};

BallMenu.prototype.getBalls = function () {
    return this.balls;
};

BallMenu.prototype.drawBalls = function () {
    this.balls.forEach(function (item) {
        item.fn_draw();
    })
};

BallMenu.prototype.setSelected = function () {
    let self = this;
    this.balls.forEach(function (item,i) {
        item.setSelected(self.selected === i);
    })
};

BallMenu.prototype.getSelected = function () {
    if(this.selected < 0) return false;
    return this.getBall(this.selected);
};

BallMenu.prototype.clearAll = function(){

    this.context.clearRect(-this.positions.canvas_size.w/2,-this.positions.canvas_size.h/2,
        this.positions.canvas_size.w,this.positions.canvas_size.h);

};

BallMenu.prototype.wheel = function(e){
    e.preventDefault();
    let factor = 1.05;
    let old_r = this.radius;
    if(e.ctrlKey){
        factor *= 1.08;
    }
    if(e.deltaY < 0){
        this.radius *= factor;
    } else {
        this.radius /= factor;
    }
    this.setRadius(this.radius);


    //se il raggio ha già le dimensioni limite non faccio nulla
    if(this.radius >= this.maxRadius || this.radius <= this.minRadius){
        return;
    }


    let x = e.clientX - this.positions.center.x - this.positions.to_reach.x;
    let y = e.clientY - this.positions.center.y - this.positions.to_reach.y;

    let mul = 2*(this.radius - old_r);
    let ht = null;

    let selected = this.getSelected();
    if(selected){
        ht = selected.position;
    } else {
        ht = {
            x: x/2/old_r,
            y: y/2/old_r
        }
    }
    this.positions.to_reach.x -= (ht.x * mul);
    this.positions.to_reach.y -= (ht.y * mul);

    this.setAllDrawable();
    jsAnimator.animationStart();

};

BallMenu.prototype.down = function (e) {
    let self = this;
    this.positions.handle.x = e.clientX;
    this.positions.handle.y = e.clientY;

    this.drag_delay = setTimeout(function () {
        self.probably_dragging = true;
    },100);

    this.dragging = false;
};

BallMenu.prototype.up = function(){
    let self = this;
    //let inp = document.getElementById("search");

    clearTimeout(self.drag_delay);
    self.probably_dragging = false;
    if(!self.dragging && self.selected > -1){
        self.open();
    }
    self.dragging = false;
    //inp.focus();
};

BallMenu.prototype.move = function(e){
    let self = this;
    let sel = -1;
    if(this.probably_dragging){
        this.dragging = true;
        this.positions.to_reach.x += (e.clientX - this.positions.handle.x);
        this.positions.to_reach.y += (e.clientY - this.positions.handle.y);
        this.setAllDrawable();
        this.positions.stop = false;
        jsAnimator.animationStart();
        this.positions.handle.x = e.clientX;
        this.positions.handle.y = e.clientY;
        //console.log(this.positions.to_reach);
    }
    this.balls.forEach(function (item,i) {
        if(item.hitTest({
                x: e.clientX - self.positions.center.x - self.positions.accumulated.x,
                y: e.clientY - self.positions.center.y - self.positions.accumulated.y
        })){
            sel = i;
            return false;
        }
    });
    let old_sel = this.getSelected();
    this.selected = sel;
    this.setSelected();
    let sele = this.getSelected();
    //console.log(e.clientX - this.positions.x, e.clientY - this.positions.y);
    //console.log(this.selected);
    if((old_sel || sele) && (old_sel !== sele)){
        if(sele) sele.setDrawable();
        if(old_sel) old_sel.setDrawable();
        jsAnimator.animationStart();
    }
};

BallMenu.prototype.open = function(){
    if(this.balls[this.selected].search_weight !== 0){
        window.open(this.balls[this.selected].getDstUrl(),'_blank');
        window.focus();
    }
};

BallMenu.prototype.tryOpen = function(){
    let found = 0;
    let index = -1;
    this.balls.forEach(function (item,i) {
        if(item.search_weight){
            found++;
            index = i;
        }
    });
    if(found === 1){
        this.selected = index;
        this.open();
    }
};


BallMenu.prototype.incrementAccumulator = function () {
    let diff_x = this.positions.accumulated.x - this.positions.to_reach.x;
    let diff_y = this.positions.accumulated.y - this.positions.to_reach.y;
    let inc_x = diff_x / 5;
    let inc_y = diff_y / 5;
    let cond_diff_x = (Math.abs(diff_x) < 0.01);
    let cond_diff_y = (Math.abs(diff_y) < 0.01);
    if(cond_diff_x && cond_diff_y){
        this.positions.stop = true;
    }
    if( !cond_diff_x ){
        this.positions.accumulated.x -= inc_x;
    }
    if( !cond_diff_y ){
        this.positions.accumulated.y -= inc_y;
    }
    //console.log(this.positions.accumulated);
};

BallMenu.prototype.passCoordinates = function () {
    let self = this;
    this.balls.forEach(function (item) {
        item.passCoordinates(self.positions);
    })
};

BallMenu.prototype.setAllDrawable = function () {
    this.balls.forEach(function (item) {
        item.setDrawable();
    })
};

