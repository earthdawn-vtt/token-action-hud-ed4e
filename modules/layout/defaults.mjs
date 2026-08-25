import { getCategoryBaseGroups, getCategoryHierarchy, getSystemGroups } from "../config/groups.mjs";

/**
 * @typedef HUDGroup
 * @property { string } id                      The id of the group.
 * @property { string } name                    The group name displayed on the HUD.
 * @property { "system"|"system-derived" } type The group type.
 */

/**
 * This is a string list of {@link HUDGroup#id} group IDs delimited by an underscore (_),
 * e.g., inventory_weapons_ranged. The `nestId` is generated when a user adds a group and is also required in the
 * Token Action Hud system module's default layout.
 *
 * @typedef { string } nestId
 */

/**
 * @typedef _LayoutGroup
 * { @ignore }
 * @property { nestId } nestId
 */

/**
 * @typedef { HUDGroup & _LayoutGroup } LayoutGroup
 * @interface
 * @property { LayoutGroup[] } groups Nested, lower hierarchy groups.
 */

/**
 * @typedef DefaultHUDLayout
 * @property { LayoutGroup[] } layout
 * @property { HUDGroup[] } groups
 * @example
 * This example code shows the expected format:
 * ```js
 * {
 *     layout: [
 *         {
 *             nestId: 'inventory',
 *             id: 'inventory',
 *             name: 'Inventory',
 *             groups: [
 *                 { nestId: 'inventory_weapons', id: 'weapons', name: 'Weapons', type: 'system' },
 *                 { nestId: 'inventory_equipment', id: 'equipment', name: 'Equipment', type: 'system' },
 *                 { nestId: 'inventory_consumables', id: 'consumables', name: 'Consumables', type: 'system' },
 *             ]
 *         },
 *         { ... }
 *     ],
 *     groups: [
 *         { id: 'abilities', name: 'Abilities', type: 'system' },
 *         { id: 'checks', name: 'Checks', type: 'system' },
 *         { id: 'consumables', name: 'Consumables', type: 'system' }
 *         { id: 'equipment', name: 'Equipment', type: 'system' },
 *         { id: 'weapons', name: 'Weapons', type: 'system' },
 *         { ... },
 *     ]
 * }
 * ```
 */

/**
 * Get the default layout for the Token Action Hud system module.
 * @returns { DefaultHUDLayout }
 */
export function getDefaults() {
  const categoryGroups = getCategoryBaseGroups();
  const categoryHierarchy = getCategoryHierarchy();

  for ( const categoryGroup of Object.values( categoryGroups ) ) {
    categoryGroup.nestId = categoryGroup.id;
    categoryGroup.groups = getNestedGroups( categoryHierarchy[ categoryGroup.id ], categoryGroup.nestId );
  }
  return /** @type { DefaultHUDLayout } */ {
    layout: categoryGroups,
    groups: Object.values( getSystemGroups() ),
  };
}

function getNestedGroups( groups, parentNestId ) {
  const nestedGroups = [];
  for ( const group of groups ) {
    nestedGroups.push( {
      nestId: [ parentNestId, group.id ].join( "_" ),
      id:     group.id,
      name:   group.name,
      type:   group.type,
    } );
  }
  return nestedGroups;
}