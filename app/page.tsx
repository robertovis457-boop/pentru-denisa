
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type PageName =
  | "home"
  | "message"
  | "beauty"
  | "moments"
  | "food"
  | "promises"
  | "calendar"
  | "openwhen"
  | "wheel"
  | "game"
  | "secret"
  | "ending";

type Pipe = { x: number; gapY: number; passed: boolean };

function HeartIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true" width="18" height="18">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 118 0v3" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
      <path d="M12 2l1.76 4.74L18.5 8.5l-4.74 1.76L12 15l-1.76-4.74L5.5 8.5l4.74-1.76L12 2zm7 10l.94 2.56L22.5 15l-2.56.44L19 18l-.94-2.56L15.5 15l2.56-.44L19 12zm-14 3l.94 2.56L8.5 18l-2.56.44L5 21l-.94-2.56L1.5 18l2.56-.44L5 15z" />
    </svg>
  );
}

function normalizeDate(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getUnlockedCount(currentDate: Date, startDate: Date, totalMessages: number) {
  const safeCurrent = normalizeDate(currentDate);
  const safeStart = normalizeDate(startDate);
  const diffInDays = Math.floor((safeCurrent.getTime() - safeStart.getTime()) / (1000 * 60 * 60 * 24));
  if (Number.isNaN(diffInDays)) return 1;
  return Math.max(1, Math.min(totalMessages, diffInDays + 1));
}

function getTodayKey() {
  return new Date().toLocaleDateString("ro-RO");
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-head">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title">{title}</h2>
      {description ? <p className="section-desc">{description}</p> : null}
    </div>
  );
}

function MenuCard({
  emoji,
  title,
  description,
  onClick,
}: {
  emoji: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button className="menu-card" onClick={onClick}>
      <div className="menu-emoji">{emoji}</div>
      <h3 className="menu-title">{title}</h3>
      <p className="menu-desc">{description}</p>
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="back-btn" onClick={onClick}>
      ← Înapoi la pagina principală
    </button>
  );
}

function PhotoCard({
  src,
  title,
  text,
  food = false,
}: {
  src: string;
  title: string;
  text: string;
  food?: boolean;
}) {
  return (
    <div className={`card ${food ? "food" : ""}`}>
      <img src={src} alt={title} />
      <div className="card-body">
        <h3 className="card-title">{title}</h3>
        <p className="card-text">{text}</p>
      </div>
    </div>
  );
}

function PromiseCard({ text }: { text: string }) {
  return (
    <div className="promise-card">
      <div className="promise-symbol">✦</div>
      <p className="promise-text">{text}</p>
    </div>
  );
}

function DailyMessageCard({
  dayIndex,
  dateLabel,
  message,
  unlocked,
}: {
  dayIndex: number;
  dateLabel: string;
  message: string;
  unlocked: boolean;
}) {
  return (
    <div className={`daily-card ${unlocked ? "" : "locked"}`}>
      <div className="daily-top">
        <div>
          <div className="daily-label">Ziua {dayIndex + 1}</div>
          <h3 className="daily-date">{dateLabel}</h3>
        </div>
        <div className="daily-icon">{unlocked ? <SparklesIcon /> : <LockIcon />}</div>
      </div>
      <p className="daily-text">
        {unlocked
          ? message
          : "Acest mesaj se va debloca în ziua lui. Până atunci, rămâne aici ca o mică surpriză pentru tine. ♡"}
      </p>
    </div>
  );
}

function EnvelopeCard({ title, message }: { title: string; message: string }) {
  const [opened, setOpened] = useState(false);
  return (
    <button className="envelope" onClick={() => setOpened((prev) => !prev)}>
      <div className="eyebrow" style={{ marginBottom: 10 }}>Plic special</div>
      <h3 className="envelope-title">{title}</h3>
      <p className="envelope-hint">{opened ? "Apasă din nou ca să închizi" : "Apasă ca să deschizi"}</p>
      {opened ? <div className="envelope-content">{message}</div> : null}
    </button>
  );
}

export default function Page() {
  const [currentPage, setCurrentPage] = useState<PageName>("home");
  const [spinResult, setSpinResult] = useState("");
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [selectedPlayer, setSelectedPlayer] = useState<"Roberto" | "Denisa">("Roberto");
  const [dailyScores, setDailyScores] = useState({ Roberto: 0, Denisa: 0 });
  const [flappyStarted, setFlappyStarted] = useState(false);
  const [flappyReady, setFlappyReady] = useState(false);
  const [flappyGameOver, setFlappyGameOver] = useState(false);
  const [birdY, setBirdY] = useState(220);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([{ x: 520, gapY: 170, passed: false }]);
  const [runScore, setRunScore] = useState(0);
  const [lastResetDate, setLastResetDate] = useState(getTodayKey());

  const animationRef = useRef<number | null>(null);
  const birdYRef = useRef(220);
  const birdVelocityRef = useRef(0);
  const pipesRef = useRef<Pipe[]>([{ x: 520, gapY: 170, passed: false }]);
  const runScoreRef = useRef(0);
  const selectedPlayerRef = useRef<"Roberto" | "Denisa">("Roberto");
  const flappyStartedRef = useRef(false);
  const flappyGameOverRef = useRef(false);

  const gravityRef = useRef(0.09);
  const jumpRef = useRef(-3.8);
  const gapSizeRef = useRef(230);

  useEffect(() => { birdYRef.current = birdY; }, [birdY]);
  useEffect(() => { birdVelocityRef.current = birdVelocity; }, [birdVelocity]);
  useEffect(() => { pipesRef.current = pipes; }, [pipes]);
  useEffect(() => { runScoreRef.current = runScore; }, [runScore]);
  useEffect(() => { selectedPlayerRef.current = selectedPlayer; }, [selectedPlayer]);
  useEffect(() => { flappyStartedRef.current = flappyStarted; }, [flappyStarted]);
  useEffect(() => { flappyGameOverRef.current = flappyGameOver; }, [flappyGameOver]);

  const heroImage = "/images/WhatsApp Image 2026-04-19 at 22.47.31.jpeg";

  const denisaPhotos = [
    { src: "/images/WhatsApp Image 2026-04-19 at 22.47.31 (6).jpeg", title: "Delicatețea ta", text: "Ai un fel al tău de a aduce frumusețe și lumină în tot ce atingi. Exact așa îmi faci și viața mai frumoasă." },
    { src: "/images/WhatsApp Image 2026-04-28 at 19.35.57.jpeg", title: "Frumoasa mea", text: "Uneori te privesc și mă gândesc cât de frumos a lucrat Dumnezeu când te-a făcut atât de specială." },
    { src: "/images/WhatsApp Image 2026-04-19 at 22.47.32 (6).jpeg", title: "Eleganța ta", text: "Îmi place tot la tine: felul în care zâmbești, felul în care privești și naturalețea cu care rămâi atât de frumoasă." },
    { src: "/images/WhatsApp Image 2026-04-19 at 22.47.31 (2).jpeg", title: "Lumina ta", text: "E ceva în privirea ta care îmi liniștește sufletul și îmi amintește că cele mai frumoase lucruri vin cu blândețe." },
  ];

  const ourMoments = [
    { src: "/images/WhatsApp Image 2026-04-19 at 22.47.31 (3).jpeg", title: "Aproape de tine", text: "Oriunde am fi, cel mai bine mă simt atunci când te țin lângă mine." },
    { src: "/images/WhatsApp Image 2026-04-19 at 22.47.31 (4).jpeg", title: "Noi doi", text: "În fiecare moment cu tine simt că trăiesc ceva sincer, curat și foarte prețios." },
    { src: "/images/WhatsApp Image 2026-04-19 at 22.47.32 (3).jpeg", title: "Amintire dragă", text: "Îmi plac momentele simple cu tine, pentru că tocmai ele îmi arată cât de mult înseamnă prezența ta pentru mine." },
    { src: "/images/WhatsApp Image 2026-04-19 at 22.47.32 (4).jpeg", title: "Fericirea simplă", text: "Cu tine, chiar și cele mai simple clipe ajung să fie amintiri pe care le port cu drag în suflet." },
  ];

  const foodMemories = [
    { src: "/images/WhatsApp Image 2026-04-28 at 19.35.42.jpeg", title: "Mese făcute cu drag", text: "Îți mulțumesc pentru tot efortul tău, pentru grija ta și pentru felul în care ai pus dragoste chiar și în lucrurile simple. Tot ce mi-ai făcut mi-a plăcut enorm." },
    { src: "/images/WhatsApp Image 2026-04-28 at 19.35.42 (1).jpeg", title: "Dulce ca tine", text: "Mi-a plăcut nu doar gustul, ci și gândul că ai făcut toate astea cu atenție și suflet. Pentru mine înseamnă foarte mult." },
    { src: "/images/WhatsApp Image 2026-04-28 at 19.35.42 (2).jpeg", title: "Răsfățul tău", text: "Fiecare desert și fiecare mic detaliu făcut de tine au însemnat iubire, grijă și dorința de a mă face fericit." },
    { src: "/images/WhatsApp Image 2026-04-28 at 19.35.42 (3).jpeg", title: "Clătite cu suflet", text: "Nu voi uita niciodată cât de frumos te-ai gândit la mine și cât de mult m-am bucurat de tot ce ai pregătit pentru mine." },
  ];

  const promises = [
    "Sunt lângă tine, indiferent de distanță, timp sau încercări.",
    "Nu te las singură în zilele grele și nici în cele pline de emoții.",
    "Cred că Dumnezeu va lucra frumos pentru noi, la timpul potrivit.",
    "Te voi încuraja mereu și îți voi aminti cât de valoroasă ești.",
    "Te aleg pe tine cu sinceritate, răbdare și dragoste.",
    "Nu te voi părăsi pentru nimic.",
  ];
  
  const challenges = [
  "Fiecare joacă pe rând și încearcă să își bată propriul record până la miezul nopții.",
  "Cine pierde oferă un pupic când vă vedeți.",
  "Cine câștigă primește o declarație frumoasă.",
  "Dacă bateți amândoi recordul zilei trecute, sărbătoriți împreună cu un desert.",
];

  const wheelOptions = [
    { label: "Te iubesc", text: "Denisa, te iubesc sincer, profund și foarte frumos. Ești una dintre cele mai speciale persoane din viața mea și mă bucur enorm că exiști pentru mine." },
    { label: "Compliment", text: "Ești una dintre cele mai frumoase, feminine și delicate fete pe care le-am cunoscut vreodată." },
    { label: "Promisiune", text: "Îți promit că îți voi fi aproape, că te voi încuraja și că nu te voi lăsa singură în momentele grele." },
    { label: "Pupic", text: "Când ne vedem, primești un pupic lung și dulce, doar pentru că ești tu și pentru că meriți toată iubirea mea." },
    { label: "Îmbrățișare", text: "Primești o îmbrățișare foarte strânsă și caldă, din aceea care spune fără cuvinte: sunt aici pentru tine." },
    { label: "Dor", text: "Mi-e dor de tine mai des decât spun și aș vrea uneori doar să te am aproape." },
    { label: "Surpriză", text: "Ai câștigat o surpriză romantică: la următoarea ocazie îți scriu un mesaj și mai special, doar pentru tine." },
    { label: "Premiu mare", text: "Premiul mare: Denisa, te port foarte adânc în inimă, te prețuiesc enorm și îmi ești foarte dragă." },
  ];

  const envelopes = [
    { title: "Deschide când îți e dor de mine", message: "Dacă citești asta într-un moment în care îți este dor de mine, vreau să îți amintești că și tu ești foarte des în gândurile mele. Te iubesc și dorul meu pentru tine este sincer și frumos." },
    { title: "Deschide când ești tristă", message: "Nu ești singură. Ai în mine un om care ține enorm la tine și care și-ar dori să îți ia din durere și să îți lase mai multă liniște. Sunt lângă tine cu toată inima mea." },
    { title: "Deschide când ai nevoie de încurajare", message: "Vreau să îți amintești cât de capabilă, frumoasă și puternică ești. Eu cred în tine sincer și nu vreau să te îndoiești niciodată de valoarea ta." },
    { title: "Deschide când vrei să zâmbești", message: "Îți trimit un zâmbet mare de la distanță și o îmbrățișare imaginară foarte strânsă. Dacă aș fi lângă tine, probabil aș încerca acum să te fac să râzi din orice lucru mic." },
    { title: "Deschide înainte de un examen", message: "Ești inteligentă, pregătită și mai capabilă decât crezi. Respiră adânc, mergi cu încredere și nu uita: indiferent de rezultat, pentru mine rămâi o fată extraordinară." },
  ];

  const dailyMessages = [
    ["28 aprilie", "Denisa, astăzi vreau să îți spun din toată inima că ești una dintre cele mai frumoase binecuvântări pe care le-am primit. Prezența ta în viața mea a adus o liniște și o lumină pe care nu le pot explica pe deplin în cuvinte. Îmi place enorm felul tău de a fi, delicatețea ta, frumusețea ta și sufletul tău atât de cald. Vreau să știi că te iubesc sincer și profund, iar în fiecare zi aleg să îți fiu aproape cu toată inima mea."],
    ["29 aprilie", "Denisa, când mă gândesc la tine, simt că inima mea se umple de recunoștință. Ești un om atât de special, iar felul în care mă faci să mă simt contează enorm pentru mine. Îmi place să știu că exiști, să știu că te am în viața mea și să port în suflet toate momentele frumoase pe care le-am trăit împreună. Vreau să nu uiți niciodată că ești iubită, prețuită și foarte importantă pentru mine."],
    ["30 aprilie", "Astăzi vreau să îți spun, Denisa, că frumusețea ta nu este doar în privirea ta sau în zâmbetul tău, ci și în felul în care iubești, în felul în care dăruiești și în bunătatea pe care o porți în suflet. Pentru mine ești o fată rară, una dintre acele persoane care nu doar intră în viața unui om, ci îi schimbă ceva în inimă. Eu simt asta cu tine și îți mulțumesc că exiști în viața mea."],
    ["1 mai", "Denisa, în ziua aceasta vreau să îți amintesc cât de mult însemni pentru mine. Chiar și atunci când nu sunt lângă tine fizic, gândul meu este foarte des la tine. Îmi pasă de tine, de sufletul tău, de liniștea ta și de tot ceea ce simți. Îmi doresc să fiu omul care îți aduce încurajare, siguranță și pace, omul care îți amintește mereu că nu ești singură și că are pe cineva care o iubește cu adevărat."],
    ["2 mai", "Iubita mea, uneori mă opresc și mă gândesc cât de mult mi-ai schimbat viața doar prin simplul fapt că ai intrat în ea. Ai adus emoție, dor, frumusețe și multă sensibilitate în sufletul meu. Mă faci să văd iubirea într-un mod mai profund și mai sincer. Pentru mine, tu nu ești doar o persoană dragă, ci un loc al inimii mele unde simt că există lumină, căldură și pace."],
    ["3 mai", "Denisa, vreau să știi că te admir mult. Te admir pentru felul tău de a fi, pentru răbdarea ta, pentru frumusețea ta naturală și pentru sensibilitatea ta. Te admir pentru că ești delicată și puternică în același timp. Iar dincolo de tot, te iubesc pentru omul care ești. Îți promit că voi încerca mereu să fiu lângă tine, să te susțin și să te fac să simți cât de valoroasă ești pentru mine."],
    ["4 mai", "Astăzi vreau să îți spun, Denisa, că pentru mine ești mai mult decât frumoasă. Ești profundă, blândă, feminină și specială într-un fel care nu se întâlnește des. Când mă gândesc la tine, nu mă gândesc doar la chipul tău frumos, ci la tot ceea ce porți în inimă. Și exact asta mă face să te prețuiesc atât de mult. Îmi doresc să fii mereu conștientă de cât de minunată ești."],
    ["5 mai", "Denisa, în fiecare zi îmi dau seama tot mai mult cât de mult contezi pentru mine. Îmi lipsești în momentele în care nu te am aproape și mă bucur din tot sufletul în clipele în care vorbim sau ne vedem. Tu ai reușit să lași ceva foarte frumos în inima mea, iar asta nu este puțin lucru. Vreau să îți fiu aproape în toate modurile în care pot și să simți mereu că ai în mine un sprijin sincer și statornic."],
    ["6 mai", "Iubirea mea, chiar și atunci când apar încercări sau lucruri care ne apasă, vreau să știi că eu nu mă îndepărtez de tine cu inima. Din contră, îmi doresc și mai mult să îți fiu aproape, să te încurajez și să te ajut să simți că nu porți totul singură. Cred în tine, cred în sufletul tău și cred că Dumnezeu vede ceea ce purtăm în inimă. De aceea aleg să sper și să rămân lângă tine cu toată sinceritatea mea."],
    ["7 mai", "Denisa, mă gândesc adesea cât de frumos este felul în care reușești să aduci lumină în jurul tău. Poate uneori nici nu îți dai seama cât de mult înseamnă simpla ta prezență pentru mine. Doar faptul că exiști în viața mea îmi aduce o stare de bine greu de explicat. Pentru mine ești o emoție frumoasă care nu trece, un dor blând și o parte foarte importantă din ceea ce simt zi de zi."],
    ["8 mai", "Astăzi vreau să îți mulțumesc, Denisa, pentru toate gesturile tale, pentru grija ta, pentru blândețea ta și pentru felul în care ai fost lângă mine. Chiar și lucrurile care poate ți se par mici au avut o valoare mare pentru mine. Eu le-am simțit și le-am păstrat în inimă. Îți mulțumesc că ai fost bună cu mine și că ai pus suflet în relația noastră. Asta m-a făcut să te prețuiesc și mai mult."],
    ["9 mai", "Denisa, dacă aș putea să îți arăt exact cum te vede inima mea, ai înțelege cât de specială ești pentru mine. În tine văd frumusețe, bunătate, tandrețe și ceva foarte rar: o liniște care ajunge direct în suflet. Vreau să îți spun clar că te iubesc și că nu ești pentru mine doar o fată frumoasă, ci un om extraordinar pe care îl port cu drag și respect în inima mea."],
    ["10 mai", "În ziua aceasta vreau să îți spun că îmi place enorm tot ce ține de tine: felul în care zâmbești, felul în care vorbești, felul în care mă privești și felul în care reușești să rămâi atât de feminină și naturală. Tu ai o frumusețe care nu stă doar în exterior, ci și în felul în care simți, în felul în care iubești și în felul în care îți pasă. Asta mă face să mă apropii de tine cu și mai mult drag."],
    ["11 mai", "Denisa, aș vrea să nu uiți niciodată un lucru: eu sunt lângă tine. Sunt aici cu gândul, cu inima și cu dorința sinceră de a îți fi bine. Chiar dacă uneori există lucruri care ne încearcă, eu aleg să nu mă las dus de frică sau de greutate, ci să rămân statornic lângă tine. Vreau să simți în mine un om care te iubește și care nu vrea să te lase singură în nicio etapă a vieții tale."],
    ["12 mai", "Astăzi mă gândesc la cât de mult îmi place că lângă tine pot simți și emoție, și pace în același timp. E ceva foarte special în felul în care mă faci să mă simt. Nu este doar atracție, nu este doar bucurie de moment, ci este ceva mai adânc, mai sincer și mai frumos. Eu te simt ca pe un om drag de tot, ca pe o prezență pe care o port cu căldură în suflet și pe care nu o pot trata niciodată superficial."],
    ["13 mai", "Denisa, astăzi vreau să îți spun că îmi doresc să fiu omul care îți amintește mereu cât de valoroasă ești. Când ai emoții, vreau să te încurajez. Când îți este greu, vreau să îți fiu sprijin. Când îți este dor, vreau să simți că și dorul meu este la fel de sincer. Nu vreau doar să îți spun că țin la tine, ci să simți asta în modul în care aleg să fiu prezent în viața ta."],
    ["14 mai", "Iubita mea, pentru mine ești o combinație rară de delicatețe și putere. Ai ceva atât de fin în felul tău de a fi, dar și o tărie pe care o admir mult. Îmi place să văd în tine nu doar frumusețe, ci și caracter, sensibilitate și profunzime. Asta te face să fii atât de specială pentru mine. Și tocmai pentru că ești așa, eu nu pot decât să te iubesc și să te prețuiesc din ce în ce mai mult."],
    ["15 mai", "Denisa, în fiecare zi în care mă gândesc la tine, simt că am motive reale să fiu recunoscător. Nu pentru că totul ar fi perfect, ci pentru că tu ești reală și pentru că ceea ce simt pentru tine este real. Îmi pasă de tine sincer, îmi doresc binele tău și vreau să fiu aproape de tine nu doar în clipele ușoare, ci și în cele care cer răbdare, credință și înțelegere."],
    ["16 mai", "Astăzi vreau să îți spun, Denisa, că ai un loc foarte special în inima mea. Sunt puțini oameni care reușesc să atingă atât de profund sufletul unui om, iar tu ai făcut asta fără să forțezi nimic, doar fiind tu. De aceea te port cu atâta drag în gândurile mele și de aceea îmi doresc ca în fiecare zi să simți cât de mult însemni pentru mine. Ești una dintre cele mai prețioase prezențe din viața mea."],
    ["17 mai", "Denisa, mă gândesc deseori la viitor și îmi doresc ca Dumnezeu să așeze frumos lucrurile pentru noi. Poate nu știm acum cum se vor lega toate, dar eu aleg să cred, să sper și să mă rog pentru povestea noastră. Vreau să știi că nu privesc ceea ce este între noi ca pe ceva trecător sau ușor de aruncat deoparte. Din contră, te port foarte serios în inimă și îmi doresc să păstrez viu tot ce este frumos între noi."],
    ["18 mai", "Iubirea mea, azi vreau doar să îți spun că te iubesc. Te iubesc pentru chipul tău frumos, pentru privirea ta blândă, pentru zâmbetul tău și pentru tot ceea ce ascunde sufletul tău. Te iubesc pentru că reușești să mă faci să simt altfel viața și pentru că ai adus în mine o emoție sinceră și curată. Și mai mult decât atât, te iubesc pentru omul extraordinar care ești în fiecare zi."],
    ["19 mai", "Denisa, îmi place să mă gândesc la noi și la toate momentele care au rămas în sufletul meu. Unele au fost simple, altele speciale, dar toate au avut o valoare aparte pentru că tu ai fost acolo. Tu ai darul acesta de a face ca lucrurile mici să capete însemnătate mare. Și tocmai de aceea îmi este atât de drag tot ce ține de tine. În inima mea, amintirile cu tine au o lumină specială."],
    ["20 mai", "Astăzi vreau să îți spun că îmi doresc să îți fiu pace, nu povară. Îmi doresc să îți fiu încurajare, nu teamă. Îmi doresc să simți că lângă mine ai un om care te iubește, te respectă și te privește cu sinceritate. Nu vreau niciodată să te fac să te îndoiești de locul tău în inima mea. Pentru mine ești foarte importantă și vreau ca asta să se vadă nu doar în cuvinte, ci și în felul în care aleg să fiu pentru tine."],
    ["21 mai", "Denisa, poate că uneori nu reușesc să spun perfect tot ce simt, dar vreau să știi că inima mea vorbește despre tine foarte frumos. Vorbește despre dor, despre iubire, despre grijă și despre recunoștință. Pentru mine ești o fată aparte, una dintre acele persoane care nu se uită ușor și care rămân adânc în suflet. De aceea îmi doresc să te fac să simți cât de valoroasă ești pentru mine."],
    ["22 mai", "Astăzi mă rog ca Dumnezeu să îți dea pace, bucurie și multă lumină în suflet. Și mă rog, de asemenea, să lucreze frumos și pentru noi. Eu cred că nimic din ceea ce este sincer și purtat cu drag în inimă nu este nevăzut înaintea Lui. De aceea vreau să rămân cu credință, cu răbdare și cu dragoste lângă tine. Iar tu să știi că ai în mine un om care te poartă cu seriozitate și afecțiune în rugăciune și în inimă."],
    ["23 mai", "Denisa, ești atât de specială pentru mine încât uneori mi se pare că nici cele mai frumoase cuvinte nu reușesc să spună tot. Tu ai un fel de a fi care mă atrage, mă liniștește și mă face să te admir din ce în ce mai mult. Îmi place frumusețea ta, dar mai mult de atât îmi place sufletul tău. Iar când acestea două se întâlnesc într-un singur om, rezultatul este ceva foarte rar. Pentru mine, acel ceva ești tu."],
    ["24 mai", "Astăzi vreau să îți mulțumesc din nou pentru felul în care m-ai iubit prin gesturi, prin atenție și prin lucrurile mici făcute cu suflet. Poate nu ți-am spus mereu suficient, dar eu am simțit și am apreciat tot. Tot ce ai făcut pentru mine m-a făcut să mă simt iubit, văzut și important. Iar asta nu înseamnă puțin. Îți mulțumesc, Denisa, pentru că ai pus atât de mult suflet și frumusețe în tot ceea ce ai oferit."],
    ["25 mai", "Denisa, vreau să știi că te aleg pe tine. Nu doar în momentele în care totul este ușor, ci și în cele în care avem nevoie de mai multă răbdare, mai multă credință și mai multă putere. Aleg să rămân cu inima lângă tine și să nu tratez superficial ceea ce simt pentru tine. Pentru mine, tu contezi cu adevărat și de aceea îmi doresc să îți fiu aproape, să te susțin și să nu te las să te simți singură."],
    ["26 mai", "Iubita mea, azi vreau să îți spun că una dintre dorințele mele cele mai sincere este să te știu bine, liniștită și iubită. Îmi pasă de starea ta, de inima ta și de tot ce trăiești. Când îți este greu, să știi că aș vrea să pot lua din apăsarea ta și să îți las mai multă pace. Când îți este bine, mă bucur sincer pentru tine. Iar în toate acestea, ceea ce rămâne constant este dragostea și grija mea pentru tine."],
    ["27 mai", "Denisa, ești pentru mine o emoție frumoasă care nu se stinge. Chiar și atunci când ziua trece, gândul la tine rămâne. Chiar și atunci când nu vorbim, dorul tot acolo este. Și chiar și atunci când apar încercări, inima mea nu renunță la ceea ce simte. De aceea vreau să îți spun din nou că te iubesc, că te prețuiesc și că îmi doresc să simți mereu cât de profund și sincer este locul tău în inima mea."],
    ["28 mai", "Denisa, astăzi se încheie această lună de mesaje, dar nu și ceea ce simt pentru tine. Din contră, dacă este ceva ce vreau să rămână clar după fiecare zi, este că te iubesc sincer, că te prețuiesc enorm și că îmi ești foarte dragă. Îți mulțumesc pentru tot ce ești, pentru tot ce ai adus în viața mea și pentru tot ce ai lăsat frumos în inima mea. Vreau să continui să fiu lângă tine, să te încurajez, să te iubesc și să cred că Dumnezeu va lucra frumos pentru noi. Iubita mea, ești specială pentru mine mai mult decât pot spune în cuvinte."],
  ];

  const sectionImages = {
    beauty: denisaPhotos,
    moments: ourMoments,
    food: foodMemories,
  };

  const startDate = new Date(2026, 3, 28);
  const unlockedCount = getUnlockedCount(new Date(), startDate, dailyMessages.length);

  const winnerText = useMemo(() => {
    if (dailyScores.Roberto === 0 && dailyScores.Denisa === 0) return "Provocarea zilnică începe acum. La miezul nopții se resetează și începe o zi nouă. ♡";
    if (dailyScores.Roberto === dailyScores.Denisa) return "Momentan sunteți la egalitate. Se anunță o zi intensă. ✨";
    if (dailyScores.Roberto > dailyScores.Denisa) return "Roberto conduce provocarea zilei. Denisa, mai ai timp până la miezul nopții să îl depășești. 💗";
    return "Denisa conduce provocarea zilei. Roberto, trebuie să recuperezi până la miezul nopții. 💞";
  }, [dailyScores]);

  const segmentAngle = 360 / wheelOptions.length;
  const wheelGradient = useMemo(() => {
    const colors = ["#fecdd3", "#fbcfe8", "#fde68a", "#fecaca", "#f9a8d4", "#fcd34d"];
    let start = 0;
    const parts = wheelOptions.map((_, index) => {
      const end = start + segmentAngle;
      const piece = `${colors[index % colors.length]} ${start}deg ${end}deg`;
      start = end;
      return piece;
    });
    return `conic-gradient(from -90deg, ${parts.join(", ")})`;
  }, [segmentAngle, wheelOptions.length]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const todayKey = getTodayKey();
      if (todayKey !== lastResetDate) {
        setDailyScores({ Roberto: 0, Denisa: 0 });
        setLastResetDate(todayKey);
        setFlappyStarted(false);
        setFlappyReady(false);
        setFlappyGameOver(false);
        setBirdY(220);
        setBirdVelocity(0);
        setPipes([{ x: 520, gapY: 170, passed: false }]);
        setRunScore(0);

        birdYRef.current = 220;
        birdVelocityRef.current = 0;
        pipesRef.current = [{ x: 520, gapY: 170, passed: false }];
        runScoreRef.current = 0;

        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [lastResetDate]);

  useEffect(() => {
    if (!flappyStarted || flappyGameOver || flappyReady) return;

    let frameId = 0;

    const loop = () => {
      const nextVelocity = birdVelocityRef.current + gravityRef.current;
      const nextBirdY = birdYRef.current + nextVelocity;

      let nextPipes = pipesRef.current
        .map((pipe) => ({ ...pipe, x: pipe.x - 1.45 }))
        .filter((pipe) => pipe.x > -80);

      const lastPipe = nextPipes[nextPipes.length - 1];
      if (!lastPipe || lastPipe.x < 290) {
        const randomGapY = 85 + Math.floor(Math.random() * 220);
        nextPipes.push({ x: 520, gapY: randomGapY, passed: false });
      }

      let nextRunScore = runScoreRef.current;
      nextPipes = nextPipes.map((pipe) => {
        if (!pipe.passed && pipe.x + 70 < 120) {
          nextRunScore += 1;
          return { ...pipe, passed: true };
        }
        return pipe;
      });

      const birdTop = nextBirdY;
      const birdBottom = nextBirdY + 34;
      const birdLeft = 105;
      const birdRight = 139;

      let collided = birdTop <= 0 || birdBottom >= 500;

      if (!collided) {
        for (const pipe of nextPipes) {
          const hitsX = birdRight > pipe.x && birdLeft < pipe.x + 70;
          const gapTop = pipe.gapY;
          const gapBottom = pipe.gapY + gapSizeRef.current;
          if (hitsX && (birdTop < gapTop || birdBottom > gapBottom)) {
            collided = true;
            break;
          }
        }
      }

      birdVelocityRef.current = nextVelocity;
      birdYRef.current = nextBirdY;
      pipesRef.current = nextPipes;
      runScoreRef.current = nextRunScore;

      setBirdVelocity(nextVelocity);
      setBirdY(nextBirdY);
      setPipes(nextPipes);
      setRunScore(nextRunScore);

      if (collided) {
        finishRun(nextRunScore);
        return;
      }

      frameId = requestAnimationFrame(loop);
      animationRef.current = frameId;
    };

    frameId = requestAnimationFrame(loop);
    animationRef.current = frameId;
    return () => cancelAnimationFrame(frameId);
  }, [flappyStarted, flappyGameOver, flappyReady]);

  function startFlappyGame() {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setFlappyStarted(false);
    setFlappyReady(true);
    setFlappyGameOver(false);
    setBirdY(220);
    setBirdVelocity(0);
    setPipes([{ x: 520, gapY: 170, passed: false }]);
    setRunScore(0);

    birdYRef.current = 220;
    birdVelocityRef.current = 0;
    pipesRef.current = [{ x: 520, gapY: 170, passed: false }];
    runScoreRef.current = 0;
  }

  function flap() {
    if (flappyGameOverRef.current) return;

    if (flappyReady) {
      setFlappyReady(false);
      setFlappyStarted(true);
      flappyStartedRef.current = true;
      birdVelocityRef.current = jumpRef.current;
      setBirdVelocity(jumpRef.current);
      return;
    }

    if (!flappyStartedRef.current) return;
    birdVelocityRef.current = jumpRef.current;
    setBirdVelocity(jumpRef.current);
  }

  function finishRun(finalScore = runScoreRef.current) {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setFlappyStarted(false);
    setFlappyReady(false);
    setFlappyGameOver(true);
    flappyStartedRef.current = false;
    flappyGameOverRef.current = true;
    setDailyScores((prev) => ({
      ...prev,
      [selectedPlayerRef.current]: Math.max(prev[selectedPlayerRef.current], finalScore),
    }));
  }

  function handleSpinWheel() {
    if (isSpinning) return;

    const selectedIndex = Math.floor(Math.random() * wheelOptions.length);
    const targetCenterAngle = 360 - (selectedIndex * segmentAngle + segmentAngle / 2);
    const currentNormalized = ((wheelRotation % 360) + 360) % 360;
    const correction = (targetCenterAngle - currentNormalized + 360) % 360;
    const nextRotation = wheelRotation + 360 * 6 + correction;

    setIsSpinning(true);
    setSpinResult("");
    setShowConfetti(false);
    setWheelRotation(nextRotation);

    window.setTimeout(() => {
      const result = wheelOptions[selectedIndex];
      setSpinResult(result.text);
      setIsSpinning(false);
      if (result.label === "Premiu mare") {
        setShowConfetti(true);
        window.setTimeout(() => setShowConfetti(false), 3000);
      }
    }, 4200);
  }

  return (
    <div className="page-shell">
      {currentPage === "home" && (
        <>
          <section className="container hero">
            <div>
              <p className="eyebrow">A love note, written with my whole heart</p>
              <h1 className="hero-title">Pentru Denisa</h1>
              <p className="lead">
                Denisa, am vrut să îți las ceva care să rămână. Un mic univers doar pentru tine,
                în care fiecare secțiune spune ceva din ce simt pentru tine.
              </p>
              <p className="lead" style={{ marginTop: 18 }}>
                De aici poți intra în fiecare colț al inimii mele: poze, mesaje, mulțumiri,
                promisiuni și chiar un joculeț doar pentru voi doi.
              </p>
            </div>
            <div className="hero-image-wrap">
              <div className="hero-glow" />
              <div className="hero-card">
                <img src={heroImage} alt="Roberto și Denisa" />
              </div>
            </div>
          </section>

          <section className="container" style={{ paddingBottom: 58 }}>
            <div className="menu-grid">
              <MenuCard emoji="💌" title="Mesajul meu pentru tine" description="Intră aici ca să citești mesajul principal, scris din inimă pentru tine." onClick={() => setCurrentPage("message")} />
              <MenuCard emoji="🌷" title="Frumusețea ta" description="O galerie specială cu poze și gânduri despre cât de frumoasă și specială ești." onClick={() => setCurrentPage("beauty")} />
              <MenuCard emoji="🫶" title="Momentele noastre" description="Amintiri cu voi doi, momente simple și dragi care au rămas în sufletul meu." onClick={() => setCurrentPage("moments")} />
              <MenuCard emoji="🍓" title="Mulțumesc pentru grija ta" description="O secțiune dedicată lucrurilor bune și frumoase pe care le-ai făcut pentru mine." onClick={() => setCurrentPage("food")} />
              <MenuCard emoji="✨" title="Promisiunea mea" description="Lucrurile pe care vreau să le știi și promisiunile pe care le port sincer în inimă." onClick={() => setCurrentPage("promises")} />
              <MenuCard emoji="🗓️" title="Calendarul inimii mele" description="Mesaje zilnice pentru tine, care se deblochează pe rând, de la 28 aprilie până la 28 mai." onClick={() => setCurrentPage("calendar")} />
              <MenuCard emoji="💌" title="Deschide când..." description="Plicuri virtuale pe care le poate deschide în momente speciale: când îi e dor, când e tristă, când are nevoie de încurajare." onClick={() => setCurrentPage("openwhen")} />
              <MenuCard emoji="🎡" title="Roata surprizelor" description="Apasă și primește o surpriză romantică: compliment, declarație, promisiune sau mesaj special." onClick={() => setCurrentPage("wheel")} />
              <MenuCard emoji="🎮" title="Duelul inimilor" description="O provocare zilnică în stil flappy bird. Cine merge mai mult până la miezul nopții, câștigă." onClick={() => setCurrentPage("game")} />
              <MenuCard emoji="🔐" title="Finalul secret" description="Un buton special care deschide cea mai profundă declarație din tot site-ul." onClick={() => setCurrentPage("secret")} />
              <MenuCard emoji="🤍" title="Până ne revedem" description="Mesajul meu de final, despre voi, despre distanță și despre ce simt pentru tine." onClick={() => setCurrentPage("ending")} />
            </div>
          </section>
        </>
      )}

      {currentPage === "message" && (
        <section className="container section-page">
          <BackButton onClick={() => setCurrentPage("home")} />
          <div className="message-box panel" style={{ marginTop: 24 }}>
            <p className="eyebrow">Un mesaj pentru tine</p>
            <h2 className="section-title">Denisa, tu ești locul meu drag</h2>
            <p>În prezența ta, totul capătă liniște. În zâmbetul tău, găsesc frumusețe. În felul tău de a fi, găsesc ceva rar, cald și profund. Vreau să știi fără nicio îndoială că eu sunt aici, lângă tine.</p>
            <p>Cred din tot sufletul că Dumnezeu vede tot ceea ce purtăm în inimă și că El lucrează pentru noi, chiar și atunci când noi nu înțelegem totul.</p>
            <p>Denisa, îți promit că te voi încuraja mereu, că îți voi fi sprijin și că nu te voi părăsi pentru nimic.</p>
            <div className="heart-sign">♡</div>
          </div>
        </section>
      )}

      {currentPage === "beauty" && (
        <section className="container section-page">
          <BackButton onClick={() => setCurrentPage("home")} />
          <SectionHeading eyebrow="Pentru tine, Denisa" title="Frumusețea ta" description="Câteva imagini care îmi amintesc cât de frumoasă, delicată și specială ești pentru mine." />
          <div className="card-grid">
            {sectionImages.beauty.map((item) => <PhotoCard key={item.src} {...item} />)}
          </div>
        </section>
      )}

      {currentPage === "moments" && (
        <section className="container section-page">
          <BackButton onClick={() => setCurrentPage("home")} />
          <SectionHeading eyebrow="Momentele noastre" title="Noi doi" description="Fiecare clipă cu tine a lăsat ceva frumos în mine. Toate au devenit amintiri prețioase pentru că le-am trăit împreună." />
          <div className="card-grid">
            {sectionImages.moments.map((item) => <PhotoCard key={item.src} {...item} />)}
          </div>
        </section>
      )}

      {currentPage === "food" && (
        <section className="container section-page">
          <BackButton onClick={() => setCurrentPage("home")} />
          <SectionHeading eyebrow="Pentru tot ce ai făcut pentru mine" title="Mulțumesc pentru grija ta" description="Vreau să îți mulțumesc pentru fiecare gest prin care mi-ai arătat grijă și iubire. Tot ce mi-ai făcut mi-a plăcut foarte mult." />
          <div className="card-grid">
            {sectionImages.food.map((item) => <PhotoCard key={item.src} {...item} food />)}
          </div>
        </section>
      )}

      {currentPage === "promises" && (
        <section className="container section-page">
          <BackButton onClick={() => setCurrentPage("home")} />
          <SectionHeading eyebrow="Ce îți promit" title="Promisiunea mea pentru tine" />
          <div className="promise-grid">
            {promises.map((text, index) => <PromiseCard key={index} text={text} />)}
          </div>
        </section>
      )}

      {currentPage === "calendar" && (
        <section className="container section-page">
          <BackButton onClick={() => setCurrentPage("home")} />
          <SectionHeading eyebrow="O lună de mesaje pentru tine" title="Calendarul inimii mele" description="În fiecare zi se deblochează câte un nou mesaj pentru tine, începând de la 28 aprilie și până la 28 mai." />
          <div className="daily-grid">
            {dailyMessages.map(([dateLabel, message], index) => (
              <DailyMessageCard
                key={dateLabel}
                dayIndex={index}
                dateLabel={dateLabel}
                message={message}
                unlocked={index < unlockedCount}
              />
            ))}
          </div>
        </section>
      )}

      {currentPage === "openwhen" && (
        <section className="container section-page">
          <BackButton onClick={() => setCurrentPage("home")} />
          <SectionHeading eyebrow="Plicuri pentru tine" title="Deschide când..." description="O colecție de mesaje pe care să le deschizi exact în momentele în care ai nevoie de ele." />
          <div className="card-grid">
            {envelopes.map((item, index) => <EnvelopeCard key={index} {...item} />)}
          </div>
        </section>
      )}

      {currentPage === "wheel" && (
        <section className="container section-page">
          <BackButton onClick={() => setCurrentPage("home")} />
          <div className="wheel-box panel" style={{ marginTop: 24, position: "relative", overflow: "hidden" }}>
            <SectionHeading eyebrow="Surpriza ta" title="Roata surprizelor" description="Apasă pe buton și lasă iubirea să aleagă pentru tine o surpriză romantică." />
            {showConfetti &&
              Array.from({ length: 24 }).map((_, index) => (
                <span
                  key={index}
                  className="confetti"
                  style={{
                    left: `${(index * 4.1) % 100}%`,
                    width: `${6 + (index % 4)}px`,
                    height: `${10 + (index % 5)}px`,
                    background: ["#fb7185", "#f9a8d4", "#fcd34d", "#fecdd3"][index % 4],
                    animationDuration: `${1.8 + (index % 3) * 0.4}s`,
                    animationDelay: `${(index % 6) * 0.08}s`,
                  }}
                />
              ))}
            <div className="wheel-stage">
              <div className="wheel-wrap">
                <div className="wheel-pointer" />
                <div
                  className="wheel"
                  style={{
                    background: wheelGradient,
                    transform: `rotate(${wheelRotation}deg)`,
                    transition: isSpinning ? "transform 4.2s cubic-bezier(0.17, 0.67, 0.18, 1)" : "none",
                  }}
                >
                  {wheelOptions.map((option, index) => {
                    const angle = index * segmentAngle + segmentAngle / 2;
                    return (
                      <div
                        key={option.label}
                        className="wheel-segment-label"
                        style={{
                          transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-122px) rotate(${-angle}deg)`,
                        }}
                      >
                        {option.label}
                      </div>
                    );
                  })}
                  <div className="wheel-center">💖</div>
                </div>
              </div>
              <button className="primary-btn" style={{ marginTop: 26 }} onClick={handleSpinWheel} disabled={isSpinning}>
                {isSpinning ? "Roata se învârte..." : "Învârte roata"}
              </button>
              <div className="wheel-result">{spinResult || "Apasă pe buton și surpriza ta va apărea aici. ♡"}</div>
            </div>
          </div>
        </section>
      )}

      {currentPage === "game" && (
        <section className="container section-page">
          <BackButton onClick={() => setCurrentPage("home")} />
          <div className="panel" style={{ marginTop: 24, padding: 28 }}>
            <SectionHeading eyebrow="Provocarea zilei" title="Flappy Love Challenge" description="În fiecare zi la miezul nopții scorurile se resetează. Alege cine joacă, zboară cât mai mult și vezi cine are cel mai mare scor al zilei." />
            <div className="game-grid">
              <div className="game-board" onClick={flap}>
                {pipes.map((pipe, index) => (
                  <React.Fragment key={`${pipe.x}-${index}`}>
                    <div className="pipe top" style={{ left: pipe.x, top: 0, height: pipe.gapY }} />
                    <div className="pipe bottom" style={{ left: pipe.x, top: pipe.gapY + gapSizeRef.current, height: 500 - (pipe.gapY + gapSizeRef.current) }} />
                  </React.Fragment>
                ))}
                <div className="bird" style={{ left: 105, top: birdY }}>♡</div>
                <div className="score-pill left">Scor rundă: {runScore}</div>
                <div className="score-pill right">{selectedPlayer}</div>

                {!flappyStarted && !flappyReady && !flappyGameOver && (
                  <div className="overlay soft">
                    <div className="overlay-card">
                      <div className="eyebrow" style={{ marginBottom: 10 }}>Instrucțiuni</div>
                      <h3>Apasă ca să zbori</h3>
                      <p>Am făcut jocul mai lejer: inimioara cade mai lent, obstacolele vin mai încet și spațiul dintre ele este mai mare. După ce apeși pe butonul de start, jocul începe abia la primul tap pe ecran.</p>
                    </div>
                  </div>
                )}

                {flappyReady && (
                  <div className="overlay soft">
                    <div className="overlay-card">
                      <div className="eyebrow" style={{ marginBottom: 10 }}>Pregătit de start</div>
                      <h3>Apasă pe ecran ca să începi</h3>
                      <p>Inimioara nu mai cade imediat. Jocul pornește doar după primul tap în zona de joc.</p>
                    </div>
                  </div>
                )}

                {flappyGameOver && (
                  <div className="overlay blur">
                    <div className="overlay-card">
                      <div className="eyebrow" style={{ marginBottom: 10 }}>Runda s-a încheiat</div>
                      <h3>Scor: {runScore}</h3>
                      <p>Am salvat cel mai bun scor al lui {selectedPlayer} pentru ziua de azi. Poți încerca din nou sau schimba jucătorul.</p>
                      <button className="primary-btn" style={{ marginTop: 16 }} onClick={startFlappyGame}>Joacă din nou</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="sidebar-stack">
                <div className="score-card">
                  <div className="eyebrow" style={{ marginBottom: 12 }}>Jucător activ</div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                    <button className={`player-btn ${selectedPlayer === "Roberto" ? "active" : "inactive"}`} onClick={() => setSelectedPlayer("Roberto")}>Roberto</button>
                    <button className={`player-btn ${selectedPlayer === "Denisa" ? "active" : "inactive"}`} onClick={() => setSelectedPlayer("Denisa")}>Denisa</button>
                  </div>
                  <button className="primary-btn" style={{ marginTop: 18 }} onClick={startFlappyGame}>Pregătește jocul</button>
                </div>

                <div className="score-card">
                  <div className="eyebrow" style={{ marginBottom: 14 }}>Scorurile zilei</div>
                  <div className="score-row"><span className="score-name">Roberto</span><span className="score-value">{dailyScores.Roberto}</span></div>
                  <div className="score-row"><span className="score-name">Denisa</span><span className="score-value">{dailyScores.Denisa}</span></div>
                  <p style={{ marginTop: 16 }}>{winnerText}</p>
                </div>

                <div className="challenge-card">
                  <div className="eyebrow" style={{ marginBottom: 14 }}>Regula jocului</div>
                  <p>În fiecare zi la miezul nopții scorurile se resetează automat. Fiecare dintre voi poate juca oricât dorește, iar cel mai bun scor din ziua respectivă rămâne salvat.</p>
                </div>

                {challenges.map((challenge, index) => (
                  <div className="challenge-card" key={index}>
                    <p>{challenge}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {currentPage === "secret" && (
        <section className="container section-page">
          <BackButton onClick={() => setCurrentPage("home")} />
          <div className="secret-box panel" style={{ marginTop: 24 }}>
            <p className="eyebrow">Doar pentru tine</p>
            <h2 className="section-title">Apasă doar dacă vrei să afli ce simt cu adevărat</h2>
            <div className="secret-details">
              <details>
                <summary className="secret-summary">Deschide finalul secret ♡</summary>
                <div className="secret-content">
                  <p>Denisa, adevărul este că ceea ce simt pentru tine este mai profund decât reușesc uneori să spun. Tu nu ești doar o persoană dragă pentru mine, ci un om care a ajuns foarte adânc în inima mea.</p>
                  <p>Ești una dintre cele mai frumoase fete pe care le-am cunoscut, dar mai mult decât frumusețea ta, mă atinge sufletul tău. Și tocmai de aceea, în ciuda oricăror încercări, eu nu vreau să renunț la tine și nu vreau să te las singură.</p>
                  <p>Te iubesc sincer, te port adânc în inima mea și îmi doresc să rămân lângă tine cu toată dragostea, răbdarea și credința pe care le am.</p>
                </div>
              </details>
            </div>
          </div>
        </section>
      )}

      {currentPage === "ending" && (
        <section className="container section-page">
          <BackButton onClick={() => setCurrentPage("home")} />
          <div className="ending-box panel" style={{ marginTop: 24 }}>
            <p className="eyebrow">Până ne revedem</p>
            <h2 className="section-title">Distanța nu schimbă nimic, Denisa</h2>
            <p>Poate că acum sunt kilometri între noi și poate că nu toate lucrurile sunt ușoare, dar nimic nu poate lua din ceea ce simt pentru tine. Tu rămâi aceeași prezență dragă, aceeași emoție blândă și aceeași parte din inima mea care face totul mai frumos.</p>
            <p>Vreau să îți amintești mereu că sunt alături de tine, că mă rog pentru voi și că nu voi înceta să cred că Dumnezeu va lucra frumos în povestea voastră.</p>
            <p style={{ fontStyle: "italic", color: "#8b7b75" }}>Cu toată inima, pentru tine.</p>
            <p style={{ fontSize: 28, marginTop: 10 }}>Iubitul tău drag, Roberto</p>
          </div>
        </section>
      )}
    </div>
  );
}
