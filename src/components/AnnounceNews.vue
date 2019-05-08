<template>
<div id="News" class="BorderDiv">
    <div style="font-weight:bold;">最近公告</div>
    <div class="message">
        <span class="tag new">新增</span>
        <span class="content">AI自我对战的观战</span>
    </div>
    <div class="message">
        <span class="tag new">新增</span>
        <span class="content">AI历史战绩</span>
    </div>
    <div class="message">
        <span class="tag new">新增</span>
        <span class="content">在线对战AI辅助</span>
    </div>
    <div class="message">
        <span class="tag fixed">修复</span>
        <span class="content">修复了4面1雀头的立直问题</span>
    </div>
    <div class="message">
        <span class="tag fixed">修复</span>
        <span class="content">修复了暗杠的服务器崩溃问题</span>
    </div>
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
#News {
    display: inline-block;
    vertical-align: top;
    box-sizing: border-box;
    height: 100%;
    text-align: left;
    background: wheat;
    z-index: 1010;

    .message {
        margin-top: 10px;
    }

    .tag {
        vertical-align: top;
        color: white;
        display: inline-block;
        border-radius: 5px;
        padding: 5px;
        font-size: 12px;
        &.fixed{
            background: green;
        }
        &.new{
            background: orange;
        }
        
    }
    .content {
        position: relative;
        display: inline-block;
        margin-left: 10px;
        width: 80%;
    }

}
</style>