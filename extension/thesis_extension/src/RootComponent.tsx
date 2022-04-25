import React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';

const RootComponent = () : JSX.Element => {
    return (
        <div>
            <p>This is a react component</p>
        </div>
    )
}

export class RootWidget extends ReactWidget {
    /**
     * Constructs a new CounterWidget.
     */
    constructor() {
      super();
      this.addClass('jp-ReactWidget');
    }
  
    render(): JSX.Element {
      return <RootComponent />;
    }
  }

export default RootWidget;