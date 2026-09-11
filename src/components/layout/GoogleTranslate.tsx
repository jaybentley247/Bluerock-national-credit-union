'use client';

import { useEffect, useRef, useState } from 'react';
import { Languages, Search, ChevronDown, Check } from 'lucide-react';

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: new (options: Record<string, unknown>, elementId: string) => unknown;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

const ELEMENT_ID = 'google_translate_element';
const SCRIPT_ID = 'google-translate-script';
const COOKIE_NAME = 'googtrans';

// Full set of languages the Google Translate widget supports.
const LANGUAGES: { code: string; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'sq', name: 'Albanian' },
  { code: 'am', name: 'Amharic' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hy', name: 'Armenian' },
  { code: 'az', name: 'Azerbaijani' },
  { code: 'eu', name: 'Basque' },
  { code: 'be', name: 'Belarusian' },
  { code: 'bn', name: 'Bengali' },
  { code: 'bs', name: 'Bosnian' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'ca', name: 'Catalan' },
  { code: 'ceb', name: 'Cebuano' },
  { code: 'ny', name: 'Chichewa' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'zh-TW', name: 'Chinese (Traditional)' },
  { code: 'co', name: 'Corsican' },
  { code: 'hr', name: 'Croatian' },
  { code: 'cs', name: 'Czech' },
  { code: 'da', name: 'Danish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'eo', name: 'Esperanto' },
  { code: 'et', name: 'Estonian' },
  { code: 'tl', name: 'Filipino' },
  { code: 'fi', name: 'Finnish' },
  { code: 'fr', name: 'French' },
  { code: 'fy', name: 'Frisian' },
  { code: 'gl', name: 'Galician' },
  { code: 'ka', name: 'Georgian' },
  { code: 'de', name: 'German' },
  { code: 'el', name: 'Greek' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'ht', name: 'Haitian Creole' },
  { code: 'ha', name: 'Hausa' },
  { code: 'haw', name: 'Hawaiian' },
  { code: 'iw', name: 'Hebrew' },
  { code: 'hi', name: 'Hindi' },
  { code: 'hmn', name: 'Hmong' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'is', name: 'Icelandic' },
  { code: 'ig', name: 'Igbo' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ga', name: 'Irish' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'jw', name: 'Javanese' },
  { code: 'kn', name: 'Kannada' },
  { code: 'kk', name: 'Kazakh' },
  { code: 'km', name: 'Khmer' },
  { code: 'rw', name: 'Kinyarwanda' },
  { code: 'ko', name: 'Korean' },
  { code: 'ku', name: 'Kurdish (Kurmanji)' },
  { code: 'ky', name: 'Kyrgyz' },
  { code: 'lo', name: 'Lao' },
  { code: 'la', name: 'Latin' },
  { code: 'lv', name: 'Latvian' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'lb', name: 'Luxembourgish' },
  { code: 'mk', name: 'Macedonian' },
  { code: 'mg', name: 'Malagasy' },
  { code: 'ms', name: 'Malay' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'mt', name: 'Maltese' },
  { code: 'mi', name: 'Maori' },
  { code: 'mr', name: 'Marathi' },
  { code: 'mn', name: 'Mongolian' },
  { code: 'my', name: 'Myanmar (Burmese)' },
  { code: 'ne', name: 'Nepali' },
  { code: 'no', name: 'Norwegian' },
  { code: 'or', name: 'Odia (Oriya)' },
  { code: 'ps', name: 'Pashto' },
  { code: 'fa', name: 'Persian' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ro', name: 'Romanian' },
  { code: 'ru', name: 'Russian' },
  { code: 'sm', name: 'Samoan' },
  { code: 'gd', name: 'Scots Gaelic' },
  { code: 'sr', name: 'Serbian' },
  { code: 'st', name: 'Sesotho' },
  { code: 'sn', name: 'Shona' },
  { code: 'sd', name: 'Sindhi' },
  { code: 'si', name: 'Sinhala' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'so', name: 'Somali' },
  { code: 'es', name: 'Spanish' },
  { code: 'su', name: 'Sundanese' },
  { code: 'sw', name: 'Swahili' },
  { code: 'sv', name: 'Swedish' },
  { code: 'tg', name: 'Tajik' },
  { code: 'ta', name: 'Tamil' },
  { code: 'tt', name: 'Tatar' },
  { code: 'te', name: 'Telugu' },
  { code: 'th', name: 'Thai' },
  { code: 'tr', name: 'Turkish' },
  { code: 'tk', name: 'Turkmen' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'ur', name: 'Urdu' },
  { code: 'ug', name: 'Uyghur' },
  { code: 'uz', name: 'Uzbek' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'cy', name: 'Welsh' },
  { code: 'xh', name: 'Xhosa' },
  { code: 'yi', name: 'Yiddish' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'zu', name: 'Zulu' },
];

function readCookieLang(): string {
  if (typeof document === 'undefined') return 'en';
  const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
  if (!match) return 'en';
  const parts = decodeURIComponent(match[1]).split('/');
  return parts[2] || 'en';
}

// Google's widget persists (and re-applies on load) the language chosen via
// this cookie. Setting it and reloading is the mechanism the widget itself
// relies on internally, so it works even when the widget's own click-to-open
// UI is hidden and never rendered.
function setLanguageCookie(lang: string) {
  const host = window.location.hostname;
  const value = lang === 'en' ? '' : `/en/${lang}`;
  const clear = `${COOKIE_NAME}=; path=/; max-age=0`;
  document.cookie = clear;
  document.cookie = `${clear}; domain=.${host}`;
  if (value) {
    const set = `${COOKIE_NAME}=${value}; path=/; max-age=${60 * 60 * 24 * 365}`;
    document.cookie = set;
    document.cookie = `${set}; domain=.${host}`;
  }
}

export default function GoogleTranslate({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [lang, setLang] = useState('en');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLang(readCookieLang());

    const init = () => {
      if (!window.google?.translate) return;
      const mount = document.getElementById(ELEMENT_ID);
      if (!mount || mount.childElementCount > 0) return;
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en', autoDisplay: false },
        ELEMENT_ID
      );
    };

    if (window.google?.translate) {
      init();
    } else {
      window.googleTranslateElementInit = init;
      if (!document.getElementById(SCRIPT_ID)) {
        const script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    searchRef.current?.focus();
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const selectLanguage = (code: string) => {
    setOpen(false);
    setQuery('');
    if (code === lang) return;
    setLanguageCookie(code);
    window.location.reload();
  };

  const q = query.trim().toLowerCase();
  const filtered = q
    ? LANGUAGES.filter((l) => l.name.toLowerCase().includes(q) || l.code.toLowerCase() === q)
    : LANGUAGES;

  const currentName = LANGUAGES.find((l) => l.code === lang)?.name ?? 'English';

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`notranslate flex items-center gap-1.5 text-xs font-medium rounded-md border px-2 py-1 shadow-sm transition-colors ${
          dark
            ? 'bg-white/[0.06] border-white/15 text-slate-200 hover:bg-white/[0.1]'
            : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'
        }`}
      >
        <Languages className="h-4 w-4 shrink-0 opacity-70" />
        <span className="max-w-[7rem] truncate">{currentName}</span>
        <ChevronDown className={`h-3 w-3 opacity-60 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className={`notranslate absolute right-0 top-full mt-2 w-64 max-h-80 rounded-lg border shadow-xl z-[60] flex flex-col overflow-hidden ${
            dark ? 'bg-[#0d0d1a] border-white/10' : 'bg-white border-gray-200'
          }`}
        >
          <div className={`flex items-center gap-2 px-3 py-2 border-b shrink-0 ${dark ? 'border-white/10' : 'border-gray-100'}`}>
            <Search className={`h-4 w-4 shrink-0 ${dark ? 'text-slate-500' : 'text-gray-400'}`} />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search language..."
              className={`w-full bg-transparent text-sm outline-none ${
                dark ? 'text-slate-200 placeholder-slate-500' : 'text-gray-800 placeholder-gray-400'
              }`}
            />
          </div>
          <div className="overflow-y-auto">
            {filtered.length === 0 && (
              <p className={`px-3 py-4 text-xs text-center ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                No languages found
              </p>
            )}
            {filtered.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => selectLanguage(l.code)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left transition-colors ${
                  dark ? 'text-slate-200 hover:bg-white/[0.06]' : 'text-gray-700 hover:bg-gray-50'
                } ${l.code === lang ? (dark ? 'bg-white/[0.08] font-semibold' : 'bg-gray-50 font-semibold') : ''}`}
              >
                {l.name}
                {l.code === lang && <Check className="h-3.5 w-3.5 shrink-0 opacity-70" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Google's own widget mount point. Kept in the DOM (off-screen, not
          display:none/zero-size, so Google's internal layout math still
          runs cleanly) purely so the translation engine boots and reads
          the googtrans cookie above — its own visible UI is never shown. */}
      <div id={ELEMENT_ID} className="absolute -left-[9999px] top-0" />
    </div>
  );
}
