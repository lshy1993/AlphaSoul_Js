/* eslint-disable */ 
const TingJudger = require('./majtool').TingJudger;
const PaiMaker = require('./majtool').PaiMaker;
const RonJudger = require('./majtool').RonJudger;
const PtJudger = require('./majtool').PtJudger;

class AI_Core {
  constructor() {
    this.ResetParam(0);
    this.ResetPaiCount();
  }

  ResetParam(zi) {
    // 庄家位置
    this.qinjia = 0;
    // 场风
    this.zhuangfeng = 0;
    // 自风
    this.zifeng = zi;
    // 局数
    //this.jushu;
    // 储存场棒
    this.changbang = 0;
    // 储存立直棒
    this.lizhibang = 0;
    // 4家分数
    this.score = [25000, 25000, 25000, 25000];
    // 宝牌
    this.bao = [];
    // 个人手牌堆
    this.handStack = [];
    // 个人展露堆（含暗杠）
    this.fuluStack = [];

    // 4家牌河
    this.playerRiver = [[], [], [], []];
    // 风顺序的 玩家id
    this.playerWind = [0, 0, 0, 0];
    // 4家立直状态 0：无 1：立 2：w立
    this.playerLizhi = [0, 0, 0, 0];

    this.cal_res = [];
  }

  ResetPaiCount() {
    // 总牌数
    this.paishu = {
      'm': [1, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      'p': [1, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      's': [1, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      'z': [0, 4, 4, 4, 4, 4, 4, 4]
    };
    // 4家现物
    this.xianwu = [{},{},{},{}];
    // 4家立直状态 0：无 1：立 2：w立
    this.playerLizhi = [0, 0, 0, 0];
    // 个人手牌堆
    this.handStack = [];
    // 个人展露堆（含暗杠）
    this.fuluStack = [];
    // 上张打牌
    this.lastDiscard;
  }

  // 计算牌危险度
  weixian(pai, l) {
    var ch = pai[1];
    var n = pai[0]-0||5;
    if (this.xianwu[l][pai]) return 0;
    if (ch == 'z')   return Math.min(this.paishu[ch][n], 3);
    if (n == 1)     return this.xianwu[l][(n+3)+ch] ? 3 : 6;
    if (n == 9)     return this.xianwu[l][(n-3)+ch] ? 3 : 6;
    if (n == 2)     return this.xianwu[l][(n+3)+ch] ? 4 : 8;
    if (n == 8)     return this.xianwu[l][(n-3)+ch] ? 4 : 8;
    if (n == 3)     return this.xianwu[l][(n+3)+ch] ? 5 : 8;
    if (n == 7)     return this.xianwu[l][(n-3)+ch] ? 5 : 8;

    return this.xianwu[l][(n-3)+ch] && this.xianwu[l][(n+3)+ch] ?  4
          : this.xianwu[l][(n-3)+ch] || this.xianwu[l][(n+3)+ch] ?  8
          :                                                      12;
  }

  // 计算牌的价值
  paijia(p) {
    var bplist = this.bao;
    function weight(num, ch) {
      if (num < 1 || 9 < num) return 0;
      var rv = 1;
      for (var baopai of bplist) {
        if (num + ch == PaiMaker.GetBao(baopai)) rv *= 2;
      }
      return rv;
    }

    var rv;
    var ch = p[1];
    var n = p[0] - 0 || 5;
    
    if (ch == 'z') {
      rv = this.paishu[ch][n] * weight(n,ch);
    }
    else {
      var left = (1 <= n - 2)
        ? Math.min(this.paishu[ch][n - 2], this.paishu[ch][n - 1]) : 0;
      var center = (1 <= n - 1 && n + 1 <= 9)
        ? Math.min(this.paishu[ch][n - 1], this.paishu[ch][n + 1]) : 0;
      var right = (n + 2 <= 9)
        ? Math.min(this.paishu[ch][n + 1], this.paishu[ch][n + 2]) : 0;

      rv = left * weight(n - 2,ch)
        + Math.max(left, center) * weight(n - 1,ch)
        + this.paishu[ch][n] * weight(n,ch)
        + Math.max(center, right) * weight(n + 1,ch)
        + right * weight(n + 2,ch);
    }

    // 红宝 翻倍
    if (p[0] == 0) rv *= 2;
    // 场风
    if (p == (this.zhuangfeng + 1)+'z') rv *= 2;
    // 自风
    if (p == (this.zifeng + 1)+'z') rv *= 2;
    // 中章价值高
    if (p.match(/^[567]z/)) rv *= 2;
    rv *= weight(n,ch);

    //console.log("牌：",p,"权重：",rv);
    return rv;
  }

  // 求可以（进张）听的牌
  fulu_tingpai(hand, fulu) {
    var pai = [];
    // 原先向听数
    var n_xiangting = this.fulu_xiangting(hand, fulu);
    var paiCount = PaiMaker.GetCount(hand);
    for (var ch in paiCount) {
      var bingpai = paiCount[ch];
      for (var n = 1; n < bingpai.length; n++) {
        if (bingpai[n] >= 4) continue;
        var new_hand = hand.concat(n+ch);
        if (this.fulu_xiangting(new_hand, fulu) < n_xiangting){
          pai.push(n+ch);
          if(n == 5 && this.paishu[ch][0]>0){
            pai.push(0+ch);
          }
        }
      }
    }
    return pai;
  }

  // 副露向听数判定
  fulu_xiangting(hand,fulu) {
    var shoupai = PaiMaker.GetCount(hand);
    /* 各役向けの向聴数のうち最低の向聴数を選択する */
    var menqing = this.xiangting_menqian(shoupai,fulu);
    var fanpai = this.xiangting_fanpai(shoupai,fulu);
    var duanyao = this.xiangting_duanyao(shoupai,fulu);
    var duidui = this.xiangting_duidui(shoupai,fulu);
    var yisem = this.xiangting_yise(shoupai,fulu,'m');
    var yisep = this.xiangting_yise(shoupai,fulu,'p');
    var yises = this.xiangting_yise(shoupai,fulu,'s');

    // console.log({"鸣牌":fulu,"门清":menqing,"役牌":fanpai,"断幺九":duanyao,"对对":duidui,"m清/混一色":yisem,"p清/混一色":yisep,"s清/混一色":yises});

    return Math.min(
      menqing,fanpai,duanyao,duidui,yisem,yisep,yises
    );
  }

  // 向听数-门清
  xiangting_menqian(shoupai,fulu) {
    // 有副露则无穷大
    if (fulu.filter((m) => { return m.match(/[\-\+\=]/) }).length > 0)
      return Infinity;
    // 利用一般思路
    return TingJudger.xiangting(shoupai,fulu);
  }

  // 向听数-役牌
  xiangting_fanpai(shoupai,fulu) {
    var n_fanpai = 0, back;
    // 自风与场风 三元牌
    for (var n of [this.zhuangfeng + 1, this.zifeng + 1, 5, 6, 7]) {
      if (shoupai.z[n] >= 3) n_fanpai++;
      // 存在可以碰的役牌
      else if (shoupai.z[n] == 2 && this.paishu["z"][n] > 0) back = n;

      // 鳴ける可能性がある
      for (var m of fulu) {
        if (m[0] == 'z' && m[1] == n) n_fanpai++;
      }
    }
    if (n_fanpai) return TingJudger.xiangting(shoupai, fulu);
    if (back) {                                   // 役牌バックの場合
      var new_shoupai = PaiMaker.CopyCount(shoupai);            // 手牌を複製し、
      new_shoupai.z[back] = 0;             // バック対象の牌で
      var new_fulu = fulu.concat();
      new_fulu.push('z' + back + back + back + '=');       // 明刻を作る
      return TingJudger.xiangting(new_shoupai,new_fulu) + 1;
      // 汎用の向聴数計算ルーチンの結果に1加える
    }
    return Infinity;
  }

  // 向听数-断19
  xiangting_duanyao(shoupai,fulu) {
    /* 幺九牌を含む副露(暗槓含む)がある場合、向聴数は無限大 */
    if (fulu.filter((m) => { return m.match(/^z|[19]/) }).length) {
      return Infinity;
    }
    var new_shoupai = PaiMaker.CopyCount(shoupai);  // 手牌を複製し、
    for (var s of ['m', 'p', 's']) {
      for (var n of [1, 9]) {
        new_shoupai[s][n] = 0;      // 一九牌を引き抜く
      }
    }
    // 字牌はすべて不要
    new_shoupai.z = [0, 0, 0, 0, 0, 0, 0, 0];  
    // 汎用の向聴数計算ルーチンに処理を任せる
    return TingJudger.xiangting(new_shoupai,fulu);
  }

  // 向听数-对对胡
  xiangting_duidui(shoupai,fulu) {
    /* 順子の副露がある場合、向聴数は無限大 */
    if (fulu.filter((m)=>{ return !m.match(/^[mpsz](\d)\1\1/) }).length)
      return Infinity;
    /* 刻子(槓子を含む)と対子の数を数える */
    var n_kezi = fulu.length, n_duizi = 0;
    for (var ch in shoupai) {
      var bingpai = shoupai[ch];
      for (var n = 1; n < bingpai.length; n++) {
        if (bingpai[n] >= 3) n_kezi++;
        if (bingpai[n] == 2) n_duizi++;
      }
    }
    if (n_kezi + n_duizi > 5) n_duizi = 5 - n_kezi;
    // 搭子オーバーの場合は補正する
    return 8 - n_kezi * 2 - n_duizi;       // 向聴数を計算
  }

  xiangting_yise(shoupai,fulu,sort) {
    /* sort 以外の色の副露がある場合、向聴数は無限大 */
    var regexp = new RegExp('^[^z' + sort + ']');
    if (fulu.filter((m) => { return m.match(regexp) }).length)
      return Infinity;

    /* 手牌を複製し、sort 以外の色の牌をすべて引き抜く */
    var new_shoupai = PaiMaker.CopyCount(shoupai);
    for (var s of ['m', 'p', 's']) {
      if (s != sort) new_shoupai[s] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    // 汎用の向聴数計算ルーチンに処理を任せる
    return TingJudger.xiangting(new_shoupai,fulu);
  }

  // 从统计中删除牌
  deletePai(pai){
    let num = pai[0];
    let ch = pai[1];
    if(num == 0){
      this.paishu[ch][5] -= 1;
    }
    this.paishu[ch][num] -= 1;
  }

  // 计算危险系数
  Safety(pai){
    var min = 0;
    for (var l = 0; l < 4; l++) {
      // 只对立直者防御？
      if (! this.playerLizhi[l]) continue;
      if (l == this.zifeng) continue;
      min = Math.max(min,this.weixian(pai, l));
    }
    return min;
  }

  // 找出副露
  FindFulu(mianzi){
    // 向听数<3 允许吃碰
    var n_xiangting = this.fulu_xiangting(this.handStack,this.fuluStack);
    var fulou = undefined;
    if(n_xiangting >= 0 && n_xiangting < 3){
      var max = this.EvalHand(this.handStack,this.fuluStack,this.paishu);
      //console.log(this.paishu);
      //console.log("门清收益：",max,"副露可能: ",mianzi);
      // 计算每种副露形式的收益
      for (var m of mianzi) {
        var new_handStack = PaiMaker.GetFuluOff(this.handStack,m);
        var new_fuluStack = PaiMaker.GetFulu(this.fuluStack,m);
        // 还是3向听以上
        let fxt = this.fulu_xiangting(new_handStack,new_fuluStack);
        if (fxt >= 3 || fxt >= n_xiangting) continue;
        // TODO: 评价手牌
        var ev = this.EvalHand(new_handStack,new_fuluStack,this.paishu);
        // fulou.push(m.concat(ev));
        // console.log(m,ev);
        if (ev > max) {
          max = ev;
          fulou = m;
        }
      }
    }
    if(fulou != undefined) console.log('副露选择:',fulou,this.handStack);
    return fulou;
    
  }

  // 找出最安全的牌？
  FindSafe(){
    var anquan, min = Infinity;
    this.safe_res = [];
    for (var p of this.handStack) {
      var weixian = 0;
      // 对4家进行分析
      var w = [-1,-1,-1,-1];
      for (var l = 0; l < 4; l++) {
        // 只对立直者防御？
        //if (! this.playerLizhi[l]) continue;
        if (l == this.zifeng) continue;
        w[l] = this.weixian(p, l);
        if (w[l] > weixian) weixian = w[l];
      }
      this.safe_res.push([p,w]);
      // 选择理论最安全的牌
      if (weixian < min) { 
        min = weixian;
        anquan = p;
      }
    }
    return anquan;
  }

  //找出要打的牌
  FindQie(dapai){
    // 克隆手牌
    var handStack = this.handStack.concat();
    var fuluStack = this.fuluStack.concat();

    if(handStack.length + fuluStack.length*3 != 14){
      console.log("牌数目不正确");
      return;
      //throw new Error();
    }

    // 预估胡牌分用参数
    var param = {
      zhuangfeng: this.zhuangfeng,   /* 場風 */
      menfeng: this.zifeng,      /* 自風 */
      baopai:     this.bao,       /* ドラ */
      fubaopai:   [],
      changbang: 0,
      lizhibang: 0,
      lizhi:      fuluStack.length>0?0:1,        /* 門前の場合はリーチする前提 */
      yifa:       0,
      qianggang:  false,
      lingshang:  false,
      haidi:      0,
      tianhu:     0
    };

    var n_xiangting = this.fulu_xiangting(handStack, fuluStack);
    var max = 0, maxfen = 0;
    var lastp;
    // console.log(n_xiangting,handStack, fuluStack);

    this.cal_res = [];
    for (var i = 0; i < handStack.length; i++) {
      let p = handStack[i];
      if(p == lastp) continue;
      lastp = p;
      // 打牌可能な牌について以下を行う
      var huStack = handStack.concat();
      huStack.splice(i,1);
      let new_xiangting = this.fulu_xiangting(huStack, fuluStack);
      // 不选择向听数增加的情形？
      if (new_xiangting > n_xiangting){
        //continue;
      }
      // 获取有效进张（等待牌）
      var tingpai = this.fulu_tingpai(huStack, fuluStack);
      // 统计枚数(牌价值)
      var x = 1 - this.paijia(p)/100;
      var hufen = 0;
      for (var tp of tingpai) {
        let num = tp[0];
        let ch = tp[1];
        x += this.paishu[ch][num];
        // 听牌(向听为0)时，计算可能的胡牌分数
        if(new_xiangting > 0) continue;
        var new_huStack = huStack.concat(tp);
        var ptres = PtJudger.GetFen(new_huStack,fuluStack,tp+'_',param);
        // console.log(p,tp,ptres);
        if(ptres.defen > 0){
          //计算剩余牌数与得分
          var restNum = this.paishu[ch][num];
          if(num == 5) restNum-=this.paishu[ch][0];
          hufen += ptres.defen*restNum;
        }
      }
      //this.cal_res[p] = [new_xiangting,tingpai,x,hufen];
      //this.cal_res.push([p,new_xiangting,tingpai,x,hufen]);
      if (new_xiangting > n_xiangting){
        this.cal_res.push([p,new_xiangting,tingpai,0,0]);
      }else{
        this.cal_res.push([p,new_xiangting,tingpai,x,hufen]);
      }
      
      // 可能胡牌得分总和越大
      if (hufen>0 && hufen >= maxfen){
        maxfen = hufen;
        dapai = p;
      }
      else if (x >= max) {
        max = x;
        dapai = p;
      }
    }
    return dapai;
  }

  /** 记录手牌 */
  TestEvalHand(){
    for(var pai of this.handStack){
      this.deletePai(pai);
    }
    // console.log(this.paishu);
    // return this.EvalHand(this.handStack,this.fuluStack,this.paishu);
  }

  // 从目前手牌中挑选能够打出的牌
  PickDapai(handStack,fuluStack){
    var pai = [];
    // 禁手
    var deny = {};
    var mopai = fuluStack[fuluStack.length - 1];
    var n = mopai && +mopai.match(/\d(?=[\-\+\=])/);
    // 设置副露吃碰后的禁手
    if (n) {
      var s = mopai[0];
      deny[s+n] = true;
      //console.log('deny',mopai,s,n);
      if (! mopai.match(/^[mpsz](\d)\1\1.*$/)) {
          if (n < 7 && mopai.match(/^[mps]\d\-\d\d$/)) deny[(n+3)+s] = true;
          if (3 < n && mopai.match(/^[mps]\d\d\d\-$/)) deny[(n-3)+s] = true;
      }
    }
    var pCount = PaiMaker.GetCount(handStack);
    for (var s of ['m','p','s','z']) {
      var bingpai =  pCount[s];
      for (var n = 1; n < bingpai.length; n++) {
        if (bingpai[n] == 0) continue;
        if (deny[n+s]) continue;
        if (n != 5){
          pai.push(n+s);
        }
        else {
          if (bingpai[0] > 0)             pai.push('0'+s);
          if (bingpai[0] < bingpai[5])    pai.push('5'+s);
        }
      }
    }
    return pai; 
  }

  GetFen(handStack,fuluStack){
    // 预估胡牌分用参数
    var param = {
      zhuangfeng: this.zhuangfeng,
      menfeng: this.zifeng,
      hupai: {
        lizhi:      0,
        yifa:       0,
        qianggang:  false,
        lingshang:  false,
        haidi:      0,
        tianhu:     0
      },
      baopai: this.bao,
      fubaopai: [],
      jicun: { changbang: 0, lizhibang: 0 }
    };
    // 价值则为胡牌得分
    var hupai = handStack[handStack.length - 1];
    //console.log(hupai);
    return PtJudger.GetFen(handStack,fuluStack,hupai+'_',param).defen;
  }

  // 综合评价手牌
  EvalHand(handStack,fuluStack,paishu){
    // 当前向听数
    var n_xiangting = this.fulu_xiangting(handStack,fuluStack);
    // 已经和牌情形
    if (n_xiangting == -1) {
      return this.GetFen(handStack,fuluStack);
    }
    // 如果是需要切牌的状态
    if (handStack.length+fuluStack.length*3 == 14) {
      // 摸牌/副露后 选择不减少向听数里最大的
      var max = 0;
      var plist = this.PickDapai(handStack,fuluStack);
      for (var p of plist) {
        // 克隆一副手牌
        var new_handStack = handStack.concat();
        new_handStack.splice(new_handStack.indexOf(p),1);
        //var new_shoupai = PaiMaker.GetCount(new_handStack);
        if (this.fulu_xiangting(new_handStack,fuluStack) > n_xiangting) continue;
        var r = this.EvalHand(new_handStack,fuluStack,paishu);
        // console.log(new_handStack.toString(),r);
        if (r > max) max = r;
      }
      return max;
    }
    // 3向听以内
    if (n_xiangting < 3) {
      // 价值为 进章的得分*枚数    
      var r = 0;
      var tingpai = this.fulu_tingpai(handStack, fuluStack);
      for (var p of tingpai) {
        let num = p[0];
        let ch = p[1];
        if (paishu[ch][num] == 0) continue;
        var new_shoupai = handStack.concat(p+'_');
        paishu[ch][num]--;
        // 继续搜索
        var ev = this.EvalHand(new_shoupai,fuluStack,paishu);
        paishu[ch][num]++;
        r += ev * paishu[ch][num];
      }
      return r;
    }else{
      /* 3向聴以前の場合は今までのアルゴリズムで評価 */
      var r = 0;
      for (var p of this.fulu_tingpai(handStack,fuluStack)) {
        let num = p[0];
        let ch = p[1];
        if (paishu[ch][num] == 0) continue;
        r += paishu[ch][num] * (p[2] == '+' ? 4 : p[2] == '-' ? 2 : 1);
      }
      return r;
    }

  }

  InitStatus(action) {
    this.ResetPaiCount();
    // 重置ai信息
    this.qinjia = action.ju;
    this.zhuangfeng = action.ben;
    this.zifeng = view.DesktopMgr.Inst.seat;
    // jushu = action.jushu;
    this.changbang = action.chang;
    this.lizhibang = action.lizhibang;
    this.score = action.scores;
    this.bao.push(action.dora);
    this.handStack = action.tiles;

    for (var i = 0; i < 4; i++) {
      let seat = view.DesktopMgr.Inst.players[i].seat;
      // 记录风对应的各个玩家id
      this.playerWind[seat] = i;
    }
    console.log(this.playerWind);
    console.log("zifeng: ", this.zifeng);

    // 记录牌
    for(var pai of this.handStack){
      this.deletePai(pai);
    }
    
    return;
  }
}

export {
  AI_Core
};