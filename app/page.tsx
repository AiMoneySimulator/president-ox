'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ── 상수 ──────────────────────────────────────────────────────────────────────
const BLUE  = '#1e6fff'
const RED   = '#ff2222'
const BLACK = '#000000'
const D1    = '#111111'
const D2    = '#1a1a1a'
const D3    = '#2a2a2a'
const G3    = '#555555'
const G4    = '#888888'
const G5    = '#bbbbbb'
const WHITE = '#ffffff'
const FONT  = "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif"

// ── 타입 ──────────────────────────────────────────────────────────────────────
type Post  = { id: number; nickname: string; text: string; likes: number; time: string; side: 'yeonnim' | 'tanhek' }
type Troop = { id: number; side: 'yeonnim' | 'tanhek'; icon: string; y: number }

// ── 더미 데이터 ───────────────────────────────────────────────────────────────
const INIT_POSTS: Post[] = [
  { id: 1, side: 'yeonnim', nickname: '민주당원84',  text: '이재명 없으면 야권 대안 없습니다. 연임이 답이에요.',          likes: 312, time: '2분 전' },
  { id: 5, side: 'tanhek',  nickname: '보수의칼',    text: '사법 리스크 안고 국정 운영? 나라 망합니다.',                 likes: 445, time: '1분 전' },
  { id: 2, side: 'yeonnim', nickname: '진보의횃불',  text: '경제 위기엔 연속성이 필요. 교체는 혼란만 부릅니다.',          likes: 218, time: '5분 전' },
  { id: 6, side: 'tanhek',  nickname: '정의시민',    text: '유죄 판결 받은 인물이 대통령직 계속? 말이 됩니까?',           likes: 389, time: '4분 전' },
  { id: 3, side: 'yeonnim', nickname: '광주시민k',   text: '검찰독재에 맞선 사람이 이재명. 포기할 수 없다.',              likes: 187, time: '9분 전' },
  { id: 7, side: 'tanhek',  nickname: '법치주의자',  text: '법 앞에 예외 없다. 대통령도 마찬가지.',                      likes: 276, time: '8분 전' },
  { id: 4, side: 'yeonnim', nickname: '청년민주',    text: '민심은 연임을 원하고 있습니다. 지지율 보세요.',               likes: 144, time: '14분 전' },
  { id: 8, side: 'tanhek',  nickname: '국민의힘팬',  text: '이런 상황에 연임? 대한민국 국격이 어디 갑니까.',             likes: 201, time: '12분 전' },
]

const TROOP_Y = ['💬', '✊', '📢', '🛡️', '🗳️']
const TROOP_T = ['💬', '⚔️', '✊', '📢', '⚖️']

const TICKERS = [
  { label: 'KOSPI',    value: '2,487',  change: '▲12.4', up: true  },
  { label: 'KOSDAQ',   value: '721',    change: '▼3.2',  up: false },
  { label: 'USD/KRW',  value: '1,368',  change: '▲4',    up: false },
  { label: '국고채10Y', value: '3.41%', change: '▲0.03', up: false },
  { label: 'WTI',      value: '$74.2',  change: '▼0.8',  up: false },
  { label: 'NASDAQ',   value: '19,204', change: '▲88',   up: true  },
]

function getSysMsg(yPct: number, idx: number): string {
  const msgs = yPct > 53
    ? ['[연임] 병력 총공세 중!', '탄핵 방어선 붕괴 위험!', '연임 진영 압도적 우세!']
    : yPct < 47
    ? ['[탄핵] 병력 총집결!', '연임 진지 위기 상황!', '탄핵 진영 역전 공세!']
    : ['치열한 접전 중...', '승부 예측 불가!', '지금 당장 참전하라!']
  return msgs[idx % 3]
}

// ── 메인 ──────────────────────────────────────────────────────────────────────
export default function Page() {
  const [stance,     setStance]     = useState<'yeonnim' | 'tanhek' | null>(null)
  const [texts,      setTexts]      = useState({ yeonnim: '', tanhek: '' })
  const [yRaw,       setYRaw]       = useState(52.0)
  const [dispY,      setDispY]      = useState(52.0)
  const [totalVotes, setTotalVotes] = useState(182437)
  const [posts,      setPosts]      = useState<Post[]>(INIT_POSTS)
  const [troops,     setTroops]     = useState<Troop[]>([])
  const [sysIdx,     setSysIdx]     = useState(0)
  const [yHit,       setYHit]       = useState(false)
  const [tHit,       setTHit]       = useState(false)
  const nextId = useRef(200)

  // 투표율 변동
  useEffect(() => {
    const id = setInterval(() => {
      setYRaw(p => Math.min(65, Math.max(35, +(p + (Math.random() - 0.49) * 0.4).toFixed(2))))
      setTotalVotes(v => v + Math.floor(Math.random() * 4))
    }, 1800)
    return () => clearInterval(id)
  }, [])

  // 숫자 카운팅
  useEffect(() => {
    const id = setInterval(() => {
      setDispY(p => {
        const d = (yRaw - p) * 0.2
        return Math.abs(d) < 0.01 ? yRaw : +(p + d).toFixed(2)
      })
    }, 40)
    return () => clearInterval(id)
  }, [yRaw])

  // 시스템 메시지 순환
  useEffect(() => {
    const id = setInterval(() => setSysIdx(i => i + 1), 2800)
    return () => clearInterval(id)
  }, [])

  // 자동 병력 생성
  useEffect(() => {
    const id = setInterval(() => {
      const side = Math.random() > 0.5 ? 'yeonnim' : 'tanhek'
      spawnTroop(side)
    }, 1400)
    return () => clearInterval(id)
  }, [])

  const spawnTroop = useCallback((side: 'yeonnim' | 'tanhek') => {
    const icons = side === 'yeonnim' ? TROOP_Y : TROOP_T
    const troop: Troop = {
      id: nextId.current++,
      side,
      icon: icons[Math.floor(Math.random() * icons.length)],
      y: 20 + Math.random() * 60,
    }
    setTroops(ts => [...ts.slice(-20), troop])
    setTimeout(() => setTroops(ts => ts.filter(t => t.id !== troop.id)), 1800)
  }, [])

  const submitPost = (side: 'yeonnim' | 'tanhek') => {
    const text = texts[side].trim()
    if (!text) return
    const np: Post = {
      id: nextId.current++, side,
      nickname: side === 'yeonnim' ? '연임지지자' : '탄핵찬성자',
      text, likes: 0, time: '방금 전',
    }
    setPosts(p => [np, ...p])
    setTexts(t => ({ ...t, [side]: '' }))
    // 병력 연속 발사 + 성벽 타격 이펙트
    for (let i = 0; i < 4; i++) setTimeout(() => spawnTroop(side), i * 200)
    const opp = side === 'yeonnim' ? 'tanhek' : 'yeonnim'
    if (opp === 'yeonnim') { setYHit(true); setTimeout(() => setYHit(false), 500) }
    else                   { setTHit(true); setTimeout(() => setTHit(false), 500) }
  }

  const tRaw  = +(100 - yRaw).toFixed(2)
  const dispT = +(100 - dispY).toFixed(2)

  // HP: 상대가 많을수록 내 HP 낮아짐
  const yHP = Math.max(10, Math.min(100, 50 + (yRaw - 50) * 2))
  const tHP = Math.max(10, Math.min(100, 50 + (tRaw - 50) * 2))

  return (
    <div style={{ minHeight: '100vh', background: BLACK, fontFamily: FONT, color: WHITE, display: 'flex', flexDirection: 'column' }}>

      {/* ── 경제 티커 ── */}
      <div style={{ background: '#050505', borderBottom: `1px solid ${D3}`, height: 28, display: 'flex', alignItems: 'center', overflow: 'hidden', fontSize: 11, flexShrink: 0 }}>
        <div style={{ flexShrink: 0, background: RED, color: WHITE, padding: '0 10px', height: '100%', display: 'flex', alignItems: 'center', fontSize: 9, fontWeight: 900, letterSpacing: 2 }}>
          LIVE
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ display: 'inline-flex', gap: 36, whiteSpace: 'nowrap', animation: 'tickerScroll 18s linear infinite' }}>
            {[...TICKERS, ...TICKERS].map((t, i) => (
              <span key={i} style={{ display: 'flex', gap: 5, fontWeight: 700 }}>
                <span style={{ color: G4 }}>{t.label}</span>
                <span>{t.value}</span>
                <span style={{ color: t.up ? '#22ff88' : RED }}>{t.change}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 헤더 + 전황 바 ── */}
      <div style={{ background: D1, borderBottom: `2px solid ${D3}`, padding: '8px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 900 }}>
            President<span style={{ color: RED }}>OX</span>
            <span style={{ fontSize: 10, color: G4, marginLeft: 10, fontWeight: 400 }}>실시간 전투 중 {totalVotes.toLocaleString()}명</span>
          </div>
          {stance && (
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 1,
              color: stance === 'yeonnim' ? BLUE : RED,
              border: `1px solid ${stance === 'yeonnim' ? BLUE : RED}`,
              padding: '2px 10px',
            }}>
              {stance === 'yeonnim' ? '🔵 연임 진영' : '🔴 탄핵 진영'}
              <button onClick={() => setStance(null)} style={{ marginLeft: 8, fontSize: 10, color: G4, textDecoration: 'underline' }}>변경</button>
            </div>
          )}
        </div>

        {/* 전황 바 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 900, color: BLUE, width: 52, textAlign: 'right' }}>{dispY.toFixed(1)}%</span>
          <div style={{ flex: 1, height: 14, background: RED, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${dispY}%`, background: BLUE, transition: 'width 0.4s ease', boxShadow: `4px 0 10px ${BLUE}88` }} />
            {/* 시스템 메시지 overlay */}
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 900, letterSpacing: 2, color: 'rgba(255,255,255,0.9)',
              textShadow: '0 0 4px rgba(0,0,0,0.9)',
              animation: 'sysFlicker 1.8s ease-in-out infinite',
            }}>
              ⚡ 현재 전황: {getSysMsg(yRaw, sysIdx)}
            </div>
          </div>
          <span style={{ fontSize: 13, fontWeight: 900, color: RED, width: 52 }}>{dispT.toFixed(1)}%</span>
        </div>
      </div>

      {/* ── 3분할 전투장 ── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

        {/* ── 좌: 연임 진지 ── */}
        <div style={{
          width: '32%', borderRight: `2px solid ${D3}`, display: 'flex', flexDirection: 'column',
          animation: 'neonBlue 3s ease-in-out infinite',
          ...(yHit ? { animation: 'castleHit 0.5s ease' } : {}),
        }}>
          {/* 진지 헤더 */}
          <div style={{ background: `linear-gradient(135deg, ${BLUE}33, ${D1})`, borderBottom: `2px solid ${BLUE}66`, padding: '10px 14px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 16, fontWeight: 900, color: BLUE }}>🏰 연임 진지</span>
                <span style={{ fontSize: 10, color: G4, marginLeft: 8 }}>{Math.floor(totalVotes * yRaw / 100).toLocaleString()}명</span>
              </div>
              <span style={{ fontSize: 10, color: G4, fontWeight: 700 }}>HP</span>
            </div>
            {/* HP 바 */}
            <div style={{ height: 8, background: D3, overflow: 'hidden', position: 'relative' }}>
              <div style={{
                height: '100%', width: `${yHP}%`, background: `linear-gradient(90deg, ${BLUE}, #88aaff)`,
                transition: 'width 1s ease',
                boxShadow: `0 0 8px ${BLUE}`,
                animation: yHit ? 'hpShake 0.5s ease' : 'none',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: 9, color: G4 }}>
              <span>내구도 {yHP.toFixed(0)}%</span>
              <span style={{ color: yRaw >= 50 ? '#22ff88' : RED, fontWeight: 700 }}>
                {yRaw >= 50 ? '▲ 우세' : '▼ 열세'}
              </span>
            </div>
          </div>

          {/* 글쓰기 */}
          {stance === null ? (
            <StancePrompt onSelect={setStance} />
          ) : stance === 'yeonnim' ? (
            <WriteArea
              value={texts.yeonnim}
              onChange={v => setTexts(t => ({ ...t, yeonnim: v }))}
              onSubmit={() => submitPost('yeonnim')}
              color={BLUE}
              label="진격"
            />
          ) : (
            <div style={{ padding: '10px 14px', fontSize: 12, color: G3, textAlign: 'center', borderBottom: `1px solid ${D2}` }}>
              탄핵 진영에 참전 중
            </div>
          )}

          {/* 게시글 */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {posts.filter(p => p.side === 'yeonnim').map(p => (
              <PostCard key={p.id} post={p} color={BLUE} />
            ))}
          </div>
        </div>

        {/* ── 중앙: 전투 필드 ── */}
        <div style={{ width: '36%', borderRight: `2px solid ${D3}`, display: 'flex', flexDirection: 'column', background: `radial-gradient(ellipse at center, #0a0a12, ${BLACK})`, overflow: 'hidden' }}>

          {/* 전황 제목 */}
          <div style={{ background: D2, borderBottom: `1px solid ${D3}`, padding: '8px 12px', textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: 3, color: G5 }}>⚔ 전투 필드 ⚔</div>
          </div>

          {/* 병력 전투 애니메이션 */}
          <div style={{ height: 140, position: 'relative', borderBottom: `1px solid ${D3}`, flexShrink: 0, overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
            {/* 중앙 라인 */}
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: `${D3}`, transform: 'translateX(-50%)' }} />
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', fontSize: 18, opacity: 0.15 }}>VS</div>

            {troops.map(t => (
              <div key={t.id} style={{
                position: 'absolute',
                left: t.side === 'yeonnim' ? '15%' : '85%',
                top: `${t.y}%`,
                fontSize: 18,
                animation: t.side === 'yeonnim' ? 'marchRight 1.8s ease-out forwards' : 'marchLeft 1.8s ease-out forwards',
                filter: t.side === 'yeonnim' ? `drop-shadow(0 0 4px ${BLUE})` : `drop-shadow(0 0 4px ${RED})`,
              }}>
                {t.icon}
              </div>
            ))}

            {/* 파란/빨간 캐슬 아이콘 */}
            <div style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 28, filter: `drop-shadow(0 0 6px ${BLUE})` }}>🏰</div>
            <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 28, filter: `drop-shadow(0 0 6px ${RED})` }}>🏯</div>
          </div>

          {/* 시스템 메시지 */}
          <div style={{ background: D1, borderBottom: `1px solid ${D3}`, padding: '8px 12px', flexShrink: 0 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 1,
              color: yRaw > 50 ? '#88aaff' : '#ff8888',
              animation: 'sysFlicker 1.8s ease-in-out infinite',
              textAlign: 'center',
            }}>
              [SYSTEM] {getSysMsg(yRaw, sysIdx)}
            </div>
          </div>

          {/* 전투 로그 (최신 글 혼합) */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
            <div style={{ padding: '8px 12px', fontSize: 10, color: G3, fontWeight: 700, borderBottom: `1px solid ${D2}`, letterSpacing: 2 }}>
              실시간 전투 로그
            </div>
            {[...posts].slice(0, 14).map(p => (
              <div key={p.id} style={{
                padding: '8px 12px', borderBottom: `1px solid ${D2}`,
                borderLeft: `2px solid ${p.side === 'yeonnim' ? BLUE : RED}`,
                animation: p.time === '방금 전' ? 'slideUp 0.4s ease' : 'none',
              }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 3, alignItems: 'center' }}>
                  <span style={{ fontSize: 9, padding: '1px 6px', background: p.side === 'yeonnim' ? `${BLUE}33` : `${RED}33`, color: p.side === 'yeonnim' ? BLUE : RED, fontWeight: 900 }}>
                    {p.side === 'yeonnim' ? '연임' : '탄핵'}
                  </span>
                  <span style={{ fontSize: 10, color: G4 }}>{p.nickname}</span>
                  <span style={{ fontSize: 9, color: G3, marginLeft: 'auto' }}>{p.time}</span>
                </div>
                <p style={{ fontSize: 11, color: G5, lineHeight: 1.5 }}>{p.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 우: 탄핵 진지 ── */}
        <div style={{
          width: '32%', display: 'flex', flexDirection: 'column',
          animation: 'neonRed 3s ease-in-out infinite',
          ...(tHit ? { animation: 'castleHit 0.5s ease' } : {}),
        }}>
          {/* 진지 헤더 */}
          <div style={{ background: `linear-gradient(225deg, ${RED}33, ${D1})`, borderBottom: `2px solid ${RED}66`, padding: '10px 14px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 16, fontWeight: 900, color: RED }}>🏯 탄핵 진지</span>
                <span style={{ fontSize: 10, color: G4, marginLeft: 8 }}>{Math.floor(totalVotes * tRaw / 100).toLocaleString()}명</span>
              </div>
              <span style={{ fontSize: 10, color: G4, fontWeight: 700 }}>HP</span>
            </div>
            <div style={{ height: 8, background: D3, overflow: 'hidden', position: 'relative' }}>
              <div style={{
                height: '100%', width: `${tHP}%`, background: `linear-gradient(90deg, #ff8888, ${RED})`,
                transition: 'width 1s ease',
                boxShadow: `0 0 8px ${RED}`,
                animation: tHit ? 'hpShake 0.5s ease' : 'none',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: 9, color: G4 }}>
              <span>내구도 {tHP.toFixed(0)}%</span>
              <span style={{ color: tRaw >= 50 ? '#22ff88' : RED, fontWeight: 700 }}>
                {tRaw >= 50 ? '▲ 우세' : '▼ 열세'}
              </span>
            </div>
          </div>

          {/* 글쓰기 */}
          {stance === null ? null : stance === 'tanhek' ? (
            <WriteArea
              value={texts.tanhek}
              onChange={v => setTexts(t => ({ ...t, tanhek: v }))}
              onSubmit={() => submitPost('tanhek')}
              color={RED}
              label="총공격"
            />
          ) : (
            <div style={{ padding: '10px 14px', fontSize: 12, color: G3, textAlign: 'center', borderBottom: `1px solid ${D2}` }}>
              연임 진영에 참전 중
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {posts.filter(p => p.side === 'tanhek').map(p => (
              <PostCard key={p.id} post={p} color={RED} />
            ))}
          </div>
        </div>
      </div>

      {/* ── 입장 미선택 시 하단 오버레이 ── */}
      {stance === null && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.85) 80%, transparent)',
          padding: '24px 20px 28px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 13, color: G4, marginBottom: 14, letterSpacing: 2 }}>
            ▼ 진영을 선택해야 전투에 참여할 수 있습니다 ▼
          </div>
          <div style={{ display: 'flex', gap: 12, maxWidth: 480, margin: '0 auto' }}>
            <button onClick={() => setStance('yeonnim')} style={{
              flex: 1, padding: '16px 0', background: BLUE, color: WHITE,
              fontSize: 18, fontWeight: 900, letterSpacing: 3,
              boxShadow: `0 0 20px ${BLUE}88`, border: `1px solid ${BLUE}`,
            }}>
              🔵 연임 참전
            </button>
            <button onClick={() => setStance('tanhek')} style={{
              flex: 1, padding: '16px 0', background: RED, color: WHITE,
              fontSize: 18, fontWeight: 900, letterSpacing: 3,
              boxShadow: `0 0 20px ${RED}88`, border: `1px solid ${RED}`,
            }}>
              🔴 탄핵 참전
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 스탠스 선택 (좌 컬럼 내 표시) ───────────────────────────────────────────
function StancePrompt({ onSelect }: { onSelect: (s: 'yeonnim' | 'tanhek') => void }) {
  return (
    <div style={{ padding: '12px 14px', borderBottom: `1px solid ${D2}`, textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: G4, marginBottom: 10, letterSpacing: 1 }}>진영을 선택해 참전하세요</div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onSelect('yeonnim')} style={{ flex: 1, padding: '10px', background: BLUE, color: WHITE, fontSize: 13, fontWeight: 900 }}>
          연임 참전
        </button>
        <button onClick={() => onSelect('tanhek')} style={{ flex: 1, padding: '10px', background: RED, color: WHITE, fontSize: 13, fontWeight: 900 }}>
          탄핵 참전
        </button>
      </div>
    </div>
  )
}

// ── 글쓰기 영역 ──────────────────────────────────────────────────────────────
function WriteArea({ value, onChange, onSubmit, color, label }: {
  value: string; onChange: (v: string) => void; onSubmit: () => void
  color: string; label: string
}) {
  return (
    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${D2}`, background: `${color}08`, flexShrink: 0 }}>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value.slice(0, 200))}
        placeholder="의견을 작성하라! (최대 200자)"
        rows={3}
        style={{
          width: '100%', padding: '9px 11px', resize: 'none',
          background: 'rgba(0,0,0,0.6)', border: `1px solid ${color}66`,
          color: WHITE, fontSize: 12, outline: 'none',
        }}
      />
      <button
        disabled={!value.trim()}
        onClick={onSubmit}
        style={{
          marginTop: 8, width: '100%', padding: '10px',
          background: value.trim() ? color : D3,
          color: value.trim() ? WHITE : G3,
          fontSize: 14, fontWeight: 900, letterSpacing: 3,
          boxShadow: value.trim() ? `0 0 14px ${color}66` : 'none',
          transition: 'all 0.2s', border: 'none',
        }}>
        ▶ {label}
      </button>
    </div>
  )
}

// ── 게시글 카드 ──────────────────────────────────────────────────────────────
function PostCard({ post, color }: { post: Post; color: string }) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(post.likes)

  return (
    <div style={{
      padding: '10px 14px', borderBottom: `1px solid ${D2}`,
      animation: post.time === '방금 전' ? 'slideUp 0.4s ease' : 'none',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{post.nickname}</span>
        <span style={{ fontSize: 10, color: G3 }}>{post.time}</span>
      </div>
      <p style={{ fontSize: 12, lineHeight: 1.6, color: G5, marginBottom: 8, wordBreak: 'keep-all' }}>{post.text}</p>
      <button
        onClick={() => { if (!liked) { setLiked(true); setCount(c => c + 1) } }}
        style={{ fontSize: 11, color: liked ? color : G3, fontWeight: liked ? 700 : 400, display: 'flex', gap: 4 }}>
        <span>{liked ? '♥' : '♡'}</span>{count.toLocaleString()}
      </button>
    </div>
  )
}
