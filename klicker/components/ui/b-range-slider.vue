<template>
  <div
    ref="wrap"
    :class="['vue-range-slider slider-component slider-horizontal', { 'slider-disabled': isDisabled }, stateClass]"
    :style="[wrapStyles, isDisabled ? disabledStyle : null]"
    @click="wrapClick"
  >
    <div
      ref="elem"
      class="slider ring-2 focus:ring-2 focus:ring-contrast/20 ring-contrast/10 hover:ring-contrast/20 bg-contrast/5"
      :style="[elemStyles, bgStyle]"
      aria-hidden="true"
    >
      <!-- Dot 0 -->
      <div
        ref="dot0"
        :class="['slider-dot', tooltipStatus, { 'slider-dot-dragging': flag && currentSlider === 0, 'slider-dot-disabled': !isDisabled && disabledArray[0] }]"
        :style="dotStyles"
      >
        <slot
          name="dot"
          :index="0"
          :value="currentValue[0]"
          :disabled="disabledArray[0]"
        >
          <div
            class="slider-dot-handle bg-primary-500"
            :style="[(!isDisabled && disabledArray[0]) ? disabledDotStyles[0] : null, sliderStyles[0]]"
          ></div>
        </slot>
        <div
          ref="tooltip0"
          :class="['slider-tooltip-wrap', '*:bg-contrast/[0.08] *:shadow *:rounded-2xl', `slider-tooltip-${tooltipDirection[0]}`]"
        >
          <slot
            name="tooltip"
            :value="currentValue[0]"
            :index="0"
            :disabled="!isDisabled && disabledArray[0]"
          >
            <span
              class="slider-tooltip"
              :style="tooltipStyles[0]"
            >
              {{ formatter ? formatting(currentValue[0]) : currentValue[0] }}
            </span>
          </slot>
        </div>
      </div>

      <!-- Dot 1 -->
      <div
        ref="dot1"
        :class="['slider-dot', tooltipStatus, { 'slider-dot-dragging': flag && currentSlider === 1, 'slider-dot-disabled': !isDisabled && disabledArray[1] }]"
        :style="dotStyles"
      >
        <slot
          name="dot"
          :index="1"
          :value="currentValue[1]"
          :disabled="disabledArray[1]"
        >
          <div
            class="slider-dot-handle bg-primary-500"
            :style="[(!isDisabled && disabledArray[1]) ? disabledDotStyles[1] : null, sliderStyles[1]]"
          ></div>
        </slot>
        <div
          ref="tooltip1"
          :class="['slider-tooltip-wrap', '*:bg-contrast/[0.08] *:shadow *:rounded-2xl', `slider-tooltip-${tooltipDirection[1]}`]"
        >
          <slot
            name="tooltip"
            :value="currentValue[1]"
            :index="1"
            :disabled="!isDisabled && disabledArray[1]"
          >
            <span
              class="slider-tooltip"
              :style="tooltipStyles[1]"
            >
              {{ formatter ? formatting(currentValue[1]) : currentValue[1] }}
            </span>
          </slot>
        </div>
      </div>

      <!-- Process -->
      <div
        ref="process"
        class="slider-process bg-primary-300"
        :style="processStyle"
      >
        <div
          ref="mergedTooltip"
          :class="['merged-tooltip slider-tooltip-wrap', '*:bg-contrast/[0.08] *:shadow *:rounded-2xl', `slider-tooltip-${tooltipDirection[0]}`]"
          :style="tooltipMergedPosition"
        >
          <slot
            name="tooltip"
            :value="currentValue"
            merge
          >
            <span
              class="slider-tooltip"
              :style="tooltipStyles"
            >
              {{
                mergeFormatter
                  ? mergeFormatting(currentValue[0], currentValue[1])
                  : (formatter
                    ? (currentValue[0] === currentValue[1]
                      ? formatting(currentValue[0])
                      : `${formatting(currentValue[0])} - ${formatting(currentValue[1])}`)
                    : (currentValue[0] === currentValue[1]
                      ? currentValue[0]
                      : `${currentValue[0]} - ${currentValue[1]}`))
              }}
            </span>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// adapted and ported to Vue 3 from https://github.com/xwpongithub/vue-range-slider (MIT license)

import { defineComponent, h } from 'vue'
import {roundToDPR, isArray, isDiff, addEvent, removeEvent} from './b-range-slider-utils'

const transform = 'transform'
const transitionDuration = 'transitionDuration'
const transitionEnd = 'transitionEnd'

const EVENT_TOUCH_START = 'touchstart'
const EVENT_TOUCH_MOVE = 'touchmove'
const EVENT_TOUCH_END = 'touchend'
const EVENT_TOUCH_CANCEL = 'touchcancel'

const EVENT_MOUSE_DOWN = 'mousedown'
const EVENT_MOUSE_MOVE = 'mousemove'
const EVENT_MOUSE_UP = 'mouseup'
const EVENT_MOUSE_LEAVE = 'mouseleave'

const EVENT_RESIZE = 'resize'

export default defineComponent({
  name: 'vue-range-slider',
  props: {
    // 值
    modelValue: {
      type: Array,
      required: true
    },
    // 最小值
    min: {
      type: Number,
      default: 0
    },
    // 最大值
    max: {
      type: Number,
      default: 100
    },
    // 分段间隔
    step: {
      type: Number,
      default: 1
    },
    // 组件宽度
    width: {
      type: [Number, String],
      default: 'auto'
    },
    // 组件高度
    height: {
      type: [Number, String],
      default: 6
    },
    // 滑块大小
    dotSize: {
      type: Number,
      default: 16
    },
    dotWidth: {
      type: Number,
      required: false
    },
    dotHeight: {
      type: Number,
      required: false
    },
    stopPropagation: {
      type: Boolean,
      default: false
    },
    // 是否显示工具提示
    tooltip: {
      type: [String, Boolean],
      default: 'always',
      validator(val) {
        return ['hover', 'always', false].indexOf(val) > -1
      }
    },
    // 是否不可用
    disabled: {
      type: [Boolean, Array],
      default: false
    },
    // 是否为开发环境（打印错误）
    debug: {
      type: Boolean,
      default: true
    },
    // 最小范围
    minRange: {
      type: Number
    },
    // 最大范围
    maxRange: {
      type: Number
    },
    tooltipMerge: {
      type: Boolean,
      default: true
    },
    // 是否在拖拽结束后同步值
    lazy: {
      type: Boolean,
      default: false
    },
    // 在范围模式中，是否允许交叉
    enableCross: {
      type: Boolean,
      default: true
    },
    // 动画速度比
    speed: {
      type: Number,
      default: 0.5
    },
    formatter: [String, Function],
    mergeFormatter: [String, Function],
    // 工具提示方向
    tooltipDir: [Array, String],
    // 工具提示样式
    tooltipStyle: [Array, Object, Function],
    // 滑块样式
    sliderStyle: [Array, Object, Function],
    // 组件禁用状态下样式
    disabledStyle: Object,
    // 进度条样式
    processStyle: Object,
    // 组件背景样式
    bgStyle: Object,
    disabledDotStyle: [Array, Object, Function],
    labelStyle: Object,
    labelActiveStyle: Object
  },
  data() {
    return {
      currentValue: 0,
      size: 0,
      fixedValue: 0,
      currentSlider: 0,
      flag: false,
      dragFlag: false,
      crossFlag: false,
    }
  },
  computed: {
    currentIndex() {
      return [this.getIndexByValue(this.currentValue[0]), this.getIndexByValue(this.currentValue[1])]
    },
    tooltipMergedPosition() {
      const tooltipDirection = this.tooltipDirection[0]
      const dot0 = this.$refs.dot0
      if (dot0) {
        let style = {}
        style[tooltipDirection] = `-${(this.dotWidthVal / 2) - (this.height / 2) + 9}px`
        style.left = `50%`
        return style
      }
      return {}
    },
    tooltipDirection() {
      const dir = this.tooltipDir || 'top'
      if (isArray(dir)) {
        return dir
      } else {
        return [dir, dir]
      }
    },
    total() {
      if (Math.floor((this.max - this.min) * this.multiple) % (this.step * this.multiple) !== 0) {
        this.printError('Prop[step] is illegal, Please make sure that the step can be divisible')
      }
      return (this.max - this.min) / this.step
    },
    dotStyles() {
      return {
        width: `${this.dotWidthVal}px`,
        height: `${this.dotHeightVal}px`,
        top: `${(-(this.dotHeightVal - this.height) / 2)}px`
      }
    },
    sliderStyles() {
      if (isArray(this.sliderStyle)) {
        return this.sliderStyle
      } else if (typeof this.sliderStyle === 'function') {
        return this.sliderStyle(this.currentValue, this.currentIndex)
      } else {
        return [this.sliderStyle, this.sliderStyle]
      }
    },
    tooltipStyles() {
      if (isArray(this.tooltipStyle)) {
        return this.tooltipStyle
      } else if (typeof this.tooltipStyle === 'function') {
        return this.tooltipStyle(this.currentValue, this.currentIndex)
      } else {
        return [this.tooltipStyle, this.tooltipStyle]
      }
    },
    disabledDotStyles() {
      const disabledStyle = this.disabledDotStyle
      if (isArray(disabledStyle)) {
        return disabledStyle
      } else if (typeof disabledStyle === 'function') {
        const style = disabledStyle(this.currentValue, this.currentIndex)
        return isArray(style) ? style : [style, style]
      } else if (disabledStyle) {
        return [disabledStyle, disabledStyle]
      } else {
        return [{
          backgroundColor: '#ccc'
        }, {
          backgroundColor: '#ccc'
        }]
      }
    },
    elemStyles() {
      return {
        height: `${this.height}px`
      }
    },
    wrapStyles() {
      return {
        padding: `${this.dotHeightVal / 2}px ${this.dotWidthVal / 2}px`
      }
    },
    stateClass() {
      return {
        'slider-state-drag': this.flag,
      }
    },
    tooltipStatus() {
      return this.tooltip === 'hover' && this.flag ? 'slider-always' : this.tooltip ? `slider-${this.tooltip}` : ''
    },
    multiple() {
      const decimals = `${this.step}`.split('.')[1]
      return decimals ? Math.pow(10, decimals.length) : 1
    },
    spacing() {
      return this.step
    },
    gap() {
      return this.size / this.total
    },
    dotWidthVal() {
      return typeof this.dotWidth === 'number' ? this.dotWidth : this.dotSize
    },
    dotHeightVal() {
      return typeof this.dotHeight === 'number' ? this.dotHeight : this.dotSize
    },
    disabledArray() {
      return isArray(this.disabled) ? this.disabled : [this.disabled, this.disabled]
    },
    isDisabled() {
      return this.disabledArray.every(b => b === true)
    },
    isFixed() {
      return this.minRange
    },
    position() {
      return [(this.currentValue[0] - this.min) / this.spacing * this.gap, (this.currentValue[1] - this.min) / this.spacing * this.gap]
    },
    limit() {
      return this.isFixed ? [[0, (this.total - this.fixedValue) * this.gap], [this.fixedValue * this.gap, this.size]] : [[0, this.position[1]], [this.position[0], this.size]]
    },
    valueLimit() {
      return this.isFixed ? [[this.min, this.max - (this.fixedValue * (this.spacing * this.multiple)) / this.multiple], [this.min + (this.fixedValue * (this.spacing * this.multiple)) / this.multiple, this.max]] : [[this.min, this.currentValue[1]], [this.currentValue[0], this.max]]
    },
    idleSlider() {
      return this.currentSlider === 0 ? 1 : 0
    },
    slider() {
      return [this.$refs.dot0, this.$refs.dot1]
    }
  },
  methods: {
    setValue(val, noCb, speed) {
      if (isDiff(this.currentValue, val)) {
        const resetVal = this.limitValue(val)
        this.currentValue = resetVal.concat()
        this.computedFixedValue()
        this.syncValue(noCb)
      }
      this.$nextTick(() => this.setPosition(speed))
    },
    setIndex(val) {
      if (isArray(val)) {
        const value = [this.getValueByIndex(val[0]), this.getValueByIndex(val[1])]
        this.setValue(value)
      } else {
        const value = this.getValueByIndex(val)
        this.currentSlider = value > ((this.currentValue[1] - this.currentValue[0]) / 2 + this.currentValue[0]) ? 1 : 0
        this.setCurrentValue(value)
      }
    },
    wrapClick(e) {
      if (this.isDisabled || this.dragFlag) return false
      const pos = this.getPos(e)
      if (this.disabledArray.every(b => b === false)) {
        this.currentSlider = pos > ((this.position[1] - this.position[0]) / 2 + this.position[0]) ? 1 : 0
      } else if (this.disabledArray[0]) {
        if (pos < this.position[0]) return false
        this.currentSlider = 1
      } else if (this.disabledArray[1]) {
        if (pos > this.position[1]) return false
        this.currentSlider = 0
      }
      if (this.disabledArray[this.currentSlider]) {
        return false
      }
      this.setValueOnPos(pos)
      if (this.tooltipMerge) {
        const timer = setInterval(this.handleOverlapTooltip, 16.7)
        setTimeout(() => window.clearInterval(timer), this.speed * 1000)
      }
    },
    syncValue(noCb) {
      const val = this.currentValue.concat()
      this.$emit('update:modelValue', val)
      noCb || this.$emit('slide-end', val)
    },
    getPos(e) {
      return e.pageX - this.offset
    },
    setValueOnPos(pos, isDrag) {
      const range = this.limit[this.currentSlider]
      const valueRange = this.valueLimit[this.currentSlider]
      const index = Math.round(pos / this.gap)
      if (pos >= range[0] && pos <= range[1]) {
        const v = this.getValueByIndex(index)
        this.setTransform(pos)
        this.setCurrentValue(v, isDrag)
        if (this.isLessRange(index)) {
          this.setTransform(pos + ((this.fixedValue * this.gap) * (this.currentSlider === 0 ? 1 : -1)), true)
          this.setCurrentValue((v * this.multiple + (this.fixedValue * this.spacing * this.multiple * (this.currentSlider === 0 ? 1 : -1))) / this.multiple, isDrag, true)
        }
      } else {
        const anotherSlider = pos < range[0] ? 0 : 1
        const currentSlider = anotherSlider === 0 ? 1 : 0
        this.setTransform(range[anotherSlider])
        this.setCurrentValue(valueRange[anotherSlider])
        if (this.isLessRange(index)) {
          this.setTransform(this.limit[this.idleSlider][anotherSlider], true)
          this.setCurrentValue(this.valueLimit[this.idleSlider][anotherSlider], isDrag, true)
        } else if ((this.enableCross || this.crossFlag) && !this.isFixed && !this.disabledArray[anotherSlider] && this.currentSlider === currentSlider) {
          this.currentSlider = anotherSlider
        }
      }
      this.crossFlag = false
    },
    setCurrentValue(val, isDrag, isIdleSlider) {
      const slider = isIdleSlider ? this.idleSlider : this.currentSlider
      if (val < this.min || val > this.max) return false
        if (isDiff(this.currentValue[slider], val)) {
          this.currentValue.splice(slider, 1, val)
          if (!this.lazy || !this.flag) {
            this.syncValue()
        }
      }
      isDrag || this.setPosition()
    },
    setPosition(speed) {
      this.flag || this.setTransitionTime(speed ?? this.speed)
      this.setTransform(this.position[0], this.currentSlider === 1)
      this.setTransform(this.position[1], this.currentSlider === 0)
      this.flag || this.setTransitionTime(0)
    },
    setTransform(val, isIdleSlider) {
      const slider = isIdleSlider ? this.idleSlider : this.currentSlider
      const value = roundToDPR(val - (this.dotWidthVal / 2))
      const translateValue = `translateX(${value}px)`
      const processSize = `${slider === 0 ? this.position[1] - val : val - this.position[0]}px`
      const processPos = `${slider === 0 ? val : this.position[0]}px`
      this.slider[slider].style[transform] = translateValue
      this.$refs.process.style.width = processSize
      this.$refs.process.style.left = processPos
    },
    setTransitionTime(time) {
      // In order to avoid browser merge style and modify together
      time || this.$refs.process.offsetWidth
      const sliderLen = this.slider.length
      for (let i = 0; i < sliderLen; i++) {
        this.slider[i].style[transitionDuration] = `${time}s`
      }
      this.$refs.process.style[transitionDuration] = `${time}s`
    },
    computedFixedValue() {
      if (!this.isFixed) {
        this.fixedValue = 0
        return false
      }
      this.fixedValue = this.currentIndex[1] - this.currentIndex[0]
      this.fixedValue = Math.max(0, this.minRange || 0)
    },
    limitValue(val) {
      const inRange = v => {
        if (v < this.min) {
          this.printError(`The value of the slider is ${val}, the minimum value is ${this.min}, the value of this slider can not be less than the minimum value`)
          return this.min
        } else if (v > this.max) {
          this.printError(`The value of the slider is ${val}, the maximum value is ${this.max}, the value of this slider can not be greater than the maximum value`)
          return this.max
        }
        return v
      }
      return val.map(v => inRange(v))
    },
    getStaticData() {
      if (this.$refs.elem) {
        this.size = this.$refs.elem.offsetWidth
        this.offset = this.$refs.elem.getBoundingClientRect().left
      }
    },
    handleOverlapTooltip() {
      const isDirectionSame = this.tooltipDirection[0] === this.tooltipDirection[1]
      if (isDirectionSame) {
        const tooltip0 = this.$refs.tooltip0
        const tooltip1 = this.$refs.tooltip1
        if (tooltip0 == null || tooltip1 == null) return
        const tooltip0Rect = tooltip0.getBoundingClientRect()
        const tooltip1Rect = tooltip1.getBoundingClientRect()

        const tooltip0Right = tooltip0Rect.right
        const tooltip1Left = tooltip1Rect.left

        const horizontalOverlap = tooltip0Right > tooltip1Left

        if (horizontalOverlap) {
          this.handleDisplayMergedTooltip(true)
        } else {
          this.handleDisplayMergedTooltip(false)
        }
      }
    },
    handleDisplayMergedTooltip (show) {
      const tooltip0 = this.$refs.tooltip0
      const tooltip1 = this.$refs.tooltip1
      const mergedTooltip = this.$refs.process.getElementsByClassName('merged-tooltip')[0]
      if (show) {
        tooltip0.style.visibility = 'hidden'
        tooltip1.style.visibility = 'hidden'
        mergedTooltip.style.visibility = 'visible'
      } else {
        tooltip0.style.visibility = 'visible'
        tooltip1.style.visibility = 'visible'
        mergedTooltip.style.visibility = 'hidden'
      }
    },
    isLessRange(index) {
      if (!this.minRange && !this.maxRange) {
        return false
      }
      const diff = this.currentSlider === 0 ? this.currentIndex[1] - index : index - this.currentIndex[0]
      if (this.minRange && diff <= this.minRange) {
        this.fixedValue = this.minRange
        return true
      }
      if (this.maxRange && diff >= this.maxRange) {
        this.fixedValue = this.maxRange
        return true
      }
      this.computedFixedValue()
      return false
    },
    getValueByIndex(index) {
      return ((this.spacing * this.multiple) * index + (this.min * this.multiple)) / this.multiple
    },
    getIndexByValue(value) {
      return Math.round((value - this.min) * this.multiple) / (this.spacing * this.multiple)
    },
    formatting(value) {
      return typeof this.formatter === 'string' ? this.formatter.replace(/{value}/, value) : this.formatter(value)
    },
    mergeFormatting(value1, value2) {
      return typeof this.mergeFormatter === 'string' ? this.mergeFormatter.replace(/{(value1|value2)}/g, (_, key) => key === 'value1' ? value1 : value2) : this.mergeFormatter(value1, value2)
    },
    _start(e, index = 0, isProcess) {
      if (this.disabledArray[index]) {
        return false
      }
      if (this.stopPropagation) {
        e.stopPropagation()
      }
      this.currentSlider = index
      if (isProcess) {
        return false
      }
      if (!this.enableCross && this.currentValue[0] === this.currentValue[1]) {
        this.crossFlag = true
      }
      this.flag = true
      this.$emit('drag-start', this)
    },
    _move(e) {
      // e.preventDefault() // NOTE: COMMENTED, BREAKS SELECTING THINGS ON PAGE
      if (this.stopPropagation) {
        e.stopPropagation()
      }
      if (!this.flag) return false
      if (e.targetTouches && e.targetTouches[0]) e = e.targetTouches[0]
      this.dragFlag = true
      this.setValueOnPos(this.getPos(e), true)
      if (this.tooltipMerge) {
        this.handleOverlapTooltip()
      }
    },
    _end(e) {
      if (this.stopPropagation) {
        e.stopPropagation()
      }
      if (this.flag) {
        this.$emit('drag-end', this)
        if (this.lazy && isDiff(this.currentValue, this.modelValue)) {
          this.syncValue()
        }
      } else {
        return false
      }
      this.flag = false
      this.$nextTick(() => {
        this.crossFlag = false
        this.dragFlag = false
      })
      this.setPosition()
    },
    bindEvents() {
      this.processStartFn = (e) => this._start(e, 0, true)
      this.dot0StartFn = (e) => this._start(e, 0)
      this.dot1StartFn = (e) => this._start(e, 1)

      addEvent(this.$refs.process, EVENT_TOUCH_START, this.processStartFn)
      addEvent(this.$refs.process, EVENT_MOUSE_DOWN, this.processStartFn)
      addEvent(this.$refs.dot0, EVENT_MOUSE_DOWN, this.dot0StartFn)
      addEvent(this.$refs.dot0, EVENT_TOUCH_START, this.dot0StartFn)
      addEvent(this.$refs.dot1, EVENT_MOUSE_DOWN, this.dot1StartFn)
      addEvent(this.$refs.dot1, EVENT_TOUCH_START, this.dot1StartFn)

      addEvent(document, EVENT_MOUSE_MOVE, this._move)
      addEvent(document, EVENT_MOUSE_UP, this._end)
      addEvent(document, EVENT_MOUSE_LEAVE, this._end)
      addEvent(document, EVENT_TOUCH_MOVE, this._move)
      addEvent(document, EVENT_TOUCH_END, this._end)
      addEvent(document, EVENT_TOUCH_CANCEL, this._end)

      addEvent(window, EVENT_RESIZE, this.refresh)

      if (this.tooltipMerge) {
        addEvent(this.$refs.dot0, transitionEnd, this.handleOverlapTooltip)
        addEvent(this.$refs.dot1, transitionEnd, this.handleOverlapTooltip)
      }
    },
    unbindEvents() {
      removeEvent(this.$refs.process, EVENT_MOUSE_DOWN, this.processStartFn)
      removeEvent(this.$refs.dot0, EVENT_MOUSE_DOWN, this.dot0StartFn)
      removeEvent(this.$refs.dot1, EVENT_MOUSE_DOWN, this.dot1StartFn)

      removeEvent(document, EVENT_MOUSE_MOVE, this._move)
      removeEvent(document, EVENT_MOUSE_UP, this._end)
      removeEvent(document, EVENT_MOUSE_LEAVE, this._end)
      removeEvent(document, EVENT_TOUCH_CANCEL, this._end)

      removeEvent(window, EVENT_RESIZE, this.refresh)

      if (this.tooltipMerge) {
        removeEvent(this.$refs.dot0, transitionEnd, this.handleOverlapTooltip)
        removeEvent(this.$refs.dot1, transitionEnd, this.handleOverlapTooltip)
      }
    },
    refresh() {
      if (this.$refs.elem) {
        this.getStaticData()
        this.computedFixedValue()
        this.setPosition()
        this.unbindEvents()
        this.bindEvents()
      }
    },
    printError(msg) {
      if (this.debug) {
        console.error(`[VueSlider error]: ${msg}`)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.getStaticData()
      this.setValue(this.limitValue(this.modelValue), true, 0)
      this.bindEvents()
      if (this.tooltipMerge) {
        this.handleOverlapTooltip()
      }
    })
  },
  watch: {
    value(val) {
      this.flag || this.setValue(val, true)
    },
    show(bool) {
      if (bool && !this.size) {
        this.$nextTick(this.refresh)
      }
    },
    max(val) {
      if (val < this.min) {
        return this.printError('The maximum value can not be less than the minimum value.')
      }
      const resetVal = this.limitValue(this.currentValue)
      this.setValue(resetVal)
      this.refresh()
    },
    min(val) {
      if (val > this.max) {
        return this.printError('The minimum value can not be greater than the maximum value.')
      }
      const resetVal = this.limitValue(this.currentValue)
      this.setValue(resetVal)
      this.refresh()
    },
    fixed() {
      this.computedFixedValue()
    },
    minRange() {
      this.computedFixedValue()
    }
  },
  beforeDestroy() {
    this.unbindEvents()
    this.refresh()
  },
  deactivated() {
    this.unbindEvents()
    this.refresh()
  }
})
</script>

<style>
/**
 * vue-range-slider v1.0.3
 * (c) 2016-2019 xwpongithub
 * Released under the MIT License.
 */
.vue-range-slider.slider-component {
  position: relative;
  -webkit-box-sizing: border-box;
          box-sizing: border-box;
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
}
.vue-range-slider.slider-component .slider {
  position: relative;
  display: block;
  border-radius: 15px;
}
.vue-range-slider.slider-component .slider::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}
.vue-range-slider.slider-component .slider .slider-dot {
  position: absolute;
  -webkit-transition: all 0s;
  transition: all 0s;
  will-change: transform;
  cursor: pointer;
  z-index: 5;
}
.vue-range-slider.slider-component .slider .slider-dot .slider-dot-handle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  -webkit-box-shadow: 0.5px 0.5px 2px 1px rgba(0,0,0,0.32);
          box-shadow: 0.5px 0.5px 2px 1px rgba(0,0,0,0.32);
}
.vue-range-slider.slider-component .slider .slider-dot.slider-dot-dragging {
  z-index: 5;
}
.vue-range-slider.slider-component .slider .slider-dot.slider-dot-disabled {
  z-index: 4;
}
.vue-range-slider.slider-component .slider .slider-dot.slider-hover:hover .slider-tooltip-wrap {
  display: block;
}
.vue-range-slider.slider-component .slider .slider-dot.slider-always .slider-tooltip-wrap {
  display: block !important;
}
.vue-range-slider.slider-component .slider .slider-process {
  position: absolute;
  border-radius: 15px;
  z-index: 1;
}
.vue-range-slider.slider-component .slider .slider-input {
  position: absolute;
  overflow: hidden;
  height: 1px;
  width: 1px;
  clip: rect(1px, 1px, 1px, 1px);
}
.vue-range-slider.slider-component.slider-horizontal .slider-dot {
  left: 0;
}
.vue-range-slider.slider-component.slider-horizontal .slider-process {
  width: 0;
  height: 100%;
  top: 0;
  left: 0;
  will-change: width;
}
.vue-range-slider.slider-component .slider-tooltip-wrap {
  display: none;
  position: absolute;
  z-index: 9;
}
.vue-range-slider.slider-component .slider-tooltip-wrap.merged-tooltip {
  display: block;
  visibility: hidden;
}
.vue-range-slider.slider-component .slider-tooltip-wrap.slider-tooltip-top {
  top: -9px;
  left: 50%;
  -webkit-transform: translate(-50%, -100%);
          transform: translate(-50%, -100%);
}
.vue-range-slider.slider-component .slider-tooltip-wrap.slider-tooltip-top .slider-tooltip::before {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  width: 0;
  height: 0;
  border: 5px solid transparent;
  border-top-color: inherit;
  -webkit-transform: translate(-50%, 0);
          transform: translate(-50%, 0);
}
.vue-range-slider.slider-component .slider-tooltip-wrap.slider-tooltip-bottom {
  bottom: -9px;
  left: 50%;
  -webkit-transform: translate(-50%, 100%);
          transform: translate(-50%, 100%);
}
.vue-range-slider.slider-component .slider-tooltip-wrap.slider-tooltip-bottom .slider-tooltip::before {
  content: '';
  position: absolute;
  top: -10px;
  left: 50%;
  width: 0;
  height: 0;
  border: 5px solid transparent;
  border-bottom-color: inherit;
  -webkit-transform: translate(-50%, 0);
          transform: translate(-50%, 0);
}
.vue-range-slider.slider-component .slider-tooltip-wrap.slider-tooltip-left {
  top: 50%;
  left: -9px;
  -webkit-transform: translate(-100%, -50%);
          transform: translate(-100%, -50%);
}
.vue-range-slider.slider-component .slider-tooltip-wrap.slider-tooltip-left .slider-tooltip::before {
  content: '';
  position: absolute;
  top: 50%;
  right: -10px;
  width: 0;
  height: 0;
  border: 5px solid transparent;
  border-left-color: inherit;
  -webkit-transform: translate(0, -50%);
          transform: translate(0, -50%);
}
.vue-range-slider.slider-component .slider-tooltip-wrap.slider-tooltip-right {
  top: 50%;
  right: -9px;
  -webkit-transform: translate(100%, -50%);
          transform: translate(100%, -50%);
}
.vue-range-slider.slider-component .slider-tooltip-wrap.slider-tooltip-right .slider-tooltip::before {
  content: '';
  position: absolute;
  top: 50%;
  left: -10px;
  width: 0;
  height: 0;
  border: 5px solid transparent;
  border-right-color: inherit;
  -webkit-transform: translate(0, -50%);
          transform: translate(0, -50%);
}
.vue-range-slider.slider-component .slider-tooltip-wrap.merged-tooltip {
  display: block;
  visibility: hidden;
}
.vue-range-slider.slider-component .slider-tooltip-wrap .slider-tooltip {
  display: block;
  font-size: 14px;
  white-space: nowrap;
  padding: 2px 5px;
  min-width: 20px;
  text-align: center;
  color: #fff;
}
.vue-range-slider.slider-component.slider-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.vue-range-slider.slider-component.slider-disabled .slider-dot {
  cursor: not-allowed;
}
.vue-range-slider.slider-component.slider-has-label {
  margin-bottom: 15px;
}
</style>
