'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ── 팔레트 ────────────────────────────────────────────────────────────────────
const BLUE   = '#3b82f6'
const BLUE2  = '#1d4ed8'
const RED    = '#ef4444'
const RED2   = '#b91c1c'
const BG     = '#0d1117'
const BG2    = '#161b22'
const BG3    = '#1c2128'
const BORDER = '#30363d'
const TEXT   = '#e6edf3'
const TEXT2  = '#8b949e'
const TEXT3  = '#484f58'
const FONT   = "'Pretendard', 'Noto Sans KR', sans-serif"

// ── 타입 ──────────────────────────────────────────────────────────────────────
type Side = 'yeonnim' | 'tanhek'
type Post = {
  id: number; side: Side; nickname: string; text: string
  score: number; rebuttal: number; time: string
}

// ── 초기 데이터 ───────────────────────────────────────────────────────────────
const INIT: Post[] = [
  { id: 1, side: 'yeonnim', nickname: '민주당원84',  score: 312, rebuttal: 88,  time: '2분 전',  text: '이재명 없으면 야권 대안이 없습니다. 경제 위기 속에서 연속성이 필요합니다.' },
  { id: 5, side: 'tanhek',  nickname: '보수의칼',    score: 445, rebuttal: 102, time: '1분 전',  text: '사법 리스크를 안고 국정을 운영하는 건 국가적 리스크입니다. 탄핵이 맞습니다.' },
  { id: 2, side: 'yeonnim', nickname: '진보의횃불',  score: 218, rebuttal: 55,  time: '5분 전',  text: '야당 교체는 더 큰 정치적 혼란을 가져옵니다. 연임이 안정적 국정 운영의 답입니다.' },
  { id: 6, side: 'tanhek',  nickname: '정의시민',    score: 389, rebuttal: 71,  time: '4분 전',  text: '유죄 판결을 받은 인물이 대통령직을 유지하는 것은 법치주의 훼손입니다.' },
  { id: 3, side: 'yeonnim', nickname: '광주시민k',   score: 187, rebuttal: 43,  time: '9분 전',  text: '검찰 독재에 맞서 싸운 사람이 이재명입니다. 지금 포기하면 안 됩니다.' },
  { id: 7, side: 'tanhek',  nickname: '법치주의자',  score: 276, rebuttal: 60,  time: '8분 전',  text: '법 앞에 예외는 없습니다. 대통령이라고 예외가 될 수 없습니다.' },
  { id: 4, side: 'yeonnim', nickname: '청년민주',    score: 144, rebuttal: 39,  time: '14분 전', text: '민주당 지지율을 보세요. 민심은 이미 연임을 선택하고 있습니다.' },
  { id: 8, side: 'tanhek',  nickname: '국민의힘팬',  score: 201, rebuttal: 48,  time: '12분 전', text: '이런 상황에서 연임을 주장한다는 건 대한민국의 국격을 스스로 낮추는 것입니다.' },
]

const KEYWORDS: Record<Side, string[]> = {
  yeonnim: ['#경제연속성', '#야권단일화', '#검찰개혁', '#민생우선', '#재집권'],
  tanhek:  ['#법치주의',  '#사법리스크', '#국격회복', '#책임정치', '#탄핵완수'],
}

// 지지율 히스토리 (최근 10개 측정값)
const Y_HISTORY = [49.1, 50.3, 51.2, 50.8, 52.1, 51.6, 52.8, 51.9, 53.1, 52.0]

const TICKERS = [
  { label: 'KOSPI',    value: '2,487', change: '▲12.4', up: true  },
  { label: 'KOSDAQ',   value: '721',   change: '▼3.2',  up: false },
  { label: 'USD/KRW',  value: '1,368', change: '▲4',    up: false },
  { label: '국고채10Y', value: '3.41%',change: '▲0.03', up: false },
  { label: 'WTI',      value: '$74.2', change: '▼0.8',  up: false },
  { label: 'NASDAQ',   value: '19,204',change: '▲88',   up: true  },
]

function getSysMsg(y: number, idx: number) {
  const msgs = y > 53
    ? ['연임 주장 우세', '탄핵 측 반박 집중', '연임 지지율 상승 중']
    : y < 47
    ? ['탄핵 여론 우세', '연임 측 방어 집중', '탄핵 지지율 상승 중']
    : ['팽팽한 접전', '여론 향방 불투명', '현재 50% 교착 상태']
  return msgs[idx % 3]
}

// ── 메인 ──────────────────────────────────────────────────────────────────────
export default function Page() {
  const [stance,     setStance]     = useState<Side | null>(null)
  const [texts,      setTexts]      = useState({ yeonnim: '', tanhek: '' })
  const [yRaw,       setYRaw]       = useState(52.0)
  const [dispY,      setDispY]      = useState(52.0)
  const [totalVotes, setTotalVotes] = useState(182437)
  const [posts,      setPosts]      = useState<Post[]>(INIT)
  const [sysIdx,     setSysIdx]     = useState(0)
  const [yHistory,   setYHistory]   = useState(Y_HISTORY)
  const nextId = useRef(100)

  useEffect(() => {
    const id = setInterval(() => {
      setYRaw(p => {
        const next = Math.min(65, Math.max(35, +(p + (Math.random() - 0.49) * 0.35).toFixed(2)))
        setYHistory(h => [...h.slice(-9), next])
        return next
      })
      setTotalVotes(v => v + Math.floor(Math.random() * 3))
    }, 2200)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setDispY(p => {
        const d = (yRaw - p) * 0.2
        return Math.abs(d) < 0.01 ? yRaw : +(p + d).toFixed(2)
      })
    }, 40)
    return () => clearInterval(id)
  }, [yRaw])

  useEffect(() => {
    const id = setInterval(() => setSysIdx(i => i + 1), 3000)
    return () => clearInterval(id)
  }, [])

  const submitPost = (side: Side) => {
    const text = texts[side].trim()
    if (!text) return
    const np: Post = {
      id: nextId.current++, side,
      nickname: side === 'yeonnim' ? '연임지지자' : '탄핵찬성자',
      text, score: 0, rebuttal: 0, time: '방금 전',
    }
    setPosts(p => [np, ...p])
    setTexts(t => ({ ...t, [side]: '' }))
  }

  const addScore = useCallback((id: number, delta: number) => {
    setPosts(ps => ps.map(p => p.id === id ? { ...p, score: p.score + delta } : p))
  }, [])
  const addRebuttal = useCallback((id: number) => {
    setPosts(ps => ps.map(p => p.id === id ? { ...p, rebuttal: p.rebuttal + 1 } : p))
  }, [])

  const tRaw  = +(100 - yRaw).toFixed(2)
  const dispT = +(100 - dispY).toFixed(2)

  const yPosts = posts.filter(p => p.side === 'yeonnim')
  const tPosts = posts.filter(p => p.side === 'tanhek')
  const yBest  = [...yPosts].sort((a, b) => b.score - a.score).slice(0, 3)
  const tBest  = [...tPosts].sort((a, b) => b.score - a.score).slice(0, 3)
  const yTotal = yPosts.reduce((s, p) => s + p.score, 0)
  const tTotal = tPosts.reduce((s, p) => s + p.score, 0)

  const tHistory = yHistory.map(v => +(100 - v).toFixed(2))

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: BG, fontFamily: FONT, color: TEXT, overflow: 'hidden' }}>

      {/* ── 경제 티커 ── */}
      <div style={{ background: '#010409', borderBottom: `1px solid ${BORDER}`, height: 26, display: 'flex', alignItems: 'center', overflow: 'hidden', fontSize: 11, flexShrink: 0 }}>
        <div style={{ flexShrink: 0, background: RED, color: '#fff', padding: '0 10px', height: '100%', display: 'flex', alignItems: 'center', fontSize: 9, fontWeight: 700, letterSpacing: 2 }}>
          LIVE
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'inline-flex', gap: 32, whiteSpace: 'nowrap', animation: 'tickerScroll 20s linear infinite' }}>
            {[...TICKERS, ...TICKERS].map((t, i) => (
              <span key={i} style={{ display: 'flex', gap: 5 }}>
                <span style={{ color: TEXT3 }}>{t.label}</span>
                <span style={{ fontWeight: 600 }}>{t.value}</span>
                <span style={{ color: t.up ? '#3fb950' : RED }}>{t.change}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 헤더 ── */}
      <div style={{ background: BG2, borderBottom: `1px solid ${BORDER}`, padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 17, fontWeight: 800 }}>
            President<span style={{ color: RED }}>OX</span>
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: BG3, border: `1px solid ${BORDER}`, borderRadius: 4, padding: '3px 10px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: RED, display: 'inline-block', animation: 'blink 1.4s ease-in-out infinite' }} />
            <span style={{ fontSize: 11, color: TEXT2, fontWeight: 600 }}>실시간 {totalVotes.toLocaleString()}명 토론 중</span>
          </div>
        </div>
        {stance && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: stance === 'yeonnim' ? BLUE : RED }}>
              {stance === 'yeonnim' ? '● 연임 주장 참여 중' : '● 탄핵 주장 참여 중'}
            </span>
            <button onClick={() => setStance(null)} style={{ fontSize: 11, color: TEXT3, textDecoration: 'underline' }}>변경</button>
          </div>
        )}
      </div>

      {/* ── 3분할 본문 ── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>

        {/* ── 좌: 연임 주장 ── */}
        <SidePanel
          side="yeonnim"
          color={BLUE}
          color2={BLUE2}
          label="연임 주장"
          pct={dispY}
          total={yTotal}
          best={yBest}
          allPosts={yPosts}
          keywords={KEYWORDS.yeonnim}
          history={yHistory}
          stance={stance}
          writeValue={texts.yeonnim}
          onWriteChange={v => setTexts(t => ({ ...t, yeonnim: v }))}
          onSubmit={() => submitPost('yeonnim')}
          onScore={addScore}
          onRebuttal={addRebuttal}
        />

        {/* ── 중앙: 인물 + 현황 + 토론 피드 ── */}
        <div style={{ flex: '0 0 38%', borderLeft: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* 인물 사진 + 현황 바 */}
          <div style={{ flexShrink: 0, borderBottom: `1px solid ${BORDER}`, background: BG2 }}>
            {/* 사진 */}
            <div style={{ padding: '16px 0 12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 84, height: 104, background: BG3, border: `1px solid ${BORDER}`,
                position: 'relative', overflow: 'hidden', marginBottom: 8,
                boxShadow: `0 0 0 3px ${BG2}, 0 0 0 4px ${BORDER}`,
              }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: TEXT3 }}>사진</div>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: `linear-gradient(${BLUE}, ${BLUE2})` }} />
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 3, background: `linear-gradient(${RED}, ${RED2})` }} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>이재명</div>
              <div style={{ fontSize: 10, color: TEXT3, marginTop: 2 }}>前 대통령</div>
            </div>

            {/* 연임 vs 탄핵 바 */}
            <div style={{ padding: '0 16px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: BLUE, lineHeight: 1 }}>{dispY.toFixed(1)}<span style={{ fontSize: 12 }}>%</span></div>
                  <div style={{ fontSize: 9, color: TEXT3, marginTop: 2 }}>연임</div>
                </div>
                <div style={{ textAlign: 'center', alignSelf: 'center' }}>
                  <div style={{ fontSize: 9, color: TEXT3, fontWeight: 700, letterSpacing: 2 }}>vs</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: RED, lineHeight: 1 }}>{dispT.toFixed(1)}<span style={{ fontSize: 12 }}>%</span></div>
                  <div style={{ fontSize: 9, color: TEXT3, marginTop: 2 }}>탄핵</div>
                </div>
              </div>
              <div style={{ height: 6, background: RED2, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${dispY}%`, background: `linear-gradient(90deg, ${BLUE2}, ${BLUE})`, transition: 'width 0.5s ease', borderRadius: 3 }} />
              </div>
            </div>

            {/* 전황 메시지 */}
            <div style={{ margin: '0 16px 12px', padding: '7px 12px', background: BG3, border: `1px solid ${BORDER}`, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: yRaw > 50 ? BLUE : RED, letterSpacing: 1, flexShrink: 0 }}>전황</span>
              <span style={{ fontSize: 11, color: TEXT2, fontWeight: 600, animation: 'blink 3s ease-in-out infinite' }}>
                {getSysMsg(yRaw, sysIdx)}
              </span>
            </div>

            {/* 스탠스 선택 */}
            {stance === null && (
              <div style={{ padding: '0 16px 14px', display: 'flex', gap: 8 }}>
                <button onClick={() => setStance('yeonnim')} style={{
                  flex: 1, padding: '10px 0', background: `linear-gradient(135deg, ${BLUE2}, ${BLUE})`,
                  color: '#fff', fontSize: 13, fontWeight: 800, borderRadius: 4, letterSpacing: 1,
                  boxShadow: `0 4px 12px ${BLUE}44`,
                }}>연임 참여</button>
                <button onClick={() => setStance('tanhek')} style={{
                  flex: 1, padding: '10px 0', background: `linear-gradient(135deg, ${RED2}, ${RED})`,
                  color: '#fff', fontSize: 13, fontWeight: 800, borderRadius: 4, letterSpacing: 1,
                  boxShadow: `0 4px 12px ${RED}44`,
                }}>탄핵 참여</button>
              </div>
            )}
          </div>

          {/* 실시간 토론 피드 */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '8px 12px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${BORDER}` }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: TEXT3, letterSpacing: 2 }}>실시간 토론</span>
              <span style={{ fontSize: 9, color: TEXT3 }}>{posts.length}개 주장</span>
            </div>
            {posts.slice(0, 20).map(p => (
              <FeedPost key={p.id} post={p} onScore={addScore} onRebuttal={addRebuttal} />
            ))}
          </div>
        </div>

        {/* ── 우: 탄핵 주장 ── */}
        <SidePanel
          side="tanhek"
          color={RED}
          color2={RED2}
          label="탄핵 주장"
          pct={dispT}
          total={tTotal}
          best={tBest}
          allPosts={tPosts}
          keywords={KEYWORDS.tanhek}
          history={tHistory}
          stance={stance}
          writeValue={texts.tanhek}
          onWriteChange={v => setTexts(t => ({ ...t, tanhek: v }))}
          onSubmit={() => submitPost('tanhek')}
          onScore={addScore}
          onRebuttal={addRebuttal}
        />
      </div>
    </div>
  )
}

// ── 사이드 패널 ───────────────────────────────────────────────────────────────
function SidePanel({ side, color, color2, label, pct, total, best, allPosts, keywords, history, stance, writeValue, onWriteChange, onSubmit, onScore, onRebuttal }: {
  side: Side; color: string; color2: string; label: string; pct: number; total: number
  best: Post[]; allPosts: Post[]; keywords: string[]; history: number[]
  stance: Side | null; writeValue: string; onWriteChange: (v: string) => void
  onSubmit: () => void; onScore: (id: number, d: number) => void; onRebuttal: (id: number) => void
}) {
  const isActive = stance === side
  const max = Math.max(...history)
  const min = Math.min(...history)

  return (
    <div style={{ flex: '0 0 31%', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: `${side === 'yeonnim' ? 'pulseBlue' : 'pulseRed'} 4s ease-in-out infinite` }}>

      {/* 패널 헤더 */}
      <div style={{ background: `linear-gradient(180deg, ${color}18, transparent)`, borderBottom: `1px solid ${color}33`, padding: '10px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color }}>{label}</span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color }}>{pct.toFixed(1)}%</div>
            <div style={{ fontSize: 9, color: TEXT3 }}>논리력 {total.toLocaleString()}pt</div>
          </div>
        </div>

        {/* 키워드 태그 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {keywords.map(k => (
            <span key={k} style={{ fontSize: 9, padding: '2px 7px', background: `${color}15`, color, border: `1px solid ${color}30`, borderRadius: 3, fontWeight: 600 }}>
              {k}
            </span>
          ))}
        </div>

        {/* 지지율 추이 스파크라인 */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 22 }}>
          {history.map((v, i) => (
            <div key={i} style={{
              flex: 1, borderRadius: 1,
              height: `${Math.max(15, ((v - min) / (max - min + 0.01)) * 100)}%`,
              background: color,
              opacity: 0.3 + (i / history.length) * 0.7,
            }} />
          ))}
        </div>
        <div style={{ fontSize: 9, color: TEXT3, marginTop: 3 }}>최근 지지율 추이</div>
      </div>

      {/* 스크롤 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* 베스트 주장 */}
        <div style={{ padding: '8px 14px 4px', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: TEXT3, letterSpacing: 2, marginBottom: 8 }}>베스트 주장</div>
          {best.map((p, i) => (
            <BestCard key={p.id} post={p} rank={i + 1} color={color} onScore={onScore} onRebuttal={onRebuttal} />
          ))}
        </div>

        {/* 글쓰기 */}
        {isActive && (
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
            <textarea
              value={writeValue}
              onChange={e => onWriteChange(e.target.value.slice(0, 200))}
              placeholder="주장을 작성하세요 (최대 200자)"
              rows={3}
              style={{
                width: '100%', padding: '9px 11px', resize: 'none',
                background: BG3, border: `1px solid ${color}50`,
                color: TEXT, fontSize: 12, outline: 'none', borderRadius: 4,
                lineHeight: 1.6,
              }}
            />
            <button
              disabled={!writeValue.trim()}
              onClick={onSubmit}
              style={{
                marginTop: 7, width: '100%', padding: '9px',
                background: writeValue.trim() ? `linear-gradient(135deg, ${color2}, ${color})` : BG3,
                color: writeValue.trim() ? '#fff' : TEXT3,
                fontSize: 13, fontWeight: 800, borderRadius: 4,
                boxShadow: writeValue.trim() ? `0 4px 12px ${color}44` : 'none',
                transition: 'all 0.2s',
              }}>
              주장 등록
            </button>
          </div>
        )}

        {!isActive && stance !== null && (
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BORDER}`, fontSize: 11, color: TEXT3, textAlign: 'center' }}>
            상대 진영 주장입니다
          </div>
        )}

        {/* 전체 게시글 */}
        <div style={{ padding: '8px 14px 4px', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: TEXT3, letterSpacing: 2 }}>전체 주장</div>
        </div>
        {allPosts.map(p => (
          <PostCard key={p.id} post={p} color={color} onScore={onScore} onRebuttal={onRebuttal} />
        ))}
      </div>
    </div>
  )
}

// ── 베스트 카드 ───────────────────────────────────────────────────────────────
function BestCard({ post, rank, color, onScore, onRebuttal }: {
  post: Post; rank: number; color: string
  onScore: (id: number, d: number) => void
  onRebuttal: (id: number) => void
}) {
  const [scored, setScored] = useState(false)
  const [flash,  setFlash]  = useState(false)

  return (
    <div style={{
      marginBottom: 8, padding: '10px 12px',
      background: BG3, border: `1px solid ${color}30`,
      borderRadius: 6, position: 'relative',
      animation: post.time === '방금 전' ? 'fadeUp 0.4s ease' : 'none',
    }}>
      <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 11, fontWeight: 800, color: `${color}60` }}>
        #{rank}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color, marginBottom: 5 }}>{post.nickname}</div>
      <p style={{ fontSize: 12, color: TEXT, lineHeight: 1.6, marginBottom: 8, wordBreak: 'keep-all', paddingRight: 20 }}>{post.text}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color, background: `${color}15`, padding: '2px 8px', borderRadius: 3 }}>
          논리력 {post.score.toLocaleString()}pt
        </div>
        <button
          onClick={() => { if (!scored) { setScored(true); setFlash(true); onScore(post.id, 15); setTimeout(() => setFlash(false), 600) } }}
          style={{ fontSize: 10, color: scored ? color : TEXT3, fontWeight: scored ? 700 : 400, display: 'flex', gap: 3, alignItems: 'center', transition: 'all 0.2s' }}>
          <span>▲</span> 추천 {scored ? <span style={{ fontSize: 9, color, animation: flash ? 'scoreUp 0.6s ease forwards' : 'none' }}>+15pt</span> : null}
        </button>
        <button onClick={() => onRebuttal(post.id)} style={{ fontSize: 10, color: TEXT3, display: 'flex', gap: 3 }}>
          <span>⚡</span> 반박 {post.rebuttal}
        </button>
      </div>
    </div>
  )
}

// ── 일반 게시글 카드 ──────────────────────────────────────────────────────────
function PostCard({ post, color, onScore, onRebuttal }: {
  post: Post; color: string
  onScore: (id: number, d: number) => void
  onRebuttal: (id: number) => void
}) {
  const [scored, setScored] = useState(false)
  return (
    <div style={{
      padding: '10px 14px', borderBottom: `1px solid ${BORDER}`,
      animation: post.time === '방금 전' ? 'fadeUp 0.4s ease' : 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{post.nickname}</span>
        <span style={{ fontSize: 10, color: TEXT3 }}>{post.time}</span>
      </div>
      <p style={{ fontSize: 12, lineHeight: 1.6, color: TEXT, marginBottom: 8, wordBreak: 'keep-all' }}>{post.text}</p>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 9, color, background: `${color}12`, padding: '1px 6px', borderRadius: 3, fontWeight: 600 }}>
          {post.score}pt
        </span>
        <button
          onClick={() => { if (!scored) { setScored(true); onScore(post.id, 10) } }}
          style={{ fontSize: 10, color: scored ? color : TEXT3, fontWeight: scored ? 700 : 400 }}>
          ▲ 추천
        </button>
        <button onClick={() => onRebuttal(post.id)} style={{ fontSize: 10, color: TEXT3 }}>
          ⚡ 반박 {post.rebuttal}
        </button>
      </div>
    </div>
  )
}

// ── 피드 포스트 (중앙) ────────────────────────────────────────────────────────
function FeedPost({ post, onScore, onRebuttal }: {
  post: Post
  onScore: (id: number, d: number) => void
  onRebuttal: (id: number) => void
}) {
  const [scored, setScored] = useState(false)
  const color = post.side === 'yeonnim' ? BLUE : RED

  return (
    <div style={{
      padding: '9px 12px', borderBottom: `1px solid ${BORDER}`,
      borderLeft: `2px solid ${color}`,
      animation: post.time === '방금 전' ? 'fadeUp 0.4s ease' : 'none',
    }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 5 }}>
        <span style={{ fontSize: 9, padding: '1px 6px', background: `${color}20`, color, fontWeight: 700, borderRadius: 3 }}>
          {post.side === 'yeonnim' ? '연임' : '탄핵'}
        </span>
        <span style={{ fontSize: 10, color: TEXT2, fontWeight: 600 }}>{post.nickname}</span>
        <span style={{ fontSize: 9, color: TEXT3, marginLeft: 'auto' }}>{post.time}</span>
      </div>
      <p style={{ fontSize: 12, color: TEXT, lineHeight: 1.55, marginBottom: 7, wordBreak: 'keep-all' }}>{post.text}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => { if (!scored) { setScored(true); onScore(post.id, 10) } }}
          style={{ fontSize: 10, color: scored ? color : TEXT3, fontWeight: scored ? 700 : 400 }}>
          ▲ {post.score.toLocaleString()}pt
        </button>
        <button onClick={() => onRebuttal(post.id)} style={{ fontSize: 10, color: TEXT3 }}>
          ⚡ {post.rebuttal}
        </button>
      </div>
    </div>
  )
}
