import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardPaste, 
  Settings, 
  ArrowLeft, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown, 
  Delete, 
  CornerDownLeft, 
  Globe,
  Plus,
  ExternalLink,
  ChevronUp,
  X,
  ArrowRightToLine,
  Copy,
  MousePointer2,
  History,
  Smile,
  Languages,
  Loader2,
  Send,
  Undo2,
  Redo2,
  Command
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---
type Theme = 'onyx' | 'material-dark' | 'material-light' | 'oled' | 'pastel-pink';
type KeyboardLayout = 'QWERTY' | 'AZERTY' | 'DVORAK';

interface AppShortcut {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

// --- Themes Configuration ---
const THEMES = {
  'onyx': {
    bg: 'bg-[#0d0d0d]',
    key: 'bg-[#1d1d1d]',
    keyText: 'text-[#e0e0e0]',
    accent: 'bg-[#10b981]',
    accentText: 'text-black',
    specialKey: 'bg-[#252525]',
    topBar: 'bg-[#111111]',
    inputBg: 'bg-[#0d0d0d]',
    inputText: 'text-[#e0e0e0]'
  },
  'material-dark': {
    bg: 'bg-[#1a1c1e]',
    key: 'bg-[#2d3135]',
    keyText: 'text-white',
    accent: 'bg-[#10b981]',
    accentText: 'text-black',
    specialKey: 'bg-[#3c4043]',
    topBar: 'bg-[#1a1c1e]',
    inputBg: 'bg-[#1a1c1e]',
    inputText: 'text-white'
  },
  'material-light': {
    bg: 'bg-[#f1f3f4]',
    key: 'bg-white',
    keyText: 'text-gray-800',
    accent: 'bg-blue-500',
    accentText: 'text-white',
    specialKey: 'bg-[#e8eaed]',
    topBar: 'bg-[#f1f3f4]',
    inputBg: 'bg-white',
    inputText: 'text-gray-900'
  },
  'oled': {
    bg: 'bg-black',
    key: 'bg-[#1a1a1a]',
    keyText: 'text-white',
    accent: 'bg-white',
    accentText: 'text-black',
    specialKey: 'bg-[#262626]',
    topBar: 'bg-black',
    inputBg: 'bg-black',
    inputText: 'text-white'
  },
  'pastel-pink': {
    bg: 'bg-[#f9e6e6]',
    key: 'bg-white',
    keyText: 'text-[#d88]',
    accent: 'bg-[#ffb3b3]',
    accentText: 'text-white',
    specialKey: 'bg-[#fff5f5]',
    topBar: 'bg-[#f9e6e6]',
    inputBg: 'bg-white',
    inputText: 'text-[#d88]'
  }
};

// --- Keyboard Layouts ---
const LAYOUTS: Record<KeyboardLayout, string[][]> = {
  QWERTY: [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['SHIFT', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'BACKSPACE']
  ],
  AZERTY: [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm'],
    ['SHIFT', 'w', 'x', 'c', 'v', 'b', 'n', 'BACKSPACE']
  ],
  DVORAK: [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['\'', ',', '.', 'p', 'y', 'f', 'g', 'c', 'r', 'l'],
    ['a', 'o', 'e', 'u', 'i', 'd', 'h', 't', 'n', 's'],
    ['SHIFT', ';', 'q', 'j', 'k', 'x', 'b', 'm', 'w', 'z', 'BACKSPACE']
  ]
};

const TRANSLATION_LANGUAGES = ['Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Korean', 'Italian', 'Portuguese'];

const PREDICTIONS: Record<string, string[]> = {
  'i': ['am', 'have', 'think'],
  'how': ['are', 'is', 'much'],
  'what': ['is', 'are', 'do'],
  'are': ['you', 'we', 'they'],
  'you': ['are', 'can', 'should'],
  'the': ['best', 'first', 'only'],
  'a': ['lot', 'little', 'good'],
  'and': ['then', 'the', 'I'],
  'this': ['is', 'time', 'way'],
  'is': ['the', 'a', 'not'],
  'it': ['is', 'was', 'will'],
  'to': ['be', 'do', 'the'],
  'my': ['name', 'friend', 'home'],
  'hello': ['there', 'world', 'my'],
  'good': ['morning', 'night', 'luck'],
  'in': ['the', 'my', 'a']
};

const EMOJI_LIST = [
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😮‍💨', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠'
];

export default function App() {
  const [text, setText] = useState('');
  const [cursorPos, setCursorPos] = useState(0);
  const [isShift, setIsShift] = useState(false);
  const [theme, setTheme] = useState<Theme>('onyx');
  const [layout, setLayout] = useState<KeyboardLayout>('QWERTY');
  const [showSettings, setShowSettings] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showClipboard, setShowClipboard] = useState(false);
  const [showTranslateMenu, setShowTranslateMenu] = useState(false);
  const [isTranslateEnabled, setIsTranslateEnabled] = useState(false);
  const [isCtrl, setIsCtrl] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState(TRANSLATION_LANGUAGES[0]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState<string | null>(null);
  const [clipboardHistory, setClipboardHistory] = useState<string[]>([]);
  const [history, setHistory] = useState<{text: string, pos: number}[]>([{text: '', pos: 0}]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [predictions, setPredictions] = useState<string[]>([]);
  const [shortcuts, setShortcuts] = useState<AppShortcut[]>([
    { id: '1', name: 'Google', url: 'https://google.com' },
    { id: '2', name: 'WhatsApp', url: 'https://web.whatsapp.com' }
  ]);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const currentTheme = THEMES[theme];

  // Keep focus and handle cursor
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setSelectionRange(cursorPos, cursorPos);
    }
  }, [cursorPos]);

  useEffect(() => {
    const defaultPredictions = ['I', 'the', 'and'];
    if (!text.trim()) {
      setPredictions(defaultPredictions);
      return;
    }
    const words = text.slice(0, cursorPos).trim().split(/\s+/);
    const lastWord = words[words.length - 1].toLowerCase();
    
    if (PREDICTIONS[lastWord]) {
      setPredictions(PREDICTIONS[lastWord]);
    } else {
      setPredictions(defaultPredictions);
    }
  }, [text, cursorPos]);

  const pushHistory = (newText: string, newPos: number) => {
    const newHistory = history.slice(0, historyIndex + 1);
    if (newHistory[newHistory.length - 1].text !== newText) {
      newHistory.push({text: newText, pos: newPos});
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    setText(newText);
    setCursorPos(newPos);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const state = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setText(state.text);
      setCursorPos(state.pos);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const state = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setText(state.text);
      setCursorPos(state.pos);
    }
  };

  const applyPrediction = (word: string) => {
    const textBefore = text.slice(0, cursorPos);
    const textAfter = text.slice(cursorPos);
    const needsSpaceBefore = textBefore.length > 0 && !textBefore.endsWith(' ');
    const newAddition = (needsSpaceBefore ? ' ' : '') + word + ' ';
    
    const newText = textBefore + newAddition + textAfter;
    pushHistory(newText, textBefore.length + newAddition.length);
  };

  const handleKeyPress = async (key: string) => {
    let newText = text;
    let newPos = cursorPos;

    if (key === 'SHIFT') {
      setIsShift(!isShift);
      return;
    }

    if (key === 'BACKSPACE') {
      if (cursorPos > 0) {
        newText = text.slice(0, cursorPos - 1) + text.slice(cursorPos);
        newPos = cursorPos - 1;
      }
    } else if (key === 'ENTER') {
      if (isTranslateEnabled) {
        if (!translatedText) {
          // Phase 1: Translate
          if (!text.trim()) return;
          setIsTranslating(true);
          try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
            const response = await ai.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: `Translate the following text to ${targetLanguage}. Return ONLY the translated text: "${text}"`,
            });
            const result = response.text || "Translation failed";
            setOriginalText(text);
            setTranslatedText(result);
            setText(result.trim());
            setCursorPos(result.trim().length);
            setHistory([{text: result.trim(), pos: result.trim().length}]);
            setHistoryIndex(0);
          } catch (err) {
            console.error(err);
          } finally {
            setIsTranslating(false);
          }
          return;
        } else {
          // Phase 2: Send
          console.log("Sending translated text:", text);
          setText('');
          setCursorPos(0);
          setTranslatedText(null);
          setOriginalText(null);
          return;
        }
      } else {
        newText = text.slice(0, cursorPos) + '\n' + text.slice(cursorPos);
        newPos = cursorPos + 1;
      }
    } else {
      const char = isShift ? key.toUpperCase() : key.toLowerCase();
      newText = text.slice(0, cursorPos) + char + text.slice(cursorPos);
      newPos = cursorPos + char.length;
      if (isShift) setIsShift(false);
    }

    pushHistory(newText, newPos);
  };

  const moveCursor = (dir: 'left' | 'right' | 'up' | 'down') => {
    const lines = text.split('\n');
    let currentLine = 0;
    let charInLine = 0;
    let count = 0;

    for (let i = 0; i < lines.length; i++) {
      if (cursorPos <= count + lines[i].length) {
        currentLine = i;
        charInLine = cursorPos - count;
        break;
      }
      count += lines[i].length + 1;
    }

    if (dir === 'left') {
      setCursorPos(Math.max(0, cursorPos - 1));
    } else if (dir === 'right') {
      setCursorPos(Math.min(text.length, cursorPos + 1));
    } else if (dir === 'up') {
      if (currentLine > 0) {
        const targetLine = currentLine - 1;
        let newCount = 0;
        for (let i = 0; i < targetLine; i++) newCount += lines[i].length + 1;
        setCursorPos(newCount + Math.min(charInLine, lines[targetLine].length));
      }
    } else if (dir === 'down') {
      if (currentLine < lines.length - 1) {
        const targetLine = currentLine + 1;
        let newCount = 0;
        for (let i = 0; i <= currentLine; i++) newCount += lines[i].length + 1;
        setCursorPos(newCount + Math.min(charInLine, lines[targetLine].length));
      }
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const newText = text.slice(0, cursorPos) + clipboardText + text.slice(cursorPos);
      pushHistory(newText, cursorPos + clipboardText.length);
    } catch (err) {
      console.error('Failed to paste:', err);
      // Fallback for demo if system clipboard is blocked
      if (clipboardHistory.length > 0) {
        const last = clipboardHistory[0];
        const newText = text.slice(0, cursorPos) + last + text.slice(cursorPos);
        pushHistory(newText, cursorPos + last.length);
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setClipboardHistory(prev => [text, ...prev.slice(0, 9)]);
    } catch (err) {
      console.error('Failed to copy:', err);
      setClipboardHistory(prev => [text, ...prev.slice(0, 9)]);
    }
  };

  const handleSelectAll = () => {
    if (inputRef.current) {
      inputRef.current.select();
      setCursorPos(text.length);
    }
  };

  const handleToggleTranslate = () => {
    if (isTranslateEnabled && translatedText && originalText) {
      // Revert if unselecting during translation phase
      pushHistory(originalText, originalText.length);
      setHistory([{text: originalText, pos: originalText.length}]);
      setHistoryIndex(0);
    }
    setIsTranslateEnabled(!isTranslateEnabled);
    if (!isTranslateEnabled) {
      setShowTranslateMenu(true);
    } else {
      setShowTranslateMenu(false);
      setTranslatedText(null);
      setOriginalText(null);
    }
  };

  const toggleLayout = () => {
    const sequence: KeyboardLayout[] = ['QWERTY', 'AZERTY', 'DVORAK'];
    const nextIndex = (sequence.indexOf(layout) + 1) % sequence.length;
    setLayout(sequence[nextIndex]);
  };

  const openLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className={`fixed inset-0 flex flex-col font-sans selection:bg-[#10b981]/30 ${currentTheme.bg}`}>
      {/* Simulation Frame Header */}
      <div className={`p-6 flex items-center justify-between border-b ${theme === 'onyx' ? 'border-white/5' : 'border-black/5'}`}>
        <div className="flex flex-col">
          <h1 className={`text-3xl font-light tracking-tight font-serif ${currentTheme.inputText}`}>
            Radkeyboard<span className="text-[#10b981] italic"> v1.0</span>
          </h1>
          <p className="text-[#71717a] text-[10px] uppercase tracking-[0.2em] font-medium">Professional Android Input Method</p>
        </div>
        <button 
          onClick={() => setShowSettings(true)}
          className={`p-2.5 rounded-full transition-all flex items-center justify-center ${currentTheme.specialKey} ${currentTheme.keyText} border border-white/5 hover:border-[#10b981]/50 shadow-lg`}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area (Input Field) */}
      <main className="flex-1 p-6 flex flex-col gap-4 overflow-hidden items-center justify-center">
        <div className={`w-full max-w-2xl flex-1 rounded-[32px] p-8 ${currentTheme.inputBg} border border-white/5 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden`}>
           {/* Sophisticated Background Element */}
           <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#10b981]/5 rounded-full blur-3xl pointer-events-none" />
          
          <textarea
            ref={inputRef}
            className={`w-full h-full bg-transparent resize-none outline-none text-2xl font-light leading-relaxed font-serif italic ${currentTheme.inputText} placeholder:opacity-20`}
            placeholder="Type with intention..."
            value={text}
            onChange={(e) => {
              pushHistory(e.target.value, e.target.selectionStart);
            }}
            onSelect={(e) => {
              setCursorPos((e.target as HTMLTextAreaElement).selectionStart);
            }}
          />
          {/* Animated Cursor Hint */}
          {text.length === 0 && (
            <div className="absolute inset-x-8 top-8 pointer-events-none opacity-40">
              <div className={`w-0.5 h-8 animate-pulse ${currentTheme.accent}`} />
            </div>
          )}
        </div>
      </main>

      {/* KEYBOARD SECTION */}
      <div className={`w-full max-w-3xl mx-auto rounded-t-[48px] shadow-[0_-40px_100px_-20px_rgba(0,0,0,0.6)] overflow-hidden border-t border-white/5 ${theme === 'onyx' ? 'bg-[#111111]' : currentTheme.bg}`}>
        
        {/* TOP ROW: Specialty Buttons */}
        <div className={`flex items-center gap-1.5 p-3 ${theme === 'onyx' ? 'bg-[#111111]' : currentTheme.topBar} border-b border-white/5 overflow-x-auto no-scrollbar`}>
          <div className="flex gap-1.5 shrink-0">
            <TopRowButton 
              onClick={() => handleKeyPress('\t')} 
              icon={<ArrowRightToLine className="w-3.5 h-3.5" />} 
              label="Tab" 
              theme={currentTheme} 
              onyx={theme === 'onyx'} 
            />
            <TopRowButton 
              onClick={() => setIsCtrl(!isCtrl)} 
              icon={<Command className="w-3.5 h-3.5" />} 
              label="Ctrl" 
              theme={currentTheme} 
              onyx={theme === 'onyx'} 
              active={isCtrl}
            />
            <TopRowButton 
              onClick={handleSelectAll} 
              icon={<MousePointer2 className="w-3.5 h-3.5" />} 
              label="Select All" 
              theme={currentTheme} 
              onyx={theme === 'onyx'} 
            />
            <TopRowButton 
              onClick={handleCopy} 
              icon={<Copy className="w-3.5 h-3.5" />} 
              label="Copy" 
              theme={currentTheme} 
              onyx={theme === 'onyx'} 
            />
            <TopRowButton 
              onClick={handlePaste} 
              icon={<ClipboardPaste className="w-3.5 h-3.5" />} 
              label="Paste" 
              theme={currentTheme} 
              onyx={theme === 'onyx'} 
            />
            <TopRowButton 
              onClick={() => setShowClipboard(!showClipboard)} 
              icon={<History className="w-3.5 h-3.5" />} 
              label="History" 
              theme={currentTheme} 
              onyx={theme === 'onyx'} 
              active={showClipboard}
            />
          </div>
          
          <div className="h-4 w-px bg-white/10 mx-1 shrink-0" />
          
          <div className="flex gap-1.5 shrink-0">
            {shortcuts.map((s) => (
              <motion.button
                key={s.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => openLink(s.url)}
                className={`w-12 h-10 rounded-lg flex items-center justify-center transition-all ${currentTheme.specialKey} border border-white/5 opacity-40 hover:opacity-100 hover:bg-white/[0.03]`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${s.name === 'Google' ? 'bg-blue-500/10' : 'bg-green-500/10'}`}>
                   <div className={`w-2 h-2 rounded-sm ${s.name === 'Google' ? 'bg-blue-400' : 'bg-green-400'}`} />
                </div>
              </motion.button>
            ))}

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSettings(true)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${currentTheme.specialKey} text-[#71717a] border border-white/5`}
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* PREDICTION BAR */}
        <div className={`flex items-center justify-center gap-2 p-2 px-3 border-b border-white/5 ${theme === 'onyx' ? 'bg-[#151515]' : currentTheme.topBar} min-h-[44px]`}>
          <AnimatePresence>
            {predictions.map((p, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => applyPrediction(p)}
                className={`flex-1 max-w-[120px] py-1.5 px-3 rounded-lg text-sm font-medium transition-colors ${currentTheme.specialKey} border border-white/5 hover:bg-white/10 ${currentTheme.keyText}`}
              >
                {p}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* CLIPBOARD HISTORY POPUP */}
        <AnimatePresence>
          {showClipboard && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#1a1a1a] border-b border-white/5 overflow-hidden"
            >
              <div className="p-4 flex flex-col gap-2">
                <h4 className="text-[10px] uppercase tracking-widest text-[#71717a] font-bold mb-1">Recent Clips</h4>
                {clipboardHistory.length === 0 ? (
                  <p className="text-xs text-[#71717a] italic p-2">History is empty...</p>
                ) : (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {clipboardHistory.map((clip, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          const newText = text.slice(0, cursorPos) + clip + text.slice(cursorPos);
                          setText(newText);
                          setCursorPos(cursorPos + clip.length);
                          setShowClipboard(false);
                        }}
                        className="bg-[#252525] border border-white/5 rounded-lg px-3 py-2 text-xs text-white max-w-[150px] truncate shrink-0 hover:border-[#10b981]/50"
                      >
                        {clip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showTranslateMenu && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-[#1a1a1a] border-b border-white/5 overflow-hidden"
            >
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] uppercase tracking-widest text-[#71717a] font-bold">Select Target Language</h4>
                  <button onClick={() => setShowTranslateMenu(false)} className="text-[#10b981] text-[10px] font-bold uppercase">Done</button>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {TRANSLATION_LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setTargetLanguage(lang)}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition-all shrink-0 ${targetLanguage === lang ? 'bg-[#10b981] text-black' : 'bg-[#252525] text-white hover:bg-[#333]'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN KEYS or EMOJI VIEW */}
        <div className="p-2.5 pb-6 flex flex-col gap-1.5 keyboard-grid min-h-[220px]">
          {showEmojis ? (
            <div className="flex flex-col gap-2 h-full">
               <div className="flex items-center justify-between px-2 mb-1">
                 <span className="text-[10px] uppercase tracking-widest text-[#71717a] font-bold">Frequently Used</span>
                 <button 
                  onClick={() => setShowEmojis(false)}
                  className={`text-[10px] uppercase font-bold text-[#10b981]`}
                 >
                   Back to keys
                 </button>
               </div>
               <div className="grid grid-cols-8 gap-1 overflow-y-auto max-h-[160px] no-scrollbar">
                 {EMOJI_LIST.map((emoji, i) => (
                   <motion.button
                    key={i}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleKeyPress(emoji)}
                    className="h-12 flex items-center justify-center text-2xl hover:bg-white/5 rounded-lg transition-colors"
                   >
                     {emoji}
                   </motion.button>
                 ))}
               </div>
            </div>
          ) : (
            <>
              {LAYOUTS[layout].map((row, i) => (
                <div key={i} className="flex gap-1.5 justify-center">
                  {row.map((item) => {
                    const isSpecial = ['SHIFT', 'BACKSPACE'].includes(item);
                    return (
                      <Key
                        key={item}
                        label={item}
                        theme={currentTheme}
                        isSpecial={isSpecial}
                        isShift={isShift}
                        onClick={() => handleKeyPress(item)}
                      />
                    );
                  })}
                </div>
              ))}
              
              {/* Legend/Number Row Toggle */}
              <div className="flex gap-1.5 justify-center">
                <Key label="?123" theme={currentTheme} isSpecial onClick={() => {}} className="grow-[1.5] text-[10px] tracking-widest font-bold" />
                <Key label="," theme={currentTheme} onClick={() => handleKeyPress(',')} />
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleKeyPress(' ')}
                  className={`grow-[6] h-12 rounded-lg flex items-center justify-center text-[10px] tracking-[0.3em] font-bold uppercase transition-all shadow-sm ${theme === 'onyx' ? 'bg-[#2a2a2a] text-[#71717a] border border-white/5' : currentTheme.key + ' ' + currentTheme.keyText} hover:brightness-110 active:brightness-95`}
                >
                  {theme === 'onyx' ? 'Onyx' : 'Space'}
                </motion.button>
                <Key label="." theme={currentTheme} onClick={() => handleKeyPress('.')} />
                <Key 
                  label={translatedText ? "SEND" : "ENTER"} 
                  theme={currentTheme} 
                  isSpecial 
                  onClick={() => handleKeyPress('ENTER')} 
                  className={`grow-[1.5] ${theme === 'onyx' ? '!bg-[#10b981] !text-black' : ''} relative`}
                >
                   {isTranslating ? (
                     <Loader2 className="w-5 h-5 animate-spin" />
                   ) : translatedText ? (
                     <Send className="w-5 h-5" />
                   ) : (
                     <CornerDownLeft className="w-5 h-5" />
                   )}
                </Key>
              </div>
            </>
          )}

          {/* BOTTOM ROW: Arrows & Navigation */}
          <div className="flex gap-2 justify-center mt-3 border-t border-white/5 pt-4">
             <div className="flex gap-2 items-center w-full px-2 overflow-x-auto no-scrollbar">
                <ArrowKey icon={<Undo2 className="w-5 h-5"/>} onClick={undo} theme={currentTheme} />
                <ArrowKey icon={<Redo2 className="w-5 h-5"/>} onClick={redo} theme={currentTheme} />
                
                <div className="w-px h-6 bg-white/5 mx-2 shrink-0" />

                <ArrowKey icon={<ArrowLeft className="w-5 h-5"/>} onClick={() => moveCursor('left')} theme={currentTheme} />
                <ArrowKey icon={<ArrowUp className="w-5 h-5"/>} onClick={() => moveCursor('up')} theme={currentTheme} />
                <ArrowKey icon={<ArrowDown className="w-5 h-5"/>} onClick={() => moveCursor('down')} theme={currentTheme} />
                <ArrowKey icon={<ArrowRight className="w-5 h-5"/>} onClick={() => moveCursor('right')} theme={currentTheme} />
                
                <div className="w-px h-6 bg-white/5 mx-2 shrink-0" />
                
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleLayout}
                  className={`flex-1 h-12 rounded-xl flex items-center justify-center ${currentTheme.specialKey} border border-white/5 text-[#71717a] hover:text-white transition-all`}
                >
                  <Globe className="w-5 h-5" />
                  <span className="text-[8px] font-bold absolute -bottom-1 uppercase opacity-40">{layout}</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleTranslate}
                  className={`flex-1 h-12 rounded-xl flex items-center justify-center ${currentTheme.specialKey} border border-white/5 transition-colors ${isTranslateEnabled ? 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'text-[#71717a] hover:text-white'}`}
                >
                  <Languages className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEmojis(!showEmojis)}
                  className={`flex-1 h-12 rounded-xl flex items-center justify-center ${currentTheme.specialKey} border border-white/5 transition-colors ${showEmojis ? 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/30 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'text-[#71717a] hover:text-white'}`}
                >
                  <Smile className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSettings(true)}
                  className={`flex-1 h-12 rounded-xl flex items-center justify-center ${currentTheme.specialKey} text-[#71717a] border border-white/5 hover:text-white transition-colors`}
                >
                  <Globe className="w-5 h-5" />
                </motion.button>
             </div>
          </div>
          
          {/* Home Indicator */}
          <div className="w-24 h-1 bg-white/10 mx-auto mt-4 rounded-full" />
        </div>
      </div>

      {/* SETTINGS OVERLAY */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`fixed inset-0 z-50 flex flex-col p-8 md:p-12 ${currentTheme.bg} overflow-hidden`}
          >
            <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
              <div className="flex items-center justify-between mb-12">
                <div className="space-y-1">
                  <h2 className={`text-4xl font-light font-serif ${currentTheme.inputText}`}>Customization</h2>
                  <p className="text-[#71717a] text-xs uppercase tracking-widest">Tailor your onyx experience</p>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className={`p-4 rounded-full ${currentTheme.specialKey} ${currentTheme.keyText} border border-white/5 hover:border-[#10b981]/50 transition-colors`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-12 flex-1 overflow-auto pb-32">
                <section>
                  <h3 className={`text-[10px] uppercase tracking-[0.2em] font-bold mb-6 opacity-30 ${currentTheme.inputText}`}>Appearance</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {(Object.keys(THEMES) as Theme[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`p-6 rounded-2xl border transition-all flex items-center justify-between ${
                          theme === t ? 'border-[#10b981] bg-[#10b981]/5' : 'border-white/5 hover:bg-white/[0.02]'
                        } ${THEMES[t].bg}`}
                      >
                        <span className={`text-sm font-medium tracking-tight ${THEMES[t].keyText}`}>{t.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                        <div className="flex gap-2">
                          <div className={`w-3 h-3 rounded-full ${THEMES[t].accent}`} />
                          <div className={`w-3 h-3 rounded-full ${THEMES[t].specialKey}`} />
                        </div>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className={`text-[10px] uppercase tracking-[0.2em] font-bold mb-6 opacity-30 ${currentTheme.inputText}`}>Accelerator Shortcuts</h3>
                  <div className="space-y-4">
                    {shortcuts.map((s, idx) => (
                      <div key={s.id} className={`p-6 rounded-2xl ${currentTheme.specialKey} border border-white/5 flex flex-col gap-4 group transition-all hover:border-white/10`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#10b981] text-xs font-serif italic`}>
                            0{idx + 1}
                          </div>
                          <input 
                            className={`flex-1 bg-transparent outline-none font-medium text-lg tracking-tight ${currentTheme.keyText}`}
                            value={s.name}
                            onChange={(e) => {
                              const next = [...shortcuts];
                              next[idx].name = e.target.value;
                              setShortcuts(next);
                            }}
                            placeholder="App Name"
                          />
                        </div>
                        <div className="flex items-center gap-2 pl-12">
                          <ExternalLink className="w-3 h-3 text-[#10b981]/50" />
                          <input 
                            className={`flex-1 bg-transparent outline-none text-xs text-[#71717a] tracking-tight`}
                            value={s.url}
                            onChange={(e) => {
                              const next = [...shortcuts];
                              next[idx].url = e.target.value;
                              setShortcuts(next);
                            }}
                            placeholder="Link URL"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
              
              <div className="pt-8 mt-auto border-t border-white/5 flex justify-end">
                 <button 
                  onClick={() => setShowSettings(false)}
                  className={`px-12 py-4 rounded-full font-bold text-sm tracking-widest uppercase transition-all shadow-2xl active:scale-95 ${currentTheme.accent} ${currentTheme.accentText} hover:brightness-110`}
                >
                  Secure Changes
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .keyboard-grid {
          user-select: none;
          touch-action: manipulation;
        }
      `}} />
    </div>
  );
}

// --- Helper Components ---

interface KeyProps {
  label: string; 
  theme: any; 
  isSpecial?: boolean;
  isShift?: boolean;
  className?: string;
  onClick: () => void;
}

const Key: React.FC<KeyProps & { children?: React.ReactNode }> = ({ label, theme, isSpecial, className, isShift, onClick, children }) => {
  const getIcon = () => {
    if (children) return children;
    if (label === 'SHIFT') return <ChevronUp className={`w-5 h-5 ${isShift ? 'text-[#10b981]' : ''}`} />;
    if (label === 'BACKSPACE') return <Delete className="w-5 h-5" />;
    if (label === 'ENTER') return <CornerDownLeft className="w-5 h-5" />;
    return isShift ? label.toUpperCase() : label.toLowerCase();
  };

  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={`
        h-12 min-w-[32px] flex-1 rounded-lg flex items-center justify-center 
        text-sm font-medium transition-all border border-white/5
        ${isSpecial ? theme.specialKey : theme.key} 
        ${theme.keyText}
        hover:bg-white/[0.02] active:scale-95
        ${className}
      `}
    >
      {getIcon()}
    </motion.button>
  );
}

function ArrowKey({ icon, onClick, theme }: { icon: React.ReactNode; onClick: () => void; theme: any }) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`
        w-12 h-10 flex-1 rounded-lg flex items-center justify-center 
        ${theme.keyText} bg-white/[0.03] border border-white/5 hover:text-[#10b981] transition-colors
      `}
    >
      {icon}
    </motion.button>
  );
}

function TopRowButton({ onClick, icon, label, theme, onyx, active }: { onClick: () => void; icon: React.ReactNode; label: string; theme: any; onyx: boolean; active?: boolean }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        px-3 h-10 rounded-lg flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest transition-all shrink-0
        ${onyx ? (active ? 'bg-[#10b981]/20 border-[#10b981]/50 text-[#10b981]' : 'bg-[#1d1d1d] border-white/5 text-[#e0e0e0] hover:bg-white/[0.03]') : (active ? 'bg-[#10b981]/20' : theme.specialKey)}
        border hover:bg-white/[0.03] active:bg-white/[0.05]
      `}
    >
      <div className={active ? 'text-[#10b981]' : 'opacity-60'}>{icon}</div>
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  );
}
