import { BaseActionBuilder } from "./base-builder.mjs";
import { CATEGORY_IDS, MODULE_GROUP_IDS } from "../../config/groups.mjs";
import { ACTION_IDS } from "../../config/actions.mjs";

export class GeneralActionsBuilder extends BaseActionBuilder {

  /** @inheritdoc */
  appliesToActor( actor ) {
    return true;
  }

  /** @inheritdoc */
  async buildActions( actor, token ) {
    this.actor = actor;
    this.token = token;

    this._buildAttributeActions();
    this._buildOtherActions();
  }

  /**
   * Prepare actions for attributes.
   * @returns {ActionData[]}
   */
  _buildAttributeActions() {
    const attributeActions = [];
    for ( const [ attributeKey, attributeConfig ] of Object.entries( CONFIG.ED4E.ACTORS.attributes ) ) {
      attributeActions.push( {
        id:    attributeKey,
        name:  attributeConfig.label,
        info1: {
          text: _loc(
            "TokenActionHud.Actions.Infos.Text.attributeStep",
            { step: this.actor.system.attributes[attributeKey].step },
          ),
        },
        onClick: async () => {
          await this.actor.rollAttributeBased( attributeKey );
        },
      } );
    }

    this.actionHandler.addActions(
      attributeActions,
      {
        id:   MODULE_GROUP_IDS.attributes,
        type: "system",
      },
    );
  }

  _buildOtherActions() {
    const recoveryAction = this._getRecoveryAction();
    const useKarmaToggleAction = this._getUseKarmaToggleAction();

    this.actionHandler.addActions(
      [ recoveryAction, useKarmaToggleAction ],
      {
        id:     MODULE_GROUP_IDS.other,
        nestId: `${ CATEGORY_IDS.general }_${ MODULE_GROUP_IDS.other }`,
        type:   "system",
      },
    );
  }

  /**
   * Create an action for recovery tests.
   * @returns {ActionData}
   */
  _getRecoveryAction() {
    const recoveryResource = this.actor.system.characteristics.recoveryTestsResource;
    return {
      id:      ACTION_IDS.recovery,
      name:    _loc( "TokenActionHud.Actions.Names.recovery" ),
      info1:        {
        text:  `${ recoveryResource.value }/${ recoveryResource.max }`,
        title: _loc( "TokenActionHud.Actions.Infos.Titles.recoveryTestResource" ),
      },
      onClick: async () => {
        const recoveryMode = await this.actor.getPrompt( "recovery" );
        await this.actor.rollRecovery( recoveryMode );
      },
    };
  }

  /**
   * Create a toggleable action to always use karma.
   * @returns {ActionData}
   */
  _getUseKarmaToggleAction() {
    return {
      id:       ACTION_IDS.useKarma,
      name:     _loc( "TokenActionHud.Actions.Names.useKarma" ),
      cssClass: this.actor.system.karma?.useAlways ? "toggle active" : "toggle",
      onClick:  async () => {
        await this.actor.update( { "system.karma.useAlways": !this.actor.system.karma.useAlways } );
      },
    };
  }

}