import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { useStore } from '../../store/useStore';

/**
 * Themed ECharts wrapper. Interactivity (hover, tooltip) is built in;
 * the toolbox adds zoom, restore, and PNG/SVG download per chart.
 */
export function EChart({
  option,
  height = 300,
  title,
}: {
  option: EChartsOption;
  height?: number;
  title?: string;
}) {
  const theme = useStore((s) => s.theme);
  return (
    <div className="card p-4">
      {title && <h3 className="mb-3 text-sm font-medium text-muted">{title}</h3>}
      <ReactECharts
        // key forces re-theme when toggling dark/light
        key={theme}
        option={option}
        style={{ height, width: '100%' }}
        opts={{ renderer: 'canvas' }}
        notMerge
      />
    </div>
  );
}
