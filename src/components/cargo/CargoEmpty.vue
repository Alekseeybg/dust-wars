<template>
  <div class="cargo-empty">
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="m5 10 11-6 11 6v13l-11 6-11-6V10Zm0 0 11 6 11-6M16 16v13M10.5 7l11 6v5" />
    </svg>
    <strong>Your hold is empty</strong>
    <p>Goods you buy on the market will appear here.</p>
  </div>
</template>

<style lang="scss" scoped>
.cargo-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 24px 12px;
  text-align: center;
}
.cargo-empty svg {
  width: 30px;
  height: 30px;
  margin-bottom: 3px;
  fill: none;
  stroke: #929299;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.25;
}
.cargo-empty strong {
  color: #d3d3d9;
  font-size: 13px;
  font-weight: 500;
}
.cargo-empty p {
  max-width: 240px;
  margin: 0;
  color: #929299;
  font-size: 11px;
  line-height: 1.6;
}
</style>
