<template>
  <div class="hello">
    <h1>科学麻将算法解析</h1>
    <div>
      <div style="display:inline-block;">
        <div v-for="(code,index) in handStack" :key="index" @click="removePai(index)" :class="['PaiDiv', index==13?'Last':'']">
          <img :src="imgUrl(code)" width="80" height="129"/>
        </div>
      </div>
      <div style="margin:10px;">{{ handStack }}</div>
      <div>
        <button @click="clearHand">清空</button>
        <button @click="sortPai">整理</button>
        <button @click="judgeTing">判定</button>
        场风
        <select v-model="param.zhuangfeng">
          <option value ="0">东</option>
          <option value ="1">南</option>
          <option value ="2">西</option>
          <option value ="3">北</option>
        </select>
        自风
        <select v-model="param.menfeng">
          <option value ="0">东</option>
          <option value ="1">南</option>
          <option value ="2">西</option>
          <option value ="3">北</option>
        </select>
        立直
        <select v-model="param.hupai.lizhi">
          <option value ="0">无</option>
          <option value ="1">立直</option>
          <option value ="2">两立直</option>
        </select>
        <label for="yifa">
          <input type="checkbox" id="yifa" v-model="param.hupai.yifa">一发
        </label>
        <label for="qianggang">
          <input type="checkbox" id="qianggang" v-model="param.hupai.qianggang">抢杠
        </label>
        <label for="lingshang">
          <input type="checkbox" id="lingshang" v-model="param.hupai.lingshang">岭上
        </label>
        <label for="haidi">
          <input type="checkbox" id="haidi" v-model="param.hupai.haidi">海底
        </label>
      </div>
    </div>
    <div class="PaiSelector">
      <div style="width:400px; background: pink;" class="BoxHead" @click="selectorOn=!selectorOn">选牌器</div>
      <transition name="fade">
        <div v-if="selectorOn" style="text-align:left;overflow:hidden">
          <div v-for="(ch,index) in ['m','p','s','z']" :key="index">
            <div v-for="(num,index) in (ch == 'z'?7:10)" :key="index" @click="addPai(ch=='z'?num:num-1,ch)" class="PaiDiv">
              <img :src="imgUrl((ch=='z'?num:num-1)+ch)" width="40" height="65"/>
            </div>
          </div>
        </div>
      </transition>
    </div>
    <div v-if="mode == -1" class="HintBox">
      <div style="background: brown; color:white;" class="BoxHead">胡牌详情</div>
      <h2 v-for="(fan,index) in ptResult.hupai" :key="index">
        {{ fan.name + fan.fanshu }}
      </h2>
      <h1>{{ ptResult.defen }}</h1>
    </div>
    <div v-if="mode == 1">
      <div v-if="fulumz.length>0" class="HintBox">
        <div style="background: green; color:white;" class="BoxHead">副露可能</div>
        <div v-for="(opt,index) in fulumz" :key="index">
          {{ fuluDisp[opt[1]]+"："}}
          <div v-for="(p,index) in opt[0].split('|')" :key="index" class="PaiDiv">
            <img :src="imgUrl(p[0]+p[1])" width="40" height="65"/>
          </div>
        </div>
      </div>
      <div class="HintBox">
        <div style="background: green; color:white;" class="BoxHead">切牌提示</div>
        <table>
          <tr>
            <th style="width:60px">切牌</th>
            <th style="width:50px;min-width:20px;">向听</th>
            <th style="width:800px;min-width:200px;">进张（听牌）</th>
            <th style="width:100px;min-width:50px">牌效</th>
            <th style="width:100px;min-width:50px">得分</th>
          </tr>
          <tr v-for="(list,index) in cal_res" :key="index" :class="list[1]>n_xiangting?'Bad':'Good'">
            <td>
              <img :src="imgUrl(list[0])" width="40" height="65"/>
            </td>
            <td>{{ list[1] }}</td>
            <td class="PaiList">
              <div v-for="(pcode,ind) in list[2]" :key="ind" :class="['PaiDiv']">
                <img :src="imgUrl(pcode)" width="40" height="65"/>
                ×{{ paishu[pcode[1]][pcode[0]] }}
              </div>
            </td>
            <td>{{ list[3].toFixed(2) }}</td>
            <td>{{ list[4] }}</td>
          </tr>
        </table>
      </div>
    </div>
    <div v-if="mode == 0" class="HintBox">
      <div style="background: skyblue; color:white;" class="BoxHead">{{ n_xiangting == 0?"听牌": n_xiangting+"向听 有效进张" }}</div>
      <table>
        <tr>
          <th style="min-width: 60px">{{ n_xiangting == 0?"听牌":"进张" }}</th>
          <th style="width: 80px;min-width:20px;">剩余</th>
          <th style="width: 600px;min-width:200px;">{{ n_xiangting == 0 ? "和了形":"进张形" }}</th>
          <th style="min-width: 60px">点数</th>
          <th style="min-width: 120px">番</th>
        </tr>
        <tr v-for="(list,index) in ting_res" :key="index">
          <td>
            <img :src="imgUrl(list[0])" width="40" height="65"/>
          </td>
          <td>{{ list[1] }}</td>
          <td class="PaiList">
            <div v-for="(pcode,ind) in list[2]" :key="ind" :class="['PaiDiv', ind==list[2].length-1?'Last':'']" >
              <img :src="imgUrl(pcode)" width="40" height="65"/>
            </div>
          </td>
          <td>{{ list[3].defen }}</td>
          <td>
            <div>
              <div v-for="(yaku,index) in list[3].hupai" :key="index">{{ yaku.name + ":" + yaku.fanshu }}</div>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import { PaiMaker,TingJudger, PtJudger, RonJudger,MianziMaker } from '../majtool.js';
import { AI_Core } from '../ai_core.js';

export default {
  name: 'MajMain',
  data(){
    return{
      handStack: [ "1m", "1m", "2m", "2m", "3m", "3m", "4m", "4m", "5m", "5m", "6m", "6m", "7m", "7m" ],
      fuluStack: [],
      cal_res: [],
      ting_res: [],
      fulumz: [],
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
      fuluDisp:{
        2:"吃", 3:"碰", 4:"暗杠", 5:"明杠", 6:"加杠"
      },
      n_xiangting: 8,
      fulu_xiangting: 0,
      param: {
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
        jicun: { changbang: 0, lizhibang: 0 }
      },
      mode: 0,
      ptResult: Object,
      aiplayer: Object,
      selectorOn: true
    }
  },
  created(){
    this.aiplayer = new AI_Core();
  },
  methods:{
    addPai: function(num,ch){
      console.log(ch,num);
      if(this.handStack.length<14 && this.paishu[ch][num]>0){
        this.handStack.push(num+ch);
      }
      this.paishu = this.countPai();
    },
    removePai: function(i){
      this.handStack.splice(i,1);
    },
    sortPai: function(){
      function cmp(a,b){
        var tv = {"m":0,"p":1,"s":2,"z":3};
        a = a.replace('0','5');
        b = b.replace('0','5');
        if(a[1] == b[1]){
          //if(a[0] == 0) return 5-b[0];
          return a[0]-b[0];
        }
        return tv[a[1]]-tv[b[1]];
      }
      this.handStack.sort(cmp);
      //this.judgeTing();
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
      //统计牌数
      this.paishu = this.countPai();
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
            let ptres = PtJudger.GetFen(red_huStack,this.fuluStack,red_tp+'_',this.param);
            tingRes.push([red_tp,this.paishu[ch][0],red_huStack,ptres]);
          }
          var new_huStack = this.handStack.concat(tp);
          var ptres = PtJudger.GetFen(new_huStack,this.fuluStack,tp+'_',this.param);
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
          this.ptResult = PtJudger.GetFen(this.handStack,this.fuluStack,hupai,this.param)
        }else{
          this.mode = 1;
          this.aiplayer.handStack = this.handStack;
          this.aiplayer.paishu = this.countPai();
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
      var hupai = this.handStack[this.handStack.length-1];
      var fulu_xiangting = this.aiplayer.fulu_xiangting(pcount,[]);
      console.log("副露向听：", fulu_xiangting);
      this.fulumz = MianziMaker.GetFuluMianzi(this.handStack,this.fuluStack,hupai);
      var mm = this.aiplayer.FindFulu(this.fulumz);
      console.log("副露选择：",mm);
      //console.log("向听数：", this.n_xiangting);
      
    },
    countPai: function(){
      var paiCount = {
        'm': [1, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        'p': [1, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        's': [1, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        'z': [0, 4, 4, 4, 4, 4, 4, 4]
      };
      for(var p of this.handStack){
        let num = p[0];
        let ch = p[1];
        if (num == 0) {
          // 红宝 同时充当0与5，计算2次
          paiCount[ch][5] -= 1;
        }
        paiCount[ch][num] -= 1;
      }
      return paiCount;
    }
  }
}
</script>

<style>
.HintBox{
  text-align: center;
  margin: 10px;
}
.BoxHead{
  padding: 5px;
  margin-bottom: 5px; 
}
.PaiSelector{
  position:fixed;
  right:0;
  bottom:0;
  background:white;
}
img{
  -webkit-user-select: none;
}
table {
  text-align: center;
  border-collapse: collapse;
}
td {
  border: 1px solid gray; 
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
.fade-enter-active, .fade-leave-active {
  /*transition: opacity .5s;*/
  transition: height 0.5s;
}
.fade-enter-to, .fade-leave /* .fade-leave-active below version 2.1.8 */ {
  height: 276px;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  height: 0;
}
</style>
