<template>
  <view class="page" :class="appShellClass" :style="appShellStyle">
    <nav-bar :title="$t('settings.dataClearPageTitle')" />
    <view class="page__scroll-wrap">
      <scroll-view class="page__scroll" scroll-y :show-scrollbar="false">
        <view class="page__content">
          <view class="data-clear-note">
            <text class="data-clear-note__text">{{ $t('settings.dataClearPageNote') }}</text>
          </view>

          <settings-group :title="$t('settings.dataClearLocalSection')">
            <settings-cell
              :title="$t('settings.dataClearSelectAll')"
              :subtitle="$t('settings.dataClearSelectAllDesc')"
              icon="checkmark-circle-fill"
              icon-color="#6C5CE7"
              icon-bg="rgba(108, 92, 231, 0.12)"
              switchable
              :switch-value="localAllSelected"
              @switch-change="onLocalSelectAll"
            />
            <view
              v-for="(item, index) in localOptions"
              :key="item.value"
              class="data-clear-option"
              :class="{ 'data-clear-option--last': index === localOptions.length - 1 }"
              hover-class="data-clear-option--hover"
              @click="toggleLocal(item.value)"
            >
              <view
                class="data-clear-option__check"
                :class="{ 'data-clear-option__check--on': item.checked }"
              >
                <u-icon v-if="item.checked" name="checkmark" color="#FFFFFF" size="12" />
              </view>
              <view class="data-clear-option__body">
                <text class="data-clear-option__title">{{ item.label }}</text>
                <text class="data-clear-option__desc">{{ item.desc }}</text>
                <text class="data-clear-option__meta">{{ item.meta }}</text>
              </view>
            </view>
            <view class="data-clear-actions">
              <view
                class="data-clear-actions__btn data-clear-actions__btn--danger"
                hover-class="data-clear-actions__btn--hover"
                @click="onClearLocal"
              >
                <text class="data-clear-actions__btn-text">{{
                  clearingLocal ? $t('common.loading') : $t('settings.dataClearLocalAction')
                }}</text>
              </view>
            </view>
          </settings-group>

          <settings-group :title="$t('settings.dataClearCloudSection')">
            <view class="data-clear-cloud-hint">
              <text class="data-clear-cloud-hint__text">{{ cloudHint }}</text>
            </view>
            <settings-cell
              :title="$t('settings.dataClearSelectAll')"
              :subtitle="$t('settings.dataClearCloudSelectAllDesc')"
              icon="server-fill"
              icon-color="#0984E3"
              icon-bg="rgba(9, 132, 227, 0.1)"
              switchable
              :switch-value="cloudAllSelected"
              @switch-change="onCloudSelectAll"
            />
            <view
              v-for="(item, index) in cloudOptions"
              :key="item.value"
              class="data-clear-option"
              :class="{ 'data-clear-option--last': index === cloudOptions.length - 1 }"
              hover-class="data-clear-option--hover"
              @click="toggleCloud(item.value)"
            >
              <view
                class="data-clear-option__check"
                :class="{ 'data-clear-option__check--on': item.checked }"
              >
                <u-icon v-if="item.checked" name="checkmark" color="#FFFFFF" size="12" />
              </view>
              <view class="data-clear-option__body">
                <text class="data-clear-option__title">{{ item.label }}</text>
                <text class="data-clear-option__desc">{{ item.desc }}</text>
              </view>
            </view>
            <view class="data-clear-actions">
              <view
                class="data-clear-actions__btn data-clear-actions__btn--danger"
                hover-class="data-clear-actions__btn--hover"
                @click="onClearCloud"
              >
                <text class="data-clear-actions__btn-text">{{
                  clearingCloud ? $t('common.loading') : $t('settings.dataClearCloudAction')
                }}</text>
              </view>
            </view>
          </settings-group>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
  import { mapState } from 'vuex';
  import NavBar from '@/components/base/NavBar/NavBar.vue';
  import SettingsCell from '@/components/settings/SettingsCell/SettingsCell.vue';
  import SettingsGroup from '@/components/settings/SettingsGroup/SettingsGroup.vue';
  import { clearCloudUserData } from '@/api/dataClear.js';
  import config from '@/config/index.js';
  import { DATA_CLEAR_CATEGORIES, DATA_CLEAR_CATEGORY_LIST } from '@/constants/dataClear.js';
  import { DATA_MODES } from '@/constants/appMode.js';
  import {
    clearLocalUserData,
    DATA_CLEARED_EVENT,
    getAllLocalDataStats,
  } from '@/utils/dataClear.js';

  function createSelectionMap(categories = []) {
    return DATA_CLEAR_CATEGORY_LIST.reduce((map, item) => {
      map[item] = categories.includes(item);
      return map;
    }, {});
  }

  export default {
    name: 'SettingsDataClearPage',
    components: {
      NavBar,
      SettingsGroup,
      SettingsCell,
    },
    data() {
      return {
        localStats: [],
        localSelected: createSelectionMap([
          DATA_CLEAR_CATEGORIES.RECORDS,
          DATA_CLEAR_CATEGORIES.CHAT,
          DATA_CLEAR_CATEGORIES.VECTOR,
        ]),
        cloudSelected: createSelectionMap([
          DATA_CLEAR_CATEGORIES.RECORDS,
          DATA_CLEAR_CATEGORIES.CHAT,
          DATA_CLEAR_CATEGORIES.VECTOR,
        ]),
        clearingLocal: false,
        clearingCloud: false,
      };
    },
    computed: {
      ...mapState(['dataMode']),
      cloudHint() {
        if (config.useMock) {
          return this.$t('settings.dataClearCloudMockHint');
        }
        if (this.dataMode === DATA_MODES.LOCAL) {
          return this.$t('settings.dataClearCloudLocalModeHint');
        }
        return this.$t('settings.dataClearCloudHint');
      },
      localAllSelected() {
        return DATA_CLEAR_CATEGORY_LIST.every((item) => this.localSelected[item]);
      },
      cloudAllSelected() {
        return DATA_CLEAR_CATEGORY_LIST.every((item) => this.cloudSelected[item]);
      },
      localOptions() {
        void this.$store.state.preferenceRevision;
        const statsMap = this.localStats.reduce((map, item) => {
          map[item.category] = item;
          return map;
        }, {});
        return DATA_CLEAR_CATEGORY_LIST.map((value) => {
          const stats = statsMap[value] || {};
          return {
            value,
            checked: !!this.localSelected[value],
            label: this.$t(`settings.dataClearCategory.${value}.title`),
            desc: this.$t(`settings.dataClearCategory.${value}.desc`),
            meta: this.formatLocalMeta(value, stats),
          };
        });
      },
      cloudOptions() {
        void this.$store.state.preferenceRevision;
        return DATA_CLEAR_CATEGORY_LIST.map((value) => ({
          value,
          checked: !!this.cloudSelected[value],
          label: this.$t(`settings.dataClearCategory.${value}.title`),
          desc: this.$t(`settings.dataClearCategory.${value}.desc`),
        }));
      },
      selectedLocalCategories() {
        return DATA_CLEAR_CATEGORY_LIST.filter((item) => this.localSelected[item]);
      },
      selectedCloudCategories() {
        return DATA_CLEAR_CATEGORY_LIST.filter((item) => this.cloudSelected[item]);
      },
    },
    onShow() {
      this.refreshLocalStats();
    },
    onUnload() {
      uni.$off(DATA_CLEARED_EVENT, this.refreshLocalStats);
    },
    created() {
      uni.$on(DATA_CLEARED_EVENT, this.refreshLocalStats);
    },
    methods: {
      refreshLocalStats() {
        this.localStats = getAllLocalDataStats();
      },
      formatLocalMeta(category, stats = {}) {
        const count = Number(stats.count) || 0;
        const sizeLabel = stats.sizeLabel || '0 B';
        if (category === DATA_CLEAR_CATEGORIES.RECORDS) {
          return this.$t('settings.dataClearMetaRecords', { count, size: sizeLabel });
        }
        if (category === DATA_CLEAR_CATEGORIES.CHAT) {
          return this.$t('settings.dataClearMetaChat', { count, size: sizeLabel });
        }
        if (category === DATA_CLEAR_CATEGORIES.VECTOR) {
          return this.$t('settings.dataClearMetaVector', { count, size: sizeLabel });
        }
        if (category === DATA_CLEAR_CATEGORIES.PENDING) {
          return this.$t('settings.dataClearMetaPending', { count, size: sizeLabel });
        }
        if (category === DATA_CLEAR_CATEGORIES.MONTHLY_PLAN) {
          return this.$t('settings.dataClearMetaMonthlyPlan', { count, size: sizeLabel });
        }
        return this.$t('settings.dataClearMetaGeneric', { count, size: sizeLabel });
      },
      onLocalSelectAll(enabled) {
        const next = createSelectionMap(enabled ? DATA_CLEAR_CATEGORY_LIST : []);
        this.localSelected = next;
      },
      onCloudSelectAll(enabled) {
        const next = createSelectionMap(enabled ? DATA_CLEAR_CATEGORY_LIST : []);
        this.cloudSelected = next;
      },
      toggleLocal(value) {
        this.localSelected = {
          ...this.localSelected,
          [value]: !this.localSelected[value],
        };
      },
      toggleCloud(value) {
        this.cloudSelected = {
          ...this.cloudSelected,
          [value]: !this.cloudSelected[value],
        };
      },
      onClearLocal() {
        if (!this.selectedLocalCategories.length) {
          uni.showToast({
            title: this.$t('settings.dataClearNeedSelection'),
            icon: 'none',
          });
          return;
        }
        uni.showModal({
          title: this.$t('settings.dataClearLocalConfirmTitle'),
          content: this.$t('settings.dataClearLocalConfirmContent'),
          confirmText: this.$t('common.confirm'),
          cancelText: this.$t('common.cancel'),
          success: (res) => {
            if (!res.confirm) {
              return;
            }
            this.runClearLocal();
          },
        });
      },
      async runClearLocal() {
        if (this.clearingLocal) {
          return;
        }
        this.clearingLocal = true;
        try {
          const result = clearLocalUserData(this.selectedLocalCategories);
          this.refreshLocalStats();
          if (result.failed.length && !result.cleared.length) {
            uni.showToast({
              title: this.$t('settings.dataClearPartialFail'),
              icon: 'none',
            });
            return;
          }
          if (result.failed.length) {
            uni.showToast({
              title: this.$t('settings.dataClearLocalDonePartial', {
                cleared: result.cleared.length,
                total: this.selectedLocalCategories.length,
              }),
              icon: 'none',
            });
            return;
          }
          uni.showToast({
            title: this.$t('settings.dataClearLocalDone'),
            icon: 'none',
          });
        } finally {
          this.clearingLocal = false;
        }
      },
      onClearCloud() {
        if (!this.selectedCloudCategories.length) {
          uni.showToast({
            title: this.$t('settings.dataClearNeedSelection'),
            icon: 'none',
          });
          return;
        }
        uni.showModal({
          title: this.$t('settings.dataClearCloudConfirmTitle'),
          content: this.$t('settings.dataClearCloudConfirmContent'),
          confirmText: this.$t('common.confirm'),
          cancelText: this.$t('common.cancel'),
          success: (res) => {
            if (!res.confirm) {
              return;
            }
            this.runClearCloud();
          },
        });
      },
      async runClearCloud() {
        if (this.clearingCloud) {
          return;
        }
        this.clearingCloud = true;
        try {
          const result = await clearCloudUserData(this.selectedCloudCategories);
          if (result.failed.length && !result.cleared.length) {
            uni.showToast({
              title: this.$t('settings.dataClearPartialFail'),
              icon: 'none',
            });
            return;
          }
          if (result.failed.length) {
            uni.showToast({
              title: this.$t('settings.dataClearCloudDonePartial', {
                cleared: result.cleared.length,
                total: this.selectedCloudCategories.length,
              }),
              icon: 'none',
            });
            return;
          }
          uni.$emit(DATA_CLEARED_EVENT, {
            scope: 'cloud',
            categories: result.cleared,
          });
          uni.showToast({
            title: this.$t('settings.dataClearCloudDone'),
            icon: 'none',
          });
        } catch (error) {
          uni.showToast({
            title: this.$t('settings.dataClearCloudFail'),
            icon: 'none',
          });
        } finally {
          this.clearingCloud = false;
        }
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

  .data-clear-note {
    margin-bottom: $spacing-md;
    padding: $spacing-md $spacing-lg;
    border-radius: $radius-card;
    background-color: rgba(214, 48, 49, 0.08);
  }

  .data-clear-note__text {
    color: $color-text-secondary;
    font-size: $font-size-sm;
    line-height: 1.7;
  }

  .data-clear-cloud-hint {
    padding: $spacing-md $spacing-lg 0;
  }

  .data-clear-cloud-hint__text {
    color: $color-text-placeholder;
    font-size: $font-size-xs;
    line-height: 1.6;
  }

  .data-clear-option {
    display: flex;
    align-items: flex-start;
    padding: $spacing-md $spacing-lg;
    border-bottom: 1rpx solid $color-bg-muted;
  }

  .data-clear-option--last {
    border-bottom: none;
  }

  .data-clear-option__check {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 36rpx;
    height: 36rpx;
    margin-top: 4rpx;
    border: 2rpx solid $color-text-placeholder;
    border-radius: 8rpx;
    background-color: transparent;
  }

  .data-clear-option__check--on {
    border-color: $color-primary;
    background-color: $color-primary;
  }

  .data-clear-option__body {
    flex: 1;
    min-width: 0;
    margin-left: $spacing-md;
  }

  .data-clear-option__title {
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
  }

  .data-clear-option__desc {
    display: block;
    margin-top: 6rpx;
    color: $color-text-secondary;
    font-size: $font-size-sm;
    line-height: 1.5;
  }

  .data-clear-option__meta {
    display: block;
    margin-top: 6rpx;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
  }

  .data-clear-actions {
    padding: $spacing-md $spacing-lg $spacing-lg;
  }

  .data-clear-actions__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-md $spacing-lg;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }

  .data-clear-actions__btn--danger {
    background-color: rgba(214, 48, 49, 0.1);
  }

  .data-clear-actions__btn-text {
    color: $color-danger;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
  }
</style>
