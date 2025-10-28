"use client";

import React, { useRef, useEffect, useState, memo } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import mermaid from "mermaid";
import { Plus, Minus, Maximize, Info } from "lucide-react";
import {
  getZoomSettings,
} from "../../lib/mermaid-config";

interface InteractiveMermaidProps {
  chart: string;
  id: string;
  theme: "light" | "dark";
  enableZoom?: boolean;
  settings?: {
    enableZoom?: boolean;
    height?: string;
    zoomMin?: number;
    zoomMax?: number;
    zoomInitial?: number;
    tooltipText?: string;
    disableTooltip?: boolean;
  };
}

type RenderState = "loading" | "success" | "error";

export const InteractiveMermaid = memo(function InteractiveMermaid({
  chart,
  id,
  theme,
  enableZoom = true,
  settings = {},
}: InteractiveMermaidProps) {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [renderState, setRenderState] = useState<RenderState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showControls, setShowControls] = useState(false);
  const [isWheelActive, setIsWheelActive] = useState(false);

  const zoomSettings = {
    minScale:
      settings.zoomMin ?? getZoomSettings(true, 0.5, 3, 1).min,
    maxScale:
      settings.zoomMax ?? getZoomSettings(true, 0.5, 3, 1).max,
  };

  useEffect(() => {
    let isMounted = true;

    const renderDiagram = async () => {
      if (!mermaidRef.current) return;

      setRenderState("loading");
      setErrorMessage("");

      try {
        const isDarkMode = theme === "dark";

        mermaid.initialize({
          startOnLoad: false,
          theme: isDarkMode ? "dark" : "base",
        });

        const cleanChart = chart
          .replace(/<br\s*\/?>/gi, " ")
          .replace(/-->/g, "-->")
          .replace(/<--/g, "<--")
          .replace(
            /::icon\(fa fa-(\w+)\)/g,
            (match, iconName) => `::icon(fa fa-${iconName})`,
          )
          .replace(/\s+::icon/g, "\n      ::icon")
          .replace(/\[([^\]]*[a-z][^\]]*)\]/gi, (match, content) => {
            if (content.includes('"') || content.includes("'")) return match;
            if (
              content.includes(" ") ||
              content.includes("-") ||
              content.includes("(") ||
              content.includes(")")
            ) {
              return `["${content.trim()}"]`;
            }
            return match;
          })
          .trim();

        const renderId = `mermaid-${id.replace(/[^a-zA-Z0-9-_]/g, "-")}-${Date.now()}`;
        const { svg } = await mermaid.render(renderId, cleanChart);

        if (isMounted && mermaidRef.current) {
          mermaidRef.current.innerHTML = svg;

          const svgElement = mermaidRef.current.querySelector("svg");
          if (svgElement) {
            // Remove hardcoded styles - let Mermaid use its themes
          }
          setRenderState("success");
        }
      } catch (error: unknown) {
        console.error("Mermaid rendering error:", error);
        if (isMounted) {
          if (mermaidRef.current) mermaidRef.current.innerHTML = "";
          setErrorMessage(
            error instanceof Error ? error.message : "Unknown error",
          );
          setRenderState("error");
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [chart, id, theme]);

  useEffect(() => {
    if (renderState === "success" && wrapperRef.current && mermaidRef.current) {
      const svgElement = mermaidRef.current.querySelector("svg");
      if (!svgElement) return;

      const wrapperRect = wrapperRef.current.getBoundingClientRect();
      const svgRect = svgElement.getBBox();

      if (
        svgRect.width === 0 ||
        svgRect.height === 0 ||
        wrapperRect.width === 0 ||
        wrapperRect.height === 0
      )
        return;

      // Calculate scale to fit container
      const scaleX = wrapperRect.width / svgRect.width;
      const scaleY = wrapperRect.height / svgRect.height;
      const newScale = Math.min(scaleX, scaleY) * 0.95;

      // Apply scale and centering only once during render
      svgElement.style.transform = `scale(${newScale})`;
      svgElement.style.transformOrigin = "center";
      svgElement.style.display = "block";
      svgElement.style.margin = "0 auto";
    }
  }, [renderState]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsWheelActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMouseEnter = () => setShowControls(true);
  const handleMouseLeave = () => setShowControls(false);

  const handleDiagramClick = () => {
    setIsWheelActive(true);
  };

  return (
    <div
      className={`mermaid-diagram-container ${!enableZoom ? "no-zoom" : ""} ${isWheelActive ? "is-active" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => setIsWheelActive(true)}
      onClick={handleDiagramClick}
      ref={wrapperRef}
    >
      {showControls &&
        !settings.disableTooltip &&
        enableZoom && (
          <div className="mermaid-tooltip">
            <Info size={14} />
            <span>
              {settings.tooltipText ||
                (isWheelActive
                  ? "Mouse wheel zoom active"
                  : "Click to activate zoom")}
            </span>
          </div>
        )}

      <div className="interactive-mermaid-wrapper">
        {enableZoom ? (
          <TransformWrapper
            key={id}
            minScale={zoomSettings.minScale}
            maxScale={zoomSettings.maxScale}
            limitToBounds={false}
            initialScale={1}
            wheel={{ step: 0.2, disabled: !isWheelActive }}
            panning={{ disabled: !isWheelActive }}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {showControls && (
                  <div className="zoom-controls show">
                    <button onClick={() => zoomIn()} aria-label="Zoom In">
                      <Plus size={16} />
                    </button>
                    <button onClick={() => zoomOut()} aria-label="Zoom Out">
                      <Minus size={16} />
                    </button>
                    <button
                      onClick={() => resetTransform()}
                      aria-label="Reset Scale"
                    >
                      <Maximize size={14} />
                    </button>
                  </div>
                )}

                <TransformComponent
                  wrapperStyle={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  contentStyle={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    ref={mermaidRef}
                    className="mermaid-svg-container"
                    style={{
                      visibility:
                        renderState === "success" ? "visible" : "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  />
                  {renderState === "loading" && (
                    <div className="mermaid-loading-placeholder">
                      🔄 Loading diagram...
                    </div>
                  )}
                  {renderState === "error" && (
                    <div className="text-red-500 p-4 border border-red-200 rounded bg-red-50 dark:bg-red-900/20">
                      <div className="font-semibold mb-2">
                        Diagram Display Error
                      </div>
                      <div className="text-sm mb-2">{errorMessage}</div>
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          Show Source Code
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                          {chart}
                        </pre>
                      </details>
                    </div>
                  )}
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        ) : (
          <div
            className="static-mermaid-content"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <div
              ref={mermaidRef}
              className="mermaid-svg-container"
              style={{
                visibility: renderState === "success" ? "visible" : "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
            {renderState === "loading" && (
              <div className="mermaid-loading-placeholder">
                🔄 Loading diagram...
              </div>
            )}
            {renderState === "error" && (
              <div className="text-red-500 p-4 border border-red-200 rounded bg-red-50 dark:bg-red-900/20">
                <div className="font-semibold mb-2">Diagram Display Error</div>
                <div className="text-sm mb-2">{errorMessage}</div>
                <details className="text-xs">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    Show Source Code
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                    {chart}
                  </pre>
                </details>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
