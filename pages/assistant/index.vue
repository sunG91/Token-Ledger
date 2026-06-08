<template>
  <view class="page" :class="appShellClass" :style="appShellStyle">
    <view class="page__chat">
      <assistant-chat ref="assistantChat" show-back />
    </view>
  </view>
</template>

<script>
  import AssistantChat from '@/components/assistant/AssistantChat/AssistantChat.vue';

  export default {
    name: 'AssistantPage',
    components: {
      AssistantChat,
    },
    onShow() {
      this.$refs.assistantChat?.refreshBoundModels?.();
      this.$refs.assistantChat?.refreshChips();
      this.$refs.assistantChat?.scheduleLayout?.();
    },
  };
</script>

<style lang="scss" scoped>
  .page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    background-color: $color-bg-page;
  }

  .page__chat {
    display: flex;
    flex: 1;
    flex-direction: column;
    width: 100%;
    min-height: 0;
    height: 0;
    overflow: hidden;
  }
</style>
