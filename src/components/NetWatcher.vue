<template>
<div>
  <span>AlphaSoul自我对战观战系统</span>
  <button @click="reLink">ReLink</button>
  <div>
    <canvas ref="canvas" width="800" height="800"></canvas>
  </div>
  <h1>{{ msg }}</h1>
</div>
</template>

<script>
import MajClient from '../js/client.js';

export default {
  name: 'NetWatcher',
  data() {
    return {
      client: Object,
      msg: '',
    }
  },
  mounted() {
    this.client = new MajClient(this.$refs.canvas);
  },
  methods: {
    reLink: function(){
      this.client.InitWebsocket();
    }
  },
  watch: {
    
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
