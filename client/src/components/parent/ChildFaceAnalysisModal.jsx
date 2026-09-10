import React, { useState, useEffect, useRef } from "react";
import * as faceapi from "@vladmandic/face-api";
import {
  FiCamera,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
  FiShield,
  FiUser,
  FiClock,
  FiSave
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

function ChildFaceAnalysisModal({ isOpen, onClose, child, onAnalysisComplete }) {
  // Modal Stages: 'privacy' | 'loading' | 'analyzing' | 'result' | 'error'
  const [stage, setStage] = useState("privacy");
  const [loadingText, setLoadingText] = useState("Starting camera...");
  const [errorMessage, setErrorMessage] = useState("");

  const [detectionStatus, setDetectionStatus] = useState("Initializing...");
  const [faceCountText, setFaceCountText] = useState("");

  // Detection Results
  const [stableEmotion, setStableEmotion] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [analysisDate, setAnalysisDate] = useState("");

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

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
      setAnalysisDate("");
      setSaveSuccess(false);
      setSaveError("");
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

    setLoadingText("Starting camera...");
    const loaded = await loadFaceApiModels();
    if (!loaded) {
      setErrorMessage("Unable to load the facial emotion model. Please check your internet connection and try again.");
      setStage("error");
      return;
    }

    setLoadingText("Accessing camera...");
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
        setErrorMessage("Camera permission was denied. Please allow camera access in your browser settings to perform face analysis.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setErrorMessage("No camera device was detected on your system.");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setErrorMessage("Your camera is currently in use by another application.");
      } else {
        setErrorMessage("Unable to access camera: " + err.message);
      }
      setStage("error");
    }
  };

  // Real-time Detection Loop
  const startDetectionLoop = () => {
    samplesRef.current = [];
    setDetectionStatus("Analyzing...");

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
          setFaceCountText("No face detected. Please ensure your child is positioned clearly in front of the camera.");
        } else if (detections.length > 1) {
          setFaceCountText("Multiple faces detected. Please make sure only your child is visible in the camera frame.");
        } else {
          setFaceCountText("");
          const expressions = detections[0].expressions;

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
            return;
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
    const nowStr = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });

    stopCameraAndLoops();
    setStableEmotion(bestEmotion);
    setConfidence(avgConf);
    setAnalysisDate(nowStr);
    setStage("result");

    // Automatically save to backend
    saveAnalysisToBackend(bestEmotion, avgConf);
  };

  const saveAnalysisToBackend = async (emotionVal, confVal) => {
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    const token = localStorage.getItem("neurosync_token");
    if (!token || !child) {
      setSaveError("Authentication or child context missing.");
      setIsSaving(false);
      return;
    }

    const targetChildId = child.parentChildId || child.childId || child.id;

    try {
      const res = await fetch(`http://localhost:5000/api/parent/children/${targetChildId}/face-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          expression: emotionVal,
          confidence: confVal
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccess(true);
        if (onAnalysisComplete) {
          onAnalysisComplete(data.analysis);
        }
      } else {
        setSaveError(data.message || "Failed to save analysis result to database.");
      }
    } catch (err) {
      console.error("Save child face analysis error:", err);
      setSaveError("Network or server error saving face analysis.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetry = () => {
    stopCameraAndLoops();
    handleStartPermission();
  };

  const handleClose = () => {
    stopCameraAndLoops();
    onClose();
  };

  if (!isOpen || !child) return null;

  const childDisplayName = child.name || "Child";
  const childDisplayAge = child.age !== undefined && child.age !== null ? child.age : "N/A";

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(5, 8, 22, 0.88)", backdropFilter: "blur(10px)", zIndex: 1065 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content text-white rounded-4 shadow-lg border border-secondary border-opacity-25 overflow-hidden"
          style={{ background: "#0F172A" }}
        >
          {/* MODAL HEADER */}
          <div className="modal-header border-bottom border-secondary border-opacity-25 px-4 py-3 bg-dark bg-opacity-40">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle bg-primary bg-opacity-25 text-primary d-flex align-items-center justify-content-center fw-bold"
                style={{ width: "42px", height: "42px", fontSize: "1.1rem" }}
              >
                <FiCamera />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-white fs-6 mb-0 d-flex align-items-center gap-2">
                  Face Analysis: <span className="text-info">{childDisplayName}</span>
                </h5>
                <span className="text-secondary extra-small" style={{ fontSize: "0.78rem" }}>
                  Age: {childDisplayAge} • {child.relationship || "Child"}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              aria-label="Close"
            />
          </div>

          {/* MODAL BODY */}
          <div className="modal-body p-4 text-center">
            {/* STAGE 1: PRIVACY CONSENT & CHILD SELECTION */}
            {stage === "privacy" && (
              <div className="py-3 px-2">
                <div className="p-3.5 rounded-circle bg-primary bg-opacity-25 text-primary d-inline-flex align-items-center justify-content-center mb-3 fs-2">
                  <FiShield />
                </div>
                <h4 className="fw-bold text-white mb-2 fs-5">Camera Permission & Privacy</h4>
                <p className="text-gray-300 mb-3 mx-auto" style={{ maxWidth: "560px", fontSize: "0.92rem", color: "#CBD5E1", lineHeight: "1.5" }}>
                  You are about to start a real-time facial expression analysis for <strong className="text-white">{childDisplayName}</strong> (Age {childDisplayAge}).
                </p>
                <p className="text-muted mb-4 mx-auto extra-small" style={{ maxWidth: "520px", fontSize: "0.82rem", color: "#94A3B8" }}>
                  🔒 Camera frames are processed locally inside your browser and video stream is never uploaded or saved.
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
                    className="btn btn-primary rounded-pill px-4 py-2 fw-semibold ns-btn-primary d-flex align-items-center gap-2 shadow-sm"
                    onClick={handleStartPermission}
                  >
                    <FiCamera /> Start Analysis
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
                <p className="text-muted extra-small" style={{ fontSize: "0.82rem" }}>Initializing neural network weights & webcam...</p>
              </div>
            )}

            {/* STAGE 3: LIVE ANALYSIS STAGE */}
            {stage === "analyzing" && (
              <div>
                <p className="text-gray-300 mb-3" style={{ fontSize: "0.92rem", color: "#CBD5E1" }}>
                  Please position <strong className="text-white">{childDisplayName}</strong> naturally in front of the camera.
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
                    style={{ transform: "scaleX(-1)" }}
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

                <h4 className="fw-bold text-white mb-3 fs-5">Analysis Completed</h4>

                {/* RESULT CARD */}
                <div
                  className="p-4 rounded-4 bg-dark bg-opacity-60 border border-secondary border-opacity-30 mb-4 mx-auto text-start shadow-sm"
                  style={{ maxWidth: "520px" }}
                >
                  <div className="row g-3">
                    <div className="col-6">
                      <span className="text-secondary extra-small d-block">Child:</span>
                      <strong className="text-white fs-6">{childDisplayName}</strong>
                    </div>
                    <div className="col-6">
                      <span className="text-secondary extra-small d-block">Age:</span>
                      <strong className="text-white fs-6">{childDisplayAge}</strong>
                    </div>

                    <div className="col-6">
                      <span className="text-secondary extra-small d-block">Detected Expression:</span>
                      <strong className="text-info fs-5 mt-1 d-block">
                        {emotionEmojiMap[stableEmotion] || stableEmotion}
                      </strong>
                    </div>

                    <div className="col-6">
                      <span className="text-secondary extra-small d-block">Confidence:</span>
                      <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-30 px-3 py-1.5 fs-6 fw-bold mt-1 d-inline-block">
                        {confidence}%
                      </span>
                    </div>

                    <div className="col-12 border-top border-secondary border-opacity-25 pt-2">
                      <span className="text-secondary extra-small d-flex align-items-center gap-1">
                        <FiClock /> Analysis Time: <strong className="text-white">{analysisDate}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* MANDATORY DISCLAIMER NOTE */}
                <div
                  className="p-3 rounded-4 bg-indigo-950 bg-opacity-40 border border-indigo-500 border-opacity-30 mb-4 mx-auto text-center"
                  style={{ maxWidth: "520px" }}
                >
                  <p className="mb-0 text-indigo-200 extra-small" style={{ fontSize: "0.82rem", lineHeight: "1.45" }}>
                    💡 <strong>Note:</strong> Facial expression analysis is an observational indicator and does not provide a medical diagnosis.
                  </p>
                </div>

                {/* Saving feedback */}
                {isSaving && (
                  <div className="text-info small mb-3">Saving result to MongoDB...</div>
                )}
                {saveSuccess && (
                  <div className="text-success small mb-3 fw-semibold">✅ Saved to MongoDB successfully for {childDisplayName}.</div>
                )}
                {saveError && (
                  <div className="text-warning small mb-3">⚠️ {saveError}</div>
                )}

                <div className="d-flex align-items-center justify-content-center gap-3">
                  <button
                    type="button"
                    className="btn btn-primary rounded-pill px-4 py-2 fw-semibold ns-btn-primary d-flex align-items-center gap-1.5"
                    onClick={handleClose}
                  >
                    <FiCheckCircle /> Done
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-light rounded-pill px-4 py-2 fw-medium d-flex align-items-center gap-1.5"
                    onClick={handleRetry}
                  >
                    <FiRefreshCw /> Analyze Again
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

export default ChildFaceAnalysisModal;
