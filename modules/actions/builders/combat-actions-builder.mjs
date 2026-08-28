import { BaseActionBuilder } from "./base-builder.mjs";
import { ACTION_IDS } from "../../config/actions.mjs";
import { MODULE_GROUP_IDS } from "../../config/groups.mjs";

export class CombatActionsBuilder extends BaseActionBuilder {

  /** @inheritdoc */
  appliesToActor( actor ) {
    return true;
  }

  /** @inheritdoc */
  async buildActions( actor, token ) {
    this.actor = actor;
    this.token = token;

    this.actionHandler.addActions(
      this._getAttackActions(),
      {
        id:   MODULE_GROUP_IDS.attacks,
        type: "system",
      },
    );

    this.actionHandler.addActions(
      this._getCombatActions(),
      {
        id:   MODULE_GROUP_IDS.combatActions,
        type: "system",
      },
    );
  }

  /**
   * Create the actions for the different attack types.
   * @returns {ActionData[]}
   */
  _getAttackActions() {
    return [ "melee", "ranged", "unarmed" ].map( attackType => {
      const attackKey = `${ attackType }Attack`;
      return {
        id:      ACTION_IDS[ attackKey ],
        name:    _loc( `TokenActionHud.Actions.Names.${ attackKey }` ),
        onClick: async () => {
          await this.actor.attack( attackType );
        },
      };
    } );
  }

  /**
   * Creates the combat utility actions.
   * @returns {ActionData[]}
   */
  _getCombatActions() {
    const combatActions = [
      {
        id:           ACTION_IDS.takeDamage,
        name:         _loc( "TokenActionHud.Actions.Names.takeDamage" ),
        onClick:      async () => {
          const takeDamage = await this.actor.getPrompt( "takeDamage" );
          if ( !takeDamage || takeDamage === "close" ) return;

          await this.actor.takeDamage( takeDamage.damage, {
            isStrain:     false,
            damageType:   takeDamage.damageType,
            armorType:    takeDamage.armorType,
            ignoreArmor:  takeDamage.ignoreArmor,
          } );
        },
      },
      {
        id:           ACTION_IDS.knockdownTest,
        name:         _loc( "TokenActionHud.Actions.Names.knockdownTest" ),
        onClick:      async () => {
          await this.actor.knockdownTest( 0 );
        }
      },
      {
        id:           ACTION_IDS.jumpUp,
        name:         _loc( "TokenActionHud.Actions.Names.jumpUp" ),
        onClick:      async () => {
          await this.actor.jumpUp();
        }
      },
    ];
    if ( game.combat?.current?.tokenId === this.token?.id ) combatActions.push( {
      id:      ACTION_IDS.endTurn,
      name:    _loc( "TokenActionHud.Actions.Names.endTurn" ),
      onClick: async () => {
        await game.combat.nextTurn();
      }
    } );

    return combatActions;
  }

}