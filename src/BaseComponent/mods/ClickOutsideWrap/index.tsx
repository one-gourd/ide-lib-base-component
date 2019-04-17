import React, { useCallback, useRef, useState, useEffect } from 'react';

import { getValueByPath, invariant } from 'ide-lib-utils';

import { getDisplayName, toClass } from '../../../lib/util';
import { debugMini } from '../../../lib/debug';
import { IBaseComponentProps } from '../../index';
import {
  // StyledModalLayer,
  StyledModalContaner,
  StyledContentWrap,
  StyledModalCanvas
} from './styles';

interface IArea {
  point: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
}

interface IClickOutsideProps {
  /**
   * mask 是否可见
   */
  visible: boolean;

  /**
   * 点击背景是否自动隐藏
   */
  autoHide: boolean;

  // /**
  //  * 弹层 z-index 属性
  //  */
  // zIndex?: number;

  /**
   * 背景色
   */
  bgColor?: string;

  /**
   * layer 区域配置
   */
  layerArea?: IArea;

  /**
   * 点击 modal 区域的的时候进行探测
   */
  onClick: (
    e: MouseEvent,
    isOutSide: boolean,
    detail: { [key: string]: boolean }
  ) => void;

  contentProps: IBaseComponentProps;
}

const defaultProps: Partial<IClickOutsideProps> = {
  visible: false,
  autoHide: true,
  layerArea: {
    point: {
      x: 0,
      y: 0
    },
    size: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  },
  bgColor: 'rgba(0,0,0, 0.3)'
};

export function withClickOutside(ModalContent: React.SFC<IBaseComponentProps>, refModalName: string|string []) {

  invariant(!!refModalName, '[withClickOutside] 必须传入目标节点的 ref 字符/路径串')
  const ClickOutsideWrap = function(props: IBaseComponentProps) {
    const {
      zIndex,
      visible,
      layerArea,
      bgColor,
      onClick,
      autoHide,
      contentProps
    } = Object.assign({}, defaultProps, props);

    const refContent = useRef(null);
    const refCanvas = useRef(null);

    const ClassedModalContent = toClass(ModalContent);
    const [show, setShow] = useState(visible);

    const isOutSide = useCallback((e: MouseEvent, area: IArea) => {
      // 获取当前元素的宽、高；
      const w = area.size.width;
      const h = area.size.height;

      const x = area.point.x;
      const y = area.point.y; // 元素起点位置

      const { clientX, clientY } = e; // 鼠标点击位置

      // 点击位置落在区域外，需要考虑 modal 容器
      return !(
        clientX > x &&
        clientX < x + w &&
        clientY > y &&
        clientY < y + h
      );
    }, []);
    
    const getArea = useCallback((refContent: React.MutableRefObject <any>)=>{

      let refModalNamePath: string = '';
      
      [].concat(refModalName).forEach((name)=>{
        refModalNamePath += `.refs.${name}`;
      });
      const targetNode = getValueByPath(refContent.current, refModalNamePath);
      const rect = targetNode && targetNode.getBoundingClientRect();

        const area: IArea =  {
          point: {
            x: rect.left,
            y: rect.top
          },
          size: {
            width: rect.width,
            height: rect.height
          }
        };

        return area;
        
    }, []);

    useEffect(()=>{
      if (!refContent || !refContent.current) return;
      const ctx = refCanvas.current.getContext("2d");
      ctx.fillStyle = bgColor;//设置填充色（可以是渐变色或半透明色）
      ctx.rect(0, 0, layerArea.size.width, layerArea.size.height);
      ctx.fill(); //替代fillRect();
      const contentArea = getArea(refContent);
      // 注意：镂空的区域，需计算出相对于内容节点的位置
      ctx.clearRect(contentArea.point.x - layerArea.point.x, contentArea.point.y - layerArea.point.y, contentArea.size.width, contentArea.size.height); // 镂空区域
    }, [bgColor, layerArea]);

    const onClickModal = useCallback(
      (refContent: React.RefObject<HTMLElement>) => (e: MouseEvent) => {
        if (!visible) return;
        if (!refContent || !refContent.current) return;

        const contentArea = getArea(refContent);
        const isOutsideContent = isOutSide(e, contentArea); // 判断是否在 内容外
        const isOutsideLayer = isOutSide(e, layerArea); // 判断是否在蒙层外

        const isValideOutside = isOutsideContent && !isOutsideLayer;
        debugMini(
          `[onClickOutside] content area: ${JSON.stringify(
            contentArea
          )}; layer area: ${JSON.stringify(layerArea)};`
        );

        debugMini(
          `[onClickOutside] judge result: ${isValideOutside}; (outside content: ${isOutsideContent}, outside layer: ${isOutsideLayer});`
        );
        // 是否在蒙层外
        onClick &&
          onClick(e, isValideOutside, {
            content: isOutsideContent,
            layer: isOutsideLayer
          });

        if (autoHide && isValideOutside) {
          setShow(false);
        }
      },
      [onClick, visible]
    );

    return (
      <StyledModalContaner>
        {/* <StyledModalLayer
          className="modal-layer"
          visible={show}
          zIndex={zIndex}
          layerArea={layerArea}
          color={bgColor}
          onClick={onClickModal(refContent)}
        /> */}
        <StyledModalCanvas
          className="canvas-layer"
          visible={show}
          zIndex={zIndex}
          layerArea={layerArea}
          width={layerArea.size.width}
          height={layerArea.size.height}
          onClick={onClickModal(refContent)}
          ref={refCanvas}/>

          <ClassedModalContent ref={refContent} {...contentProps} />
      </StyledModalContaner>
    );
  };

  ClickOutsideWrap.displayName = `OutsideWrap${getDisplayName(ModalContent)}`;
  return ClickOutsideWrap;
}
