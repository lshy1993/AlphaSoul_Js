<template>
<div id="animated-number-demo">
    <input v-model.number="number" type="number" step="20">
    <p>{{ animatedNumber }}</p>
</div>
</template>

<script>
/* eslint-disable */
var TWEEN = require('@tweenjs/tween.js');
export default {
    name: 'majtest',
    data(){
        return {
            number: 0,
            tweenedNumber: 0
        }
    },
    methods: {
        foo: function(){
            console.log('foo');
        }
    },
    computed: {
        animatedNumber: function() {
            return this.tweenedNumber.toFixed(0);
        }
    },
    watch: {
        number: function(newValue) {
            function animate() {
                requestAnimationFrame(animate);
                TWEEN.update();
            }
            var vm = this;
            new TWEEN.Tween({x:0})
            .to({x:200}, 1000)
            .onUpdate(function(object) {
                console.log(object.x);
                vm.tweenedNumber = object.x;
            })
            .start();

            animate();

        }
    }
}
</script>

<style>

</style>
