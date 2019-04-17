import * as React from 'react';
import { render } from 'react-dom';
import { Collapse, Button } from 'antd';
import { based, IBaseComponentProps, withClickOutside } from '../src/';
import { test as testProxy } from './test-proxy';

import { toClass } from '../src/lib/util';

const Panel = Collapse.Panel;

testProxy();

interface IProps extends IBaseComponentProps {
  /**
   * 是否展现
   */
  visible?: boolean;

  /**
   * 文案
   */
  text?: string;
}

const Simple = function(props: IProps) {
  return props.visible ? (
    <div style={props.styles.button}>
      <Button onClick={props.onClick}>{props.text || '点我试试'}</Button>
    </div>
  ) : null;
};

function onClick(value) {
  console.log('当前点击：', value);
}

function onClickOutside(
  e: MouseEvent,
  isOutSide: boolean,
  detail: { [key: string]: boolean }
) {
  console.log('探测是否点在蒙层外:', isOutSide, detail);
}

const props: Partial<IProps> = {
  styles: {
    button: {
      width: '200px',
      height: '100px',
      backgroundColor: '#ccc'
    },
    absoluteWrap:{
      position: 'relative',
      width: '400px',
      height: '100px',
      backgroundColor: '#ccc'
    },
    absoluteButton:{
      position: 'absolute',
      left: '40px',
      top: '10px',
      width: '150px',
      height: '100px',
      backgroundColor: '#eee'
    }
  },
  visible: true,
  text: 'hahah'
};

const Wrapped = based(Simple as any);

const WrappedWithClickOutside = withClickOutside(Wrapped as any);


// 绝对定位
const SimpleAbsolute = function (props: IProps) {
  return props.visible ? (
    <div  style={props.styles.absoluteButton}>
      <Button onClick={props.onClick}>{props.text || '点我试试'}</Button>
    </div>
  ) : null;
};

const WrappedAbsouteWithClickOutside = withClickOutside(SimpleAbsolute);


render(
  <Collapse defaultActiveKey={['0']}>
    <Panel header="普通组件" key="0">
      <Wrapped {...props} onClick={onClick} />
    </Panel>
    <Panel header="modal 蒙层组件" key="1">
      <WrappedWithClickOutside
        onClick={onClickOutside}
        visible={true}
        autoHide={true}
        layerArea={{
          point: {
            x: 10,
            y: 140
          },
          size: {
            width: 600,
            height: 600
          }
        }}
        contentProps={props}
      />
    </Panel>
    <Panel header="modal 蒙层组件 (absolute)" key="2">
      <div style={props.styles.absoluteWrap}>
        <WrappedAbsouteWithClickOutside
          onClick={onClickOutside}
          visible={true}
          autoHide={true}
          layerArea={{
            point: {
              x: 10,
              y: 180
            },
            size: {
              width: 600,
              height: 600
            }
          }}
          contentProps={props}
        />
      </div>
    </Panel>


  </Collapse>,
  document.getElementById('example') as HTMLElement
);

// ======= 测试其他功能区 ============
