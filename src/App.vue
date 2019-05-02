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
  <router-view :class="['mainContent']"></router-view>
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
  },
  components: {

  }
}
</script>

<style lang="scss">
#app {
  width: 100%;
}
.naviSide {
  position: fixed;
  width: 50px;
  height: 100%;
  padding: 10px;
  background: gray;
  text-align: left;
  transition: all 0.3s;
  z-index: 1020;

  &.wide {
    width: 150px;
  }

  .naviLogo {
    width: 50px;
    height: 50px;
    overflow: hidden;
    transition: all 0.3s;

    &.wide{
      width: 150px;
      height: 150px;
    }
  }

  .naviLine {
    height: 2px;
    margin: 10px 0 10px 0;
    background: white;
  }

  .naviLink {
    height: auto;
    margin-bottom: 5px;
  }
}

.mainContent {
  position: relative;
  margin-left: 70px;
  transition: all .3s;
  z-index: 1000;
  height: 100%;
}
h1 {
  margin: 20px 0;
}
h2 {
  margin: 10px 0;
}
h3 {
  margin: 40px 5px;
}
h4 {
  margin: 10px 0;
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
  display: block;
  color: #42b983;
}
</style>
