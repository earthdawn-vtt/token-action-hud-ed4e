import { BaseActionBuilder } from "./base-builder.mjs";
import { ACTION_IDS } from "../../config/actions.mjs";
import { CATEGORY_IDS, MODULE_GROUP_IDS } from "../../config/groups.mjs";

export class MultiTokenActionsBuilder extends BaseActionBuilder {

  async buildActions() {
    this.actors = this.actionHandler.actors;
    this.tokens = this.actionHandler.tokens;

    await this._buildRecoveryAction();
  }

  /**
   * Create an action for recovery tests.
   * @returns {ActionData}
   */
  async _buildRecoveryAction() {
    this.actionHandler.addActions(
      [ {
        id:      ACTION_IDS.recovery,
        name:    _loc( "TokenActionHud.Actions.Names.recovery" ),
        onClick: async () => {
          const recoveryMode = await this.actors[0].getPrompt( "recovery" );
          for ( const actor of this.actors ) {
            await actor.rollRecovery( recoveryMode );
          }
        },
      } ],
      {
        id:     MODULE_GROUP_IDS.other,
        nestId: `${ CATEGORY_IDS.general }_${ MODULE_GROUP_IDS.other }`,
        type:   "system",
      },
    );
  }

}