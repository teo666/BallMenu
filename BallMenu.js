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
}

BallMenu.prototype.setRadius = function (n) {
    if(n < 0 ) return false;
    this.radius = n;
    this.balls.forEach(function (item,i) {
        item.setRadius(n);
    });
    return true;
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

BallMenu.prototype.loadConf = function (config) {
    let self = this;
    try{
        let c = JSON.parse(JSON.stringify(config));
        c.forEach(function(item, i){
            if(!item.hasOwnProperty("srcImg") || ! item.hasOwnProperty("dstUrl")){
                console.warn("Element at position " + i + " in bad formatted");
            }else {
                self.balls.push(new Ball(item.srcImg,item.dstUrl),{removeOnStop: false});
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
    let self = this;
    this.balls.forEach(function (item,i) {
        a.push(self.balls[i].loadImage());
    });
    return Promise.all(a);
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
        //console.log(e.clientX - self.positions.x, e.clientY - self.positions.y);
    })
};

BallMenu.prototype.clearAll = function(){
    /*cancellazione approssimata
    let l = (ballset.findLevel(ballset.length)+1.5)*(2*ballset.radius)
    ctx.clearRect(-l,-l,2*l,2*l)

    /*cancellazione esatta*/
    //let l = ballset.getBound();
    //ctx.clearRect(l.x*ballset.radius-1,l.y*ballset.radius-1,l.width*ballset.radius+2,l.height*ballset.radius+2)

    /*cancellazione approssimata*/
    let l = (this.findLevel(this.balls.length)+1.5)*(2*this.radius);
    this.context.clearRect(-l,-l,2*l,2*l)

    /*ctx.beginPath();
    ctx.lineWidth="1";
    ctx.strokeStyle="red";
    ctx.rect(-l,-l,2*l,2*l)
    ctx.stroke();*/

};

BallMenu.prototype.setMouseWheelHanler = function(){
    let self = this;
    this.canvas.addEventListener('wheel', function(e){
        e.preventDefault();
        console.log(e.deltaY);
        let factor = 1.01;
        if(e.ctrlKey){
            factor *= 1.03;
        }
        if(e.deltaY <= 0){
            self.radius *= factor;
        } else {
            self.radius *= 1/factor;
        }
        self.setRadius(self.radius);
    })
};