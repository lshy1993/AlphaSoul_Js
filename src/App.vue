<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <div>
      <router-link to="/status">Status</router-link>
      <router-link to="/game">Game</router-link>
      <router-link to="/tool">Tool</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
//import HelloWorld from './components/HelloWorld.vue';
//import MajMain from './components/MajMain.vue';

export default {
  name: 'app',
  components: {
    //HelloWorld,
    //MajMain
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
