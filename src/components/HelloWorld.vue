<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
  </div>
</template>

<script>
export default {
  name: 'HelloWorld',
  data() {
    return {
      ws: Object,
      msg: ''
    }
  },
  created() {
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
      _self.msg = msg.data;
      //console.log(msg.data);
    }
  }
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
