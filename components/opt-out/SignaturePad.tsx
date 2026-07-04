"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type SignaturePadProps = {
  id?: string;
  value: string;
  onChange: (dataUrl: string) => void;
  className?: string;
};

function trimCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const context = canvas.getContext("2d");
  if (!context) return canvas;

  const { width, height } = canvas;
  const { data } = context.getImageData(0, 0, width, height);
  let top = height;
  let left = width;
  let right = 0;
  let bottom = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha === 0) continue;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
      if (x < left) left = x;
      if (x > right) right = x;
    }
  }

  if (right < left || bottom < top) return canvas;

  const padding = 4;
  const cropLeft = Math.max(0, left - padding);
  const cropTop = Math.max(0, top - padding);
  const cropRight = Math.min(width - 1, right + padding);
  const cropBottom = Math.min(height - 1, bottom + padding);
  const cropWidth = cropRight - cropLeft + 1;
  const cropHeight = cropBottom - cropTop + 1;

  const trimmed = document.createElement("canvas");
  trimmed.width = cropWidth;
  trimmed.height = cropHeight;

  const trimmedContext = trimmed.getContext("2d");
  if (!trimmedContext) return canvas;

  trimmedContext.drawImage(
    canvas,
    cropLeft,
    cropTop,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight,
  );

  return trimmed;
}

export function SignaturePad({ id, value, onChange, className }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const skipNextValueSyncRef = useRef(false);
  const valueRef = useRef(value);
  valueRef.current = value;
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const [isEmpty, setIsEmpty] = useState(!value);

  const configureContext = (context: CanvasRenderingContext2D) => {
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 2.5;
    context.strokeStyle = "#111827";
  };

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    if (width === 0 || height === 0) return;

    const ratio = window.devicePixelRatio || 1;
    dimensionsRef.current = { width, height };
    canvas.width = width * ratio;
    canvas.height = height * ratio;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    configureContext(context);
  }, []);

  const drawValue = useCallback((dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const { width, height } = dimensionsRef.current;
    if (width === 0 || height === 0) return;

    if (!dataUrl) {
      context.clearRect(0, 0, width, height);
      setIsEmpty(true);
      return;
    }

    const image = new Image();
    image.onload = () => {
      context.clearRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      setIsEmpty(false);
    };
    image.src = dataUrl;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    resizeCanvas();

    const observer = new ResizeObserver(() => {
      resizeCanvas();
      drawValue(valueRef.current);
    });

    observer.observe(canvas);
    return () => observer.disconnect();
  }, [drawValue, resizeCanvas]);

  useEffect(() => {
    if (skipNextValueSyncRef.current) {
      skipNextValueSyncRef.current = false;
      return;
    }

    drawValue(value);
  }, [drawValue, value]);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    const point = getPoint(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const point = getPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    setIsEmpty(false);
  };

  const exportSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const trimmed = trimCanvas(canvas);
    skipNextValueSyncRef.current = true;
    onChange(trimmed.toDataURL("image/png"));
  };

  const finishDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !drawingRef.current) return;

    drawingRef.current = false;
    canvas.releasePointerCapture(event.pointerId);
    exportSignature();
  };

  const clear = () => {
    onChange("");
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="overflow-hidden rounded-md border border-navy-800/20 bg-white">
        <canvas
          id={id}
          ref={canvasRef}
          className="h-32 w-full touch-none cursor-crosshair"
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={finishDrawing}
          onPointerLeave={finishDrawing}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-navy-800/60">
          {isEmpty ? "Draw your signature above." : "Signature captured."}
        </p>
        <button
          type="button"
          onClick={clear}
          className="text-xs font-medium text-navy-800/70 underline-offset-2 hover:underline"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
