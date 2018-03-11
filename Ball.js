function Ball (srcI, dstU) {
    this.src = srcI;
    this.dst = dstU;
    this.img = new Image();
    this.loaded = false;
    //la posizione della palla all'interno del canvas
    this.position = {x: 0, y: 0};
    this.r = 0;
    this.offset = 0.85;
    this.min = 0;
    this.offIncrement = 0.02;
    this.off = null;
    this.context = null;
    this.radius = 0;
    this.padding = 0;

}
Ball.prototype.fn_draw = function () {
    let r = this.radius * (1 - this.padding);
    if(this.isLoaded()){
        this.context.save();
        this.context.translate(this.position.x*this.radius*2,this.position.y*this.radius*2);
        this.context.drawImage(this.img, -r,-r,2*r,2*r);
        this.context.restore();
    }
};

Ball.prototype.fn_stop = function () {

};

Ball.prototype.fn_update = function () {

};

Ball.prototype.setRadius = function (n) {
    this.radius = n;
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

Ball.prototype.getPosition = function(){
    return this.position;
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
    return (Math.pow(e.x-x,2) + Math.pow(e.y-y,2) < Math.pow(this.radius * (1 - this.padding),2));
};

