<template>
  <div id="majtool">
    <h1>科学麻将算法解析</h1>
    <div>
      <div style="display:inline-block;">
        <div v-for="(code,index) in handStack" :key="index" @click="removePai(index)" :class="['PaiDiv', index==13?'Last':'']">
          <img :src="imgUrl(code)" width="80" height="129"/>
          <div :style="'mix-blend-mode:color; background:rgba(159, 240, 72,'+normalized[code]/2+')'" class="PaiDiv BigMask" />
        </div>
      </div>
      <div style="margin:10px;">{{ handStack }}</div>
      <div>
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
        <button @click="paiGen">随机生成</button>
        <button @click="clearHand">清空</button>
        <button @click="sortPai">整理</button>
        <button @click="judgeTing">判定</button>
        
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
      <h1>{{  ptResult.fu+"符"+ptResult.fanshu+"番" }}</h1>
      <h1>{{ ptResult.defen }}</h1>
    </div>
    <div v-if="fulumz.length>0" class="HintBox">
      <div style="background: green; color:white;" class="BoxHead">副露可能</div>
      <table>
        <tr>
          <th>种类</th>
          <th>副露</th>
          <th>EV</th>
        </tr>
        <tr v-for="(opt,index) in fulu_res" :key="index">
          <td>{{ fuluDisp[opt[1]]+"："}}</td>
          <td>
            <div v-for="(p,index) in opt[0].split('|')" :key="index" class="PaiDiv">
              <img :src="imgUrl(p[0]+p[1])" width="40" height="65"/>
            </div>
          </td>
          <td>{{ opt[2] }}</td>
        </tr>
      </table>
    </div>
    <div v-if="mode == 1" class="HintBox">
      <div style="background: green; color:white;" class="BoxHead">
        <label for="negative">
          <input type="checkbox" id="negative" v-model="badOption">显示所有
        </label>
        切牌提示</div>
      <table>
        <tr>
          <th style="width:60px">切牌</th>
          <th style="width:50px;min-width:20px;">向听</th>
          <th style="min-width:200px;">进张（听牌）</th>
          <th style="width:100px;min-width:50px">牌效<sup>*1</sup></th>
          <th style="width:100px;min-width:50px">牌重<sup>*2</sup></th>
          <th style="width:100px;min-width:50px">得分<sup>*3</sup></th>
        </tr>
        <tr v-for="(list,index) in resShow" :style="list[1]>n_xiangting?'background:rgba(224,54,54,0.5)':'background:rgba(159, 240, 72,'+normalized[list[0]]+')'" :key="index" >
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
          <td>{{ Math.floor(list[3]) }}</td>
          <td>{{ (list[3]-Math.floor(list[3])).toFixed(2) }}</td>
          <td>{{ list[4] }}</td>
        </tr>
      </table>
      <div>(1: 进章总数</div>
      <div>(2: 牌的重要程度，越小越重要</div>
      <div>(3: 胡牌得点×剩余枚数</div>
      <div>*: AlphaSoul的价效值</div>
    </div>
    <div v-if="mode == 0" class="HintBox">
      <div style="background: skyblue; color:white;" class="BoxHead">{{ n_xiangting == 0?"听牌": n_xiangting+"向听" }}</div>
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
import { PaiMaker, TingJudger, PtJudger, RonJudger, MianziMaker } from '../js/majtool.js';
import { AI_Core } from '../js/ai_core.js';
import qs from 'qs';

export default {
  name: 'MajMain',
  data(){
    return{
      handStack: [ "1m", "1m", "2m", "2m", "3m", "3m", "4m", "4m", "5m", "5m", "6m", "6m", "7m", "7m" ],
      fuluStack: [],
      cal_res: [],
      normalized: {},
      ting_res: [],
      fulu_res: [],
      fulumz: [],
      paishu: {
        'm': [1, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        'p': [1, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        's': [1, 4, 4, 4, 4, 4, 4, 4, 4, 4],
        'z': [0, 4, 4, 4, 4, 4, 4, 4]
      },
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
      selectorOn: true,
      badOption: false
    }
  },
  created(){
    this.aiplayer = new AI_Core(-1,false);
  },
  computed:{
    resShow: function(){
      var result = [];
      result = this.cal_res.filter((ele)=>{
        return this.badOption || ele[1] <= this.n_xiangting;
      });
      return result;
    }
  },
  methods:{
    paiGen: function(){
      this.normalized = {};
      var plist = PaiMaker.GeneratePai();
      this.handStack = plist.slice(0,14);
      this.sortPai();
    },
    addPai: function(num,ch){
      // console.log(ch,num);
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
      this.normalized = {};
      this.handStack = [];
      this.cal_res = [];
      this.n_xiangting = 0;
      this.ptResult = Object;
    },
    normalize: function(){
      this.normalized = {};
      var min = Infinity,max = 0;
      for(let res of this.cal_res){
        if(res[3] == -1)continue;
        min = Math.min(min,res[3]);
        max = Math.max(max,res[3]);
      }
      for(let res of this.cal_res){
        this.normalized[res[0]] =res[3] == -1?0:((res[3]-min)/(max-min)).toFixed(2);
      }
      //if(plist[num] == undefined) return 0;
    },
    imgUrl: function(code){
      return "/img/"+code+".png";
    },
    judgeTing: function(){
      // this.$http.post("http://localhost:8282/",
      //   qs.stringify({
      //     handStack: this.handStack,
      //     fuluStack: this.fuluStack,
      //     param: this.param
      //   }),{
      //   eaders: {'content-type': 'application/x-www-form-urlencoded'}
      // }).then((response)=>{
      //   console.log(response);
      //   //this.setEventData(response.data);
      // });
      this.normalized = {};
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
        console.log('asss');
        this.n_xiangting =  this.aiplayer.fulu_xiangting(this.handStack,this.fuluStack);
        var hupai = this.handStack[this.handStack.length-1];
        if(this.n_xiangting == -1){
          this.mode = -1;
          this.ptResult = PtJudger.GetFen(this.handStack,this.fuluStack,hupai+'_',this.param)
        }else{
          this.mode = 1;
          this.aiplayer.handStack = this.handStack;
          this.aiplayer.paishu = this.countPai();
          this.aiplayer.FindQie();
          this.cal_res = this.aiplayer.cal_res;
          this.normalize();
        }
        this.fulumz = MianziMaker.GetFuluMianzi(this.handStack,this.fuluStack,hupai);
        this.fulu_res = this.aiplayer.FindFulu(this.fulumz);
      }else{
        this.xiangting = 8;
        this.cal_res = [];
        this.ting_res = [];
        return;
      }
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

<style lang="scss">

</style>