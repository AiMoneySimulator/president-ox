'use client'

import { useState, useEffect } from 'react'

// ── 상수 ──────────────────────────────────────────────────────────────────────
const BLUE  = '#1a4fd8'
const RED   = '#d81a1a'
const BLACK = '#0a0a0a'
const GRAY1 = '#1c1c1c'
const GRAY3 = '#767676'
const GRAY4 = '#c8c8c8'
const GRAY5 = '#f0f0f0'
const WHITE = '#ffffff'
const FONT  = "'Apple SD Gothic Neo', 'Malgun Gothic', '맑은 고딕', sans-serif"

// ── 더미 게시글 ───────────────────────────────────────────────────────────────
const DUMMY_POSTS = {
  yeonnim: [
    { id: 1, nickname: '민주당원84',  text: '이재명 없으면 누가 야권을 이끌어요? 현실적으로 대안이 없습니다.',       likes: 312, time: '2분 전' },
    { id: 2, nickname: '진보의횃불',  text: '경제 위기 지금 연속성이 필요한 시점. 교체는 더 큰 혼란을 부릅니다.',   likes: 218, time: '5분 전' },
    { id: 3, nickname: '광주시민k',   text: '검찰독재에 맞서 싸운 사람이 이재명입니다. 포기할 수 없다.',             likes: 187, time: '9분 전' },
    { id: 4, nickname: '청년민주',    text: '민주당 지지율 보세요. 민심은 연임을 원하고 있습니다.',                  likes: 144, time: '14분 전' },
  ],
  tanhek: [
    { id: 5, nickname: '보수의칼',    text: '사법 리스크 안고 국정 운영? 나라 망합니다. 당장 내려와야 해요.',        likes: 445, time: '1분 전' },
    { id: 6, nickname: '정의시민',    text: '유죄 판결 받은 인물이 대통령직을 계속한다는 게 말이 됩니까?',           likes: 389, time: '4분 전' },
    { id: 7, nickname: '법치주의자',  text: '법 앞에 예외 없다. 대통령도 마찬가지. 탄핵이 정답입니다.',             likes: 276, time: '8분 전' },
    { id: 8, nickname: '국민의힘팬',  text: '이런 상황에 연임? 대한민국 국격이 어디 갑니까. 탄핵하세요.',           likes: 201, time: '12분 전' },
  ],
}

// ── 티커 데이터 ───────────────────────────────────────────────────────────────
const TICKERS = [
  { label: 'KOSPI',   value: '2,487.32', change: '▲ 12.4',  up: true  },
  { label: 'KOSDAQ',  value: '721.18',   change: '▼ 3.2',   up: false },
  { label: 'USD/KRW', value: '1,368',    change: '▲ 4',     up: false },
  { label: '국고채10Y', value: '3.41%',  change: '▲ 0.03',  up: false },
  { label: 'WTI',     value: '$74.2',    change: '▼ 0.8',   up: false },
  { label: 'NVIDIA',  value: '$128.4',   change: '▲ 3.1',   up: true  },
]

// ── 메인 ──────────────────────────────────────────────────────────────────────
export default function Page() {
  const [stance,     setStance]     = useState<'yeonnim' | 'tanhek' | null>(null)
  const [texts,      setTexts]      = useState({ yeonnim: '', tanhek: '' })
  const [yPct,       setYPct]       = useState(52)
  const [tickPos,    setTickPos]    = useState(0)
  const [totalVotes, setTotalVotes] = useState(182437)

  // 티커 스크롤
  useEffect(() => {
    const id = setInterval(() => setTickPos(p => p - 1), 30)
    return () => clearInterval(id)
  }, [])

  // 실시간 투표율 변동 연출
  useEffect(() => {
    const id = setInterval(() => {
      setYPct(p => {
        const delta = (Math.random() - 0.5) * 0.3
        return Math.min(65, Math.max(35, +(p + delta).toFixed(1)))
      })
      setTotalVotes(v => v + Math.floor(Math.random() * 3))
    }, 2000)
    return () => clearInterval(id)
  }, [])

  const tPct = +(100 - yPct).toFixed(1)

  return (
    <div style={{ minHeight: '100vh', background: WHITE, fontFamily: FONT }}>

      {/* ── 최상단 경제 티커 ── */}
      <div style={{
        background: BLACK, color: WHITE, height: 32, overflow: 'hidden',
        display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 600,
      }}>
        <div style={{
          flexShrink: 0, padding: '0 14px', background: RED,
          height: '100%', display: 'flex', alignItems: 'center',
          letterSpacing: 1, fontSize: 11,
        }}>
          LIVE
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', gap: 48, whiteSpace: 'nowrap',
            transform: `translateX(${tickPos % 960}px)`,
          }}>
            {[...TICKERS, ...TICKERS].map((t, i) => (
              <span key={i} style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: GRAY4 }}>{t.label}</span>
                <span>{t.value}</span>
                <span style={{ color: t.up ? '#4ade80' : RED }}>{t.change}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 헤더 ── */}
      <header style={{
        borderBottom: `3px solid ${BLACK}`, padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -1 }}>
          President<span style={{ color: RED }}>OX</span>
        </div>
        <div style={{ fontSize: 12, color: GRAY3 }}>
          실시간 참여 {totalVotes.toLocaleString()}명
        </div>
      </header>

      {/* ── 히어로 ── */}
      <section style={{ background: BLACK, color: WHITE, textAlign: 'center', padding: '48px 24px 0' }}>

        {/* 인물 사진 자리 */}
        <div style={{
          width: 160, height: 200, margin: '0 auto 24px',
          background: GRAY1, border: `1px solid #333`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, color: GRAY3, position: 'relative',
        }}>
          <span>이재명 사진</span>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: BLUE }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 4, background: RED }} />
        </div>

        <div style={{ fontSize: 12, color: GRAY4, letterSpacing: 4, marginBottom: 14, fontWeight: 700 }}>
          이재명 前 대통령
        </div>
        <h1 style={{ fontSize: 44, fontWeight: 900, letterSpacing: -2, lineHeight: 1, marginBottom: 8 }}>
          <span style={{ color: BLUE }}>연임</span>
          <span style={{ color: GRAY3, margin: '0 14px', fontSize: 28 }}>vs</span>
          <span style={{ color: RED }}>탄핵</span>
        </h1>
        <p style={{ fontSize: 14, color: GRAY4, marginBottom: 32 }}>
          당신의 한 표가 역사를 바꿉니다
        </p>

        {/* 투표 비율 바 */}
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: BLUE, fontSize: 26, fontWeight: 900 }}>{yPct}%</span>
            <span style={{ color: RED,  fontSize: 26, fontWeight: 900 }}>{tPct}%</span>
          </div>
          <div style={{ height: 18, background: RED, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${yPct}%`, background: BLUE,
              transition: 'width 1.5s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: GRAY3 }}>
            <span>연임 지지</span>
            <span>탄핵 찬성</span>
          </div>
        </div>

        {/* 스탠스 선택 */}
        <div style={{ padding: '32px 24px 48px', maxWidth: 560, margin: '0 auto' }}>
          {stance === null ? (
            <>
              <div style={{ fontSize: 12, color: GRAY4, marginBottom: 14, letterSpacing: 1 }}>
                토론 참여를 위해 입장을 선택하세요
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStance('yeonnim')} style={{
                  flex: 1, padding: '16px 0', background: BLUE, color: WHITE,
                  fontSize: 18, fontWeight: 900, letterSpacing: 2,
                }}>
                  연임
                </button>
                <button onClick={() => setStance('tanhek')} style={{
                  flex: 1, padding: '16px 0', background: RED, color: WHITE,
                  fontSize: 18, fontWeight: 900, letterSpacing: 2,
                }}>
                  탄핵
                </button>
              </div>
            </>
          ) : (
            <div style={{
              padding: '12px 20px', border: `2px solid ${stance === 'yeonnim' ? BLUE : RED}`,
              color: stance === 'yeonnim' ? BLUE : RED,
              fontSize: 14, fontWeight: 800,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span>나의 입장 &gt; {stance === 'yeonnim' ? '연임 지지' : '탄핵 찬성'}</span>
              <button onClick={() => setStance(null)} style={{ fontSize: 12, color: GRAY3, textDecoration: 'underline' }}>
                변경
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── 좌우 토론 그리드 ── */}
      <section style={{ display: 'flex', borderTop: `3px solid ${BLACK}`, minHeight: '60vh' }}>

        {/* 연임 컬럼 */}
        <div style={{ flex: 1, borderRight: `2px solid ${BLACK}` }}>
          <div style={{
            background: BLUE, color: WHITE, padding: '14px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: 2 }}>연임</span>
            <span style={{ fontSize: 11, opacity: 0.75 }}>
              {Math.floor(totalVotes * yPct / 100).toLocaleString()}명 지지
            </span>
          </div>

          <WriteBox
            value={texts.yeonnim}
            onChange={v => setTexts(t => ({ ...t, yeonnim: v }))}
            onSubmit={() => setTexts(t => ({ ...t, yeonnim: '' }))}
            disabled={stance !== 'yeonnim'}
            placeholder={stance === 'yeonnim' ? '연임 지지 의견을 남겨주세요...' : '입장 선택 후 작성 가능합니다'}
            color={BLUE}
          />

          {DUMMY_POSTS.yeonnim.map(p => (
            <PostCard key={p.id} post={p} color={BLUE} />
          ))}
        </div>

        {/* 탄핵 컬럼 */}
        <div style={{ flex: 1 }}>
          <div style={{
            background: RED, color: WHITE, padding: '14px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: 2 }}>탄핵</span>
            <span style={{ fontSize: 11, opacity: 0.75 }}>
              {Math.floor(totalVotes * tPct / 100).toLocaleString()}명 지지
            </span>
          </div>

          <WriteBox
            value={texts.tanhek}
            onChange={v => setTexts(t => ({ ...t, tanhek: v }))}
            onSubmit={() => setTexts(t => ({ ...t, tanhek: '' }))}
            disabled={stance !== 'tanhek'}
            placeholder={stance === 'tanhek' ? '탄핵 찬성 의견을 남겨주세요...' : '입장 선택 후 작성 가능합니다'}
            color={RED}
          />

          {DUMMY_POSTS.tanhek.map(p => (
            <PostCard key={p.id} post={p} color={RED} />
          ))}
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer style={{
        borderTop: `3px solid ${BLACK}`, background: BLACK, color: GRAY3,
        padding: '20px 24px', display: 'flex', justifyContent: 'space-between', fontSize: 12,
      }}>
        <span style={{ fontWeight: 900, color: WHITE }}>PresidentOX</span>
        <span>본 서비스는 시민 의견 수렴 플랫폼입니다</span>
      </footer>
    </div>
  )
}

// ── 글쓰기 박스 ──────────────────────────────────────────────────────────────
function WriteBox({ value, onChange, onSubmit, disabled, placeholder, color }: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  disabled: boolean
  placeholder: string
  color: string
}) {
  return (
    <div style={{ borderBottom: `1px solid ${GRAY5}`, padding: 14 }}>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value.slice(0, 200))}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        style={{
          width: '100%', padding: '10px 12px', resize: 'none',
          background: disabled ? GRAY5 : WHITE,
          border: `1px solid ${disabled ? GRAY4 : color}`,
          fontSize: 13, color: BLACK, outline: 'none',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button
          disabled={disabled || !value.trim()}
          onClick={onSubmit}
          style={{
            padding: '8px 20px', fontSize: 13, fontWeight: 700, color: WHITE,
            background: !disabled && value.trim() ? color : GRAY4,
          }}>
          등록
        </button>
      </div>
    </div>
  )
}

// ── 게시글 카드 ──────────────────────────────────────────────────────────────
function PostCard({ post, color }: {
  post: { id: number; nickname: string; text: string; likes: number; time: string }
  color: string
}) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(post.likes)

  return (
    <div style={{ borderBottom: `1px solid ${GRAY5}`, padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{post.nickname}</span>
        <span style={{ fontSize: 11, color: GRAY3 }}>{post.time}</span>
      </div>
      <p style={{ fontSize: 14, lineHeight: 1.65, color: GRAY1, marginBottom: 12 }}>
        {post.text}
      </p>
      <button
        onClick={() => { if (!liked) { setLiked(true); setCount(c => c + 1) } }}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: 12, color: liked ? color : GRAY3, fontWeight: liked ? 700 : 400,
        }}>
        <span style={{ fontSize: 14 }}>{liked ? '♥' : '♡'}</span>
        {count.toLocaleString()}
      </button>
    </div>
  )
}
