/**
 * main.js — MAMBAQ v5.0
 * - Likes y vistas acumulativos en Supabase (sin localStorage)
 * - Zoom en modal con botones + pan drag
 * - Fingerprint de dispositivo para likes únicos
 */

/* ══════════════════════════════════════════════════════════
   1. SUPABASE / DATABASE
   ══════════════════════════════════════════════════════════ */

const SUPABASE_URL = 'https://boojfloqcpohyhecbaih.supabase.co';
const SUPABASE_KEY = 'sb_publishable_k-CKUTN3UgXWf6ha6hZ5cw_8Wsfw7JN';
const STORAGE_BUCKET = 'pixel-artworks';
const TABLE_NAME = 'obras';

let _supabase = null;

function DB_init() {
  try {
    if (!SUPABASE_URL.includes('supabase.co') || SUPABASE_KEY === 'TU_ANON_KEY_AQUI') {
      console.warn('[DB] Credenciales de Supabase no configuradas');
      return false;
    }
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('[DB] Conectado a Supabase');
    return true;
  } catch (e) {
    console.error('[DB]', e);
    return false;
  }
}

async function DB_uploadImage(blob, fileName) {
  if (!_supabase) { UI_toast('Supabase no está configurado', 'error'); return null; }
  try {
    const path = `public/${Date.now()}_${fileName}`;
    const { error } = await _supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, blob, { contentType: 'image/png', upsert: false });
    if (error) throw error;
    const { data } = _supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    console.error('[DB] upload:', e);
    return null;
  }
}

async function DB_saveArtwork({ nombre, autor, url_imagen }) {
  if (!_supabase) {
    UI_toast('Supabase no está configurado. Configura las credenciales en main.js', 'error', 4000);
    return null;
  }
  try {
    const { data, error } = await _supabase
      .from(TABLE_NAME)
      .insert([{
        nombre: nombre || 'Sin título',
        autor: autor || 'Artista Anónimo',
        url_imagen,
        fecha_creacion: new Date().toISOString(),
        likes: 0,
        vistas: 0,
        eliminado: false
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (e) {
    console.error('[DB] save:', e);
    return null;
  }
}

async function DB_getArtworks() {
  if (!_supabase) {
    console.warn('[DB] Supabase no configurado');
    return [];
  }
  try {
    const { data, error } = await _supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('eliminado', false)
      .order('fecha_creacion', { ascending: false })
      .limit(80);
    if (error) throw error;
    return data;
  } catch (e) {
    console.error('[DB] get:', e);
    return [];
  }
}

async function DB_incrementVistas(id) {
  if (!_supabase) return null;
  try {
    const { data: row, error: fetchErr } = await _supabase
      .from(TABLE_NAME)
      .select('vistas')
      .eq('id', id)
      .single();
    if (fetchErr) throw fetchErr;
    const newVistas = (row.vistas || 0) + 1;
    const { error } = await _supabase
      .from(TABLE_NAME)
      .update({ vistas: newVistas })
      .eq('id', id);
    if (error) throw error;
    return newVistas;
  } catch (e) {
    console.error('[DB] vistas:', e);
    return null;
  }
}

async function DB_addLike(id, delta = 1) {
  if (!_supabase) return null;
  try {
    const { data: row, error: fetchErr } = await _supabase
      .from(TABLE_NAME)
      .select('likes')
      .eq('id', id)
      .single();
    if (fetchErr) throw fetchErr;
    const newLikes = Math.max(0, (row.likes || 0) + delta);
    const { error } = await _supabase
      .from(TABLE_NAME)
      .update({ likes: newLikes })
      .eq('id', id);
    if (error) throw error;
    return newLikes;
  } catch (e) {
    console.error('[DB] likes:', e);
    return null;
  }
}

/* ── DEVICE FINGERPRINT ── */
function _canvas_fingerprint() {
  try {
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('MAMBAQ🎨', 2, 15);
    ctx.fillStyle = 'rgba(102,204,0,0.7)';
    ctx.fillText('MAMBAQ🎨', 4, 17);
    return c.toDataURL().slice(-50);
  } catch {
    return 'no-canvas';
  }
}

async function DB_getDeviceId() {
  const saved = localStorage.getItem('mambaq_device_id');
  if (saved) return saved;

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency,
    navigator.deviceMemory || 'unknown',
    new Date().getTimezoneOffset(),
    _canvas_fingerprint(),
  ].join('|');

  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(components));
  const id = Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  localStorage.setItem('mambaq_device_id', id);
  return id;
}

async function DB_hasLiked(obraId) {
  if (!_supabase) return false;
  try {
    const deviceId = await DB_getDeviceId();
    const { data, error } = await _supabase
      .from('likes_dispositivo')
      .select('obra_id')
      .eq('obra_id', obraId)
      .eq('dispositivo_id', deviceId)
      .maybeSingle();
    if (error) throw error;
    return data !== null;
  } catch (e) {
    console.error('[DB] hasLiked:', e);
    return false;
  }
}

async function DB_registerLike(obraId) {
  if (!_supabase) return;
  try {
    const deviceId = await DB_getDeviceId();
    await _supabase
      .from('likes_dispositivo')
      .insert([{ obra_id: obraId, dispositivo_id: deviceId }]);
  } catch (e) {
    console.error('[DB] registerLike:', e);
  }
}

async function DB_unregisterLike(obraId) {
  if (!_supabase) return;
  try {
    const deviceId = await DB_getDeviceId();
    await _supabase
      .from('likes_dispositivo')
      .delete()
      .eq('obra_id', obraId)
      .eq('dispositivo_id', deviceId);
  } catch (e) {
    console.error('[DB] unregisterLike:', e);
  }
}

const DB = {
  init: DB_init,
  uploadImage: DB_uploadImage,
  saveArtwork: DB_saveArtwork,
  getArtworks: DB_getArtworks,
  incrementVistas: DB_incrementVistas,
  addLike: DB_addLike,
  isConnected: () => _supabase !== null
};

/* ══════════════════════════════════════════════════════════
   2. PIXEL ART ENGINE
   ══════════════════════════════════════════════════════════ */

const PIXEL_SIZE = 4;

async function FX_applyEffect(srcCanvas, dstCanvas, effect, opts = {}) {
  const { onProgress } = opts;
  const W = srcCanvas.width, H = srcCanvas.height;
  dstCanvas.width = W; dstCanvas.height = H;
  const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
  const dstCtx = dstCanvas.getContext('2d');
  onProgress?.(0.05);

  if (effect === 'original') {
    dstCtx.drawImage(srcCanvas, 0, 0);
    onProgress?.(1.0);
    return;
  }

  if (effect === 'pixel') {
    let px = srcCtx.getImageData(0, 0, W, H).data;
    onProgress?.(0.2);
    px = _pixelate(px, W, H, PIXEL_SIZE);
    onProgress?.(0.7);
    dstCtx.putImageData(new ImageData(px, W, H), 0, 0);
    _applyPixelScale(dstCanvas, W, H, PIXEL_SIZE);
    onProgress?.(1.0);
    return;
  }

  if (effect === 'bw') {
    let px = srcCtx.getImageData(0, 0, W, H).data;
    onProgress?.(0.3);
    px = _applyBW(px);
    onProgress?.(0.9);
    dstCtx.putImageData(new ImageData(px, W, H), 0, 0);
    onProgress?.(1.0);
    return;
  }

  if (effect === 'paint') {
    let px = srcCtx.getImageData(0, 0, W, H).data;
    onProgress?.(0.3);
    px = _applyOilPaint(px, W, H, onProgress);
    onProgress?.(0.9);
    dstCtx.putImageData(new ImageData(px, W, H), 0, 0);
    onProgress?.(1.0);
    return;
  }

  dstCtx.drawImage(srcCanvas, 0, 0);
  onProgress?.(1.0);
}

function _applyBW(px) {
  const out = new Uint8ClampedArray(px.length);
  for (let i = 0; i < px.length; i += 4) {
    const lum = Math.round(0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]);
    out[i] = lum; out[i + 1] = lum; out[i + 2] = lum; out[i + 3] = px[i + 3];
  }
  return out;
}

function _applyOilPaint(px, W, H, onProgress) {
  const radius = 4;
  const out = new Uint8ClampedArray(px.length);
  const total = W * H;
  let done = 0;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const quadrants = [
        { sx: x - radius, sy: y - radius, ex: x, ey: y },
        { sx: x, sy: y - radius, ex: x + radius, ey: y },
        { sx: x - radius, sy: y, ex: x, ey: y + radius },
        { sx: x, sy: y, ex: x + radius, ey: y + radius },
      ];

      let bestVar = Infinity;
      let bestR = px[(y * W + x) * 4], bestG = px[(y * W + x) * 4 + 1], bestB = px[(y * W + x) * 4 + 2];

      for (const q of quadrants) {
        let sumR = 0, sumG = 0, sumB = 0, count = 0;
        let sumR2 = 0, sumG2 = 0, sumB2 = 0;
        for (let qy = q.sy; qy <= q.ey; qy++) {
          for (let qx = q.sx; qx <= q.ex; qx++) {
            if (qx < 0 || qx >= W || qy < 0 || qy >= H) continue;
            const qi = (qy * W + qx) * 4;
            const r = px[qi], g = px[qi + 1], b = px[qi + 2];
            sumR += r; sumG += g; sumB += b;
            sumR2 += r * r; sumG2 += g * g; sumB2 += b * b;
            count++;
          }
        }
        if (count === 0) continue;
        const mR = sumR / count, mG = sumG / count, mB = sumB / count;
        const variance = (sumR2 / count - mR * mR) + (sumG2 / count - mG * mG) + (sumB2 / count - mB * mB);
        if (variance < bestVar) { bestVar = variance; bestR = mR; bestG = mG; bestB = mB; }
      }

      const i = (y * W + x) * 4;
      out[i] = _clamp(bestR); out[i + 1] = _clamp(bestG); out[i + 2] = _clamp(bestB); out[i + 3] = px[i + 3];
    }
    done += W;
    if (done % (W * 20) === 0) onProgress?.(0.3 + (done / total) * 0.55);
  }
  return _enhanceContrast(out, 1.05, 1.35);
}

function _pixelate(px, W, H, bs) {
  const out = new Uint8ClampedArray(px.length);
  for (let by = 0; by < H; by += bs) for (let bx = 0; bx < W; bx += bs) {
    let r = 0, g = 0, b = 0, a = 0, c = 0;
    for (let dy = 0; dy < bs && by + dy < H; dy++) for (let dx = 0; dx < bs && bx + dx < W; dx++) {
      const i = ((by + dy) * W + (bx + dx)) * 4;
      r += px[i]; g += px[i + 1]; b += px[i + 2]; a += px[i + 3]; c++;
    }
    r = Math.round(r / c); g = Math.round(g / c); b = Math.round(b / c); a = Math.round(a / c);
    for (let dy = 0; dy < bs && by + dy < H; dy++) for (let dx = 0; dx < bs && bx + dx < W; dx++) {
      const i = ((by + dy) * W + (bx + dx)) * 4;
      out[i] = r; out[i + 1] = g; out[i + 2] = b; out[i + 3] = a;
    }
  }
  return out;
}

function _applyPixelScale(canvas, W, H, ps) {
  const ctx = canvas.getContext('2d');
  const sW = Math.ceil(W / ps), sH = Math.ceil(H / ps);
  const tmp = document.createElement('canvas'); tmp.width = sW; tmp.height = sH;
  const tCtx = tmp.getContext('2d');
  tCtx.imageSmoothingEnabled = false; ctx.imageSmoothingEnabled = false;
  tCtx.drawImage(canvas, 0, 0, sW, sH);
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(tmp, 0, 0, W, H);
}

function _enhanceContrast(px, contrast = 1.1, sat = 1.2) {
  const out = new Uint8ClampedArray(px.length);
  for (let i = 0; i < px.length; i += 4) {
    let r = _clamp((px[i] - 128) * contrast + 128),
      g = _clamp((px[i + 1] - 128) * contrast + 128),
      b = _clamp((px[i + 2] - 128) * contrast + 128);
    const gr = 0.299 * r + 0.587 * g + 0.114 * b;
    out[i] = _clamp(gr + (r - gr) * sat);
    out[i + 1] = _clamp(gr + (g - gr) * sat);
    out[i + 2] = _clamp(gr + (b - gr) * sat);
    out[i + 3] = px[i + 3];
  }
  return out;
}

function _clamp(v) { return Math.max(0, Math.min(255, Math.round(v))); }
function FX_canvasToBlob(canvas) { return new Promise(res => canvas.toBlob(b => res(b), 'image/png', 1.0)); }

/* ══════════════════════════════════════════════════════════
   3. PARTICLES
   ══════════════════════════════════════════════════════════ */

function PARTICLES_init() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const COUNT = 40;
  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.6 + 0.1,
      hue: Math.random() > 0.7 ? 45 : (Math.random() > 0.5 ? 280 : 185),
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════════════════
   4. CAMERA
   ══════════════════════════════════════════════════════════ */

let _stream = null;
let _videoEl = null;
let _originalCanvas = null;
let _hasImage = false;
let _mainCanvas, _placeholder, _fileInput;

function CAM_init(refs) {
  _mainCanvas = refs.mainCanvas;
  _placeholder = refs.canvasPlaceholder;
  _fileInput = refs.fileInput;
  _originalCanvas = document.createElement('canvas');

  refs.canvasContainer.addEventListener('click', () => { if (!_hasImage) CAM_openUpload(); });
  _fileInput.addEventListener('change', e => {
    const f = e.target.files?.[0];
    if (f) CAM_loadFile(f);
    _fileInput.value = '';
  });

  refs.canvasContainer.addEventListener('dragover', e => {
    e.preventDefault();
    refs.canvasContainer.style.outline = '1px solid var(--gold)';
  });
  refs.canvasContainer.addEventListener('dragleave', () => { refs.canvasContainer.style.outline = ''; });
  refs.canvasContainer.addEventListener('drop', e => {
    e.preventDefault();
    refs.canvasContainer.style.outline = '';
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith('image/')) CAM_loadFile(f);
  });
}

async function CAM_openCamera() {
  if (!navigator.mediaDevices?.getUserMedia) { UI_toast('Tu navegador no soporta cámara', 'error'); return; }
  try {
    _stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 1280 } },
      audio: false
    });
    _showCameraOverlay();
  } catch (e) {
    UI_toast(e.name === 'NotAllowedError' ? 'Permiso de cámara denegado' : 'No se pudo acceder a la cámara', 'error');
  }
}

function _showCameraOverlay() {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:900;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;';
  _videoEl = document.createElement('video');
  _videoEl.autoplay = true; _videoEl.playsInline = true; _videoEl.muted = true; _videoEl.srcObject = _stream;
  _videoEl.style.cssText = 'width:100%;max-width:580px;aspect-ratio:1;object-fit:cover;';
  const label = document.createElement('div');
  label.textContent = 'CAPTURAR IMAGEN';
  label.style.cssText = 'font-family:"DM Mono",monospace;font-size:9px;letter-spacing:3px;color:rgba(201,168,76,0.5);position:absolute;top:20px;left:50%;transform:translateX(-50%);';
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex;gap:14px;z-index:2;';
  const btnCancel = document.createElement('button');
  btnCancel.textContent = 'Cancelar';
  btnCancel.style.cssText = 'padding:12px 24px;border:1px solid rgba(255,255,255,0.15);background:rgba(0,0,0,0.5);color:rgba(255,255,255,0.7);font-family:inherit;font-size:13px;border-radius:2px;cursor:pointer;letter-spacing:1px;';
  btnCancel.onclick = () => { CAM_stopCamera(); overlay.remove(); };
  const btnCap = document.createElement('button');
  btnCap.textContent = 'Capturar';
  btnCap.style.cssText = 'padding:13px 32px;background:linear-gradient(135deg,#8a6e30,#c9a84c,#e8c97a);color:#0e0c00;font-family:inherit;font-size:13px;font-weight:700;border-radius:2px;cursor:pointer;letter-spacing:1px;';
  btnCap.onclick = () => { _captureFromVideo(); overlay.remove(); };
  btnRow.append(btnCancel, btnCap);
  overlay.append(label, _videoEl, btnRow);
  document.body.appendChild(overlay);
}

function _captureFromVideo() {
  if (!_videoEl) return;
  const W = _videoEl.videoWidth || 640, H = _videoEl.videoHeight || 640;
  _originalCanvas.width = W; _originalCanvas.height = H;
  _originalCanvas.getContext('2d').drawImage(_videoEl, 0, 0, W, H);
  _mainCanvas.width = W; _mainCanvas.height = H;
  _mainCanvas.getContext('2d').drawImage(_videoEl, 0, 0, W, H);
  _hasImage = true;
  _placeholder.classList.add('hidden');
  document.getElementById('settingsPanel').classList.add('visible');
  AppState.effectApplied = false;
  CAM_stopCamera();
}

function CAM_stopCamera() {
  if (_stream) { _stream.getTracks().forEach(t => t.stop()); _stream = null; }
}

function CAM_openUpload() { _fileInput.click(); }

function CAM_loadFile(file) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const maxS = 1280;
      let W = img.width, H = img.height;
      if (W > maxS || H > maxS) { const s = maxS / Math.max(W, H); W = Math.round(W * s); H = Math.round(H * s); }
      _originalCanvas.width = W; _originalCanvas.height = H;
      _originalCanvas.getContext('2d').drawImage(img, 0, 0, W, H);
      _mainCanvas.width = W; _mainCanvas.height = H;
      _mainCanvas.getContext('2d').drawImage(img, 0, 0, W, H);
      _hasImage = true;
      _placeholder.classList.add('hidden');
      document.getElementById('settingsPanel').classList.add('visible');
      AppState.effectApplied = false;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function CAM_hasImage() { return _hasImage; }
function CAM_getOriginal() { return _originalCanvas; }

/* ══════════════════════════════════════════════════════════
   5. UI
   ══════════════════════════════════════════════════════════ */

let _currentSection = 'crear';
const _sectionIds = ['crear', 'museo', 'sobre'];
let _modalCurrentArtwork = null;

/* ── ZOOM STATE ── */
let _zoomLevel = 1;
const ZOOM_MIN = 1;
const ZOOM_MAX = 4;
const ZOOM_STEP = 0.5;

function UI_init() {
  _sectionIds.forEach(id => {
    document.querySelector(`[data-section="${id}"]`)?.addEventListener('click', () => UI_navigateTo(id));
  });
  document.getElementById('modalClose')?.addEventListener('click', UI_closeArtworkModal);
  document.getElementById('saveModalClose')?.addEventListener('click', UI_closeSaveModal);
  document.getElementById('artworkModal')?.addEventListener('click', e => {
    if (e.target.id === 'artworkModal') UI_closeArtworkModal();
  });
  document.getElementById('saveModal')?.addEventListener('click', e => {
    if (e.target.id === 'saveModal') UI_closeSaveModal();
  });
  _initSwipe();
  _animateAboutCards();
  _initZoomControls();
}

/* ── ZOOM + PAN ── */
let _panX = 0, _panY = 0;
let _isDragging = false;
let _dragStartX = 0, _dragStartY = 0;
let _panStartX = 0, _panStartY = 0;
let _lastPinchDist = null;

function _initZoomControls() {
  document.getElementById('zoomIn')?.addEventListener('click', () => _setZoom(_zoomLevel + ZOOM_STEP));
  document.getElementById('zoomOut')?.addEventListener('click', () => _setZoom(_zoomLevel - ZOOM_STEP));
  document.getElementById('zoomReset')?.addEventListener('click', () => _setZoom(1));

  const img = document.getElementById('modalImage');
  if (!img) return;

  /* ── MOUSE drag ── */
  img.addEventListener('mousedown', e => {
    if (_zoomLevel <= 1) return;
    e.preventDefault();
    _isDragging = true;
    _dragStartX = e.clientX;
    _dragStartY = e.clientY;
    _panStartX = _panX;
    _panStartY = _panY;
    img.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', e => {
    if (!_isDragging) return;
    _panX = _panStartX + (e.clientX - _dragStartX);
    _panY = _panStartY + (e.clientY - _dragStartY);
    _applyTransform();
  });

  window.addEventListener('mouseup', () => {
    if (!_isDragging) return;
    _isDragging = false;
    img.style.cursor = _zoomLevel > 1 ? 'grab' : 'default';
  });

  /* ── Wheel zoom ── */
  img.addEventListener('wheel', e => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    _setZoom(_zoomLevel + delta);
  }, { passive: false });

  /* ── TOUCH drag ── */
  img.addEventListener('touchstart', e => {
    if (e.touches.length === 1 && _zoomLevel > 1) {
      _isDragging = true;
      _dragStartX = e.touches[0].clientX;
      _dragStartY = e.touches[0].clientY;
      _panStartX = _panX;
      _panStartY = _panY;
    }
    if (e.touches.length === 2) {
      _isDragging = false;
      _lastPinchDist = _getPinchDist(e.touches);
    }
  }, { passive: true });

  img.addEventListener('touchmove', e => {
    if (e.touches.length === 1 && _isDragging) {
      e.preventDefault();
      _panX = _panStartX + (e.touches[0].clientX - _dragStartX);
      _panY = _panStartY + (e.touches[0].clientY - _dragStartY);
      _applyTransform();
    }
    if (e.touches.length === 2 && _lastPinchDist !== null) {
      e.preventDefault();
      const newDist = _getPinchDist(e.touches);
      const ratio = newDist / _lastPinchDist;
      _lastPinchDist = newDist;
      _setZoom(_zoomLevel * ratio);
    }
  }, { passive: false });

  img.addEventListener('touchend', e => {
    if (e.touches.length < 2) _lastPinchDist = null;
    if (e.touches.length === 0) _isDragging = false;
  }, { passive: true });
}

function _getPinchDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function _applyTransform() {
  const img = document.getElementById('modalImage');
  if (!img) return;
  img.style.transform = `scale(${_zoomLevel}) translate(${_panX / _zoomLevel}px, ${_panY / _zoomLevel}px)`;
}

function _setZoom(level) {
  _zoomLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, level));
  if (_zoomLevel === 1) { _panX = 0; _panY = 0; }
  const img = document.getElementById('modalImage');
  if (img) {
    _applyTransform();
    img.style.transformOrigin = 'center center';
    img.style.cursor = _zoomLevel > 1 ? 'grab' : 'default';
  }
  const label = document.getElementById('zoomLevel');
  if (label) label.textContent = `${Math.round(_zoomLevel * 100)}%`;
  const btnOut = document.getElementById('zoomOut');
  const btnIn = document.getElementById('zoomIn');
  if (btnOut) btnOut.disabled = _zoomLevel <= ZOOM_MIN;
  if (btnIn) btnIn.disabled = _zoomLevel >= ZOOM_MAX;
}

function _resetZoom() {
  _zoomLevel = 1;
  _panX = 0;
  _panY = 0;
  _isDragging = false;
  const img = document.getElementById('modalImage');
  if (img) { img.style.transform = ''; img.style.cursor = ''; }
  const label = document.getElementById('zoomLevel');
  if (label) label.textContent = '100%';
  const btnOut = document.getElementById('zoomOut');
  const btnIn = document.getElementById('zoomIn');
  if (btnOut) btnOut.disabled = false;
  if (btnIn) btnIn.disabled = false;
}

function UI_hideSplash(cb) {
  const splash = document.getElementById('splash');
  const app = document.getElementById('app');
  const statuses = ['Cargando motor de efectos...', 'Inicializando colección...', 'Preparando efectos artísticos...', 'Museo listo ✦'];
  let si = 0;
  const statusEl = document.getElementById('splashStatus');
  const iv = setInterval(() => { si = (si + 1) % statuses.length; if (statusEl) statusEl.textContent = statuses[si]; }, 700);

  let done = false;
  function doHide() {
    if (done) return; done = true;
    clearInterval(iv);
    splash.classList.add('exit');
    setTimeout(() => {
      splash.style.display = 'none';
      app.classList.remove('hidden');
      _animateAboutCards();
      cb?.();
    }, 1000);
  }
  setTimeout(doHide, 3200);
  splash.addEventListener('click', doHide);
}

function UI_navigateTo(id) {
  if (id === _currentSection) return;
  const ids = { crear: 'sectionCrear', museo: 'sectionMuseo', sobre: 'sectionSobre' };
  const cur = document.getElementById(ids[id]);
  const prev = document.getElementById(ids[_currentSection]);
  if (!cur || !prev) return;
  const ci = _sectionIds.indexOf(_currentSection), ti = _sectionIds.indexOf(id);
  const dir = ti > ci ? 1 : -1;
  prev.classList.remove('active');
  prev.style.transform = `translateX(${-30 * dir}px)`; prev.style.opacity = '0';
  cur.style.cssText = `transform:translateX(${30 * dir}px);opacity:0;transition:none;`;
  requestAnimationFrame(() => requestAnimationFrame(() => { cur.style.cssText = ''; cur.classList.add('active'); }));
  setTimeout(() => { prev.style.transform = ''; prev.style.opacity = ''; }, 450);
  document.querySelector(`[data-section="${_currentSection}"]`)?.classList.remove('active');
  document.querySelector(`[data-section="${id}"]`)?.classList.add('active');
  _currentSection = id;
  if (id === 'sobre') _animateAboutCards();
  if (id === 'museo') APP_loadMuseo?.();
}

function _initSwipe() {
  let sx = 0, sy = 0;
  document.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      const ci = _sectionIds.indexOf(_currentSection);
      if (dx < 0 && ci < _sectionIds.length - 1) UI_navigateTo(_sectionIds[ci + 1]);
      else if (dx > 0 && ci > 0) UI_navigateTo(_sectionIds[ci - 1]);
    }
  }, { passive: true });
}

function _animateAboutCards() {
  document.querySelectorAll('.about-card').forEach((c, i) => setTimeout(() => c.classList.add('visible'), i * 80));
}

async function UI_openArtworkModal(aw) {
  _modalCurrentArtwork = aw;
  _resetZoom();

  document.getElementById('modalImage').src = aw.url_imagen || '';
  document.getElementById('modalTitle').textContent = aw.nombre || 'Sin título';
  document.getElementById('modalAuthor').textContent = aw.autor || 'Artista Anónimo';
  document.getElementById('modalDate').textContent = _fmtDate(aw.fecha_creacion);

  document.getElementById('modalLikeCount').textContent = aw.likes || 0;
  document.getElementById('modalViewCount').textContent = aw.vistas || 0;

  // Consultar en DB si este dispositivo ya dio like
  const likeBtn = document.getElementById('modalLikeBtn');
  likeBtn.classList.remove('liked');
  DB_hasLiked(aw.id).then(hasLiked => {
    likeBtn.classList.toggle('liked', hasLiked);
  });

  document.getElementById('artworkModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  const newVistas = await DB.incrementVistas(aw.id);
  if (newVistas !== null) {
    document.getElementById('modalViewCount').textContent = newVistas;
    _modalCurrentArtwork = { ..._modalCurrentArtwork, vistas: newVistas };
    _refreshCardStat(aw.id, 'vistas', newVistas);
  }
}

function UI_closeArtworkModal() {
  const m = document.getElementById('artworkModal');
  m.classList.add('fade-out');
  setTimeout(() => {
    m.classList.remove('fade-out');
    m.classList.add('hidden');
    document.getElementById('modalImage').src = '';
    document.body.style.overflow = '';
    _modalCurrentArtwork = null;
    _resetZoom();
  }, 300);
}

function UI_openSaveModal(srcCanvas) {
  const pc = document.getElementById('savePreviewCanvas');
  pc.width = srcCanvas.width; pc.height = srcCanvas.height;
  pc.getContext('2d').drawImage(srcCanvas, 0, 0);
  document.getElementById('saveModal').classList.remove('hidden');
  setTimeout(() => document.getElementById('obraName').focus(), 100);
}

function UI_closeSaveModal() { document.getElementById('saveModal').classList.add('hidden'); }

function _refreshCardStat(id, tipo, valor) {
  document.querySelectorAll('.gallery-card').forEach(card => {
    if (card.dataset.id === String(id)) {
      const selector = tipo === 'likes' ? '.card-likes-count' : '.card-vistas-count';
      const el = card.querySelector(selector);
      if (el) el.textContent = valor;
    }
  });
}

/* ── GALLERY ── */
function UI_renderGallery(artworks) {
  const grid = document.getElementById('galleryGrid');
  const loading = document.getElementById('galleryLoading');
  const empty = document.getElementById('emptyState');
  loading?.remove();
  if (!artworks?.length) { empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  grid.innerHTML = '';
  artworks.forEach((aw, i) => grid.appendChild(_makeCard(aw, i)));
}

function _makeCard(aw, idx) {
  const card = document.createElement('div');
  card.className = 'gallery-card';
  card.dataset.id = aw.id;
  card.style.setProperty('--card-delay', `${Math.min(idx * 0.04, 0.5)}s`);

  const img = document.createElement('img');
  img.className = 'gallery-card-img'; img.alt = aw.nombre || 'Obra'; img.loading = 'lazy';
  if (aw.url_imagen) img.src = aw.url_imagen;
  else img.style.background = `hsl(${(idx * 47) % 360},25%,12%)`;

  const num = document.createElement('div');
  num.className = 'gallery-card-num'; num.textContent = String(idx + 1).padStart(2, '0');

  const info = document.createElement('div');
  info.className = 'gallery-card-info';

  const title = document.createElement('div');
  title.className = 'gallery-card-title'; title.textContent = aw.nombre || 'Sin título';

  const author = document.createElement('div');
  author.className = 'gallery-card-author'; author.textContent = aw.autor || 'Anónimo';

  const stats = document.createElement('div');
  stats.className = 'gallery-card-stats';
  stats.innerHTML = `
    <span class="card-stat likes">
      <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      <span class="card-likes-count">${aw.likes || 0}</span>
    </span>
    <span class="card-stat vistas">
      <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
      <span class="card-vistas-count">${aw.vistas || 0}</span>
    </span>
  `;

  info.append(title, author, stats);
  card.append(img, num, info);
  card.addEventListener('click', () => UI_openArtworkModal(aw));
  return card;
}

function UI_showGalleryLoading() {
  const g = document.getElementById('galleryGrid');
  g.innerHTML = `<div class="gallery-loading" id="galleryLoading"><div class="loading-ring"></div><p>Cargando colección...</p></div>`;
}

/* ── CAROUSEL ── */
let _carouselIdx = 0, _carouselItems = [];

function UI_renderCarousel(artworks) {
  const track = document.getElementById('carouselTrack');
  const dots = document.getElementById('carouselDots');
  if (!track || !dots) return;
  _carouselItems = artworks.slice(0, 8);
  track.innerHTML = ''; dots.innerHTML = '';
  if (!_carouselItems.length) { track.closest('.carousel-section').style.display = 'none'; return; }
  track.closest('.carousel-section').style.display = '';
  _carouselItems.forEach((aw, i) => {
    const item = document.createElement('div'); item.className = 'carousel-item';
    const img = document.createElement('img'); img.className = 'carousel-item-img'; img.alt = aw.nombre || ''; img.loading = 'lazy';
    if (aw.url_imagen) img.src = aw.url_imagen;
    else img.style.background = `hsl(${(i * 53) % 360},25%,10%)`;
    const ov = document.createElement('div'); ov.className = 'carousel-item-overlay';
    ov.innerHTML = `<div class="carousel-item-tag">Nueva Adquisición</div><div class="carousel-item-title">${_esc(aw.nombre || 'Sin título')}</div><div class="carousel-item-author">${_esc(aw.autor || 'Anónimo')}</div><div class="carousel-item-date">${_fmtDate(aw.fecha_creacion)}</div>`;
    item.append(img, ov);
    item.addEventListener('click', () => UI_openArtworkModal(aw));
    item.addEventListener('mousemove', e => {
      const r = item.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      item.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
    });
    item.addEventListener('mouseleave', () => { item.style.transform = ''; });
    track.appendChild(item);
    const dot = document.createElement('div');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => _carouselGoTo(i));
    dots.appendChild(dot);
  });
  _carouselIdx = 0; _updateCarousel();
}

function _carouselGoTo(idx) { _carouselIdx = Math.max(0, Math.min(idx, _carouselItems.length - 1)); _updateCarousel(); }

function _updateCarousel() {
  const track = document.getElementById('carouselTrack');
  if (!track) return;
  const item = track.children[0]; if (!item) return;
  const itemW = item.offsetWidth + 16;
  track.style.transform = `translateX(${-_carouselIdx * itemW}px)`;
  document.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === _carouselIdx));
}

/* ── STATS ── */
function UI_updateStats(artworks) {
  const total = artworks.length;
  const uniq = new Set(artworks.map(a => a.autor)).size;
  _animCount(document.getElementById('statObras'), total);
  _animCount(document.getElementById('statArtistas'), uniq);
}

function _animCount(el, target) {
  if (!el) return; let cur = 0;
  const step = Math.max(1, Math.ceil(target / 20));
  const iv = setInterval(() => { cur = Math.min(cur + step, target); el.textContent = cur; if (cur >= target) clearInterval(iv); }, 50);
}

function UI_showProcessing(show) { document.getElementById('processingOverlay')?.classList.toggle('hidden', !show); }
function UI_setProgress(p) {
  const fill = document.getElementById('processingBarFill');
  if (fill) fill.style.width = `${Math.round(p * 100)}%`;
}
function UI_setProcessingText(text) {
  const el = document.getElementById('processingText');
  if (el) el.textContent = text;
}

function UI_toast(msg, type = 'info', dur = 2800) {
  const t = document.createElement('div'); t.className = `toast ${type}`; t.textContent = msg;
  document.getElementById('toastContainer').appendChild(t);
  setTimeout(() => t.remove(), dur + 400);
}

function _fmtDate(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return iso; }
}

function _esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

/* ══════════════════════════════════════════════════════════
   6. APP CONTROLLER
   ══════════════════════════════════════════════════════════ */

const AppState = {
  effectApplied: false,
  isSaving: false,
  isProcessing: false,
  currentEffect: 'original',
};

let _effectCanvas = null;
let APP_loadMuseo = null;

(function APP_init() {
  _effectCanvas = document.createElement('canvas');
  DB.init();
  UI_init();
  CAM_init({
    mainCanvas: document.getElementById('mainCanvas'),
    canvasContainer: document.getElementById('canvasContainer'),
    canvasPlaceholder: document.getElementById('canvasPlaceholder'),
    fileInput: document.getElementById('fileInput'),
  });
  PARTICLES_init();
  _bindEvents();
  APP_loadMuseo = _loadMuseo;
  UI_hideSplash(() => console.log('[MAMBAQ] Ready'));
})();

function _bindEvents() {
  document.getElementById('btnCamera')?.addEventListener('click', CAM_openCamera);
  document.getElementById('btnUpload')?.addEventListener('click', CAM_openUpload);

  document.querySelectorAll('.artistic-card').forEach(card => {
    card.addEventListener('click', () => {
      const effect = card.dataset.effect;
      AppState.currentEffect = effect;
      document.querySelectorAll('.artistic-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  document.getElementById('btnApply')?.addEventListener('click', _applyEffect);
  document.getElementById('btnSave')?.addEventListener('click', () => {
    if (!AppState.effectApplied) { UI_toast('Primero aplica el estilo artístico', 'info'); return; }
    UI_openSaveModal(_effectCanvas);
  });
  document.getElementById('btnConfirmSave')?.addEventListener('click', _saveArtwork);
  document.getElementById('btnRefresh')?.addEventListener('click', () => { UI_showGalleryLoading(); _loadMuseo(); });
  document.getElementById('carouselPrev')?.addEventListener('click', () => _carouselGoTo(_carouselIdx - 1));
  document.getElementById('carouselNext')?.addEventListener('click', () => _carouselGoTo(_carouselIdx + 1));

  document.querySelectorAll('.filter-chip').forEach(c => {
    c.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(x => x.classList.remove('active'));
      c.classList.add('active');
    });
  });

  /* ── LIKE BUTTON ── */
  document.getElementById('modalLikeBtn')?.addEventListener('click', async () => {
    if (!_modalCurrentArtwork) return;
    const btn = document.getElementById('modalLikeBtn');
    const id = _modalCurrentArtwork.id;
    btn.style.pointerEvents = 'none';

    if (btn.classList.contains('liked')) {
      // Quitar like
      btn.classList.remove('liked');
      await DB_unregisterLike(id);
      const newLikes = await DB.addLike(id, -1);
      if (newLikes !== null) {
        document.getElementById('modalLikeCount').textContent = newLikes;
        _modalCurrentArtwork = { ..._modalCurrentArtwork, likes: newLikes };
        _refreshCardStat(id, 'likes', newLikes);
      }
    } else {
      // Dar like
      btn.classList.add('liked');
      await DB_registerLike(id);
      const newLikes = await DB.addLike(id, +1);
      if (newLikes !== null) {
        document.getElementById('modalLikeCount').textContent = newLikes;
        _modalCurrentArtwork = { ..._modalCurrentArtwork, likes: newLikes };
        _refreshCardStat(id, 'likes', newLikes);
      }
    }

    btn.style.pointerEvents = '';
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { UI_closeArtworkModal(); UI_closeSaveModal(); }
    if (document.getElementById('artworkModal') && !document.getElementById('artworkModal').classList.contains('hidden')) {
      if (e.key === '+' || e.key === '=') _setZoom(_zoomLevel + ZOOM_STEP);
      if (e.key === '-') _setZoom(_zoomLevel - ZOOM_STEP);
      if (e.key === '0') _setZoom(1);
    }
  });
}

/* ── APPLY EFFECT ── */
async function _applyEffect() {
  if (!CAM_hasImage()) { UI_toast('Carga una imagen primero', 'info'); return; }
  if (AppState.isProcessing) return;
  AppState.isProcessing = true;

  const srcCanvas = CAM_getOriginal();
  if (!srcCanvas || srcCanvas.width === 0) {
    UI_toast('No hay imagen para procesar', 'error');
    AppState.isProcessing = false;
    return;
  }

  const modeLabels = {
    original: 'Restaurando imagen original...',
    pixel: 'Aplicando pixelado...',
    bw: 'Convirtiendo a blanco y negro...',
    paint: 'Pintando con óleo...',
  };
  UI_setProcessingText(modeLabels[AppState.currentEffect] || 'Procesando...');
  UI_showProcessing(true);
  UI_setProgress(0);

  try {
    _effectCanvas.width = srcCanvas.width;
    _effectCanvas.height = srcCanvas.height;

    await FX_applyEffect(srcCanvas, _effectCanvas, AppState.currentEffect, {
      onProgress: p => UI_setProgress(p),
    });

    const mc = document.getElementById('mainCanvas');
    mc.width = _effectCanvas.width; mc.height = _effectCanvas.height;
    const ctx = mc.getContext('2d'); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(_effectCanvas, 0, 0);
    AppState.effectApplied = true;

    const successMessages = {
      original: 'Imagen original restaurada ✦',
      pixel: 'Pixel art generado ✦',
      bw: 'Blanco y negro aplicado ✦',
      paint: 'Óleo impresionista listo ✦',
    };
    UI_toast(successMessages[AppState.currentEffect] || 'Efecto aplicado', 'success');
  } catch (e) {
    console.error('[App] FX error:', e);
    UI_toast('Error al procesar la imagen', 'error');
  } finally {
    UI_showProcessing(false);
    AppState.isProcessing = false;
  }
}

/* ── SAVE ARTWORK ── */
async function _saveArtwork() {
  if (AppState.isSaving) return;

  if (!DB.isConnected()) {
    UI_toast('Configura las credenciales de Supabase en main.js para guardar obras', 'error', 5000);
    return;
  }

  AppState.isSaving = true;
  const nombre = document.getElementById('obraName')?.value.trim() || 'Sin título';
  const autor = document.getElementById('autorName')?.value.trim() || 'Artista Anónimo';
  const btn = document.getElementById('btnConfirmSave');
  if (btn) { btn.disabled = true; btn.querySelector('.btn-publish-text').textContent = 'Publicando...'; }

  try {
    const blob = await FX_canvasToBlob(_effectCanvas);
    if (!blob) throw new Error('No se pudo generar la imagen');

    const url = await DB.uploadImage(blob, `${_slug(nombre)}.png`);
    if (!url) throw new Error('No se pudo subir la imagen al storage');

    const result = await DB.saveArtwork({ nombre, autor, url_imagen: url });
    if (!result) throw new Error('No se pudo guardar en la base de datos');

    UI_toast(`"${nombre}" ingresada a la colección`, 'success');
    UI_closeSaveModal();
    document.getElementById('obraName').value = '';
    document.getElementById('autorName').value = '';
    setTimeout(() => { UI_navigateTo('museo'); UI_showGalleryLoading(); _loadMuseo(); }, 900);

  } catch (e) {
    console.error('[App] save error:', e);
    UI_toast(`Error al guardar: ${e.message}`, 'error', 4000);
  } finally {
    AppState.isSaving = false;
    if (btn) {
      btn.disabled = false;
      btn.querySelector('.btn-publish-text').textContent = 'Publicar en el Museo';
    }
  }
}

/* ── LOAD MUSEO ── */
async function _loadMuseo() {
  try {
    const artworks = await DB.getArtworks() || [];
    UI_renderCarousel(artworks);
    UI_renderGallery(artworks);
    UI_updateStats(artworks);
  } catch (e) {
    console.error('[App] load museum:', e);
    UI_renderGallery([]);
    UI_toast('Error al cargar la galería', 'error');
  }
}

function _slug(s) {
  return s.toLowerCase()
    .replace(/[áàä]/g, 'a').replace(/[éèë]/g, 'e').replace(/[íìï]/g, 'i')
    .replace(/[óòö]/g, 'o').replace(/[úùü]/g, 'u').replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 40);
}