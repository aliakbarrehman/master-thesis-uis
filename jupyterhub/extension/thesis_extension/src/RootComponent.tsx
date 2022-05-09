import React, { useState } from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import DataBlock from './DataBlock';
import DataForm from './DataForm';

import KernelModel from './model';

const RootComponent = ({ model, ...props }: any) : JSX.Element => {
    const [isAdmin, setIsAdmin] = useState<Boolean>(false);
    const [mspId, setMspId] = useState<string>('UiSMSP');

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

          <DataBlock mspId={mspId} isAdmin={isAdmin} model={model} />
        </div>
    )
}

export class RootWidget extends ReactWidget {
    private _model: KernelModel;
    /**
     * Constructs a new CounterWidget.
     */
    constructor(commands: any, model: KernelModel) {
      super();
      this.addClass('jp-ReactWidget');
      this._model = model;
    }
  
    render(): JSX.Element {
      return <RootComponent commands={null} model={this._model} />;
    }
  }

export default RootWidget;