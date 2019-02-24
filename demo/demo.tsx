import * as React from 'react';
import { render } from 'react-dom';
import { Button } from 'antd';
import { based, IBaseComponentProps } from '../src/';

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

const Simple = function (props: IProps) {
  return props.visible ? <div style={props.styles.button}>
      <Button onClick={props.onClick}>
        {props.text || '点我试试'}
      </Button>
    </div> : null
}

function onClick(value) {
  console.log('当前点击：', value);
}

const props: Partial<IProps> = {
  styles: {
    button: {
      width: '200px',
      height: '100px',
      backgroundColor: '#ccc'
    }
  },
  visible: true,
  text: 'hahah'
}

const Wrapped = based(Simple as any);

render(<Wrapped {...props} onClick={onClick} />, document.getElementById(
  'example'
) as HTMLElement);