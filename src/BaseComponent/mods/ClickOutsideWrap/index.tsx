import React, { useCallback, useRef, useState } from 'react';

import { getDisplayName } from '../../../lib/util';
import { debugMini } from '../../../lib/debug';
import { IBaseComponentProps } from '../../index';
import {
  StyledModalLayer,
  StyledModalContaner,
  StyledContentWrap
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

  /**
   * 弹层 z-index 属性
   */
  zIndex?: number;

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
  zIndex: 99,
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

export function withClickOutside(ModalContent: React.SFC<IBaseComponentProps>) {
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

    const onClickModal = useCallback(
      (refContent: React.RefObject<HTMLElement>) => (e: MouseEvent) => {
        if (!visible) return;
        if (!refContent || !refContent.current) return;

        // console.log(444, refContent.current);
        // 获取内容区域的尺寸
        const rect = refContent.current.getBoundingClientRect();

        const contentArea = {
          point: {
            x: rect.left,
            y: rect.top
          },
          size: {
            width: rect.width,
            height: rect.height
          }
        };
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

        if (autoHide) {
          setShow(false);
        }
      },
      [onClick, visible]
    );

    return (
      <StyledModalContaner>
        <StyledModalLayer
          className="modal-layer"
          visible={show}
          zIndex={zIndex - 1}
          layerArea={layerArea}
          color={bgColor}
          onClick={onClickModal(refContent)}
        />
        <StyledContentWrap visible={show} ref={refContent} zIndex={zIndex}>
          <ModalContent {...contentProps} />
        </StyledContentWrap>
      </StyledModalContaner>
    );
  };

  ClickOutsideWrap.displayName = `OutsideWrap${getDisplayName(ModalContent)}`;
  return ClickOutsideWrap;
}
