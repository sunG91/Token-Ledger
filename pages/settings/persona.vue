<template>
  <view class="page" :class="appShellClass" :style="appShellStyle">
    <nav-bar :title="$t('settings.personaPageTitle')" />
    <view class="page__scroll-wrap">
      <scroll-view class="page__scroll" scroll-y :show-scrollbar="false">
        <view class="page__content">
          <view class="persona-note">
            <text class="persona-note__text">{{ $t('settings.personaPageNote') }}</text>
          </view>

          <settings-group :title="$t('settings.personaSectionMain')">
            <settings-cell
              :title="$t('settings.personaEnabled')"
              :subtitle="$t('settings.personaEnabledDesc')"
              icon="chat-fill"
              icon-color="#FD79A8"
              icon-bg="rgba(253, 121, 168, 0.12)"
              switchable
              :switch-value="personaConfig.enabled"
              @switch-change="onPersonaToggle"
            />
            <settings-cell
              :title="$t('settings.personaMemoryEnabled')"
              :subtitle="$t('settings.personaMemoryEnabledDesc')"
              icon="bookmark-fill"
              icon-color="#6C5CE7"
              icon-bg="rgba(108, 92, 231, 0.12)"
              switchable
              :switch-value="personaConfig.memoryEnabled"
              is-last
              @switch-change="onMemoryToggle"
            />
          </settings-group>

          <settings-group :title="$t('settings.personaSectionPick')">
            <settings-option-list
              :options="personaOptions"
              :value="personaConfig.personaId"
              @change="onPersonaPick"
            />
            <text class="persona-hint">{{ $t('settings.personaPickNote') }}</text>
          </settings-group>

          <settings-group :title="$t('settings.personaSectionMemory')">
            <view class="persona-memory-card">
              <view class="persona-memory-card__row">
                <text class="persona-memory-card__label">{{
                  $t('settings.personaMemoryCount')
                }}</text>
                <text class="persona-memory-card__value">{{ memoryStats.entryCount }}</text>
              </view>
              <view class="persona-memory-card__row">
                <text class="persona-memory-card__label">{{
                  $t('settings.personaMemorySize')
                }}</text>
                <text class="persona-memory-card__value">{{ memorySizeLabel }}</text>
              </view>
              <text class="persona-memory-card__note">{{
                $t('settings.personaMemoryStorageNote')
              }}</text>
            </view>

            <view class="persona-actions">
              <view
                class="persona-actions__btn"
                hover-class="persona-actions__btn--hover"
                @click="onRebuildHistory"
              >
                <text class="persona-actions__btn-text">{{
                  $t('settings.personaRebuildHistory')
                }}</text>
              </view>
              <view
                class="persona-actions__btn persona-actions__btn--danger"
                hover-class="persona-actions__btn--hover"
                @click="onClearMemory"
              >
                <text class="persona-actions__btn-text">{{
                  $t('settings.personaClearMemory')
                }}</text>
              </view>
            </view>
            <text class="persona-hint persona-hint--last">{{
              $t('settings.personaMemoryManageNote')
            }}</text>
          </settings-group>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
  import { mapGetters } from 'vuex';
  import NavBar from '@/components/base/NavBar/NavBar.vue';
  import SettingsCell from '@/components/settings/SettingsCell/SettingsCell.vue';
  import SettingsGroup from '@/components/settings/SettingsGroup/SettingsGroup.vue';
  import SettingsOptionList from '@/components/settings/SettingsOptionList/SettingsOptionList.vue';
  import { PERSONA_SKILL_META } from '@/constants/persona.js';
  import { rebuildVectorMemoryFromChatHistory } from '@/utils/personaMemory.js';
  import {
    clearVectorMemoryStore,
    formatVectorMemorySize,
    getVectorMemoryStats,
  } from '@/utils/vectorMemory.js';

  export default {
    name: 'SettingsPersonaPage',
    components: {
      NavBar,
      SettingsGroup,
      SettingsCell,
      SettingsOptionList,
    },
    data() {
      return {
        memoryStats: {
          entryCount: 0,
          bytes: 0,
        },
      };
    },
    computed: {
      ...mapGetters(['resolvedPersonaConfig']),
      personaConfig() {
        return this.resolvedPersonaConfig;
      },
      personaOptions() {
        void this.$store.state.preferenceRevision;
        return PERSONA_SKILL_META.map((item) => ({
          value: item.id,
          label: this.$t(`settings.personaSkill.${item.id}.name`),
          desc: this.$t(`settings.personaSkill.${item.id}.desc`),
          icon: item.icon,
          iconColor: item.iconColor,
          bgColor: item.bgColor,
        }));
      },
      memorySizeLabel() {
        return formatVectorMemorySize(this.memoryStats.bytes);
      },
    },
    onShow() {
      this.$store.commit('ENSURE_PERSONA_CONFIG');
      this.refreshMemoryStats();
    },
    methods: {
      refreshMemoryStats() {
        this.memoryStats = getVectorMemoryStats();
      },
      onPersonaToggle(enabled) {
        this.$store.commit('SET_PERSONA_CONFIG', { enabled: !!enabled });
        uni.showToast({
          title: enabled
            ? this.$t('settings.personaEnabledOn')
            : this.$t('settings.personaEnabledOff'),
          icon: 'none',
        });
      },
      onMemoryToggle(enabled) {
        if (!this.personaConfig.enabled) {
          uni.showToast({
            title: this.$t('settings.personaEnableFirst'),
            icon: 'none',
          });
          return;
        }
        this.$store.commit('SET_PERSONA_CONFIG', { memoryEnabled: !!enabled });
        uni.showToast({
          title: enabled
            ? this.$t('settings.personaMemoryOn')
            : this.$t('settings.personaMemoryOff'),
          icon: 'none',
        });
      },
      onPersonaPick(personaId) {
        this.$store.commit('SET_PERSONA_CONFIG', { personaId });
        uni.showToast({
          title: this.$t('settings.personaSwitched'),
          icon: 'none',
        });
      },
      onRebuildHistory() {
        uni.showModal({
          title: this.$t('settings.personaRebuildTitle'),
          content: this.$t('settings.personaRebuildContent'),
          confirmText: this.$t('common.confirm'),
          cancelText: this.$t('common.cancel'),
          success: (res) => {
            if (!res.confirm) {
              return;
            }
            const count = rebuildVectorMemoryFromChatHistory({ replaceHistory: true });
            this.refreshMemoryStats();
            uni.showToast({
              title: this.$t('settings.personaRebuildDone', { count }),
              icon: 'none',
            });
          },
        });
      },
      onClearMemory() {
        uni.showModal({
          title: this.$t('settings.personaClearTitle'),
          content: this.$t('settings.personaClearContent'),
          confirmText: this.$t('common.confirm'),
          cancelText: this.$t('common.cancel'),
          success: (res) => {
            if (!res.confirm) {
              return;
            }
            clearVectorMemoryStore();
            this.refreshMemoryStats();
            uni.showToast({
              title: this.$t('settings.personaClearDone'),
              icon: 'none',
            });
          },
        });
      },
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

  .page__scroll-wrap {
    flex: 1;
    min-height: 0;
    width: 100%;
  }

  .page__scroll {
    width: 100%;
    height: 100%;
  }

  .page__content {
    box-sizing: border-box;
    width: 100%;
    max-width: 750rpx;
    margin: 0 auto;
    padding: $spacing-md $spacing-lg calc(#{$spacing-xl} + #{$spacing-lg});
  }

  .persona-note {
    margin-bottom: $spacing-md;
    padding: $spacing-md $spacing-lg;
    border-radius: $radius-card;
    background-color: rgba(108, 92, 231, 0.08);
  }

  .persona-note__text {
    color: $color-text-secondary;
    font-size: $font-size-sm;
    line-height: 1.7;
  }

  .persona-hint {
    display: block;
    margin-top: $spacing-sm;
    padding: 0 $spacing-xs;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
    line-height: 1.6;
  }

  .persona-hint--last {
    margin-top: $spacing-md;
  }

  .persona-memory-card {
    padding: $spacing-lg;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }

  .persona-memory-card__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: $spacing-sm;
  }

  .persona-memory-card__label {
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }

  .persona-memory-card__value {
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
  }

  .persona-memory-card__note {
    display: block;
    margin-top: $spacing-sm;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
    line-height: 1.6;
  }

  .persona-actions {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    margin-top: $spacing-md;
  }

  .persona-actions__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-md;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }

  .persona-actions__btn--danger {
    background-color: rgba(214, 48, 49, 0.06);
  }

  .persona-actions__btn--hover {
    opacity: 0.72;
  }

  .persona-actions__btn-text {
    color: $color-text-primary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }

  .persona-actions__btn--danger .persona-actions__btn-text {
    color: #d63031;
  }
</style>
