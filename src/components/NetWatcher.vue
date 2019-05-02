<template>
<div>
  <div id="game">
    <!--audio ref="mainAudio"></audio-->
    <div :class="['BoardDiv','Menu']">
        <span>本页面程序仅供学习使用，素材均来自于雀魂游戏</span>
        <h2>AlphaSoul自我对战</h2>
        <h4>v0.0.3</h4>
        <button v-if="!serverConnected" @click="reLink">ReLink</button>
        <!--button v-if="serverConnected" @click="newGame">NewGame</button-->
        <h4>{{ wsMsg }}</h4>
    </div>
    <!-- 宝牌指示 -->
    <div class="BaoDiv">
        <div v-for="index in 5" :key="'bao'+index" :class="[index<=bao.length?'PaiDivS':'PaiMask']">
            <img v-if="index<=bao.length" :src="imgUrl(bao[index-1])" />
        </div>
        <div v-for="bindex in 5" :key="'libao'+bindex" :class="[bindex<=libao.length?'PaiDivS':'PaiMask']">
            <img v-if="bindex<=libao.length" :src="imgUrl(bao[bindex-1])" />
        </div>
        <div>场棒：{{ changbang }} 立直棒：{{ lizhibang }}</div>
    </div>
    <div class="YamaDiv">
        <div v-for="(code,index) in yama" :key="index" :class="['PaiDivS',index%4==0?'LastS':'']">
            <img :src="imgUrl(code)"/>
            <div v-if="index<=yamaPos" :class="['BigMask']"></div>
        </div>
    </div>
    <!-- 牌桌 -->
    <div class="TableDiv">
        <!-- 角色 -->
        <div v-for="chara in 4" :key="chara+'c'" :class="['HeadDiv',['bottom','right','top','left'][chara-1]]" >
            <div class="iconImg">
                <img :src="headUrl(chara-1)" width="100" height="100" />
            </div>
            <div style="color:white;">{{ ['玩家','AlphaSoul科学','AlphaSoul昭和','AlphaSoul玄学'][chara-1] }}</div>
        </div>
        <!-- 手牌与副露 -->
        <div v-for="pid_h in 3" :key="'hs'+pid_h" :class="['HandDiv',['right','top','left'][pid_h-1]]">
            <div style="display: inline-block; float:left;">
                <div v-for="(code,ind) in handStack[pid_h]" :key="ind" :class="[code=='*'?'PaiMask':'PaiDivS',checkLast(ind,pid_h)?'LastS':'']">
                    <img v-if="code!='*'" :src="imgUrl(code.substr(0,2))" width="40" height="65"/>
                </div>
            </div>
            <div style="display: inline-block; float:right;">
                <div v-for="(code,indc) in fuluStack[pid_h]" :key="'fulu'+indc" class="Mianzi">
                    <div v-for="(p,i) in sortFulu(code)" :key="'ch'+i" :class="['PaiDivS',!p && p.length>2?'PaiRotateS':'']">
                        <img :src="imgUrl(p.substr(0,2))" width="40" height="65"/>
                    </div>
                </div>
            </div>
        </div>
        <!-- 牌河 -->
        <div v-for="pid_r in 4" :key="'rv'+pid_r" :class="['RiverDiv',['bottom','right','top','left'][pid_r-1]]">
            <div v-for="(code,index) in riverStack[pid_r-1]" :key="index" :class="['PaiDivS',code.length==3?'RiverRotateS':'']">
                <img :src="imgUrl(code.substr(0,2))" width="40" height="65"/>
            </div>
        </div>
        <!-- 文字副露提示 -->
        <div v-for="pid_t in 4" :key="'txt'+pid_t" :class="['TextDiv',['bottom','right','top','left'][pid_t-1]]">
            {{ txtMsg[pid_t-1] }}
        </div>
        <!-- 中央 -->
        <div class="CenterDiv">
            <div v-for="pids in 4" :key="pids" :class="['ScoreDiv',['bottom','right','top','left'][pids-1]]">
                <div class="windDiv">{{ ['东','南','西','北'][((pids-1)-qinjia+4)%4] }}</div>
                <div class="turnDiv">
                    <div :class="['scoreTxt',curWind==(pids-1)?'turned':'']">{{ score[pids-1] }}</div>
                    <div class="lizhiDiv" v-if="playerLizhi[pids-1]">・</div>
                </div>
            </div>
            <div class="InfoPanel">
                <h1>{{ ['东','南','西','北'][changfeng]+['一','二','三','四'][qinjia]+'局' }}</h1>
                <div>剩余牌山：{{ restyama }}</div>
                <div>场棒：{{ changbang }}</div>
                <div>立直棒：{{ lizhibang }}</div>
                <div>宝牌：{{ bao }}</div>
            </div>
        </div>
    </div>
    <!-- 得分和终局 -->
    <div class="ResultWrap">
        <div v-if="humsg.hand != undefined && !scoreChangeOn" class="BlackDiv ResultDiv">
            <div>
                <div v-for="(hcode,hindex) in humsg.hand" :key="'h'+hindex" :class="['PaiDivS',hcode.length==3?'LastS':'']">
                    <img :src="imgUrl(hcode.substr(0,2))" />
                </div>
                <div v-for="(fcode,findex) in fuluStack[humsg.seat]" :key="'f'+findex" class="Mianzi">
                    <div v-for="(p,i) in sortFulu(fcode)" :key="'ch'+i" :class="['PaiDivS',p.length>2?'PaiRotateS':'']">
                        <img :src="imgUrl(p.substr(0,2))" />
                    </div>
                </div>
            </div>
            <div style="margin-top: 20px;">
                <span>宝牌：</span>
                <div style="display: inline-block;">
                    <div v-for="bindex in 5" :key="'b'+bindex" :class="[bindex>humsg.bao.length?'PaiMask':'PaiDivS']">
                        <img v-if="bindex<=humsg.bao.length" :src="imgUrl(humsg.bao[bindex-1])" />
                    </div>
                </div>
                <span>里宝牌：</span>
                <div style="display: inline-block;">
                    <div v-for="lindex in 5" :key="'l'+lindex" :class="[lindex>humsg.libao.length?'PaiMask':'PaiDivS']">
                        <img v-if="lindex<=humsg.libao.length" :src="imgUrl(humsg.libao[lindex-1])" />
                    </div>
                </div>
            </div>
            <div style="margin-top: 20px;">
                <div v-for="(mianzi,index) in humsg.ptres.hupai" :key="index" :class="['FanMing',index>=fanPos?'hide':'']">
                    <span>{{ mianzi.name }}</span>
                    <span style="float:right;">{{ mianzi.fanshu }}番</span>
                </div>
            </div>
            <div :class="[fanPos<voiceList.length?'hide':'']" >
                <h2>{{ humsg.ptres.fu  }}符 {{ humsg.ptres.fanshu }}番 {{ humsg.ptres.defen }}</h2>
            </div>
            <button style="width:80px;height:40px;" @click="confirmOpt(humsg.ptres.fenpei)">确认</button>
        </div>
        <div v-if="liumsg.opt != undefined && !scoreChangeOn" class="BlackDiv  ResultDiv">
            <div>{{ ['四风连打','四家立直','荒牌流局','四杠散了'][liumsg.opt] }}</div>
            <div style="height:260px; margin-bottom:20px;" v-if="liumsg.opt == 2">
                <div v-for="tid in 4" :key="'ting'+tid" :class="['hintDiv',['bottom','right','top','left'][tid-1]]">
                    <div v-for="(tcode,tpid) in tingPai[tid]" :key="tid+'p'+tpid" class="PaiDivS">
                        <img :src="imgUrl(tcode)" />
                    </div>
                </div>
            </div>
            <button style="width:80px;height:40px;" @click="confirmOpt(liumsg.fenpei)">确认</button>
        </div>
        <div class="BlackDiv ScoreChangeDiv" v-if="scoreChangeOn">
            <div style="height:260px; margin-bottom:20px;">
                <div v-for="sid in 4" :key="'fen'+sid" :class="['ScoreDiv',['bottom','right','top','left'][sid-1]]">
                    <div class="ScoreTxt">{{ tweenedScore[sid-1] }}</div>
                    <div :class="['ChangeTxt',tweenedFenpei[sid-1]<0?'negative':tweenedFenpei[sid-1]>0?'positive':'']">{{ tweenedFenpei[sid-1] }}</div>
                </div>
            </div>
            <button style="width:80px;height:40px;" @click="confirmOpt">确认</button>
        </div>
        <div class="BlackDiv GameEndDiv" v-if="endGameOn">
            <div style="margin-bottom:20px;">
                <div v-for="sid in sortScore()" :key="'pt'+sid" :class="['FinalDiv']">
                    <div class="iconImg">
                        <img :src="headUrl(sid)" width="100" height="100" />
                    </div>
                    <div class="CharaDiv">
                        <div class="NameTxt">{{ ['玩家','AlphaSoul科学','AlphaSoul昭和','AlphaSoul玄学'][sid] }}</div>
                        <div class="ScoreTxt">{{ score[sid] }}</div>
                        <div :class="['PtTxt',score[sid]<30000?'negative':'positive']">{{ Math.ceil((score[sid]-30000)/1000) }}</div>
                    </div>
                </div>
            </div>
            <button style="width:80px;height:40px;" @click="newGame">NewGame</button>
        </div>
    </div>
    <!-- 玩家操作UI部分 -->
    <div class="PlayerUI">
        <div class="PlayerWrap">
            <div v-if="(hintOn && tingPai!=undefined)" class="hintDiv">
                <div class="hintWrap">
                    <!--span>听牌:</span-->
                    <div v-for="(tcode,tind) in tingPai" :key="'hint'+tind" :class="['PaiDiv']">
                        <img :src="imgUrl(tcode)" width="80" height="129"/>
                        <span>{{ ['','振听'][0] }}</span>
                    </div>
                </div>
            </div>
            <div class="optDiv">
                <div v-if="subOptOn" style="display:inline-block;float:left;">
                    <div v-for="(cb,cbindex) in combShow" :key="cbindex" @click="sendOpt(cb)" style="display:inline-block;margin-right:10px;">
                        <div v-for="(p,index) in cb.combination.split('|')" :key="index" class="PaiDivS">
                            <img :src="imgUrl(p[0]+p[1])" width="40" height="65"/>
                        </div>
                    </div>
                </div>
                <button v-if="optFlag.chi&&!subOptOn" @click="selectOpt(2)">吃</button>
                <button v-if="optFlag.peng&&!subOptOn" @click="selectOpt(3)">碰</button>
                <button v-if="optFlag.gang&&!subOptOn" @click="selectOpt(4)">杠</button>
                <button v-if="optFlag.lizhi&&!lizhiOn" @click="selectOpt(7)">立直</button>
                <button v-if="optFlag.zimo" @click="selectOpt(8)">自摸</button>
                <button v-if="optFlag.hu" @click="selectOpt(9)">胡</button>
                <button v-if="optFlag.liuju" @click="selectOpt(10)">流局</button>
                <button v-if="hasOption" @click="cancelOpt">取消</button>
            </div>
            <div style="height:130px;position:relative;width:100%;">
                <transition-group name="flip-list" class="handDiv" tag="div">
                    <div v-for="(code,index) in handFlip()" :key="code" @mouseenter="tingPai=getTingPai(index)" @mouseleave="hintOn=false;" @click="discardPai(index)" :class="['PaiDiv', checkLast(index,seat)?'Last':'']">
                        <img :src="imgUrl(code.substr(0,2))" />
                        <div v-if="lizhiMask(index)" :class="['BigMask']"></div>
                    </div>
                </transition-group>
                <div class="fuluDiv">
                    <div v-for="(code,indc) in fuluStack[seat]" :key="'fulu'+indc" class="Mianzi">
                        <div v-for="(p,i) in sortFulu(code)" :key="'ch'+i" :class="['PaiDiv',!p && p.length>2?'PaiRotate':'']">
                            <img :src="imgUrl(p.substr(0,2))" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</div>
</template>

<script>
import FanTool from '../js/fan.js';
import { Howl, Howler } from 'howler';
var TWEEN = require('@tweenjs/tween.js');
const async = require('async');

export default {
    name: 'NetWatcher',
    data(){
        return{
            ws: Object,
            serverConnected: false,
            wsMsg: '',
            seat: 0,
            qinjia: 0,
            changfeng: 0,
            zifeng: 0,
            changbang: 0,
            lizhibang: 0,
            score: [25000,25000,25000,25000],
            tweenedScore: [0,0,0,0],
            fenpei: [1000,-1000,2000,-1000],
            tweenedFenpei: [0,0,0,0],
            yama: [],
            restyama: 0,
            bao: [],
            libao: [],
            handStack: [[],[],[],[]],
            fuluStack: [[],[],[],[]],
            riverStack: [[],[],[],[]],
            playerLizhi: [false,false,false,false],
            playerLizhiPai: [false,false,false,false], 
            humsg: {},
            huList: [],
            huPos: 0,
            liumsg: {},
            lizhi_state: false,
            fanPos: 0,
            curWind: 0,
            canDiscard: [],
            subOptOn: false,
            lizhiOn: false,
            hintOn: false,
            scoreChangeOn: false,
            endGameOn: false,
            lizhi_tile: '',
            txtMsg: ['','','',''],
            tingPai: [],
            optFlag: {},
            combShow: {},
            comb: {},
            charaName: ['','','',''],
            charaPic: ['','','',''],
            voiceList: []
        }
    },
    computed: {
        hasOption: function(){
            for (var n in this.optFlag) {
                if(n == 'qie') continue;
                return true;
            }
            return false;
        }
    },
    created(){
        var charaname = ['yiji','erjietang','qianzhi','fuzi','xiangyuan','jianai','bamuwei','jiutiao'];
        for(let i in this.charaName){
            let t = parseInt(Math.random()*8);
            this.charaName[i] = charaname[t];
            this.charaPic[i] = charaname[t]+(Math.random()<0.5?'_e':'');
        }
        this.reLink();
    },
    methods: {
        reLink: function(){
            var _self = this;
            var wbAdress = process.env.NODE_ENV == 'development' ? 'ws://localhost:8182' : 'wss://liantui.moe:8182';
            this.ws = new WebSocket(wbAdress);
            this.ws.onopen = function(){
                console.log("连接服务器成功");
                _self.wsMsg = '连接服务器成功';
                _self.serverConnected = true;
                _self.resetParam();
            }
            this.ws.onclose = function(){
                console.log("服务器关闭");
                _self.wsMsg = '服务器关闭';
                _self.serverConnected = false;
                _self.resetParam();
            }
            this.ws.onerror = function(){
                console.log("连接出错");
                _self.wsMsg = '连接出错';
                _self.serverConnected = false;
                // _self.resetParam();
            }
            this.ws.onmessage = function(msg){
                var e = JSON.parse(msg.data);
                _self.decode(e);
            }
        },
        resetParam: function(){
            this.humsg = {};
            this.liumsg = {};
            this.bao = [];
            this.lizhiOn = false;
            this.subOptOn = false;
            this.scoreChangeOn = false;
            this.endGameOn = false;
            this.fuluStack = [[],[],[],[]];
            this.riverStack = [[],[],[],[]];
            this.handStack = [[],[],[],[]];
            this.tingPai = [];
            this.playerLizhi = [false,false,false,false];
            this.playerLizhiPai = [false,false,false,false];
        },
        playHuEnded(){
            this.humsg = this.huList[this.huPos];
            let pid = this.humsg.seat;
            this.txtMsg[pid] = '';
            this.handStack[pid] = this.humsg.hand;
            this.sortPai(pid);
            
            // 生成报菜名表
            this.voiceList = FanTool.getVoiceList(this.humsg.ptres);

            var _self = this;
            let task = [];
            for(var ii in this.voiceList){
                let file = '/audio/'+this.charaName[pid]+'/'+this.voiceList[ii];
                let tk = callback => {
                    var sound = new Howl({
                        src: file,
                        autoplay: true
                    });
                    sound.on('end',function(){
                        console.log(file);
                        callback(null,file);
                    });
                    _self.fanPos++;
                }
                task.push(tk);
            }
            this.fanPos = 0;
            async.series(task,(err,results)=>{
                if(err) console.log(err);
                console.log('voice play all done!');
            });
        },
        playGangEnded(e){
            let pid = e.seat;
            this.txtMsg[pid] = '';
            for(let ii in e.tiles){
                var p = e.tiles[ii];
                var from = e.from[ii];
                if(from != this.seat){
                    // 其他人副露
                    this.handStack[from].splice(0,1);
                    continue;
                }else{
                    let index = this.handStack[from].indexOf(p);
                    if(index == -1){
                        console.log('副露牌错误',p);
                    }else{
                        this.handStack[from].splice(index,1);
                    }
                }
            }
            this.fuluStack[pid].push(e.tiles.join('|'));
        },
        playFuluEnded(e){
            let pid = e.seat;
            this.txtMsg[pid] = '';
            // 副露
            for(let ii in e.tiles){
                var p = e.tiles[ii];
                var from = e.from[ii];
                if(p.length == 2) {
                    if(from != this.seat){
                        // 其他人副露
                        this.handStack[from].splice(0,1);
                        continue;
                    }else{
                        let index = this.handStack[from].indexOf(p);
                        if(index == -1){
                            console.log('副露牌错误',p);
                        }else{
                            this.handStack[from].splice(index,1);
                        }
                    }
                }else{
                    // 河牌中取出
                    this.riverStack[from].pop();
                }
            }
            this.fuluStack[pid].push(e.tiles.join('|'));
        },
        playLizhiEnded(e){
            this.score[e.seat] -= 1000;
            this.txtMsg[e.seat] = '';
        },
        decode: function(e){
            console.log(e);
            if(e.type == 'GameInit'){
                // 链接初始化
                let gs = e.data;
                this.yama = gs.yama;
                this.handStack = gs.handStack;
                this.riverStack = gs.riverStack;
                this.fuluStack = gs.fuluStack;
                this.bao = gs.bao;
                this.libao = gs.libao;
                this.yamaPos = gs.yamaPos;
                this.yamaLast = gs.yamaLast;
                this.changfeng = gs.changfeng;
                this.playerWind = gs.playerWind;
                this.playerLizhi = gs.playerLizhi;
                this.changbang = gs.changbang;
                this.lizhibang = gs.lizhibang;
                this.score = gs.score;
                this.curWind = gs.curWind;
                this.sortPai(0);
                this.sortPai(1);
                this.sortPai(2);
                this.sortPai(3);
            }
            else if(e.type == "ActionHule"){
                var _self = this;
                // TODO: 多人胡牌的情况
                this.huList = e.data;
                this.huPos = 0;
                for(var submsg of e.data){
                    this.txtMsg[submsg.seat] = submsg.opt==9?'胡':'自摸';
                    var sound = new Howl({
                        src: '/audio/'+this.charaName[submsg.seat]+'/'+(submsg.opt==9?'act_ron.mp3':'act_tumo.mp3'),
                        autoplay: true
                    });
                    sound.once('end',function(){
                        _self.playHuEnded();
                    });
                }
            }
            else if(e.type == 'ActionNewRound'){
                // this.resetParam();
                // 初始起牌
                // this.seat = e.seat;
                this.qinjia = e.qinjia;
                this.changfeng = e.changfeng;
                this.zifeng = e.zifeng;
                this.changbang = e.changbang;
                this.lizhibang = e.lizhibang;
                this.score = e.score;
                this.bao = e.bao;
                this.handStack[e.seat] = e.handStack;
                this.fuluStack[e.seat] = [];
                this.riverStack[e.seat] = [];
                this.sortPai(e.seat);

                // for(var i in this.handStack){
                //     if(i == this.seat) this.handStack[i] = e.handStack;
                //     else {
                //         this.handStack[i] = new Array(13);
                //         this.handStack[i].fill('*');
                //     }
                // }
                
            }
            else if(e.type == 'ActionDealTile'){
                // 新摸牌
                this.restyama = e.restyama;
                this.curWind = e.seat;
                var handStack = this.handStack[e.seat];
                if(e.tile==''){
                    handStack.push('*');
                }else handStack.push(e.tile);
            }
            else if(e.type == 'ActionDiscardTile'){
                var _self = this;
                this.restyama = e.restyama;
                // if(this.seat != e.seat){
                    
                // }
                this.handStack[e.seat].splice(e.tilepos,1);
                this.sortPai(e.seat);
                var tile = e.tile;
                if(e.is_liqi || e.is_wliqi){
                    this.txtMsg[e.seat] = '立直';
                    this.playerLizhi[e.seat] = true;
                    tile += '*';
                    let sound = new Howl({
                        src: '/audio/'+this.charaName[e.seat]+'/'+(e.is_liqi?'act_rich.mp3':'act_drich.mp3'),
                        autoplay: true,
                        // onend: function() {
                        //     console.log('Finished!');
                        //     _self.playLizhiEnded(e);
                        // }
                    });
                }
                this.playLizhiEnded(e);
                this.riverStack[e.seat].push(tile);
            }
            else if(e.type == 'ActionChiPengGang'){
                var _self = this;
                // 将牌从手牌中剔除，加入副露中
                let pid = e.seat;
                this.txtMsg[pid] = ['吃','碰','杠'][e.opt-2];
                var sound = new Howl({
                    src: '/audio/'+this.charaName[pid]+'/'+['act_chi.mp3','act_pon.mp3','act_kan.mp3'][e.opt-2],
                    autoplay: true,
                    // onend: function() {
                    //     console.log('Finished!');
                    //     _self.txtMsg[pid] = ['吃','碰','杠'][e.opt-2];
                        
                    // }
                });
                this.playFuluEnded(e);
            }
            else if(e.type == 'ActionAnGangAddGang'){
                var _self = this;
                this.txtMsg[pid] = '杠';
                // 将牌从手牌中剔除，加入副露中
                let pid = e.seat;
                var sound = new Howl({
                    src: '/audio/'+this.charaName[pid]+'/act_kan.mp3',
                    autoplay: true,
                    // onend: function() {
                    //     //console.log('Finished!');
                    //     _self.playGangEnded(e);
                    // }
                });
                this.playGangEnded(e);
            }
            else if(e.type == 'ActionLiuJu'){
                // 流局
                this.liumsg = e;
                if(e.opt == 2){
                    for(let ii in e.tingPai){
                        // 听牌的人展示手牌
                        if(e.xiangting[ii] == 0){
                            this.handStack[ii] = e.hand[ii];
                            this.sortPai(ii);
                            this.tingPai[ii] = e.tingpai;
                            // this.fuluStack[ii] = e.fulu[ii];
                        }
                    }
                    // this.fenpei = e.fenpei;
                }else{
                    // this.fenpei = [0,0,0,0];
                }
                
                // 九种展示手牌
            }else if(e.type == 'ActionEndGame'){
                this.endGameOn = true;
            }

            if(e.hasOwnProperty('operation')){
                if(e.seat != this.seat) return;
                this.comb = e.operation;
                this.changeFlag(e.operation);
                this.lizhi_state = e.lizhi_state;
                this.lizhi_tile = e.tile;
                if(e.lizhi_state && !this.hasOption){
                    this.optFlag.qie = false;
                    setTimeout(() => {
                        this.ws.send(JSON.stringify({
                            type:'qiepai',
                            from: parseInt(this.seat),
                            tile: e.tile,
                            lizhi: false
                        }));
                        this.handStack[this.seat].pop();
                        this.sortPai(this.seat);
                    }, 500);
                }
            }
        },
        newGame: function(){
            // this.$refs.mainAudio.autoplay = true;
            this.resetParam();
            this.ws.send(JSON.stringify({type:'newgame'}));
        },
        changeFlag: function(gs){
            //1切 2吃 3碰 4暗杠 5明杠 6加杠 7立直 8自摸 9胡 10九种 11拔北
            this.optFlag = {};
            for(var opt of gs){
                let type = opt.type;
                if(type == 1){
                    this.optFlag.qie = true;
                    this.handStack[this.seat].forEach((element,i) => {
                        this.canDiscard[i] = true;
                    });
                }
                if(type == 2){
                    this.optFlag.chi = true;
                }
                if(type == 3){
                    this.optFlag.peng = true;
                }
                if(type == 4 || type == 5 || type == 6){
                    this.optFlag.gang = true;
                }
                if(type == 7){
                    this.optFlag.lizhi = true;
                }
                if(type == 8){
                    this.optFlag.zimo = true;
                }
                if(type == 9){
                    this.optFlag.hu = true;
                }
                if(type == 10){
                    this.optFlag.liuju = true;
                }
            }
        },
        handFlip: function(){
            var hand = [];
            var repeat = {};
            for(var p of this.handStack[this.seat]){
                if(repeat[p] == undefined){
                    repeat[p] = 0;
                }else{
                    repeat[p]++;
                }
                hand.push(p+repeat[p]);
            }
            return hand;
        },
        discardPai: function(index){
            if(!this.optFlag.qie) return;
            if(!this.canDiscard[index]) return;

            this.optFlag.qie = false;
            this.canDiscard = [];
            this.comb = {};
            this.optFlag = {};

            let dapai = this.handStack[this.seat][index];
            this.ws.send(JSON.stringify({
                type: 'qiepai',
                from: parseInt(this.seat),
                tile: dapai,
                lizhi: this.lizhiOn
            }));
            
            this.lizhiOn = false;
            this.handStack[this.seat].splice(index,1);
            this.sortPai(this.seat);
        },
        selectOpt: function(key){
            let tt = this.comb.filter((x)=>{
                if(key == 4){
                    if(x.type in [4,5,6]) return x.combination;
                }
                if(x.type == key) return x.combination;
            });
            console.log(key,tt);
            if(tt.length > 1){
                // 2种以上可能 显示sub
                this.combShow = tt;
                this.subOptOn = true;
            }else{
                if(key == 7){
                    // 立直显示选项
                    this.combShow = tt[0].combination;
                    this.selectLizhi(tt[0].combination);
                }else{
                    this.sendOpt(tt[0]);
                }
            }
        },
        sendOpt: function(obj){
            if(obj.type <= 4){
                this.ws.send(JSON.stringify({
                    type: 'chipenggang',
                    from: parseInt(this.seat),
                    combination: [obj.combination, obj.type]
                }));
            }else if(obj.type == 8){
                this.ws.send(JSON.stringify({
                    type: 'zimo',
                    from: parseInt(this.seat),
                    tile: obj.combination
                }));
            }else if(obj.type == 9){
                this.ws.send(JSON.stringify({
                    type: 'hu',
                    from: parseInt(this.seat),
                    tile: obj.combination
                }));
            }else if(obj.type == 10){
                this.ws.send(JSON.stringify({
                    type: 'liuju',
                    from: parseInt(this.seat)
                }));
            }
            this.subOptOn = false;
            this.comb = {};
            this.optFlag = {};
        },
        selectLizhi: function(tiles){
            // 显示可以打出的牌
            var ss = [];
            for(var pai of tiles){
                ss.push(pai.dapai);
            }
            console.log(ss);
            var handStack = this.handStack[this.seat];
            handStack.forEach((ele,i) => {
                this.canDiscard[i] = false;
                for(var p of ss){
                    if(ele == p) this.canDiscard[i] = true;
                }
            });
            this.lizhiOn = true;
        },
        lizhiMask: function(index){
            return this.lizhiOn && !this.canDiscard[index];
        },
        getTingPai: function(index){
            if(!this.lizhiOn) return[];
            let dapai = this.handStack[this.seat][index];
            for(var comb of this.combShow){
                // console.log('tingpai:',index,comb);
                if(comb.dapai == dapai){
                    this.hintOn = true;
                    return comb.ting;
                }
            }
            return [];
        },
        cancelOpt: function(){
            if(this.subOptOn){
                this.subOptOn = false;
                this.changeFlag(this.comb);
                return;
            }
            if(this.lizhiOn){
                this.lizhiOn = false;
                this.canDiscard = [];
                this.changeFlag(this.comb);
                return;
            }
            // 立直不杠（
            if(this.lizhi_state){
                this.ws.send(JSON.stringify({
                    type:'qiepai',
                    from: parseInt(this.seat),
                    tile: this.lizhi_tile,
                    lizhi: false
                }));
                this.handStack[this.seat].pop();
                this.sortPai(this.seat);
                return;
            }
            this.ws.send(JSON.stringify({
                type:'cancel',
                from: this.seat
            }));
            this.optFlag = {};
        },
        confirmOpt: function(fp){
            this.huPos++;
            if(this.huPos < this.huList.length){
                this.playHuEnded();
                return;
            }
            if(!this.scoreChangeOn){
                this.scoreChangeOn = true;
                this.tweenedScore = this.score;
                this.tweenedFenpei = fp;
                setTimeout(() => {
                    var fi = [0,0,0,0];
                    for(var msg of this.huList){
                        for(var i in msg.ptres.fenpei){
                            fi[i] = this.score[i] + fp[i];
                        }
                    }
                    this.score = fi;
                    this.fenpei = [0,0,0,0];
                }, 1000);
                return;
            }
            this.resetParam();
            this.ws.send(JSON.stringify({
                type:'confirm',
                from: this.seat
            }))
        },
        imgUrl: function(code){
            return '/img/'+code+'.png';
        },
        headUrl: function(i){
            return '/img/'+this.charaPic[i]+'.png';
        },
        checkLast: function(index,seat){
            let flag1 = (index==this.handStack[seat].length-1)&&(this.handStack[seat].length+this.fuluStack[seat].length*3==14);
            return flag1;
        },
        preloadVoiceList: function(){
            return FanTool.getPreloadVoice();
        },
        preloadImgList: function(){
            var imglist = [];
            for(var ch of ['m','p','s','z']){
                let maxn = ch=='z'?7:10;
                for(let n=1;n<=maxn;n++){
                    imglist.push('/img/'+(n==10?0:n)+ch+'.png');
                }
            }
            return imglist;
        },
        sortPai: function(seat){
            function cmp(a,b){
                var tv = {"m":0,"p":1,"s":2,"z":3};
                a = a.replace('0','5');
                b = b.replace('0','5');
                if(a.length != b.length){
                    return a.length-b.length;
                }
                if(a[1] == b[1]){
                    return a[0]-b[0];
                }
                return tv[a[1]]-tv[b[1]];
            }
            this.handStack[seat].sort(cmp);
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
        sortScore: function(){
            var plist = [];
            for(var ss in this.score){
                plist.push({
                    id: ss,
                    score: this.score[ss],
                    wind: ss
                });
            }
            plist.sort((a,b)=>{
                if(a.score == b.score){
                    return a.wind - b.wind;
                }
                return a.score - b.score;
            })
            return plist.map((x)=>{return x.id});
        }
    },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
