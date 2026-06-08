/**
 * Canvas 折线图绘制 — 兼容 App / H5 / 小程序
 */

function hexToRgba(hex, alpha) {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * @param {object} ctx uni canvas context
 * @param {object} options
 */
export function drawLineChart(ctx, options) {
  const {
    width,
    height,
    points = [],
    padding = { top: 24, right: 16, bottom: 32, left: 40 },
    lineColor = '#0984E3',
    activeIndex = -1,
  } = options;

  if (!ctx || !width || !height) return;

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const values = points.map((item) => Number(item.value) || 0);
  const maxValue = Math.max(...values, 1);
  const yMax = Math.ceil(maxValue / 200) * 200 || 200;

  ctx.clearRect(0, 0, width, height);

  ctx.setStrokeStyle('#F1F2F6');
  ctx.setLineWidth(1);
  const gridLines = 4;
  for (let i = 0; i <= gridLines; i += 1) {
    const y = padding.top + (chartHeight / gridLines) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    const labelValue = Math.round(yMax - (yMax / gridLines) * i);
    ctx.setFillStyle('#B2BEC3');
    ctx.setFontSize(10);
    ctx.setTextAlign('right');
    ctx.fillText(String(labelValue), padding.left - 6, y + 4);
  }

  if (!points.length) return;

  const stepX = points.length > 1 ? chartWidth / (points.length - 1) : 0;
  const coords = points.map((item, index) => {
    const x = padding.left + stepX * index;
    const y = padding.top + chartHeight - ((Number(item.value) || 0) / yMax) * chartHeight;
    return { x, y, ...item };
  });

  ctx.beginPath();
  coords.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
      return;
    }
    ctx.lineTo(point.x, point.y);
  });
  ctx.lineTo(coords[coords.length - 1].x, padding.top + chartHeight);
  ctx.lineTo(coords[0].x, padding.top + chartHeight);
  ctx.closePath();
  if (typeof ctx.createLinearGradient === 'function') {
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, hexToRgba(lineColor, 0.28));
    gradient.addColorStop(1, hexToRgba(lineColor, 0.02));
    ctx.setFillStyle(gradient);
  } else {
    ctx.setFillStyle(hexToRgba(lineColor, 0.12));
  }
  ctx.fill();

  ctx.beginPath();
  coords.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
      return;
    }
    ctx.lineTo(point.x, point.y);
  });
  ctx.setStrokeStyle(lineColor);
  ctx.setLineWidth(2);
  ctx.setLineJoin('round');
  ctx.setLineCap('round');
  ctx.stroke();

  coords.forEach((point, index) => {
    const isActive = index === activeIndex;
    ctx.beginPath();
    ctx.arc(point.x, point.y, isActive ? 5 : 3, 0, Math.PI * 2);
    ctx.setFillStyle(isActive ? lineColor : '#fff');
    ctx.fill();
    if (!isActive) {
      ctx.setStrokeStyle(lineColor);
      ctx.setLineWidth(2);
      ctx.stroke();
    }
  });

  ctx.setFillStyle('#B2BEC3');
  ctx.setFontSize(10);
  ctx.setTextAlign('center');
  const labelStep = getXLabelStep(points.length);
  coords.forEach((point, index) => {
    const isEdge = index === 0 || index === coords.length - 1;
    if (!isEdge && index % labelStep !== 0) return;
    ctx.fillText(String(point.label || ''), point.x, height - 10);
  });

  ctx.draw();
}

/** 横轴标签间隔：点越多间隔越大，避免底部拥挤 */
function getXLabelStep(pointCount) {
  if (pointCount <= 7) return 1;
  if (pointCount <= 14) return 2;
  if (pointCount <= 21) return 3;
  if (pointCount <= 28) return 4;
  return Math.max(Math.ceil(pointCount / 6), 5);
}

/** 根据触摸坐标找最近数据点 */
export function findNearestChartPoint(touchX, points, padding, width, chartWidth) {
  if (!points.length) return -1;
  const stepX = points.length > 1 ? chartWidth / (points.length - 1) : 0;
  let nearest = 0;
  let minDistance = Infinity;

  points.forEach((_, index) => {
    const x = padding.left + stepX * index;
    const distance = Math.abs(touchX - x);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = index;
    }
  });

  return nearest;
}
