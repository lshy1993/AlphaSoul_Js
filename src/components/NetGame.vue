<template>
<div>
    <h1>在线AI对战测试系统</h1>
    <button @click="NewGame">Start</button>
    <div>
        <div v-for="pid in 4" :key="pid">
            <div v-for="(code,index) in fuluStack[pid-1]" :key="index" :class="['PaiDiv']">
                <img :src="imgUrl(code)" width="80" height="129"/>
            </div>
        </div>
    </div>
    <div style="display:inline-block;">
        <button v-if="optFlag[1]">吃</button>
        <button v-if="optFlag[2]">碰</button>
        <button v-if="optFlag[3]">杠</button>
        <button v-if="optFlag[4]">胡</button>
        <button v-if="optFlag[5]">自摸</button>
        <button v-if="optFlag[6]">立直</button>
        <button v-if="optFlag[7]">流局</button>
        <button v-if="hasOption">取消</button>
    </div>
    <div style="display:inline-block;">
        <div v-for="(code,index) in handStack" :key="index" @click="discardPai(index)" :class="['PaiDiv', index==13?'Last':'']">
            <img :src="imgUrl(code)" width="80" height="129"/>
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
            handStack: [],
            fuluStack: [[],[],[],[]],
            canDiscard: false,
            optFlag: [false,false,false,false,false,false,false]
        }
    },
    computed: {
        hasOption: function(){
            return this.optFlag.filter((x)=>{return x;}).length > 0;
        }
    },
    created(){
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
            //console.log(msg);
            var e = JSON.parse(msg.data);
            console.log(e);
            if(e.type == 'qipai'){
                // 初始起牌
                _self.handStack = e.handStack;
            }
            if(e.type == 'mopai'){
                // 新摸牌
            }
        }
    },
    methods: {
        NewGame: function(){
            this.ws.send(JSON.stringify({type:'newgame'}));
        },
        InitStatus: function(){

        },
        discardPai: function(index){
            if(!canDiscard) return;
            let dapai = this.handStack[index];
            this.ws.send(JSON.stringify({type:'qiepai',pai:dapai}));
            this.canDiscard = false;
        },
        imgUrl: function(code){
            return "/img/"+code+".png";
        },
    },
}
</script>

<style>

</style>
