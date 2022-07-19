import React from 'react';
import { VERSION } from '@twilio/flex-ui';
import { FlexPlugin } from '@twilio/flex-plugin';

import { initializeStrings } from './strings';
import { initializeListeners } from './listeners';
import { registerHandlebarsHelpers } from './helpers/handlebars';
import holdTimeReducer from "./reducers/holdTimeReducer";

const PLUGIN_NAME = 'HoldTimePlugin';

export default class HoldTimePlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  init(flex, manager) {
    initializeStrings();

    initializeListeners();

    registerHandlebarsHelpers();

    manager.store.addReducer("holdTimeTracker", holdTimeReducer);
  }

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
 
}
