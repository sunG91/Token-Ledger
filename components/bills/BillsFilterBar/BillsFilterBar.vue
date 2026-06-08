<template>
  <view class="bills-filter">
    <view class="bills-filter__chip bills-filter__chip--time" @click="timeSheetShow = true">
      <text class="bills-filter__chip-prefix">{{ $t('bills.filterTime') }}</text>
      <text class="bills-filter__chip-value">{{ timeLabel }}</text>
      <view class="bills-filter__chip-arrow">
        <u-icon name="arrow-down" :color="arrowIconColor" size="12" />
      </view>
    </view>
    <view class="bills-filter__chip bills-filter__chip--platform" @click="platformSheetShow = true">
      <text class="bills-filter__chip-prefix">{{ $t('bills.filterPlatform') }}</text>
      <text class="bills-filter__chip-value">{{ platformLabel }}</text>
      <view class="bills-filter__chip-arrow">
        <u-icon name="arrow-down" :color="arrowIconColor" size="12" />
      </view>
    </view>
    <view class="bills-filter__calendar" @click="datePickerShow = true">
      <u-icon name="calendar" :color="calendarIconColor" size="20" />
    </view>

    <u-action-sheet
      :show="timeSheetShow"
      :actions="timeActions"
      :title="$t('bills.selectTimeRange')"
      class="bills-filter-sheet"
      :round="16"
      @close="timeSheetShow = false"
      @select="onTimeSelect"
    />
    <u-action-sheet
      :show="platformSheetShow"
      :actions="platformActions"
      :title="$t('bills.selectPlatform')"
      class="bills-filter-sheet"
      :round="16"
      @close="platformSheetShow = false"
      @select="onPlatformSelect"
    />
    <bills-date-picker
      :show="datePickerShow"
      :initial-custom-time="customTime"
      @confirm="onDateConfirm"
      @close="datePickerShow = false"
    />
  </view>
</template>

<script>
  import BillsDatePicker from '@/components/bills/BillsDatePicker/BillsDatePicker.vue';
  import { BILL_PLATFORM_OPTIONS, BILL_TIME_OPTIONS } from '@/constants/bills.js';
  import { getBillTimeDisplayLabel, getBillTimeOptionLabel } from '@/utils/billTimeFilter.js';
  import { translate } from '@/i18n/index.js';
  import { THEME_MODES } from '@/constants/settings.js';
  import { mapGetters, mapState } from 'vuex';

  export default {
    name: 'BillsFilterBar',
    components: {
      BillsDatePicker,
    },
    props: {
      timeValue: {
        type: String,
        default: 'this_month',
      },
      customTime: {
        type: Object,
        default: null,
      },
      platformValue: {
        type: String,
        default: 'all',
      },
    },
    data() {
      return {
        timeSheetShow: false,
        platformSheetShow: false,
        datePickerShow: false,
      };
    },
    computed: {
      ...mapGetters(['resolvedTheme']),
      ...mapState(['preferenceRevision', 'themeMode']),
      arrowIconColor() {
        void this.preferenceRevision;
        void this.themeMode;
        return this.resolvedTheme === THEME_MODES.DARK ? '#A0A4B8' : '#636E72';
      },
      calendarIconColor() {
        void this.preferenceRevision;
        void this.themeMode;
        return this.resolvedTheme === THEME_MODES.DARK ? '#F1F2F6' : '#2D3436';
      },
      timeActions() {
        void this.$store.state.preferenceRevision;
        return BILL_TIME_OPTIONS.map((item) => ({
          name: getBillTimeOptionLabel(item.value),
          value: item.value,
        }));
      },
      platformActions() {
        void this.$store.state.preferenceRevision;
        const locale = this.$store.state.locale;
        return BILL_PLATFORM_OPTIONS.map((item) => ({
          name:
            item.value === 'all'
              ? translate(locale, 'bills.all')
              : item.label,
          value: item.value,
        }));
      },
      timeLabel() {
        void this.$store.state.preferenceRevision;
        return getBillTimeDisplayLabel(this.timeValue, this.customTime);
      },
      platformLabel() {
        void this.$store.state.preferenceRevision;
        const locale = this.$store.state.locale;
        const found = BILL_PLATFORM_OPTIONS.find((item) => item.value === this.platformValue);
        if (!found) {
          return translate(locale, 'bills.all');
        }
        if (found.value === 'all') {
          return translate(locale, 'bills.all');
        }
        return found.label;
      },
    },
    methods: {
      onTimeSelect(action) {
        this.timeSheetShow = false;
        if (this.customTime) {
          this.$emit('custom-time-change', null);
        }
        if (action.value !== this.timeValue) {
          this.$emit('time-change', action.value);
        }
      },
      onPlatformSelect(action) {
        this.platformSheetShow = false;
        if (action.value !== this.platformValue) {
          this.$emit('platform-change', action.value);
        }
      },
      onDateConfirm(customTime) {
        this.datePickerShow = false;
        this.$emit('custom-time-change', customTime);
      },
    },
  };
</script>

<style lang="scss" scoped>
  .bills-filter {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 $spacing-lg;
    gap: $spacing-sm;
  }

  .bills-filter__chip {
    display: flex;
    flex: none;
    align-items: center;
    min-width: 0;
    height: 72rpx;
    padding: 0 $spacing-md;
    border-radius: 36rpx;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
    gap: $spacing-xs;
  }

  .bills-filter__chip--time {
    flex: 0 0 30%;
    width: 30%;
    max-width: 30%;
  }

  .bills-filter__chip--platform {
    flex: 0 0 35%;
    width: 35%;
    max-width: 35%;
  }

  .bills-filter__chip-prefix {
    flex-shrink: 0;
    color: $color-text-secondary;
    font-size: $font-size-xs;
  }

  .bills-filter__chip-value {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    color: $color-text-primary;
    font-size: $font-size-sm;
    font-weight: $font-weight-medium;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bills-filter__chip-arrow {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
  }

  .bills-filter__calendar {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 72rpx;
    height: 72rpx;
    margin-left: auto;
    border-radius: 36rpx;
    background-color: $color-bg-card;
    box-shadow: $shadow-card;
  }
</style>
