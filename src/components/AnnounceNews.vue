<template>
<div :class="['BoardDiv','News']">
    <div style="font-weight:bold;">最近公告</div>
    <div class="message">
        <span class="tag fixed">修复</span>
        <span class="content">修复了荒牌流局的得分为0的错误</span>
    </div>
    <div class="message">
        <span class="tag fixed">修复</span>
        <span class="content">修复了海底捞月和河底摸鱼的判定错误</span>
    </div>
    <div class="message">
        <span class="tag new">新增</span>
        <span class="content">多人胡牌</span>
    </div>
    <div class="message">
        <span class="tag new">新增</span>
        <span class="content">报菜名语音系统</span>
    </div>
    <div class="message">
        <span class="tag new">新增</span>
        <span class="content">AI更不容易副露</span>
    </div>
</div>
</template>

<script>
export default {
    name: 'AnnounceNews',
    data(){
        return {

        }
    }
}
</script>

<style lang="scss">

</style>