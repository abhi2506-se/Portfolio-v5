'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, MapPin, Calendar, Tag, Play, Music, Image as ImageIcon,
  FileText, Award, ChevronLeft, ChevronRight, X, Download,
  Volume2, VolumeX, Grid3X3, Layers, Heart, ZoomIn,
  MessageCircle, Send, Trash2
} from 'lucide-react'
import { useJourneyData } from '@/hooks/useJourneyData'
import {
  getMediaUrl, isVideoId, type BlogPost, type Certificate,
  getJourneyProfile, type JourneyProfile,
  getLikes, toggleLike, addComment, deleteComment, type LikeData, type Comment
} from '@/lib/journey-store'

// ─── Media thumbnail ──────────────────────────────────────────────────────────
function MediaThumbnail({ mediaId, type, className }: { mediaId: string; type: 'image' | 'video' | 'audio'; className?: string }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    getMediaUrl(mediaId).then(u => setUrl(u))
  }, [mediaId])

  if (!url) return (
    <div className={`bg-muted flex items-center justify-center ${className}`}>
      <div className="w-6 h-6 border-2 border-muted-foreground/20 border-t-muted-foreground/60 rounded-full animate-spin" />
    </div>
  )

  if (type === 'video') return (
    <video src={url} className={className} muted playsInline preload="metadata"
      onMouseOver={e => (e.currentTarget as HTMLVideoElement).play?.()}
      onMouseOut={e => { const v = e.currentTarget as HTMLVideoElement; v.pause?.(); v.currentTime = 0 }} />
  )

  return <img src={url} alt="" className={className} loading="lazy" />
}

// ─── Full media viewer ────────────────────────────────────────────────────────
function FullMediaViewer({ mediaId, type, videoRef }: {
  mediaId: string; type: 'image' | 'video'; videoRef?: React.RefObject<HTMLVideoElement>
}) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => { getMediaUrl(mediaId).then(u => setUrl(u)) }, [mediaId])

  if (!url) return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )

  if (type === 'video') return (
    <video ref={videoRef} src={url} className="w-full h-full object-contain" controls autoPlay loop playsInline />
  )

  return <img src={url} alt="" className="w-full h-full object-contain" />
}

// ─── Audio player — synced to video ─────────────────────────────────────────
function AudioPlayer({ audioId, videoRef }: { audioId: string; videoRef?: React.RefObject<HTMLVideoElement> }) {
  const [url, setUrl] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => { getMediaUrl(audioId).then(u => setUrl(u)) }, [audioId])

  useEffect(() => {
    if (!audioRef.current || !url) return
    audioRef.current.src = url
    audioRef.current.play().then(() => setPlaying(true)).catch(() => {})
  }, [url])

  useEffect(() => {
    const vid = videoRef?.current
    const aud = audioRef.current
    if (!vid || !aud) return
    const onPlay = () => { aud.currentTime = vid.currentTime; aud.play().then(() => setPlaying(true)).catch(() => {}) }
    const onPause = () => { aud.pause(); setPlaying(false) }
    const onSeeked = () => { aud.currentTime = vid.currentTime }
    vid.addEventListener('play', onPlay)
    vid.addEventListener('pause', onPause)
    vid.addEventListener('seeked', onSeeked)
    return () => { vid.removeEventListener('play', onPlay); vid.removeEventListener('pause', onPause); vid.removeEventListener('seeked', onSeeked) }
  }, [videoRef, url])

  const toggleMute = () => {
    if (!audioRef.current) return
    audioRef.current.muted = !muted
    setMuted(!muted)
  }

  return (
    <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10">
      <audio ref={audioRef} style={{ display: 'none' }} />
      <Music className={`w-4 h-4 flex-shrink-0 ${playing ? 'text-rose-400' : 'text-white/40'}`} />
      {playing && (
        <div className="flex items-end gap-0.5 h-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-0.5 bg-rose-400 rounded-full animate-pulse" style={{ height: `${6 + i * 3}px`, animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      )}
      <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
        {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}

// ─── Likes & Comments Panel ───────────────────────────────────────────────────
function LikesComments({ postId, compact = false }: { postId: string; compact?: boolean }) {
  const [likeData, setLikeData] = useState<LikeData>({ count: 0, comments: [] })
  const [liked, setLiked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getLikes(postId).then(d => setLikeData(d))
    // Check local like state
    const key = `liked_${postId}`
    if (typeof window !== 'undefined') {
      setLiked(localStorage.getItem(key) === '1')
    }
  }, [postId])

  const handleLike = async () => {
    const key = `liked_${postId}`
    if (liked) return // no unlike in this version
    setLiked(true)
    localStorage.setItem(key, '1')
    const updated = await toggleLike(postId)
    setLikeData(updated)
  }

  const handleComment = async () => {
    if (!commentText.trim()) return
    setSubmitting(true)
    const updated = await addComment(postId, authorName.trim() || 'Anonymous', commentText.trim())
    setLikeData(updated)
    setCommentText('')
    setSubmitting(false)
  }

  const handleDeleteComment = async (commentId: string) => {
    const updated = await deleteComment(postId, commentId)
    setLikeData(updated)
  }

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <button onClick={handleLike}
          className={`flex items-center gap-1 text-sm transition-colors ${liked ? 'text-rose-500' : 'text-white/60 hover:text-rose-400'}`}>
          <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500' : ''}`} />
          <span>{likeData.count}</span>
        </button>
        <button onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1 text-sm text-white/60 hover:text-white transition-colors">
          <MessageCircle className="w-4 h-4" />
          <span>{likeData.comments.length}</span>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Like & comment counts */}
      <div className="flex items-center gap-4 px-5 py-3 border-t border-white/10">
        <button onClick={handleLike}
          className={`flex items-center gap-2 transition-all ${liked ? 'text-rose-500 scale-110' : 'text-white/60 hover:text-rose-400 hover:scale-110'}`}>
          <Heart className={`w-5 h-5 ${liked ? 'fill-rose-500' : ''}`} />
          <span className="text-sm font-medium">{likeData.count} likes</span>
        </button>
        <button onClick={() => { setShowComments(!showComments); setTimeout(() => inputRef.current?.focus(), 200) }}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">{likeData.comments.length} comments</span>
        </button>
      </div>

      {/* Comments section */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-5 pb-4 space-y-3 overflow-hidden">
            {/* Existing comments */}
            {likeData.comments.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {likeData.comments.map((c: Comment) => (
                  <div key={c.id} className="flex items-start gap-2 group">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5">
                      {c.author[0]?.toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1 min-w-0 bg-white/5 rounded-2xl px-3 py-2">
                      <p className="text-xs font-semibold text-white/80 mb-0.5">{c.author}</p>
                      <p className="text-xs text-white/60 break-words">{c.text}</p>
                    </div>
                    <button onClick={() => handleDeleteComment(c.id)}
                      className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all flex-shrink-0 mt-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/30 text-center py-2">Be the first to comment!</p>
            )}

            {/* Add comment */}
            <div className="space-y-2">
              <input
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 placeholder-white/30 focus:outline-none focus:border-white/30"
              />
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleComment()}
                  placeholder="Write a comment..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white/80 placeholder-white/30 focus:outline-none focus:border-white/30"
                />
                <button onClick={handleComment} disabled={!commentText.trim() || submitting}
                  className="w-8 h-8 rounded-full bg-rose-500 hover:bg-rose-400 disabled:opacity-40 flex items-center justify-center flex-shrink-0 transition-colors">
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Certificate Viewer ───────────────────────────────────────────────────────
function CertificateViewer({ cert, onClose }: { cert: Certificate; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => { getMediaUrl(cert.mediaId).then(u => setUrl(u)) }, [cert.mediaId])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10 flex-shrink-0">
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-white text-base sm:text-lg truncate">{cert.title}</h2>
          <p className="text-white/50 text-xs sm:text-sm">{cert.issuer} · {cert.date}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          {url && (
            <a href={url} download={cert.fileName}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs sm:text-sm text-white transition-colors">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
          )}
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 p-3 sm:p-4">
        {!url ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : cert.fileType === 'pdf' ? (
          <iframe src={url} className="w-full h-full rounded-xl border border-white/10" title={cert.title} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <img src={url} alt={cert.title} className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
          </div>
        )}
      </div>

      {/* Likes & Comments for Certificate */}
      <div className="border-t border-white/10 flex-shrink-0">
        <LikesComments postId={`cert_${cert.id}`} />
        {cert.description && (
          <div className="px-5 pb-4">
            <p className="text-white/60 text-sm">{cert.description}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Blog Lightbox ────────────────────────────────────────────────────────────
function BlogLightbox({ post, onClose, onPrev, onNext }: {
  post: BlogPost; onClose: () => void; onPrev?: () => void; onNext?: () => void
}) {
  const [mediaIndex, setMediaIndex] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hasMedia = post.mediaIds.length > 0
  const currentId = post.mediaIds[mediaIndex]
  const isVideo = (id: string) => isVideoId(id)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/98 flex flex-col md:flex-row">

      {/* Media side */}
      <div className="relative flex-1 min-h-0 bg-black flex items-center justify-center" style={{ minHeight: '50vh' }}>
        {onPrev && (
          <button onClick={onPrev} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {onNext && (
          <button onClick={onNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
        <button onClick={onClose} className="absolute top-3 left-3 z-20 w-9 h-9 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white hover:bg-black/80 transition-colors md:hidden">
          <X className="w-4 h-4" />
        </button>

        {hasMedia ? (
          <div className="w-full h-full relative">
            <AnimatePresence mode="wait">
              <motion.div key={currentId} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="w-full h-full">
                <FullMediaViewer mediaId={currentId} type={isVideo(currentId) ? 'video' : 'image'} videoRef={isVideo(currentId) ? videoRef : undefined} />
              </motion.div>
            </AnimatePresence>

            {post.mediaIds.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {post.mediaIds.map((_, i) => (
                  <button key={i} onClick={() => setMediaIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === mediaIndex ? 'bg-white scale-125' : 'bg-white/40'}`} />
                ))}
              </div>
            )}

            {post.mediaIds.length > 1 && (
              <>
                <button onClick={() => setMediaIndex(i => Math.max(0, i - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white disabled:opacity-30 hover:bg-black/80"
                  disabled={mediaIndex === 0}><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => setMediaIndex(i => Math.min(post.mediaIds.length - 1, i + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white disabled:opacity-30 hover:bg-black/80"
                  disabled={mediaIndex === post.mediaIds.length - 1}><ChevronRight className="w-4 h-4" /></button>
              </>
            )}

            {/* Audio player — no song text, just icon & controls */}
            {post.audioId && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                <AudioPlayer audioId={post.audioId} videoRef={isVideo(currentId) ? videoRef : undefined} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-white/30">
            <ImageIcon className="w-14 h-14" /><p>No media</p>
          </div>
        )}
      </div>

      {/* Details side */}
      <div className="w-full md:w-96 bg-zinc-950 flex flex-col border-t md:border-t-0 md:border-l border-white/10 overflow-hidden max-h-[50vh] md:max-h-none">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs">
              AS
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Abhishek Singh</p>
              {post.location && (
                <div className="flex items-center gap-1 text-white/50 text-xs">
                  <MapPin className="w-2.5 h-2.5" />{post.location}
                </div>
              )}
            </div>
          </div>
          <button onClick={onClose} className="hidden md:flex w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
          <div>
            <h2 className="text-white font-bold text-base leading-tight mb-1.5">{post.title}</h2>
            <p className="text-white/70 leading-relaxed text-sm">{post.description}</p>
          </div>
          {post.experience && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">✨ What I Experienced</p>
              <p className="text-white/80 text-sm leading-relaxed">{post.experience}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs px-2.5 py-1 bg-rose-500/15 text-rose-300 rounded-full border border-rose-500/20">#{tag}</span>
            ))}
          </div>
          <div className="flex items-center gap-1 text-white/40 text-xs">
            <Calendar className="w-3 h-3" />
            {new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Likes & Comments */}
        <div className="flex-shrink-0 border-t border-white/10">
          <LikesComments postId={post.id} />
        </div>
      </div>
    </motion.div>
  )
}

// ─── Blog Grid Card ───────────────────────────────────────────────────────────
function BlogCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const hasVideo = post.mediaIds.some(id => isVideoId(id))
  const hasAudio = !!post.audioId

  useEffect(() => {
    getLikes(post.id).then(d => setLikeCount(d.count))
  }, [post.id])

  return (
    <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.15 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative aspect-square cursor-pointer overflow-hidden bg-muted rounded-sm">
      {post.coverMediaId ? (
        <MediaThumbnail mediaId={post.coverMediaId} type={isVideoId(post.coverMediaId) ? 'video' : 'image'} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/60">
          <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
        </div>
      )}

      {/* Media type badges */}
      <div className="absolute top-2 right-2 flex gap-1">
        {hasVideo && <div className="w-5 h-5 rounded-full bg-black/60 backdrop-blur flex items-center justify-center"><Play className="w-2.5 h-2.5 text-white fill-white" /></div>}
        {hasAudio && <div className="w-5 h-5 rounded-full bg-black/60 backdrop-blur flex items-center justify-center"><Music className="w-2.5 h-2.5 text-white" /></div>}
        {post.mediaIds.length > 1 && <div className="w-5 h-5 rounded-full bg-black/60 backdrop-blur flex items-center justify-center"><Layers className="w-2.5 h-2.5 text-white" /></div>}
      </div>

      {/* Like count badge */}
      {likeCount > 0 && (
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur rounded-full px-1.5 py-0.5">
          <Heart className="w-2.5 h-2.5 text-rose-400 fill-rose-400" />
          <span className="text-xs text-white/80">{likeCount}</span>
        </div>
      )}

      <AnimatePresence>
        {hovered && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1.5 p-3">
            <p className="text-white font-bold text-sm text-center line-clamp-2">{post.title}</p>
            {post.location && (
              <div className="flex items-center gap-1 text-white/70 text-xs">
                <MapPin className="w-3 h-3" />{post.location}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Certificate Card ─────────────────────────────────────────────────────────
function CertCard({ cert, onClick }: { cert: Certificate; onClick: () => void }) {
  const [url, setUrl] = useState<string | null>(null)
  const [likeData, setLikeData] = useState<LikeData>({ count: 0, comments: [] })

  useEffect(() => {
    if (cert.fileType !== 'image') return
    getMediaUrl(cert.mediaId).then(u => setUrl(u))
  }, [cert.mediaId, cert.fileType])

  useEffect(() => {
    getLikes(`cert_${cert.id}`).then(d => setLikeData(d))
  }, [cert.id])

  const categoryColors: Record<string, string> = {
    'Cloud': 'from-blue-600 to-cyan-500',
    'Web Dev': 'from-violet-600 to-purple-500',
    'AI/ML': 'from-rose-500 to-orange-500',
    'DevOps': 'from-green-600 to-teal-500',
    'Data Science': 'from-yellow-500 to-orange-600',
    'default': 'from-slate-600 to-slate-500',
  }
  const gradient = categoryColors[cert.category] ?? categoryColors['default']

  return (
    <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.15 }}
      className="relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card group">
      <div onClick={onClick} className="relative h-44 sm:h-52 overflow-hidden">
        {cert.fileType === 'image' && url ? (
          <img src={url} alt={cert.title} className="w-full h-full object-cover" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <FileText className="w-14 h-14 text-white/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-2.5 right-2.5">
          <span className="text-xs px-2 py-0.5 rounded-full bg-black/60 backdrop-blur text-white/80 border border-white/10">
            {cert.fileType.toUpperCase()}
          </span>
        </div>
        <ZoomIn className="absolute top-2.5 left-2.5 w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
      </div>
      <div className="p-3.5">
        <p className="font-bold text-foreground text-sm mb-0.5 line-clamp-2">{cert.title}</p>
        <p className="text-muted-foreground text-xs mb-2.5">{cert.issuer}</p>
        <div className="flex items-center justify-between mb-2.5">
          <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${gradient} text-white font-medium`}>
            {cert.category || 'Certificate'}
          </span>
          <span className="text-muted-foreground text-xs">{cert.date}</span>
        </div>
        {/* Like/comment count row */}
        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Heart className={`w-3.5 h-3.5 ${likeData.count > 0 ? 'text-rose-400 fill-rose-400' : ''}`} />
            <span>{likeData.count}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{likeData.comments.length}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Profile Avatar ───────────────────────────────────────────────────────────
function ProfileAvatar({ url, fallback, size = 'md' }: { url: string; fallback: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-10 h-10', md: 'w-20 h-20 md:w-24 md:h-24', lg: 'w-24 h-24' }
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-rose-500 via-orange-500 to-yellow-500 p-0.5 flex-shrink-0`}>
      <div className="w-full h-full rounded-full bg-background overflow-hidden">
        {url ? (
          <img src={url} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className={`font-bold ${size === 'md' ? 'text-2xl' : 'text-lg'}`}>{fallback}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function JourneyPage() {
  const router = useRouter()
  const { blogs, certificates, loading } = useJourneyData()
  const [activeTab, setActiveTab] = useState<'blogs' | 'certificates'>('blogs')
  const [activeBlog, setActiveBlog] = useState<number | null>(null)
  const [activeCert, setActiveCert] = useState<Certificate | null>(null)
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<JourneyProfile | null>(null)

  useEffect(() => {
    setMounted(true)
    getJourneyProfile().then(p => setProfile(p))
  }, [])

  if (!mounted) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-muted-foreground/20 border-t-muted-foreground rounded-full animate-spin" />
    </div>
  )

  const activeBlogPost = activeBlog !== null ? blogs[activeBlog] : null
  const profileName = profile?.name || 'Abhishek Singh'
  const profileInitials = profileName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 h-13 sm:h-14 flex items-center gap-3">
          <button onClick={() => router.push('/')}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors flex-shrink-0">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-base sm:text-lg tracking-tight truncate">My Journey</h1>
          </div>
          <div className="flex bg-secondary rounded-full p-0.5 sm:p-1 gap-0.5 sm:gap-1">
            <button onClick={() => setActiveTab('blogs')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${activeTab === 'blogs' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>
              <Grid3X3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Blogs</span>
              {blogs.length > 0 && <span className="text-xs opacity-60">({blogs.length})</span>}
            </button>
            <button onClick={() => setActiveTab('certificates')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${activeTab === 'certificates' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>
              <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Certs</span>
              {certificates.length > 0 && <span className="text-xs opacity-60">({certificates.length})</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Profile strip */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <div className="flex items-center gap-4 sm:gap-6">
          <ProfileAvatar
            url={profile?.journeyProfileUrl || ''}
            fallback={profileInitials}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold mb-0.5 truncate">{profile?.name || 'Abhishek Singh'}</h2>
            <p className="text-muted-foreground text-xs sm:text-sm mb-1 line-clamp-2">{profile?.tagline || 'DevOps Engineer · Full Stack Developer'}</p>
            {profile?.bio && profile.bio !== profile.tagline && (
              <p className="text-muted-foreground text-xs mb-3 line-clamp-2 hidden sm:block">{profile.bio}</p>
            )}
            <div className="flex gap-4 sm:gap-6 text-sm">
              <div className="text-center">
                <p className="font-bold text-foreground text-sm sm:text-base">{loading ? '…' : blogs.length}</p>
                <p className="text-muted-foreground text-xs">posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground text-sm sm:text-base">{loading ? '…' : certificates.length}</p>
                <p className="text-muted-foreground text-xs">certs</p>
              </div>
            </div>
          </div>
        </div>
        {profile?.bio && (
          <p className="text-muted-foreground text-sm mt-3 sm:hidden">{profile.bio}</p>
        )}
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 pb-16">
        {loading ? (
          <div className="py-24 flex flex-col items-center gap-4 text-muted-foreground">
            <div className="w-10 h-10 border-2 border-muted-foreground/20 border-t-muted-foreground/60 rounded-full animate-spin" />
            <p className="text-sm">Loading journey…</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'blogs' ? (
              <motion.div key="blogs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {blogs.length === 0 ? (
                  <div className="py-24 flex flex-col items-center gap-4 text-muted-foreground">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-medium">No posts yet</p>
                    <p className="text-sm text-center max-w-xs">Add your first memory from the admin dashboard to start your journey.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-0.5">
                    {blogs.map((post, idx) => (
                      <BlogCard key={post.id} post={post} onClick={() => setActiveBlog(idx)} />
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="certs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {certificates.length === 0 ? (
                  <div className="py-24 flex flex-col items-center gap-4 text-muted-foreground">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                      <Award className="w-8 h-8" />
                    </div>
                    <p className="text-lg font-medium">No certificates yet</p>
                    <p className="text-sm text-center max-w-xs">Upload your certificates from the admin panel to showcase your achievements.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {certificates.map(cert => (
                      <CertCard key={cert.id} cert={cert} onClick={() => setActiveCert(cert)} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Blog lightbox */}
      <AnimatePresence>
        {activeBlogPost && (
          <BlogLightbox
            post={activeBlogPost}
            onClose={() => setActiveBlog(null)}
            onPrev={activeBlog! > 0 ? () => setActiveBlog(i => i! - 1) : undefined}
            onNext={activeBlog! < blogs.length - 1 ? () => setActiveBlog(i => i! + 1) : undefined}
          />
        )}
      </AnimatePresence>

      {/* Certificate viewer */}
      <AnimatePresence>
        {activeCert && <CertificateViewer cert={activeCert} onClose={() => setActiveCert(null)} />}
      </AnimatePresence>
    </div>
  )
}
