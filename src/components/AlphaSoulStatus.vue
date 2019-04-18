<template>
    <div>
        <h1>AlphaSoul 运行状态</h1>
        <button @click="reLink">ReLink</button>
        <div>直播画面</div>
        <h1>AlphaSoul 历史战绩</h1>
        <h1>AlphaSoul 学习状态</h1>
    </div>
</template>

<script>
import NetWatcher from './NetWatcher.vue';
export default {
  name: 'AlphaSoulStatus',
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

  },
  components:{
      
  }
}
</script>

<style>

</style>
