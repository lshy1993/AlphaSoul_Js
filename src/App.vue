<template>
<div id="app">
  <aside :class="['naviSide', sideOn?'wide':'']">
    <div :class="['naviLogo', sideOn?'wide':'']" @click="sideOn = !sideOn">
      <img alt="Vue logo" src="/img/xiangyuan_e.png" width="100%">
    </div>
    <div class="naviLine"></div>
    <router-link class="naviLink" to="/">
      <div v-if="!sideOn">Home</div>
      <div v-if="sideOn" style="font-size: 24px;">主页</div>
    </router-link>
    <router-link class="naviLink" to="/game">
      <div v-if="!sideOn">Game</div>
      <div v-if="sideOn" style="font-size: 24px;">电脑对战</div>
    </router-link>
    <router-link class="naviLink" to="/auto">
      <div v-if="!sideOn">Auto</div>
      <div v-if="sideOn" style="font-size: 24px;">自动观战</div>
    </router-link>
    <router-link class="naviLink" to="/tool">
    <div v-if="!sideOn">Tool</div>
    <div v-if="sideOn" style="font-size: 24px;">牌效工具</div>
    </router-link>
    <router-link v-if="debug" class="naviLink" to="/test">Test</router-link>
  </aside>
  <router-view :class="['mainContent', sideOn?'wide':'']" ></router-view>
</div>
</template>

<script>
export default {
  name: 'app',
  data(){
    return{
      sideOn: false,
      debug: true
    }
  },
  created() {
    this.debug = process.env.NODE_ENV == 'development';
    console.log(1);
  },
  components: {

  }
}
</script>

<style lang="scss">

</style>
