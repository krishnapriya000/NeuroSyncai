import React, { useState, useEffect, useRef } from "react";
import * as faceapi from "@vladmandic/face-api";
import {
  FiCamera,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
  FiShield,
  FiUserCheck,
  FiUsers
} from "react-icons/fi";

const emotionEmojiMap = {
  happy: "😊 Happy",
  sad: "😢 Sad",
  angry: "😠 Angry",
  fearful: "😨 Fearful",
  disgusted: "🤢 Disgusted",
  surprised: "😲 Surprised",
  neutral: "😐 Neutral"
};

const mapEmotionToStudentMood = (emotion) => {
  switch ((emotion || "").toLowerCase()) {
    case "happy": return "Happy";
    case "sad": return "Sad";
    case "angry": return "Angry";
    case "neutral": return "Neutral";
    case "surprised": return "Very Happy";
    case "fearful": return "Anxious";
    case "disgusted": return "Stressed";
    default: return "Neutral";
  }
};

function FacialEmotionAnalysisModal({ isOpen, onClose, onUseMood, selectedMood, role = "working_professional" }) {
  // Modal Stages: 'privacy' | 'loading' | 'analyzing' | 'result' | 'error'
  const [stage, setStage] = useState("privacy");
  const [loadingText, setLoadingText] = useState("Preparing AI emotion analysis...");
  const [errorMessage, setErrorMessage] = useState("");

  const [detectionStatus, setDetectionStatus] = useState("Initializing...");
  const [faceCountText, setFaceCountText] = useState("");

  // Detection Results
  const [stableEmotion, setStableEmotion] = useState(null);
  const [confidence, setConfidence] = useState(0);

  // References
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const modelsLoadedRef = useRef(false);
  const samplesRef = useRef([]);

  useEffect(() => {
    if (!isOpen) {
      stopCameraAndLoops();
      setStage("privacy");
      setErrorMessage("");
      setStableEmotion(null);
      setConfidence(0);
      samplesRef.current = [];
    }
    return () => {
      stopCameraAndLoops();
    };
  }, [isOpen]);

  const stopCameraAndLoops = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Load Models (Check local /models/ first, then fallback CDN)
  const loadFaceApiModels = async () => {
    if (modelsLoadedRef.current) return true;

    try {
      setLoadingText("Loading facial expression model...");
      // Try local public models directory first
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      ]);
      modelsLoadedRef.current = true;
      return true;
    } catch (localErr) {
      console.warn("Local model load failed, trying CDN fallback...", localErr);
      try {
        const cdnUrl = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(cdnUrl),
          faceapi.nets.faceExpressionNet.loadFromUri(cdnUrl),
        ]);
        modelsLoadedRef.current = true;
        return true;
      } catch (cdnErr) {
        console.error("CDN Model load failed:", cdnErr);
        return false;
      }
    }
  };

  // Start Analysis Workflow
  const handleStartPermission = async () => {
    setStage("loading");
    setErrorMessage("");

    const loaded = await loadFaceApiModels();
    if (!loaded) {
      setErrorMessage("Unable to load the facial emotion model. Please check your internet connection and try again.");
      setStage("error");
      return;
    }

    setLoadingText("Camera ready. Accessing webcam...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        },
        audio: false
      });

      streamRef.current = stream;
      setStage("analyzing");

      // Give React time to render video element
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            startDetectionLoop();
          };
        }
      }, 100);

    } catch (err) {
      console.error("Camera access error:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMessage("Camera permission was denied. Please allow camera access in your browser to use facial emotion analysis.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setErrorMessage("No camera was detected on this device.");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setErrorMessage("Your camera is currently being used by another application.");
      } else {
        setErrorMessage("Unable to access camera: " + err.message);
      }
      setStage("error");
    }
  };

  // Real-time Detection Loop
  const startDetectionLoop = () => {
    samplesRef.current = [];
    setDetectionStatus("Analyzing facial expression...");

    const detect = async () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        animationFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      try {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
          .withFaceExpressions();

        // Draw Canvas Overlay
        if (canvasRef.current && videoRef.current) {
          const displaySize = {
            width: videoRef.current.videoWidth || 640,
            height: videoRef.current.videoHeight || 480,
          };
          faceapi.matchDimensions(canvasRef.current, displaySize);
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          const ctx = canvasRef.current.getContext("2d");
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        }

        if (detections.length === 0) {
          setFaceCountText("No face detected. Please position your face clearly in front of the camera.");
        } else if (detections.length > 1) {
          setFaceCountText("Multiple faces detected. Please make sure only one person is visible.");
        } else {
          setFaceCountText("");
          const expressions = detections[0].expressions;

          // Find dominant emotion for current frame
          let topEmotion = "neutral";
          let maxProb = 0;
          Object.entries(expressions).forEach(([emo, prob]) => {
            if (prob > maxProb) {
              maxProb = prob;
              topEmotion = emo;
            }
          });

          samplesRef.current.push({ emotion: topEmotion, confidence: maxProb });

          // After collecting 20 stable samples (~2 seconds)
          if (samplesRef.current.length >= 20) {
            evaluateStableResult();
            return; // Stop detection loop
          }
        }
      } catch (err) {
        console.error("Frame detection error:", err);
      }

      animationFrameRef.current = requestAnimationFrame(detect);
    };

    animationFrameRef.current = requestAnimationFrame(detect);
  };

  // Compute most frequent highest-confidence emotion across collected frames
  const evaluateStableResult = () => {
    const samples = samplesRef.current;
    if (samples.length === 0) return;

    const counts = {};
    const sumConf = {};

    samples.forEach((s) => {
      counts[s.emotion] = (counts[s.emotion] || 0) + 1;
      sumConf[s.emotion] = (sumConf[s.emotion] || 0) + s.confidence;
    });

    let bestEmotion = "neutral";
    let maxCount = -1;

    Object.keys(counts).forEach((emo) => {
      if (counts[emo] > maxCount) {
        maxCount = counts[emo];
        bestEmotion = emo;
      }
    });

    const avgConf = Math.round((sumConf[bestEmotion] / maxCount) * 100);

    stopCameraAndLoops();
    setStableEmotion(bestEmotion);
    setConfidence(avgConf);
    setStage("result");
  };

  const handleRetry = () => {
    stopCameraAndLoops();
    handleStartPermission();
  };

  const handleClose = () => {
    stopCameraAndLoops();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(5, 8, 22, 0.85)", backdropFilter: "blur(10px)", zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content text-white rounded-4 shadow-lg border border-secondary border-opacity-25 overflow-hidden"
          style={{ background: "#0F172A" }}
        >
          {/* MODAL HEADER */}
          <div className="modal-header border-bottom border-secondary border-opacity-25 px-4 py-3">
            <h5 className="modal-title fw-bold text-white fs-6 d-flex align-items-center gap-2">
              <FiCamera className="text-primary" /> AI Facial Emotion Analysis
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              aria-label="Close"
            />
          </div>

          {/* MODAL BODY */}
          <div className="modal-body p-4 text-center">
            {/* STAGE 1: PRIVACY CONSENT STEP */}
            {stage === "privacy" && (
              <div className="py-3 px-2">
                <div className="p-3.5 rounded-circle bg-primary bg-opacity-25 text-primary d-inline-flex align-items-center justify-content-center mb-3 fs-2">
                  <FiShield />
                </div>
                <h4 className="fw-bold text-white mb-2 fs-5">Privacy & Camera Access</h4>
                <p className="text-gray-300 mb-4 mx-auto" style={{ maxWidth: "560px", fontSize: "0.92rem", color: "#CBD5E1", lineHeight: "1.5" }}>
                  Your camera is used only for real-time facial expression analysis. Camera frames are processed locally inside your browser and are not uploaded or recorded.
                </p>

                <div className="d-flex align-items-center justify-content-center gap-3 pt-2">
                  <button
                    type="button"
                    className="btn btn-outline-light rounded-pill px-4 py-2 fw-medium"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary rounded-pill px-4 py-2 fw-semibold ns-btn-primary d-flex align-items-center gap-1.5"
                    onClick={handleStartPermission}
                  >
                    <FiCamera /> Allow Camera & Start
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 2: LOADING STAGE */}
            {stage === "loading" && (
              <div className="py-5">
                <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h5 className="fw-bold text-white mb-2 fs-5">{loadingText}</h5>
                <p className="text-muted extra-small" style={{ fontSize: "0.82rem" }}>Initializing neural network weights...</p>
              </div>
            )}

            {/* STAGE 3: LIVE ANALYSIS STAGE */}
            {stage === "analyzing" && (
              <div>
                <p className="text-gray-300 mb-3" style={{ fontSize: "0.92rem", color: "#CBD5E1" }}>
                  Look at the camera naturally while NeuroSync analyzes your facial expression.
                </p>

                {/* Face Count / Warning Banner */}
                {faceCountText && (
                  <div className="alert bg-warning bg-opacity-20 text-warning border border-warning border-opacity-30 rounded-3 p-2.5 mb-3 d-flex align-items-center justify-content-center gap-2" style={{ fontSize: "0.85rem" }}>
                    <FiAlertCircle /> <span>{faceCountText}</span>
                  </div>
                )}

                {/* Webcam & Overlay Canvas Box */}
                <div
                  className="position-relative mx-auto rounded-4 overflow-hidden bg-black border border-secondary border-opacity-30 shadow-inner"
                  style={{ maxWidth: "560px", aspectRatio: "4/3" }}
                >
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-100 h-100 object-fit-cover"
                    style={{ transform: "scaleX(-1)" }} // Mirror camera
                  />
                  <canvas
                    ref={canvasRef}
                    className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none"
                    style={{ transform: "scaleX(-1)" }}
                  />

                  {/* Status Overlay Pill */}
                  <div className="position-absolute bottom-3 start-50 translate-middle-x bg-dark bg-opacity-80 border border-secondary border-opacity-30 px-3 py-1.5 rounded-pill d-flex align-items-center gap-2">
                    <span className="spinner-grow spinner-grow-sm text-primary" role="status" />
                    <span className="fw-medium text-white extra-small" style={{ fontSize: "0.8rem" }}>
                      {detectionStatus}
                    </span>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-center gap-3 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-danger rounded-pill px-4 py-2 fw-medium"
                    onClick={handleClose}
                  >
                    Stop Analysis
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-light rounded-pill px-4 py-2 fw-medium d-flex align-items-center gap-1.5"
                    onClick={handleRetry}
                  >
                    <FiRefreshCw /> Retry
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 4: RESULT SCREEN */}
            {stage === "result" && (
              <div className="py-3 px-2">
                <div className="p-3.5 rounded-circle bg-success bg-opacity-25 text-success d-inline-flex align-items-center justify-content-center mb-3 fs-2">
                  <FiCheckCircle />
                </div>
                <p className="text-muted extra-small mb-1" style={{ fontSize: "0.85rem", color: "#CBD5E1" }}>
                  AI Estimated Emotion
                </p>
                <h2 className="fw-bold text-white mb-2 fs-3">
                  {emotionEmojiMap[stableEmotion] || stableEmotion}
                </h2>
                <div className="d-inline-block bg-primary bg-opacity-25 border border-primary border-opacity-30 text-primary fw-bold px-3 py-1 rounded-pill mb-3" style={{ fontSize: "0.88rem" }}>
                  Confidence: {confidence}%
                </div>

                {/* AI vs Self-Reported Mood Comparison Box (if student selected a manual mood) */}
                {selectedMood && (
                  <div className="p-3 rounded-4 bg-dark bg-opacity-60 border border-secondary border-opacity-30 mb-3 mx-auto text-start" style={{ maxWidth: "560px" }}>
                    <h6 className="text-white fw-bold fs-6 mb-2">AI vs Self-Reported Mood</h6>
                    <div className="d-flex align-items-center justify-content-between mb-2 small">
                      <span className="text-muted">Self-Reported: <strong className="text-white">{selectedMood}</strong></span>
                      <span className="text-muted">AI Estimated: <strong className="text-purple-300" style={{ color: "#c084fc" }}>{mapEmotionToStudentMood(stableEmotion)}</strong></span>
                    </div>
                    <p className="mb-0 text-white-50 extra-small" style={{ fontSize: "0.8rem", lineHeight: "1.4" }}>
                      {selectedMood.toLowerCase() === mapEmotionToStudentMood(stableEmotion).toLowerCase() ||
                      (selectedMood.toLowerCase().includes("happy") && stableEmotion === "happy")
                        ? "Your self-reported mood and facial-expression estimate show a similar pattern."
                        : "Your self-reported mood and facial-expression estimate are different. This is only an AI estimate and may not reflect how you actually feel."}
                    </p>
                  </div>
                )}

                <div className="p-3 rounded-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25 mb-4 mx-auto text-start" style={{ maxWidth: "560px" }}>
                  <p className="mb-0 text-muted extra-small" style={{ fontSize: "0.78rem", lineHeight: "1.45" }}>
                    💡 <em>Facial expression analysis provides an estimate and may not represent your actual emotional state. Your camera is used only for real-time analysis and frames are not stored.</em>
                  </p>
                </div>

                <div className="d-flex align-items-center justify-content-center gap-3">
                  {onUseMood && (
                    <button
                      type="button"
                      className="btn btn-success rounded-pill px-4 py-2 fw-semibold text-white d-flex align-items-center gap-1.5"
                      style={{ background: "linear-gradient(135deg, #10B981, #059669)", border: "none" }}
                      onClick={() => {
                        onUseMood(mapEmotionToStudentMood(stableEmotion));
                        handleClose();
                      }}
                    >
                      <FiCheckCircle /> Use This Mood
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-outline-light rounded-pill px-4 py-2 fw-medium d-flex align-items-center gap-1.5"
                    onClick={handleRetry}
                  >
                    <FiRefreshCw /> Analyze Again
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary text-white-50 rounded-pill px-4 py-2 fw-medium"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 5: ERROR HANDLER SCREEN */}
            {stage === "error" && (
              <div className="py-4 px-2">
                <div className="p-3.5 rounded-circle bg-danger bg-opacity-25 text-danger d-inline-flex align-items-center justify-content-center mb-3 fs-2">
                  <FiAlertCircle />
                </div>
                <h4 className="fw-bold text-white mb-2 fs-5">Analysis Error</h4>
                <p className="text-danger-300 mb-4 mx-auto" style={{ maxWidth: "540px", fontSize: "0.92rem", color: "#FCA5A5", lineHeight: "1.5" }}>
                  {errorMessage}
                </p>

                <div className="d-flex align-items-center justify-content-center gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-light rounded-pill px-4 py-2 fw-medium"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary rounded-pill px-4 py-2 fw-semibold ns-btn-primary d-flex align-items-center gap-1.5"
                    onClick={handleStartPermission}
                  >
                    <FiRefreshCw /> Retry
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacialEmotionAnalysisModal;
