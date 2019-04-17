import styled from 'styled-components';
import { IBaseStyledProps } from '../../index';

interface IStyledProps extends IBaseStyledProps {}

export const StyledModalContaner = styled.div.attrs({
  style: (props: IStyledProps) => props.style || {} // 优先级会高一些，行内样式
})<IStyledProps>`
  width: auto;
`;

export const StyledContentWrap = styled.div.attrs({
  style: (props: IStyledProps) => props.style || {} // 优先级会高一些，行内样式
})<IStyledProps>`
`;

// export const StyledModalLayer = styled.div.attrs({
//   style: (props: IStyledProps) => props.style || {} // 优先级会高一些，行内样式
// })<IStyledProps>`
//   position: fixed;
//   visibility: hidden;
//   top: ${(props: IStyledProps) =>
//     props.layerArea ? `${props.layerArea.point.y}px` : '0'};
//   left: ${(props: IStyledProps) =>
//     props.layerArea ? `${props.layerArea.point.x}px` : '0'};
//   z-index: ${(props: IStyledProps) => (props.zIndex || 1)};
//   display: ${(props: IStyledProps) => (props.visible ? 'block' : 'none')};
//   height: ${(props: IStyledProps) =>
//     props.layerArea ? `${props.layerArea.size.height}px` : '100%'};
//   width: ${(props: IStyledProps) =>
//     props.layerArea ? `${props.layerArea.size.width}px` : '100%'};
//   background-color: transparent;
// `;

// 蒙层 canvas，放在 透明蒙层 div 的下方，基本属性和蒙层一直，只是 zIndex 要低一些
export const StyledModalCanvas = styled.canvas.attrs({
  style: (props: IStyledProps) => props.style || {} // 优先级会高一些，行内样式
}) <IStyledProps>`
  position: fixed;
  top: ${(props: IStyledProps) =>
    props.layerArea ? `${props.layerArea.point.y}px` : '0'};
  left: ${(props: IStyledProps) =>
    props.layerArea ? `${props.layerArea.point.x}px` : '0'};
  z-index: 0;
  display: ${(props: IStyledProps) => (props.visible ? 'block' : 'none')};
`;
