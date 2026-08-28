import { BaseActionBuilder } from "./base-builder.mjs";
import { ACTION_IDS } from "../../config/actions.mjs";
import { MODULE_GROUP_IDS } from "../../config/groups.mjs";

export class EffectActionsBuilder extends BaseActionBuilder {


  async buildActions( actor, token ) {
    this.actor = actor;
    this.token = token;

    await this._buildEffectActions();
    await this._buildStatusActions();
  }

  async _buildEffectActions() {
    this.actionHandler.addActions(
      [
        {
          id:           ACTION_IDS.addEffect,
          name:         _loc( "TokenActionHud.Actions.Names.addEffect" ),
          onClick:      async () => {
            await ActiveEffect.implementation.create( {
              type:     ED4E_CONSTANTS.SYSTEM_TYPES.ActiveEffect.eae,
              name:     _loc( "ED.ActiveEffect.newEffectName" ),
              icon:     "icons/svg/aura.svg",
              origin:   this.actor.uuid,
              duration: {
                value: null,
                units: "rounds",
              },
              system:  {
                parentDocumentType: this.actor.documentName,
              },
            }, {
              parent:      this.actor,
              renderSheet: true,
            } );
          },
        }
      ],
      {
        id:   MODULE_GROUP_IDS.effects,
        type: "system"
      },
    );
  }

  async _buildStatusActions() {
    const statusActions = CONFIG.statusEffects.map( statusEffect => {
      const existingEffect = this.actor.effects.get( statusEffect._id );
      return {
        id:           statusEffect.id,
        name:         _loc( statusEffect.name ),
        cssClass:     !existingEffect ? "toggle" : "toggle active",
        onClick:      async () => {
          await this.actor.toggleStatusEffect( statusEffect.id, {} );
        },
      };
    } );

    this.actionHandler.addActions(
      statusActions,
      {
        id:   MODULE_GROUP_IDS.statusEffects,
        type: "system"
      }
    );
  }

}