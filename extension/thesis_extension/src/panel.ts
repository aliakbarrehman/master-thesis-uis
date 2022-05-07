import {
    SessionContext,
    ISessionContext,
    sessionContextDialogs,
  } from '@jupyterlab/apputils';
  
  import {
    ITranslator,
    nullTranslator,
    TranslationBundle,
  } from '@jupyterlab/translation';
  
  import { ServiceManager } from '@jupyterlab/services';
  
  import { Message } from '@lumino/messaging';
  
  import { StackedPanel } from '@lumino/widgets';
  
  import RootWidget from './RootComponent';
  
  import KernelModel from './model';
  
  /**
   * The class name added to the panels.
   */
  const PANEL_CLASS = 'jp-RovaPanel';
  
  /**
   * A panel which has the ability to add other children.
   */
  class ShellPanel extends StackedPanel {
    constructor(manager: ServiceManager.IManager, translator?: ITranslator) {
      super();
      this._translator = translator || nullTranslator;
      this._trans = this._translator.load('jupyterlab');
      this.addClass(PANEL_CLASS);
      this.id = 'data-explorer';
      this.title.label = this._trans.__('Data Explorer');
      this.title.closable = true;
  
      this._sessionContext = new SessionContext({
        sessionManager: manager.sessions,
        specsManager: manager.kernelspecs,
        name: 'DataExplorer Session',
      });
  
      this._model = new KernelModel(this._sessionContext);
      this._example = new RootWidget(null, this._model);
  
      this.addWidget(this._example);
      void this._sessionContext
        .initialize()
        .then(async (value) => {
          if (value) {
            await sessionContextDialogs.selectKernel(this._sessionContext);
          }
        })
        .catch((reason) => {
          console.error(
            `Failed to initialize the session in Shell Panel.\n${reason}`
          );
        });
    }
  
    get session(): ISessionContext {
      return this._sessionContext;
    }
  
    dispose(): void {
      this._sessionContext.dispose();
      super.dispose();
    }
  
    protected onCloseRequest(msg: Message): void {
      super.onCloseRequest(msg);
      this.dispose();
    }
  
    private _model: KernelModel;
    private _sessionContext: SessionContext;
    private _example: RootWidget;
  
    private _translator: ITranslator;
    private _trans: TranslationBundle;
  }
  
  export default ShellPanel;