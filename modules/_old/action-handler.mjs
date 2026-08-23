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
 * @property {string} encodedValue The value passed to the {@link RollHandler} when an action is clicked.
 * @property {string} [cssClass] The CSS class applied to the button.
 * @property {string} [icon] The icon displayed on the button in HTML format,
 * e.g., `<i class="fas fa-plus" title="Bonus"></i>`.
 * @property {string} [img] The image displayed on the button. See {@link coreModule.api.Utils#getImage} for respecting
 * TAH Core's 'Display Icons' module setting.
 * @property {ActionInfoData} [info1] The first info displayed on the button.
 * @property {ActionInfoData} [info2] The second info displayed on the button.
 * @property {ActionInfoData} [info3] The third info displayed on the button.
 * @property {boolean} [seleced] Whether the action is selected in the HUD.
 * @property {object} [system] Used to store additional properties.
 * @property {ActionTooltipData} [tooltip] The tooltip displayed when hovering the button.
 * @property {function} [onClick] Function to execute when the action is clicked.
 * @property {function} [onHover] Function to execute when the action is hovered.
 */

export let ActionHandler = null;

Hooks.once( "tokenActionHudCoreApiReady", async ( coreModule ) => {
  ActionHandler = class ActionHandlerEd extends coreModule.api.ActionHandler {

    // region Properties

    allowedActorTypes;

    // endregion

    constructor( ...args ) {
      super( ...args );

      const systemActorTypes = ED4E_CONSTANTS.SYSTEM_TYPES.Actor;
      this.allowedActorTypes = [
        systemActorTypes.creature,
        systemActorTypes.dragon,
        systemActorTypes.horror,
        systemActorTypes.npc,
        systemActorTypes.pc,
        systemActorTypes.spirit,
      ];
    }

    // region Accessors

    /**
     * The selected actor(s) in an array. To ensure an array if there is only one actor selected.
     * @returns {Actor[]}
     */
    get actorArray() {
      return this.actors ?? [ this.actor ];
    }

    /**
     * The selected token(s) in an array. To ensure an array if there is only one token selected.
     * @returns {TokenDocument[]}
     */
    get tokenArray() {
      return this.tokens ?? [ this.token ];
    }

    // endregion

    // region Building Actions

    async buildSystemActions( groupIds ) {

      // region Initialization

      if ( this.actor ) {
        this.items = coreModule.api.Utils.sortItemsByName( this.actor.items );
      }

      // endregion

      // region Build Actions

      if ( this.actor ) await this.#buildSingleActorActions();
      else await this.#buildMultipleTokenActions();

      // endregion

    }

    async #buildSingleActorActions() {}

    async #buildMultipleTokenActions() {

    }

    #buildOtherCategory() {
      if ( !this.actor ) return;

      // region Recovery

      const recoveryResource = this.actor.system.characteristics.recoveryTestsResource;
      const actions = [ {
        id: "recovery",
        name: "ED.Actor.Buttons.recovery",
        info1:        {
          text: `${ recoveryResource.value }/${ recoveryResource.max }`,
          title: this.i18n.localize( "TokenActionHud.Actions.Infos.Titles.recoveryTestResource" ),
        },
        icon:    `<i class="fas ${ CONFIG.ED4E.SYSTEM.icons.recovery }"></i>`,
        onClick: async () => {
          const recoveryMode = await this.actor.getPrompt( "recovery" );
          this.actor.rollRecovery( recoveryMode );
        }
      } ];

      // endregion

      this.addActions( actions, { id: "other", type: "system" } );
    }

    /**
     * @returns {ActionData[]}
     */
    #buildUtilityCategory() {
      const actions = [
        {
          id:      "initiative",
          name:    _loc( "ED.Actor.Initiative.roll" ),
          icon:    `<i class="fas ${ CONFIG.ED4E.SYSTEM.icons.initiative }"></i>`,
          tooltip: {
            content: `<p>${ _loc( "ED.Actor.Initiative.roll" ) }</p>`,
          },
          onClick: async () => {
            if ( game.combat ) {
              game.combat.rollInitiative(
                this.tokenArray.map( token => {
                  return game.combat.getCombatantsByToken( token );
                } ).flat(),
              );
            } else {
              foundry.documents.TokenDocument.implementation.createCombatants(
                this.tokens ?? [ this.token ],
              );
            }
          }
        }
      ];
      if (  )
    }

    // endregion

    // region Actions

    async #buildActions ( items, groupData, actionType = "item" ) {
      /*/ / Exit if there are no items
      if ( items.size === 0 ) return;

      // Exit if there is no groupId
      const groupId = ( typeof groupData === "string" ? groupData : groupData?.id );
      if ( !groupId ) return; */

      // Get actions
      const actions = await Promise.all(
        this.actor?.itemTypes.talent.map( async item => await this.#getAction( item ) )
      );

      // Add actions to action list
      this.addActions( actions, { id: "talents", type: "system" } );
    }

    /**
     * 
     * @param entity
     * @returns {Promise<ActionData>}
     */
    async #getAction( entity ) {
      console.debug( "ActionHandlerEd | #getAction" );

      const id = entity.id ?? entity._id;

      return {
        id,
        name:         entity.name,
        encodedValue: [ entity.type, id ].join( this.delimiter ),
        img:          entity.img,
        ...this.#getItemInfoData( entity ),
        onClick:      async ( param1, param2, param3 ) => {
          console.debug( "ActionHandlerEd | #getAction | onClick" );
          console.debug( "ActionHandlerEd | #getAction | this: ", this );
          console.debug( "ActionHandlerEd | #getAction | param1: ", param1 );
          console.debug( "ActionHandlerEd | #getAction | param2: ", param2 );
          console.debug( "ActionHandlerEd | #getAction | param3: ", param3 );
        }
      };
    }

    /**
     *
     * @param item
     * @returns {{ info1: ActionInfoData, info2: ActionInfoData, info3: ActionInfoData}}
     */
    #getItemInfoData( item ) {
      /** @type {ActionInfoData} */ let info1;
      /** @type {ActionInfoData} */ let info2;
      /** @type {ActionInfoData} */ let info3;

      const itemTypes = ED4E_CONSTANTS.SYSTEM_TYPES.Item;

      switch ( item.type ) {
        case itemTypes.devotion:
        case itemTypes.talent:
        case itemTypes.skill:
          info1 = {
            text:  `${ item.system.rankFinal}`,
            title: _loc( "ED.Actor.Header.rank" ),
          };
          info2 = {
            text:  CONFIG.ED4E.ACTORS.attributes[ item.system.attribute ]?.abbreviation.toUpperCase() ?? "",
            title: _loc( "ED.Actor.Header.attribute" ),
          };
          if ( item.system.strain > 0 ) {
            info3 = {
              text:  `${ item.system.strain }`,
              title: _loc( "ED.Actor.Header.strain" ),
            };
          }
          break;
        case itemTypes.power:
          info1 = {
            text:  `${ item.system.rankFinal }`,
            title: _loc( "ED.Actor.Header.step" ),
          };
          info2 = {
            text:  CONFIG.ED4E.ACTORS.attributes[ item.system.attribute ]?.abbreviation.toUpperCase() ?? "",
            title: _loc( "ED.Actor.Header.attribute" ),
          };
          if ( item.system.strain > 0 ) {
            info3 = {
              text:  `${ item.system.strain }`,
              title: _loc( "ED.Actor.Header.strain" ),
            };
          }
          break;
        default:
          break;
      }

      return { info1, info2, info3 };
    }

    // endregion

    // region Get Stuff

    // endregion
  };
} );