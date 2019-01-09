const LEVELS = {
  LOW: 'low',
  HIGH: 'high'
};

const TYPES = {
  [LEVELS.LOW]: 0,
  [LEVELS.HIGH]: 1
};

export default function getType() {
  return TYPES[LEVELS.LOW];
}
