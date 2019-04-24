<template>
<div>
    <div class="menuDiv">
        <h2>在线AI对战测试系统</h2>
        <button @click="reLink">ReLink</button><button @click="newGame">Start</button>
    </div>
    <!-- 宝牌指示 -->
    <div class="baoDiv">
        <div v-for="index in 5" :key="index" :class="[index<=bao.length?'PaiDiv':'PaiMask']">
            <img v-if="index<=bao.length" :src="imgUrl(bao[index-1])" width="40" height="65"/>
        </div>
        <div>场棒：{{ changbang }} 立直棒：{{ lizhibang }}</div>
    </div>
    <!-- 牌桌 -->
    <div class="TableDiv">
        <div v-for="pidh in 3" :key="'hs'+pidh" :class="['HandDiv',['right','top','left'][pidh-1]]">
            <div style="display: inline-block; float:left;">
                <div v-for="ind in handStack[pidh].length" :key="ind" :class="['PaiMask']"></div>
            </div>
            <div style="display: inline-block; float:right;">
                <div v-for="(code,indc) in fuluStack[pidh]" :key="'fulu'+indc" class="Mianzi">
                    <div v-for="(p,i) in sortFulu(code)" :key="'ch'+i" :class="[p.length>2?'PaiRotateS':'PaiDiv']">
                        <img :src="imgUrl(p.substr(0,2))" width="40" height="65"/>
                    </div>
                </div>
            </div>
        </div>
        <div v-for="pidr in 4" :key="pidr" :class="['RiverDiv',['bottom','right','top','left'][pidr-1]]">
            <div v-for="(code,index) in riverStack[pidr-1]" :key="index" :class="['PaiDiv']">
                <img :src="imgUrl(code)" width="40" height="65"/>
            </div>
        </div>
        <div class="CenterDiv">
            <div v-for="pids in 4" :key="pids" :class="['ScoreDiv',['bottomScore','rightScore','topScore','leftScore'][pids-1]]">
                {{ score[pids-1] }}
                <span v-if="playerLizhi[pids-1]" style="color:red;">立直</span>
            </div>
            <div class="InfoPanel">
                <h1>{{ ['东','南','西','北'][changfeng]+['一','二','三','四'][qinjia]+'局' }}</h1>
                <div>剩余牌山：{{ restyama }}</div>
            </div>
        </div>
    </div>
    <!-- 得分和终局 -->
    <div v-if="humsg.ptres != undefined" class="ResultWrap">
        <div class="ResultDiv">
            <div>
                <div v-for="(hcode,hindex) in humsg.hand" :key="'h'+hindex" :class="['PaiDiv']">
                    <img :src="imgUrl(hcode)" width="40" height="65"/>
                </div>
                <div v-for="(fcode,findex) in humsg.fulu" :key="'f'+findex" class="Mianzi">
                    <div v-for="(p,i) in sortFulu(fcode)" :key="'ch'+i" :class="[p.length>2?'PaiRotate':'PaiDiv']">
                        <img :src="imgUrl(p.substr(0,2))" width="80" height="129"/>
                    </div>
                </div>
            </div>
            <div style="margin-top: 20px;">
                <span>宝牌：</span>
                <div style="display: inline-block;">
                    <div v-for="bindex in 5" :key="'b'+bindex" :class="[bindex>humsg.bao.length?'PaiMask':'PaiDiv']">
                        <img v-if="bindex<=humsg.bao.length" :src="imgUrl(humsg.bao[bindex-1])" width="40" height="65"/>
                    </div>
                </div>
                <span>里宝牌：</span>
                <div style="display: inline-block;">
                    <div v-for="lindex in 5" :key="'l'+lindex" :class="[lindex>humsg.libao.length?'PaiMask':'PaiDiv']">
                        <img v-if="lindex<=humsg.libao.length" :src="imgUrl(humsg.libao[lindex-1])" width="40" height="65"/>
                    </div>
                </div>
            </div>
            <div style="margin-top: 20px;">
                <div v-for="(mianzi,index) in humsg.ptres.hupai" :key="index" style="width: 200px;margin: auto;text-align:left;">
                    <span>{{ mianzi.name }}</span>
                    <span style="float:right;">{{ mianzi.fanshu }}番</span>
                </div>
            </div>
            <h2>{{ humsg.ptres.fu  }}符 {{ humsg.ptres.fanshu }}番 {{ humsg.ptres.defen }}</h2>
            <h4>{{ humsg.ptres.fenpei }}</h4>
            <button style="width:80px;height:40px;" @click="confirmOpt">确认</button>
        </div>
    </div>
    <!-- 玩家操作UI部分 -->
    <div class="PlayerUI">
        <div class="PlayerWrap">
            <div class="optDiv">
                <div v-if="subOptOn" style="display:inline-block;float:left;">
                    <div v-for="(cb,cbindex) in combShow" :key="cbindex" @click="sendOpt(cb)" style="display:inline-block;margin-right:10px;">
                        <div v-for="(p,index) in cb.combination.split('|')" :key="index" class="PaiDiv">
                            <img :src="imgUrl(p[0]+p[1])" width="40" height="65"/>
                        </div>
                    </div>
                </div>
                <button v-if="optFlag.chi" @click="selectOpt(2)">吃</button>
                <button v-if="optFlag.peng" @click="selectOpt(3)">碰</button>
                <button v-if="optFlag.gang" @click="selectOpt(4)">杠</button>
                <button v-if="optFlag.lizhi" @click="selectOpt(7)">立直</button>
                <button v-if="optFlag.zimo" @click="selectOpt(8)">自摸</button>
                <button v-if="optFlag.hu" @click="selectOpt(9)">胡</button>
                <button v-if="optFlag.liuju" @click="selectOpt(10)">流局</button>
                <button v-if="hasOption" @click="cancelOpt">取消</button>
            </div>
            <div class="handDiv">
                <div v-for="(code,index) in handStack[seat]" :key="index" @click="discardPai(index)" :class="['PaiDiv', index==13?'Last':'']">
                    <img :src="imgUrl(code)" width="80" height="129"/>
                    <div :class="['PaiDiv',lizhiMask(index)?'BigMask':'']"></div>
                </div>
            </div>
            <div class="fuluDiv">
                <div v-for="(code,indc) in fuluStack[seat]" :key="'fulu'+indc" class="Mianzi">
                    <div v-for="(p,i) in sortFulu(code)" :key="'ch'+i" :class="[p.length>2?'PaiRotate':'PaiDiv']">
                        <img :src="imgUrl(p.substr(0,2))" width="80" height="129"/>
                    </div>
                </div>
            </div>
        </div>
    </div>

</div>
</template>

<script>
export default {
    name: 'netgame',
    data(){
        return{
            ws: Object,
            seat: 0,
            qinjia: 0,
            changfeng: 0,
            zifeng: 0,
            changbang: 0,
            lizhibang: 0,
            score: [0,0,0,0],
            restyama: 0,
            bao: [],
            handStack: [[],[],[],[]],
            fuluStack: [[],[],[],[]],
            riverStack: [[],[],[],[]],
            playerLizhi: [false,false,false,false],
            humsg: {},
            canDiscard: [],
            subOptOn: false,
            lizhiOn: false,
            optFlag: {},
            combShow: {},
            comb: {}
        }
    },
    computed: {
        hasOption: function(){
            for (var n in this.optFlag) {
                if(n == 'qie') continue;
                return true;
            }
            return false;
            //return this.optFlag.filter((x)=>{return x;}).length > 0;
        },
    },
    created(){
        this.reLink();
    },
    methods: {
        reLink: function(){
            var _self = this;
            this.ws = new WebSocket('ws://localhost:8181');
            this.ws.onopen = function(){
                console.log("连接服务器成功");
                _self.resetParam();
            }
            this.ws.onclose = function(){
                console.log("服务器关闭");
                _self.resetParam();
            }
            this.ws.onerror = function(){
                console.log("连接出错");
                _self.resetParam();
            }
            this.ws.onmessage = function(msg){
                var e = JSON.parse(msg.data);
                _self.decode(e);
            }
        },
        resetParam: function(){
            this.humsg = {};
            this.bao = [];
            this.fuluStack = [[],[],[],[]];
            this.riverStack = [[],[],[],[]];
            this.handStack = [[],[],[],[]];
            this.playerLizhi = [false,false,false,false];
        },
        decode: function(e){
            console.log(e);
            if(e.type == "ActionHule"){
                this.humsg = e;
            }
            else if(e.type == 'ActionNewRound'){
                // 初始起牌
                var gs = e;
                this.seat = gs.seat;
                this.qinjia = gs.qinjia;
                this.changfeng = gs.changfeng;
                this.zifeng = gs.zifeng;
                this.changbang = gs.changbang;
                this.lizhibang = gs.lizhibang;
                this.score = gs.score;
                this.bao = gs.bao;
                for(var i in this.handStack){
                    if(i == this.seat) this.handStack[i] = gs.handStack;
                    else {
                        this.handStack[i] = new Array(13);
                        this.handStack[i].fill('*');
                    }
                }
                
                this.sortPai();
            }
            else if(e.type == 'ActionDealTile'){
                // 新摸牌
                var handStack = this.handStack[e.seat];
                handStack.push(e.tile);
                handStack.forEach((element,i) => {
                    this.canDiscard[i] = true;
                });
                this.restyama = e.restyama;

            }
            else if(e.type == 'ActionDiscardTile'){
                this.restyama = e.restyama;
                if(this.seat != e.seat){
                    this.handStack[e.seat].splice(e.tilepos,1);
                }
                if(e.is_liqi || e.is_wliqi){
                    this.playerLizhi[e.seat] = true;
                }
                this.riverStack[e.seat].push(e.tile);
            }
            else if(e.type == 'ActionChiPengGang'){
                // 将牌从手牌中剔除，加入副露中
                let pid = e.seat;
                for(var i in e.tiles){
                    var p = e.tiles[i];
                    var from = e.from[i];
                    if(p.length == 2) {
                        if(e.seat != this.seat){
                            // 其他人副露
                            this.handStack[pid].splice(0,1);
                            continue;
                        }
                        let index = this.handStack[pid].indexOf(p);
                        if(index == -1){
                            console.log('副露牌错误',p);
                        }
                        else this.handStack[pid].splice(index,1);
                    }else{
                        // 河牌中取出
                        this.riverStack[from].pop();
                    }
                }
                this.fuluStack[pid].push(e.tiles.join('|'));
                // 刷新？
            }

            if(e.hasOwnProperty('operation')){
                this.changeFlag(e.operation);
                if(e.lizhi_state && !this.hasOption){
                    setTimeout(() => {
                        this.discardPai(gs.tile);
                    }, 500);
                }
            }
        },
        newGame: function(){
            this.resetParam();
            this.ws.send(JSON.stringify({type:'newgame'}));
        },
        changeFlag: function(gs){
            //1切 2吃 3碰 4暗杠 5明杠 6加杠 7立直 8自摸 9胡 10九种 11拔北
            this.optFlag = {};
            this.comb = gs;
            for(var opt of gs){
                let type = opt.type;
                if(type == 1){
                    this.optFlag.qie = true;
                }
                if(type == 2){
                    this.optFlag.chi = true;
                }
                if(type == 3){
                    this.optFlag.peng = true;
                }
                if(type == 4 || type == 5 || type == 6){
                    this.optFlag.gang = true;
                }
                if(type == 7){
                    this.optFlag.lizhi = true;
                }
                if(type == 8){
                    this.optFlag.zimo = true;
                }
                if(type == 9){
                    this.optFlag.hu = true;
                }
                if(type == 10){
                    this.optFlag.liuju = true;
                }
            }
        },
        sortPai: function(){
            function cmp(a,b){
                var tv = {"m":0,"p":1,"s":2,"z":3};
                a = a.replace('0','5');
                b = b.replace('0','5');
                if(a[1] == b[1]){
                    return a[0]-b[0];
                }
                return tv[a[1]]-tv[b[1]];
            }
            this.handStack[this.seat].sort(cmp);
        },
        discardPai: function(index){
            if(!this.optFlag.qie) return;
            if(!this.canDiscard[index]) return;

            this.optFlag.qie = false;
            this.canDiscard = [];
            let dapai = this.handStack[this.seat][index];
            this.ws.send(JSON.stringify({
                type:'qiepai',
                from: parseInt(this.seat),
                tile: dapai,
                lizhi: this.lizhiOn
            }));
            this.handStack[this.seat].splice(index,1);
            this.sortPai();
        },
        selectOpt: function(key){
            let tt = this.comb.filter((x)=>{
                if(key == 4){
                    if(x.type in [4,5,6]) return x.combination;
                }
                if(x.type == key) return x.combination;
            });
            // console.log(key,tt);
            if(key <= 4){
                if(tt.length > 1){
                    this.combShow = tt;
                    this.subOptOn = true;
                }else{
                    this.sendOpt({
                        type: 'chipenggang',
                        from: parseInt(this.seat),
                        combination: [tt[0].combination, key]
                    });
                }
            }else if(key == 7){
                this.selectLizhi(tt[0].combination);
            }else if(key == 8 || key == 9){
                this.sendOpt({
                    type: 'huzimo',
                    from: parseInt(this.seat),
                    tile: tt[0].combination
                });
            }else if(key == 10){
                this.sendOpt({
                    type: 'liuju',
                    from: parseInt(this.seat)
                });
            }
        },
        sendOpt: function(obj){
            this.ws.send(JSON.stringify(obj));
            this.subOptOn = false;
            // this.combShow = {};
            // this.comb = {};
            this.optFlag = {};
        },
        selectLizhi: function(tiles){
            var ss = [];
            for(var pai of tiles){
                ss.push(pai.dapai);
            }
            console.log(ss);
            var handStack = this.handStack[this.seat];
            handStack.forEach((ele,i) => {
                this.canDiscard[i] = false;
                for(var p of ss){
                    if(ele == p) this.canDiscard[i] = true;
                }
            });
            this.lizhiOn = true;
        },
        lizhiMask: function(index){
            return this.lizhiOn && !this.canDiscard[index];
        },
        cancelOpt: function(){
            if(this.subOptOn){
                this.subOptOn = false;
                this.changeFlag(this.comb);
                return;
            }
            if(this.lizhiOn){
                this.lizhiOn = false;
                this.canDiscard = [];
                this.changeFlag(this.comb);
                return;
            }
            this.ws.send(JSON.stringify({
                type:'cancel',
                from: this.seat
            }));
            this.optFlag = {};
        },
        confirmOpt: function(){
            this.resetParam();
            this.ws.send(JSON.stringify({
                type:'confirm',
                from: this.seat
            }))
        },
        imgUrl: function(code){
            return "/img/"+code+".png";
        },
        sortFulu: function(code){
            var strList = code.split('|');
            function cmps(a,b){
                if(a.length == b.length){
                    return a[0]-b[0];
                }
                if(a[2]=='-') return -1;
                if(a[2]=='=') return 0;
                if(a[2]=='+') return 1;
                return b.length-a.length;
            }
            return strList;
        },
    },
}
</script>

<style lang="scss">
.BigMask{
    mix-blend-mode: inherit;
    background:rgba(0, 0, 0, 0.5);
    position: absolute;
    top: 0;
    left: 0;
}
.PaiMask{
    box-sizing: border-box;
    width: 40px;
    height: 65px;
    background: rgb(201, 124, 33);
    border: 1px solid gray;
    display: inline-block;
}
.PaiRotate{
    display: inline-block;
    text-align: left;
    transform-origin: 0 0;
    width: 129px;
    transform: translate(0px,129px) rotate(-90deg);
}
.PaiRotateS{
    display: inline-block;
    text-align: left;
    transform-origin: 0 0;
    width: 65px;
    transform: translate(0px,65px) rotate(-90deg);
}
.Mianzi{
    margin-left: 5px;
    float: right;
}
.menuDiv{
    position: fixed;
    top: 30px;
    left: 50px;
}
.baoDiv {
    position: fixed;
    top: 150px;
    left: 50px;
    width: 200px;
    height: 95px;
    background: rgba(0,0,0,0.2);
    text-align: left;
    padding: 10px;
}
.TableDiv{
    position: relative;
    width: 800px;
    height: 800px;
    margin: 0 auto;
    background: rgba(0,51,102,0.7);
}

.RiverDiv{
    position: absolute;
    height: 195px;
    width: 240px;
    text-align: left;
    transform-origin: 0% 0%;
    background: rgba(0, 0, 0, 0.1);

    &.bottom{
        transform: translate(275px,525px) rotate(0deg);
    }

    &.right{
        transform: translate(525px, 525px) rotate(-90deg);
    }

    &.top{
        transform: translate(525px, 275px) rotate(-180deg);
    }

    &.left{
        transform: translate(275px, 275px) rotate(-270deg);
    }
}

.HandDiv{
    position: absolute;
    height: 65px;
    width: 700px;
    transform-origin: 0 0;
    &.right{
        transform: translate(735px, 700px) rotate(-90deg);
    }
    &.top{
        transform: translate(700px, 65px) rotate(-180deg);
    }
    &.left{
        transform: translate(65px, 100px) rotate(-270deg);
    }
}

.ScoreDiv{
    position: absolute;
    height: 30px;
    width: 190px;
    transform-origin: 0 0;
    background: gray;

    &.bottomScore{
        transform: translate(30px,220px) rotate(0deg);
    }

    &.rightScore{
        transform: translate(220px, 220px) rotate(-90deg);
    }

    &.topScore{
        transform: translate(220px, 30px) rotate(-180deg);
    }

    &.leftScore{
        transform: translate(30px, 30px) rotate(-270deg);
    }
}

.CenterDiv{
    position: relative;
    top: 275px;
    width: 250px;
    height: 250px;
    margin: auto;
    background: rgba(0,0,0,0.5);
    color: white;

    .InfoPanel{
        width: 190px;
        height: 190px;
        transform: translate(30px,30px);
    }
}
.ResultWrap{
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0;

    .ResultDiv{
        position: relative;
        width: 800px;
        // height: 400px;
        margin: auto;
        padding: 20px;
        color: white;
        background: rgba(0,0,0,0.7);
    }
}

.PlayerUI{
    position: fixed;
    display: block;
    bottom: 0px;
    width: 100%;
}

.PlayerWrap{
    width: 1300px;
    margin: 0 auto;

    .optDiv{
        display: block;
        text-align: right;
        width: 1000px;
        height: 65px;
        margin: 0 auto 20px auto;
        
        button {
            width: 100px;
            height: 40px;
            margin-left: 20px;
        }
    }

    .handDiv {
        float: left;
        
    }
    
    .fuluDiv {
        float: right;
    }
}


</style>
