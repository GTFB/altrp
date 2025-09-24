'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Save, RefreshCcw, Search, List, ListTree, ChevronDown, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePathname, useSearchParams } from 'next/navigation';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function flattenJson(obj: any, prefix = ''): Record<string, JsonValue> {
  const result: Record<string, JsonValue> = {};
  for (const key of Object.keys(obj || {})) {
    const value = obj[key];
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenJson(value, nextKey));
    } else {
      result[nextKey] = value as JsonValue;
    }
  }
  return result;
}

function unflattenJson(flat: Record<string, JsonValue>): any {
  const result: any = {};
  for (const [path, value] of Object.entries(flat)) {
    const keys = path.split('.');
    let ref = result;
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (i === keys.length - 1) {
        ref[k] = value;
      } else {
        ref[k] = ref[k] ?? {};
        ref = ref[k];
      }
    }
  }
  return result;
}

function renderJsonTree(
  obj: any, 
  onValueChange: (path: string, value: string) => void, 
  filter: string = '',
  path: string = '',
  collapsedNodes: Set<string> = new Set(),
  onToggleCollapse: (path: string) => void
): JSX.Element[] {
  const result: JSX.Element[] = [];
  
  if (!obj || typeof obj !== 'object') {
    return result;
  }

  const entries = Object.entries(obj);
  const filteredEntries = filter 
    ? entries.filter(([key, value]) => 
        key.toLowerCase().includes(filter.toLowerCase()) ||
        String(value).toLowerCase().includes(filter.toLowerCase())
      )
    : entries;

  filteredEntries.forEach(([key, value], index) => {
    const currentPath = path ? `${path}.${key}` : key;
    const isLast = index === filteredEntries.length - 1;
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Object node
      const isExpanded = collapsedNodes.has(currentPath); // Node is expanded only if explicitly stored in collapsedNodes
      const hasChildren = Object.keys(value).length > 0;
      
      result.push(
        <div key={currentPath} className="ml-4">
          <div 
            className="flex items-center gap-2 py-1 cursor-pointer hover:bg-muted/50 rounded px-1"
            onClick={() => hasChildren && onToggleCollapse(currentPath)}
          >
            {hasChildren && (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )
            )}
            {!hasChildren && <div className="w-4 h-4" />}
            <span className="text-sm font-medium text-blue-600">{key}</span>
            <span className="text-xs text-muted-foreground">({Object.keys(value).length} keys)</span>
          </div>
          {isExpanded && (
            <div className="border-l-2 border-muted ml-2 pl-2">
              {renderJsonTree(value, onValueChange, filter, currentPath, collapsedNodes, onToggleCollapse)}
            </div>
          )}
        </div>
      );
    } else {
      // Leaf node
      result.push(
        <div key={currentPath} className="flex items-center gap-2 py-1 ml-4">
          <div className="w-4 h-4" />
          <div className="text-sm text-muted-foreground min-w-[30%] break-all">{key}</div>
          <Input
            value={String(value ?? '')}
            onChange={(e) => onValueChange(currentPath, e.target.value)}
            className="flex-1 h-8"
          />
        </div>
      );
    }
  });

  return result;
}

export default function LocalesAdminPage() {
  const [locales, setLocales] = useState<string[]>([]);
  const [supported, setSupported] = useState<string[]>([]);
  const [selectedLocale, setSelectedLocale] = useState<string>('');
  const [data, setData] = useState<Record<string, JsonValue>>({});
  const [raw, setRaw] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newLocaleCode, setNewLocaleCode] = useState('');
  const [isAddKeyOpen, setIsAddKeyOpen] = useState(false);
  const [newKeyPath, setNewKeyPath] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const ISO_639_1_CODES: string[] = [
    'aa','ab','ae','af','ak','am','an','ar','as','av','ay','az','ba','be','bg','bh','bi','bm','bn','bo','br','bs','ca','ce','ch','co','cr','cs','cu','cv','cy','da','de','dv','dz','ee','el','en','eo','es','et','eu','fa','ff','fi','fj','fo','fr','fy','ga','gd','gl','gn','gu','gv','ha','he','hi','ho','hr','ht','hu','hy','hz','ia','id','ie','ig','ii','ik','io','is','it','iu','ja','jv','ka','kg','ki','kj','kk','kl','km','kn','ko','kr','ks','ku','kv','kw','ky','la','lb','lg','li','ln','lo','lt','lu','lv','mg','mh','mi','mk','ml','mn','mr','ms','mt','my','na','nb','nd','ne','ng','nl','nn','no','nr','nv','ny','oc','oj','om','or','os','pa','pi','pl','ps','pt','qu','rm','rn','ro','ru','rw','sa','sc','sd','se','sg','si','sk','sl','sm','sn','so','sq','sr','ss','st','su','sv','sw','ta','te','tg','th','ti','tk','tl','tn','to','tr','ts','tt','tw','ty','ug','uk','ur','uz','ve','vi','vo','wa','wo','xh','yi','yo','za','zh','zu'
  ];

  const availableToCreate = useMemo(() => {
    const existing = new Set([...(locales || []), ...(supported || [])].map((c) => c.toLowerCase()));
    return ISO_639_1_CODES.filter((c) => !existing.has(c.toLowerCase())).sort();
  }, [locales, supported]);

  const displayNames = useMemo(() => new Intl.DisplayNames(['en'], { type: 'language' }), []);

  function getLanguageName(code: string): string {
    try {
      return displayNames.of(code) || code.toUpperCase();
    } catch {
      return code.toUpperCase();
    }
  }

  function countryCodeToFlag(countryCode: string): string {
    // Converts ISO 3166-1 alpha-2 to flag emoji via regional indicator symbols
    if (!countryCode || countryCode.length !== 2) return '🌐';
    const base = 0x1F1E6; // 'A'
    const A = 'A'.charCodeAt(0);
    const cc = countryCode.toUpperCase();
    const codePoints = [
      base + (cc.charCodeAt(0) - A),
      base + (cc.charCodeAt(1) - A),
    ];
    return String.fromCodePoint(...codePoints);
  }

  function flagFor(langCode: string): string {
    const emojiDirect: Record<string, string> = {
      en: '🇬🇧', ru: '🇷🇺', de: '🇩🇪', fr: '🇫🇷', es: '🇪🇸', it: '🇮🇹', pt: '🇵🇹',
      zh: '🇨🇳', ja: '🇯🇵', ko: '🇰🇷', ar: '🇸🇦', hi: '🇮🇳', uk: '🇺🇦', pl: '🇵🇱',
      nl: '🇳🇱', sv: '🇸🇪', no: '🇳🇴', da: '🇩🇰', fi: '🇫🇮', cs: '🇨🇿', sk: '🇸🇰',
      tr: '🇹🇷', el: '🇬🇷', he: '🇮🇱', fa: '🇮🇷', th: '🇹🇭', vi: '🇻🇳', id: '🇮🇩',
      ms: '🇲🇾', ro: '🇷🇴', hu: '🇭🇺', bg: '🇧🇬', sr: '🇷🇸', hr: '🇭🇷', sl: '🇸🇮',
      et: '🇪🇪', lv: '🇱🇻', lt: '🇱🇹', ga: '🇮🇪', kk: '🇰🇿', uz: '🇺🇿', az: '🇦🇿',
      ky: '🇰🇬', be: '🇧🇾', pt_br: '🇧🇷', en_us: '🇺🇸', zh_tw: '🇹🇼'
    } as Record<string, string>;
    if (emojiDirect[langCode]) return emojiDirect[langCode];

    const langToCountry: Record<string, string> = {
      en: 'GB', ru: 'RU', de: 'DE', fr: 'FR', es: 'ES', it: 'IT', pt: 'PT',
      zh: 'CN', ja: 'JP', ko: 'KR', ar: 'SA', hi: 'IN', uk: 'UA', pl: 'PL',
      nl: 'NL', sv: 'SE', no: 'NO', da: 'DK', fi: 'FI', cs: 'CZ', sk: 'SK',
      tr: 'TR', el: 'GR', he: 'IL', fa: 'IR', th: 'TH', vi: 'VN', id: 'ID',
      ms: 'MY', ro: 'RO', hu: 'HU', bg: 'BG', sr: 'RS', hr: 'HR', sl: 'SI',
      et: 'EE', lv: 'LV', lt: 'LT', ga: 'IE', kk: 'KZ', uz: 'UZ', az: 'AZ',
      ky: 'KG', be: 'BY'
    };
    const country = langToCountry[langCode as keyof typeof langToCountry];
    return country ? countryCodeToFlag(country) : '🌐';
  }

  const filteredEntries = useMemo(() => {
    const flat = flattenJson(JSON.parse(raw || '{}'));
    const q = filter.trim().toLowerCase();
    if (!q) return Object.entries(flat);
    return Object.entries(flat).filter(([k, v]) =>
      k.toLowerCase().includes(q) || String(v ?? '').toLowerCase().includes(q)
    );
  }, [raw, filter]);

  useEffect(() => {
    // Load view mode from localStorage
    const savedViewMode = localStorage.getItem('locales-view-mode') as 'tree' | 'list' | null;
    if (savedViewMode && (savedViewMode === 'tree' || savedViewMode === 'list')) {
      setViewMode(savedViewMode);
    }
    
    // Load collapsed nodes from localStorage
    const savedCollapsedNodes = localStorage.getItem('locales-collapsed-nodes');
    if (savedCollapsedNodes) {
      try {
        const parsed = JSON.parse(savedCollapsedNodes);
        setCollapsedNodes(new Set(parsed));
      } catch (e) {
        // If parsing fails, use empty set (all nodes collapsed by default)
        setCollapsedNodes(new Set());
      }
    } else {
      // By default, all nodes are collapsed
      setCollapsedNodes(new Set());
    }
    
    void loadLocales();
  }, []);

  useEffect(() => {
    const qp = searchParams?.get('locale');
    if (qp && qp !== selectedLocale) {
      setSelectedLocale(qp);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedLocale) {
      void loadLocale(selectedLocale);
    }
  }, [selectedLocale]);

  async function loadLocales() {
    try {
      const res = await fetch('/api/admin/locales');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed');
      setLocales(json.locales || []);
      setSupported(json.supported || []);
      const qp = searchParams?.get('locale');
      if (!selectedLocale) {
        if (qp) {
          setSelectedLocale(qp);
        } else if (json.locales?.[0] || json.supported?.[0]) {
          setSelectedLocale(json.locales?.[0] ?? json.supported?.[0]);
        }
      }
    } catch (e: any) {
      toast.error(e?.message || 'Failed to fetch locales');
    }
  }

  async function loadLocale(locale: string) {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/locales/${locale}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed');
      setData(json.data || {});
      setRaw(JSON.stringify(json.data || {}, null, 2));
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load locale');
    } finally {
      setLoading(false);
    }
  }

  function handleLocaleChange(value: string) {
    setSelectedLocale(value);
    const params = new URLSearchParams(searchParams?.toString());
    params.set('locale', value);
    const qs = params.toString();
    const url = `${pathname}${qs ? `?${qs}` : ''}`;
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', url);
    }
  }

  function handleViewModeChange(mode: 'tree' | 'list') {
    setViewMode(mode);
    localStorage.setItem('locales-view-mode', mode);
  }

  function handleTreeValueChange(path: string, value: string) {
    const flat = flattenJson(JSON.parse(raw || '{}'));
    flat[path] = value;
    setRaw(JSON.stringify(unflattenJson(flat), null, 2));
  }

  function toggleNodeCollapse(path: string) {
    const newCollapsed = new Set(collapsedNodes);
    if (newCollapsed.has(path)) {
      // Node is currently expanded, collapse it (remove from set)
      newCollapsed.delete(path);
    } else {
      // Node is currently collapsed, expand it (add to set)
      newCollapsed.add(path);
    }
    setCollapsedNodes(newCollapsed);
    localStorage.setItem('locales-collapsed-nodes', JSON.stringify([...newCollapsed]));
  }

  async function handleSaveFull() {
    try {
      setLoading(true);
      const parsed = JSON.parse(raw || '{}');
      const res = await fetch(`/api/admin/locales/${selectedLocale}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed');
      toast.success('Saved');
      setData(json.data || {});
      setRaw(JSON.stringify(json.data || {}, null, 2));
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateLocale() {
    setNewLocaleCode('');
    setIsCreateOpen(true);
  }

  async function confirmCreateLocale() {
    const code = newLocaleCode?.trim();
    if (!code) return;
    try {
      const res = await fetch('/api/admin/locales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: code }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed');
      toast.success('Locale created');
      await loadLocales();
      setSelectedLocale(code);
      setIsCreateOpen(false);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create locale');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Locales</h1>
          <p className="text-muted-foreground">JSON translations editor</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateLocale} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            New locale
          </Button>
          <Button onClick={() => { setNewKeyPath(''); setNewKeyValue(''); setIsAddKeyOpen(true); }} variant="secondary" className="cursor-pointer">
            Add key
          </Button>
          <Button onClick={() => loadLocales()} variant="outline" className="cursor-pointer">
            <RefreshCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="min-w-56">
              <Select value={selectedLocale} onValueChange={handleLocaleChange}>
              <SelectTrigger>
              <SelectValue placeholder="Select locale" />
                </SelectTrigger>
                <SelectContent>
                  {supported.map((code) => (
                    <SelectItem key={code} value={code}>{code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
            <Badge variant="secondary">Files: {locales.length}</Badge>
            <Badge variant="outline">Supported: {supported.length}</Badge>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-1 border rounded p-1">
                <Button
                  variant={viewMode === 'tree' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('tree')}
                  className="cursor-pointer"
                >
                  <ListTree className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleViewModeChange('list')}
                  className="cursor-pointer"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search by keys/values" className="pl-8" />
              </div>
              <Button onClick={handleSaveFull} disabled={!selectedLocale || loading} className="cursor-pointer">
                <Save className="w-4 h-4 mr-2" />
              Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent>
          <div className="mt-4">
            {viewMode === 'list' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredEntries.map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2 border rounded p-2">
                    <div className="text-xs text-muted-foreground min-w-[40%] break-all">{k}</div>
                    <Input
                      value={String(v ?? '')}
                      onChange={(e) => {
                        const flat = flattenJson(JSON.parse(raw || '{}'));
                        flat[k] = e.target.value;
                        setRaw(JSON.stringify(unflattenJson(flat), null, 2));
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {renderJsonTree(JSON.parse(raw || '{}'), handleTreeValueChange, filter, '', collapsedNodes, toggleNodeCollapse)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select locale to create</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={newLocaleCode} onValueChange={setNewLocaleCode}>
              <SelectTrigger>
                <SelectValue placeholder="Select locale" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {availableToCreate.map((code) => (
                  <SelectItem key={code} value={code}>
                    <span className="mr-2">{flagFor(code)}</span>
                    {getLanguageName(code)} ({code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={confirmCreateLocale} disabled={!newLocaleCode} className="cursor-pointer">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isAddKeyOpen} onOpenChange={setIsAddKeyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add key to all locales</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={newKeyPath} onChange={(e) => setNewKeyPath(e.target.value)} placeholder="key.path.like.common.hello" />
            <Input value={newKeyValue} onChange={(e) => setNewKeyValue(e.target.value)} placeholder="Default value" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddKeyOpen(false)} className="cursor-pointer">Cancel</Button>
            <Button onClick={async () => {
              const key = newKeyPath.trim();
              if (!key) {
                toast.error('Key is required');
                return;
              }
              try {
                setLoading(true);
                const res = await fetch('/api/admin/locales/add-key', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ key, value: newKeyValue }),
                });
                const json = await res.json();
                if (!json.success) throw new Error(json.error || 'Failed');
                toast.success('Key added');
                setIsAddKeyOpen(false);
                if (selectedLocale) {
                  await loadLocale(selectedLocale);
                }
              } catch (e: any) {
                toast.error(e?.message || 'Failed to add key');
              } finally {
                setLoading(false);
              }
            }} className="cursor-pointer" disabled={loading}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


