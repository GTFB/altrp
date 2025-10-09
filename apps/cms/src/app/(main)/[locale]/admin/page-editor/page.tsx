'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Save, 
  Text, 
  Layout, 
  MoreVertical,
  ChevronUp,
  ChevronDown,
  Trash2,
  Edit
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import  {ComponentEditorDialog}  from '@/components/blocks-app/cms/ComponentEditorDialog';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
  DraggableStateSnapshot,
} from '@hello-pangea/dnd';
import { Block, AvailableBlock } from '@/types/page-editor';
import pageTemplate, {componentTemplate} from '@/lib/page-template';

// Available block types are loaded from API



// Block component
function BlockComponent({ 
  block, 
  onEdit, 
  onContextMenu 
}: { 
  block: Block; 
  onEdit: (block: Block) => void;
  onContextMenu: (action: string, blockId: string) => void;
}) {
  const renderContent = () => {
    switch (block.type) {
     
      default:
        return <div>{block.label}</div>;
    }
  };

  return (
    <div className="relative group border-2  border-blue-200 rounded-lg transition-colors ml-0 p-2">
      {renderContent()}
      <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity h-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="bg-white shadow-sm h-full">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onContextMenu('edit', block.id)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Component
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onContextMenu('move-up', block.id)}>
              <ChevronUp className="w-4 h-4 mr-2" />
              Move Up
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onContextMenu('move-down', block.id)}>
              <ChevronDown className="w-4 h-4 mr-2" />
              Move Down
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600"
              onClick={() => onContextMenu('delete', block.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function PageEditor() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [nextId, setNextId] = useState(1);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [availableBlocks, setAvailableBlocks] = useState<AvailableBlock[]>([]);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [openGroupsLoaded, setOpenGroupsLoaded] = useState(false);
  const [groupsHydrated, setGroupsHydrated] = useState(false);
  const [pagePath, setPagePath] = useState('');
  const [dialogMessage, setDialogMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [editorLoading, setEditorLoading] = useState(false);
  
  const orderedAvailableBlocks = useMemo(() => {
    const byGroup: Record<string, AvailableBlock[]> = {};
    availableBlocks.forEach((b) => {
      const g = b.group || 'Other';
      (byGroup[g] ||= []).push(b);
    });
    const groupNames = Object.keys(byGroup).sort();
    const ordered: { block: AvailableBlock; group: string }[] = [];
    groupNames.forEach((g) => byGroup[g].forEach((b) => ordered.push({ block: b, group: g })));
    return { byGroup, groupNames, ordered };
  }, [availableBlocks]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedBlocks = localStorage.getItem('page-editor-blocks');
    
    if (savedBlocks) {
      try {
        const parsedBlocks = JSON.parse(savedBlocks);
        setBlocks(parsedBlocks);
        const maxId = Math.max(...parsedBlocks.map((b: Block) => parseInt(b.id)), 0);
        setNextId(maxId + 1);
      } catch (error) {
        console.error('Error loading blocks from localStorage:', error);
      }
    }
    
    setIsLoaded(true);
  }, []);

  // Load available blocks from API
  useEffect(() => {
    const controller = new AbortController();
    const loadAvailable = async () => {
      try {
        const res = await fetch('/api/admin/components', { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Failed to load components: ${res.status}`);
        }
        const data: AvailableBlock[] = await res.json();
        setAvailableBlocks(Array.isArray(data) ? data : []);
      } catch (err) {
        const e = err as any;
        const isAbortError =
          e?.name === 'AbortError' ||
          e?.code === 'ABORT_ERR' ||
          typeof e?.message === 'string' && /aborted/i.test(e.message);
        if (!isAbortError) {
          console.error('Failed to fetch available blocks', err);
          setAvailableBlocks([]);
        }
      }
    };
    loadAvailable();
    return () => controller.abort('component-unmounted');
  }, []);

  // Load accordion open groups from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('page-editor-open-groups');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setOpenGroups(parsed.filter((v) => typeof v === 'string'));
        }
      }
    } catch (e) {
      // ignore
    }
    setOpenGroupsLoaded(true);
  }, []);

  // Reconcile saved open groups with available groups (keep only existing), then mark hydrated
  useEffect(() => {
    if (!openGroupsLoaded) return;
    if (orderedAvailableBlocks.groupNames.length === 0) return;
    setOpenGroups((prev) => prev.filter((g) => orderedAvailableBlocks.groupNames.includes(g)));
    setGroupsHydrated(true);
  }, [openGroupsLoaded, orderedAvailableBlocks.groupNames]);

  // Persist accordion open groups (only after hydration to avoid overriding stored value with [])
  useEffect(() => {
    if (!groupsHydrated) return;
    try {
      localStorage.setItem('page-editor-open-groups', JSON.stringify(openGroups));
    } catch (e) {
      // ignore
    }
  }, [openGroups, groupsHydrated]);

  // Save to localStorage whenever blocks change (but not on initial load)
  useEffect(() => {
    if (isLoaded && (blocks.length > 0 || localStorage.getItem('page-editor-blocks'))) {
      localStorage.setItem('page-editor-blocks', JSON.stringify(blocks));
    }
  }, [blocks, isLoaded]);

  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-600 text-sm">
          Page Editor is not available in production.
        </div>
      </div>
    );
  }

  const addBlock = (type: Block['type'], availableBlock: AvailableBlock) => {
    const newBlock: Block = {
      id: nextId.toString(),
      type,
      label: availableBlock.label,
      componentName: availableBlock.componentName,
      importString: availableBlock.importString,
      content: '',
      order: blocks.length,
    };
    const updatedBlocks = [...blocks, newBlock];
    setBlocks(updatedBlocks);
    setNextId(nextId + 1);
    
    // Save to localStorage immediately after adding block
    localStorage.setItem('page-editor-blocks', JSON.stringify(updatedBlocks));
  };

  const updateBlock = (updatedBlock: Block) => {
    setBlocks(blocks.map(block => 
      block.id === updatedBlock.id ? updatedBlock : block
    ));
  };

  const deleteBlock = (blockId: string) => {
    const updatedBlocks = blocks.filter(block => block.id !== blockId);
    setBlocks(updatedBlocks);
    
    // Save to localStorage immediately after deleting block
    localStorage.setItem('page-editor-blocks', JSON.stringify(updatedBlocks));
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;

    if (targetIndex >= 0 && targetIndex < blocks.length) {
      [newBlocks[blockIndex], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[blockIndex]];
      setBlocks(newBlocks);
      
      // Save to localStorage immediately after moving block
      localStorage.setItem('page-editor-blocks', JSON.stringify(newBlocks));
    }
  };

  const handleDragEnd = (result: DropResult) => {
    
    if (!result.destination) {
      return;
    }

    const { source, destination } = result;

    // If dragging from available blocks to page blocks
    if (source.droppableId === 'available-blocks' && destination.droppableId === 'page-blocks') {
      const blockType = result.draggableId.replace('available-', '') as Block['type'];
      const availableBlock = availableBlocks.find(b => b.type === blockType);
      if (!availableBlock) {
        return;
      }
      
      const newBlock: Block = {
        id: nextId.toString(),
        type: blockType,
        label: availableBlock.label,
        componentName: availableBlock.componentName,
        importString: availableBlock.importString,
        content: '',
        order: destination.index,
      };
      
      const newBlocks = Array.from(blocks);
      newBlocks.splice(destination.index, 0, newBlock);
      
      setBlocks(newBlocks);
      setNextId(nextId + 1);
      
      // Save to localStorage immediately after drag and drop
      localStorage.setItem('page-editor-blocks', JSON.stringify(newBlocks));
      return;
    }

    // If reordering within page blocks
    if (source.droppableId === 'page-blocks' && destination.droppableId === 'page-blocks') {
      if (source.index === destination.index) {
        return;
      }

      const newBlocks = Array.from(blocks);
      const [reorderedItem] = newBlocks.splice(source.index, 1);
      newBlocks.splice(destination.index, 0, reorderedItem);

      setBlocks(newBlocks);
      
      // Save to localStorage immediately after reordering
      localStorage.setItem('page-editor-blocks', JSON.stringify(newBlocks));
      return;
    }

  };

  const editBlock = async (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    setEditingBlock(block);
    setEditDialogOpen(true);
    setEditorLoading(true);

    try {
      const importMatch = block.importString?.match(/from ['"]([^'"]+)['"]/);
      if (!importMatch) {
        throw new Error('Cannot determine component path');
      }

      const importPath = importMatch[1];
      // @/components/widgets/button/button-primary -> button/button-primary.tsx
      const filePath = importPath.replace('@/components/widgets/', '').replace(/\/$/, '') + '.tsx';

      const response = await fetch(`/api/admin/components/${encodeURIComponent(filePath)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch component content');
      }

      const data = await response.json();
      setEditorContent(data.content);
    } catch (error) {
      console.error('Error loading component:', error);
      setDialogMessage('Failed to load component for editing');
      setDialogOpen(true);
      setEditDialogOpen(false);
    } finally {
      setEditorLoading(false);
    }
  };

  const saveComponentChanges = async (content: string) => {
    if (!editingBlock) return;

    try {
      const importMatch = editingBlock.importString?.match(/from ['"]([^'"]+)['"]/);
      if (!importMatch) {
        throw new Error('Cannot determine component path');
      }

      const importPath = importMatch[1];
      const filePath = importPath.replace('@/components/widgets/', '').replace(/\/$/, '') + '.tsx';

      const response = await fetch(`/api/admin/components/${encodeURIComponent(filePath)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to save component');
      }

      setEditDialogOpen(false);
      setEditingBlock(null);
      setEditorContent('');
      setDialogMessage('Component updated successfully');
      setDialogOpen(true);
    } catch (error) {
      console.error('Error saving component:', error);
      setDialogMessage('Failed to save component changes');
      setDialogOpen(true);
      throw error; 
    }
  };

  const handleContextMenu = (action: string, blockId: string) => {
    switch (action) {
      case 'edit':
        editBlock(blockId);
        break;
      case 'move-up':
        moveBlock(blockId, 'up');
        break;
      case 'move-down':
        moveBlock(blockId, 'down');
        break;
      case 'delete':
        deleteBlock(blockId);
        break;
    }
  };

  const buildPageCode = (): string => {
    const importsSet = new Set<string>();
    const contentParts: string[] = [];
    blocks
      .sort((a, b) => a.order - b.order)
      .forEach((b) => {
        if (b.importString) importsSet.add(b.importString);
        const componentJsx = componentTemplate.replace('_COMPONENT_', b.componentName);
        contentParts.push(componentJsx);
      });
    const imports = Array.from(importsSet).join('\n');
    const content = contentParts.join('\n');
    const code = pageTemplate
      .replace('__IMPORTS__', `${imports}\n`)
      .replace('__CONTENT__', content);
    return code;
  };

  const handleSave = async () => {
    if (!pagePath.trim()) {
      setDialogMessage('Path is required');
      setDialogOpen(true);
      return;
    }
    if (blocks.length === 0) {
      setDialogMessage('Editor is empty');
      setDialogOpen(true);
      return;
    }
    try {
      const code = buildPageCode();
      const res = await fetch('/api/admin/tsx/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: pagePath.trim(), code })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setDialogMessage(data?.error || `Failed to save (${res.status})`);
        setDialogOpen(true);
        return;
      }
      // success
      setBlocks([]);
      localStorage.removeItem('page-editor-blocks');
      setNextId(1);
      setPagePath('');
      setDialogMessage('Saved successfully');
      setDialogOpen(true);
    } catch (e: any) {
      setDialogMessage(e?.message || 'Unexpected error');
      setDialogOpen(true);
    }
  };

  const handleDownload = () => {
    try {
      // Build imports and content
      const importsSet = new Set<string>();
      const contentParts: string[] = [];
      blocks
        .sort((a, b) => a.order - b.order)
        .forEach((b) => {
          if (b.importString) importsSet.add(b.importString);
          const componentJsx = componentTemplate.replace('_COMPONENT_', b.componentName);
          contentParts.push(componentJsx);
        });

      const imports = Array.from(importsSet).join('\n');
      const content = contentParts.join('\n');
      const code = pageTemplate
        .replace('__IMPORTS__', `${imports}\n`)
        .replace('__CONTENT__', content);

      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Page.tsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Failed to generate file', e);
    }
  };

  const handleClear = () => {
    setShowClearDialog(true);
  };

  const confirmClear = () => {
    setBlocks([]);
    localStorage.removeItem('page-editor-blocks');
    setNextId(1);
    setShowClearDialog(false);
  };

  // Show loading state while data is being loaded
  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-65px)] flex flex-col bg-gray-50">
      {/* Top section with buttons */}
      <div className="h-16 bg-white border-b px-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold py-4">Page Editor</h1>
          <div className="flex gap-2 items-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClear}
              disabled={blocks.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={blocks.length === 0}
              >
                Download
              </Button>
              <input
                type="text"
                name="pagePath"
                value={pagePath}
                onChange={(e) => setPagePath(e.target.value)}
              placeholder="Page path..."
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={blocks.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
      </div>

      <DragDropContext 
        onDragEnd={handleDragEnd}
        onDragStart={() => {}}
      >
        <div className="flex-1 flex  ">
          {/* Main content area */}
          <div className="flex-1 p-4 overflow-auto  max-h-[calc(100vh-130px)] "  >
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Page Content
                    <span className="text-sm font-normal text-gray-500">
                      {blocks.length} block{blocks.length !== 1 ? 's' : ''}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Droppable droppableId="page-blocks">
                    {(provided: DroppableProvided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`space-y-4 min-h-[200px] transition-colors ${
                          snapshot.isDraggingOver 
                            ? 'bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg' 
                            : ''
                        }`}
                      >
                        {blocks.map((block, index) => (
                          <Draggable key={block.id} draggableId={block.id} index={index}>
                            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`${
                                  snapshot.isDragging 
                                    ? 'shadow-2xl rotate-2 scale-105 z-50' 
                                    : 'hover:shadow-md'
                                } transition-all duration-200 relative`}
                              >
                                {/* Drag handle */}
                                <div
                                  {...provided.dragHandleProps}
                                  className="absolute -left-8 top-2 w-6 h-6 bg-blue-100 hover:bg-blue-200 rounded flex items-center justify-center cursor-move opacity-60 hover:opacity-100 transition-all z-10"
                                  title="Drag to reorder"
                                >
                                  <div className="w-3 h-3 grid grid-cols-2 gap-0.5">
                                    <div className="w-1 h-1 bg-blue-600 rounded-sm"></div>
                                    <div className="w-1 h-1 bg-blue-600 rounded-sm"></div>
                                    <div className="w-1 h-1 bg-blue-600 rounded-sm"></div>
                                    <div className="w-1 h-1 bg-blue-600 rounded-sm"></div>
                                  </div>
                                </div>
                                <BlockComponent
                                  block={block}
                                  onEdit={updateBlock}
                                  onContextMenu={handleContextMenu}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {blocks.length === 0 && (
                          <div className={`text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg transition-colors ${
                            snapshot.isDraggingOver ? 'border-blue-400 bg-blue-25' : ''
                          }`}>
                            <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>{snapshot.isDraggingOver ? 'Drop block here' : 'Drop blocks here or add from the sidebar'}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right sidebar - Available blocks */}
          <div className="w-64 bg-white border-l p-4 h-full overflow-y-auto max-h-[calc(100vh-130px)]">
            <h2 className="text-lg font-medium mb-4">Available Blocks</h2>
            <div className="mb-4 p-2 bg-gray-50 rounded text-sm text-gray-600">
              Current blocks: {blocks.length}
            </div>
            {/** Grouped available blocks */}
            {/* Build grouped structure based on optional group field */}
            {/* Using a memo to avoid recalculation on every render */}
            
            <Droppable 
              droppableId="available-blocks" 
              isDropDisabled={true}
              renderClone={(provided, snapshot, rubric) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className="w-full flex items-center justify-start px-3 py-2 border border-gray-300 rounded-md bg-white shadow-lg scale-105 z-50 transition-all duration-200"
                >
                  <Text className="w-4 h-4" />
                  <span className="ml-2">{orderedAvailableBlocks.ordered[rubric.source.index]?.block.label}</span>
                </div>
              )}
            >
              {(provided: DroppableProvided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {(
                    () => {
                      const { ordered, groupNames } = orderedAvailableBlocks;
                      const indexByKey: Record<string, number> = {};
                      const makeKey = (b: AvailableBlock) => `${b.group || 'Other'}::${b.type}`;
                      ordered.forEach((item, idx) => { indexByKey[makeKey(item.block)] = idx; });
                      return (
                        <Accordion type="multiple" className="space-y-2" value={openGroups} onValueChange={(val) => setOpenGroups(val as string[])}>
                          {groupNames.map((groupName) => {
                            const itemsInGroup = ordered.filter((it) => it.group === groupName);
                            return (
                              <AccordionItem key={groupName} value={groupName}>
                                <AccordionTrigger className="text-xs uppercase tracking-wide text-gray-600">{groupName}</AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-2">
                                    {itemsInGroup.map(({ block }) => {
                                      const index = indexByKey[makeKey(block)];
                                      return (
                                        <Draggable 
                                          key={`available-${block.type}`} 
                                          draggableId={`available-${block.type}`} 
                                          index={index}
                                        >
                                          {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className={`${
                                                snapshot.isDragging 
                                                  ? 'opacity-50' 
                                                  : ''
                                              } transition-all duration-200`}
                                              style={{
                                                ...provided.draggableProps.style,
                                                visibility: 'visible',
                                                opacity: snapshot.isDragging ? 0.5 : 1,
                                                pointerEvents: snapshot.isDragging ? 'none' : 'auto',
                                                display: 'block',
                                                width: '100%'
                                              }}
                                            >
                                              <div
                                                {...provided.dragHandleProps}
                                                className="w-full flex items-center justify-start px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-blue-50 hover:border-blue-300 cursor-move transition-colors text-sm font-medium"
                                                onClick={(e) => {
                                                  e.preventDefault();
                                                  addBlock(block.type as Block['type'], block);
                                                }}
                                              >
                                                <Text className="w-4 h-4" />
                                                <span className="ml-2">{block.label}</span>
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      );
                                    })}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            );
                          })}
                        </Accordion>
                      );
                    }
                  )()}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>

      {/* Clear confirmation dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all blocks?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete all blocks from your page. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmClear}
              className="bg-red-600 hover:bg-red-700"
            >
              Clear All Blocks
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Info/Error dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Info</AlertDialogTitle>
            <AlertDialogDescription>
              {dialogMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setDialogOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Component Editor Dialog */}
      <ComponentEditorDialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setEditingBlock(null);
            setEditorContent('');
          }
        }}
        block={editingBlock}
        initialContent={editorContent}
        onSave={saveComponentChanges}
      />
    </div>
  );
}