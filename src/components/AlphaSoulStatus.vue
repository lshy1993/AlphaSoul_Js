<template>
<div id="status" class="BorderDiv">
    <div style="font-weight: bold;">AlphaSoul 历史战绩</div>
    <div id="tabDiv">
        <button @click="curId=0">AlphaSoul令和</button>
        <button @click="curId=1">AlphaSoul科学</button>
        <button @click="curId=2">AlphaSoul昭和</button>
        <button @click="curId=3">AlphaSoul玄学</button>
    </div>
    <div v-if="battle[curId] != undefined" id="detailDiv">
        <div style="overflow:hidden;">
            <h2 style="text-align:left;">最近大胡<span style="float:right;">{{ getTypeTxt() }}</span></h2>
            <div>
                <div v-for="(hcode,hindex) in maxWinHand()" :key="'h'+hindex" :class="['PaiDivS',hcode.length==3?'LastS':'']">
                    <img :src="imgUrl(hcode.substr(0,2))" />
                </div>
                <div v-for="(fcode,findex) in maxWinFulu()" :key="'f'+findex" class="Mianzi">
                    <div v-for="(p,i) in sortFulu(fcode)" :key="'ch'+i" :class="['PaiDivS',p.length>2?'PaiRotateS':'']">
                        <img :src="imgUrl(p.substr(0,2))" />
                    </div>
                </div>
            </div>
        </div>
        <div>
        </div>
        <h2 style="text-align:left;">详细信息</h2>
        <div class="subTable">
            <div class="subHead" @click="windOn=!windOn">南风场</div>
            <table v-if="windOn">
                <tr>
                    <th>1位率</th>
                    <td>{{ (battle[curId].sumRank1/battle[curId].plays*100).toFixed(2) }}</td>
                    <th>总局数</th>
                    <td>{{ battle[curId].plays }}</td>
                    <th>和牌率</th>
                    <td>{{ (battle[curId].sumHu/battle[curId].subplays*100).toFixed(2) }}</td>
                </tr>
                <tr>
                    <th>2位率</th>
                    <td>{{ (battle[curId].sumRank2/battle[curId].plays*100).toFixed(2) }}</td>
                    <th>平均打点</th>
                    <td>{{ (battle[curId].sumPt/battle[curId].sumHu).toFixed(0) }}</td>
                    <th>自摸率</th>
                    <td>{{ (battle[curId].sumZimo/battle[curId].sumHu*100).toFixed(2) }}</td>
                </tr>
                <tr>
                    <th>3位率</th>
                    <td>{{ (battle[curId].sumRank3/battle[curId].plays*100).toFixed(2) }}</td>
                    <th>平均顺位</th>
                    <td>{{ ((battle[curId].sumRank1+battle[curId].sumRank2*2+battle[curId].sumRank3*3+battle[curId].sumRank4*4)/battle[curId].plays*100).toFixed(2) }}</td>
                    <th>放铳率</th>
                    <td>{{ (battle[curId].sumChong/battle[curId].subplays*100).toFixed(2) }}</td>
                </tr>
                <tr>
                    <th>4位率</th>
                    <td>{{ (battle[curId].sumRank1/battle[curId].plays*100).toFixed(2) }}</td>
                    <th>最大连庄</th>
                    <td>{{ battle[curId].maxZhuang }}</td>
                    <th>副露率</th>
                    <td>{{ (battle[curId].sumFulu/battle[curId].subplays*100).toFixed(2) }}</td>
                </tr>
                <tr>
                    <th>被飞率</th>
                    <td>{{ (battle[curId].sumMinus/battle[curId].plays*100).toFixed(2) }}</td>
                    <th>和了巡数</th>
                    <td>{{ (battle[curId].sumXun/battle[curId].sumHu).toFixed(2) }}</td>
                    <th>立直率</th>
                    <td>{{ (battle[curId].sumLizhi/battle[curId].subplays*100).toFixed(2) }}</td>
                </tr>
            </table>
        </div>
        <div class="subTable">
            <div class="subHead" @click="yakuOn=!yakuOn">番数累计达成次数</div>
            <transition name="fadeyaku">
                <div v-if="yakuOn" class="yakuListDiv">
                    <div v-for="(col,index) in columnName" :key="col" class="list">
                        <span style="float:left;">{{ index }}</span>
                        <span style="float:right;width: 100px;text-align:right;">{{ yaku[curId][col] }}</span>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</div>
</template>

<script>
import FanTool from '../js/fan.js';

export default {
    name: 'AlphaSoulStatus',
    data() {
        return {
            battle: Object,
            yaku: Object,
            maxwin: Object,
            curId: 0,
            columnName: {},
            windOn: true,
            yakuOn: false
        }
    },
    created() {
        this.columnName = FanTool.columnName;
        this.getData();
    },
    methods: {
        getData(){
            this.$http.get("http://localhost:3000/maj").then((response)=>{
                // console.log(response.data);
                this.battle = response.data.battle;
                this.yaku = response.data.yaku;
                this.maxwin = response.data.maxwin;
            });
        },
        maxWinHand(){
            let max = this.maxwin[this.curId];
            if(max.hand == "") return;
            let hand = max.hand.split(',');
            return hand; 
        },
        maxWinFulu(){
            let max = this.maxwin[this.curId];
            if(max.fulou == "") return;
            let hand = max.fulou.split(',');
            return hand; 
        },
        getTypeTxt(){
            let type = this.maxwin[this.curId].type;
            if(type<0){
                return ['','两倍','三倍','四倍','五倍','六倍'][1-type]+'役满';
            }
            else{
                return ['','满贯','跳满','倍满','三倍满','累计役满'][type];
            }
        },
        imgUrl(code){
            return '/img/'+code+'.png';
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
    },
    components:{

    }
}
</script>

<style lang="scss">
#status {
    display: inline-block;
    vertical-align: top;
    box-sizing: border-box;
    background: rgba(0, 51, 102, 0.5);
    height: 100%;
    padding: 10px;

    button {
        width: 150px;
        height: 40px;
    }

    table{
        color: gold;
        tr{
            height: 30px;
        }

        th {
            width: 100px;
            color: #2c3e50;
        }
        td {
            width: 100px;
        }
    }
    #tabDiv{
        height: 40px;
        overflow: hidden;
        margin-top: 10px;
    }
    #detailDiv{
        overflow-y: scroll;
        height: 520px;
        padding: 10px;
        box-sizing: border-box;
    }

    #detailDiv::-webkit-scrollbar {
        width: 8px;
    }
    #detailDiv::-webkit-scrollbar-track {
        background-color:skyblue;
        -webkit-border-radius: 2em;
        -moz-border-radius: 2em;
        border-radius:2em;
    }
    #detailDiv::-webkit-scrollbar-thumb {
        background-color:gold;
        -webkit-border-radius: 2em;
        -moz-border-radius: 2em;
        border-radius:2em;
    }

    .subTable{
        width: 600px;
        margin-top: 20px;

        .subHead{
            height: 30px;
            text-align: left;
            font-size: 24px;
            border: solid 1px gold;
        }
    }
    .subHead{
        height: 30px;
        text-align: left;
        font-size: 24px;
        padding: 10px 20px;
        border: solid 1px gold;
    }
    .list {
        display: block;
        // clear: both;
        height: 30px;
        line-height: 30px;
        // width: 200px;
    }
    .yakuListDiv {
        margin: 10px;
        transition: all 0.3s;
    }
}
</style>
