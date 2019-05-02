/* eslint-disable */
// const CanvasDrawer = require('./drawcanvas.js').CanvasDrawer;
// const CanvasDrawer = require('./webglcanvas.js').CanvasDrawer;

class MajClient {
    constructor(canvas){
        //console.log(canvas);
        // this.drawer = new CanvasDrawer(canvas);
        this.resetParam();
        // this.InitWebsocket();
    }
    
    resetParam(){
        this.seat = 0;
        this.qinjia = 0;
        this.changfeng = 0;
        this.zifeng = 0;
        this.changbang = 0;
        this.lizhibang = 0;
        this.score = [0,0,0,0];
        this.restyama = 0;
        this.bao = [];
        this.libao = [];
        this.handStack = [[],[],[],[]];
        this.fuluStack = [[],[],[],[]];
        this.riverStack = [[],[],[],[]];
        this.playerLizhi = [false,false,false,false];
        this.playerLizhiPai = [false,false,false,false];
        this.canDiscard = [];
        this.subOptOn = false;
        this.lizhiOn = false;
        this.optFlag = {};
        this.combShow = {};
        this.comb = {};
        this.serverConnected = false;
        this.wsMsg = '';
        this.score = [25000,25000,25000,25000];
        this.tweenedScore = [0,0,0,0],
        this.fenpei = [1000,-1000,2000,-1000],
        this.tweenedFenpei = [0,0,0,0],
        this.humsg = {};
        this.huList = [];
        this.huPos = 0;
        this.liumsg = {};
        this.fanPos = 0;
        this.curWind = 0;
        // this.canDiscard = [];
        // this.subOptOn = false;
        // this.lizhiOn = false;
        this.hintOn = false;
        this.scoreChangeOn = false;
        this.endGameOn = false;
        this.lizhi_tile = '';
        this.txtMsg = ['','','',''];
        this.tingPai = [];
        this.charaName = ['','','',''];
        this.charaPic = ['','','',''];
        this.voiceList = [];
    }

    InitWebsocket(){
        var _self = this;
        var wbAdress = process.env.NODE_ENV == 'development' ? 'ws://localhost:8182' : 'wss://liantui.moe:8182';
        this.ws = new WebSocket(wbAdress);
        this.ws.onopen = function(){
            console.log("连接服务器成功");
            _self.wsMsg = '连接服务器成功';
            _self.serverConnected = true;
            _self.resetParam();
        }
        this.ws.onclose = function(){
            console.log("服务器关闭");
            _self.wsMsg = '服务器关闭';
            _self.serverConnected = false;
            _self.resetParam();
        }
        this.ws.onerror = function(){
            console.log("连接出错");
            _self.wsMsg = '连接出错';
            _self.serverConnected = false;
            // _self.resetParam();
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
        else if(e.type == "ActionHule"){
            var _self = this;
            // TODO: 多人胡牌的情况
            this.huList = e.data;
            this.huPos = 0;
            for(var submsg of e.data){
                this.txtMsg[submsg.seat] = submsg.opt==9?'胡':'自摸';
                var sound = new Howl({
                    src: '/audio/'+this.charaName[submsg.seat]+'/'+(submsg.opt==9?'act_ron.mp3':'act_tumo.mp3'),
                    autoplay: true
                });
                sound.once('end',function(){
                    _self.playHuEnded();
                });
            }
        }
        else if(e.type == 'ActionNewRound'){
            this.resetParam();
            // 初始起牌
            this.handStack[e.seat] = e.handStack;
            this.sortPai(e.seat);
            console.log(this.handStack);
        }
        else if(e.type == 'ActionDealTile'){
            // 新摸牌
            this.restyama = e.restyama;
            this.curWind = e.seat;
            var handStack = this.handStack[e.seat];
            if(e.tile==''){
                handStack.push('*');
            }else handStack.push(e.tile);
        }
        else if(e.type == 'ActionDiscardTile'){
            var _self = this;
            this.restyama = e.restyama;
            if(this.seat != e.seat){
                this.handStack[e.seat].splice(e.tilepos,1);
            }
            var tile = e.tile;
            if(e.is_liqi || e.is_wliqi){
                this.txtMsg[e.seat] = '立直';
                this.playerLizhi[e.seat] = true;
                tile += '*';
                let sound = new Howl({
                    src: '/audio/'+this.charaName[e.seat]+'/'+(e.is_liqi?'act_rich.mp3':'act_drich.mp3'),
                    autoplay: true,
                    onend: function() {
                        console.log('Finished!');
                        _self.playLizhiEnded(e);
                    }
                });
            }
            this.riverStack[e.seat].push(tile);
        }
        else if(e.type == 'ActionChiPengGang'){
            var _self = this;
            // 将牌从手牌中剔除，加入副露中
            let pid = e.seat;
            var sound = new Howl({
                src: '/audio/'+this.charaName[pid]+'/'+['act_chi.mp3','act_pon.mp3','act_kan.mp3'][e.opt-2],
                autoplay: true,
                onend: function() {
                    console.log('Finished!');
                    _self.txtMsg[pid] = ['吃','碰','杠'][e.opt-2];
                    _self.playFuluEnded(e);
                }
            });
        }
        else if(e.type == 'ActionAnGangAddGang'){
            var _self = this;
            // 将牌从手牌中剔除，加入副露中
            let pid = e.seat;
            var sound = new Howl({
                src: '/audio/'+this.charaName[pid]+'/act_kan.mp3',
                autoplay: true,
                onend: function() {
                    console.log('Finished!');
                    _self.txtMsg[pid] = ['杠'];
                    _self.playGangEnded(e);
                }
            });
        }
        else if(e.type == 'ActionLiuJu'){
            // 流局
            this.liumsg = e;
            if(e.opt == 2){
                for(let ii in e.tingPai){
                    // 听牌的人展示手牌
                    if(e.xiangting[ii] == 0){
                        this.handStack[ii] = e.hand[ii];
                        this.sortPai(ii);
                        this.tingPai[ii] = e.tingpai;
                        // this.fuluStack[ii] = e.fulu[ii];
                    }
                }
                // this.fenpei = e.fenpei;
            }else{
                // this.fenpei = [0,0,0,0];
            }
            
            // 九种展示手牌
        }else if(e.type == 'ActionEndGame'){
            this.endGameOn = true;
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

    playHuEnded(){
        this.humsg = this.huList[this.huPos];
        let pid = this.humsg.seat;
        this.txtMsg[pid] = '';
        this.handStack[pid] = this.humsg.hand;
        this.sortPai(pid);
        
        // 生成报菜名表
        this.voiceList = FanTool.getVoiceList(this.humsg.ptres);

        var _self = this;
        let task = [];
        for(var ii in this.voiceList){
            let file = '/audio/'+this.charaName[pid]+'/'+this.voiceList[ii];
            let tk = callback => {
                var sound = new Howl({
                    src: file,
                    autoplay: true
                });
                sound.on('end',function(){
                    console.log(file);
                    callback(null,file);
                });
                _self.fanPos++;
            }
            task.push(tk);
        }
        this.fanPos = 0;
        async.series(task,(err,results)=>{
            if(err) console.log(err);
            console.log('voice play all done!');
        });
    }

    playGangEnded(e){
        let pid = e.seat;
        this.txtMsg[pid] = '';
        for(let ii in e.tiles){
            var p = e.tiles[ii];
            var from = e.from[ii];
            if(from != this.seat){
                // 其他人副露
                this.handStack[from].splice(0,1);
                continue;
            }else{
                let index = this.handStack[from].indexOf(p);
                if(index == -1){
                    console.log('副露牌错误',p);
                }else{
                    this.handStack[from].splice(index,1);
                }
            }
        }
        this.fuluStack[pid].push(e.tiles.join('|'));
    }

    playFuluEnded(e){
        let pid = e.seat;
        this.txtMsg[pid] = '';
        // 副露
        for(let ii in e.tiles){
            var p = e.tiles[ii];
            var from = e.from[ii];
            if(p.length == 2) {
                if(from != this.seat){
                    // 其他人副露
                    this.handStack[from].splice(0,1);
                    continue;
                }else{
                    let index = this.handStack[from].indexOf(p);
                    if(index == -1){
                        console.log('副露牌错误',p);
                    }else{
                        this.handStack[from].splice(index,1);
                    }
                }
            }else{
                // 河牌中取出
                this.riverStack[from].pop();
            }
        }
        this.fuluStack[pid].push(e.tiles.join('|'));
    }

    playLizhiEnded(e){
        this.score[e.seat] -= 1000;
        this.txtMsg[e.seat] = '';
    }

    sortScore(){
        var plist = [];
        for(var ss in this.score){
            plist.push({
                id: ss,
                score: this.score[ss],
                wind: ss
            });
        }
        plist.sort((a,b)=>{
            if(a.score == b.score){
                return a.wind - b.wind;
            }
            return a.score - b.score;
        })
        return plist.map((x)=>{return x.id});
    }

    imgUrl(code){
        return '/img/'+code+'.png';
    }

    headUrl(i){
        return '/img/'+this.charaPic[i]+'.png';
    }

    checkLast(index,seat){
        let flag1 = (index==this.handStack[seat].length-1)&&(this.handStack[seat].length+this.fuluStack[seat].length*3==14);
        return flag1;
    }

    preloadVoiceList(){
        return FanTool.getPreloadVoice();
    }

    preloadImgList(){
        var imglist = [];
        for(var ch of ['m','p','s','z']){
            let maxn = ch=='z'?7:10;
            for(let n=1;n<=maxn;n++){
                imglist.push('/img/'+(n==10?0:n)+ch+'.png');
            }
        }
        return imglist;
    }

    sortPai(seat){
        function cmp(a,b){
            var tv = {"m":0,"p":1,"s":2,"z":3};
            a = a.replace('0','5');
            b = b.replace('0','5');
            if(a.length != b.length){
                return a.length-b.length;
            }
            if(a[1] == b[1]){
                return a[0]-b[0];
            }
            return tv[a[1]]-tv[b[1]];
        }
        this.handStack[seat].sort(cmp);
    }

    sortFulu(code){
        var strList = code.split('|');
        function cmps(a,b){
            if(a.length == b.length){
                return a[0]-b[0];
            }
            return b.length-a.length;
        }
        strList.sort(cmps);
        let pf = strList[0]
        if(pf.length == 3){
            if(pf[2]=='-');
            else if(pf[2] == '='){
                let temp = strList[1];
                strList[1] = strList[0];
                strList[0] = temp;
            }
            else if(pf[2]=='+'){
                let temp = strList.shift();
                strList.push(temp);
            }
        }
        return strList;
    }

}

var client = new MajClient();
// export default MajClient;

export default {
    name: 'NetWatcher',
    data() {
        return {
            serverConnected: client.serverConnected,
            wsMsg: client.wsMsg,
            seat: client.seat,
            qinjia: client.qinjia,
            changfeng: client.changfeng,
            zifeng: client.zifeng,
            changbang: client.changbang,
            lizhibang: client.lizhibang,
            score: client.score,
            tweenedScore: client.tweenedScore,
            fenpei: client.fenpei,
            tweenedFenpei: client.tweenedFenpei,
            restyama: client.restyama,
            bao: client.bao,
            handStack: client.handStack,
            fuluStack: client.fuluStack,
            riverStack: client.riverStack,
            playerLizhi: client.playerLizhi,
            playerLizhiPai: client.playerLizhiPai,
            humsg: client.humsg,
            huList: client.huList,
            huPos: client.huPos,
            liumsg: {},
            lizhi_state: false,
            fanPos: 0,
            curWind: 0,
            canDiscard: [],
            subOptOn: false,
            lizhiOn: false,
            hintOn: false,
            scoreChangeOn: false,
            endGameOn: false,
            lizhi_tile: '',
            txtMsg: ['','','',''],
            tingPai: [],
            optFlag: {},
            combShow: {},
            comb: {},
            charaName: ['','','',''],
            charaPic: ['','','',''],
            voiceList: []
        }
    },
    computed: {
        hasOption: function(){
            for (var n in client.optFlag) {
                if(n == 'qie') continue;
                return true;
            }
            return false;
        }
    },
    methods: {
        reLink: function(){
            client.InitWebsocket();
        },
        handFlip: function(){
            var hand = [];
            var repeat = {};
            for(var p of client.handStack[client.seat]){
                if(repeat[p] == undefined){
                    repeat[p] = 0;
                }else{
                    repeat[p]++;
                }
                hand.push(p+repeat[p]);
            }
            return hand;
        },
        lizhiMask: function(index){
            return client.lizhiOn && !client.canDiscard[index];
        },
        getTingPai: function(index){
            if(!client.lizhiOn) return[];
            let dapai = client.handStack[client.seat][index];
            for(var comb of client.combShow){
                // console.log('tingpai:',index,comb);
                if(comb.dapai == dapai){
                    client.hintOn = true;
                    return comb.ting;
                }
            }
            return [];
        },
        confirmOpt: function(fp){
            this.huPos++;
            if(this.huPos < this.huList.length){
                this.playHuEnded();
                return;
            }
            if(!this.scoreChangeOn){
                this.scoreChangeOn = true;
                this.tweenedScore = this.score;
                this.tweenedFenpei = fp;
                setTimeout(() => {
                    var fi = [0,0,0,0];
                    for(var msg of this.huList){
                        for(var i in msg.ptres.fenpei){
                            fi[i] = this.score[i] + fp[i];
                        }
                    }
                    this.score = fi;
                    this.fenpei = [0,0,0,0];
                }, 1000);
                return;
            }
            this.resetParam();
            this.ws.send(JSON.stringify({
                type:'confirm',
                from: this.seat
            }))
        },
        imgUrl: function(code){
            return '/img/'+code+'.png';
        },
        headUrl: function(i){
            return '/img/'+this.charaPic[i]+'.png';
        },
        checkLast: function(index,seat){
        let flag1 = (index==this.handStack[seat].length-1)&&(this.handStack[seat].length+this.fuluStack[seat].length*3==14);
        return flag1;
        },
        preloadVoiceList: function(){
            return FanTool.getPreloadVoice();
        },
        preloadImgList: function(){
            var imglist = [];
            for(var ch of ['m','p','s','z']){
                let maxn = ch=='z'?7:10;
                for(let n=1;n<=maxn;n++){
                    imglist.push('/img/'+(n==10?0:n)+ch+'.png');
                }
            }
            return imglist;
        },
        sortFulu: function(code){
            var strList = code.split('|');
            function cmps(a,b){
                if(a.length == b.length){
                    return a[0]-b[0];
                }
                return b.length-a.length;
            }
            strList.sort(cmps);
            let pf = strList[0]
            if(pf.length == 3){
                if(pf[2]=='-');
                else if(pf[2] == '='){
                    let temp = strList[1];
                    strList[1] = strList[0];
                    strList[0] = temp;
                }
                else if(pf[2]=='+'){
                    let temp = strList.shift();
                    strList.push(temp);
                }
            }
            return strList;
        },
        sortScore: function(){
            var plist = [];
            for(var ss in this.score){
                plist.push({
                    id: ss,
                    score: this.score[ss],
                    wind: ss
                });
            }
            plist.sort((a,b)=>{
                if(a.score == b.score){
                    return a.wind - b.wind;
                }
                return a.score - b.score;
            })
            return plist.map((x)=>{return x.id});
        }
    },
    watch: {
        
    },
}