'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ── 상수 ──────────────────────────────────────────────────────────────────────
const BLUE  = '#1e6fff'
const RED   = '#ff1e1e'
const BLACK = '#000000'
const DARK  = '#0a0a0a'
const G1    = '#1a1a1a'
const G2    = '#2a2a2a'
const G3    = '#666666'
const G4    = '#aaaaaa'
const WHITE = '#ffffff'
const FONT  = "'Black Han Sans', 'Apple SD Gothic Neo', Impact, sans-serif"

// ── 더미 게시글 ───────────────────────────────────────────────────────────────
type Post = { id: number; nickname: string; text: string; likes: number; time: string }

const INIT_POSTS: { yeonnim: Post[]; tanhek: Post[] } = {
  yeonnim: [
    { id: 1, nickname: '민주당원84',  text: '이재명 없으면 누가 야권을 이끌어요? 현실적으로 대안이 없습니다.',     likes: 312, time: '2분 전' },
    { id: 2, nickname: '진보의횃불',  text: '경제 위기엔 연속성이 필요. 지금 교체는 더 큰 혼란을 부릅니다.',     likes: 218, time: '5분 전' },
    { id: 3, nickname: '광주시민k',   text: '검찰독재에 맞서 싸운 사람이 이재명. 여기서 포기할 수 없다.',         likes: 187, time: '9분 전' },
    { id: 4, nickname: '청년민주',    text: '민주당 지지율 보세요. 민심은 연임을 원하고 있습니다.',               likes: 144, time: '14분 전' },
  ],
  tanhek: [
    { id: 5, nickname: '보수의칼',    text: '사법 리스크 안고 국정 운영? 나라 망합니다. 당장 내려와야 해요.',     likes: 445, time: '1분 전' },
    { id: 6, nickname: '정의시민',    text: '유죄 판결 받은 인물이 대통령직을 계속한다는 게 말이 됩니까?',        likes: 389, time: '4분 전' },
    { id: 7, nickname: '법치주의자',  text: '법 앞에 예외 없다. 대통령도 마찬가지. 탄핵이 정답입니다.',          likes: 276, time: '8분 전' },
    { id: 8, nickname: '국민의힘팬',  text: '이런 상황에 연임? 대한민국 국격이 어디 갑니까. 탄핵하세요.',        likes: 201, time: '12분 전' },
  ],
}

const TICKERS = [
  { label: 'KOSPI',    value: '2,487.32', change: '▲12.4',  up: true  },
  { label: 'KOSDAQ',   value: '721.18',   change: '▼3.2',   up: false },
  { label: 'USD/KRW',  value: '1,368',    change: '▲4',     up: false },
  { label: '국고채10Y', value: '3.41%',   change: '▲0.03',  up: false },
  { label: 'WTI',      value: '$74.2',    change: '▼0.8',   up: false },
  { label: 'NASDAQ',   value: '19,204',   change: '▲88.3',  up: true  },
]

const Y_BANNERS = (pct: number) => pct >= 50
  ? [`연임세력 총집결! 앞서고 있다!`, `지금 이 순간이 역사다`, `우리가 막아낸다!`]
  : [`연임 진영 위기! 반격이 필요하다`, `4050의 힘을 보여줘!`, `지금 당장 싸워라!`]

const T_BANNERS = (pct: number) => pct >= 50
  ? [`탄핵 찬성세력 총집결 중!`, `국민이 심판한다!`, `탄핵 완수까지 멈추지 않는다`]
  : [`탄핵 진영 반격 시작!`, `법치의 심판을 보여줘!`, `지금 뒤집어라!`]

// ── 스파크 타입 ───────────────────────────────────────────────────────────────
type Spark = { id: number; x: number; y: number; color: string }

// ── 메인 ──────────────────────────────────────────────────────────────────────
export default function Page() {
  const [stance,     setStance]     = useState<'yeonnim' | 'tanhek' | null>(null)
  const [texts,      setTexts]      = useState({ yeonnim: '', tanhek: '' })
  const [yRaw,       setYRaw]       = useState(52.0)           // 연임 %
  const [displayed,  setDisplayed]  = useState({ y: 52.0, t: 48.0 })
  const [totalVotes, setTotalVotes] = useState(182437)
  const [posts,      setPosts]      = useState(INIT_POSTS)
  const [sparks,     setSparks]     = useState<Spark[]>([])
  const [bannerIdx,  setBannerIdx]  = useState(0)
  const [yFlash,     setYFlash]     = useState(false)
  const [tFlash,     setTFlash]     = useState(false)
  const nextId = useRef(100)

  // 실시간 투표율 변동
  useEffect(() => {
    const id = setInterval(() => {
      setYRaw(p => Math.min(65, Math.max(35, +(p + (Math.random() - 0.49) * 0.4).toFixed(2))))
      setTotalVotes(v => v + Math.floor(Math.random() * 4))
    }, 1800)
    return () => clearInterval(id)
  }, [])

  // 숫자 틱틱 올라가는 효과 — yRaw 바뀔 때마다 빠르게 카운팅
  useEffect(() => {
    const target = { y: yRaw, t: +(100 - yRaw).toFixed(2) }
    let frame = 0
    const id = setInterval(() => {
      frame++
      setDisplayed(prev => {
        const dy = (target.y - prev.y) * 0.25
        const dt = (target.t - prev.t) * 0.25
        return {
          y: Math.abs(dy) < 0.01 ? target.y : +(prev.y + dy).toFixed(2),
          t: Math.abs(dt) < 0.01 ? target.t : +(prev.t + dt).toFixed(2),
        }
      })
      if (frame > 20) clearInterval(id)
    }, 40)
    return () => clearInterval(id)
  }, [yRaw])

  // 배너 순환
  useEffect(() => {
    const id = setInterval(() => setBannerIdx(i => (i + 1) % 3), 3000)
    return () => clearInterval(id)
  }, [])

  // 스파크 생성
  const addSparks = useCallback((e: React.MouseEvent, color: string) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top  + rect.height / 2
    const batch: Spark[] = Array.from({ length: 8 }, (_, i) => ({
      id: nextId.current++,
      x: cx + (Math.random() - 0.5) * 40,
      y: cy + (Math.random() - 0.5) * 20,
      color,
    }))
    setSparks(s => [...s, ...batch])
    setTimeout(() => setSparks(s => s.filter(sp => !batch.find(b => b.id === sp.id))), 700)
  }, [])

  // 글 등록
  const submitPost = (side: 'yeonnim' | 'tanhek') => {
    const text = texts[side].trim()
    if (!text) return
    const np: Post = {
      id: nextId.current++,
      nickname: side === 'yeonnim' ? '연임지지자' : '탄핵찬성자',
      text, likes: 0, time: '방금 전',
    }
    setPosts(p => ({ ...p, [side]: [np, ...p[side]] }))
    setTexts(t => ({ ...t, [side]: '' }))
    if (side === 'yeonnim') { setYFlash(true); setTimeout(() => setYFlash(false), 600) }
    else                    { setTFlash(true); setTimeout(() => setTFlash(false), 600) }
  }

  const tRaw = +(100 - yRaw).toFixed(2)

  return (
    <div style={{ minHeight: '100vh', background: BLACK, fontFamily: FONT, color: WHITE, position: 'relative', overflow: 'hidden' }}>

      {/* ── 스파크 레이어 ── */}
      {sparks.map(sp => (
        <div key={sp.id} style={{
          position: 'fixed', left: sp.x, top: sp.y, width: 8, height: 8,
          borderRadius: '50%', background: sp.color, zIndex: 9999,
          pointerEvents: 'none',
          animation: 'spark 0.7s ease-out forwards',
          ['--dx' as string]: `${(Math.random() - 0.5) * 120}px`,
        }} />
      ))}

      {/* ── 최상단 경제 티커 ── */}
      <div style={{
        background: '#0a0a0a', borderBottom: `1px solid ${G2}`,
        height: 30, overflow: 'hidden', display: 'flex', alignItems: 'center', fontSize: 11,
      }}>
        <div style={{
          flexShrink: 0, background: RED, color: WHITE,
          padding: '0 12px', height: '100%',
          display: 'flex', alignItems: 'center', fontWeight: 900, letterSpacing: 2, fontSize: 10,
        }}>
          ● LIVE
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{
            display: 'inline-flex', gap: 40, whiteSpace: 'nowrap',
            animation: 'tickerScroll 20s linear infinite',
          }}>
            {[...TICKERS, ...TICKERS].map((t, i) => (
              <span key={i} style={{ display: 'flex', gap: 6, fontWeight: 700 }}>
                <span style={{ color: G4 }}>{t.label}</span>
                <span style={{ color: WHITE }}>{t.value}</span>
                <span style={{ color: t.up ? '#00ff88' : RED }}>{t.change}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 헤더 ── */}
      <header style={{
        background: DARK, borderBottom: `2px solid ${G2}`,
        padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: -1 }}>
          President<span style={{ color: RED }}>OX</span>
        </div>
        <div style={{
          background: RED, color: WHITE, padding: '2px 10px', fontSize: 10,
          fontWeight: 900, letterSpacing: 2, animation: 'neonRed 2s ease-in-out infinite',
        }}>
          실시간 {totalVotes.toLocaleString()}명 전투 중
        </div>
      </header>

      {/* ── 히어로 ── */}
      <section style={{
        background: 'linear-gradient(180deg, #000 0%, #0a0008 100%)',
        padding: '32px 20px 0', textAlign: 'center',
        borderBottom: `3px solid ${G2}`,
      }}>
        {/* 인물 사진 */}
        <div style={{
          width: 150, height: 190, margin: '0 auto 20px',
          background: G1, position: 'relative', overflow: 'hidden',
          animation: 'glowPhoto 3s ease-in-out infinite',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, color: G3, lineHeight: 1.8,
          }}>
            이재명<br />사진
          </div>
          {/* 스캔라인 */}
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 2,
            background: 'rgba(255,255,255,0.08)',
            animation: 'scanline 3s linear infinite',
          }} />
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, background: `linear-gradient(${BLUE}, transparent)` }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 5, background: `linear-gradient(${RED}, transparent)` }} />
        </div>

        <div style={{ fontSize: 11, color: G4, letterSpacing: 6, marginBottom: 10, fontWeight: 900 }}>
          이재명 前 대통령
        </div>

        {/* 메인 헤드라인 — shake */}
        <h1 style={{
          fontSize: 'clamp(52px, 10vw, 88px)', fontWeight: 900,
          letterSpacing: -3, lineHeight: 1, marginBottom: 6,
          animation: 'shake 4s ease-in-out infinite',
        }}>
          <span style={{ color: BLUE, textShadow: `0 0 20px ${BLUE}99` }}>연임</span>
          <span style={{ color: G3, margin: '0 12px', fontSize: '0.5em' }}>vs</span>
          <span style={{ color: RED,  textShadow: `0 0 20px ${RED}99` }}>탄핵</span>
        </h1>

        <p style={{ fontSize: 12, color: G4, letterSpacing: 3, marginBottom: 24 }}>
          당신의 선택이 대한민국을 결정한다
        </p>

        {/* 투표 비율 바 */}
        <div style={{ maxWidth: 540, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: BLUE, textShadow: `0 0 12px ${BLUE}88` }}>
              {displayed.y.toFixed(1)}%
            </span>
            <span style={{ fontSize: 32, fontWeight: 900, color: RED, textShadow: `0 0 12px ${RED}88` }}>
              {displayed.t.toFixed(1)}%
            </span>
          </div>
          <div style={{ height: 16, background: RED, position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${displayed.y}%`, background: BLUE,
              transition: 'width 0.4s ease',
              boxShadow: `4px 0 12px ${BLUE}`,
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 10, color: G3, letterSpacing: 2 }}>
            <span>연임 지지</span>
            <span>탄핵 찬성</span>
          </div>
        </div>

        {/* 스탠스 선택 */}
        <div style={{ padding: '24px 16px 32px', maxWidth: 540, margin: '0 auto' }}>
          {stance === null ? (
            <>
              <div style={{ fontSize: 11, color: G4, letterSpacing: 3, marginBottom: 12 }}>
                ▼ 입장을 선택해야 토론 참여가 가능합니다 ▼
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setStance('yeonnim')} style={{
                  flex: 1, padding: '18px 0', background: BLUE, color: WHITE,
                  fontSize: 22, fontWeight: 900, letterSpacing: 4,
                  boxShadow: `0 0 20px ${BLUE}88`,
                  transition: 'all 0.15s',
                }}>
                  연임
                </button>
                <button onClick={() => setStance('tanhek')} style={{
                  flex: 1, padding: '18px 0', background: RED, color: WHITE,
                  fontSize: 22, fontWeight: 900, letterSpacing: 4,
                  boxShadow: `0 0 20px ${RED}88`,
                  transition: 'all 0.15s',
                }}>
                  탄핵
                </button>
              </div>
            </>
          ) : (
            <div style={{
              padding: '10px 16px',
              border: `2px solid ${stance === 'yeonnim' ? BLUE : RED}`,
              boxShadow: `0 0 12px ${stance === 'yeonnim' ? BLUE : RED}66`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 14, fontWeight: 900, color: stance === 'yeonnim' ? BLUE : RED, letterSpacing: 2 }}>
                나의 입장 : {stance === 'yeonnim' ? '연임 지지' : '탄핵 찬성'}
              </span>
              <button onClick={() => setStance(null)} style={{ fontSize: 11, color: G3, textDecoration: 'underline' }}>
                변경
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── 전쟁 게시판 ── */}
      <div style={{ display: 'flex', minHeight: '70vh' }}>

        {/* 연임 진지 */}
        <div style={{
          flex: 1, borderRight: `2px solid ${G2}`,
          animation: yFlash ? 'flashBlue 0.6s ease' : 'neonBlue 3s ease-in-out infinite',
          borderLeft: `3px solid ${BLUE}`,
          borderTop: `3px solid ${BLUE}`,
        }}>
          {/* 헤더 */}
          <div style={{
            background: `linear-gradient(135deg, ${BLUE}cc, #001a66)`,
            padding: '10px 16px', borderBottom: `1px solid ${BLUE}66`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: 3, color: WHITE, textShadow: `0 0 10px ${BLUE}` }}>
                🔵 연임 진지
              </span>
              <span style={{ fontSize: 11, color: '#88aaff', fontWeight: 700 }}>
                {Math.floor(totalVotes * yRaw / 100).toLocaleString()}명
              </span>
            </div>
            {/* 동적 배너 */}
            <div style={{
              fontSize: 11, color: yRaw >= 50 ? '#88ffcc' : '#ffcc44',
              fontWeight: 900, letterSpacing: 1,
              animation: 'slideInLeft 0.5s ease',
            }}>
              ▶ {Y_BANNERS(yRaw)[bannerIdx]}
            </div>
          </div>

          {/* 글쓰기 */}
          <WriteBox
            value={texts.yeonnim}
            onChange={v => setTexts(t => ({ ...t, yeonnim: v }))}
            onSubmit={() => submitPost('yeonnim')}
            onAttack={e => addSparks(e, BLUE)}
            disabled={stance !== 'yeonnim'}
            placeholder={stance === 'yeonnim' ? '연임 지지 의견을 작성하라!' : '입장 선택 후 참전 가능'}
            color={BLUE}
            side="yeonnim"
          />

          {posts.yeonnim.map(p => (
            <PostCard key={p.id} post={p} color={BLUE} />
          ))}
        </div>

        {/* 탄핵 진지 */}
        <div style={{
          flex: 1,
          animation: tFlash ? 'flashRed 0.6s ease' : 'neonRed 3s ease-in-out infinite',
          borderRight: `3px solid ${RED}`,
          borderTop: `3px solid ${RED}`,
        }}>
          {/* 헤더 */}
          <div style={{
            background: `linear-gradient(135deg, ${RED}cc, #660000)`,
            padding: '10px 16px', borderBottom: `1px solid ${RED}66`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: 3, color: WHITE, textShadow: `0 0 10px ${RED}` }}>
                🔴 탄핵 진지
              </span>
              <span style={{ fontSize: 11, color: '#ffaaaa', fontWeight: 700 }}>
                {Math.floor(totalVotes * tRaw / 100).toLocaleString()}명
              </span>
            </div>
            <div style={{
              fontSize: 11, color: tRaw >= 50 ? '#ffcc44' : '#ff8888',
              fontWeight: 900, letterSpacing: 1,
            }}>
              ▶ {T_BANNERS(tRaw)[bannerIdx]}
            </div>
          </div>

          <WriteBox
            value={texts.tanhek}
            onChange={v => setTexts(t => ({ ...t, tanhek: v }))}
            onSubmit={() => submitPost('tanhek')}
            onAttack={e => addSparks(e, RED)}
            disabled={stance !== 'tanhek'}
            placeholder={stance === 'tanhek' ? '탄핵 찬성 의견을 작성하라!' : '입장 선택 후 참전 가능'}
            color={RED}
            side="tanhek"
          />

          {posts.tanhek.map(p => (
            <PostCard key={p.id} post={p} color={RED} />
          ))}
        </div>
      </div>

      {/* ── 푸터 ── */}
      <footer style={{
        borderTop: `2px solid ${G2}`, background: DARK,
        padding: '14px 20px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', fontSize: 11,
      }}>
        <span style={{ fontWeight: 900, fontSize: 14 }}>President<span style={{ color: RED }}>OX</span></span>
        <span style={{ color: G3 }}>본 서비스는 시민 의견 수렴 플랫폼입니다</span>
      </footer>
    </div>
  )
}

// ── 글쓰기 박스 + 공격/방어 버튼 ─────────────────────────────────────────────
function WriteBox({ value, onChange, onSubmit, onAttack, disabled, placeholder, color, side }: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  onAttack: (e: React.MouseEvent) => void
  disabled: boolean
  placeholder: string
  color: string
  side: 'yeonnim' | 'tanhek'
}) {
  const isY = side === 'yeonnim'

  return (
    <div style={{
      borderBottom: `1px solid #1a1a1a`, padding: '12px 14px',
      background: disabled ? '#050505' : `${color}08`,
    }}>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value.slice(0, 200))}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        style={{
          width: '100%', padding: '10px 12px', resize: 'none',
          background: 'transparent',
          border: `1px solid ${disabled ? '#222' : color}`,
          color: WHITE, fontSize: 13, outline: 'none',
          fontFamily: 'inherit',
        }}
      />
      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
        {/* 공격/방어 버튼 */}
        <button
          onClick={e => { onAttack(e) }}
          disabled={disabled}
          style={{
            padding: '8px 14px', fontSize: 12, fontWeight: 900, letterSpacing: 1,
            border: `1px solid ${disabled ? '#333' : color}`,
            color: disabled ? '#333' : color, background: 'transparent',
            transition: 'all 0.15s',
          }}>
          {isY ? '🛡 방어' : '⚔ 공격'}
        </button>
        <button
          onClick={e => { onAttack(e) }}
          disabled={disabled}
          style={{
            padding: '8px 14px', fontSize: 12, fontWeight: 900, letterSpacing: 1,
            border: `1px solid ${disabled ? '#333' : color}`,
            color: disabled ? '#333' : color, background: 'transparent',
            transition: 'all 0.15s',
          }}>
          {isY ? '⚔ 반격' : '🛡 수호'}
        </button>
        <div style={{ flex: 1 }} />
        <button
          disabled={disabled || !value.trim()}
          onClick={onSubmit}
          style={{
            padding: '8px 18px', fontSize: 13, fontWeight: 900, letterSpacing: 1,
            background: !disabled && value.trim() ? color : '#1a1a1a',
            color: !disabled && value.trim() ? WHITE : '#333',
            border: 'none', transition: 'all 0.15s',
            boxShadow: !disabled && value.trim() ? `0 0 10px ${color}66` : 'none',
          }}>
          등록
        </button>
      </div>
    </div>
  )
}

// ── 게시글 카드 ──────────────────────────────────────────────────────────────
function PostCard({ post, color }: { post: Post; color: string }) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(post.likes)

  return (
    <div style={{
      borderBottom: `1px solid #111`, padding: '12px 16px',
      background: liked ? `${color}08` : 'transparent',
      transition: 'background 0.3s',
      animation: post.time === '방금 전'
        ? (color === BLUE ? 'slideInLeft 0.4s ease' : 'slideInRight 0.4s ease')
        : 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 900, color, letterSpacing: 1 }}>{post.nickname}</span>
        <span style={{ fontSize: 10, color: G3 }}>{post.time}</span>
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: '#cccccc', marginBottom: 10, wordBreak: 'keep-all' }}>
        {post.text}
      </p>
      <button
        onClick={() => { if (!liked) { setLiked(true); setCount(c => c + 1) } }}
        style={{
          display: 'flex', alignItems: 'center', gap: 5, fontSize: 11,
          color: liked ? color : G3, fontWeight: liked ? 900 : 400,
          textShadow: liked ? `0 0 8px ${color}` : 'none',
        }}>
        <span>{liked ? '♥' : '♡'}</span>
        {count.toLocaleString()}
      </button>
    </div>
  )
}
