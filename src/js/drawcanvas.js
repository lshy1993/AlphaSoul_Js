/* eslint-disable */
class CanvasDrawer {
    constructor(canvas){
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');
        //this.context = this.canvas.getContext('webgl');
        //this.context.clearColor(0.0,0.0,0.0,1.0);
    }
    getPos(seat){
        var px = [65,735,735,65][seat];
        var py = [735,735,65,65][seat];
        return { x:px,y:py };
    }
    drawDealPai(seat,pai,i){
        this.context.save();
        let p = this.getPos(seat);
        this.context.translate(p.x, p.y);
        this.context.rotate(-seat/2*Math.PI);
        var img = new Image();
        img.src = "/img/"+pai+".png";
        let x = 10+40*i;
        let y = 0;
        this.context.drawImage(img,x,y,40,65);
        this.context.restore();
    }
    clearDealPai(seat,i){
        this.context.save();
        let p = this.getPos(seat);
        this.context.translate(p.x, p.y);
        this.context.rotate(-seat/2*Math.PI);
        let x = 10+40*i;
        let y = 0;
        this.context.clearRect(x,y,40,65);
        this.context.restore();
    }
    drawPai(seat,pList){
        this.context.save();
        let p = this.getPos(seat);
        this.context.translate(p.x, p.y);
        this.context.rotate(-seat/2*Math.PI);
        for(var i in pList){
            let pai = pList[i];
            var img = new Image();
            img.src = "/img/"+pai+".png";
            let x = 40*i;
            let y = 0;
            this.context.drawImage(img,x,y,40,65);
        }
        this.context.fillText(seat,10,10);
        this.context.restore();
    }
    clearPai(seat){
        this.context.save();
        let p = this.getPos(seat);
        this.context.translate(p.x, p.y);
        this.context.rotate(-seat/2*Math.PI);
        this.context.clearRect(x,y,40*14,65);
        this.context.restore();
    };
    drawRiver(seat,pList){
        this.context.save();
        this.context.translate(400,400);
        this.context.rotate(-seat/2*Math.PI);
        this.context.translate(-400,-400);
        for(var i in pList){
            let pai = pList[i];
            var img = new Image();
            img.src = "/img/"+pai+".png";
            let x = 280+40*(i % 6);
            let lv = Math.floor(i/6);
            let y = 520+65*(lv>2?2:lv);
            this.context.drawImage(img,x,y,40,65);
        }
        this.context.restore();
    }
}

export { CanvasDrawer };