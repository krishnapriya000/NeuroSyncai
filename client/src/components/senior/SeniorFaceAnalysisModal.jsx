import React, { useState, useEffect, useRef } from "react";
import * as faceapi from "@vladmandic/face-api";
import {
  FiCamera,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
  FiShield,
  FiSmile
} from "react-icons/fi";

const emotionEmojiMap = {
  happy: "Happy 😊",
  sad: "Sad 😔",
  angry: "Stressed 😰",
  fearful: "Stressed 😰",
  disgusted: "Stressed 😰",
  surprised: "Surprised 😲",
  neutral: "Calm 🌿"
};

const mapEmotionToSeniorMood = (emo) => {
  const e = (emo || "").toLowerCase();
  if (e === "happy") return "Happy";
  if (e === "sad") return "Sad";
  if (e === "angry" || e === "fearful" || e === "disgusted") return "Stressed";
  return "Calm";
};

function SeniorFaceAnalysisModal({ isOpen, onClose, onMoodDetected }) {
  const [stage, setStage] = useState("privacy"); // 'privacy' | 'loading' | 'analyzing' | 'result' | 'error'
  const [loadingText, setLoadingText] = useState("Starting camera...");
  const [errorMessage, setErrorMessage] = useState("");

  const [detectionStatus, setDetectionStatus] = useState("Initializing...");
  const [faceCountText, setFaceCountText] = useState("");

  const [detectedEmotion, setDetectedEmotion] = useState(null);
  const [seniorMood, setSeniorMood] = useState("Calm");
  const [confidence, setConfidence] = useState(0);

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
      setDetectedEmotion(null);
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

  const loadModels = async () => {
    if (modelsLoadedRef.current) return true;

    try {
      setLoadingText("Loading face emotion AI model...");
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      ]);
      modelsLoadedRef.current = true;
      return true;
    } catch (localErr) {
      console.warn("Local face model failed, trying CDN fallback...", localErr);
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

  const handleStartPermission = async () => {
    setStage("loading");
    setErrorMessage("");

    setLoadingText("Starting camera...");
    const loaded = await loadModels();
    if (!loaded) {
      setErrorMessage("Unable to load emotion analysis model. Please check internet connection.");
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
        setErrorMessage("Camera permission was denied. Please allow camera access in browser settings.");
      } else {
        setErrorMessage("Unable to access camera: " + err.message);
      }
      setStage("error");
    }
  };

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
          setFaceCountText("Please position your face clearly in front of the camera.");
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

          if (samplesRef.current.length >= 18) {
            evaluateResult();
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

  const evaluateResult = () => {
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
    const mappedMood = mapEmotionToSeniorMood(bestEmotion);

    stopCameraAndLoops();
    setDetectedEmotion(bestEmotion);
    setSeniorMood(mappedMood);
    setConfidence(avgConf);
    setStage("result");
  };

  const handleApplyMood = () => {
    if (onMoodDetected) {
      onMoodDetected(seniorMood, `AI Face Analysis detected ${emotionEmojiMap[detectedEmotion] || detectedEmotion} (${confidence}% confidence)`);
    }
    handleClose();
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
      style={{ backgroundColor: "rgba(5, 8, 22, 0.88)", backdropFilter: "blur(10px)", zIndex: 1065 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div
          className="modal-content text-white rounded-4 shadow-lg border border-secondary border-opacity-25 overflow-hidden"
          style={{ background: "#0F172A" }}
        >
          {/* HEADER */}
          <div className="modal-header border-bottom border-secondary border-opacity-25 px-4 py-3 bg-dark bg-opacity-40">
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle bg-primary bg-opacity-25 text-primary d-flex align-items-center justify-content-center fw-bold"
                style={{ width: "44px", height: "44px", fontSize: "1.2rem" }}
              >
                📷
              </div>
              <div>
                <h5 className="modal-title fw-bold text-white fs-5 mb-0">AI Facial Mood Analysis</h5>
                <span className="text-muted extra-small" style={{ fontSize: "0.82rem" }}>
                  Detect your current expression using your camera
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

          {/* BODY */}
          <div className="modal-body p-4 text-center">
            {/* PRIVACY CONSENT STAGE */}
            {stage === "privacy" && (
              <div className="py-3 px-2">
                <div className="p-3.5 rounded-circle bg-primary bg-opacity-25 text-primary d-inline-flex align-items-center justify-content-center mb-3 fs-2">
                  <FiShield />
                </div>
                <h4 className="fw-bold text-white mb-2 fs-5">Camera Mood Analysis</h4>
                <p className="text-white-50 mb-3 mx-auto" style={{ maxWidth: "540px", fontSize: "0.95rem" }}>
                  NeuroSync AI will look at your face through your camera for a few seconds to detect your mood expression naturally.
                </p>
                <p className="text-muted mb-4 extra-small" style={{ fontSize: "0.82rem" }}>
                  🔒 Your camera feed is processed privately inside your browser. No video is recorded or stored.
                </p>

                <div className="d-flex align-items-center justify-content-center gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-light rounded-pill px-4 py-2.5 fw-bold"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary rounded-pill px-5 py-2.5 fw-bold shadow"
                    onClick={handleStartPermission}
                  >
                    <FiCamera className="me-2" /> Start Camera
                  </button>
                </div>
              </div>
            )}

            {/* LOADING STAGE */}
            {stage === "loading" && (
              <div className="py-5">
                <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }} role="status" />
                <h5 className="fw-bold text-white mb-2 fs-5">{loadingText}</h5>
                <p className="text-muted extra-small">Preparing facial emotion AI model...</p>
              </div>
            )}

            {/* ANALYZING STAGE */}
            {stage === "analyzing" && (
              <div>
                <p className="text-white-50 mb-3" style={{ fontSize: "0.95rem" }}>
                  Look naturally into your camera while the AI analyzes your facial expression.
                </p>

                {faceCountText && (
                  <div className="alert bg-warning bg-opacity-20 text-warning border border-warning border-opacity-30 rounded-3 p-2.5 mb-3 d-flex align-items-center justify-content-center gap-2 small">
                    <FiAlertCircle /> <span>{faceCountText}</span>
                  </div>
                )}

                <div
                  className="position-relative mx-auto rounded-4 overflow-hidden bg-black border border-secondary border-opacity-30 shadow-inner"
                  style={{ maxWidth: "540px", aspectRatio: "4/3" }}
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

                  <div className="position-absolute bottom-3 start-50 translate-middle-x bg-dark bg-opacity-80 border border-secondary border-opacity-30 px-3 py-1.5 rounded-pill d-flex align-items-center gap-2">
                    <span className="spinner-grow spinner-grow-sm text-primary" role="status" />
                    <span className="fw-semibold text-white small">{detectionStatus}</span>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-center gap-3 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4 py-2 text-white"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-light rounded-pill px-4 py-2"
                    onClick={() => {
                      stopCameraAndLoops();
                      handleStartPermission();
                    }}
                  >
                    <FiRefreshCw className="me-1" /> Retry
                  </button>
                </div>
              </div>
            )}

            {/* RESULT STAGE */}
            {stage === "result" && (
              <div className="py-3 px-2">
                <div className="p-3.5 rounded-circle bg-success bg-opacity-25 text-success d-inline-flex align-items-center justify-content-center mb-3 fs-2">
                  <FiCheckCircle />
                </div>

                <h4 className="fw-bold text-white mb-2 fs-4">Mood Detected!</h4>

                <div
                  className="p-4 rounded-4 bg-dark bg-opacity-60 border border-secondary border-opacity-30 mb-4 mx-auto text-center shadow-sm"
                  style={{ maxWidth: "450px" }}
                >
                  <div className="text-muted small text-uppercase tracking-wider mb-1">Detected Mood</div>
                  <div className="display-5 fw-extrabold text-white mb-2">
                    {seniorMood} {seniorMood === "Happy" ? "😊" : seniorMood === "Calm" ? "🌿" : seniorMood === "Sad" ? "😔" : "😰"}
                  </div>
                  <div className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-30 px-3 py-1.5 fs-6 fw-bold">
                    Confidence: {confidence}%
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-center gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4 py-2.5 text-white fw-bold"
                    onClick={() => {
                      stopCameraAndLoops();
                      handleStartPermission();
                    }}
                  >
                    <FiRefreshCw className="me-1" /> Scan Again
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary rounded-pill px-5 py-2.5 fw-bold shadow"
                    onClick={handleApplyMood}
                  >
                    Apply Detected Mood
                  </button>
                </div>
              </div>
            )}

            {/* ERROR STAGE */}
            {stage === "error" && (
              <div className="py-4 px-2">
                <div className="p-3.5 rounded-circle bg-danger bg-opacity-25 text-danger d-inline-flex align-items-center justify-content-center mb-3 fs-2">
                  <FiAlertCircle />
                </div>
                <h4 className="fw-bold text-white mb-2 fs-5">Camera Error</h4>
                <p className="text-danger-300 mb-4 mx-auto" style={{ maxWidth: "500px", fontSize: "0.92rem" }}>
                  {errorMessage}
                </p>

                <div className="d-flex align-items-center justify-content-center gap-3">
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4 py-2 text-white"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary rounded-pill px-4 py-2 fw-bold"
                    onClick={handleStartPermission}
                  >
                    <FiRefreshCw className="me-1" /> Retry
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

export default SeniorFaceAnalysisModal;
