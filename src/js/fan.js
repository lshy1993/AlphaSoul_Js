const charaname = [
'yiji',
'erjietang',
'qianzhi',
'fuzi',
'xiangyuan',
'jianai',
'bamuwei',
'jiutiao'
]
    
const voicename = [
'act_chi.mp3',
'act_kan.mp3',
'act_pon.mp3',
'act_babei.mp3',
'act_drich.mp3',
'act_rich.mp3',
'act_ron.mp3',
'act_tumo.mp3',
'fan_qianggang.mp3',
'fan_lingshang.mp3',
'fan_haidi.mp3',
'fan_hedi.mp3',
'fan_nan.mp3',
'fan_xi.mp3',
'fan_bei.mp3',
'fan_zhong.mp3',
'fan_bai.mp3',
'fan_fa.mp3',
'fan_doubledong.mp3',
'fan_doublenan.mp3',
'fan_doublexi.mp3',
'fan_doublebei.mp3',
'fan_duanyao.mp3',
'fan_yibeikou.mp3',
'fan_pinghu.mp3',
'fan_hunquandaiyaojiu.mp3',
'fan_yiqitongguan.mp3',
'fan_sansetongshun.mp3',
'fan_sansetongke.mp3',
'fan_sangangzi.mp3',
'fan_duiduihu.mp3',
'fan_sananke.mp3',
'fan_xiaosanyuan.mp3',
'fan_hunlaotou.mp3',
'fan_qiduizi.mp3',
'fan_hunyise.mp3',
'fan_erbeikou.mp3',
'fan_qingyise.mp3',
'fan_rich.mp3',
'fan_drich.mp3',
'fan_tumo.mp3',
'fan_yifa.mp3',
'fan_dora1.mp3',
'fan_dora2.mp3',
'fan_dora3.mp3',
'fan_dora4.mp3',
'fan_dora5.mp3',
'fan_dora6.mp3',
'fan_dora3.mp3',
'fan_dora4.mp3',
'fan_dora5.mp3',
'fan_dora6.mp3',
'fan_dora7.mp3',
'fan_dora8.mp3',
'fan_dora9.mp3',
'fan_dora10.mp3',
'fan_dora11.mp3',
'fan_dora12.mp3',
'fan_dora13.mp3',
'fan_tianhu.mp3',
'fan_dihu.mp3',
'fan_dasanyuan.mp3',
'fan_sianke.mp3',
'fan_siankedanqi.mp3',
'fan_ziyise.mp3',
'fan_lvyise.mp3',
'fan_qinglaotou.mp3',
'fan_guoshiwushuang.mp3',
'fan_guoshishisanmian.mp3',
'fan_xiaosixi.mp3',
'fan_dasixi.mp3',
'fan_sigangzi.mp3',
'fan_jiulianbaodeng.mp3',
'fan_chunzhengjiulianbaodeng.mp3',
'fan_liujumanguan.mp3',
'gameend_manguan.mp3',
'gameend_tiaoman.mp3',
'gameend_beiman.mp3',
'gameend_sanbeiman.mp3',
'gameend_leijiyiman.mp3',
'gameend_yiman1.mp3',
'gameend_yiman2.mp3',
'gameend_yiman3.mp3',
'gameend_yiman4.mp3',
'gameend_yiman5.mp3',
'gameend_yiman6.mp3',
'gameend_tingpai.mp3',
'gameend_noting.mp3',
'gameend_sigangliuju.mp3',
'gameend_sifenglianda.mp3',
'gameend_jiuzhongjiupai.mp3'
]

const fan_voice = {
'抢杠':'fan_qianggang.mp3',
'岭上开花':'fan_lingshang.mp3',
'海底摸月':'fan_haidi.mp3',
'河底捞鱼':'fan_hedi.mp3',
'役牌 白':'fan_bai.mp3',
'役牌 发':'fan_fa.mp3',
'役牌 中':'fan_zhong.mp3',
'断幺九':'fan_duanyao.mp3',
'一杯口':'fan_yibeikou.mp3',
'平和':'fan_pinghu.mp3',
'混全带幺九':'fan_hunquandaiyaojiu.mp3',
'纯全带幺九':'fan_chunquandaiyaojiu.mp3',
'一气通贯':'fan_yiqitongguan.mp3',
'三色同顺':'fan_sansetongshun.mp3',
'三色同刻':'fan_sansetongke.mp3',
'三杠子':'fan_sangangzi.mp3',
'对对胡':'fan_duiduihu.mp3',
'三暗刻':'fan_sananke.mp3',
'小三元':'fan_xiaosanyuan.mp3',
'混老头':'fan_hunlaotou.mp3',
'七对子':'fan_qiduizi.mp3',
'混一色':'fan_hunyise.mp3',
'二杯口':'fan_erbeikou.mp3',
'清一色':'fan_qingyise.mp3',
'立直':'fan_rich.mp3',
'两立直':'fan_drich.mp3',
'门前清自摸和': 'fan_tumo.mp3',
'一发':'fan_yifa.mp3',
'天和':'fan_tianhu.mp3',
'地和':'fan_dihu.mp3',
'大三元':'fan_dasanyuan.mp3',
'四暗刻':'fan_sianke.mp3',
'四暗刻单骑':'fan_siankedanqi.mp3',
'字一色': 'fan_ziyise.mp3',
'绿一色': 'fan_lvyise.mp3',
'清老头': 'fan_qinglaotou.mp3',
'国士无双': 'fan_guoshiwushuang.mp3',
'国士无双十三面': 'fan_guoshishisanmian.mp3',
'小四喜':'fan_xiaosixi.mp3',
'大四喜':'fan_dasixi.mp3',
'四杠子':'fan_sigangzi.mp3',
'九莲宝灯':'fan_jiulianbaodeng.mp3',
'纯正九莲宝灯':'fan_chunzhengjiulianbaodeng.mp3',
'流局满贯':'fan_liujumanguan.mp3'
};

var columnName = {
    '立直': 'RICHI',
    '门前清自摸和': 'TSUMO',
    '抢杠': 'CHANKAN',
    '岭上开花': 'RINSHAN',
    '海底捞月': 'HAITEI',
    '河底捞鱼': 'HOUTEI',	
    '役牌 白': 'HAKU',
    '役牌 发': 'HATSU',
    '役牌 中': 'CHUN',
    '门风牌': 'MENFENG',
    '场风牌': 'CHANGFENG',
    '断幺九': 'TANYAO',
    '一杯口': 'IPEIKOU',
    '平和': 'PINHU'	,
    '混全带幺九': 'CHANTA',
    '一气通贯': 'ITTSUU',
    '三色同顺': 'SANSHOKU_DOUJUN',
    '两立直': 'WRICHI',
    '三色同刻': 'SANSHOKU_DOUKO',
    '三杠子': 'SAN_KANTSU',
    '对对胡': 'TOITOI',
    '三暗刻': 'SAN_ANKO',
    '小三元': 'SHOU_SANGEN',
    '混老头': 'HONROU',
    '七对子': 'CHIITOI',
    '纯全带幺九': 'JUNCHAN',
    '混一色': 'HONIISOU',
    '两杯口': 'RYANPEIKOU',
    '清一色': 'CHINIISOU',
    '一发': 'IPPATSU',
    '宝牌': 'BAO',
    '里宝牌': 'LIBAO',
    '红宝牌': 'HONGBAO',
    '流局满贯': 'NAGASHI_MANKAN',
    '天和': 'TENHOU',
    '地和': 'CHIIHOU',
    '国士无双': 'KOKUSHI',
    '国士无双十三面': 'KOKUSHI_13',
    '四暗刻': 'SIANKO',
    '四暗刻单骑': 'SIANKO_TANKI',
    '大三元': 'DAI_SANGEN',
    '小四喜': 'SHOU_SUUSHII',
    '大四喜': 'DAI_SUSSHII',
    '字一色': 'TSUUIISOU',
    '清老头': 'CHINROUTOU',
    '绿一色': 'RYUUIISOU',
    '九莲宝灯': 'CHUUREN_POUTOU',
    '纯正九莲宝灯': 'JUNSEI_CHUUREN_POUTOU',
    '四杠子': 'SUU_KANTSU'	
}
// 'gameend_tingpai.mp3',
// 'gameend_noting.mp3',
// 'gameend_sigangliuju.mp3',
// 'gameend_sifenglianda.mp3',
// 'gameend_jiuzhongjiupai.mp3'

function getVoiceList(ptres){
    var ct = [0,0,0,0];
    var musicList = [];
    for(var fan of ptres.hupai){
        if(fan_voice.hasOwnProperty(fan.name)){
            musicList.push(fan_voice[fan.name]);
        }
        if(fan.name.indexOf('宝牌')!=-1){
            musicList.push('fan_dora'+ fan.fanshu+'.mp3');
        }
        // 单风
        if(fan.name.indexOf('门风牌') != -1){
            if(fan.name.indexOf('东') != -1){
                musicList.push(ct[0]>0?'fan_doubledong.mp3':'fan_dong.mp3');
                ct[0]++;
            }
            if(fan.name.indexOf('南') != -1){
                musicList.push(ct[1]>0?'fan_doublenan.mp3':'fan_nan.mp3');
                ct[1]++;
            }
            if(fan.name.indexOf('西') != -1){
                musicList.push(ct[2]>0?'fan_doublexi.mp3':'fan_xi.mp3');
                ct[2]++;
            }
            if(fan.name.indexOf('北') != -1){
                musicList.push(ct[3]>0?'fan_doublebei.mp3':'fan_bei.mp3');
                ct[3]++;
            }
        }
        // 连风
        if(fan.name.indexOf('场风牌') != -1){
            if(fan.name.indexOf('东') != -1){
                musicList.push(ct[0]>0?'fan_doubledong.mp3':'fan_dong.mp3');
                ct[0]++;
            }
            if(fan.name.indexOf('南') != -1){
                musicList.push(ct[1]>0?'fan_doublenan.mp3':'fan_nan.mp3');
                ct[1]++;
            }
            if(fan.name.indexOf('西') != -1){
                musicList.push(ct[2]>0?'fan_doublexi.mp3':'fan_xi.mp3');
                ct[2]++;
            }
            if(fan.name.indexOf('北') != -1){
                musicList.push(ct[3]>0?'fan_doublebei.mp3':'fan_bei.mp3');
                ct[3]++;
            }
        }
    }

    // 总分
    if(ptres.damanguan > 0){
        musicList.push('gameend_yiman'+ptres.damanguan+'.mp3');
    }
    else if (ptres.fanshu >= 13) musicList.push('gameend_leijiyiman.mp3');
    else if (ptres.fanshu >= 11) musicList.push('gameend_sanbeiman.mp3');
    else if (ptres.fanshu >= 8) musicList.push('gameend_beiman.mp3');
    else if (ptres.fanshu >= 6) musicList.push('gameend_tiaoman.mp3');
    else if (ptres.fanshu > 4 || ptres.fanshu == 4 && ptres.fu >= 40 || ptres.fanshu == 3 && ptres.fu >= 70){
        musicList.push('gameend_manguan.mp3');
    }

    return musicList;
}

function getPreloadVoice(){
    var volist = [];
    for(var chara of charaname){
        for(var voice of voicename){
            volist.push('/audio/'+chara+'/'+voice);
        }
    }
    return volist;
}

export default { getVoiceList, getPreloadVoice,columnName };