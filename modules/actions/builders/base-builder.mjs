export class BaseActionBuilder {

  constructor( actionHandler, coreApi ) {
    this.actionHandler = actionHandler;
    this.coreApi = coreApi;
  }

  /**
   * Determine if this builder applies to a specific actor.
   * @param {ActorEd} actor
   * @returns {boolean} True if this class builds actions for the given actor. False otherwise.
   */
  appliesToActor( actor ) {
    return true;
  }

  /**
   * Render the document sheet for the given document if the click event causes `isRenderItem` to be `true`.
   * @param {Document} document
   * @returns {boolean} True if the sheet was rendered. False otherwise.
   */
  renderDocumentSheet( document=null ) {
    if ( this.actionHandler.hudManager.isRenderItem() && document?.sheet ) {
      document.sheet.render( { force: true } );
      return true;
    }
    return false;
  }

  /**
   * @abstract
   * @param {Actor} [actor]
   * @param {TokenDocument} [token]
   */
  async buildActions( actor, token ) {
    throw new Error( "buildActions must be implemented by a subclass" );
  }
}