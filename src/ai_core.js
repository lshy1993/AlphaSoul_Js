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
    var n = p[1] - 0 || 5;

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

    if (p[1] == '0') rv *= 2;
    if (p == 'z' + (this.zhuangfeng + 1)) rv *= 2;
    if (p == 'z' + (this.zifeng + 1)) rv *= 2;
    if (p.match(/^z[567]/)) rv *= 2;
    rv *= weight(n,ch);

    return rv;
  }


  xiangting(shoupai) {
    /* 各役向けの向聴数のうち最低の向聴数を選択する */
    var menqing = this.xiangting_menqian(shoupai);
    var fanpai = this.xiangting_fanpai(shoupai);
    var duanyao = this.xiangting_duanyao(shoupai);
    var duidui = this.xiangting_duidui(shoupai);
    var yisem = this.xiangting_yise(shoupai, 'm');
    var yisep = this.xiangting_yise(shoupai, 'p');
    var yises = this.xiangting_yise(shoupai, 's');

    console.log(menqing,fanpai,duanyao,duidui
      ,yisem,yisep,yises);

    return Math.min(
      menqing,fanpai,duanyao,duidui
      ,yisem,yisep,yises
    );
  }

  // 向听数-门清
  xiangting_menqian(shoupai) {
    if (this.fuluStack.filter((m) => { return m.match(/[\-\+\=]/) }).length)
      return Infinity;
    // 副露牌がある場合は向聴数は無限大
    return TingJudger.xiangting(shoupai);
    // それ以外は汎用の向聴数計算ルーチンを使用
  }

  // 向听数-役牌
  xiangting_fanpai(shoupai) {
    var n_fanpai = 0, back;
    // 自风与场风 三元牌
    for (var n of [this.zhuangfeng + 1, this.zifeng + 1, 5, 6, 7]) {
      if (shoupai.z[n] >= 3) n_fanpai++;
      // 存在可以碰的役牌
      else if (shoupai.z[n] == 2 && this.paishu["z"][n] > 0) back = n;

      // 鳴ける可能性がある
      for (var m of this.fuluStack) {
        if (m[0] == 'z' && m[1] == n) n_fanpai++;
      }
    }
    if (n_fanpai) return TingJudger.xiangting(shoupai, this.fuluStack);
    if (back) {                                   // 役牌バックの場合
      var new_shoupai = PaiMaker.CopyCount(shoupai);            // 手牌を複製し、
      new_shoupai.z[back] = 0;             // バック対象の牌で
      var new_fulu = this.fuluStack.concat();
      new_fulu.push('z' + n + n + n + '=');       // 明刻を作る
      return TingJudger.xiangting(new_shoupai,new_fulu) + 1;
      // 汎用の向聴数計算ルーチンの結果に1加える
    }
    return Infinity;
  }

  // 向听数-断19
  xiangting_duanyao(shoupai) {
    /* 幺九牌を含む副露(暗槓含む)がある場合、向聴数は無限大 */
    if (this.fuluStack.filter((m) => { return m.match(/^z|[19]/) }).length) {
      return Infinity;
    }
    var new_shoupai = PaiMaker.CopyCount(shoupai);  // 手牌を複製し、
    for (var s of ['m', 'p', 's']) {
      for (var n of [1, 9]) {
        new_shoupai[s][n] = 0;      // 一九牌を引き抜く
      }
    }
    new_shoupai.z = [0, 0, 0, 0, 0, 0, 0, 0];  // 字牌はすべて不要
    return TingJudger.xiangting(new_shoupai,this.fuluStack);
    // 汎用の向聴数計算ルーチンに処理を任せる
  }

  // 向听数-对对胡
  xiangting_duidui(shoupai) {
    /* 順子の副露がある場合、向聴数は無限大 */
    if (this.fuluStack.filter(
      (m) => { return !m.match(/^[mpsz](\d)\1\1/) }).length)
      return Infinity;
    /* 刻子(槓子を含む)と対子の数を数える */
    var n_kezi = this.fuluStack.length, n_duizi = 0;
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

  xiangting_yise(shoupai, sort) {
    /* sort 以外の色の副露がある場合、向聴数は無限大 */
    var regexp = new RegExp('^[^z' + sort + ']');
    if (this.fuluStack.filter((m) => { return m.match(regexp) }).length)
      return Infinity;

    /* 手牌を複製し、sort 以外の色の牌をすべて引き抜く */
    var new_shoupai = PaiMaker.CopyCount(shoupai);
    for (var s of ['m', 'p', 's']) {
      if (s != sort) new_shoupai[s] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
    return TingJudger.xiangting(new_shoupai);
    // 汎用の向聴数計算ルーチンに処理を任せる
  }

  // 从统计中删除牌
  deletePai(pai){
    let num = pai[0] == '0'? 5 : pai[0];
    let ch = pai[1];
    this.paishu[ch][num] -= 1;
  }

  //找出要打的牌
  FindQie(dapai){
    // 克隆手牌
    var handStack = this.handStack.concat();
    var fuluStack = this.fuluStack.concat();
    this.cal_res = [];
    // 预估胡牌分用参数
    var param = {
      zhuangfeng: this.zhuangfeng,   /* 場風 */
      menfeng: this.zifeng,      /* 自風 */
      hupai: {
          lizhi:      1,        /* 門前の場合はリーチする前提 */
          yifa:       0,
          qianggang:  false,
          lingshang:  false,
          haidi:      0,
          tianhu:     0
      },
      baopai:     this.bao,       /* ドラ */
      fubaopai:   [],
      jicun:      { changbang: 0, lizhibang: 0 }
    };


    var n_xiangting = TingJudger.xiangting(PaiMaker.GetCount(handStack), fuluStack);
    var max = 0, maxfen = 0;
    for (var i = 0; i < handStack.length; i++) {
      let p = handStack[i];
      // 打牌可能な牌について以下を行う
      let newPaiCount = PaiMaker.GetCountOff(handStack,p);
      var huStack = handStack.concat();
      huStack.splice(i,1);
      let new_xiangting = TingJudger.xiangting(newPaiCount, fuluStack);
      // 不选择向听数增加的情形？
      if (new_xiangting > n_xiangting){
        //this.cal_res.push([p,new_xiangting,0,0]);
        //continue;
      }
      // 获取有效进张（等待牌）
      var tingpai = TingJudger.tingpai(newPaiCount, fuluStack);
      // 统计枚数(牌价值)
      var x = 1 - this.paijia(p)/100;
      var hufen = 0;
      for (var tp of tingpai) {
        let num = tp[0];
        let ch = tp[1];
        x += this.paishu[ch][num];
        // 听牌(向听为0)时，计算可能的胡牌分数
        if(new_xiangting > 0) continue;
        if(num == 5){
          // 红宝 增加一次计算
          let red_tp = 0+ch;
          let ptres = PtJudger.GetFen(huStack.concat(red_tp),fuluStack,red_tp,param);
          //console.log(p,red_tp,ptres);
          if(ptres.defen > 0){
            hufen += ptres.defen*this.paishu[ch][0];
          }
        }
        var new_huStack = huStack.concat(tp);
        var ptres = PtJudger.GetFen(new_huStack,fuluStack,tp,param);
        //console.log(p,tp,ptres);
        if(ptres.defen > 0){
          //计算剩余牌数与得分
          var restNum = this.paishu[ch][num];
          if(num == 5) restNum-this.paishu[ch][0];
          hufen += ptres.defen*restNum;
        }
      }
      if (new_xiangting > n_xiangting){
        this.cal_res.push([p,new_xiangting,tingpai,-1,0]);
      }else{
        this.cal_res.push([p,new_xiangting,tingpai,x,hufen]);
      }
      
      if (hufen >= maxfen || x >= max) {
        maxfen = hufen;
        max = x;
        dapai = p;
      }
    }
    return dapai;
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