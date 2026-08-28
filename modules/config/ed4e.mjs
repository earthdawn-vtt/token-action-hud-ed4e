/** @type {Record<string, Record<string, string>>} */
export const ITEM_STATUS_ICONS = {
  armor: {
    carried:  "fa-regular fa-backpack",
    owned:    "fa-solid fa-house",
    equipped: "fa-solid fa-helmet-battle",
  },
  equipment: {
    carried:  "fa-regular fa-backpack",
    owned:    "fa-solid fa-house",
    equipped: "fa-solid fa-user",
  },
  shield: {
    carried:  "fa-regular fa-backpack",
    owned:    "fa-solid fa-house",
    equipped: "fa-solid fa-shield",
  },
  weapon: {
    carried:  "fa-regular fa-backpack",
    owned:    "fa-solid fa-house",
    equipped: "fa-solid fa-sword",
    mainHand: "fa-solid fa-hand",
    offHand:  "fa-regular fa-hand",
    twoHands: "fa-solid fa-hands",
    tail:     "fa-solid fa-worm",
  },
};

/** @type {number} */
export const MAX_SPELL_CIRCLE = 15;