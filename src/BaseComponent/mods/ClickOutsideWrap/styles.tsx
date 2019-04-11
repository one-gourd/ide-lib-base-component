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
  z-index: ${(props: IStyledProps) => props.zIndex};
  position: ${(props: IStyledProps) => (props.visible ? 'fixed' : 'initial')};
`;

export const StyledModalLayer = styled.div.attrs({
  style: (props: IStyledProps) => props.style || {} // 优先级会高一些，行内样式
})<IStyledProps>`
  position: fixed;
  top: ${(props: IStyledProps) =>
    props.layerArea ? `${props.layerArea.point.y}px` : '0'};
  left: ${(props: IStyledProps) =>
    props.layerArea ? `${props.layerArea.point.x}px` : '0'};
  z-index: ${(props: IStyledProps) => props.zIndex};
  display: ${(props: IStyledProps) => (props.visible ? 'block' : 'none')};
  height: ${(props: IStyledProps) =>
    props.layerArea ? `${props.layerArea.size.height}px` : '100%'};
  width: ${(props: IStyledProps) =>
    props.layerArea ? `${props.layerArea.size.width}px` : '100%'};
  background-color: ${(props: IStyledProps) =>
    props.color ? `${props.color}` : 'auto'};
`;
