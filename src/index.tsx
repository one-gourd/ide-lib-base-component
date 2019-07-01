// import * as React from 'react';
// import { render } from 'react-dom';
// import Hello from './components/Hello';

// render(
//   <Hello name="TypeScript" enthusiasmLevel={10} />,
//   document.getElementById('example') as HTMLElement
// );

export * from './BaseComponent/';
export * from './BaseComponent/mods/ClickOutsideWrap/styles';
export * from './BaseComponent/schema/';
export * from './BaseComponent/schema/util';
export * from './BaseComponent/schema/stores';

export * from './BaseComponent/router/';
export * from './BaseComponent/controller/util';

export * from './BaseComponent/mods/';
export * from './lib/util';
export * from './lib/useDataFetch'

/* ----------------------------------------------------
    公共外部组件
----------------------------------------------------- */

import useComponentSize from '@rehooks/component-size';

export { useComponentSize };
