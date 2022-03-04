<template>
<div id="ConsoleDiv" class="BorderDiv">
    <h2>AlphaConsole</h2>
    <div style="width: 360px;">
        <div v-for="(code,index) in ai.cal_res" :key="index" style="width: 50px; float:left;">
            <div class="PaiDivS">
                <img :src="imgUrl(code[0].substr(0,2))" />
            </div>
            <div>{{ parseInt(code[1]) }}</div>
            <div>{{ code[3].toFixed(2) }}</div>
        </div>
    </div>
</div>
</template>

<script>
/* eslint-disable */
const AI_Core = require('../js/ai_core.js').AI_Core;
export default {
    name: 'GameAssist',
    data() {
        return {
            ai: Object,
        }
    },
    props: ['gameStatus'],
    created() {
        this.ai = new AI_Core();
    },
    watch: {
        gameStatus:(newVal,oldVal)=>{
            console.log(newVal);
            this.ai.zifeng = newVal.zifeng;
            this.ai.bao = newVal.bao;
            this.ai.changbang = newVal.changbang;
            this.ai.changfeng = newVal.changfeng;
            this.ai.fuluStack = newVal.fuluStack[newVal.seat];
            this.ai.handStack = newVal.handStack[newVal.seat];
            this.ai.lizhibang = newVal.lizhibang;
            this.ai.playerLizhi = newVal.playerLizhi;
            this.ai.qinjia = newVal.qinjia;
            this.ai.riverStack = newVal.riverStack;
            // this.ai.score = newVal.score;
        }
    },
    methods: {
        Init: function(){
            let newVal = this.gameStatus;
            this.ai.zifeng = newVal.zifeng;
            this.ai.bao = newVal.bao;
            this.ai.changbang = newVal.changbang;
            this.ai.changfeng = newVal.changfeng;
            this.ai.fuluStack = newVal.fuluStack[newVal.seat];
            this.ai.handStack = newVal.handStack[newVal.seat];
            this.ai.lizhibang = newVal.lizhibang;
            this.ai.playerLizhi = newVal.playerLizhi;
            this.ai.qinjia = newVal.qinjia;
            this.ai.riverStack = newVal.riverStack;
            // this.ai.score = newVal.score;
        },
        Calculate: function(){
            // console.log('cal!');
            this.Init();
            this.ai.FindQie();
            this.$emit("dyeTile",this.ai.cal_res);
        },
        imgUrl(code){
            return '/img/'+code+'.png';
        }
    },
}
</script>

<style lang="scss">
#ConsoleDiv {
    position: absolute;
    top: 310px;
    left: 20px;
    // border: 
}
</style>
