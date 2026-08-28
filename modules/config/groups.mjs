/**
 * @import { HUDGroup } from "../layout/defaults.mjs";
 */

/**
 * Module-specific categories that exist on the HUD as top level.
 */
export const CATEGORY_IDS = {
  general:   "general",
  power:     "powers",
  talent:    "talents",
  skill:     "skills",
  devotion:  "devotions",
  spell:     "spells",
  inventory: "inventory",
  combat:    "combat",
  effect:    "effects",
  utility:   "utility",
};

/**
 * Module-only group IDs that do not exist directly in CONFIG.ED4E.
 * @enum {string}
 */
export const MODULE_GROUP_IDS = {
  attacks:       "attacks",
  attributes:    "attributes",
  combatActions: "combatActions",
  effects:       "effects",
  favorites:     "favorites",
  other:         "other",
  statusEffects: "statusEffects",
  utility:       "utility",
};

/**
 * Group data for module-specific groups.
 * @returns { Record<string, HUDGroup> }
 */
export function getModuleGroups() {
  const moduleGroups = {};
  for ( const group of Object.values( MODULE_GROUP_IDS ) ) {
    moduleGroups[ group ] = {
      id:   group,
      name: _loc( `TokenActionHud.Groups.Names.${ group }` ),
      type: "system",
    };
  }
  return moduleGroups;
}

/**
 * Convert ED4E config to groups.
 * @param { object } ed4eConfig
 * @returns { HUDGroup[] }
 */
function ed4eConfigToGroups( ed4eConfig ) {
  return Object.entries( ed4eConfig ).map( ( [ key, value ] ) => {
    return {
      id:   key,
      name: value?.label ?? value?.name ?? value,
      type: "system",
    };
  } );
}

/**
 * Convert ED4E system types to groups.
 * @param { string } documentName The name of the document type, e.g. "Item".
 * @param { string[] } systemTypes The system types to convert.
 * @returns { HUDGroup[] }
 */
function ed4eSystemTypesToGroups( documentName, systemTypes ) {
  const documentSystemTypes = ED4E_CONSTANTS.SYSTEM_TYPES[ documentName ];
  if ( !documentSystemTypes ) return [];

  return systemTypes.map( systemType => {
    return {
      id:   `${ documentName }-${ systemType }`,
      name: _loc( `TYPES.${ documentName }.${ systemType }` ),
      type: "system",
    };
  } );
}

/**
 * Group data for groups based on ED4E config data.
 * @returns { Record<string, HUDGroup[]> }
 */
export function getEd4eGroups() {
  const ed4eConfig = CONFIG.ED4E;
  const itemSystemTypes = ED4E_CONSTANTS.SYSTEM_TYPES.Item;
  return {
    actionSpeed: ed4eConfigToGroups( ed4eConfig.ACTIONS.action ),
    inventory:   ed4eSystemTypesToGroups(
      "Item",
      [
        itemSystemTypes.armor,
        itemSystemTypes.equipment,
        itemSystemTypes.shield,
        itemSystemTypes.weapon,
      ],
    )
  };
}

/**
 * Basic group data for top-level categories.
 * @returns {Record<string, HUDGroup>}
 */
export function getCategoryBaseGroups() {
  const categoryGroups = Object.values( CATEGORY_IDS ).map( id => {
    return {
      id,
      name: _loc( `TokenActionHud.Categories.Names.${ id }` ),
      type: "system",
    };
  } );
  return Object.fromEntries( categoryGroups.map( group => [ group.id, group ] ) );
}

export function getCategoryHierarchy() {
  const systemGroups = getSystemGroups();
  const ed4eGroups = getEd4eGroups();
  return {
    general:   [ systemGroups.attributes, systemGroups.other, ],
    powers:    [ ...ed4eGroups.actionSpeed, ],
    talents:   [ ...ed4eGroups.actionSpeed, ],
    skills:    [ ...ed4eGroups.actionSpeed, ],
    devotions: [ ...ed4eGroups.actionSpeed, ],
    spells:    [],
    inventory: [ ...ed4eGroups.inventory, ],
    combat:    [ systemGroups.attacks, systemGroups.combatActions, ],
    effects:   [ systemGroups.effects, systemGroups.statusEffects, ],
    utility:   [],
  };
}

export function getSystemGroups() {
  const moduleGroups = getModuleGroups();
  const ed4eGroups = getEd4eGroups();
  return {
    ...moduleGroups,
    ...Object.fromEntries( Object.values( ed4eGroups ).flat().map( group => [ group.id, group ] ) ),
  };
}