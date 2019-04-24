<template>
<div>
    <div class="menuDiv">
        <h2>在线AI对战测试系统</h2>
        <button @click="reLink">ReLink</button><button @click="newGame">Start</button>
    </div>
    <!-- 宝牌指示 -->
    <div class="baoDiv">
        <div v-for="(code,index) in bao" :key="index" :class="['PaiDiv']">
            <img :src="imgUrl(code)" width="40" height="65"/>
        </div>
        <div>场棒：{{ changbang }} 立直棒：{{ lizhibang }}</div>
    </div>
    <!-- 牌桌 -->
    <div class="TableDiv">
        <div v-for="pid in 3" :key="pid" :class="getHandPos(pid)">
            <div style="display: inline-block; float:left;">
                aaaaaaaaaaaaaaaaa
                <div v-for="(code,index) in handStack[pid]" :key="index" :class="['PaiDiv']">
                    <img :src="imgUrl(code)" width="40" height="65"/>
                </div>
            </div>
            <div style="display: inline-block; float:right;">
                副露
            </div>
        </div>
        <div v-for="pid in 4" :key="pid" :style="getPos(pid)">
            <div v-for="(code,index) in riverStack[pid-1]" :key="index" :class="['PaiDiv']">
                <img :src="imgUrl(code)" width="40" height="65"/>
            </div>
        </div>

        <div class="CenterDiv">
            <div>{{ restyama }}</div>
        </div>
        <!-- 得分和终局 -->
        <div v-if="ptres.defen != undefined" class="scoreDiv">
            <div style="display: inline-block;">
                <div v-for="(code,index) in handStack" :key="index" :class="['PaiDiv']">
                    <img :src="imgUrl(code)" width="40" height="65"/>
                </div>
                <div>

                </div>
            </div>
            <div>
                <div style="display: inline-block;">
                    <div v-for="(code,index) in bao" :key="index" :class="['PaiDiv']">
                        <img :src="imgUrl(code)" width="40" height="65"/>
                    </div>
                </div>
                <div style="display: inline-block;">
                    <div v-for="(code,index) in libao" :key="index" :class="['PaiDiv']">
                        <img :src="imgUrl(code)" width="40" height="65"/>
                    </div>
                </div>
            </div>
            <div v-for="(mianzi,index) in ptres.hupai" :key="index">
                <span>{{ mianzi.name }}</span>
                <span>{{ mianzi.fanshu }}番</span>
            </div>
            <div>{{ ptres.fu  }}符 {{ ptres.fanshu }}番 {{ ptres.defen }}</div>
            <div>{{ ptres.fenpei }}</div>
            <button @click="confirmOpt">确认</button>
        </div>
    </div>
    <!-- 玩家操作UI部分 -->
    <div class="PlayerUI">
        <div class="optDiv">
            <button v-if="optFlag.chi" @click="selectOpt(2)">吃</button>
            <button v-if="optFlag.peng" @click="selectOpt(3)">碰</button>
            <button v-if="optFlag.gang" @click="selectOpt(4)">杠</button>
            <button v-if="optFlag.lizhi" @click="selectOpt(7)">立直</button>
            <button v-if="optFlag.zimo" @click="selectOpt(8)">自摸</button>
            <button v-if="optFlag.hu" @click="selectOpt(9)">胡</button>
            <button v-if="optFlag.liuju" @click="selectOpt(10)">流局</button>
            <button v-if="hasOption" @click="cancelOpt">取消</button>
        </div>
        <div v-if="subOptOn">
            <div v-for="(cb,cbindex) in combShow" :key="cbindex" @click="sendOpt(cb)">
                <div v-for="(p,index) in cb.split('|')" :key="index" class="PaiDiv">
                    <img :src="imgUrl(p[0]+p[1])" width="40" height="65"/>
                </div>
            </div>
        </div>
        <div class="handDiv">
            <div v-for="(code,index) in handStack" :key="index" @click="discardPai(index)" :class="['PaiDiv', index==13?'Last':'']">
                <img :src="imgUrl(code)" width="80" height="129"/>
                <div :class="['PaiDiv',lizhiMask(index)?'BigMask':'']"></div>
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
            libao: [],
            handStack: [],
            fuluStack: [[],[],[],[]],
            riverStack: [[],[],[],[]],
            ptres: {},
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
                //ws.send("game1");
            }
            this.ws.onclose = function(){
                console.log("服务器关闭");
            }
            this.ws.onerror = function(){
                console.log("连接出错");
            }
            this.ws.onmessage = function(msg){
                var e = JSON.parse(msg.data);
                _self.decode(e);
            }
        },
        decode: function(e){
            console.log(e);
            if(e.type == "ActionHule"){
                this.ptres = e;
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
                this.handStack = gs.handStack;
                this.sortPai();
            }
            else if(e.type == 'ActionDealTile'){
                // 新摸牌
                //var gs = e.data;
                this.handStack.push(e.tile);
                this.handStack.forEach((element,i) => {
                    this.canDiscard[i] = true;
                });
                this.restyama = e.restyama;

            }
            else if(e.type == 'ActionDiscardTile'){
                this.restyama = e.restyama;
                this.riverStack[e.seat].push(e.tile);
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
            this.fuluStack = [[],[],[],[]];
            this.riverStack = [[],[],[],[]];
            this.handStack = [];
            this.ws.send(JSON.stringify({type:'newgame'}));
        },
        changeFlag: function(gs){
            //1切 2吃 3碰 4暗杠 5明杠 6加杠 7立直 8自摸 9胡 10九种 11拔北
            this.optFlag = {};
            this.comb = gs;
            for(var opt of gs){
                let type = opt.type;
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
            this.handStack.sort(cmp);
        },
        discardPai: function(index){
            if(!this.canDiscard[index]) return;
            this.canDiscard = [];
            let dapai = this.handStack[index];
            this.ws.send(JSON.stringify({
                type:'qiepai',
                from: this.seat,
                tile: dapai,
                lizhi: this.lizhiOn
            }));
            this.handStack.splice(index,1);
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
                        from: this.seat,
                        combination: tt[0]
                    });
                }
            }else if(key == 7){
                this.selectLizhi(tt[0].combination);
            }else if(key == 8 || key == 9){
                this.sendOpt({
                    type: 'huzimo',
                    from: this.seat
                });
            }else if(key == 10){
                this.sendOpt({
                    type: 'liuju',
                    from: this.seat
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
            this.handStack.forEach((ele,i) => {
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
                return;
            }
            if(this.lizhiOn){
                this.lizhiOn = false;
                this.canDiscard = [];
                return;
            }
            this.ws.send(JSON.stringify({
                type:'cancel',
                from: this.seat
            }));
            this.optFlag = {};
        },
        confirmOpt: function(){
            this.ptres = {};
            this.fuluStack = [[],[],[],[]];
            this.riverStack = [[],[],[],[]];
            this.handStack = [];
            this.ws.send(JSON.stringify({
                type:'confirm',
                from: this.seat
            }))
        },
        imgUrl: function(code){
            return "/img/"+code+".png";
        },
        getPos: function(pid){
            var str = 'transform:rotate('+-90*(pid-1)+'deg); width:240px; position:absolute; text-align:left;';
            var pos = ['top: 550px;left:280px;','bottom: 340px;left:440px;','bottom:500px;right:280px;','right:440px;top: 390px;'][pid-1];
            return str+pos;
        },
        getHandPos: function(pid){
            return ["rightHand","topHand","leftHand"][pid-1];
        }
    },
}
</script>

<style>
.BigMask{
    mix-blend-mode: inherit;
    background:rgba(0, 0, 0, 0.5);
    position: absolute;
    top: 0;
    left: 0;
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
.rightHand{
    position: absolute;
    height: 65px;
    width: 650px;
    transform-origin: 0 0;
    transform: translate(735px, 650px) rotate(-90deg);
}
.topHand{
    position: absolute;
    height: 65px;
    width: 650px;
    transform-origin: 0 0;
    transform: translate(650px, 65px) rotate(-180deg);
}
.leftHand{
    position: absolute;
    height: 65px;
    width: 650px;
    transform-origin: 0 0;
    transform: translate(65px, 150px) rotate(-270deg);
}
.CenterDiv{
    position: relative;
    top: 300px;
    width: 250px;
    height: 250px;
    margin: auto;
    background: rgba(0,0,0,0.5);
}
.scoreDiv{
    position: relative;
    width: 800px;
    height: 400px;
    margin: auto;
    color: white;
    background: rgba(0,0,0,0.5);
}
.PlayerUI{
    position: fixed;
    bottom: 0px;
    width: 100%;
}
.handDiv{
    display: block;
    width: 1200px;
    margin: 0 auto;
}
.optDiv{
    display: block;
    text-align: right;
    width: 1000px;
    margin: 0 auto 20px auto;
}
.optDiv button{
    width: 100px;
    height: 40px;
    margin-left: 20px;
}
</style>
