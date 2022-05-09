import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
// import { MainAreaWidget } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';

// import RootWidget from './RootComponent';
import ShellPanel from './panel';
import { extensionIcon } from './icons' ;

import { ITranslator } from '@jupyterlab/translation';

// import { requestAPI } from './handler';

/**
 * Initialization data for the thesis-extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'thesis-extension:plugin',
  autoStart: true,
  optional: [ILauncher],
  activate: (app: JupyterFrontEnd, launcher: ILauncher, translator: ITranslator) => {
    const { commands, shell } = app;
    const manager = app.serviceManager;

    const command = "thesis-extension";
    commands.addCommand(command, {
      caption: 'Data Explorer',
      label: 'Data Explorer',
      icon: extensionIcon,
      execute: () => {
        const panel = new ShellPanel(manager, translator);
        shell.add(panel, 'main');
        return panel;
      }
    })
    
    if (launcher) {
      launcher.add({
        command,
        category: 'Other',
        rank: 1,
      })
    }
  }
};

export default plugin;
