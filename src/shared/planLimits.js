const PLAN_LIMITS = {
  FREE: {
    videos: 25,
    members: 1,
    ai: false,
    transcription: false,
    resolution: "720p",
    dailyAIThreshold: 0,
  },
  STANDARD: {
    videos: 50,
    members: 5,
    ai: true,
    transcription: true,
    resolution: "1080p",
    dailyAIThreshold: 20,
  },
  PRO: {
    videos: Infinity,
    members: 1,
    ai: true,
    transcription: true,
    resolution: "4k",
    dailyAIThreshold: 100,
  },
  TEAM: {
    videos: Infinity,
    members: 10,
    ai: true,
    transcription: true,
    resolution: "4k",
    dailyAIThreshold: 500,
  },
  ENTERPRISE: {
    videos: Infinity,
    members: Infinity,
    ai: true,
    transcription: true,
    resolution: "4k",
    dailyAIThreshold: Infinity,
  },
};

// Export for CommonJS (Express)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { PLAN_LIMITS };
}

// Support ESM/TypeScript (Next.js) named import
// Note: Next.js can import CommonJS named exports fine.
