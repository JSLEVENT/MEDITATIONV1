'use client';

import { useEffect, useRef, useState } from 'react';
import PrimaryButton from './PrimaryButton';
import { trackEvent } from '../lib/analytics';

export default function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const onEnded = () => setPlaying(false);
    const onEndedTrack = () => trackEvent('session_completed');

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('ended', onEndedTrack);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('ended', onEndedTrack);
    };
  }, [src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      void audio.play();
      setPlaying(true);
    }
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value;
    setProgress(value);
  };

  const handleVolume = (value: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = value;
    setVolume(value);
  };

  return (
    <div className="border border-slate-200 rounded-lg p-4 bg-white">
      <audio ref={audioRef} src={src} preload="auto" />
      <div className="flex items-center gap-4">
        <PrimaryButton type="button" onClick={togglePlay}>
          {playing ? 'Pause' : 'Play'}
        </PrimaryButton>
        <div className="flex-1">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={progress}
            onChange={(event) => handleSeek(Number(event.target.value))}
            className="w-full"
          />
          <div className="text-xs text-slate-500 mt-1">
            {Math.floor(progress)}s / {Math.floor(duration)}s
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(event) => handleVolume(Number(event.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
