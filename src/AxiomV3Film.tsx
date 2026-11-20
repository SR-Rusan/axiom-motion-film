import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

type CSS = React.CSSProperties;

const C = {
  paper: '#FFFFFF',
  ink: '#25292D',
  muted: '#8C9697',
  line: '#E7E9EA',
  panel: '#FCFCFC',
  indigo: '#635BFF',
  indigoPale: '#ECEBFF',
  emerald: '#10B981',
  red: '#F16B6B',
};

const mono: CSS = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', letterSpacing: '0.13em', textTransform: 'uppercase' };
const serif: CSS = { fontFamily: '"AXIOM Instrument", Georgia, serif', fontStyle: 'italic', fontWeight: 400 };

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const ease = (frame: number, start: number, length: number, easing = Easing.out(Easing.cubic)) => interpolate(frame, [start, start + length], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });
const sceneOpacity = (frame: number, duration: number) => interpolate(frame, [0, 5, duration - 7, duration], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

function Scene({ children, duration }: { children: React.ReactNode; duration: number }) {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: sceneOpacity(frame, duration), background: C.paper, overflow: 'hidden' }}>{children}</AbsoluteFill>;
}

function Header({ section }: { section: string }) {
  return <div style={{ position: 'absolute', top: '3.4%', left: '8%', right: '8%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: C.muted, ...mono, fontSize: '1.45vw', whiteSpace: 'nowrap' }}><span style={{ color: C.ink, fontWeight: 700 }}>✦ AXIOM / RUSAN</span><span>{section}</span><span style={{ color: C.indigo }}>● LIVE SYSTEM</span></div>;
}

function BigLine({ children, frame, delay = 0, color = C.ink, size = '12vw', align = 'left', italic = false, weight = 820 }: { children: React.ReactNode; frame: number; delay?: number; color?: string; size?: string; align?: CSS['textAlign']; italic?: boolean; weight?: number }) {
  const p = ease(frame, delay, 12);
  return <div style={{ overflow: 'hidden', textAlign: align }}><div style={{ ...italic ? serif : {}, color, fontSize: size, lineHeight: 0.83, letterSpacing: '-0.09em', fontWeight: weight, transform: `translateY(${interpolate(p, [0, 1], [110, 0])}%)`, opacity: p }}>{children}</div></div>;
}

function Cursor({ points, clicks = [] }: { points: { t: number; x: number; y: number }[]; clicks?: number[] }) {
  const frame = useCurrentFrame();
  let x = points[0]?.x ?? 50;
  let y = points[0]?.y ?? 50;
  for (let index = 1; index < points.length; index++) {
    const previous = points[index - 1];
    const next = points[index];
    if (frame >= previous.t && frame <= next.t) {
      const p = ease(frame, previous.t, Math.max(1, next.t - previous.t));
      x = interpolate(p, [0, 1], [previous.x, next.x]);
      y = interpolate(p, [0, 1], [previous.y, next.y]);
      break;
    }
    if (frame > next.t) { x = next.x; y = next.y; }
  }
  const hit = clicks.reduce((acc, clickFrame) => Math.max(acc, clamp(1 - Math.abs(frame - clickFrame) / 9)), 0);
  return <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, zIndex: 80, transform: `translate(-2px, -2px) scale(${1 - hit * 0.13})`, pointerEvents: 'none' }}>
    {hit > 0.02 && <div style={{ position: 'absolute', left: '-1.6vw', top: '-1.6vw', width: '3.4vw', height: '3.4vw', borderRadius: '50%', border: `2px solid ${C.ink}`, opacity: hit * 0.75, transform: `scale(${1 + (1 - hit) * 0.8})` }} />}
    <svg width="3.6vw" height="4.7vw" viewBox="0 0 38 50" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,.18))' }}><path d="M4 2 34 28 20 30 29 45 21 49 12 34 4 42Z" fill={C.ink} stroke={C.paper} strokeWidth="2" strokeLinejoin="round" /></svg>
  </div>;
}

function AppChip({ name, color, x, y, frame, delay = 0 }: { name: string; color: string; x: number; y: number; frame: number; delay?: number }) {
  const p = ease(frame, delay, 10);
  return <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, display: 'flex', alignItems: 'center', gap: '0.6em', color: C.muted, fontSize: '1.6vw', opacity: p, transform: `translateY(${interpolate(p, [0, 1], [35, 0])}px)` }}><span style={{ width: '2.4vw', height: '2.4vw', borderRadius: '0.55vw', background: color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: C.paper, fontSize: '1.1vw', fontWeight: 800 }}>{name.slice(0, 1)}</span>{name}</div>;
}

function BrowserWindow({ title, x, y, width, height, frame, delay = 0, shift = 100, rotate = 0, children }: { title: string; x: number; y: number; width: number; height: number; frame: number; delay?: number; shift?: number; rotate?: number; children?: React.ReactNode }) {
  const p = ease(frame, delay, 15);
  return <div style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${width}%`, height: `${height}%`, zIndex: 20, background: 'rgba(255,255,255,.98)', border: `1px solid ${C.line}`, borderRadius: '0.9vw', boxShadow: '0 2.5vw 5vw rgba(37,41,45,.13)', overflow: 'hidden', transform: `translateY(${interpolate(p, [0, 1], [shift, 0])}px) rotate(${interpolate(p, [0, 1], [rotate, 0])}deg)`, opacity: p }}>
    <div style={{ height: '12%', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: '0.6vw', padding: '0 1.8vw', color: C.muted, fontSize: '1vw' }}><i style={{ width: '0.65vw', height: '0.65vw', borderRadius: '50%', background: '#FA7777' }} /><i style={{ width: '0.65vw', height: '0.65vw', borderRadius: '50%', background: '#F6C86E' }} /><i style={{ width: '0.65vw', height: '0.65vw', borderRadius: '50%', background: '#6ED7A4' }} /><span style={{ marginLeft: '0.6vw', ...mono, fontSize: '0.9vw' }}>{title}</span></div>
    <div style={{ position: 'relative', height: '88%' }}>{children}</div>
  </div>;
}

function Pill({ children, color = C.indigo, background = C.indigoPale, style }: { children: React.ReactNode; color?: string; background?: string; style?: CSS }) {
  return <span style={{ ...mono, color, background, padding: '0.5em 0.72em', borderRadius: '999px', fontSize: '1vw', whiteSpace: 'nowrap', ...style }}>{children}</span>;
}

function Opening() {
  const frame = useCurrentFrame();
  return <Scene duration={55}>
    <Header section="01 / AUTOMATION" />
    <div style={{ position: 'absolute', left: '9%', top: '25%', width: '84%' }}>
      <div style={{ ...mono, color: C.indigo, fontSize: '1.6vw', marginBottom: '3.6vh', opacity: ease(frame, 2, 8) }}>FIELD NOTE / 01</div>
      <BigLine frame={frame} delay={3} size="12.6vw">Practical AI</BigLine>
      <BigLine frame={frame} delay={10} size="13.5vw" color={C.indigo} italic>automations.</BigLine>
      <div style={{ marginTop: '4vh', color: C.muted, fontSize: '1.8vw', transform: `translateY(${interpolate(ease(frame, 19, 13), [0, 1], [12, 0])}px)`, opacity: ease(frame, 19, 13) }}>Built around your exact operational bottlenecks.</div>
    </div>
    <div style={{ position: 'absolute', right: '10%', bottom: '12%', color: C.muted, ...mono, fontSize: '1.25vw' }}>AXIOM / DIRECT ENGINEERING</div>
    <Cursor points={[{ t: 0, x: 84, y: 71 }, { t: 30, x: 74, y: 52 }, { t: 44, x: 74, y: 52 }]} clicks={[31]} />
  </Scene>;
}

function Tools() {
  const frame = useCurrentFrame();
  return <Scene duration={55}>
    <Header section="02 / CONNECTED TOOLS" />
    <div style={{ position: 'absolute', top: '15%', left: '9%', width: '84%' }}>
      <BigLine frame={frame} delay={1} size="9.8vw">That connect</BigLine>
      <BigLine frame={frame} delay={7} size="12.3vw" color={C.indigo} italic>your tools.</BigLine>
    </div>
    <AppChip name="Gmail" color="#EA625C" x={10} y={48} frame={frame} delay={8} />
    <AppChip name="CRM / Sheets" color="#4E9B75" x={10} y={56} frame={frame} delay={12} />
    <AppChip name="Airtable / HubSpot" color="#7B6BFF" x={10} y={64} frame={frame} delay={16} />
    <AppChip name="Notion / Slack" color="#25292D" x={10} y={72} frame={frame} delay={20} />
    <BrowserWindow title="workflow / connected" x={42} y={42} width={49} height={36} frame={frame} delay={6} shift={160} rotate={-4}>
      <div style={{ padding: '2.6vw' }}><div style={{ ...mono, fontSize: '1vw', color: C.muted }}>AI + CRM</div><div style={{ color: C.ink, fontSize: '3.2vw', fontWeight: 800, letterSpacing: '-0.07em', marginTop: '1.5em' }}>One connected<br />operating layer.</div><div style={{ display: 'flex', gap: '0.7vw', marginTop: '2.3vw' }}><Pill>INPUT</Pill><Pill color={C.emerald} background="#E8F9F1">✓ CONTEXT</Pill><Pill color={C.ink} background="#F1F2F3">ACTION</Pill></div></div>
    </BrowserWindow>
    <Cursor points={[{ t: 0, x: 95, y: 89 }, { t: 20, x: 83, y: 63 }, { t: 34, x: 72, y: 61 }, { t: 50, x: 72, y: 61 }]} clicks={[35]} />
  </Scene>;
}

function Repetitive() {
  const frame = useCurrentFrame();
  const cards = [
    { label: 'WEB FORM', title: 'NEW INQUIRY SUBMITTED', color: C.indigo, x: 10, y: 35, r: -4, delay: 2 },
    { label: 'AUTOMATION', title: 'LEAD ENRICHMENT', color: C.emerald, x: 45, y: 49, r: 5, delay: 8 },
    { label: 'GMAIL', title: 'FOLLOW-UP DRAFT', color: '#E36A62', x: 9, y: 65, r: 3, delay: 14 },
  ];
  return <Scene duration={58}>
    <Header section="03 / LESS REPETITION" />
    <div style={{ position: 'absolute', top: '13%', left: '9%', width: '85%' }}><div style={{ ...mono, color: C.muted, fontSize: '1.5vw', marginBottom: '2.8vh' }}>THE OPERATING LAYER</div><BigLine frame={frame} delay={1} size="10.6vw">Remove</BigLine><BigLine frame={frame} delay={8} size="10.8vw" color={C.indigo} italic>repetitive work.</BigLine></div>
    {cards.map((card) => { const p = ease(frame, card.delay, 14); return <div key={card.title} style={{ position: 'absolute', left: `${card.x}%`, top: `${card.y}%`, width: '49%', padding: '2vw 2.3vw', background: 'rgba(255,255,255,.97)', border: `1px solid ${C.line}`, boxShadow: '0 2vw 4.8vw rgba(37,41,45,.12)', borderRadius: '0.8vw', transform: `translateY(${interpolate(p, [0, 1], [card.y > 50 ? 180 : -180, 0])}px) rotate(${interpolate(p, [0, 1], [card.r * 2, card.r])}deg)`, opacity: p }}><div style={{ ...mono, color: card.color, fontSize: '1.1vw' }}>{card.label}</div><div style={{ marginTop: '1.4em', fontSize: '2.1vw', fontWeight: 780, letterSpacing: '-0.06em' }}>{card.title}</div><div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.6em', color: C.muted, fontSize: '1.1vw' }}><span>structured output</span><span style={{ color: C.emerald }}>● ready</span></div></div>; })}
    <Cursor points={[{ t: 0, x: 86, y: 77 }, { t: 21, x: 58, y: 54 }, { t: 36, x: 58, y: 54 }]} clicks={[36]} />
  </Scene>;
}

function Core() {
  const frame = useCurrentFrame();
  const p = ease(frame, 2, 24);
  const progress = ease(frame, 11, 44);
  const packet = interpolate(progress, [0, 1], [3, 96]);
  return <Scene duration={66}>
    <Header section="04 / AXIOM CORE" />
    <div style={{ position: 'absolute', top: '12%', width: '100%', textAlign: 'center' }}><div style={{ ...mono, color: C.indigo, fontSize: '1.45vw', opacity: p }}>AXIOM CORE / AUTOMATION OVERVIEW</div><div style={{ color: C.ink, fontSize: '11.8vw', lineHeight: .82, letterSpacing: '-.1em', fontWeight: 850, marginTop: '2vh', transform: `scale(${interpolate(p, [0, 1], [.84, 1])})`, opacity: p }}>Axiom <span style={{ ...serif, color: C.indigo, fontWeight: 400 }}>Core.</span></div></div>
    <div style={{ position: 'absolute', left: '8%', top: '36%', width: '84%', height: '42%', background: C.panel, border: `1px solid ${C.line}`, borderRadius: '1vw', boxShadow: '0 2vw 6vw rgba(37,41,45,.12)', transform: `translateY(${interpolate(p, [0, 1], [130, 0])}px)`, opacity: p }}>
      <div style={{ height: '17%', borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2.6vw' }}><div style={{ ...mono, fontSize: '1.05vw', color: C.muted }}>AUTOMATION OVERVIEW</div><Pill color={C.emerald} background="#E8F9F1">● SYSTEMS OPERATIONAL</Pill></div>
      <div style={{ padding: '2.6vw' }}><div style={{ color: C.ink, fontSize: '2.6vw', fontWeight: 780, letterSpacing: '-.06em' }}>New inquiry submitted on website form</div><div style={{ color: C.muted, fontSize: '1.35vw', marginTop: '.7em' }}>Autonomous Lead Qualification &amp; CRM Sync</div><div style={{ marginTop: '3vw', height: '1px', background: C.line, position: 'relative' }}><div style={{ position: 'absolute', left: `${packet}%`, top: '-0.45vw', width: '0.9vw', height: '0.9vw', borderRadius: '50%', background: C.indigo, boxShadow: `0 0 0 0.6vw ${C.indigoPale}` }} /></div><div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.6vw', ...mono, color: C.muted, fontSize: '1vw' }}><span>PARSED</span><span>ENRICHED</span><span style={{ color: C.emerald }}>DISPATCHED</span></div><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${C.line}`, marginTop: '2.3vw', padding: '1.3vw 1.6vw', fontSize: '1.35vw' }}><span>Automated CRM Lead Enrichment &amp; Tagging</span><span style={{ ...mono, color: C.emerald, fontSize: '1vw' }}>✓ COMPLETE</span></div></div>
    </div>
    <Cursor points={[{ t: 0, x: 92, y: 84 }, { t: 26, x: 73, y: 58 }, { t: 43, x: 73, y: 58 }, { t: 60, x: 91, y: 79 }]} clicks={[43]} />
  </Scene>;
}

function Flow() {
  const frame = useCurrentFrame();
  const p = ease(frame, 2, 18);
  const progress = ease(frame, 12, 42);
  const nodeY = interpolate(progress, [0, 1], [12, 84]);
  const stages = [
    { label: 'INPUT', title: 'website form', color: C.indigo },
    { label: 'CONTEXT', title: 'AI synthesis', color: '#8B7FFF' },
    { label: 'ACTION', title: 'CRM / Sheets', color: C.emerald },
  ];
  return <Scene duration={64}>
    <Header section="05 / LIVE WORKFLOW" />
    <div style={{ position: 'absolute', left: '9%', top: '13%', width: '82%' }}><div style={{ ...mono, color: C.muted, fontSize: '1.45vw' }}>A SYSTEM THAT MOVES</div><BigLine frame={frame} delay={2} size="10vw">Input.</BigLine><BigLine frame={frame} delay={7} size="10vw" color={C.indigo} italic>Context.</BigLine><BigLine frame={frame} delay={12} size="10vw">Action.</BigLine></div>
    <div style={{ position: 'absolute', left: '75%', top: '29%', width: '1px', height: '50%', background: C.line }}><div style={{ position: 'absolute', top: `${nodeY}%`, left: '-0.45vw', width: '0.9vw', height: '0.9vw', borderRadius: '50%', background: C.indigo, boxShadow: `0 0 0 0.55vw ${C.indigoPale}` }} /></div>
    {stages.map((stage, index) => { const q = ease(frame, 13 + index * 6, 12); return <div key={stage.label} style={{ position: 'absolute', right: '10%', top: `${36 + index * 13}%`, width: '47%', padding: '1.5vw 1.7vw', border: `1px solid ${C.line}`, background: 'rgba(255,255,255,.98)', boxShadow: '0 1.6vw 3vw rgba(37,41,45,.08)', opacity: q, transform: `translateX(${interpolate(q, [0, 1], [130, 0])}px)` }}><div style={{ ...mono, color: stage.color, fontSize: '1vw' }}>{stage.label}</div><div style={{ color: C.ink, fontSize: '1.8vw', fontWeight: 760, marginTop: '.65em' }}>{stage.title}</div><div style={{ color: C.muted, fontSize: '1.05vw', marginTop: '.8em' }}>verified / running</div></div>; })}
    <Cursor points={[{ t: 0, x: 90, y: 87 }, { t: 28, x: 76, y: 58 }, { t: 41, x: 76, y: 58 }, { t: 56, x: 91, y: 86 }]} clicks={[42]} />
  </Scene>;
}

function Search() {
  const frame = useCurrentFrame();
  const p = ease(frame, 3, 16);
  return <Scene duration={58}>
    <Header section="06 / DIGITAL PRESENCE" />
    <div style={{ position: 'absolute', top: '18%', left: '9%', width: '84%' }}><BigLine frame={frame} delay={1} size="10.2vw">Future-proof</BigLine><BigLine frame={frame} delay={8} size="10.8vw" color={C.indigo} italic>for AI search.</BigLine><div style={{ color: C.muted, fontSize: '1.5vw', marginTop: '3.5vh', opacity: p }}>Digital presence is now a system of signal, structure, and authority.</div></div>
    <BrowserWindow title="digital presence / flywheel" x={8} y={49} width={84} height={31} frame={frame} delay={9} shift={190} rotate={2}>
      <div style={{ padding: '2.2vw', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.2vw' }}>
        {[['AI + SOCIAL', '#F5B258'], ['WEBSITE', C.indigo], ['KNOWLEDGE GRAPH', C.emerald]].map(([label, color], index) => <div key={label} style={{ border: `1px solid ${C.line}`, padding: '1.5vw 1.2vw', transform: `translateY(${Math.sin((frame + index * 7) / 5) * 4}px)` }}><div style={{ width: '2vw', height: '2vw', borderRadius: '0.5vw', background: color, marginBottom: '1.2vw' }} /><div style={{ ...mono, fontSize: '0.95vw', color: C.muted }}>{label}</div><div style={{ marginTop: '1.2em', fontSize: '1.25vw', fontWeight: 700 }}>signal ready</div><div style={{ marginTop: '1.3vw', height: '0.4vw', background: index === 1 ? C.indigoPale : '#F0F1F2' }}><div style={{ width: `${58 + index * 13}%`, height: '100%', background: color }} /></div></div>)}
      </div>
    </BrowserWindow>
    <Cursor points={[{ t: 0, x: 90, y: 84 }, { t: 26, x: 62, y: 65 }, { t: 39, x: 62, y: 65 }]} clicks={[39]} />
  </Scene>;
}

function Advisory() {
  const frame = useCurrentFrame();
  const p = ease(frame, 3, 16);
  return <Scene duration={60}>
    <Header section="07 / DIRECT ADVISORY" />
    <div style={{ position: 'absolute', top: '21%', left: '9%', width: '85%' }}><BigLine frame={frame} delay={1} size="9.7vw">Direct advisory</BigLine><BigLine frame={frame} delay={8} size="10.6vw" color={C.indigo} italic>with Rusan.</BigLine></div>
    <BrowserWindow title="discovery / direct" x={8} y={48} width={84} height={30} frame={frame} delay={9} shift={150} rotate={-2}>
      <div style={{ padding: '2.3vw', display: 'grid', gridTemplateColumns: '1fr 38%', gap: '2vw' }}><div><div style={{ ...mono, color: C.muted, fontSize: '1vw' }}>AXIOM BY RUSAN / DISCOVERY FORM</div><div style={{ fontSize: '1.8vw', fontWeight: 740, marginTop: '1.4em' }}>Map the workflow.<br />Find the leverage.</div><div style={{ marginTop: '2vw', border: `1px solid ${C.line}`, padding: '1.1vw', color: C.muted, fontSize: '1.1vw' }}>Company / Website URL</div></div><div style={{ alignSelf: 'end' }}><div style={{ color: C.muted, fontSize: '1.1vw', lineHeight: 1.6 }}>No salespeople.<br />No telephone games.<br /><span style={{ color: C.emerald }}>Direct engineering.</span></div><div style={{ background: C.ink, color: C.paper, padding: '1.2vw', textAlign: 'center', marginTop: '1.5vw', fontSize: '1.1vw', fontWeight: 700 }}>Book discovery call →</div></div></div>
    </BrowserWindow>
    <div style={{ position: 'absolute', left: '9%', bottom: '10%', ...mono, color: C.muted, fontSize: '1.15vw', opacity: p }}>WORKFLOW AUDIT / BOTTLENECK MAPPING / HANDOVER</div>
    <Cursor points={[{ t: 0, x: 92, y: 87 }, { t: 27, x: 73, y: 70 }, { t: 42, x: 73, y: 70 }]} clicks={[42]} />
  </Scene>;
}

function System() {
  const frame = useCurrentFrame();
  const p = ease(frame, 2, 19);
  const collapse = ease(frame, 13, 29, Easing.inOut(Easing.cubic));
  return <Scene duration={60}>
    <Header section="08 / CHANGE OF STATE" />
    <div style={{ position: 'absolute', left: '9%', top: '18%', width: '84%' }}><div style={{ ...mono, color: C.muted, fontSize: '1.45vw', marginBottom: '2.3vh' }}>THE OUTPUT IS NOT MORE TOOLS</div><BigLine frame={frame} delay={1} size="9.7vw">From bottleneck</BigLine><BigLine frame={frame} delay={8} size="11.5vw" color={C.indigo} italic>to system.</BigLine></div>
    <div style={{ position: 'absolute', left: '9%', right: '9%', top: '64%', height: '1px', background: C.line }}><div style={{ position: 'absolute', left: `${interpolate(collapse, [0, 1], [8, 92])}%`, top: '-0.5vw', width: '1vw', height: '1vw', borderRadius: '50%', background: C.indigo, boxShadow: `0 0 0 .65vw ${C.indigoPale}` }} /></div>
    <div style={{ position: 'absolute', left: '10%', top: '69%', display: 'flex', gap: '1vw', opacity: 1 - collapse }}><Pill color={C.muted} background="#F4F5F5">manual</Pill><Pill color={C.muted} background="#F4F5F5">fragmented</Pill><Pill color={C.muted} background="#F4F5F5">slow</Pill></div>
    <div style={{ position: 'absolute', right: '10%', top: '69%', display: 'flex', gap: '1vw', opacity: collapse }}><Pill color={C.emerald} background="#E8F9F1">connected</Pill><Pill color={C.indigo} background={C.indigoPale}>measurable</Pill><Pill color={C.ink} background="#F4F5F5">running</Pill></div>
    <div style={{ position: 'absolute', left: '9%', right: '9%', bottom: '9%', display: 'flex', justifyContent: 'space-between', color: C.muted, fontSize: '1.35vw', opacity: p }}><span>Custom automations delivered in 7–14 days.</span><span style={{ color: C.emerald, ...mono, fontSize: '1.1vw' }}>✓ SYSTEMS OPERATIONAL</span></div>
    <Cursor points={[{ t: 0, x: 91, y: 88 }, { t: 29, x: 75, y: 64 }, { t: 43, x: 75, y: 64 }]} clicks={[43]} />
  </Scene>;
}

function Reveal() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 15, stiffness: 110, mass: .65 } });
  const click = ease(frame, 27, 7);
  return <Scene duration={63}>
    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 41%, ${C.indigoPale}, transparent 30%)` }} />
    <div style={{ position: 'absolute', top: '18%', width: '100%', textAlign: 'center', ...mono, color: C.indigo, fontSize: '1.4vw', opacity: p }}>AI AUTOMATION FOR GROWING BUSINESSES</div>
    <div style={{ position: 'absolute', top: '28%', width: '100%', textAlign: 'center', color: C.indigo, fontSize: '9vw', transform: `scale(${interpolate(p, [0, 1], [.4, 1])})`, opacity: p }}>✦</div>
    <div style={{ position: 'absolute', top: '39%', width: '100%', textAlign: 'center', opacity: p }}><div style={{ fontSize: '18vw', lineHeight: .72, fontWeight: 900, letterSpacing: '-.13em', color: C.ink }}>AXIOM</div><div style={{ ...serif, color: C.muted, fontSize: '5vw', marginTop: '1em' }}>by Rusan</div></div>
    <div style={{ position: 'absolute', top: '70%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: p }}><div style={{ background: C.ink, color: C.paper, padding: '1.7vw 3.4vw', fontSize: '1.8vw', fontWeight: 750, transform: `translateY(${interpolate(click, [0, 1], [0, -3])}px)` }}>Book a quick discovery call <span style={{ color: '#BEB9FF' }}>→</span></div><div style={{ ...mono, color: C.emerald, fontSize: '1.1vw', marginTop: '2vw' }}>● SYSTEMS OPERATIONAL</div></div>
    <Cursor points={[{ t: 0, x: 96, y: 90 }, { t: 29, x: 68, y: 72 }, { t: 42, x: 68, y: 72 }, { t: 62, x: 91, y: 91 }]} clicks={[42]} />
  </Scene>;
}

export const AxiomV3Film: React.FC = () => (
  <AbsoluteFill style={{ background: C.paper, color: C.ink, overflow: 'hidden', fontFamily: '"AXIOM Inter", Inter, Arial, sans-serif' }}>
    <style>{`
      @font-face { font-family: "AXIOM Instrument"; font-style: italic; font-weight: 400; src: url(${staticFile('InstrumentSerif-Italic.woff2')}) format("woff2"); }
      @font-face { font-family: "AXIOM Inter"; font-style: normal; font-weight: 100 900; src: url(${staticFile('Inter-Variable.woff2')}) format("woff2"); }
    `}</style>
    <Sequence from={0} durationInFrames={55}><Opening /></Sequence>
    <Sequence from={43} durationInFrames={55}><Tools /></Sequence>
    <Sequence from={86} durationInFrames={58}><Repetitive /></Sequence>
    <Sequence from={132} durationInFrames={66}><Core /></Sequence>
    <Sequence from={186} durationInFrames={64}><Flow /></Sequence>
    <Sequence from={238} durationInFrames={58}><Search /></Sequence>
    <Sequence from={288} durationInFrames={60}><Advisory /></Sequence>
    <Sequence from={338} durationInFrames={60}><System /></Sequence>
    <Sequence from={387} durationInFrames={63}><Reveal /></Sequence>
    <Audio src={staticFile('axiom_v3_fast_soundtrack.wav')} volume={0.74} />
  </AbsoluteFill>
);
