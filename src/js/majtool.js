/* eslint-disable */ 
class PaiMaker {
  // 统计牌组构成
  static GetCount(plist) {
    var paiCount = {
      m: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      p: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      s: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      z: [0, 0, 0, 0, 0, 0, 0, 0]
    };
    for (var p of plist) {
      let num = p[0];
      let ch = p[1];
      if (num == 0) {
        // 红宝 同时充当0与5，计算2次
        paiCount[ch][5] += 1;
      }
      paiCount[ch][num] += 1;
    }
    return paiCount;
  }

  // 复制牌统计
  static CopyCount(pcount){
    var newCount = {
      m: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      p: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      s: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      z: [0, 0, 0, 0, 0, 0, 0, 0]
    }
    for (var ch in pcount) {
      newCount[ch] = pcount[ch].concat();
    }
    return newCount;
  }

  // 获取副露后的代码
  static FuluCode(mianzi){
    var ch,code = "";
    for(var p of mianzi.split("|")){
      ch = p[1];
      code += p;
    }
    code = code.replace(new RegExp(ch,"g"),"");
    return ch+code;
  }

  // 计算副露后的统计
  static GetFuluOff(plist,mianzi){
    var newHand = plist.concat();
    var mz;
    if(mianzi[1] == 6){
      // 加杠牌
      mz = [ mianzi[0].split("|")[1] ];
    }else{
      mz = mianzi[0].split("|");
    }
    for(var p of mz){
      let ii = newHand.indexOf(p);
      newHand.splice(ii,1);
    }
    return newHand;
  }

  // 获得新的副露堆
  static GetFulu(fulu,mianzi){
    var new_fulu = fulu.concat();
    if(mianzi[1] == 6){
      // 加杠
      let ori = mianzi[0].split("|");
      for(var i in new_fulu){
        if(new_fulu[i] == ori) new_fulu[i] = mianzi[0];
      }
    }else{
      new_fulu = new_fulu.concat(this.FuluCode(mianzi[0]));
    }
    return new_fulu;
  }

  /* 计算摸到牌后的统计 */
  static GetCountAdd(hand,p){
    var newPaiCount = PaiMaker.GetCount(hand);
    let ch = p[1];
    let num = p[0];
    if(num == 0){
      newPaiCount[ch][5]++;
    }
    newPaiCount[ch][num]++;
    return newPaiCount;
  }

  // 计算打出后的统计
  static GetCountOff(hand,p){
    var newPaiCount = PaiMaker.GetCount(hand);
    if(p[0] == 0){
      newPaiCount[p[1]][5]--;
    }
    newPaiCount[p[1]][p[0]]--;
    return newPaiCount;
  }

  static GetBao(baostr) {
    // 根据宝牌代码获取真宝牌
    var num = baostr[0] - 0 || 5;
    var ch = baostr[1];
    if (ch == 'z') {
      if (num == 4) num = 1;
      else if (num == 7) num = 5;
      else num = num + 1;
    }
    else {
      num = (num == 9) ? 1 : num + 1;
    }
    return num+ch;
  }

  static GetPaiCode(i){
    const paiCode = [
      "1s","2s","3s","4s","5s","6s","7s","8s","9s",
      "1m","2m","3m","4m","5m","6m","7m","8m","9m",
      "1p","2p","3p","4p","5p","6p","7p","8p","9p",
      "1z","2z","3z","4z","5z","6z","7z"
    ];
    return paiCode[i];
  }

}

class MianziMaker{
  // 是否能吃
  static get_chi_mianzi(pCount,fulu,p) {
      var mianzi = [];
      var s = p[1];
      var n = p[0] -0 || 5;
      var d = p[2];
      var bingpai = pCount[s];
      var p1, p2;
      // 上家打牌 && 非字牌
      if (s != 'z' && d == '-') {
          // n-2 n-1 n
          if (3 <= n && bingpai[n-2] > 0 && bingpai[n-1] > 0) {
              p1 = ((n-2 == 5 && bingpai[0] > 0) ? 0 : n-2) + s;
              p2 = ((n-1 == 5 && bingpai[0] > 0) ? 0 : n-1) + s;
              if (fulu.length == 3 && bingpai[n] == 1 && 3 < n && bingpai[n-3] == 1)
                  ;
              else mianzi.push([p1+"|"+p2+"|"+p,2]);
          }
          // n n+1 n+2
          if (n <= 7 && bingpai[n+1] > 0 && bingpai[n+2] > 0) {
              p1 = ((n+1 == 5 && bingpai[0] > 0) ? 0 : n+1) + s;
              p2 = ((n+2 == 5 && bingpai[0] > 0) ? 0 : n+2) + s;
              if (fulu.length == 3 && bingpai[n] == 1 && n < 7 && bingpai[n+3] == 1)
                  ;
              else mianzi.push([p+"|"+p1+"|"+p2,2]);
          }
          // n-1 n n+1
          if (2 <= n &&  n <= 8 && bingpai[n-1] > 0 && bingpai[n+1] > 0) {
              p1 = ((n-1 == 5 && bingpai[0] > 0) ? 0 : n-1) + s;
              p2 = ((n+1 == 5 && bingpai[0] > 0) ? 0 : n+1) + s;
              mianzi.push([p1+"|"+p+"|"+p2,2]);
          }
      }
      return mianzi;
  }
  // 是否能碰
  static get_peng_mianzi(pCount,fulu,p) {
      var mianzi = [];
      var s = p[1];
      var n = p[0] -0 || '5';
      var d = p[2];
      var bingpai = pCount[s];

      if (d != '_' && bingpai[n] >= 2) {
          var p1 = ((n == 5 && bingpai[0] > 1) ? 0 : n) + s;
          var p2 = ((n == 5 && bingpai[0] > 0) ? 0 : n) + s;
          mianzi = [[p1+"|"+p2+"|"+p,3]];
      }
      return mianzi;
  }
  // 是否能杠
  static get_gang_mianzi(pCount,fulu,p) {
      var mianzi = [];
      var s = p[1];
      var n = p[0]-'0' || 5;
      var shoupai = pCount;
      var bingpai = shoupai[s];
      console.log(s,n);
      // 明杠
      if (bingpai[n] == 3) {
          var p1 = ((n == 5 && bingpai[0] > 2) ? 0 : n)+s;
          var p2 = ((n == 5 && bingpai[0] > 1) ? 0 : n)+s;
          var p3 = ((n == 5 && bingpai[0] > 0) ? 0 : n)+s;
          mianzi.push([p1+"|"+p2+"|"+p3+"|"+p,5]);
      }
      // 暗/加杠
      for (var s in shoupai) {
          var bingpai = shoupai[s];
          for (var n = 1; n < bingpai.length; n++) {
              if (bingpai[n] == 0) continue;
              if (bingpai[n] == 4) {
                  var p0 = ((n == 5 && bingpai[0] > 3) ? 0 : n)+s;
                  var p1 = ((n == 5 && bingpai[0] > 2) ? 0 : n)+s;
                  var p2 = ((n == 5 && bingpai[0] > 1) ? 0 : n)+s;
                  var p3 = ((n == 5 && bingpai[0] > 0) ? 0 : n)+s;
                  mianzi.push([p0+"|"+p1+"|"+p2+"|"+p3,4]);
              }
              else {
                  for (var m of fulu) {
                      if (m.replace(/0/g,'5').substr(0,4) == s+n+n+n) {
                          var p0 = ((n == 5 && bingpai[0] > 0) ? 0 : n)+s;
                          mianzi.push([m+"|"+p0,6]);
                      }
                  }
              }
          }
      }
      return mianzi;
  }

  static GetFuluMianzi(handStack,fuluStack,hupai){
    var pCount = PaiMaker.GetCountOff(handStack,hupai);
    var fulumz = this.get_gang_mianzi(pCount,fuluStack,hupai+'-')
        .concat(this.get_peng_mianzi(pCount,fuluStack,hupai+'-'))
        .concat(this.get_chi_mianzi(pCount,fuluStack,hupai+'-'));
    return fulumz;
  }

}

class TingJudger {
  static _xiangting(m, d, g, j) {
    // 雀頭がない場合は5ブロック必要
    var n = j ? 4 : 5;
    // 面子過多の補正
    if (m > 4) {
      d += m - 4;
      m = 4;
    }
    // 搭子過多の補正
    if (m + d > 4) {
      g += m + d - 4;
      d = 4 - m;
    }
    // 孤立牌過多の補正
    if (m + d + g > n) {
      g = n - m - d;
    }
    // 雀頭がある場合は搭子として数える
    if (j) d++;
    return 13 - m * 3 - d * 2 - g;
  }

  // 求向听数
  static xiangting(paiCount, fulu) {
    var max = this.xiangting_yiban(paiCount, fulu);
    //if (fulu == undefined || fulu.length > 1) return max;
    var xg = this.xiangting_guoshi(paiCount);
    var xq = this.xiangting_qiduizi(paiCount);
    //console.log(max,xg,xq);
    return Math.min(max, Math.min(xg, xq));
  }

  static xiangting_yiban(paiCount, fulu) {
    // 没有指定雀头的情况下向听数作为最小值
    var min_xiangting = this.mianzi_all(paiCount, fulu);
    /* 可能な雀頭を抜き取り mianzi_all() を呼出し、向聴数を計算させる */
    // 遍历4种牌
    for (var ch in paiCount) {
      var shoupai = paiCount[ch];
      for (var n = 1; n < shoupai.length; n++) {
        //非雀头
        if (shoupai[n] < 2) continue;
        //剩余手牌拆面子
        paiCount[ch][n] -= 2;
        var xiangting = this.mianzi_all(paiCount, fulu, true);
        paiCount[ch][n] += 2;
        
        // 替换最小值
        min_xiangting = Math.min(xiangting, min_xiangting);
        
      }
    }

    return min_xiangting;
  }

  static mianzi_all(paiCount, fulu, jiangpai = false) {
    // 分别计算 m p s 的面子与搭子数目
    var rm = this.mianzi(paiCount["m"], 1);
    var rp = this.mianzi(paiCount["p"], 1);
    var rs = this.mianzi(paiCount["s"], 1);
    // 字牌
    var z = [0, 0, 0];
    for (var n = 1; n <= 7; n++) {
      // 面子
      if (paiCount["z"][n] >= 3) z[0]++;
      // 搭子
      if (paiCount["z"][n] == 2) z[1]++;
      // 字牌の孤立牌数取得を追加
      if (paiCount["z"][n] == 1) z[2]++;
    }

    // 副露牌作为面子
    var n_fulou = fulu == undefined ? 0 : fulu.length;

    // 最小向聴数 最大值8
    var min_xiangting = 13;

    /* 萬子、筒子、索子、字牌それぞれの面子・搭子の数についてパターンA、Bの
        組合わせで向聴数を計算し、最小値を解とする */
    for (var m of rm) {
      for (var p of rp) {
        for (var s of rs) {
          var n_mianzi = m[0] + p[0] + s[0] + z[0] + n_fulou;
          var n_dazi = m[1] + p[1] + s[1] + z[1];
          var n_guli = m[2] + p[2] + s[2] + z[2];
          if (n_mianzi + n_dazi > 4) n_dazi = 4 - n_mianzi;
          // 搭子过多修正
          var xiangting = this._xiangting(n_mianzi, n_dazi, n_guli, jiangpai);
          min_xiangting = Math.min(xiangting, min_xiangting);
        }
      }
    }

    return min_xiangting;
  }

  static mianzi(bingpai, n) {
    if (n > 9) return this.dazi(bingpai);

    /* まずは面子を抜かず位置を1つ進め試行 */
    var max = this.mianzi(bingpai, n + 1);

    /* 順子抜き取り */
    if (n <= 7 && bingpai[n] > 0 && bingpai[n + 1] > 0 && bingpai[n + 2] > 0) {
      bingpai[n]--;
      bingpai[n + 1]--;
      bingpai[n + 2]--;
      // 抜き取ったら同じ位置でもう一度試行
      var r = this.mianzi(bingpai, n);
      bingpai[n]++;
      bingpai[n + 1]++;
      bingpai[n + 2]++;
      // 各パターンの面子の数を1増やす
      r[0][0]++;
      r[1][0]++;
      /* 必要であれば最適値の入替えをする */
      if (r[0][0] * 2 + r[0][1] > max[0][0] * 2 + max[0][1]) max[0] = r[0];
      if (r[1][0] * 10 + r[1][1] > max[1][0] * 10 + max[1][1]) max[1] = r[1];
    }

    /* 刻子抜き取り */
    if (bingpai[n] >= 3) {
      bingpai[n] -= 3;
      var r = this.mianzi(bingpai, n);
      bingpai[n] += 3;
      r[0][0]++;
      r[1][0]++;
      if (r[0][0] * 2 + r[0][1] > max[0][0] * 2 + max[0][1]) max[0] = r[0];
      if (r[1][0] * 10 + r[1][1] > max[1][0] * 10 + max[1][1]) max[1] = r[1];
    }

    return max;
  }

  // 计算搭子数
  static dazi(bingpai) {
    var n_pai = 0;
    var n_dazi = 0;
    var n_guli = 0;
    for (var n = 1; n <= 9; n++) {
      n_pai += bingpai[n];
      if (n <= 7 && bingpai[n + 1] == 0 && bingpai[n + 2] == 0) {
        //n_dazi += n_pai / 2;
        n_dazi += n_pai >> 1;
        n_guli += n_pai % 2;
        n_pai = 0;
      }
    }
    //n_dazi += n_pai / 2;
    n_dazi += n_pai >> 1;
    n_guli += n_pai % 2;

    return [[0, n_dazi, n_guli], [0, n_dazi, n_guli]];
  }

  // 七对子形的向听数
  static xiangting_qiduizi(paiCount) {
    var n_duizi = 0;
    var n_danqi = 0;

    for (var kv in paiCount) {
      var pnum = paiCount[kv];
      for (var n = 1; n < pnum.length; n++) {
        if (pnum[n] >= 2) n_duizi++;
        else if (pnum[n] == 1) n_danqi++;
      }
    }

    if (n_duizi > 7) n_duizi = 7; // 対子過多の補正
    if (n_duizi + n_danqi > 7) n_danqi = 7 - n_duizi; // 孤立牌過多の補正

    return 13 - n_duizi * 2 - n_danqi;
  }

  // 国士无双 向听
  static xiangting_guoshi(paiCount) {
    var n_yaojiu = 0;
    var you_duizi = false;
    for (var ch in paiCount) {
      var bingpai = paiCount[ch];
      var nn = ch == "z" ? [1, 2, 3, 4, 5, 6, 7] : [1, 9];
      for (var n of nn) {
        if (bingpai[n] > 0) n_yaojiu++;
        if (bingpai[n] > 1) you_duizi = true;
      }
    }

    return you_duizi ? 12 - n_yaojiu : 13 - n_yaojiu;
  }

  // 求可以（进张）听的牌
  static tingpai(paiCount, fulu) {
    var pai = [];
    // 原先向听数
    var n_xiangting = this.xiangting(paiCount, fulu);
    for (var ch in paiCount) {
      var bingpai = paiCount[ch];
      for (var n = 1; n < bingpai.length; n++) {
        if (bingpai[n] >= 4) continue;
        paiCount[ch][n]++;
        if (this.xiangting(paiCount, fulu) < n_xiangting)
          //pai.push(ch + n);
          pai.push(n+ch);
        paiCount[ch][n]--;
      }
    }
    return pai;
  }
}

class RonJudger
{
  // 荣和判定面子拆分
  static Ron(hand, moPai, fulu) {
    var paiCount = PaiMaker.GetCount(hand);
    var mianzi = [];
    // 七对子判定
    let qiduim = this.Ron_qiduizi(paiCount, moPai);
    // 国士无双判定
    let guoshim = this.Ron_guoshi(paiCount, moPai);
    // 九宝莲灯
    let jiulianm = this.Ron_jiulian(paiCount, moPai)
    // 一般 4面1头形
    let yibanm = this.Ron_normal(paiCount, moPai, fulu);
    return mianzi.concat(qiduim).concat(guoshim).concat(jiulianm).concat(yibanm);
  }
  
  // 七对子判定
  static Ron_qiduizi(paiCount, hulepai) {
    var paixing = [];
    for(var ch in paiCount)
    {
      var shoupai = paiCount[ch];
      for (var n = 1; n < shoupai.length; n++)
      {
        let pcount = shoupai[n];
        if (pcount == 0) continue;
        if (pcount == 2) {
          let p = ch + n + n;
          if (ch == hulepai[1] && n == (hulepai[0] - '0')) {
            p += hulepai[2] + "!";
          }
          paixing.push(p);
        }
        else return [];  // 対子でないものがあった場合、和了形でない。
      }
    }
    return (paixing.length == 7)?[paixing]:[];
  }

  // 国士无双
  static Ron_guoshi(paiCount,hulepai) {
    var mianzi = [];
    //if (fulu.length > 1) return mianzi;
    var you_duizi = false;
    for (var ch in paiCount) {
      let shoupai = paiCount[ch];
      var nn = (ch == 'z') ? [1, 2, 3, 4, 5, 6, 7] : [1, 9];
      for (var n of nn) {
        if (shoupai[n] == 2) {
          let p = ch + n + n;
          if (ch == hulepai[1] && n == (hulepai[0] - '0')) {
            p += hulepai[2] + "!";
          }
          mianzi.push(p);
          you_duizi = true;
        }
        else if (shoupai[n] == 1) {
          let p = ch + n;
          if (ch == hulepai[1] && n == (hulepai[0] - '0')) {
            p += hulepai[2] + "!";
          }
          mianzi.push(p);
        }
        else return [];  // 足りない幺九牌があった場合、和了形でない。
      }
    }

    return you_duizi ? [mianzi] : [];
  }
  
  static Ron_jiulian(paiCount, hulepai)
  {
    //如果存在字牌 则不是九莲
    if (paiCount['z'].forEach(ele => { return ele>0 })) return [];
    //遍历4种牌
    for (var ch of ['m','p','s'])
    {
      let shoupai = paiCount[ch];
      let mianzi = ch;
      //对于该牌型检查
      for (var n = 1; n <= 9; n++)
      {
        //1和9不满3张则无效
        if ((n == 1 || n == 9) && shoupai[n] < 3) return [];
        //缺少某一个数字则无效
        if (shoupai[n] == 0) return [];
        //牌数
        let nn = (n == hulepai[0]) ? shoupai[n] - 1 : shoupai[n];
        for (var i = 0; i < nn; i++)
        {
          mianzi += n;
        }
      }
      if (mianzi.length == 14) {
        mianzi += hulepai[0]+hulepai[2] + "!";
        return [[mianzi]];
      }
    }
    return [];
  }
  
  /// 一般型判定
  static Ron_normal(paiCount, hulepai, fulu) {
    var mzlist = [];
    //遍历4种牌
    for (var ch in paiCount) {
      let shoupai = paiCount[ch];
      for (var n = 1; n < shoupai.length; n++) {
        //非雀头
        if (shoupai[n] < 2) continue;
        var jiangpai = ch + n + n;
        //剩余手牌拆面子
        paiCount[ch][n] -= 2;
        for (var mianzi of this.MianziDevide(paiCount, fulu)) {
          mianzi.unshift(jiangpai);
          if (mianzi.length != 5) continue;
          let mark = this.AddMark(mianzi, hulepai);
          mzlist = mzlist.concat(mark);
        }
        paiCount[ch][n] += 2;
      }
    }
    return mzlist;
  }
  /// 面子拆分
  static MianziDevide(paiCount,fulou) {
    var all_mianzi = [[]];
    //万饼索分别检测
    for (var ch of ['m', 'p', 's']) {
      var new_mianzi = [];
      var sub_mianzi = this.MianziPick(ch, paiCount[ch], 1);
      for (var mm of all_mianzi) {
        for (var nn of sub_mianzi) {
          new_mianzi.push(mm.concat(nn));
        }
      }
      all_mianzi = new_mianzi;
    }
    
    //字牌检测
    var mianzi_z = [];
    for (var n = 1; n <= 7; n++) {
      if (paiCount['z'][n] == 0) continue;
      if (paiCount['z'][n] != 3) return [];
      mianzi_z.push('z' + n + n + n);
    }
    //组合
    for (var i = 0; i < all_mianzi.length; i++) {
      all_mianzi[i] = all_mianzi[i].concat(mianzi_z)
        .concat(fulou);
    }
    return all_mianzi;
  }

  //面子拆分搜索
  static MianziPick(s, shoupai, n) {
    if (n > 9) return [[]];

    /* 面子を抜き取り終わったら、次の位置に進む */
    if (shoupai[n] == 0) {
      return this.MianziPick(s, shoupai, n + 1);
    }
    var shunzi = [];
    /* 順子を抜き取る */
    if (n <= 7 && shoupai[n] > 0 && shoupai[n + 1] > 0 && shoupai[n + 2] > 0) {
      shoupai[n]--;
      shoupai[n + 1]--;
      shoupai[n + 2]--;
      shunzi = this.MianziPick(s, shoupai, n);  // 抜き取ったら同じ位置でもう一度試行
      shoupai[n]++;
      shoupai[n + 1]++;
      shoupai[n + 2]++;
      for (var s_mianzi of shunzi) {
        s_mianzi.unshift(s+(n)+(n+1)+(n+2));
      }
    }
    var kezi = [];
    /* 刻子を抜き取る */
    if (shoupai[n] >= 3) {
      shoupai[n] -= 3;
      kezi = this.MianziPick(s, shoupai, n);    // 抜き取ったら同じ位置でもう一度試行
      shoupai[n] += 3;
      for (var k_mianzi of kezi) {
        k_mianzi.unshift(s+n+n+n);
      }
    }

    return shunzi.concat(kezi);
  }

  static AddMark(mianzi, p) {
    var regexp = new RegExp("^(" + p[1] + ".*" + (p[0] != '0' ? p[0] : "5") + ")");
    var replacer = "$1" + p[2] + "!";

    var new_mianzi = [];
    for (var i = 0; i < mianzi.length; i++) {
      // 副露面
      if (mianzi[i].match(/[\-\+\=]/)) continue;
      // 相同略
      if (i > 0 && mianzi[i] == mianzi[i - 1]) continue;
      var m = mianzi[i].replace(regexp, replacer);
      if (m == mianzi[i]) continue;
      var tmp_mianzi = mianzi.concat();
      tmp_mianzi[i] = m;
      new_mianzi.push(tmp_mianzi);
    }
    return new_mianzi;
  }
}

class PtJudger {

  static GetFen(shoupai, fulu, rongpai, param) {
    var max = {
      hupai: null,
      fu: 0,
      fanshu: 0,
      damanguan: 0,
      defen: 0,
      fenpei: [0, 0, 0, 0]
    };
    var pre_hupai = this.get_pre_hupai(param.hupai);
    var post_hupai = this.get_post_hupai(
      shoupai.toString(), param.baopai, param.fubaopai);

    for (var mianzi of RonJudger.Ron(shoupai, rongpai, fulu)) {
      var hudi = this.get_hudi(mianzi, param.zhuangfeng, param.menfeng);
      var hupai = this.get_hupai(mianzi, hudi, pre_hupai);
      //console.log(hudi,hupai);
      if (hupai.length == 0) continue;

      var fu = hudi.fu;
      var fanshu = 0, defen = 0, damanguan = 0;

      var baojia2, defen2 = 0;

      if (hupai[0].fanshu[0] == '*') {
        for (var h of hupai) {
          damanguan += h.fanshu.match(/\*/g).length;
          if (h.baojia) {
            baojia2 = h.baojia == '+' ? (param.menfeng + 1) % 4
              : h.baojia == '=' ? (param.menfeng + 2) % 4
                : h.baojia == '-' ? (param.menfeng + 3) % 4
                  : -1;
            defen2 = 8000 * h.fanshu.match(/\*/g).length;
          }
        }
        defen = 8000 * damanguan;
      }
      else {
        hupai = hupai.concat(post_hupai);
        for (var h of hupai) { fanshu += h.fanshu }
        if (fanshu >= 13) defen = 8000;
        else if (fanshu >= 11) defen = 6000;
        else if (fanshu >= 8) defen = 4000;
        else if (fanshu >= 6) defen = 3000;
        else {
          defen = fu * 2 * 2;
          for (var i = 0; i < fanshu; i++) { defen *= 2 }
          if (defen >= 2000) defen = 2000;
        }
      }

      var fenpei = [0, 0, 0, 0];

      if (defen2 > 0) {
        if (rongpai) defen2 = defen2 / 2;
        defen = defen - defen2;
        defen2 = defen2 * (param.menfeng == 0 ? 6 : 4);
        fenpei[param.menfeng] = defen2;
        fenpei[baojia2] = -defen2;
      }

      var changbang = param.jicun.changbang;
      var lizhibang = param.jicun.lizhibang;

      if (rongpai || defen == 0) {
        var baojia = defen == 0 ? baojia2
          : rongpai[2] == '+' ? (param.menfeng + 1) % 4
            : rongpai[2] == '=' ? (param.menfeng + 2) % 4
              : rongpai[2] == '-' ? (param.menfeng + 3) % 4
                : -1;
        defen = Math.ceil(defen * (param.menfeng == 0 ? 6 : 4) / 100) * 100;
        fenpei[param.menfeng] += defen + changbang * 300 + lizhibang * 1000;
        fenpei[baojia] += -defen - changbang * 300;
      }
      else {
        var zhuangjia = Math.ceil(defen * 2 / 100) * 100;
        var sanjia = Math.ceil(defen / 100) * 100;
        if (param.menfeng == 0) {
          defen = zhuangjia * 3;
          for (var l = 0; l < 4; l++) {
            if (l == param.menfeng)
              fenpei[l] += defen + changbang * 300 + lizhibang * 1000;
            else
              fenpei[l] += -zhuangjia - changbang * 100;
          }
        }
        else {
          defen = zhuangjia + sanjia * 2;
          for (var l = 0; l < 4; l++) {
            if (l == param.menfeng)
              fenpei[l] += defen + changbang * 300
                + lizhibang * 1000;
            else if (l == 0)
              fenpei[l] += -zhuangjia - changbang * 100;
            else
              fenpei[l] += -sanjia - changbang * 100;
          }
        }
      }

      if (defen + defen2 > max.defen
        || defen + defen2 == max.defen
        && (!fanshu || fanshu > max.fanshu
          || fanshu == max.fanshu && fu > max.fu)) {
        max = {
          hupai: hupai,
          fu: fu,
          fanshu: fanshu,
          damanguan: damanguan,
          defen: defen + defen2,
          fenpei: fenpei
        };
      }
    }

    return max;
  }


  static get_pre_hupai(hupai) {

    var pre_hupai = [];
    if (hupai == []) return [];

    if (hupai.lizhi == 1) pre_hupai.push({ name: '立直', fanshu: 1 });
    if (hupai.lizhi == 2) pre_hupai.push({ name: 'ダブル立直', fanshu: 2 });
    if (hupai.yifa) pre_hupai.push({ name: '一発', fanshu: 1 });
    if (hupai.haidi == 1) pre_hupai.push({ name: '海底摸月', fanshu: 1 });
    if (hupai.haidi == 2) pre_hupai.push({ name: '河底撈魚', fanshu: 1 });
    if (hupai.lingshang) pre_hupai.push({ name: '嶺上開花', fanshu: 1 });
    if (hupai.qianggang) pre_hupai.push({ name: '槍槓', fanshu: 1 });

    if (hupai.tianhu == 1) pre_hupai = [{ name: '天和', fanshu: '*' }];
    if (hupai.tianhu == 2) pre_hupai = [{ name: '地和', fanshu: '*' }];

    return pre_hupai;
  }


  static get_post_hupai(paistr, baopai, fubaopai) {
    var post_hupai = [];
    var substr = paistr.match(/[mpsz][^mpsz,]*/g) || [];
    var n_baopai = 0;
    for (var p of baopai) {
      p = PaiMaker.GetBao(p);
      var regexp = new RegExp(p[1], 'g');
      for (var str of substr) {
        if (str[0] != p[0]) continue;
        str = str.replace(/0/, '5');
        var nn = str.match(regexp);
        if (nn) n_baopai += nn.length;
      }
    }
    if (n_baopai) post_hupai.push({ name: 'ドラ', fanshu: n_baopai });
    var n_hongpai = 0;
    var nn = paistr.match(/0/g);
    if (nn) n_hongpai = nn.length;
    if (n_hongpai) post_hupai.push({ name: '赤ドラ', fanshu: n_hongpai });
    var n_fubaopai = 0;
    for (var p of fubaopai) {
      p = Majiang.Shan.zhenbaopai(p);
      var regexp = new RegExp(p[1], 'g');
      for (var str of substr) {
        if (str[0] != p[0]) continue;
        str = str.replace(/0/, '5');
        var nn = str.match(regexp);
        if (nn) n_fubaopai += nn.length;
      }
    }
    if (n_fubaopai) post_hupai.push({ name: '裏ドラ', fanshu: n_fubaopai });
    return post_hupai;
  }

  static get_hudi(mianzi, zhuangfeng, menfeng) {

    var zhuangfengpai = new RegExp('^z' + (zhuangfeng + 1) + '.*$');
    var menfengpai = new RegExp('^z' + (menfeng + 1) + '.*$');
    var sanyuanpai = /^z[567].*$/;

    var yaojiu = /^.*[z19].*$/;
    var zipai = /^z.*$/;

    var kezi = /^[mpsz](\d)\1\1.*$/;
    var ankezi = /^[mpsz](\d)\1\1(?:\1|_\!)?$/;
    var gangzi = /^[mpsz](\d)\1\1.*\1.*$/;

    var danqi = /^[mpsz](\d)\1[\-\+\=\_]\!$/;
    var kanzhang = /^[mps]\d\d[\-\+\=\_]\!\d$/;
    var bianzhang = /^[mps](123[\-\+\=\_]\!|7[\-\+\=\_]\!89)$/;

    var hudi = {
      fu: 20,
      menqian: true,
      zimo: true,
      shunzi: { m: {}, p: {}, s: {} },
      kezi: {
        m: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        p: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        s: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        z: [0, 0, 0, 0, 0, 0, 0, 0]
      },
      n_shunzi: 0,
      n_kezi: 0,
      n_ankezi: 0,
      n_gangzi: 0,
      n_zipai: 0,
      n_yaojiu: 0,
      danqi: false,
      pinghu: false,
      zhuangfeng: zhuangfeng,
      menfeng: menfeng
    };

    for (var m of mianzi) {

      if (m.match(/[\-\+\=]\!/)) hudi.zimo = false;
      if (m.match(/[\-\+\=](?!\!)/)) hudi.menqian = false;

      if (m.match(yaojiu)) hudi.n_yaojiu++;
      if (m.match(zipai)) hudi.n_zipai++;

      if (m.match(danqi)) hudi.danqi = true;

      if (mianzi.length != 5) continue;

      if (m == mianzi[0]) {
        var fu = 0;
        if (m.match(zhuangfengpai)) fu += 2;
        if (m.match(menfengpai)) fu += 2;
        if (m.match(sanyuanpai)) fu += 2;
        hudi.fu += fu;
        if (hudi.danqi) hudi.fu += 2;
      }
      else if (m.match(kezi)) {
        hudi.n_kezi++;
        var fu = 2;
        if (m.match(yaojiu)) { fu *= 2; }
        if (m.match(ankezi)) { fu *= 2; hudi.n_ankezi++; }
        if (m.match(gangzi)) { fu *= 4; hudi.n_gangzi++; }
        hudi.fu += fu;
        hudi.kezi[m[0]][m[1]] = 1;
      }
      else {
        hudi.n_shunzi++;
        if (m.match(kanzhang)) hudi.fu += 2;
        if (m.match(bianzhang)) hudi.fu += 2;
        var nnn = m.replace(/[^\d]/g, '');
        if (!hudi.shunzi[m[0]][nnn]) hudi.shunzi[m[0]][nnn] = 1;
        else hudi.shunzi[m[0]][nnn]++;
      }
    }

    if (mianzi.length == 7) {
      hudi.fu = 25;
    }
    else if (mianzi.length == 5) {
      hudi.pinghu = (hudi.menqian && hudi.fu == 20);
      if (hudi.zimo) {
        if (!hudi.pinghu) hudi.fu += 2;
      }
      else {
        if (hudi.menqian) hudi.fu += 10;
        else if (hudi.fu == 20) hudi.fu = 30;
      }
      hudi.fu = Math.ceil(hudi.fu / 10) * 10;
    }

    return hudi;
  }

  static get_hupai(mianzi, hudi, pre_hupai) {

    function menqianqing() {
      if (hudi.menqian && hudi.zimo)
        return [{ name: '門前清自摸和', fanshu: 1 }];
      return [];
    }
    function fanpai() {
      var feng_hanzi = ['東', '南', '西', '北'];
      var fanpai_all = [];
      if (hudi.kezi.z[hudi.zhuangfeng + 1])
        fanpai_all.push({
          name: '場風 ' + feng_hanzi[hudi.zhuangfeng],
          fanshu: 1
        });
      if (hudi.kezi.z[hudi.menfeng + 1])
        fanpai_all.push({
          name: '自風 ' + feng_hanzi[hudi.menfeng],
          fanshu: 1
        });
      if (hudi.kezi.z[5]) fanpai_all.push({ name: '翻牌 白', fanshu: 1 });
      if (hudi.kezi.z[6]) fanpai_all.push({ name: '翻牌 發', fanshu: 1 });
      if (hudi.kezi.z[7]) fanpai_all.push({ name: '翻牌 中', fanshu: 1 });
      return fanpai_all;
    }
    function pinghu() {
      if (hudi.pinghu) return [{ name: '平和', fanshu: 1 }];
      return [];
    }
    function duanyaojiu() {
      if (hudi.n_yaojiu == 0) return [{ name: '断幺九', fanshu: 1 }];
      return [];
    }
    function yibeikou() {
      if (!hudi.menqian) return [];
      var beikou = 0;
      for (var s in hudi.shunzi) {
        for (var m in hudi.shunzi[s]) {
          if (hudi.shunzi[s][m] > 3) beikou++;
          if (hudi.shunzi[s][m] > 1) beikou++;
        }
      }
      if (beikou == 1) return [{ name: '一盃口', fanshu: 1 }];
      return [];
    }
    function sansetongshun() {
      var shunzi = hudi.shunzi;
      for (var m in shunzi.m) {
        if (shunzi.p[m] && shunzi.s[m])
          return [{ name: '三色同順', fanshu: (hudi.menqian ? 2 : 1) }];
      }
      return [];
    }
    function yiqitongguan() {
      var shunzi = hudi.shunzi;
      for (var s in shunzi) {
        if (shunzi[s][123] && shunzi[s][456] && shunzi[s][789])
          return [{ name: '一気通貫', fanshu: (hudi.menqian ? 2 : 1) }];
      }
      return [];
    }
    function hunquandaiyaojiu() {
      if (hudi.n_yaojiu == 5 && hudi.n_shunzi > 0 && hudi.n_zipai > 0)
        return [{ name: '混全帯幺九', fanshu: (hudi.menqian ? 2 : 1) }];
      return [];
    }
    function qiduizi() {
      if (mianzi.length == 7) return [{ name: '七対子', fanshu: 2 }];
      return [];
    }
    function duiduihu() {
      if (hudi.n_kezi == 4) return [{ name: '対々和', fanshu: 2 }];
      return [];
    }
    function sananke() {
      if (hudi.n_ankezi == 3) return [{ name: '三暗刻', fanshu: 2 }];
      return [];
    }
    function sangangzi() {
      if (hudi.n_gangzi == 3) return [{ name: '三槓子', fanshu: 2 }];
      return [];
    }
    function sansetongke() {
      var kezi = hudi.kezi;
      for (var n = 1; n <= 9; n++) {
        if (kezi.m[n] + kezi.p[n] + kezi.s[n] == 3)
          return [{ name: '三色同刻', fanshu: 2 }];
      }
      return [];
    }
    function hunlaotou() {
      if (hudi.n_yaojiu == mianzi.length
        && hudi.n_shunzi == 0 && hudi.n_zipai > 0)
        return [{ name: '混老頭', fanshu: 2 }];
      return [];
    }
    function xiaosanyuan() {
      if (hudi.kezi.z[5] + hudi.kezi.z[6] + hudi.kezi.z[7] == 2
        && mianzi[0].match(/^z[567]/))
        return [{ name: '小三元', fanshu: 2 }];
      return [];
    }
    function hunyise() {
      for (var s of ['m', 'p', 's']) {
        var yise = new RegExp('^[z' + s + '].*$');
        if (mianzi.filter(function (m) { return m.match(yise) }).length
          == mianzi.length
          && hudi.n_zipai > 0)
          return [{ name: '混一色', fanshu: (hudi.menqian ? 3 : 2) }];
      }
      return [];
    }
    function chunquandaiyaojiu() {
      if (hudi.n_yaojiu == 5 && hudi.n_shunzi > 0 && hudi.n_zipai == 0)
        return [{ name: '純全帯幺九', fanshu: (hudi.menqian ? 3 : 2) }];
      return [];
    }
    function erbeikou() {
      if (!hudi.menqian) return [];
      var beikou = 0;
      for (var s in hudi.shunzi) {
        for (var m in hudi.shunzi[s]) {
          if (hudi.shunzi[s][m] > 3) beikou++;
          if (hudi.shunzi[s][m] > 1) beikou++;
        }
      }
      if (beikou == 2) return [{ name: '二盃口', fanshu: 3 }];
      return [];
    }
    function qingyise() {
      for (var s of ['m', 'p', 's']) {
        var yise = new RegExp('^[z' + s + '].*$');
        if (mianzi.filter(function (m) { return m.match(yise) }).length
          == mianzi.length
          && hudi.n_zipai == 0)
          return [{ name: '清一色', fanshu: (hudi.menqian ? 6 : 5) }];
      }
      return [];
    }

    function guoshiwushuang() {
      if (mianzi.length != 13) return [];
      if (hudi.danqi) return [{ name: '国士無双十三面', fanshu: '**' }];
      else return [{ name: '国士無双', fanshu: '*' }];
    }
    function sianke() {
      if (hudi.n_ankezi != 4) return [];
      if (hudi.danqi) return [{ name: '四暗刻単騎', fanshu: '**' }];
      else return [{ name: '四暗刻', fanshu: '*' }];
    }
    function dasanyuan() {
      if (hudi.kezi.z[5] + hudi.kezi.z[6] + hudi.kezi.z[7] == 3) {
        var bao_mianzi = mianzi.filter(function (m) {
          return m.match(/^z([567])\1\1(?:[\-\+\=]|\1)(?!\!)/)
        });
        var baojia = (bao_mianzi[2] && bao_mianzi[2].match(/[\-\+\=]/));
        return [{ name: '大三元', fanshu: '*', baojia: baojia && baojia[0] }];
      }
      return [];
    }
    function sixihu() {
      var kezi = hudi.kezi;
      if (kezi.z[1] + kezi.z[2] + kezi.z[3] + kezi.z[4] == 4) {
        var bao_mianzi = mianzi.filter(function (m) {
          return m.match(/^z([1234])\1\1(?:[\-\+\=]|\1)(?!\!)/)
        });
        var baojia = (bao_mianzi[3] && bao_mianzi[3].match(/[\-\+\=]/));
        return [{ name: '大四喜', fanshu: '**', baojia: baojia && baojia[0] }];
      }
      if (kezi.z[1] + kezi.z[2] + kezi.z[3] + kezi.z[4] == 3
        && mianzi[0].match(/^z[1234]/))
        return [{ name: '小四喜', fanshu: '*' }];
      return [];
    }
    function ziyise() {
      if (hudi.n_zipai == mianzi.length)
        return [{ name: '字一色', fanshu: '*' }];
      return [];
    }
    function lvyise() {
      if (mianzi.filter(function (m) { return m.match(/^[mp]/) }).length > 0)
        return [];
      if (mianzi.filter(function (m) { return m.match(/^z[^6]/) }).length > 0)
        return [];
      if (mianzi.filter(function (m) { return m.match(/^s.*[1579]/) }).length > 0)
        return [];
      return [{ name: '緑一色', fanshu: '*' }];
    }
    function qinglaotou() {
      if (hudi.n_kezi == 4 && hudi.n_yaojiu == 5 && hudi.n_zipai == 0)
        return [{ name: '清老頭', fanshu: '*' }];
      return [];
    }
    function sigangzi() {
      if (hudi.n_gangzi == 4)
        return [{ name: '四槓子', fanshu: '*' }];
      return [];
    }
    function jiulianbaodeng() {
      if (mianzi.length != 1) return [];
      if (mianzi[0].match(/^[mps]1112345678999/))
        return [{ name: '純正九蓮宝燈', fanshu: '**' }];
      else return [{ name: '九蓮宝燈', fanshu: '*' }];
    }

    var damanguan = (pre_hupai.length > 0 && pre_hupai[0].fanshu[0] == '*')
      ? pre_hupai : [];
    damanguan = damanguan
      .concat(guoshiwushuang())
      .concat(sianke())
      .concat(dasanyuan())
      .concat(sixihu())
      .concat(ziyise())
      .concat(lvyise())
      .concat(qinglaotou())
      .concat(sigangzi())
      .concat(jiulianbaodeng());

    if (damanguan.length > 0) return damanguan;
    else return pre_hupai
      .concat(menqianqing())
      .concat(fanpai())
      .concat(pinghu())
      .concat(duanyaojiu())
      .concat(yibeikou())
      .concat(sansetongshun())
      .concat(yiqitongguan())
      .concat(hunquandaiyaojiu())
      .concat(qiduizi())
      .concat(duiduihu())
      .concat(sananke())
      .concat(sangangzi())
      .concat(sansetongke())
      .concat(hunlaotou())
      .concat(xiaosanyuan())
      .concat(hunyise())
      .concat(chunquandaiyaojiu())
      .concat(erbeikou())
      .concat(qingyise());
  }



}

export {
  PaiMaker, TingJudger, RonJudger, PtJudger, MianziMaker
};