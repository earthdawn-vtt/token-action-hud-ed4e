/**
 * @typedef ActionInfoData
 * @property {string} [class] The CSS class applied to the `<div>` element.
 * @property {string} text The text.
 * @property {string} [title] The title applied to the `<div>` element.
 */

/**
 * @typedef {"LEFT"|"RIGHT"|"TOP"|"BOTTOM"|"CENTER"} ActionTooltipDirection
 */

/**
 * @typedef ActionTooltipData
 * @property {string} content The tooltip HTML content.
 * @property {string} [class] A CSS class.
 * @property {ActionTooltipDirection} [direction] Direction to open the tooltip.
 */

/**
 * @typedef ActionData
 * @property {string} id The action id. Most commonly the item id.
 * @property {string} name The action name displayed on the button.
 * @property {string} [encodedValue] The value passed to the {@link RollHandler} when an action is clicked.
 * @property {string} [cssClass] The CSS class applied to the button.
 * @property {string} [icon] The icon displayed on the button in HTML format,
 * e.g., `<i class="fas fa-plus" title="Bonus"></i>`.
 * @property {string} [img] The image displayed on the button. See {@link coreModule.api.Utils#getImage} for respecting
 * TAH Core's 'Display Icons' module setting.
 * @property {ActionInfoData} [info1] The first info displayed on the button.
 * @property {ActionInfoData} [info2] The second info displayed on the button.
 * @property {ActionInfoData} [info3] The third info displayed on the button.
 * @property {boolean} [selected] Whether the action is selected in the HUD.
 * @property {object} [system] Used to store additional properties.
 * @property {ActionTooltipData} [tooltip] The tooltip displayed when hovering the button.
 * @property {function} [onClick] Function to execute when the action is clicked.
 * @property {function} [onHover] Function to execute when the action is hovered.
 */

// region Foundry Core API

/**
 * @typedef ContextMenuEntry
 * @property {string} label                             The context menu label. Can be localized.
 * @property {string} [icon]                            A string containing a className. A full HTML element may also be
 *                                                      provided.
 * @property {string} [classes]                         Additional CSS classes to apply to this menu item.
 * @property {string} [group]                           An identifier for a group this entry belongs to.
 * @property {ContextMenuCallback} [onClick]            The function to call when the menu item is clicked.
 * @property {ContextMenuCondition|boolean} [visible]    A function to call or boolean value to determine if this entry
 *                                                      appears in the menu.
 */

/**
 * @callback ContextMenuCondition
 * @param {HTMLElement} target                          The element that the context menu has been triggered for.
 * @returns {boolean}                                   Whether the entry should be rendered in the context menu.
 */

/**
 * @callback ContextMenuCallback
 * @param {PointerEvent} event                          The triggering event.
 * @param {HTMLElement} target                          The element that the context menu has been triggered for.
 * @returns {unknown}
 */

// endregion

import { ActionAbilityBuilder } from "./builders/action-ability-builder.mjs";
import { GeneralActionsBuilder } from "./builders/general-actions-builder.mjs";
import { InventoryActionsBuilder } from "./builders/inventory-actions-builder.mjs";
import { CombatActionsBuilder } from "./builders/combat-actions-builder.mjs";
import { EffectActionsBuilder } from "./builders/effect-actions-builder.mjs";
import { MultiTokenActionsBuilder } from "./builders/multi-token-actions-builder.mjs";
import { SpellActionsBuilder } from "./builders/spell-actions-builder.mjs";

export function createActionHandler( coreApi ) {

  return class ActionHandlerEd extends coreApi.ActionHandler {

    constructor( ...args ) {
      super( ...args );

      this.singleActorBuilder = [
        new GeneralActionsBuilder( this, coreApi ),
        new ActionAbilityBuilder( this, coreApi, "power" ),
        new ActionAbilityBuilder( this, coreApi, "talent" ),
        new ActionAbilityBuilder( this, coreApi, "skill" ),
        new ActionAbilityBuilder( this, coreApi, "devotion" ),
        new SpellActionsBuilder( this, coreApi ),
        new InventoryActionsBuilder( this, coreApi ),
        new CombatActionsBuilder( this, coreApi ),
        new EffectActionsBuilder( this, coreApi ),
      ];

      this.multiActorBuilder = new MultiTokenActionsBuilder( this, coreApi );
    }

    /**
     * @inheritDoc
     * Called by TAH Core to initiate the build of system-defined actions by the TAH system module.
     */
    async buildSystemActions( groupIds ){
      if ( !this.actor ) {
        await this.multiActorBuilder.buildActions( this.token );
        return;
      }

      for ( const builder of this.singleActorBuilder ) {
        if ( builder.appliesToActor( this.actor ) ) {
          await builder.buildActions( this.actor, this.token );
        }
      }
    }

  };

}