import { BaseActionBuilder } from "./base-builder.mjs";
import { CATEGORY_IDS } from "../../config/groups.mjs";

export class ActionAbilityBuilder extends BaseActionBuilder {

  /**
   * @inheritdoc
   * @param {string} abilitySystemType The system document item type of the abilities the actions are created for.
   */
  constructor( actionHandler, coreApi, abilitySystemType ) {
    super( actionHandler, coreApi );
    this.abilitySystemType = abilitySystemType;
  }

  /** @inheritdoc */
  appliesToActor( actor ) {
    const actorSystemTypes = ED4E_CONSTANTS.SYSTEM_TYPES.Actor;
    return [
      actorSystemTypes.pc,
      actorSystemTypes.npc,
      actorSystemTypes.creature,
      actorSystemTypes.dragon,
      actorSystemTypes.horror,
      actorSystemTypes.spirit,
    ].includes( actor?.type );
  }

  /** @inheritdoc */
  async buildActions( actor, token ) {
    this.actor = actor;
    this.token = token;

    const abilities = actor.itemTypes[this.abilitySystemType];
    if ( !abilities ) return;

    const actionsByGroup = this._getActionsByGroup( abilities );

    for ( const [ group, actions ] of Object.entries( actionsByGroup ) ) {
      this.actionHandler.addActions(
        actions,
        {
          id:     group,
          nestId: `${ CATEGORY_IDS[ this.abilitySystemType ] }_${ group }`,
          type:   "system",
        },
      );
    }
  }

  /**
   * Prepares action data for each ability for each group it's assigned to.
   * @param {Item[]} abilities The abilities to prepare action data for.
   * @returns {Record<string,ActionData[]>} The prepared actions by group.
   */
  _getActionsByGroup( abilities ) {
    const actionsByGroup = {};
    for ( const ability of abilities ) {
      const id = ability.id ?? ability._id;

      const action = {
        id,
        name:         ability.name,
        tooltip:      ability.system.summary.value || ability.system.description.value,
        encodedValue: [ ability.type, id ].join( this.delimiter ),
        img:          ability.img,
        ...this._getAbilityInfoData( ability ),
        onClick:      async () => {
          if ( this.renderDocumentSheet( ability ) ) return;
          await ability.system.roll?.();
        },
        /* onHover:      async () => {
          const knacks = this._getKnackAbilities( ability );
          if ( !knacks ) return;
          ui.notifications.info( `Knacks coming soon. Available knacks:\n${ knacks.map( knack => knack.name ).join( "\n" ) }` );
        }, */
      };

      actionsByGroup[ability.system.action] ??= [];
      actionsByGroup[ability.system.action].push( action );
    }
    return actionsByGroup;
  }

  _getAbilityInfoData( item ) {
    /** @type {ActionInfoData} */ let info1;
    /** @type {ActionInfoData} */ let info2;
    /** @type {ActionInfoData} */ let info3;

    const itemTypes = ED4E_CONSTANTS.SYSTEM_TYPES.Item;

    switch ( item.type ) {
      case itemTypes.devotion:
      case itemTypes.talent:
      case itemTypes.skill:
      case itemTypes.power:
        info1 = {
          text:  `${ item.system.rankFinal }`,
          title: _loc( "ED.Actor.Header.step" ),
        };
        info2 = {
          text:  CONFIG.ED4E.ACTORS.attributes[item.system.attribute]?.abbreviation.toUpperCase() ?? "",
          title: _loc( "ED.Actor.Header.attribute" ),
        };
        if ( item.system.strain > 0 ) {
          info3 = {
            text:  `${ item.system.strain }`,
            icon:  `<i class="fa-thin fa-droplet" title="${ _loc( "ED.Actor.Header.strain" ) }"></i>`,
            title: _loc( "ED.Actor.Header.strain" ),
            class: "tah-spotlight",
          };
        }
        break;
      default:
        break;
    }

    return { info1, info2, info3 };
  }

  _getKnackAbilities( ability ) {
    return this.actor?.itemTypes[ ED4E_CONSTANTS.SYSTEM_TYPES.Item.knackAbility ]?.filter(
      knack => knack.system.sourceItem === ability.system.edid
    ) || [];
  }

}