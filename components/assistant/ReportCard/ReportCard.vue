<template>
  <view class="report-card">
    <view class="report-card__header">
      <view class="report-card__icon-wrap">
        <u-icon :name="headerIcon.icon" :color="headerIcon.iconColor" size="16" />
      </view>
      <text class="report-card__title">{{ card.title }}</text>
    </view>

    <view class="report-card__summary">
      <view class="report-card__metric report-card__metric--solo">
        <text class="report-card__metric-value">{{ formatToken(card.totalTokens) }}</text>
        <text class="report-card__metric-label">{{ $t('stats.totalTokens') }}</text>
      </view>
      <text v-if="card.recordCount" class="report-card__record-count">{{
        $t('assistant.report.recordCount', { count: card.recordCount })
      }}</text>
    </view>

    <view v-if="hasInternal" class="report-card__section">
      <text class="report-card__section-title">{{ $t('assistant.report.internalTitle') }}</text>
      <text class="report-card__section-meta">{{
        $t('assistant.report.scopeTokens', { count: formatToken(card.internal.totalTokens) })
      }}</text>
      <view
        v-for="(item, index) in card.internal.platforms"
        :key="'in-' + item.platformId + '-' + index"
        class="report-card__platform-row"
      >
        <text class="report-card__platform-name">{{ item.name }}</text>
        <text class="report-card__platform-value">{{ formatToken(item.tokenCount) }} token</text>
      </view>
    </view>

    <view v-if="hasExternal" class="report-card__section">
      <text class="report-card__section-title">{{ $t('assistant.report.externalTitle') }}</text>
      <text class="report-card__section-meta">{{
        $t('assistant.report.scopeTokens', { count: formatToken(card.external.totalTokens) })
      }}</text>
      <view
        v-for="(item, index) in card.external.platforms"
        :key="'ex-' + item.platformId + '-' + index"
        class="report-card__platform-row"
      >
        <text class="report-card__platform-name">{{ item.name }}</text>
        <text class="report-card__platform-value">{{ formatToken(item.tokenCount) }} token</text>
      </view>
    </view>

    <view v-if="card.topModels && card.topModels.length" class="report-card__list">
      <text class="report-card__list-title">{{
        card.compareMode ? $t('assistant.analytics.platformShareTitle') : $t('stats.modelRanking')
      }}</text>
      <view
        v-for="(item, index) in card.topModels"
        :key="item.platformId + '-' + index"
        class="report-card__row"
      >
        <view class="report-card__row-main">
          <text class="report-card__row-name">{{ item.name }}</text>
          <text v-if="card.compareMode" class="report-card__row-meta">
            {{ formatToken(item.tokenCount) }} token
          </text>
        </view>
        <view class="report-card__row-bar-wrap">
          <view class="report-card__row-bar" :style="{ width: item.percent + '%' }" />
        </view>
        <text class="report-card__row-percent">{{ item.percent }}%</text>
      </view>
    </view>

    <view v-if="card.quota" class="report-card__section report-card__section--quota">
      <text class="report-card__section-title">{{ $t('assistant.report.quotaTitle') }}</text>
      <view class="report-card__quota-row">
        <text class="report-card__quota-label">{{ $t('assistant.report.plannedTotal') }}</text>
        <text class="report-card__quota-value"
          >{{ formatToken(card.quota.totalPlannedTokens) }} token</text
        >
      </view>
      <view class="report-card__quota-row">
        <text class="report-card__quota-label">{{ $t('assistant.report.consumed') }}</text>
        <text class="report-card__quota-value"
          >{{ formatToken(card.quota.consumedTokens) }} token</text
        >
      </view>
      <view class="report-card__quota-row">
        <text class="report-card__quota-label">{{ $t('assistant.report.remaining') }}</text>
        <text class="report-card__quota-value report-card__quota-value--highlight"
          >{{ formatToken(card.quota.remainingTokens) }} token</text
        >
      </view>
      <view
        v-for="(item, index) in card.quota.adjustments"
        :key="'adj-' + index"
        class="report-card__quota-row"
      >
        <text class="report-card__quota-label">{{ item.label }}</text>
        <text class="report-card__quota-value">{{ formatDelta(item.tokenDelta) }}</text>
      </view>
    </view>

    <view class="report-card__actions">
      <text class="report-card__link" @click="onDetail">{{
        $t('assistant.report.viewStats')
      }}</text>
    </view>
    <text class="report-card__time">{{ displayTime }}</text>
  </view>
</template>

<script>
  import { formatToken } from '@/utils/format.js';
  import { pickReportIcon } from '@/constants/quickChips.js';

  export default {
    name: 'ReportCard',
    props: {
      card: {
        type: Object,
        required: true,
      },
      displayTime: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        headerIcon: pickReportIcon(),
      };
    },
    computed: {
      hasInternal() {
        return Number(this.card.internal?.totalTokens) > 0;
      },
      hasExternal() {
        return Number(this.card.external?.totalTokens) > 0;
      },
    },
    methods: {
      formatToken,
      formatDelta(delta = 0) {
        const value = Number(delta) || 0;
        const prefix = value > 0 ? '+' : '';
        return `${prefix}${this.formatToken(value)} token`;
      },
      onDetail() {
        uni.switchTab({ url: '/pages/stats/index' });
      },
    },
  };
</script>

<style lang="scss" scoped>
  .report-card {
    display: flex;
    flex-direction: column;
    align-self: flex-start;
    width: 85%;
    padding: $spacing-md $spacing-md;
    border-radius: $radius-card;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }

  .report-card__header {
    display: flex;
    align-items: center;
    gap: $spacing-xs;
  }

  .report-card__icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48rpx;
    height: 48rpx;
    border-radius: $radius-circle;
    background-color: rgba(9, 132, 227, 0.14);
  }

  .report-card__title {
    color: $color-text-primary;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
  }

  .report-card__summary {
    margin-top: $spacing-md;
    padding: $spacing-md 0;
    border-top: 1rpx solid $color-bg-muted;
    border-bottom: 1rpx solid $color-bg-muted;
  }

  .report-card__metric {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .report-card__metric--solo {
    width: 100%;
  }

  .report-card__metric-value {
    color: $color-text-primary;
    font-size: $font-size-md;
    font-weight: $font-weight-bold;
  }

  .report-card__metric-label {
    margin-top: 4rpx;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
  }

  .report-card__record-count {
    display: block;
    margin-top: $spacing-xs;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
    text-align: center;
  }

  .report-card__section {
    margin-top: $spacing-md;
    padding-top: $spacing-sm;
    border-top: 1rpx solid $color-bg-muted;
  }

  .report-card__section--quota {
    padding: $spacing-sm $spacing-sm 0;
    border-radius: $radius-tag;
    background-color: rgba(108, 92, 231, 0.06);
    border-top: none;
  }

  .report-card__section-title {
    color: $color-text-primary;
    font-size: $font-size-sm;
    font-weight: $font-weight-semibold;
  }

  .report-card__section-meta {
    display: block;
    margin-top: 4rpx;
    margin-bottom: $spacing-xs;
    color: $color-text-secondary;
    font-size: $font-size-xs;
  }

  .report-card__platform-row,
  .report-card__quota-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: $spacing-xs;
    gap: $spacing-sm;
  }

  .report-card__platform-name,
  .report-card__quota-label {
    flex: 1;
    min-width: 0;
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }

  .report-card__platform-value,
  .report-card__quota-value {
    flex-shrink: 0;
    color: $color-text-primary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
  }

  .report-card__quota-value--highlight {
    color: $color-primary;
  }

  .report-card__list {
    margin-top: $spacing-md;
  }

  .report-card__list-title {
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }

  .report-card__row {
    display: flex;
    align-items: center;
    margin-top: $spacing-sm;
    gap: $spacing-sm;
  }

  .report-card__row-main {
    display: flex;
    flex: 1;
    flex-direction: column;
    flex-shrink: 0;
    min-width: 0;
    max-width: 240rpx;
  }

  .report-card__row-name {
    color: $color-text-primary;
    font-size: $font-size-sm;
  }

  .report-card__row-meta {
    margin-top: 4rpx;
    color: $color-text-secondary;
    font-size: $font-size-xs;
  }

  .report-card__row-bar-wrap {
    flex: 1;
    height: 12rpx;
    overflow: hidden;
    border-radius: 6rpx;
    background-color: $color-bg-muted;
  }

  .report-card__row-bar {
    height: 100%;
    border-radius: 6rpx;
    background: $color-primary-gradient;
  }

  .report-card__row-percent {
    flex-shrink: 0;
    width: 56rpx;
    color: $color-text-secondary;
    font-size: $font-size-xs;
    text-align: right;
  }

  .report-card__actions {
    display: flex;
    justify-content: flex-end;
    margin-top: $spacing-md;
  }

  .report-card__link {
    color: $color-secondary;
    font-size: $font-size-sm;
  }

  .report-card__time {
    align-self: flex-end;
    margin-top: $spacing-sm;
    color: $color-text-placeholder;
    font-size: $font-size-xs;
  }
</style>
