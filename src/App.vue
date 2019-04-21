<template>
  <div id="app">
    <div style="height:40px;position:absolute;">
      <img alt="Vue logo" src="./assets/logo.png" style="width:20px;">
      <router-link to="/">Home</router-link>
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
