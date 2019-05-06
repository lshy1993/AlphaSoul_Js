<template>
<div>
    <alpha-soul-live />
    <announce-news />
    <alpha-soul-status/>
</div>
</template>

<script>
import AlphaSoulLive from './AlphaSoulLive.vue';
import AnnounceNews from './AnnounceNews.vue';
import AlphaSoulStatus from './AlphaSoulStatus.vue';

export default {
    name: 'Index',
    data() {
        return {
        ws: Object,
        msg: ''
        }
    },
    methods: {

    },
    components:{
        AlphaSoulLive,
        AnnounceNews,
        AlphaSoulStatus
    }
}
</script>

<style>

</style>
