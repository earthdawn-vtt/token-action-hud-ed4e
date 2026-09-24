import { BaseActionBuilder } from "./base-builder.mjs";
import { CATEGORY_IDS, MATRIX_GROUP_ID, MODULE_GROUP_IDS } from "../../config/groups.mjs";
import { ACTION_IDS } from "../../config/actions.mjs";

export class MatrixActionsBuilder extends BaseActionBuilder {


  appliesToActor( actor ) {
    return actor.getMatrices().length > 0;
  }

  async buildActions( actor, token ) {
    this.actor = actor;
    this.token = token;

    this.actionHandler.addActions(
      this._getMatrixActions(),
      {
        id:   MODULE_GROUP_IDS.matrixActions,
        type: "system",
      }
    );

    for ( const matrix of this.actor.getMatrices() ) {
      const matrixGroupId = MATRIX_GROUP_ID + matrix.id;
      const matrixGroupData = this._getMatrixGroup( matrixGroupId, matrix );
      const matrixParentGroupData = {
        id:   CATEGORY_IDS.matrix,
      };

      this.actionHandler.addGroup( matrixGroupData, matrixParentGroupData, true, );
      this.actionHandler.addActions( this._getActionsForMatrix( matrix ), matrixGroupData, );
    }
  }

  _getMatrixGroup( matrixGroupId, matrix ) {
    const groupData = {
      id:       matrixGroupId,
      name:     matrix.name,
      type:     "system-derived",
      selected: true,
      info1:    {
        text:  matrix.system.matrixSpells.map( spell => spell.name ).join( "," ),
        class: "tah-spotlight",
      },
    };
    const activeSpell = this.actor.items.get( matrix.system.matrix.activeSpell );
    if ( activeSpell ) groupData.info2 = {
      text: _loc(
        "TokenActionHud.Actions.Infos.Text.spellThreads",
        {
          required: activeSpell.system.totalRequiredThreads,
          woven:    activeSpell.system.wovenThreads,
        },
      ),
    };
    return groupData;
  }


  _getMatrixActions() {
    return [
      {
        id:      ACTION_IDS.matrixAttuneAll,
        name:    _loc( "TokenActionHud.Actions.Names.matrixAttuneAll" ),
        onClick: async () => await this.actor.reattuneSpells(),
      },
      {
        id:      ACTION_IDS.matrixEmptyAll,
        name:    _loc( "TokenActionHud.Actions.Names.matrixEmptyAll" ),
        onClick: async () => await this.actor.emptyAllMatrices(),
      },
    ];
  }

  /**
   * Creates the actions for a single matrix group.
   * @param {Item} matrix
   * @returns {ActionData[]}
   */
  _getActionsForMatrix( matrix ) {
    const matrixActions = [
      {
        id:      `${ ACTION_IDS.matrixAttune }-${ matrix.id }`,
        name:    _loc( "TokenActionHud.Actions.Names.matrixAttune" ),
        onClick: async () => await this.actor.reattuneSpells( matrix.uuid ),
      },
    ];
    if ( matrix.system.matrixSpellId ) matrixActions.push(
      {
        id:      `${ ACTION_IDS.matrixCast }-${ matrix.id }`,
        name:    _loc( "TokenActionHud.Actions.Names.matrixCast" ),
        onClick: async () => await this.actor.castFromMatrix( matrix, matrix.system.matrixSpell, ),
      },
      {
        id:      `${ ACTION_IDS.matrixEmpty }-${ matrix.id }`,
        name:    _loc( "TokenActionHud.Actions.Names.matrixEmpty" ),
        onClick: async () => await matrix.system.removeSpells(),
      },
    );
    return matrixActions;
  }

}