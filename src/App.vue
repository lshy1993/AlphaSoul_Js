<template>
<div id="app">
  <aside class="naviSide">
    <img alt="Vue logo" src="./assets/logo.png" style="width:20px;">
    <router-link to="/">Home</router-link>
    <router-link to="/game">Game</router-link>
    <router-link to="/tool">Tool</router-link>
    <router-link to="/test">Test</router-link>
  </aside>
  <router-view class="mainContent"></router-view>
</div>
</template>

<script>
export default {
  name: 'app',
  components: {

  }
}
</script>

<style>
#app {
  width: 100%;
}
.naviSide{
  position: fixed;
  width: 50px;
  height: 100%;
  background: gray;
}
.mainContent{
  position: relative;
  margin-left: 50px;
  transition: all .3s;
  z-index: 1000;
  height: 100%;
}
h2 {
  margin: 20px 0;
}
h3 {
  margin: 40px 0 0;
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
