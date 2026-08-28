import { BaseActionBuilder } from "./base-builder.mjs";
import { ITEM_STATUS_ICONS } from "../../config/ed4e.mjs";

export class InventoryBuilder extends BaseActionBuilder {

  /** @inheritdoc */
  appliesToActor( actor ) {
    return true;
  }

  async buildActions( actor, token ) {
    this.actor = actor;
    this.token = token;

    if ( this.actor.items.size < 1 ) return;

    const relevantItems = this.actor.items.filter( this._isInventoryItem );
    const itemActionsByGroup = {};
    for ( const item of relevantItems ) {
      if ( !itemActionsByGroup[ item.type ] ) itemActionsByGroup[ item.type ] = [];
      itemActionsByGroup[ item.type ].push( this._getItemAction( item ) );
    }

    for ( const [ group, actions ] of Object.entries( itemActionsByGroup ) ) {
      this.actionHandler.addActions(
        actions,
        {
          id:   `Item-${ group }`,
          type: "system",
        },
      );
    }

  }

  _isInventoryItem( item ) {
    const itemSystemTypes = ED4E_CONSTANTS.SYSTEM_TYPES.Item;
    return [
      itemSystemTypes.armor,
      itemSystemTypes.equipment,
      itemSystemTypes.shield,
      itemSystemTypes.weapon,
    ].includes( item.type );
  }

  /**
   * Create an action for an item.
   * @param {Item} item
   * @returns {ActionData}
   */
  _getItemAction( item ) {
    return {
      id:             item.id,
      name:           item.name,
      tooltip:        item.system.summary.value || item.system.description.value,
      icon1:          this._getItemStatusIcon( item ),
      img:            item.img,
      ...this._getItemInfos( item ),
      onClick:        async () => {
        if ( this.renderDocumentSheet( item ) ) return;
        this.actor.rotateItemStatus( item.id, );
      },
    };
  }

  /**
   * Get the icon for the item status as used in the ed4e system on actor sheets, indicating the item status.
   * @param {string} item The item to get the icon for.
   * @returns {string}
   */
  _getItemStatusIcon( item ) {
    return `<i class="${ ITEM_STATUS_ICONS[ item.type ][ item.system.itemStatus ] }" title="${ CONFIG.ED4E.ITEMS.itemStatus[ item.system.itemStatus ] }"></i>`;
  }

  /**
   * Get additional information for the item action.
   * @param {Item} item
   * @returns {Record<key, ActionInfoData>}
   */
  _getItemInfos( item ) {
    const itemSystemTypes = ED4E_CONSTANTS.SYSTEM_TYPES.Item;
    return {
      [ itemSystemTypes.armor ]:     this._getArmorInfo,
      [ itemSystemTypes.equipment ]: this._getEquipmentInfo,
      [ itemSystemTypes.shield ]:    this._getShieldInfo,
      [ itemSystemTypes.weapon ]:    this._getWeaponInfo,
    }[ item.type ]?.( item ) ?? {};
  }

  /**
   * Get the info data for an armor item.
   * @param {Item} item The armor item.
   * @returns {Record<key, ActionInfoData>}
   */
  _getArmorInfo( item ) {
    return {
      info1: {
        text:  _loc(
          "TokenActionHud.Actions.Infos.Text.physicalArmor",
          { armor: item.system.physical.armor, forgeBonus: item.system.physical.forgeBonus }
        ),
      },
      info2: {
        text:  _loc(
          "TokenActionHud.Actions.Infos.Text.mysticArmor",
          { armor: item.system.mystical.armor, forgeBonus: item.system.mystical.forgeBonus }
        ),
      }
    };
  }

  /**
   * Get the info data for an equipment item.
   * @param {Item} item The equipment item.
   * @returns {Record<key, ActionInfoData>}
   */
  _getEquipmentInfo( item ) {
    if ( item.system.amount <= 1 ) return {};
    return {
      info1: {
        text:  _loc( "TokenActionHud.Actions.Infos.Text.equipmentAmount", { amount: item.system.amount } ),
        title: _loc( "TokenActionHud.Actions.Infos.Titles.equipmentAmount" ),
      },
    };
  }

  /**
   * Get the info data for a shield item.
   * @param {Item} item The shield item.
   * @returns {Record<key, ActionInfoData>}
   */
  _getShieldInfo( item ) {
    return {
      info1: {
        text:  _loc( "TokenActionHud.Actions.Infos.Text.shieldPhysical", { physical: item.system.defenseBonus.physical, } ),
        title: _loc( "TokenActionHud.Actions.Infos.Titles.shieldPhysical" ),
      },
      info2: {
        text:  _loc( "TokenActionHud.Actions.Infos.Text.shieldMystical", { mystical: item.system.defenseBonus.mystical, } ),
        title: _loc( "TokenActionHud.Actions.Infos.Titles.shieldMystical" ),
      },
      info3: {
        text:  `${ item.system.shatterThreshold }`,
        title: _loc( "TokenActionHud.Actions.Infos.Titles.shieldShatterThreshold" ),
      },
    };
  }

  /**
   * Get the info data for a weapon item.
   * @param {Item} item The weapon item.
   * @returns {Record<key, ActionInfoData>}
   */
  _getWeaponInfo( item ) {
    const infoData = {
      info1: {
        text:  `${ item.system.damageTotal }`,
        title: _loc( "TokenActionHud.Actions.Infos.Titles.weaponTotalDamage" ),
      },
    };
    if ( item.system.isRanged ) {
      const weaponRange = item.system.range;
      infoData.info2 = {
        text:  _loc(
          "TokenActionHud.Actions.Infos.Text.weaponRange",
          {
            shortMin: weaponRange.shortMin,
            shortMax: weaponRange.shortMax,
            longMin:  weaponRange.longMin,
            longMax:  weaponRange.longMax,
          }
        ),
        title: _loc( "TokenActionHud.Actions.Infos.Titles.weaponRange" ),
      };
      infoData.info3 = {
        text:  CONFIG.ED4E.ITEMS.ammunitionType[ item.system.ammunition.type ],
        title: _loc( "TokenActionHud.Actions.Infos.Titles.weaponAmmunitionType" ),
      };
    }

  }

}