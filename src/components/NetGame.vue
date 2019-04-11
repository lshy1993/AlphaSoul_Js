<template>
<div>
    <span>在线AI对战测试系统<button @click="reLink">ReLink</button><button @click="newGame">Start</button></span>
    <div class="TableDiv">
        <div v-for="pid in 4" :key="pid" :style="getPos(pid)">
            <div v-for="(code,index) in riverStack[pid-1]" :key="index" :class="['PaiDiv']">
                <img :src="imgUrl(code)" width="40" height="65"/>
            </div>
        </div>
        <div class="CenterDiv">
            <div>{{ restyama }}</div>
            <div v-for="(code,index) in bao" :key="index" :class="['PaiDiv']">
                <img :src="imgUrl(code)" width="40" height="65"/>
            </div>
        </div>
    </div>
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
            handStack: [],
            fuluStack: [[],[],[],[]],
            riverStack: [[],[],[],[]],
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
            this.ws.onopen = function(e){
                console.log("连接服务器成功");
                //ws.send("game1");
            }
            this.ws.onclose = function(e){
                console.log("服务器关闭");
            }
            this.ws.onerror = function(){
                console.log("连接出错");
            }
            this.ws.onmessage = function(msg){
                var e = JSON.parse(msg.data);
                console.log(e);
                if(e.type == 'ActionNewRound'){
                    // 初始起牌
                    var gs = e.data;
                    _self.qinjia = gs.qinjia;
                    _self.changfeng = gs.changfeng;
                    _self.zifeng = gs.zifeng;
                    _self.changbang = gs.changbang;
                    _self.lizhibang = gs.lizhibang;
                    _self.score = gs.score;
                    _self.bao = gs.bao;
                    _self.handStack = gs.handStack;
                    _self.sortPai();
                }
                if(e.type == 'ActionDealTile'){
                    // 新摸牌
                    //var gs = e.data;
                    _self.handStack.push(e.tile);
                    _self.handStack.forEach((element,i) => {
                        _self.canDiscard[i] = true;
                    });
                    _self.restyama = e.restyama;

                }
                if(e.type == 'ActionDiscardTile'){
                    _self.restyama = e.restyama;
                    _self.riverStack[e.seat].push(e.tile);
                }
                if(e.hasOwnProperty('operation')){
                    _self.changeFlag(e.operation);
                    if(e.lizhi_state && !_self.hasOption){
                        setTimeout(() => {
                            _self.discardPai(gs.tile);
                        }, 500);
                    }
                }
            }
        },
        newGame: function(){
            this.fuluStack = [[],[],[],[]];
            this.riverStack = [[],[],[],[]];
            this.handStack = [];
            this.ws.send(JSON.stringify({type:'newgame'}));
        },
        changeFlag: function(gs,lizhi){
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
                from: 0,
                pai: dapai,
                lizhi: this.lizhiOn
            }));
            this.handStack.splice(index,1);
            this.sortPai();
        },
        selectOpt: function(key){
            let tt = this.comb.filter((x)=>{
                if(key == 4){
                    if(x.type in [4,5,6]) return x.comb;
                }
                if(x.type == key) return x.comb;
            });
            // console.log(key,tt);
            if(key <= 4){
                if(tt.length > 1){
                    this.combShow = tt;
                    this.subOptOn = true;
                }else{
                    this.sendOpt({
                        type:'chipenggang',
                        from: 0,
                        comb: tt[0]
                    });
                }
            }else if(key == 7){
                this.selectLizhi(tt[0].comb);
            }else if(key == 8 || key == 9){
                this.sendOpt({
                    type:'huzimo',
                    from: 0
                });
            }else if(key == 10){
                this.sendOpt({
                    type:'liuju',
                    from: 0
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
                from: 0
            }));
            this.optFlag = {};
        },
        imgUrl: function(code){
            return "/img/"+code+".png";
        },
        getPos: function(pid){
            var str = 'transform:rotate('+-90*(pid-1)+'deg);width:240px;position:absolute;';
            var pos = ['top: 500px;left:300px;','bottom: 300px;left:600px;','bottom:500px;right:300px;','right:600px;bottom: 300px;'][pid-1];
            return str+pos;
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
.TableDiv{
    position: relative;
    width: 800px;
    height: 800px;
    margin: 0 auto;
}
.CenterDiv{
    position: relative;
    top: 300px;
    width: 200px;
    height: 200px;
    margin: auto;
}
.PlayerUI{
    position: fixed;
    bottom: 0;
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
