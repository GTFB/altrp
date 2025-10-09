"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart) {
      // Clear previous content
      ref.current.innerHTML = "";

      // Initialize Mermaid with classic settings
      mermaid.initialize({
        startOnLoad: false,
        theme: "default",
        securityLevel: "loose",
        fontFamily: 'Inter, "Font Awesome 6 Free", sans-serif',
        flowchart: {
          htmlLabels: true,
          curve: "basis",
        },
        mindmap: {
          // mindmap doesn't support htmlLabels
        },
        sequence: {
          diagramMarginX: 50,
          diagramMarginY: 10,
          actorMargin: 50,
          width: 150,
          height: 65,
          boxMargin: 10,
          boxTextMargin: 5,
          noteMargin: 10,
          messageMargin: 35,
          messageAlign: "center",
          mirrorActors: true,
          bottomMarginAdj: 1,
          useMaxWidth: true,
          rightAngles: false,
          showSequenceNumbers: false,
        },
        gantt: {
          titleTopMargin: 25,
          barHeight: 20,
          barGap: 4,
          topPadding: 50,
          leftPadding: 75,
          gridLineStartPadding: 35,
          fontSize: 11,
          sectionFontSize: 24,
          numberSectionStyles: 4,
        },
      });

      // Clean and fix diagram - minimal processing
      const cleanChart = chart
        .replace(/<br\s*\/?>/gi, " ") // Replace <br> with space
        .replace(/-->/g, "-->")
        .replace(/<--/g, "<--")
        // Only process Russian text that's not already quoted
        .replace(/\[([^\]]*[a-z][^\]]*)\]/gi, (match, content) => {
          // Skip if already has quotes
          if (content.includes('"') || content.includes("'")) {
            return match;
          }
          // Only quote if contains spaces or special characters
          if (
            content.includes(" ") ||
            content.includes("-") ||
            content.includes("(") ||
            content.includes(")")
          ) {
            return `["${content.trim()}"]`;
          }
          return match;
        });

      // Render diagram
      const renderId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      mermaid
        .render(renderId, cleanChart)
        .then(({ svg }) => {
          if (ref.current) {
            ref.current.innerHTML = svg;

            // Apply section-specific styling after rendering
            setTimeout(() => {
              const svgElement = ref.current?.querySelector("svg");
              if (svgElement) {
                console.log("Applying mindmap styling...");

                // Find all text elements and their parent groups
                const textElements = svgElement.querySelectorAll("text");
                textElements.forEach((textElement) => {
                  const text = textElement.textContent || "";
                  console.log("Found text:", text);

                  // Find the parent group that contains this text
                  let parentGroup = textElement.closest(
                    "g",
                  ) as SVGGElement | null;
                  if (!parentGroup) {
                    parentGroup =
                      textElement.parentElement as SVGGElement | null;
                  }

                  if (parentGroup) {
                    // Find shapes in the same group
                    const shapes = parentGroup.querySelectorAll(
                      "rect, circle, ellipse, polygon, path",
                    );

                    if (text.includes("Frontend")) {
                      console.log("Applying Frontend styling");
                      shapes.forEach((shape) => {
                        shape.setAttribute("fill", "#eff6ff");
                        shape.setAttribute("stroke", "#2563eb");
                        shape.setAttribute("stroke-width", "2");
                      });
                    } else if (text.includes("Backend")) {
                      console.log("Applying Backend styling");
                      shapes.forEach((shape) => {
                        shape.setAttribute("fill", "#fef2f2");
                        shape.setAttribute("stroke", "#dc2626");
                        shape.setAttribute("stroke-width", "2");
                      });
                    } else if (text.includes("Integrations")) {
                      console.log("Applying Integrations styling");
                      shapes.forEach((shape) => {
                        shape.setAttribute("fill", "#f0fdf4");
                        shape.setAttribute("stroke", "#16a34a");
                        shape.setAttribute("stroke-width", "2");
                      });
                    } else if (text.includes("DevOps")) {
                      console.log("Applying DevOps styling");
                      shapes.forEach((shape) => {
                        shape.setAttribute("fill", "#fffbeb");
                        shape.setAttribute("stroke", "#ca8a04");
                        shape.setAttribute("stroke-width", "2");
                      });
                    }
                  }
                });
              }
            }, 200);
          }
        })
        .catch((error) => {
          console.error("Mermaid rendering error:", error);
          console.error("Original chart:", chart);
          console.error("Cleaned chart:", cleanChart);

          if (ref.current) {
            ref.current.innerHTML = `
            <div class="text-red-500 p-4 border border-red-200 rounded bg-red-50 dark:bg-red-900/20">
              <div class="font-semibold mb-2">Diagram Display Error</div>
              <div class="text-sm mb-2">${error.message}</div>
              <details class="text-xs">
                <summary class="cursor-pointer text-blue-600 hover:text-blue-800">Show Source Code</summary>
                <pre class="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">${chart}</pre>
              </details>
            </div>
          `;
          }
        });
    }
  }, [chart]);

  return (
    <div className="my-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
      <div ref={ref} className="mermaid-container" />
    </div>
  );
}
