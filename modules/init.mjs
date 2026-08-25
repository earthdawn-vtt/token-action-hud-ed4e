import { MODULE, REQUIRED_CORE_MODULE_VERSION } from "./config/system.mjs";
import { createSystemManager } from "./system/system-manager.mjs";

Hooks.once( "tokenActionHudCoreApiReady", async ( coreModule ) => {
  const module = game.modules.get( MODULE.ID );
  module.api = {
    requiredCoreModuleVersion: REQUIRED_CORE_MODULE_VERSION,
    SystemManager:             createSystemManager( coreModule.api ),
  };
  Hooks.call( "tokenActionHudSystemReady", module );
} );