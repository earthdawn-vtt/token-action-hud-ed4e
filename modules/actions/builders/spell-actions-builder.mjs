import { BaseActionBuilder } from "./base-builder.mjs";
import { SPELL_CIRCLE_GROUP_ID } from "../../config/groups.mjs";

export class SpellActionsBuilder extends BaseActionBuilder {

  /** @inheritdoc */
  appliesToActor( actor ) {
    return actor.itemTypes[ ED4E_CONSTANTS.SYSTEM_TYPES.Item.spell ].length > 0;
  }

  /** @inheritdoc */
  async buildActions( actor, token ) {
    this.actor = actor;
    this.token = token;

    const spellsByCircle = {};
    for ( const spell of this.actor.itemTypes[ ED4E_CONSTANTS.SYSTEM_TYPES.Item.spell ] ) {
      const spellCircle = spell.system.level;
      if ( !spellsByCircle[ spellCircle ] ) {
        spellsByCircle[ spellCircle ] = [];
      }
      spellsByCircle[ spellCircle ].push( spell );
    }

    for ( const [ circle, spells ] of Object.entries( spellsByCircle ) ) {
      this.actionHandler.addActions(
        spells.map( spell => this._getSpellAction( spell ) ),
        {
          id:   SPELL_CIRCLE_GROUP_ID + circle,
          type: "system",
        },
      );
    }
  }

  _getSpellAction( spell ) {
    return {
      id:    spell.id,
      name:  spell.name,
      img:   spell.img,
      info1: {
        text:  CONFIG.ED4E.MAGIC.spellcastingTypes[ spell.system.spellcastingType ],
        title: _loc( "TokenActionHud.Actions.Infos.Title.spellcastingType" ),
        class: "tah-spotlight",
      },
      info2: {
        text: _loc(
          "TokenActionHud.Actions.Infos.Text.spellThreads",
          {
            required: spell.system.totalRequiredThreads,
            woven:    spell.system.wovenThreads,
          },
        ),
        title: _loc( "TokenActionHud.Actions.Infos.Title.spellThreads" ),
      },
      onClick: async () => {
        const continueWeaving = await ed4e.applications.global.PromptFactory.fromDocument(
          spell
        ).getPrompt(
          "continueWeavingSpell"
        );
        if ( continueWeaving === null ) return;
        await this.actor.castSpell( spell, { resetSpell: continueWeaving === false } );
      },
    };
  }
}