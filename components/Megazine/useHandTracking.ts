import { useCallback, useEffect, useRef, useState } from 'react';

export type HandStatus = 'idle' | 'loading' | 'calibrating' | 'on' | 'error' | 'unsupported';

interface UseHandTrackingOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const VISION_VERSION = '0.10.1';
const VISION_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VISION_VERSION}/vision_bundle.js`;
const WASM_DIR = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VISION_VERSION}/wasm`;
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const CALIBRATE_FRAMES = 8;

export function useHandTracking({ onSwipeLeft, onSwipeRight }: UseHandTrackingOptions) {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState<HandStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [handPos, setHandPos] = useState<{ x: number; y: number } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const landmarkerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const lastVideoTimeRef = useRef(-1);
  const xBuf = useRef<number[]>([]);
  const cooldownRef = useRef(0);
  const libRef = useRef<Promise<boolean> | null>(null);
  const statusRef = useRef<HandStatus>('idle');
  const stableFramesRef = useRef(0);
  const lastEmitRef = useRef<{ x: number; y: number } | null>(null);

  const supported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function';

  const teardown = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    if (landmarkerRef.current && typeof landmarkerRef.current.close === 'function') {
      landmarkerRef.current.close();
    }
    landmarkerRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    xBuf.current = [];
    lastVideoTimeRef.current = -1;
    cooldownRef.current = 0;
    stableFramesRef.current = 0;
    lastEmitRef.current = null;
    statusRef.current = 'idle';
    setEnabled(false);
    setStatus('idle');
    setErrorMsg(null);
    setHandPos(null);
  }, []);

  useEffect(() => teardown, [teardown]);

  const loop = useCallback(() => {
    const lm = landmarkerRef.current;
    const video = videoRef.current;
    if (!lm || !video || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }
    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      const result = lm.detectForVideo(video, performance.now());
      const hand = result && result.landmarks && result.landmarks[0];
      const s = statusRef.current;

      if (hand) {
        const x = hand[9].x;
        const y = hand[9].y;

        const last = lastEmitRef.current;
        if (!last || Math.abs(last.x - x) > 0.02 || Math.abs(last.y - y) > 0.02) {
          lastEmitRef.current = { x, y };
          setHandPos({ x, y });
        }

        if (s === 'calibrating') {
          stableFramesRef.current += 1;
          if (stableFramesRef.current >= CALIBRATE_FRAMES) {
            statusRef.current = 'on';
            setStatus('on');
            cooldownRef.current = performance.now() + 400;
            stableFramesRef.current = 0;
          }
        } else if (s === 'on') {
          const buf = xBuf.current;
          const prev = buf.length ? buf[buf.length - 1] : x;
          buf.push(prev + (x - prev) * 0.6);
          if (buf.length > 8) buf.shift();
          const now = performance.now();
          if (now > cooldownRef.current && buf.length === 8) {
            const delta = buf[buf.length - 1] - buf[0];
            if (delta > 0.16) {
              onSwipeRight?.();
              cooldownRef.current = now + 1200;
              buf.length = 0;
            } else if (delta < -0.16) {
              onSwipeLeft?.();
              cooldownRef.current = now + 1200;
              buf.length = 0;
            }
          }
        }
      } else {
        stableFramesRef.current = 0;
      }
    }
    rafRef.current = requestAnimationFrame(loop);
  }, [onSwipeLeft, onSwipeRight]);

  const loadLib = useCallback(() => {
    if (!libRef.current) {
      libRef.current = new Promise<boolean>((resolve, reject) => {
        const w: any = window;
        if (w.FilesetResolver) return resolve(true);
        const script = document.createElement('script');
        script.src = VISION_URL;
        script.async = true;
        script.onload = () => (w.FilesetResolver ? resolve(true) : reject(new Error('mediapipe bundle missing exports')));
        script.onerror = () => reject(new Error('could not load mediapipe bundle'));
        document.head.appendChild(script);
      });
    }
    return libRef.current;
  }, []);

  const toggle = useCallback(async () => {
    if (enabled) {
      teardown();
      return;
    }
    try {
      setStatus('loading');
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 360 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        throw new Error('video element unavailable');
      }
      video.srcObject = stream;
      video.muted = true;
      video.setAttribute('playsinline', '');
      await video.play();
      await loadLib();
      const w: any = window;
      const fileset = await w.FilesetResolver.forVisionTasks(WASM_DIR);
      landmarkerRef.current = await w.HandLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numHands: 1,
      });
      statusRef.current = 'calibrating';
      setStatus('calibrating');
      setEnabled(true);
      rafRef.current = requestAnimationFrame(loop);
    } catch (e: any) {
      const name = e && e.name;
      if (name === 'NotAllowedError') setErrorMsg('Camera permission denied.');
      else if (name === 'NotFoundError') setErrorMsg('No camera found.');
      else if (name === 'NotReadableError') setErrorMsg('Camera in use elsewhere.');
      else setErrorMsg((e && e.message) || 'Hand tracking unavailable.');
      statusRef.current = 'error';
      setStatus('error');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) videoRef.current.srcObject = null;
    }
  }, [enabled, loop, loadLib, teardown]);

  return { enabled, status, errorMsg, supported, toggle, videoRef, handPos };
}

export default useHandTracking;
