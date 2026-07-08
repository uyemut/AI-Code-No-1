import React, { useRef, useState, useEffect } from "react";
import { AnalysisResult, CalibrationData, ThrowPhase } from "../types";
import { Play, Pause, ChevronLeft, ChevronRight, Upload, HelpCircle, RefreshCw, Ruler, Swords, Link } from "lucide-react";

interface SwingPlayerProps {
  currentSwingName: string;
  videoUrl: string; // From file upload, if any
  analysis: AnalysisResult;
  calibration: CalibrationData;
  onCalibrationChange: (cal: CalibrationData) => void;
  isCalibratingRuler: boolean;
  onUpload: (file: File) => void;
  onUploadUrl?: (url: string) => void;
  isAnalyzing: boolean;
  metrics: {
    exitVelocity: number;
    launchAngle: number;
    distance: number;
    attackAngle: number;
    verticalBatAngle: number;
    squaredUpRate: number;
  };
}

export default function SwingPlayer({
  currentSwingName,
  videoUrl,
  analysis,
  calibration,
  onCalibrationChange,
  isCalibratingRuler,
  onUpload,
  onUploadUrl,
  isAnalyzing,
  metrics,
}: SwingPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [dimensions, setDimensions] = useState({ width: 640, height: 400 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(40);
  const [totalFrames, setTotalFrames] = useState(120);
  const [fps, setFps] = useState(calibration.fps || 120);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [inputUrl, setInputUrl] = useState("");

  // Calibration Ruler Endpoints (Percentage of Canvas: [x, y])
  const [rulerStart, setRulerStart] = useState<[number, number]>([0.45, 0.40]);
  const [rulerEnd, setRulerEnd] = useState<[number, number]>([0.55, 0.65]);
  const [activeRulerPoint, setActiveRulerPoint] = useState<"start" | "end" | null>(null);

  // Joint adjustment settings
  const [showJointGuide, setShowJointGuide] = useState(false);

  // Keep FPS sync'd
  useEffect(() => {
    if (calibration.fps) {
      setFps(calibration.fps);
    }
  }, [calibration.fps]);

  // Handle ResizeObserver to maintain aspect ratio and responsiveness
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        const targetWidth = Math.max(width, 320);
        const targetHeight = Math.max(width * 0.625, 240); // 16:10 aspect ratio
        setDimensions({ width: targetWidth, height: targetHeight });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Update calibration based on Ruler pixel distance
  useEffect(() => {
    const x1 = rulerStart[0] * dimensions.width;
    const y1 = rulerStart[1] * dimensions.height;
    const x2 = rulerEnd[0] * dimensions.width;
    const y2 = rulerEnd[1] * dimensions.height;

    const pixelDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    const pxPerInch = pixelDistance / calibration.batLength;

    if (pxPerInch > 0 && Math.abs((calibration.pixelsPerInch || 0) - pxPerInch) > 0.05) {
      onCalibrationChange({
        ...calibration,
        pixelsPerInch: pxPerInch,
      });
    }
  }, [rulerStart, rulerEnd, dimensions, calibration.batLength]);

  // Simple interval-based video simulation if no real video is uploaded
  useEffect(() => {
    let intervalId: any;
    if (isPlaying && !videoUrl) {
      intervalId = setInterval(() => {
        setCurrentFrame((prev) => (prev >= totalFrames - 1 ? 0 : prev + 1));
      }, 1000 / 30); // 30fps rendering speed
    } else if (isPlaying && videoUrl && videoRef.current) {
      // Sync frame to real video element
      const updateFrameFromVideo = () => {
        if (videoRef.current) {
          const t = videoRef.current.currentTime;
          const duration = videoRef.current.duration || 1;
          const computedFrame = Math.min(
            Math.floor((t / duration) * totalFrames),
            totalFrames - 1
          );
          setCurrentFrame(computedFrame);
        }
        if (isPlaying) {
          requestAnimationFrame(updateFrameFromVideo);
        }
      };
      requestAnimationFrame(updateFrameFromVideo);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, videoUrl, totalFrames]);

  // Video element setup
  useEffect(() => {
    if (videoUrl && videoRef.current) {
      videoRef.current.onloadedmetadata = () => {
        if (videoRef.current) {
          const duration = videoRef.current.duration || 1.5;
          const calculatedFrames = Math.floor(duration * fps);
          setTotalFrames(calculatedFrames);
          setCurrentFrame(0);
        }
      };
    } else {
      setTotalFrames(120);
    }
  }, [videoUrl, fps]);

  // Control Functions
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (videoUrl && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        if (videoRef.current.currentTime >= videoRef.current.duration) {
          videoRef.current.currentTime = 0;
        }
        videoRef.current.play().catch(e => console.log("Video play interrupted", e));
      }
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setCurrentFrame((prev) => Math.min(prev + 1, totalFrames - 1));
    if (videoUrl && videoRef.current) {
      videoRef.current.pause();
      const targetTime = ((currentFrame + 1) / totalFrames) * videoRef.current.duration;
      videoRef.current.currentTime = Math.min(targetTime, videoRef.current.duration);
    }
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    setCurrentFrame((prev) => Math.max(prev - 1, 0));
    if (videoUrl && videoRef.current) {
      videoRef.current.pause();
      const targetTime = ((currentFrame - 1) / totalFrames) * videoRef.current.duration;
      videoRef.current.currentTime = Math.max(targetTime, 0);
    }
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const frame = parseInt(e.target.value);
    setCurrentFrame(frame);
    if (videoUrl && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      const targetTime = (frame / totalFrames) * videoRef.current.duration;
      videoRef.current.currentTime = Math.min(targetTime, videoRef.current.duration);
    }
  };

  // Drag and Drop Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  // Canvas Drawing of Throwing Biomechanical Joints
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear and size match
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw grid / coordinate scale lines
    ctx.strokeStyle = "#1e293b"; // slate-800
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 2. Calibration Ruler Line
    const x1 = rulerStart[0] * dimensions.width;
    const y1 = rulerStart[1] * dimensions.height;
    const x2 = rulerEnd[0] * dimensions.width;
    const y2 = rulerEnd[1] * dimensions.height;

    if (isCalibratingRuler) {
      ctx.save();
      ctx.strokeStyle = "#10b981"; // Emerald
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      ctx.restore();
      ctx.fillStyle = "#10b981";
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#10b981";
      
      ctx.beginPath();
      ctx.arc(x1, y1, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x2, y2, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;
      
      const pixelDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      ctx.fillStyle = "#10b981";
      ctx.font = "11px var(--font-mono)";
      ctx.fillText(
        `CALIBRATION RULER: ${calibration.batLength}" (${pixelDistance.toFixed(0)}px)`,
        Math.min(x1, x2) + Math.abs(x2 - x1) / 2 - 80,
        Math.min(y1, y2) - 12
      );
    }

    // 3. Throwing Skeleton Motion Simulator
    const progress = currentFrame / totalFrames; // 0.0 to 1.0

    // Core timing anchors
    const releaseProgress = 0.60; // Throw release occurs at 60%
    
    // Joint origins
    const baseHips = { x: canvas.width * 0.35, y: canvas.height * 0.68 };
    const shoulderHeight = canvas.height * 0.32;
    
    // Dynamic joint coordinates
    let hipAngle = -15; 
    let shoulderAngle = -25;
    
    let throwElbow = { x: 0, y: 0 };
    let throwHand = { x: 0, y: 0 };
    let gloveHand = { x: 0, y: 0 };
    
    let ballX = 0;
    let ballY = 0;
    
    const frontAnkle = { x: canvas.width * 0.54, y: canvas.height * 0.88 };
    const rearAnkle = { x: canvas.width * 0.22, y: canvas.height * 0.88 };
    let frontKnee = { x: canvas.width * 0.46, y: canvas.height * 0.78 };
    let rearKnee = { x: canvas.width * 0.27, y: canvas.height * 0.79 };

    // Posture and bone coordinate scaling based on phases
    if (progress <= 0.35) {
      // Load/Cocking Phase
      const t = progress / 0.35;
      hipAngle = -15 - 5 * t;
      shoulderAngle = -25 - 5 * t;
      
      // Front knee lifts slightly for stride momentum
      frontKnee.y -= 14 * t;
      frontKnee.x -= 8 * t;
      
      // Calculate chest shoulders
      const rad = (shoulderAngle * Math.PI) / 180;
      const shL = { x: baseHips.x - Math.cos(rad) * 18, y: baseHips.y - 70 - Math.sin(rad) * 4 };
      const shR = { x: baseHips.x + Math.cos(rad) * 18, y: baseHips.y - 70 + Math.sin(rad) * 4 };

      // Throw arm back cocked
      throwElbow = { x: shL.x - 12 - 5 * t, y: shL.y - 12 - 8 * t };
      throwHand = { x: throwElbow.x - 4 + 12 * t, y: throwElbow.y - 14 - 4 * t };

      // Glove arm forward pointer
      gloveHand = { x: shR.x + 22 + 8 * t, y: shR.y + 10 - 14 * t };
      
      ballX = throwHand.x;
      ballY = throwHand.y;
    } else if (progress <= releaseProgress) {
      // Stride / Foot Plant to Release point
      const t = (progress - 0.35) / (releaseProgress - 0.35);
      hipAngle = -20 + 65 * t; // Pelvis opens violently first
      shoulderAngle = -30 + 50 * t; // Shoulders open with lag (Torso Recoil)
      
      // Front knee plants firm
      frontKnee.x = canvas.width * 0.46;
      frontKnee.y = canvas.height * 0.78 + 3 * t; // firm bracing anchor
      
      rearKnee.x = canvas.width * 0.27 + 15 * t;
      rearKnee.y = canvas.height * 0.79 + 12 * t; // rear knee driving in

      const rad = (shoulderAngle * Math.PI) / 180;
      const shL = { x: baseHips.x - Math.cos(rad) * 18, y: baseHips.y - 70 - Math.sin(rad) * 4 };
      const shR = { x: baseHips.x + Math.cos(rad) * 18, y: baseHips.y - 70 + Math.sin(rad) * 4 };

      // Throw arm whipping over the top
      throwElbow = { x: shL.x - 17 + 38 * t, y: shL.y - 20 - 10 * t };
      throwHand = { x: throwElbow.x + 8 + 12 * t, y: throwElbow.y - 18 + 10 * t };

      // Glove side tucking into chest
      gloveHand = { x: shR.x + 30 - 24 * t, y: shR.y - 4 + 18 * t };
      
      ballX = throwHand.x;
      ballY = throwHand.y;
    } else {
      // Post-Release Follow-Through Phase
      const t = (progress - releaseProgress) / (1 - releaseProgress);
      hipAngle = 45 + 25 * t;
      shoulderAngle = 20 + 45 * t;

      frontKnee.x = canvas.width * 0.46;
      frontKnee.y = canvas.height * 0.81; // fully locked brace leg

      rearKnee.x = canvas.width * 0.42 + 10 * t;
      rearKnee.y = canvas.height * 0.82; // back hip cleared

      const rad = (shoulderAngle * Math.PI) / 180;
      const shL = { x: baseHips.x - Math.cos(rad) * 18, y: baseHips.y - 70 - Math.sin(rad) * 4 };
      const shR = { x: baseHips.x + Math.cos(rad) * 18, y: baseHips.y - 70 + Math.sin(rad) * 4 };

      // Decelerating arm sweeping down and left across thigh
      throwElbow = { x: shL.x + 21 - 14 * t, y: shL.y - 30 + 38 * t };
      throwHand = { x: throwElbow.x + 20 - 32 * t, y: throwElbow.y - 8 + 32 * t };

      gloveHand = { x: shR.x + 6, y: shR.y + 14 };

      // Ball flying with pure physical ballistic path
      // Interpolate projection values from real Statcast metrics
      const launchAngleRad = (metrics.launchAngle * Math.PI) / 180;
      const velocityMPH = metrics.exitVelocity;
      const velocityScale = velocityMPH * 4.5; 
      const flightTime = progress - releaseProgress;
      
      const releaseX = baseHips.x + 38;
      const releaseY = baseHips.y - 95;
      
      ballX = releaseX + Math.cos(launchAngleRad) * velocityScale * flightTime;
      ballY = releaseY - Math.sin(launchAngleRad) * velocityScale * flightTime + 160 * Math.pow(flightTime, 2); // Gravity pull curve
    }

    // 4. Render skeleton lines
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Front brace leg (grows emerald if braced correctly at plant)
    ctx.strokeStyle = progress >= releaseProgress - 0.1 ? "#10b981" : "#0284c7";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(baseHips.x, baseHips.y);
    ctx.lineTo(frontKnee.x, frontKnee.y);
    ctx.lineTo(frontAnkle.x, frontAnkle.y);
    ctx.stroke();

    // Rear drive leg
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(baseHips.x, baseHips.y);
    ctx.lineTo(rearKnee.x, rearKnee.y);
    ctx.lineTo(rearAnkle.x, rearAnkle.y);
    ctx.stroke();

    // Torso spine
    ctx.strokeStyle = "#f1f5f9";
    ctx.lineWidth = 6;
    ctx.beginPath();
    const radForSpine = (shoulderAngle * Math.PI) / 180;
    const shCenter = { x: baseHips.x, y: baseHips.y - 70 };
    ctx.moveTo(baseHips.x, baseHips.y);
    ctx.lineTo(shCenter.x, shCenter.y);
    ctx.stroke();

    // Shoulder collar
    const finalRad = (shoulderAngle * Math.PI) / 180;
    const shL = { x: baseHips.x - Math.cos(finalRad) * 18, y: baseHips.y - 70 - Math.sin(finalRad) * 4 };
    const shR = { x: baseHips.x + Math.cos(finalRad) * 18, y: baseHips.y - 70 + Math.sin(finalRad) * 4 };
    
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(shL.x, shL.y);
    ctx.lineTo(shR.x, shR.y);
    ctx.stroke();

    // Throwing Arm (Shoulder -> Elbow -> Hand)
    const isFlawedDrag = analysis.biomechanics.leadArmAngleRating === "Elbow Drag Detected" && progress >= 0.45;
    ctx.strokeStyle = isFlawedDrag ? "#ef4444" : "#10b981"; // Red if elbow is dragging
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(shL.x, shL.y);
    ctx.lineTo(throwElbow.x, throwElbow.y);
    ctx.lineTo(throwHand.x, throwHand.y);
    ctx.stroke();

    // Glove Arm (Shoulder -> Hand)
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(shR.x, shR.y);
    ctx.lineTo(gloveHand.x, gloveHand.y);
    ctx.stroke();

    // Head
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc(shCenter.x, shCenter.y - 20, 11, 0, Math.PI * 2);
    ctx.fill();

    // Render Baseball
    // Only display ball if it remains in boundaries
    if (ballX < dimensions.width + 15 && ballY < dimensions.height + 15) {
      ctx.restore();
      ctx.save();
      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ballX, ballY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.save();
    }

    // 5. Draw overlay joint angle labels
    if (progress >= 0.50 && progress <= 0.68) {
      ctx.restore();
      ctx.save();
      
      // Elbow angle text
      ctx.fillStyle = isFlawedDrag ? "#ef4444" : "#10b981";
      ctx.font = "bold 11px var(--font-sans)";
      ctx.fillText(`Elbow Flexion: ${analysis.biomechanics.leadArmAngle}°`, throwElbow.x - 30, throwElbow.y - 12);

      // Knee bracing angle
      ctx.fillStyle = "#34d399";
      ctx.fillText(`Knee Brace: ${analysis.biomechanics.frontKneeBracing}°`, frontKnee.x + 12, frontKnee.y);

      // Torque separation
      ctx.fillStyle = "#38bdf8";
      ctx.fillText(`Shoulder-Hip Separation: ${analysis.biomechanics.hipShoulderSeparation}°`, baseHips.x - 90, baseHips.y - 45);
    }

    ctx.restore();
  }, [dimensions, currentFrame, totalFrames, rulerStart, rulerEnd, isCalibratingRuler, analysis, calibration.batLength]);

  // Mouse up and moving of ruler nodes
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCalibratingRuler) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const px1 = rulerStart[0] * dimensions.width;
    const py1 = rulerStart[1] * dimensions.height;
    const px2 = rulerEnd[0] * dimensions.width;
    const py2 = rulerEnd[1] * dimensions.height;

    const dist1 = Math.sqrt(Math.pow(x - px1, 2) + Math.pow(y - py1, 2));
    const dist2 = Math.sqrt(Math.pow(x - px2, 2) + Math.pow(y - py2, 2));

    if (dist1 < 18) {
      setActiveRulerPoint("start");
    } else if (dist2 < 18) {
      setActiveRulerPoint("end");
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeRulerPoint || !isCalibratingRuler) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, dimensions.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, dimensions.height));

    const pctX = x / dimensions.width;
    const pctY = y / dimensions.height;

    if (activeRulerPoint === "start") {
      setRulerStart([pctX, pctY]);
    } else {
      setRulerEnd([pctX, pctY]);
    }
  };

  const handleCanvasMouseUp = () => {
    setActiveRulerPoint(null);
  };

  return (
    <div id="swing-player-workspace" className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-full">
      {/* Header bar */}
      <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-sm font-semibold text-slate-200 tracking-tight font-display">
            {currentSwingName || "Select or Upload Throw"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {videoUrl && (
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
              LIVE HIGH-SPEED FEED
            </span>
          )}
          {!videoUrl && (
            <span className="text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Swords className="w-3.5 h-3.5" /> ARM ACTION SIMULATOR
            </span>
          )}
        </div>
      </div>

      {/* Main Screen (Canvas or Video overlay) */}
      <div
        ref={containerRef}
        id="video-player-canvas-container"
        className="relative bg-slate-950 flex-1 flex items-center justify-center min-h-[300px] select-none"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Real Video element (if loaded) */}
        {videoUrl && (
          <video
            ref={videoRef}
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-contain opacity-50"
            loop
            muted
            playsInline
          />
        )}

        {/* Biomechanical Overlay Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          className="absolute inset-0 w-full h-full z-10 cursor-crosshair"
        />

        {/* Loading overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-slate-950/85 z-20 flex flex-col items-center justify-center gap-4 text-center px-6">
            <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-slate-200 text-lg">
                Running Temporal Reasoner
              </h3>
              <p className="text-slate-400 text-xs max-w-sm">
                Gemini 3.5 is isolating shoulder-elbow angular whips, tracking front knee brace resistance, and logging release plane frame coordinates...
              </p>
            </div>
          </div>
        )}

        {/* Empty State Upload Area */}
        {!videoUrl && !isAnalyzing && (
          <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2 max-w-xs">
            <div className="flex gap-2">
              <label className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500 cursor-pointer p-2.5 rounded-lg flex items-center gap-2 text-xs font-medium text-slate-300 shadow-md transition-all">
                <Upload className="w-4 h-4 text-emerald-500" />
                Upload File
                <input type="file" accept="video/*" onChange={handleFileChange} className="hidden" />
              </label>
              
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className={`border cursor-pointer p-2.5 rounded-lg flex items-center gap-2 text-xs font-medium shadow-md transition-all ${
                  showUrlInput 
                    ? "bg-emerald-500 text-slate-950 border-emerald-400" 
                    : "bg-slate-900/90 border-slate-800 hover:border-emerald-500 text-slate-300"
                }`}
              >
                <Link className="w-4 h-4 animate-pulse" />
                Enter URL
              </button>
            </div>

            {showUrlInput && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (inputUrl.trim() && onUploadUrl) {
                    onUploadUrl(inputUrl.trim());
                    setInputUrl("");
                    setShowUrlInput(false);
                  }
                }}
                className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg shadow-xl flex gap-1.5 w-64 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <input
                  type="url"
                  placeholder="Paste video MP4 URL..."
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!inputUrl.trim()}
                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-black text-[10px] uppercase rounded transition-colors"
                >
                  Go
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Playback Controls & Frame Scrubber */}
      <div className="bg-slate-950 border-t border-slate-850 p-4 space-y-4">
        {/* Scrubber slider and frame tags */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-slate-500">FRAME TIME: {(currentFrame / fps).toFixed(3)}s</span>
            <span className="text-emerald-400 font-bold bg-emerald-900/10 px-2 py-0.5 border border-emerald-500/20 rounded">
              FRAME {currentFrame + 1} / {totalFrames}
            </span>
          </div>
          <input
            id="frame-scrubber-slider"
            type="range"
            min="0"
            max={totalFrames - 1}
            value={currentFrame}
            onChange={handleScrubberChange}
            className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
          />
        </div>

        {/* Control bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              id="btn-step-back"
              type="button"
              onClick={handleStepBackward}
              className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-emerald-400 text-slate-400 rounded-lg transition-colors"
              title="Previous Frame"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              id="btn-play-pause"
              type="button"
              onClick={handlePlayPause}
              className="p-3 bg-emerald-500 text-slate-950 font-bold rounded-full hover:scale-105 hover:bg-emerald-400 active:scale-95 shadow-lg shadow-emerald-500/20 transition-all"
              title={isPlaying ? "Pause Video" : "Play Video"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button
              id="btn-step-forward"
              type="button"
              onClick={handleStepForward}
              className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-emerald-400 text-slate-400 rounded-lg transition-colors"
              title="Next Frame"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Temporal phase anchors indicator */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/55 p-1 rounded-lg border border-slate-850">
            {analysis?.phases?.map((p) => {
              const isActive = Math.abs((p.frame / 120) * totalFrames - currentFrame) < 4;
              return (
                <button
                  key={p.phase}
                  id={`phase-tag-${p.phase.replace("/", "-")}`}
                  type="button"
                  onClick={() => {
                    const targetFrame = Math.round((p.frame / 120) * totalFrames);
                    setCurrentFrame(targetFrame);
                    if (videoUrl && videoRef.current) {
                      videoRef.current.currentTime = (targetFrame / totalFrames) * videoRef.current.duration;
                    }
                  }}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10 font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {p.phase}
                </button>
              );
            })}
          </div>

          {/* Quick upload fallback option */}
          {videoUrl && (
            <button
              id="clear-video-btn"
              type="button"
              onClick={() => {
                setIsPlaying(false);
                onUpload(null as any);
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium hover:underline flex items-center gap-1"
            >
              Reset to Simulator
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
