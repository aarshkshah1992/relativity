import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Eye, Clock, Ruler, Zap, RefreshCw, Info, Sparkles, Brain, MessageCircleQuestion, X } from 'lucide-react';

// --- Content Data ---
const steps = [
  {
    title: "Reference Frames",
    concept: "Inertial Frames",
    description: "Before we start, we need to understand 'frames of reference'. Alice is standing on the platform (The Stationary Frame). Bob is on a high-speed train (The Moving Frame). From Bob's perspective, he is still and the world moves. From Alice's perspective, she is still and the train moves.",
    visuals: { train: true, ball: false, light: false, clocks: false, simultaneity: false, contraction: false },
    animationSpeed: 0.5
  },
  {
    title: "Relative Motion (Classical)",
    concept: "The Ball Drop",
    description: "Bob drops a ball. To Bob (on the train), it falls straight down. To Alice (on the platform), the ball travels forward with the train while falling, tracing a curved path (parabola). Both agree on the physics, just not the path.",
    visuals: { train: true, ball: true, light: false, clocks: false, simultaneity: false, contraction: false },
    animationSpeed: 1
  },
  {
    title: "Galilean Relativity",
    concept: "Adding Velocities",
    description: "In classical physics, velocities add up. If the train moves at 100 mph and Bob throws a ball forward at 10 mph, Alice sees it moving at 110 mph. This makes intuitive sense... until we talk about light.",
    visuals: { train: true, ball: true, light: false, clocks: false, simultaneity: false, contraction: false },
    animationSpeed: 1
  },
  {
    title: "Speed of Light Constant",
    concept: "The Universal Speed Limit",
    description: "This is Einstein's great insight. Light travels at 'c' (approx 300,000 km/s). Unlike the ball, the speed of the train DOES NOT add to the speed of light. Both Alice and Bob measure the light beam traveling at exactly the same speed.",
    visuals: { train: true, ball: false, light: true, clocks: false, simultaneity: false, contraction: false },
    animationSpeed: 1.5
  },
  {
    title: "Time Dilation",
    concept: "Time Slows Down",
    description: "Imagine a 'light clock' where a photon bounces up and down. For Bob, it goes straight up and down. For Alice, the photon must travel a longer diagonal path. Since the speed of light is constant, it takes LONGER for the photon to make the trip in Alice's view. Time runs slower for the moving observer.",
    visuals: { train: true, ball: false, light: true, clocks: true, simultaneity: false, contraction: false },
    animationSpeed: 0.5
  },
  {
    title: "Length Contraction",
    concept: "Space Shrinks",
    description: "Because time slows down, space must adjust to keep the speed of light constant. Objects moving at relativistic speeds appear shorter in the direction of motion to a stationary observer. To Alice, Bob's train literally shrinks.",
    visuals: { train: true, ball: false, light: false, clocks: false, simultaneity: false, contraction: true },
    animationSpeed: 0.8
  },
  {
    title: "Relativity of Simultaneity",
    concept: "Events Aren't Synchronized",
    description: "A light flashes in the center of the train. Bob sees it hit the front and back walls simultaneously. Alice sees the back wall move toward the light and the front move away. She sees the light hit the back wall FIRST. Simultaneous events for one are not simultaneous for another!",
    visuals: { train: true, ball: false, light: false, clocks: false, simultaneity: true, contraction: false },
    animationSpeed: 0.8
  }
];

const RelativityExplorer = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [perspective, setPerspective] = useState('alice'); // 'alice' (platform) or 'bob' (train)
  const [time, setTime] = useState(0);

  // AI State
  const [aiResponse, setAiResponse] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState(null); // 'explain' or 'quiz'

  const requestRef = useRef();

  // --- AI Logic ---
  const callGemini = async (mode) => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    setAiMode(mode);
    setAiResponse(null);
    setIsPlaying(false); // Pause while thinking/reading

    const currentStepData = steps[currentStep];
    const apiKey = ""; // Runtime provided environment variable

    let prompt = "";
    const systemInstruction = "You are a helpful, fun physics tutor specializing in Special Relativity.";

    if (mode === 'explain') {
      prompt = `Explain the physics concept of "${currentStepData.title}: ${currentStepData.concept}" to a 12-year-old. 
        Context from app: ${currentStepData.description}. 
        Use a fun, simple analogy (maybe involving everyday objects or the train in the app). 
        Keep the response short (max 3 sentences).`;
    } else if (mode === 'quiz') {
      prompt = `Generate one single multiple-choice question to test the user's understanding of "${currentStepData.concept}".
        Context: ${currentStepData.description}.
        
        Format the output exactly like this (no intro text):
        **Question:** [The Question]
        
        A) [Option 1]
        B) [Option 2]
        C) [Option 3]
        D) [Option 4]
        
        **Answer:** [Correct Option Letter] - [Brief explanation why]
        `;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: systemInstruction }] }
          })
        }
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      setAiResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.");
    } catch (error) {
      console.error(error);
      setAiResponse("Oops! The AI Tutor is currently taking a nap (Network Error). Try again later!");
    } finally {
      setIsAiLoading(false);
    }
  };

  const closeAi = () => {
    setAiResponse(null);
    setAiMode(null);
  }

  // --- Animation Loop ---
  useEffect(() => {
    const animate = () => {
      if (isPlaying) {
        setTime(prev => {
          // Loop the animation (0 to 100)
          if (prev >= 100) return 0;
          return prev + (steps[currentStep].animationSpeed * 0.5);
        });
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, currentStep]);

  // Reset time when step changes
  useEffect(() => {
    setTime(0);
    setIsPlaying(true);
    closeAi(); // Close AI window when changing steps
  }, [currentStep]);

  // --- Physics & Render Logic ---

  // Base Constants
  const TRAIN_WIDTH = 260;
  const TRAIN_HEIGHT = 140;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;
  const GROUND_Y = 300;

  // Physics parameters
  const trainSpeed = 3; // Pixels per frame (approx)

  // Derived State based on perspective and physics
  const getSceneState = () => {
    const t = time; // 0 to 100
    const isContracted = steps[currentStep].visuals.contraction;

    // Lorentz Factor simulation for visual effect (exaggerated)
    const gamma = isContracted ? 0.7 : 1;

    // Visual Width of train
    const currentTrainWidth = perspective === 'alice' ? TRAIN_WIDTH * gamma : TRAIN_WIDTH;

    // Position calculations
    let trainX, platformX;

    if (perspective === 'alice') {
      // Alice is static, Train moves right
      platformX = 0;
      trainX = (t * trainSpeed * 1.5) + 50;
      if (trainX > CANVAS_WIDTH + 200) trainX = -200; // Loop logic handled loosely here for visuals
    } else {
      // Bob is static, Platform moves left
      trainX = (CANVAS_WIDTH / 2) - (currentTrainWidth / 2);
      platformX = -(t * trainSpeed * 1.5);
    }

    // Ball Logic (Step 2 & 3)
    // Simple gravity simulation: y = 0.5 * g * t^2
    const dropProgress = time / 100;
    const ballY = 100 + (200 * (dropProgress * dropProgress)); // 100 is ceiling, +200 is floor
    const ballXRelative = currentTrainWidth / 2; // Center of train
    const ballX = trainX + ballXRelative;

    // Light Clock Logic (Step 4 & 5)
    // Bounces up and down
    const lightCycle = time % 50; // 0-50 is one leg
    const isUp = (time % 100) > 50;
    const lightYProgress = lightCycle / 50;
    // If up: floor to ceiling. If down: ceiling to floor.
    const lightY = isUp
      ? (GROUND_Y - 20) - (lightYProgress * (TRAIN_HEIGHT - 40))
      : (GROUND_Y - TRAIN_HEIGHT + 20) + (lightYProgress * (TRAIN_HEIGHT - 40));

    const lightX = trainX + (currentTrainWidth / 2);

    // Simultaneity Logic (Step 7)
    // Flash from center
    const flashProgress = time;
    const lightSpeed = 4; // Pixels per tick relative to train
    const leftBeamDist = flashProgress * lightSpeed;
    const rightBeamDist = flashProgress * lightSpeed;

    // Relativity adjustment for Simultaneity
    // If Alice viewing, light travels at C independent of train.
    // Back wall moves INTO light, Front wall moves AWAY.
    let leftHit = false;
    let rightHit = false;
    let leftBeamX, rightBeamX;

    const center = trainX + (currentTrainWidth / 2);

    if (perspective === 'bob') {
      leftBeamX = center - leftBeamDist;
      rightBeamX = center + rightBeamDist;
      if (leftBeamDist > currentTrainWidth / 2) leftHit = true;
      if (rightBeamDist > currentTrainWidth / 2) rightHit = true;
    } else {
      // Alice's view: Light moves at C, but walls move at V
      // We fake the math visually here for clarity
      const c = 4;

      const leftDistAlice = time * c;
      const rightDistAlice = time * c;

      // Calculate wall positions
      const backWallX = trainX;
      const frontWallX = trainX + currentTrainWidth;

      leftBeamX = center - leftDistAlice;
      rightBeamX = center + rightDistAlice;

      // Check collisions visual
      if (leftBeamX <= backWallX) leftHit = true;
      if (rightBeamX >= frontWallX) rightHit = true;
    }

    return {
      trainX,
      platformX,
      currentTrainWidth,
      ballX,
      ballY,
      lightX,
      lightY,
      leftBeamX,
      rightBeamX,
      leftHit,
      rightHit,
      gamma
    };
  };

  const state = getSceneState();
  const activeVisuals = steps[currentStep].visuals;

  // --- UI Components ---

  const renderGrid = () => {
    // Parallax background grid
    const lines = [];
    const offset = state.platformX % 100;
    for (let i = -1; i < 10; i++) {
      lines.push(
        <line
          key={`grid-${i}`}
          x1={(i * 100) + offset}
          y1={0}
          x2={(i * 100) + offset}
          y2={CANVAS_HEIGHT}
          stroke="#334155"
          strokeWidth="1"
          strokeDasharray="5,5"
        />
      );
    }
    return lines;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900 text-slate-100 rounded-xl shadow-2xl overflow-hidden font-sans border border-slate-700 flex flex-col min-h-screen md:min-h-0">

      {/* Header */}
      <div className="p-6 bg-slate-800 border-b border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Relativity Explorer
          </h1>
          <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
            <Info size={14} /> Interactive Thought Experiment
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setPerspective('alice')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm md:text-base ${perspective === 'alice' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            <Eye size={18} /> Alice (Platform)
          </button>
          <button
            onClick={() => setPerspective('bob')}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm md:text-base ${perspective === 'bob' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            <Eye size={18} /> Bob (Train)
          </button>
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="relative bg-slate-950 aspect-video overflow-hidden border-b border-slate-800">

        {/* SVG Canvas */}
        <svg
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          className="w-full h-full preserve-3d"
        >
          <defs>
            <linearGradient id="sky-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background */}
          <rect width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="url(#sky-gradient)" />
          {renderGrid()}

          {/* Platform Floor */}
          <rect x="0" y={GROUND_Y} width={CANVAS_WIDTH} height={CANVAS_HEIGHT - GROUND_Y} fill="#334155" />
          <line x1="0" y1={GROUND_Y} x2={CANVAS_WIDTH} y2={GROUND_Y} stroke="#94a3b8" strokeWidth="2" />

          {/* Alice (Observer) */}
          <g transform={`translate(${state.platformX + 100}, ${GROUND_Y - 60})`}>
            <text x="0" y="-70" textAnchor="middle" fill="#60a5fa" fontSize="14" fontWeight="bold">Alice</text>
            <circle cx="0" cy="0" r="5" fill="#60a5fa" /> {/* Head */}
            <line x1="0" y1="5" x2="0" y2="35" stroke="#60a5fa" strokeWidth="3" /> {/* Body */}
            <line x1="0" y1="35" x2="-10" y2="60" stroke="#60a5fa" strokeWidth="3" /> {/* Leg L */}
            <line x1="0" y1="35" x2="10" y2="60" stroke="#60a5fa" strokeWidth="3" /> {/* Leg R */}
            <line x1="0" y1="15" x2="-10" y2="25" stroke="#60a5fa" strokeWidth="3" /> {/* Arm L */}
            <line x1="0" y1="15" x2="10" y2="25" stroke="#60a5fa" strokeWidth="3" /> {/* Arm R */}
          </g>

          {/* The Train */}
          <g transform={`translate(${state.trainX}, ${GROUND_Y - TRAIN_HEIGHT - 5})`}>
            {/* Train Body */}
            <rect
              x="0"
              y="0"
              width={state.currentTrainWidth}
              height={TRAIN_HEIGHT}
              fill="#333"
              stroke="#e2e8f0"
              strokeWidth="3"
              rx="10"
              fillOpacity="0.8"
            />

            {/* Windows */}
            <rect x="20" y="20" width={(state.currentTrainWidth - 40)} height={TRAIN_HEIGHT - 40} fill="#1e293b" rx="5" stroke="#475569" />

            {/* Wheels */}
            <circle cx={30} cy={TRAIN_HEIGHT + 5} r="15" fill="#64748b" stroke="#000" strokeWidth="2" />
            <circle cx={state.currentTrainWidth - 30} cy={TRAIN_HEIGHT + 5} r="15" fill="#64748b" stroke="#000" strokeWidth="2" />

            {/* Bob (Observer) */}
            <g transform={`translate(${state.currentTrainWidth / 2}, ${TRAIN_HEIGHT - 20})`}>
              <text x="0" y="-85" textAnchor="middle" fill="#a855f7" fontSize="14" fontWeight="bold">Bob</text>
              <circle cx="0" cy="-60" r="5" fill="#a855f7" />
              <line x1="0" y1="-55" x2="0" y2="-25" stroke="#a855f7" strokeWidth="3" />
              <line x1="0" y1="-25" x2="-10" y2="0" stroke="#a855f7" strokeWidth="3" />
              <line x1="0" y1="-25" x2="10" y2="0" stroke="#a855f7" strokeWidth="3" />
            </g>

            {/* Simultaneity Detectors */}
            {activeVisuals.simultaneity && (
              <>
                <rect x="5" y="40" width="10" height="40" fill={state.leftHit ? "#ef4444" : "#1e293b"} stroke="#fff" />
                <rect x={state.currentTrainWidth - 15} y="40" width="10" height="40" fill={state.rightHit ? "#ef4444" : "#1e293b"} stroke="#fff" />
              </>
            )}
          </g>

          {/* DYNAMIC ELEMENTS (Calculated in global coords) */}

          {/* The Ball */}
          {activeVisuals.ball && (
            <circle
              cx={state.ballX}
              cy={state.ballY}
              r="8"
              fill="#ef4444"
              stroke="white"
              strokeWidth="2"
            />
          )}

          {/* Light Clock Beam */}
          {activeVisuals.light && activeVisuals.clocks && (
            <circle cx={state.lightX} cy={state.lightY} r="6" fill="#facc15" filter="url(#glow)" />
          )}

          {/* Simultaneity Beams */}
          {activeVisuals.simultaneity && (
            <g transform={`translate(0, ${GROUND_Y - TRAIN_HEIGHT / 2 - 5})`}>
              {!state.leftHit && (
                <line x1={state.trainX + state.currentTrainWidth / 2} y1="0" x2={state.leftBeamX} y2="0" stroke="#facc15" strokeWidth="4" filter="url(#glow)" strokeLinecap="round" />
              )}
              {!state.rightHit && (
                <line x1={state.trainX + state.currentTrainWidth / 2} y1="0" x2={state.rightBeamX} y2="0" stroke="#facc15" strokeWidth="4" filter="url(#glow)" strokeLinecap="round" />
              )}
            </g>
          )}
        </svg>

        {/* Overlay UI: Clock readout for Step 5 */}
        {activeVisuals.clocks && (
          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur p-3 rounded border border-slate-600">
            <div className="text-xs text-slate-300 mb-1">Elapsed Time (Visual)</div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-blue-400 font-mono text-lg">{perspective === 'alice' ? "1.00s" : "0.85s"}</div>
                <div className="text-[10px]">Alice's Clock</div>
              </div>
              <div className="text-center">
                <div className="text-purple-400 font-mono text-lg">{perspective === 'bob' ? "1.00s" : "0.85s"}</div>
                <div className="text-[10px]">Bob's Clock</div>
              </div>
            </div>
          </div>
        )}

        {/* Overlay: Length Contraction Factor */}
        {activeVisuals.contraction && (
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur p-3 rounded border border-slate-600 max-w-xs">
            <div className="flex items-center gap-2 mb-1">
              <Ruler className="text-yellow-500" size={16} />
              <span className="font-bold text-sm">Lorentz Contraction</span>
            </div>
            <div className="text-xs text-slate-300">
              {perspective === 'alice'
                ? "Alice sees the train contracted in the direction of motion."
                : "Bob sees the train at normal length (Proper Length)."}
            </div>
            <div className="mt-2 h-1 w-full bg-slate-700 rounded overflow-hidden">
              <div className="h-full bg-yellow-500 transition-all duration-500" style={{ width: perspective === 'alice' ? '70%' : '100%' }}></div>
            </div>
          </div>
        )}

        {/* AI Response Modal */}
        {(aiResponse || isAiLoading) && (
          <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 rounded-t-xl">
                <h3 className="font-bold flex items-center gap-2 text-white">
                  {aiMode === 'explain' ? <Sparkles className="text-yellow-400" size={18} /> : <Brain className="text-green-400" size={18} />}
                  {aiMode === 'explain' ? 'Simply Explained' : 'Quick Quiz'}
                </h3>
                <button onClick={closeAi} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {isAiLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-3 text-slate-400">
                    <RefreshCw className="animate-spin text-blue-400" size={32} />
                    <p>Consulting Einstein...</p>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="whitespace-pre-wrap">{aiResponse}</div>
                  </div>
                )}
              </div>
              {!isAiLoading && aiMode === 'quiz' && (
                <div className="p-4 border-t border-slate-700 bg-slate-900/30 flex justify-end">
                  <button onClick={closeAi} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm">
                    Got it!
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Controls & Navigation */}
      <div className="flex-1 bg-slate-900 p-6 flex flex-col gap-6">

        {/* Progress Bar */}
        <div className="flex items-center justify-between gap-2">
          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${idx <= currentStep ? (idx === currentStep ? 'bg-blue-500 scale-y-150' : 'bg-blue-800') : 'bg-slate-700'}`}
              title={step.title}
            />
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Concept Text */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 text-blue-400 font-mono text-sm uppercase tracking-wider">
              <span className="bg-blue-900/30 px-2 py-1 rounded">Step {currentStep + 1}</span>
              <span>{steps[currentStep].concept}</span>
            </div>
            <h2 className="text-2xl font-bold text-white">{steps[currentStep].title}</h2>
            <p className="text-slate-300 leading-relaxed">
              {steps[currentStep].description}
            </p>

            {/* Concept Icons & Tags */}
            <div className="flex gap-4 mt-2">
              {activeVisuals.train && <div className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 flex items-center gap-1"><Zap size={12} /> Motion</div>}
              {activeVisuals.light && <div className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 flex items-center gap-1"><Zap size={12} /> Light Speed (c)</div>}
              {activeVisuals.clocks && <div className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400 flex items-center gap-1"><Clock size={12} /> Time Dilation</div>}
            </div>
          </div>

          {/* Right Column: Playback & AI Tools */}
          <div className="flex flex-col gap-4 min-w-[240px]">
            {/* AI Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => callGemini('explain')}
                disabled={isAiLoading}
                className="flex flex-col items-center justify-center p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-all group"
              >
                <Sparkles className="text-yellow-400 mb-1 group-hover:scale-110 transition-transform" size={20} />
                <span className="text-xs font-bold text-slate-200">Explain Simply</span>
              </button>
              <button
                onClick={() => callGemini('quiz')}
                disabled={isAiLoading}
                className="flex flex-col items-center justify-center p-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-all group"
              >
                <MessageCircleQuestion className="text-green-400 mb-1 group-hover:scale-110 transition-transform" size={20} />
                <span className="text-xs font-bold text-slate-200">Quiz Me</span>
              </button>
            </div>

            {/* Playback Controls */}
            <div className="flex flex-col gap-2 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="p-2 rounded-full hover:bg-slate-700 disabled:opacity-30 transition-colors text-white"
                >
                  <SkipBack size={24} />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-3 bg-blue-600 rounded-full hover:bg-blue-500 transition-transform hover:scale-105 shadow-lg shadow-blue-900/20 text-white"
                >
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                </button>

                <button
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={currentStep === steps.length - 1}
                  className="p-2 rounded-full hover:bg-slate-700 disabled:opacity-30 transition-colors text-white"
                >
                  <SkipForward size={24} />
                </button>
              </div>

              <div className="flex items-center gap-2 justify-center text-slate-400 mt-1">
                <RefreshCw size={12} className={isPlaying ? "animate-spin" : ""} />
                <span className="text-[10px] font-mono uppercase tracking-widest">{isPlaying ? "Simulating..." : "Paused"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelativityExplorer;