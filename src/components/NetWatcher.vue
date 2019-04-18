<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
  </div>
</template>

<script>
export default {
  name: 'NetWatcher',
  data() {
    return {
      ws: Object,
      msg: ''
    }
  },
  created() {
    this.reLink();
  },
  methods: {
    reLink: function(){
      var _self = this;
      this.ws = new WebSocket('ws://localhost:8182');
      this.ws.onopen = function(e){
          console.log("连接服务器成功");
      }
      this.ws.onclose = function(e){
          console.log("服务器关闭");
      }
      this.ws.onerror = function(){
          console.log("连接出错");
      }
      this.ws.onmessage = function(msg){
          // _self.msg = msg.data;
          var e = JSON.parse(msg.data);
          console.log(e);
          if(e.type == 'ActionNewRound'){
              // 初始起牌
              var gs = e;
              _self.qinjia = gs.qinjia;
              _self.changfeng = gs.changfeng;
              _self.zifeng = gs.zifeng;
              _self.changbang = gs.changbang;
              _self.lizhibang = gs.lizhibang;
              _self.score = gs.score;
              _self.bao = gs.bao;
              _self.handStack = gs.handStack;
              _self.sortPai();
          }
          if(e.type == 'ActionDealTile'){
              // 新摸牌
              //var gs = e.data;
              _self.handStack.push(e.tile);
              _self.handStack.forEach((element,i) => {
                  _self.canDiscard[i] = true;
              });
              _self.restyama = e.restyama;

          }
          if(e.type == 'ActionDiscardTile'){
              _self.restyama = e.restyama;
              _self.riverStack[e.seat].push(e.tile);
          }
          if(e.hasOwnProperty('operation')){
              _self.changeFlag(e.operation);
              if(e.lizhi_state && !_self.hasOption){
                  setTimeout(() => {
                      _self.discardPai(gs.tile);
                  }, 500);
              }
          }
      }
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
