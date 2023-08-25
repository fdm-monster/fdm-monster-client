<template>
  <div v-if="loading" :style="getWrapperStyle()">
    <div v-for="index in 9" :key="index" :style="getCircleStyle(random(100))"></div>
  </div>
</template>

<script>
const random = (top) => Math.random() * top;

export default {
  name: "GridLoader",
  props: {
    loading: { type: Boolean, default: true },
    color: { type: String, default: `#000000` },
    size: { type: Number, default: 15 },
    margin: { type: String, default: `2px` },
    sizeUnit: { type: String, default: `px` },
  },
  methods: {
    random,
    getWrapperStyle() {
      const width = `${parseFloat(this.size) * 3 + parseFloat(this.margin) * 6}${this.sizeUnit}`;
      return {
        width: width,
        fontSize: 0,
      };
    },
    getCircleStyle(rand) {
      const animation = `grid ${rand / 100 + 0.6}s ${rand / 100 - 0.2}s infinite ease`;
      return {
        display: "inline-block",
        backgroundColor: this.color,
        width: `${this.size}${this.sizeUnit}`,
        height: `${this.size}${this.sizeUnit}`,
        margin: this.margin,
        borderRadius: "100%",
        animationFillMode: "both",
        animation: animation,
      };
    },
  },
};
</script>

<style>
@keyframes grid {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.5);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
