import React, { useState, useCallback, useRef } from 'react';
import { render } from 'react-dom';
import { Collapse, Button, Input } from 'antd';
import {
  based,
  IBaseComponentProps,
  withClickOutside,
  IBaseConfig
} from '../src/';
import { test as testProxy } from './test-proxy';
import useComponentSize from '@rehooks/component-size';
import console = require('console');

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

  /**
   * 额外的数据
   */
  data?: object;
}

const Simple = function(props: IProps) {
  let ref = useRef(null);
  const { width, height } = useComponentSize(ref);

  const { data } = props;

  const onClickButton = useCallback(() => {
    console.log(`当前组件尺寸：(w: ${width}, h: ${height})`);
  }, [width, height]);
  return props.visible ? (
    <div
      ref={ref}
      style={Object.assign({}, props.styles.buttonWrap, {
        width: props.cWidth,
        height: props.cHeight
      })}
    >
      <Button onClick={onClickButton}>{props.text || '点我试试'}</Button>
      {(!!data && (
        <Input.TextArea autosize={true} value={JSON.stringify(data)} />
      )) ||
        null}
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
    buttonWrap: {
      width: '200px',
      height: '100px',
      backgroundColor: '#ccc'
    },
    absoluteWrap: {
      position: 'relative',
      width: '400px',
      height: '100px',
      backgroundColor: '#ccc'
    },
    absoluteButton: {
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

const defaultProps = {
  visible: true,
  text: 'with Default', // 这个会被覆盖
  data: {
    result: {
      msg: 'hello world'
    }
  }
};

const wrapConfig: IBaseConfig = {
  // 用于配置融合 rule，默认都是直接一次 assign
  mergeRule: {
    data: { level: 1 }
  }
};

const WrappedWithDefaultProps = based(Simple as any, defaultProps, wrapConfig);

const WrappedWithClickOutside = withClickOutside(Wrapped as any);

// 绝对定位
const SimpleAbsolute = function(props: IProps) {
  return props.visible ? (
    <div style={props.styles.absoluteButton}>
      <Button onClick={props.onClick}>{props.text || '点我试试'}</Button>
    </div>
  ) : null;
};

const WrappedAbsouteWithClickOutside = withClickOutside(SimpleAbsolute);

// 带绝对定位的蒙层 demo
const AbsoluteDemo = props => {
  const [show, setShow] = useState(false);

  const onClickBtn = useCallback(() => {
    setShow(true);
  }, []);

  const onOutside = useCallback(() => {
    setShow(false);
  }, []);
  console.log('[absolute demo]:', show);
  return (
    <div style={props.styles.absoluteWrap}>
      <WrappedAbsouteWithClickOutside
        onClick={onOutside}
        visible={show}
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
      <Button style={{ marginLeft: 400 }} onClick={onClickBtn}>
        点击显示蒙层
      </Button>
    </div>
  );
};

render(
  <Collapse defaultActiveKey={['normal-default']}>
    <Panel header="普通组件" key="normal">
      <Wrapped {...props} cHeight="300" onClick={onClick} />
    </Panel>
    <Panel header="普通组件 - 默认 props" key="normal-default">
      <WrappedWithDefaultProps
        {...props}
        data={{
          success: true
        }}
        cHeight="200"
        onClick={onClick}
      />
    </Panel>
    <Panel header="modal 蒙层组件" key="modal">
      <WrappedWithClickOutside
        onClick={onClickOutside}
        visible={true}
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
    <Panel header="modal 蒙层组件 (absolute)" key="modal-absolute">
      <AbsoluteDemo {...props} />
    </Panel>
  </Collapse>,
  document.getElementById('example') as HTMLElement
);

// ======= 测试其他功能区 ============
