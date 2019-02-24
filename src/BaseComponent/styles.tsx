import React from 'react';
export interface IBaseStyledProps {
  style?: React.CSSProperties;
  className?: string;
  [prop: string]: any;
}
