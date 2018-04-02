function Ball (srcI, dstU, positions,prop) {
    this.src = srcI;
    this.dst = dstU;
    this.img = new Image();
    this.loaded = false;
    //la posizione della palla all'interno del canvas se moltiplicata per il diametro
    this.position = {x: 0, y: 0};
    this.offset = 0.85;
    this.min = 0;
    this.offset  = 0;
    this.context = null;
    this.radius = 0;
    this.real_radius = 0;
    this.padding = 0;
    this.selected = false;
    this.prop = prop;
    this.parent_pos = positions;
}
Ball.prototype.fn_draw = function () {
    let min;
    let cToS = {
        x: this.position.x*2*this.real_radius + this.parent_pos.accumulated.x + this.parent_pos.center.x,
        y: this.position.y*2*this.real_radius + this.parent_pos.accumulated.y + this.parent_pos.center.y
    };
    //console.log(cToS)
    if(cToS.x < this.real_radius || cToS.x > this.parent_pos.canvas_size.w - this.real_radius ||
        cToS.y < this.real_radius || cToS.y > this.parent_pos.canvas_size.h - this.real_radius){
        min = Math.min(cToS.x ,this.parent_pos.canvas_size.w - cToS.x, cToS.y,
            this.parent_pos.canvas_size.h - cToS.y) - this.real_radius;
        min = Math.abs(min);

    } else {
        min = 0;
    }

    let r = Math.max(0, this.real_radius * (1.0 - this.padding + this.offset) - min);

    if(this.isLoaded()){
        this.context.save();
        this.context.translate(this.position.x*this.real_radius*2+this.parent_pos.accumulated.x,
            this.position.y*this.real_radius*2+this.parent_pos.accumulated.y);
        this.context.drawImage(this.img, -r ,-r,2*r,2*r);
        this.context.restore();
    }
};

Ball.prototype.setSelected = function (b) {
    this.selected = b;
};

Ball.prototype.fn_stop = function () {
    //console.log(this.real_radius, this.radius);
    return (this.offset <= 0 || this.offset >= this.padding) &&
        (this.real_radius <= 0 || this.real_radius === this.radius) &&
        this.parent_pos.stop;
};

Ball.prototype.fn_update = function () {
    if(this.selected){
        this.offset += 0.02;
        this.offset = Math.min(this.padding, this.offset);
    } else {
        this.offset -= 0.02;
        this.offset = Math.max(0,this.offset);
    }

    let diff = Math.abs(this.radius - this.real_radius);
    let inc = diff / 5;
    if(Math.abs(this.real_radius - this.radius) < 0.01 ){
        this.real_radius = this.radius;
        return;
    }
    if(this.real_radius <= this.radius){
        this.real_radius += inc;

        this.real_radius = Math.min(this.radius, this.real_radius);
    } else {
        this.real_radius -= inc;

        this.real_radius = Math.max(this.radius,this.real_radius);
    }
    //console.log(this.real_radius)
};

Ball.prototype.setRadius = function (n) {
    this.radius = n;
};

Ball.prototype.setRealRadius = function (n) {
    this.real_radius = n;
};

Ball.prototype.setPadding = function (n) {
    this.padding = n;
};

Ball.prototype.setContext = function (c) {
    this.context = c;
};

Ball.prototype.getSrcImg = function(){
    return this.src;
};

Ball.prototype.getDstUrl = function(){
    return this.dst;
};

Ball.prototype.setPosition = function(p){
    this.position = p;
};

Ball.prototype.setLoaded = function(b){
    this.loaded = b;
};

Ball.prototype.isLoaded = function(){
    return this.loaded;
};

Ball.prototype.loadImage = function(){
    let self = this;
    return new Promise((resolve,reject) =>{
        self.img.onload = function(){
            self.setLoaded(true);
            resolve("Image loaded")
        };
        self.img.onerror = function(){
            self.setLoaded(false);
            reject(self.src);
        };
        self.img.src = self.src;
    })
};

Ball.prototype.hitTest = function(e){
    let x = this.position.x *2* this.radius;
    let y = this.position.y *2* this.radius;

    //console.log(this.position, e);
    return (Math.pow(e.x-x,2) + Math.pow(e.y-y,2) < Math.pow(this.real_radius* (1.0 - this.padding + this.offset),2));
};

Ball.prototype.setDrawable = function(){
    this.prop.state = _state.DRAWABLE;
};

