import * as systemSettings from "./settings.mjs";
import { getDefaults } from "../layout/defaults.mjs";
import { createActionHandler } from "../actions/action-handler.mjs";

export function createSystemManager( coreApi ) {
  return class SystemManagerEd extends coreApi.SystemManager {
    /** @inheritdoc */
    getActionHandler() {
      const ActionHandlerClass = createActionHandler( coreApi );
      return new ActionHandlerClass( this );
    }

    /** @inheritdoc */
    getRollHandler( rollHandlerId ) {
      return null;
    }

    /** @inheritdoc */
    registerSettings( onChangeFunction ) {
      systemSettings.register( onChangeFunction );
    }

    /** @inheritdoc */
    async registerDefaults() {
      return getDefaults();
    }

    /** @inheritdoc */
    registerStyles() {
      return super.registerStyles();
    }

  };
}