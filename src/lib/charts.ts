/** ECharts option builders, themed from live CSS variables. */
import type { EChartsOption } from 'echarts';
import { chartColors } from './theme';
import { movingAvg } from './stats';

const toolbox = (): any => ({
  toolbox: {
    right: 8,
    top: 0,
    feature: {
      dataZoom: { yAxisIndex: 'none', title: { zoom: 'Zoom', back: 'Reset zoom' } },
      restore: { title: 'Restore' },
      saveAsImage: { title: 'PNG', pixelRatio: 2, name: 'nervedrive-chart' },
    },
    iconStyle: { borderColor: chartColors().muted },
  },
});

const base = (): any => {
  const c = chartColors();
  return {
    ...toolbox(),
    grid: { left: 46, right: 18, top: 28, bottom: 34 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: c.surface,
      borderColor: c.line,
      textStyle: { color: c.ink },
    },
    textStyle: { color: c.muted, fontFamily: 'Inter, sans-serif' },
  };
};

const axis = (data?: any[]) => {
  const c = chartColors();
  return {
    xAxis: {
      type: 'category' as const,
      data,
      boundaryGap: false,
      axisLine: { lineStyle: { color: c.line } },
      axisLabel: { color: c.muted, hideOverlap: true },
    },
    yAxis: {
      type: 'value' as const,
      splitLine: { lineStyle: { color: c.line, opacity: 0.5 } },
      axisLabel: { color: c.muted },
    },
  };
};

export function lineTrend(
  dates: string[],
  values: (number | null)[],
  opts: { color?: keyof ReturnType<typeof chartColors>; area?: boolean; ma?: number; name?: string } = {},
): EChartsOption {
  const c = chartColors();
  const color = c[opts.color ?? 'accent'];
  const series: any[] = [
    {
      name: opts.name ?? 'Value',
      type: 'line',
      data: values,
      showSymbol: false,
      smooth: 0.3,
      lineStyle: { width: 2, color },
      areaStyle: opts.area ? { color, opacity: 0.12 } : undefined,
      connectNulls: false,
    },
  ];
  if (opts.ma) {
    series.push({
      name: `${opts.ma}-pt avg`,
      type: 'line',
      data: movingAvg(values, opts.ma).map((v) => (v == null ? null : +v.toFixed(1))),
      showSymbol: false,
      lineStyle: { width: 1.5, type: 'dashed', color: c.ink },
    });
  }
  return { ...base(), ...axis(dates), legend: opts.ma ? { textStyle: { color: c.muted }, top: 0, left: 0 } : undefined, series };
}

export function barChart(
  cats: string[],
  values: number[],
  opts: { colorByThreshold?: [number, number] } = {},
): EChartsOption {
  const c = chartColors();
  const data = values.map((v) => {
    let color = c.accent;
    if (opts.colorByThreshold) {
      const [lo, hi] = opts.colorByThreshold;
      color = v >= hi ? c.good : v >= lo ? c.warn : c.bad;
    }
    return { value: +v.toFixed(0), itemStyle: { color, borderRadius: [4, 4, 0, 0] } };
  });
  return { ...base(), ...axis(cats), xAxis: { ...axis(cats).xAxis, boundaryGap: true }, series: [{ type: 'bar', data }] };
}

export function donut(labels: string[], values: number[], colors: string[]): EChartsOption {
  const c = chartColors();
  return {
    ...toolbox(),
    tooltip: { trigger: 'item', backgroundColor: c.surface, borderColor: c.line, textStyle: { color: c.ink } },
    legend: { orient: 'vertical', right: 8, top: 'center', textStyle: { color: c.muted } },
    series: [
      {
        type: 'pie',
        radius: ['52%', '76%'],
        center: ['38%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: c.surface, borderWidth: 2 },
        label: { show: false },
        data: labels.map((l, i) => ({ name: l, value: +values[i].toFixed(1), itemStyle: { color: colors[i % colors.length] } })),
      },
    ],
  };
}

export function radar(indicators: { name: string; max: number }[], values: number[]): EChartsOption {
  const c = chartColors();
  return {
    ...toolbox(),
    tooltip: { backgroundColor: c.surface, borderColor: c.line, textStyle: { color: c.ink } },
    radar: {
      indicator: indicators,
      splitLine: { lineStyle: { color: c.line } },
      splitArea: { areaStyle: { color: ['transparent'] } },
      axisLine: { lineStyle: { color: c.line } },
      axisName: { color: c.ink, fontSize: 11 },
    },
    series: [
      {
        type: 'radar',
        data: [{ value: values, areaStyle: { color: c.accent, opacity: 0.2 }, lineStyle: { color: c.accent }, itemStyle: { color: c.accent } }],
      },
    ],
  };
}

export function scatter(points: [number, number][]): EChartsOption {
  const c = chartColors();
  return {
    ...toolbox(),
    tooltip: {
      backgroundColor: c.surface,
      borderColor: c.line,
      textStyle: { color: c.ink },
      formatter: (p: any) => {
        const h = p.value[1] % 24;
        const hh = Math.floor(h);
        return `Night ${p.value[0]}<br/>${hh}:${String(Math.round((h - hh) * 60)).padStart(2, '0')}`;
      },
    },
    grid: { left: 52, right: 18, top: 20, bottom: 34 },
    xAxis: { type: 'value', name: 'night #', axisLine: { lineStyle: { color: c.line } }, splitLine: { show: false }, axisLabel: { color: c.muted } },
    yAxis: {
      type: 'value',
      min: 18,
      max: 32,
      interval: 2,
      axisLabel: { color: c.muted, formatter: (v: number) => `${v % 24}:00` },
      splitLine: { lineStyle: { color: c.line, opacity: 0.5 } },
    },
    series: [
      {
        type: 'scatter',
        symbolSize: 6,
        data: points.map((p) => ({
          value: p,
          itemStyle: { color: p[1] > 26 ? c.bad : p[1] > 24 ? c.warn : c.good },
        })),
      },
    ],
  };
}

export function heatmap(cols: string[], data: (number | null)[][]): EChartsOption {
  const c = chartColors();
  const cells: [number, number, number][] = [];
  data.forEach((row, i) => row.forEach((v, j) => v != null && cells.push([j, i, v])));
  return {
    ...toolbox(),
    tooltip: {
      position: 'top',
      backgroundColor: c.surface,
      borderColor: c.line,
      textStyle: { color: c.ink },
      formatter: (p: any) => `${cols[p.value[1]]} ↔ ${cols[p.value[0]]}<br/>r = ${p.value[2]}`,
    },
    grid: { left: 78, right: 18, top: 18, bottom: 62 },
    xAxis: { type: 'category', data: cols, axisLabel: { color: c.muted, rotate: 40 }, splitArea: { show: true } },
    yAxis: { type: 'category', data: cols, axisLabel: { color: c.muted }, splitArea: { show: true } },
    visualMap: {
      min: -1,
      max: 1,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      inRange: { color: [c.bad, c.surface, c.good] },
      textStyle: { color: c.muted },
    },
    series: [
      {
        type: 'heatmap',
        data: cells,
        label: { show: true, color: c.ink, formatter: (p: any) => p.value[2].toFixed(2) },
        itemStyle: { borderColor: c.surface, borderWidth: 2 },
      },
    ],
  };
}

export function lollipop(cats: string[], values: number[]): EChartsOption {
  const c = chartColors();
  return {
    ...base(),
    ...axis(cats),
    xAxis: { ...axis(cats).xAxis, boundaryGap: true },
    series: [
      { type: 'bar', barWidth: 2, data: values.map((v) => +v.toFixed(0)), itemStyle: { color: c.line } },
      { type: 'scatter', symbolSize: 12, data: values.map((v) => +v.toFixed(0)), itemStyle: { color: c.accent } },
    ],
  };
}
