import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import { MainAreaWidget } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';

import RootWidget from './RootComponent';
import { extensionIcon } from './icons' ;

// import { requestAPI } from './handler';

/**
 * Initialization data for the thesis-extension extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'thesis-extension:plugin',
  autoStart: true,
  optional: [ILauncher],
  activate: (app: JupyterFrontEnd, launcher: ILauncher) => {
    const { commands } = app;
    const command = "thesis-extension";
    commands.addCommand(command, {
      caption: 'Data Explorer',
      label: 'Data Explorer',
      icon: extensionIcon,
      execute: () => {
        const content = new RootWidget(commands);
        const widget = new MainAreaWidget<RootWidget>({content});
        widget.title.label = "Data Explorer";
        widget.title.icon = extensionIcon;
        app.shell.add(widget, 'main');
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