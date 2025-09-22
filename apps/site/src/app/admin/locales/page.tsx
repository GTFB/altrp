'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Save, RefreshCcw, Search } from 'lucide-react';
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
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
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


