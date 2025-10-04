"use client";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useState, useEffect } from "react";
import { useLeftSectionState } from "@/components/providers/LeftSectionStateProvider";
import { useRightSectionState } from "@/components/providers/RightSectionStateProvider";

interface ResizableLayoutProps {
  leftSidebar: React.ReactNode;
  mainContent: React.ReactNode;
  rightSidebar: React.ReactNode;
  defaultLeftSize?: number;
  defaultRightSize?: number;
  minLeftSize?: number;
  minRightSize?: number;
  maxLeftSize?: number;
  maxRightSize?: number;
}

export function ResizableLayout({
  leftSidebar,
  mainContent,
  rightSidebar,
  defaultLeftSize = 20,
  defaultRightSize = 25,
  minLeftSize = 15,
  minRightSize = 20,
  maxLeftSize = 40,
  maxRightSize = 50,
}: ResizableLayoutProps) {
  const { leftSectionState } = useLeftSectionState();
  const { rightSectionState } = useRightSectionState();

  const [leftSize, setLeftSize] = useState(defaultLeftSize);
  const [rightSize, setRightSize] = useState(defaultRightSize);
  const [isLeftVisible, setIsLeftVisible] = useState(
    leftSectionState !== "close",
  );
  const [isRightVisible, setIsRightVisible] = useState(
    rightSectionState !== "close",
  );

  // Update visibility when state changes
  useEffect(() => {
    setIsLeftVisible(leftSectionState !== "close");
    setIsRightVisible(rightSectionState !== "close");
  }, [leftSectionState, rightSectionState]);

  // Calculate main content size based on sidebar visibility
  const mainSize =
    isLeftVisible && isRightVisible
      ? 100 - leftSize - rightSize
      : isLeftVisible
        ? 100 - leftSize
        : isRightVisible
          ? 100 - rightSize
          : 100;

  return (
    <div className="h-screen w-full">
      <PanelGroup direction="horizontal" className="h-full">
        {/* Left Sidebar */}
        {isLeftVisible && (
          <>
            <Panel
              defaultSize={leftSize}
              minSize={minLeftSize}
              maxSize={maxLeftSize}
              onResize={setLeftSize}
              className="min-w-0"
            >
              <div className="h-full overflow-y-auto">{leftSidebar}</div>
            </Panel>

            <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 transition-colors cursor-col-resize group">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-0.5 h-8 bg-muted-foreground/30 group-hover:bg-primary/70 rounded-full transition-colors" />
              </div>
            </PanelResizeHandle>
          </>
        )}

        {/* Main Content */}
        <Panel defaultSize={mainSize} minSize={30} className="min-w-0">
          <div className="h-full overflow-y-auto">{mainContent}</div>
        </Panel>

        {/* Right Sidebar */}
        {isRightVisible && (
          <>
            <PanelResizeHandle className="w-1 bg-border hover:bg-primary/50 transition-colors cursor-col-resize group">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-0.5 h-8 bg-muted-foreground/30 group-hover:bg-primary/70 rounded-full transition-colors" />
              </div>
            </PanelResizeHandle>

            <Panel
              defaultSize={rightSize}
              minSize={minRightSize}
              maxSize={maxRightSize}
              onResize={setRightSize}
              className="min-w-0"
            >
              <div className="h-full overflow-y-auto">{rightSidebar}</div>
            </Panel>
          </>
        )}
      </PanelGroup>
    </div>
  );
}
