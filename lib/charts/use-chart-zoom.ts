import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";

export type ChartDataDomain = {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
};

export type PlotPixelBounds = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

type SelectionRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const MIN_DOMAIN_SPAN = 1e-6;
const MIN_BOX_PX = 8;

function domainsEqual(a: ChartDataDomain, b: ChartDataDomain) {
  return (
    a.xMin === b.xMin &&
    a.xMax === b.xMax &&
    a.yMin === b.yMin &&
    a.yMax === b.yMax
  );
}

function clampDomain(
  domain: ChartDataDomain,
  full: ChartDataDomain,
): ChartDataDomain {
  let { xMin, xMax, yMin, yMax } = domain;

  const xSpan = Math.max(xMax - xMin, MIN_DOMAIN_SPAN);
  const ySpan = Math.max(yMax - yMin, MIN_DOMAIN_SPAN);

  if (xMin < full.xMin) {
    xMin = full.xMin;
    xMax = xMin + xSpan;
  }
  if (xMax > full.xMax) {
    xMax = full.xMax;
    xMin = xMax - xSpan;
  }
  if (yMin < full.yMin) {
    yMin = full.yMin;
    yMax = yMin + ySpan;
  }
  if (yMax > full.yMax) {
    yMax = full.yMax;
    yMin = yMax - ySpan;
  }

  xMin = Math.max(full.xMin, xMin);
  xMax = Math.min(full.xMax, xMax);
  yMin = Math.max(full.yMin, yMin);
  yMax = Math.min(full.yMax, yMax);

  if (xMax - xMin < MIN_DOMAIN_SPAN) {
    const mid = (xMin + xMax) / 2;
    xMin = Math.max(full.xMin, mid - MIN_DOMAIN_SPAN / 2);
    xMax = Math.min(full.xMax, mid + MIN_DOMAIN_SPAN / 2);
  }
  if (yMax - yMin < MIN_DOMAIN_SPAN) {
    const mid = (yMin + yMax) / 2;
    yMin = Math.max(full.yMin, mid - MIN_DOMAIN_SPAN / 2);
    yMax = Math.min(full.yMax, mid + MIN_DOMAIN_SPAN / 2);
  }

  return { xMin, xMax, yMin, yMax };
}

export function generateZoomYTicks(yMin: number, yMax: number): number[] {
  const range = yMax - yMin;
  if (!Number.isFinite(range) || range <= 0) {
    return [yMin, yMax];
  }

  const step =
    range <= 8
      ? 1
      : range <= 20
        ? 2
        : range <= 50
          ? 5
          : range <= 100
            ? 10
            : range <= 200
              ? 20
              : 25;

  const start = Math.ceil(yMin / step) * step;
  const ticks: number[] = [];
  for (let value = start; value <= yMax + step * 0.001; value += step) {
    ticks.push(Number(value.toFixed(6)));
  }

  if (ticks.length < 2) {
    return [yMin, yMax].map((value) => Number(value.toFixed(2)));
  }

  return ticks;
}

type UseChartZoomOptions = {
  enabled: boolean;
  fullDomain: ChartDataDomain;
  plotBounds: PlotPixelBounds;
  containerRef: RefObject<HTMLElement | null>;
};

export function useChartZoom({
  enabled,
  fullDomain,
  plotBounds,
  containerRef,
}: UseChartZoomOptions) {
  const [viewDomain, setViewDomain] = useState(fullDomain);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(
    null,
  );
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const fullDomainRef = useRef(fullDomain);
  fullDomainRef.current = fullDomain;

  useEffect(() => {
    setViewDomain(fullDomain);
    setSelectionRect(null);
    dragStart.current = null;
  }, [
    fullDomain.xMin,
    fullDomain.xMax,
    fullDomain.yMin,
    fullDomain.yMax,
  ]);

  const isZoomed = !domainsEqual(viewDomain, fullDomain);

  const resetZoom = useCallback(() => {
    setViewDomain(fullDomainRef.current);
    setSelectionRect(null);
    dragStart.current = null;
  }, []);

  const pixelToData = useCallback(
    (px: number, py: number) => {
      const { left, right, top, bottom } = plotBounds;
      const plotWidth = right - left;
      const plotHeight = bottom - top;
      const x =
        viewDomain.xMin +
        ((px - left) / (plotWidth || 1)) * (viewDomain.xMax - viewDomain.xMin);
      const y =
        viewDomain.yMax -
        ((py - top) / (plotHeight || 1)) * (viewDomain.yMax - viewDomain.yMin);
      return { x, y };
    },
    [plotBounds, viewDomain],
  );

  const dataToPixelX = useCallback(
    (value: number) => {
      const { left, right } = plotBounds;
      const plotWidth = right - left;
      return (
        left +
        ((value - viewDomain.xMin) / (viewDomain.xMax - viewDomain.xMin || 1)) *
          plotWidth
      );
    },
    [plotBounds, viewDomain],
  );

  const dataToPixelY = useCallback(
    (value: number) => {
      const { top, bottom } = plotBounds;
      const plotHeight = bottom - top;
      return (
        top +
        ((viewDomain.yMax - value) / (viewDomain.yMax - viewDomain.yMin || 1)) *
          plotHeight
      );
    },
    [plotBounds, viewDomain],
  );

  const getLocalPointer = useCallback(
    (clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container) return null;
      const rect = container.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    [containerRef],
  );

  const isInsidePlot = useCallback(
    (x: number, y: number) => {
      const { left, right, top, bottom } = plotBounds;
      return x >= left && x <= right && y >= top && y <= bottom;
    },
    [plotBounds],
  );

  const onOverlayPointerDown = useCallback(
    (event: ReactPointerEvent<SVGRectElement>) => {
      if (!enabled || event.button !== 0) return;
      const local = getLocalPointer(event.clientX, event.clientY);
      if (!local || !isInsidePlot(local.x, local.y)) return;

      dragStart.current = { x: local.x, y: local.y };
      setSelectionRect({
        x: local.x,
        y: local.y,
        width: 0,
        height: 0,
      });
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [enabled, getLocalPointer, isInsidePlot],
  );

  const onOverlayPointerMove = useCallback(
    (event: ReactPointerEvent<SVGRectElement>) => {
      if (!dragStart.current) return;
      const local = getLocalPointer(event.clientX, event.clientY);
      if (!local) return;

      const start = dragStart.current;
      setSelectionRect({
        x: Math.min(start.x, local.x),
        y: Math.min(start.y, local.y),
        width: Math.abs(local.x - start.x),
        height: Math.abs(local.y - start.y),
      });
    },
    [getLocalPointer],
  );

  const finishBoxZoom = useCallback(
    (clientX: number, clientY: number) => {
      const start = dragStart.current;
      dragStart.current = null;
      setSelectionRect(null);

      if (!start || !enabled) return;

      const local = getLocalPointer(clientX, clientY);
      if (!local) return;

      const width = Math.abs(local.x - start.x);
      const height = Math.abs(local.y - start.y);
      if (width < MIN_BOX_PX || height < MIN_BOX_PX) return;

      const x1 = Math.min(start.x, local.x);
      const x2 = Math.max(start.x, local.x);
      const y1 = Math.min(start.y, local.y);
      const y2 = Math.max(start.y, local.y);

      const topLeft = pixelToData(x1, y1);
      const bottomRight = pixelToData(x2, y2);

      setViewDomain(
        clampDomain(
          {
            xMin: Math.min(topLeft.x, bottomRight.x),
            xMax: Math.max(topLeft.x, bottomRight.x),
            yMin: Math.min(topLeft.y, bottomRight.y),
            yMax: Math.max(topLeft.y, bottomRight.y),
          },
          fullDomainRef.current,
        ),
      );
    },
    [enabled, getLocalPointer, pixelToData],
  );

  const onOverlayPointerUp = useCallback(
    (event: ReactPointerEvent<SVGRectElement>) => {
      if (!dragStart.current) return;
      finishBoxZoom(event.clientX, event.clientY);
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    },
    [finishBoxZoom],
  );

  const onOverlayDoubleClick = useCallback(() => {
    if (!enabled) return;
    resetZoom();
  }, [enabled, resetZoom]);

  return {
    viewDomain,
    isZoomed,
    resetZoom,
    dataToPixelX,
    dataToPixelY,
    selectionRect,
    onOverlayPointerDown,
    onOverlayPointerMove,
    onOverlayPointerUp,
    onOverlayDoubleClick,
  };
}
