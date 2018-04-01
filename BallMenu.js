function BallMenu(){
    this.balls = [];
    this.canvas = null;
    this.context = null;
    this.positions = {
        x:0,
        y:0,
        current : {x:0,y:0}
    };
    this.radius = 75;
    this.sqrt3d2 = 0.86602540378;
    this.selected = -1;
    this.bound = {x:0,y:0,width:0,height:0};
    this.minRadius = null;
    this.minRadius = null;
}

BallMenu.prototype.setMaxRadius = function (n) {
    this.maxRadius = n;
};

BallMenu.prototype.setMinRadius = function (n) {
    this.minRadius = n;
};

BallMenu.prototype.setRadius = function (n) {
    if(n < 0 ) return false;
    if(this.minRadius == null){
        this.setMinRadius(n);
    } else if(n < this.minRadius){
        n = this.minRadius;
    }

    if(this.maxRadius == null){
        this.setMaxRadius(n);
    } else if(n > this.maxRadius){
        n = this.maxRadius;
    }
    this.radius = n;
    this.balls.forEach(function (item,i) {
        item.setRadius(n);
    });
    return true;
};

BallMenu.prototype.setZoomDirection = function (d) {
    this.balls.forEach(function (item,i) {
        item.setZoomDirection(d);
    });
};

BallMenu.prototype.setRealRadius = function (n) {
    if(n < 0 ) return false;
    this.balls.forEach(function (item,i) {
        item.setRealRadius(n);
    });
};

BallMenu.prototype.setPadding = function (n) {
    if(n > 1 || n < 0 ) return false;
    this.balls.forEach(function (item,i) {
        item.setPadding(n);
    });
    return true;
};

BallMenu.prototype.resize = function () {
    if (!this.canvas) return;
    this.canvas.height = window.innerHeight;
    this.canvas.width = window.innerWidth;
};

BallMenu.prototype.init = function () {
    this.canvas = document.getElementById("ballCanvas");
    if(this.canvas && this.canvas.tagName.toLowerCase() === "canvas"){
        this.resize();
        this.context = this.canvas.getContext("2d");
    }
    let self = this;
    window.onresize = function () {
        self.resize();
        self.center();
        self.drawOrigin();
    };
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
    this.positions.x = this.canvas.width/2;
    this.positions.y = this.canvas.height/2;
    this.context.translate(this.positions.x, this.positions.y)
    //this.positions.current.x = move.x;
    //this.positions.current.y = move.y;
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
            }else {
                self.balls.push(new Ball(item.srcImg,item.dstUrl,{keepOnEnd: true,keepDraw: true}));
            }
        })
    }catch(e){
        console.error("invalid configuration structure");
    }
};

BallMenu.prototype.setContext = function (context) {
    let self = this;
    this.balls.forEach(function (item,i) {
        item.setContext(self.context);
    })
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

BallMenu.prototype.drawBalls = function () {
    this.balls.forEach(function (item,i) {
        item.fn_draw();
    })
};

BallMenu.prototype.setMouseMoveHandler = function(){
    self = this;
    let sel = -1;
    this.canvas.addEventListener('mousemove',function(e){
        sel = -1;
        self.balls.forEach(function (item,i) {
            if(item.hitTest({x: e.clientX - self.positions.x,y: e.clientY - self.positions.y})){
                sel = i;
                return false;
            }
        });
        let old_sel = self.getSelected();
        self.selected = sel;
        self.setSelected();
        let sele = self.getSelected();
        //console.log(e.clientX - self.positions.x, e.clientY - self.positions.y);
        //console.log(self.selected);
        if((old_sel || sele) && (old_sel !== sele)){
            if(sele) sele.setDrawable();
            if(old_sel) old_sel.setDrawable();
            jsAnimator.animationStart();
        }
    });
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
    /*cancellazione approssimata
    let l = (ballset.findLevel(ballset.length)+1.5)*(2*ballset.radius)
    ctx.clearRect(-l,-l,2*l,2*l)

    /*cancellazione esatta*/
    //let l = this.getBound();
    //this.context.clearRect(l.x*this.radius-2,l.y*this.radius-2,l.width*this.radius+4,l.height*this.radius+4);

    /*cancellazione approssimata*/
    let l = (this.findLevel(this.balls.length)+1.5)*(2*this.radius);
    this.context.clearRect(-1000,-1000,2*1000,2*1000);

    /*this.context.beginPath();
    this.context.lineWidth="1";
    this.context.strokeStyle="red";
    this.context.rect(-l,-l,2*l,2*l);
    this.context.stroke();*/

};

BallMenu.prototype.getBound = function(){
    return this.bound;
};

BallMenu.prototype.setBound = function(){
    this.bound.y = -(this.findLevel(this.balls.length)*2 +1);
    this.bound.x = -(this.findLevel(this.balls.length)*2*0.86602540378 + 1);
    this.bound.width = -2*this.bound.x;
    this.bound.height = -2*this.bound.y
};

BallMenu.prototype.setMouseWheelHanler = function(){
    let self = this;
    this.canvas.addEventListener('wheel', function(e){
        e.preventDefault();
        //console.log(e.deltaY);
        let factor = 1.05;
        if(e.ctrlKey){
            factor *= 1.08;
        }
        if(e.deltaY < 0){
            self.radius *= factor;
            self.setZoomDirection(1);
        } else {
            self.radius /= factor;
            self.setZoomDirection(-1);
        }
        self.setRadius(self.radius);
        self.setAllDrawable();
        //self.clearAll();
        //self.drawBalls();
        jsAnimator.animationStart();
    })
};

BallMenu.prototype.setAllDrawable = function () {
    this.balls.forEach(function (item,i) {
        item.setDrawable();
    })
};