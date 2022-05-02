import React, { useState } from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import DataBlock from './DataBlock';
import DataForm from './DataForm';

const RootComponent = (commands: any) : JSX.Element => {
    const [isAdmin, setIsAdmin] = useState<Boolean>(false);
    const [mspId, setMspId] = useState<string>('UiSMSP');

    debugger;
    return (
        <div>
          <div className='input-group'>
            <p className='label'>MSP ID</p>
            <input type={'text'} className={'text-input'} onChange={(e) => setMspId(e.target.value)} />
          </div>
          <div className='input-group'>
            <p className='label'>Is Admin</p>
            <input type={'checkbox'} className={'admin-selector'} onChange={() => setIsAdmin(!isAdmin)} />
          </div>
          {isAdmin ? <DataForm mspId={mspId} /> : <></>}

          <DataBlock commands={commands} mspId={mspId} isAdmin={isAdmin} />
        </div>
    )
}

export class RootWidget extends ReactWidget {
    private commands: any;
    /**
     * Constructs a new CounterWidget.
     */
    constructor(commands: any) {
      super();
      this.addClass('jp-ReactWidget');
      this.commands = commands;
    }
  
    render(): JSX.Element {
      return <RootComponent commands={this.commands} />;
    }
  }

export default RootWidget;