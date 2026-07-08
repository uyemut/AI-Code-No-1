import React, { useRef, useState, useEffect } from "react";
import { AnalysisResult, CalibrationData, SwingPhase } from "../types";
import { Play, Pause, ChevronLeft, ChevronRight, Upload, HelpCircle, RefreshCw, Ruler, Swords, Link } from "lucide-react";
 
interface SwingPlayerProps {
  currentSwingName: string;
  videoUrl: string; // From file upload, if any
  analysis: AnalysisResult | null;
  calibration: CalibrationData;
  onCalibrationChange: (cal: CalibrationData) => void;
  isCalibratingRuler: boolean;
  onUpload: (file: File) => void;
  onUploadUrl?: (url: string) => void;
  isAnalyzing: boolean;
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

  // Joint adjustment settings (if hitter wants to manually tag skeletal joints)
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
        const { width, height } = entry.contentRect;
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
        // Loop when completed
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

  // Drag and Drop Uplink
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

  // SVG / Canvas Rendering of Biomechanical joints
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear and match backing store size to element size
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw grid / statcast lines
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

    // 2. If calibrating the ruler, draw the ruler line
    const x1 = rulerStart[0] * dimensions.width;
    const y1 = rulerStart[1] * dimensions.height;
    const x2 = rulerEnd[0] * dimensions.width;
    const y2 = rulerEnd[1] * dimensions.height;

    if (isCalibratingRuler) {
      ctx.save();
      // Draw line
      ctx.strokeStyle = "#10b981"; // Emerald-500
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Draw handles
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
      
      ctx.shadowBlur = 0; // reset shadow
      
      // Label Ruler distance
      const pixelDistance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      ctx.fillStyle = "#10b981";
      ctx.font = "11px var(--font-mono)";
      ctx.fillText(
        `CALIBRATION BAT RULER: ${calibration.batLength}" (${pixelDistance.toFixed(0)}px)`,
        Math.min(x1, x2) + Math.abs(x2 - x1) / 2 - 80,
        Math.min(y1, y2) - 12
      );
    }

    // 3. Draw Biomechanical Skeleton Simulation (for preloaded) or estimated overlays (for uploaded)
    // We render the skeleton dynamically based on current progress
    const progress = currentFrame / totalFrames; // 0.0 to 1.0

    // Core timing anchors
    const contactProgress = 0.55; // Swing contact hits around 55% progress
    
    // Joint calculations
    const baseHips = { x: canvas.width * 0.45, y: canvas.height * 0.70 };
    const shoulderHeight = canvas.height * 0.35;
    
    // Pelvic & Shoulder rotation angles (degrees)
    let hipAngle = 0;
    let shoulderAngle = 0;
    let batAngle = -110; // Initial angle back
    let ballX = canvas.width * 0.1; // baseball coming from left
    const ballY = canvas.height * 0.58;
    
    // Knee positions
    const frontAnkle = { x: canvas.width * 0.65, y: canvas.height * 0.90 };
    const rearAnkle = { x: canvas.width * 0.30, y: canvas.height * 0.90 };
    let frontKnee = { x: canvas.width * 0.58, y: canvas.height * 0.80 };
    let rearKnee = { x: canvas.width * 0.35, y: canvas.height * 0.82 };
    
    // Dynamic posture sequence
    if (progress <= 0.3) {
      // Stance/Load phase
      const loadFactor = progress / 0.3;
      hipAngle = -10 * loadFactor;
      shoulderAngle = -15 * loadFactor;
      batAngle = -100 - (15 * loadFactor);
      
      // Leg lift slightly
      frontKnee.y -= 15 * loadFactor;
      frontKnee.x -= 10 * loadFactor;
    } else if (progress <= contactProgress) {
      // Toe-Touch to Contact Phase (Uncoiling kinetic chain)
      const transitionFactor = (progress - 0.3) / (contactProgress - 0.3);
      hipAngle = -10 + (60 * transitionFactor); // Hips snap open
      shoulderAngle = -15 + (45 * transitionFactor); // Shoulders lag behind hips (X-Factor!)
      
      // Bat sweeps in
      batAngle = -115 + (125 * transitionFactor);
      
      // Front knee plants and braces
      frontKnee.x = canvas.width * 0.61;
      frontKnee.y = canvas.height * 0.81 - (5 * transitionFactor); // straightening
      
      // Rear knee collapses inward (pelvic drive)
      rearKnee.x = canvas.width * 0.35 + (20 * transitionFactor);
      rearKnee.y = canvas.height * 0.82 + (15 * transitionFactor);
      
      // Ball coming in
      ballX = canvas.width * 0.1 + (canvas.width * 0.45 * transitionFactor);
    } else {
      // Contact to Follow-Through Phase
      const followFactor = (progress - contactProgress) / (1 - contactProgress);
      hipAngle = 50 + (30 * followFactor);
      shoulderAngle = 30 + (55 * followFactor);
      batAngle = 10 + (130 * followFactor);
      
      // Front knee locked straight as a brace
      frontKnee.x = canvas.width * 0.61;
      frontKnee.y = canvas.height * 0.80; // straight
      
      rearKnee.x = canvas.width * 0.45 + (15 * followFactor);
      rearKnee.y = canvas.height * 0.85;
      
      // Ball knocked off screen to right field
      ballX = canvas.width * 0.56 + (canvas.width * 0.4 * followFactor);
    }

    // Calculate actual 2D coordinates for render
    // Shoulders (drawn based on shoulder angle)
    const shoulderRad = (shoulderAngle * Math.PI) / 180;
    const shoulders = {
      rear: {
        x: baseHips.x - Math.cos(shoulderRad) * 35,
        y: baseHips.y - shoulderHeight * 0.55
      },
      front: {
        x: baseHips.x + Math.cos(shoulderRad) * 35,
        y: baseHips.y - shoulderHeight * 0.55
      }
    };

    // Wrist and Bat rendering
    const batRad = (batAngle * Math.PI) / 180;
    const wrist = {
      x: shoulders.front.x + Math.cos(batRad - 0.3) * 30,
      y: shoulders.front.y + Math.sin(batRad - 0.3) * 35
    };
    const batBarrel = {
      x: wrist.x + Math.cos(batRad) * 75,
      y: wrist.y + Math.sin(batRad) * 75
    };

    // Draw baseball if before follow-through or flying
    if (progress <= 0.95) {
      ctx.save();
      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(ballX, ballY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Render skeleton stick figure
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // 1. Draw legs (Bracing/Colllapsing)
    // Front Leg (Brace)
    ctx.strokeStyle = progress >= contactProgress ? "#10b981" : "#0284c7"; // Emerald for brace, Sky-600 for load
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(baseHips.x, baseHips.y);
    ctx.lineTo(frontKnee.x, frontKnee.y);
    ctx.lineTo(frontAnkle.x, frontAnkle.y);
    ctx.stroke();

    // Rear Leg (Drive)
    ctx.strokeStyle = "#38bdf8"; // Sky-400
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(baseHips.x, baseHips.y);
    ctx.lineTo(rearKnee.x, rearKnee.y);
    ctx.lineTo(rearAnkle.x, rearAnkle.y);
    ctx.stroke();

    // 2. Draw Spine/Torso
    ctx.strokeStyle = "#f1f5f9"; // slate-100
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(baseHips.x, baseHips.y);
    ctx.lineTo((shoulders.front.x + shoulders.rear.x) / 2, (shoulders.front.y + shoulders.rear.y) / 2);
    ctx.stroke();

    // 3. Draw Shoulders Collar
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(shoulders.rear.x, shoulders.rear.y);
    ctx.lineTo(shoulders.front.x, shoulders.front.y);
    ctx.stroke();

    // 4. Draw Arms & Hands (Casting demonstration)
    // Lead arm is critical: we draw Shoulder -> Elbow -> Wrist
    // For standard, lead arm is fully straight (barred) near contact, and slightly flexed before
    let leadElbowAngle = (analysis?.biomechanics?.leadArmAngle || 164) * Math.PI / 180;
    if (progress < 0.4) leadElbowAngle = 2.4; // 137 degrees bent
    
    // Approximate lead elbow position
    const leadElbow = {
      x: shoulders.front.x + Math.cos(batRad - 0.8) * 25,
      y: shoulders.front.y + Math.sin(batRad - 0.8) * 20
    };

    ctx.strokeStyle = analysis?.biomechanics?.leadArmAngleRating === "Casting Detected" && progress >= 0.45 ? "#ef4444" : "#10b981"; // Red if casting
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(shoulders.front.x, shoulders.front.y);
    ctx.lineTo(leadElbow.x, leadElbow.y);
    ctx.lineTo(wrist.x, wrist.y);
    ctx.stroke();

    // Rear arm (Tucked elbow)
    const rearElbow = {
      x: shoulders.rear.x + Math.cos(batRad - 1.4) * 15,
      y: shoulders.rear.y + Math.sin(batRad - 1.4) * 20
    };
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(shoulders.rear.x, shoulders.rear.y);
    ctx.lineTo(rearElbow.x, rearElbow.y);
    ctx.lineTo(wrist.x, wrist.y);
    ctx.stroke();

    // 5. Head
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.arc((shoulders.front.x + shoulders.rear.x) / 2 - 2, (shoulders.front.y + shoulders.rear.y) / 2 - 22, 11, 0, Math.PI * 2);
    ctx.fill();

    // 6. Draw Bat Barrel (Attack Angle Plane)
    // We draw the bat: wrist to barrel tip.
    ctx.strokeStyle = "#f59e0b"; // Amber barrel
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(wrist.x, wrist.y);
    ctx.lineTo(batBarrel.x, batBarrel.y);
    ctx.stroke();

    // Draw glowing barrel tip
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(batBarrel.x, batBarrel.y, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // 7. Render Angle indicators on screen
    if (progress >= 0.50 && progress <= 0.65) {
      // Highlight Contact point angles
      ctx.restore();
      ctx.save();
      
      // Lead Arm angle indicator text
      ctx.fillStyle = "#10b981";
      ctx.font = "bold 11px var(--font-sans)";
      ctx.fillText(`Lead Arm: ${analysis?.biomechanics?.leadArmAngle || 164}°`, leadElbow.x + 12, leadElbow.y);

      // Front Knee bracing angle
      ctx.fillStyle = "#34d399";
      ctx.fillText(`Knee Brace: ${analysis?.biomechanics?.frontKneeBracing || 178}°`, frontKnee.x + 12, frontKnee.y);

      // Hip-Shoulder Separation
      ctx.fillStyle = "#38bdf8";
      ctx.fillText(`X-Factor torque: ${analysis?.biomechanics?.hipShoulderSeparation || 46}°`, baseHips.x - 90, baseHips.y - 40);
    }

    ctx.restore();
  }, [dimensions, currentFrame, totalFrames, rulerStart, rulerEnd, isCalibratingRuler, analysis, calibration.batLength]);

  // Handle Dragging of calibration ruler points
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
            {currentSwingName || "Select or Upload Swing"}
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
              <Swords className="w-3.5 h-3.5" /> KINEMATIC SIMULATOR
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
                Gemini 3.5 is isolating hip-shoulder launch angles, tracking knee compression ratios, and logging swing phase frame indexes...
              </p>
            </div>
          </div>
        )}

        {/* Empty State Upload Area (only if no video is loaded and they want to upload) */}
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
          {/* Main timeline controls */}
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
              title={isPlaying ? "Pause Swing" : "Play Swing"}
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
                    // Jump exactly to the phase's frame scaled to current workspace
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
                // Clear video upload, falls back to simulator
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
