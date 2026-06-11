export const EMOJI_MAP = {
  cocktail: "🍹",
  beer:     "🍺",
  lemon:    "🍋",
  water:    "💧",
  fries:    "🍟",
  cheese:   "🧀",
  chicken:  "🍗",
  steak:    "🥩",
  veggie:   "🌱",
  default:  "🍽️",
};


export const getEmoji = (codigo) =>
  EMOJI_MAP[codigo?.trim()] || EMOJI_MAP.default;