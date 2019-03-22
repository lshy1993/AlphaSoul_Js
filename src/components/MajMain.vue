<template>
  <div class="hello">
    <h1>科学麻将算法解析</h1>
    <div>
      <div style="height: 130px; width: 1200px; display:inline-block;">
        <div v-for="(code,index) in handStack" :key="index" @click="removePai(index)" :class="['PaiDiv', index==13?'Last':'']">
          <img :src="imgUrl(code)" width="80" height="129"/>
        </div>
      </div>
      <div>
        <div>{{ handStack }}</div>
        <button @click="clearHand">清空</button>
        <button @click="sortPai">整理</button>
        <button @click="judgeTing">判定</button>
      </div>
    </div>
    <div style="position:fixed; right:0; bottom:0">
      <div style="height:20px; background: pink;">
        选牌器
      </div>
      <div v-for="(ch,index) in ['m','p','s','z']" :key="index">
        <div v-for="(num,index) in (ch == 'z'?7:9)" :key="index" @click="addPai(num+ch)" class="PaiDiv">
          <img :src="imgUrl(num+ch)" width="40" height="65"/>
        </div>
      </div>
    </div>
    <div v-if="mode == 1">
      <div style="background: green; color:white;">切牌提示</div>
      <table>
        <tr>
          <th style="width: 60px">切牌</th>
          <th style="width: 60px">向听数</th>
          <th style="width: 800px">进张（听牌）</th>
          <th style="width: 60px">牌效</th>
          <th style="width: 100px">胡牌得分</th>
        </tr>
        <tr v-for="(list,index) in cal_res" :key="index" :class="list[1]>n_xiangting?'Bad':'Good'">
          <td>
            <img :src="imgUrl(list[0])" width="40" height="65"/>
          </td>
          <td>{{ list[1] }}</td>
          <td class="PaiList">
            <div v-for="(pcode,ind) in list[2]" :key="ind" class="PaiDiv">
              <img :src="imgUrl(pcode)" width="40" height="65"/>
              ×{{ aiplayer.paishu[pcode[1]][pcode[0]] }}
            </div>
          </td>
          <td>{{ list[3].toFixed(2) }}</td>
          <td>{{ list[4] }}</td>
        </tr>
      </table>
    </div>
    <div v-if="mode == 0">
      <div style="background: skyblue; color:white;">{{ n_xiangting == 0?"听牌": n_xiangting+"向听 有效进张" }}</div>
      <table>
        <tr>
          <th style="width: 60px">听牌</th>
          <th style="width: 80px">剩余</th>
          <th style="width: 600px">胡牌</th>
          <th style="width: 80px">点数</th>
          <th>番</th>
        </tr>
        <tr v-for="(list,index) in ting_res" :key="index">
          <td>
            <img :src="imgUrl(list[0])" width="40" height="65"/>
          </td>
          <td>{{ list[1] }}</td>
          <td class="PaiList">
            <div v-for="(pcode,ind) in list[2]" :key="ind" class="PaiDiv">
              <img :src="imgUrl(pcode)" width="40" height="65"/>
            </div>
          </td>
          <td>{{ list[3].defen }}</td>
          <td>
            <div style="float:left;">
              <span v-for="(yaku,index) in list[3].hupai" :key="index">{{ yaku.name + ":" + yaku.fanshu + " " }}</span>
            </div>
          </td>
        </tr>
      </table>
    </div>
    <div v-if="mode == -1">
      <div style="background: brown; color:white;">胡牌详情</div>
      <h2 v-for="(fan,index) in ptResult.hupai" :key="index">
        {{ fan.name + fan.fanshu }}
      </h2>
      <h1>{{ ptResult.defen }}</h1>
    </div>
  </div>
</template>

<script>
import { PaiMaker,TingJudger, PtJudger, RonJudger } from '../majtool.js';
import { AI_Core } from '../ai_core.js';

export default {
  name: 'MajMain',
  data(){
    return{
      handStack: [ "1m", "1m", "2m", "2m", "3m", "3m", "4m", "4m", "5m", "5m", "6m", "6m", "7m", "7m" ],
      fuluStack: [],
      cal_res: [],
      ting_res: [],
      paishu: {
        'm': [1, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        'p': [1, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        's': [1, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        'z': [0, 4, 4, 4, 4, 4, 4, 4]
      },
      paiCode: [
        "1m","2m","3m","4m","5m","6m","7m","8m","9m",
        "1p","2p","3p","4p","5p","6p","7p","8p","9p",
        "1s","2s","3s","4s","5s","6s","7s","8s","9s",
        "1z","2z","3z","4z","5z","6z","7z"
      ],
      paiDisp: [
        "一","二","三","四","五","六","七","八","九",
        "①","②","③","④","⑤","⑥","⑦","⑧","⑨",
        "１","２","３","４","５","６","７","８","９",
        "東","南","西","北", //场风
        "白","發","中" //役牌
      ],
      n_xiangting: 8,
      fulu_xiangting: 0,
      mode: 0,
      ptResult: Object,
      aiplayer: Object
    }
  },
  created(){
    this.aiplayer = new AI_Core();
  },
  methods:{
    addPai: function(p){
      if(this.handStack.length<14){
        this.aiplayer.deletePai(p);
        this.handStack.push(p);
      }
      this.aiplayer.handStack = this.handStack;
    },
    removePai: function(i){
      this.handStack.splice(i,1);
    },
    sortPai: function(){
      function cmp(a,b){
        var tv = {"m":0,"p":1,"s":2,"z":3};
        if(a[1] == b[1]){
          return a[0]-b[0];
        }
        return tv[a[1]]-tv[b[1]];
      }
      this.handStack.sort(cmp);
      this.judgeTing();
    },
    clearHand: function(){
      this.handStack = [];
      this.cal_res = [];
      this.n_xiangting = 0;
      this.ptResult = Object;
    },
    imgUrl: function(code){
      return "/img/"+code+".png";
    },
    judgeTing: function(){
      var param = {
        zhuangfeng: 0,   /* 場風 */
        menfeng: 0,      /* 自風 */
        hupai: {
            lizhi:      1,        /* 門前の場合はリーチする前提 */
            yifa:       0,
            qianggang:  false,
            lingshang:  false,
            haidi:      0,
            tianhu:     0
        },
        baopai:     [],       /* ドラ */
        fubaopai:   [],
        jicun:      { changbang: 0, lizhibang: 0 }
      };
      if(this.handStack.length == 13){
        this.mode = 0;
        // 求听牌（有效进张）
        var pcount = PaiMaker.GetCount(this.handStack);
        this.n_xiangting = TingJudger.xiangting(pcount, this.fuluStack);
        var tingpai = TingJudger.tingpai(pcount, this.fuluStack);
        var tingRes = [];
        for (var tp of tingpai) {
          // 听牌(向听为0)时，计算可能的胡牌分数
          let num = tp[0];
          let ch = tp[1];
          if(num == 5 && ch != 'z'){
            // 增加一次红宝的计算
            let red_tp = 0+ch;
            let red_huStack = this.handStack.concat(red_tp);
            let ptres = PtJudger.GetFen(red_huStack,this.fuluStack,red_tp+'_',param);
            tingRes.push([red_tp,this.paishu[ch][0],red_huStack,ptres]);
          }
          var new_huStack = this.handStack.concat(tp);
          var ptres = PtJudger.GetFen(new_huStack,this.fuluStack,tp+'_',param);
          //计算剩余牌数与得分
          var restNum = this.paishu[ch][num];
          if(num == 5) restNum-this.paishu[ch][0];
          tingRes.push([tp,this.paishu[ch][num],new_huStack,ptres]);
        }
        this.ting_res = tingRes;
      }else if(this.handStack.length == 14){
        var pcount = PaiMaker.GetCount(this.handStack);
        this.n_xiangting = TingJudger.xiangting(pcount, this.fuluStack);
        if(this.n_xiangting == -1){
          this.mode = -1;
          let hupai = this.handStack[this.handStack.length-1]+'_';
          //console.log(RonJudger.Ron(this.handStack,hupai,this.fuluStack));
          //console.log(hupai);
          this.ptResult = PtJudger.GetFen(this.handStack,this.fuluStack,hupai,param)
        }else{
          this.mode = 1;
          this.aiplayer.handStack = this.handStack;
          this.aiplayer.ResetPaiCount();
          var dapai = this.aiplayer.FindQie()
          //console.log("打牌：", dapai);
          this.cal_res = this.aiplayer.cal_res;
        }
      }else{
        this.xiangting = 8;
        this.cal_res = [];
        this.ting_res = [];
        return;
      }
      
      //console.log(pcount);
      //var fulu_xiangting = aiplayer.xiangting(pcount);
      //console.log("副露向听：", fulu_xiangting);
      
      //console.log("向听数：", this.n_xiangting);

      
    }
  }
}
</script>

<style>
table {
  text-align: center;
}
.PaiList{
  text-align: left;
}
.PaiDiv {
  display: inline-block;
}
.Last{
  margin-left: 30px;
}
.Good{
  background: #9FF048;
}
.Bad{
  background: #E03636;
}
</style>
