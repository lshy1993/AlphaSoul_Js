/* eslint-disable */
//const CanvasDrawer = require('./drawcanvas.js').CanvasDrawer;
const CanvasDrawer = require('./webglcanvas.js').CanvasDrawer;

class MajClient {
    constructor(canvas){
        //console.log(canvas);
        this.drawer = new CanvasDrawer(canvas);
        this.InitParams();
        this.InitWebsocket();
    }
    
    InitParams(){
        this.seat = 0;
        this.qinjia = 0;
        this.changfeng = 0;
        this.zifeng = 0;
        this.changbang = 0;
        this.lizhibang = 0;
        this.score = [0,0,0,0];
        this.restyama = 0;
        this.bao = [];
        this.handStack = [[],[],[],[]];
        this.fuluStack = [[],[],[],[]];
        this.riverStack = [[],[],[],[]];
        this.canDiscard = [];
        this.subOptOn = false;
        this.lizhiOn = false;
        this.optFlag = {};
        this.combShow = {};
        this.comb = {};
    }

    InitWebsocket(){
        var _self = this;
        this.ws = new WebSocket('ws://localhost:8182');
        this.ws.onopen = function(e){
          console.log("连接服务器成功");
        }
        this.ws.onclose = function(e){
          console.log("服务器关闭");
        }
        this.ws.onerror = function(){
          console.log("连接出错");
        }
        this.ws.onmessage = function(msg){
            var e = JSON.parse(msg.data);
            _self.Action(e);
        }
    }

    Action(e){
        console.log(e);
        if(e.type == 'GameInit'){
            // 链接初始化
            let gs = e.data;
            this.yama = gs.yama;
            this.handStack = gs.handStack;
            this.riverStack = gs.riverStack;
            this.fuluStack = gs.fuluStack;
            this.bao = gs.bao;
            this.libao = gs.libao;
            this.yamaPos = gs.yamaPos;
            this.yamaLast = gs.yamaLast;
            this.changfeng = gs.changfeng;
            this.playerWind = gs.playerWind;
            this.playerLizhi = gs.playerLizhi;
            this.changbang = gs.changbang;
            this.lizhibang = gs.lizhibang;
            this.score = gs.score;
            this.curWind = gs.curWind;
            this.sortPai(0);
            this.sortPai(1);
            this.sortPai(2);
            this.sortPai(3);
        }
        else if(e.type == 'ActionNewRound'){
            this.InitParams();
            // 初始起牌
            this.qinjia = e.qinjia;
            this.changfeng = e.changfeng;
            this.zifeng = e.zifeng;
            this.changbang = e.changbang;
            this.lizhibang = e.lizhibang;
            this.score = e.score;
            this.bao = e.bao;
            this.handStack[e.seat] = e.handStack;
            this.sortPai(e.seat);
            this.drawer.clearPai(e.seat);
            this.drawer.drawPai(e.seat,this.handStack[e.seat]);
        }
        else if(e.type == 'ActionDealTile'){
            this.restyama = e.restyama;
            this.handStack[e.seat].push(e.tile);
            this.drawer.drawDealPai(e.seat,e.tile,this.handStack[e.seat].length-1);
        }
        else if(e.type == 'ActionDiscardTile'){
            this.restyama = e.restyama;
            let tilepos = this.handStack[e.seat].indexOf(e.tile);
            this.handStack[e.seat].splice(tilepos,1);
            this.sortPai(e.seat);
            this.riverStack[e.seat].push(e.tile);
            this.drawer.clearDealPai(e.seat,this.handStack[e.seat].length);
            this.drawer.drawPai(e.seat,this.handStack[e.seat]);
            this.drawer.drawRiver(e.seat,this.riverStack[e.seat]);
        }
        if(e.hasOwnProperty('operation')){

        }
    }

    sortPai(seat){
        function cmp(a,b){
            var tv = {"m":0,"p":1,"s":2,"z":3};
            a = a.replace('0','5');
            b = b.replace('0','5');
            if(a[1] == b[1]){
                return a[0]-b[0];
            }
            return tv[a[1]]-tv[b[1]];
        }
        this.handStack[seat].sort(cmp);
    }
}

export default MajClient;